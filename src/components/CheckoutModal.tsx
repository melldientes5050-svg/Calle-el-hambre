import React, { useState } from 'react';
import {
  X,
  Banknote,
  Smartphone,
  MapPin,
  UtensilsCrossed,
  CheckCircle2,
  BellRing,
  Bike,
  Clock,
  Heart,
  Navigation,
  Crosshair,
  AlertCircle,
  Building2,
  Copy,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission } from '../services/notificationService';
import { INITIAL_LOCALES } from '../data/mockLocales';
import { LocationCoordinates, PagoMovilDetails } from '../types';

interface CheckoutModalProps {
  localId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const VENEZUELAN_BANKS = [
  'Banesco (0134)',
  'Banco de Venezuela (0102)',
  'Mercantil (0105)',
  'BBVA Provincial (0108)',
  'Bancaribe (0114)',
  'Banco Nacional de Crédito - BNC (0191)',
  'Bancamiga (0172)',
  'Banco Exterior (0115)',
  'Banco Plaza (0138)',
  '100% Banco (0156)',
  'Otro Banco',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ localId, onClose, onSuccess }) => {
  const { cart, currentAddress, currentCoordinates, setCurrentLocation, createOrder } = useCart();
  const { user, userName } = useAuth();

  // Filter items for this specific store
  const storeItems = cart.filter((item) => item.localId === localId);
  const storeData = INITIAL_LOCALES.find((l) => l.id === localId);
  const storeName = storeItems[0]?.localName || storeData?.name || 'Local Gourmet';

  const subtotal = storeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const baseDeliveryFee = storeData?.deliveryFee || 1.95;
  const freeThreshold = storeData?.freeDeliveryThreshold || 25;
  const deliveryFee = subtotal >= freeThreshold ? 0 : baseDeliveryFee;

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup' | 'table'>('delivery');
  const [address, setAddress] = useState(currentAddress);
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(currentCoordinates);
  const [isLocating, setIsLocating] = useState(false);
  const [tableNumber, setTableNumber] = useState('Mesa 4');
  const [deliveryTimePref, setDeliveryTimePref] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledTime, setScheduledTime] = useState('14:30');
  const [tip, setTip] = useState<number>(1.00);
  const [customerName, setCustomerName] = useState(user ? userName : 'Cliente');

  // Solo Efectivo y Pago Móvil
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'pago_movil'>('pago_movil');

  // Datos de Pago Móvil requeridos
  const [civ, setCiv] = useState('');
  const [phone, setPhone] = useState('');
  const [bank, setBank] = useState('Banesco (0134)');
  const [referenceCode, setReferenceCode] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedData, setCopiedData] = useState(false);

  const finalTotal = subtotal + (deliveryType === 'delivery' ? deliveryFee : 0) + tip;

  // Real-time GPS location finder inside checkout
  const handleGetLiveLocation = () => {
    setIsLocating(true);
    if (!('geolocation' in navigator)) {
      setValidationError('La geolocalización no está soportada en este navegador.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const coords: LocationCoordinates = {
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          label: `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        };
        const resolvedAddress = `Punto GPS Exacto (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) • Precisión: ±${Math.round(accuracy)}m`;
        setCoordinates(coords);
        setAddress(resolvedAddress);
        setCurrentLocation(resolvedAddress, coords);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setValidationError('No se pudo obtener el punto GPS. Escribe tu dirección manualmente.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const copyStorePagoMovil = () => {
    navigator.clipboard.writeText('Banesco (0134) - 04149988771 - J-401928310');
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate Pago Móvil fields if selected
    if (paymentMethod === 'pago_movil') {
      if (!civ.trim()) {
        setValidationError('Por favor ingresa tu Cédula o CIV (ej: V-12345678).');
        return;
      }
      if (!phone.trim()) {
        setValidationError('Por favor ingresa el teléfono con el que realizaste el Pago Móvil.');
        return;
      }
      if (!referenceCode.trim()) {
        setValidationError('Por favor ingresa los dígitos del Código de Referencia.');
        return;
      }
    }

    setIsSubmitting(true);

    // Request native push notification permission
    await requestNotificationPermission();

    // Haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {
        // ignore
      }
    }

    const pagoMovilPayload: PagoMovilDetails | undefined =
      paymentMethod === 'pago_movil'
        ? {
            civ: civ.trim(),
            phone: phone.trim(),
            bank,
            referenceCode: referenceCode.trim(),
          }
        : undefined;

    setTimeout(async () => {
      await createOrder({
        localId,
        localName: storeName,
        items: storeItems,
        subtotal,
        deliveryFee: deliveryType === 'delivery' ? deliveryFee : 0,
        tip,
        total: finalTotal,
        deliveryType,
        deliveryTimePreference: deliveryTimePref,
        scheduledTime: deliveryTimePref === 'scheduled' ? scheduledTime : undefined,
        address: deliveryType === 'delivery' ? address : undefined,
        coordinates: deliveryType === 'delivery' ? (coordinates || undefined) : undefined,
        tableNumber: deliveryType === 'table' ? tableNumber : undefined,
        customerName: user ? userName : customerName,
        paymentMethod,
        pagoMovilDetails: pagoMovilPayload,
        userId: user?.id,
        userEmail: user?.email,
      });

      setIsSubmitting(false);
      onSuccess();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg h-full sm:h-auto max-h-[100vh] sm:max-h-[94vh] rounded-none sm:rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Tramitar Pedido</h2>
              <p className="text-[11px] text-slate-400">
                {storeName} • {storeItems.length} platos en orden
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white"
            aria-label="Cerrar checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 no-scrollbar flex-1">
          {validationError && (
            <div className="p-3 rounded-2xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Step 1: Delivery Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              1. Tipo de Entrega
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                  deliveryType === 'delivery'
                    ? 'bg-orange-600/20 border-orange-500 text-white font-bold shadow-md'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bike className="w-5 h-5 mb-1 text-orange-400" />
                <span className="text-xs">A Domicilio</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                  deliveryType === 'pickup'
                    ? 'bg-orange-600/20 border-orange-500 text-white font-bold shadow-md'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-5 h-5 mb-1 text-orange-400" />
                <span className="text-xs">Para Llevar</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('table')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
                  deliveryType === 'table'
                    ? 'bg-orange-600/20 border-orange-500 text-white font-bold shadow-md'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <UtensilsCrossed className="w-5 h-5 mb-1 text-orange-400" />
                <span className="text-xs">En Mesa</span>
              </button>
            </div>
          </div>

          {/* Step 2: Exact Location / Table Info */}
          {deliveryType === 'delivery' && (
            <div className="space-y-2 rounded-2xl bg-slate-950/70 border border-slate-800 p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>Punto Exacto de Entrega</span>
                </label>

                {/* Real-time GPS Trigger */}
                <button
                  type="button"
                  onClick={handleGetLiveLocation}
                  disabled={isLocating}
                  className="flex items-center gap-1 text-[11px] font-bold text-orange-400 hover:underline active:scale-95 transition"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Detectando GPS...' : 'Fijar con GPS en Vivo'}</span>
                </button>
              </div>

              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dirección exacta, punto de referencia o coordenadas..."
                className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />

              {coordinates && (
                <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/60">
                  <span className="flex items-center gap-1">
                    <Crosshair className="w-3 h-3" />
                    <span>Punto satelital fijado: {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}</span>
                  </span>
                  <span>±{coordinates.accuracy || 5}m</span>
                </div>
              )}
            </div>
          )}

          {deliveryType === 'table' && (
            <div className="space-y-1.5 rounded-2xl bg-slate-950/70 border border-slate-800 p-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Número de Mesa en el Local
              </label>
              <input
                type="text"
                required
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Ej: Mesa 7, Terraza Mesa 2..."
                className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          {/* Customer Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Nombre de Quien Recibe
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Tu nombre completo"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Tip */}
          {deliveryType === 'delivery' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Propina para el Repartidor
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1.00, 2.00, 3.00].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setTip(amount)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      tip === amount
                        ? 'bg-orange-600/25 border-orange-500 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400'
                    }`}
                  >
                    {amount === 0 ? 'Sin propina' : `+${amount.toFixed(2)} €`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: ONLY Efectivo al recibir & Pago Móvil */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Método de Pago (Efectivo o Pago Móvil)
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Option 1: Pago Móvil */}
              <button
                type="button"
                onClick={() => setPaymentMethod('pago_movil')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                  paymentMethod === 'pago_movil'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-xl ${paymentMethod === 'pago_movil' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black">Pago Móvil</h4>
                  <span className="text-[10px] text-emerald-400 block font-semibold">Transferencia móvil</span>
                </div>
              </button>

              {/* Option 2: Efectivo al recibir */}
              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                  paymentMethod === 'efectivo'
                    ? 'bg-orange-950/60 border-orange-500 text-white shadow-lg shadow-orange-950/50'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-xl ${paymentMethod === 'efectivo' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black">Efectivo al Recibir</h4>
                  <span className="text-[10px] text-orange-400 block font-semibold">Pagas en mano</span>
                </div>
              </button>
            </div>

            {/* PAGO MÓVIL FORM: Pide CIV, Teléfono, Banco y Código de Referencia */}
            {paymentMethod === 'pago_movil' && (
              <div className="rounded-2xl bg-emerald-950/30 border border-emerald-600/40 p-4 space-y-3.5 animate-in fade-in duration-200">
                {/* Store destination account data */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      Datos para Realizar el Pago Móvil:
                    </span>
                    <button
                      type="button"
                      onClick={copyStorePagoMovil}
                      className="text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      {copiedData ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedData ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-300">
                    <div>Banco: <strong className="text-white">Banesco (0134)</strong></div>
                    <div>Teléfono: <strong className="text-white">0414-9988771</strong></div>
                    <div>RIF: <strong className="text-white">J-401928310</strong></div>
                    <div>Monto: <strong className="text-emerald-400 font-bold">{finalTotal.toFixed(2)} €</strong></div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 font-semibold">
                  Ingresa los datos de tu pago móvil para generar el recibo oficial:
                </p>

                {/* Form fields: CIV, Teléfono, Banco, Código de Referencia */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* CIV / Cédula */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Cédula / CIV *
                    </label>
                    <input
                      type="text"
                      required
                      value={civ}
                      onChange={(e) => setCiv(e.target.value)}
                      placeholder="V-18492014"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* Teléfono Emisor */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Teléfono Emisor *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0412-1234567"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* Banco Emisor */}
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Banco Emisor *
                    </label>
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {VENEZUELAN_BANKS.map((b) => (
                        <option key={b} value={b} className="bg-slate-900 text-white">
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Código de Referencia */}
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Código de Referencia (Últimos dígitos o comprobante) *
                    </label>
                    <input
                      type="text"
                      required
                      value={referenceCode}
                      onChange={(e) => setReferenceCode(e.target.value)}
                      placeholder="Ej: 849201"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* EFECTIVO AL RECIBIR NOTICE */}
            {paymentMethod === 'efectivo' && (
              <div className="p-3 rounded-2xl bg-orange-950/30 border border-orange-600/40 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white block">Abono en efectivo:</span>
                <p className="text-[11px] leading-relaxed">
                  Pagarás el monto de <strong className="text-orange-400">{finalTotal.toFixed(2)} €</strong> directamente al repartidor al momento de recibir tus alimentos en mano.
                </p>
              </div>
            )}
          </div>

          {/* Breakdown Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal ({storeItems.length} platos):</span>
              <span className="text-white font-medium">{subtotal.toFixed(2)} €</span>
            </div>
            {deliveryType === 'delivery' && (
              <div className="flex justify-between text-slate-400">
                <span>Gastos de envío:</span>
                <span className={deliveryFee === 0 ? 'text-emerald-400 font-bold' : 'text-white font-medium'}>
                  {deliveryFee === 0 ? 'GRATIS' : `${deliveryFee.toFixed(2)} €`}
                </span>
              </div>
            )}
            {tip > 0 && deliveryType === 'delivery' && (
              <div className="flex justify-between text-slate-400">
                <span>Propina repartidor:</span>
                <span className="text-white font-medium">+{tip.toFixed(2)} €</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-black text-sm">
              <span className="text-white">TOTAL A PAGAR:</span>
              <span className="text-lg text-orange-400 font-mono">{finalTotal.toFixed(2)} €</span>
            </div>
          </div>

          {/* Submit Order Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 active:scale-98 text-white font-black text-sm shadow-xl shadow-orange-950/60 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Confirmando y Generando Recibo...</span>
              </span>
            ) : (
              `Confirmar y Generar Recibo • ${finalTotal.toFixed(2)} €`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
