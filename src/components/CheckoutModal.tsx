import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  MapPin,
  UtensilsCrossed,
  CheckCircle2,
  BellRing,
  Bike,
  Clock,
  Heart,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { requestNotificationPermission } from '../services/notificationService';
import { INITIAL_LOCALES } from '../data/mockLocales';

interface CheckoutModalProps {
  localId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ localId, onClose, onSuccess }) => {
  const { cart, currentAddress, createOrder } = useCart();

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
  const [tableNumber, setTableNumber] = useState('Mesa 4');
  const [deliveryTimePref, setDeliveryTimePref] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledTime, setScheduledTime] = useState('14:30');
  const [tip, setTip] = useState<number>(1.00);
  const [customerName, setCustomerName] = useState('Alejandro G.');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bizum' | 'cash'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalTotal = subtotal + (deliveryType === 'delivery' ? deliveryFee : 0) + tip;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        tableNumber: deliveryType === 'table' ? tableNumber : undefined,
        customerName,
        paymentMethod,
      });

      setIsSubmitting(false);
      onSuccess();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg h-full sm:h-auto max-h-[100vh] sm:max-h-[92vh] rounded-none sm:rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Tramitar Pedido</h2>
              <p className="text-[11px] text-slate-400">
                {storeName} • {storeItems.length} artículos
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
          {/* Step 1: Delivery Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              1. Modalidad de Entrega
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition active:scale-95 ${
                  deliveryType === 'delivery'
                    ? 'bg-orange-600/20 border-orange-500 text-white shadow-md'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bike className="w-4 h-4 mb-1 text-orange-400" />
                <span>A Domicilio</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition active:scale-95 ${
                  deliveryType === 'pickup'
                    ? 'bg-orange-600/20 border-orange-500 text-white shadow-md'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-4 h-4 mb-1 text-orange-400" />
                <span>Para Recoger</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('table')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition active:scale-95 ${
                  deliveryType === 'table'
                    ? 'bg-orange-600/20 border-orange-500 text-white shadow-md'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4 mb-1 text-orange-400" />
                <span>En Mesa</span>
              </button>
            </div>
          </div>

          {/* Conditional location input */}
          {deliveryType === 'delivery' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Dirección de Entrega
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, piso, puerta..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          {deliveryType === 'table' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Número o Nombre de la Mesa
              </label>
              <input
                type="text"
                required
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Ej: Mesa 12, Barra 3..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          {/* Step 2: Time Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              2. Horario de Entrega
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryTimePref('asap')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                  deliveryTimePref === 'asap'
                    ? 'bg-orange-600/20 border-orange-500 text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400'
                }`}
              >
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Lo antes posible (~25-35 min)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryTimePref('scheduled')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                  deliveryTimePref === 'scheduled'
                    ? 'bg-orange-600/20 border-orange-500 text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400'
                }`}
              >
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Programar Hora</span>
              </button>
            </div>

            {deliveryTimePref === 'scheduled' && (
              <div className="mt-2 flex gap-2">
                {['14:00', '14:30', '15:00', '21:00', '21:30', '22:00'].map((timeSlot) => (
                  <button
                    key={timeSlot}
                    type="button"
                    onClick={() => setScheduledTime(timeSlot)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                      scheduledTime === timeSlot
                        ? 'bg-orange-600 text-white border-orange-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {timeSlot}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Tip to Courier */}
          {deliveryType === 'delivery' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                  <span>3. Propina para el repartidor</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">100% para el rider</span>
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

          {/* Step 4: Payment Method */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              4. Método de Pago Seguro
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'card'
                    ? 'bg-orange-600/15 border-orange-500/80 text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-orange-400" />
                  <div>
                    <span className="text-xs font-semibold block">Tarjeta Bancaria / Apple Pay</span>
                    <span className="text-[10px] text-slate-400">Visa, Mastercard, Amex, Apple Pay</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-orange-500"
                />
              </label>

              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'bizum'
                    ? 'bg-orange-600/15 border-orange-500/80 text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  <div>
                    <span className="text-xs font-semibold block">Bizum Móvil Instantáneo</span>
                    <span className="text-[10px] text-slate-400">Pago rápido con tu número de teléfono</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'bizum'}
                  onChange={() => setPaymentMethod('bizum')}
                  className="accent-orange-500"
                />
              </label>

              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'cash'
                    ? 'bg-orange-600/15 border-orange-500/80 text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="w-4 h-4 text-orange-400" />
                  <div>
                    <span className="text-xs font-semibold block">Efectivo al Recibir</span>
                    <span className="text-[10px] text-slate-400">Pagas en mano al repartidor o en el local</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="accent-orange-500"
                />
              </label>
            </div>
          </div>

          {/* Push Notice */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-950/50 to-slate-950 border border-orange-500/30 flex items-start gap-2.5">
            <BellRing className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-300 leading-relaxed">
              <span className="font-bold text-white">Notificaciones Push PWA activas:</span> Recibirás
              avisos nativos en tu pantalla con cada avance de cocina y ruta del repartidor.
            </div>
          </div>

          {/* Breakdown Summary */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal comida ({storeItems.length} platos)</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            {deliveryType === 'delivery' && (
              <div className="flex justify-between">
                <span>Gastos de envío</span>
                {deliveryFee === 0 ? (
                  <span className="text-emerald-400 font-bold">¡Gratis!</span>
                ) : (
                  <span>{deliveryFee.toFixed(2)} €</span>
                )}
              </div>
            )}
            {tip > 0 && (
              <div className="flex justify-between text-pink-300">
                <span>Propina voluntaria rider</span>
                <span>+{tip.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
              <span>Total a Pagar</span>
              <span className="text-orange-400">{finalTotal.toFixed(2)} €</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 active:scale-[0.98] text-white py-3.5 px-4 font-black text-sm shadow-xl shadow-orange-950/70 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Confirmando pedido...</span>
              </span>
            ) : (
              <span>Confirmar y Enviar Pedido ({finalTotal.toFixed(2)} €)</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
