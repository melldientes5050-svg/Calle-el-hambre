import React from 'react';
import {
  X,
  CheckCircle2,
  Receipt,
  Download,
  Share2,
  MapPin,
  Clock,
  Store,
  CreditCard,
  QrCode,
  ShieldCheck,
  Smartphone,
  Banknote
} from 'lucide-react';
import { Order } from '../types';

interface LargeReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenTracking?: (order: Order) => void;
}

export const LargeReceiptModal: React.FC<LargeReceiptModalProps> = ({
  order,
  onClose,
  onOpenTracking,
}) => {
  if (!order) return null;

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Recibo de Pedido ${order.id} - ${order.localName}`,
        text: `Comprobante de pago ${order.paymentMethod === 'pago_movil' ? 'Pago Móvil' : 'Efectivo'} por un monto de ${order.total.toFixed(2)} € en ${order.localName}.`,
      }).catch(() => {});
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[95vh] rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Control Bar */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Recibo Oficial de Pago
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 px-2.5 transition"
              title="Compartir Comprobante"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Compartir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white"
              aria-label="Cerrar recibo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 no-scrollbar flex-1 bg-slate-950">
          {/* Main Paper Ticket Container */}
          <div className="relative bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-dashed border-slate-300 overflow-hidden space-y-4">
            {/* Stamp Badge */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    {order.paymentMethod === 'pago_movil' ? 'Pago Móvil Registrado' : 'Pago en Efectivo'}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {order.paymentMethod === 'pago_movil' ? 'COMPROBANTE VERIFICADO' : 'PENDIENTE AL ENTREGAR'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold block">N° ORDEN</span>
                <span className="text-xs font-mono font-black text-slate-900">
                  {order.id}
                </span>
              </div>
            </div>

            {/* Local & Customer Info */}
            <div className="grid grid-cols-2 gap-3 text-xs border-b pb-3 border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Negocio / Tienda</span>
                <p className="font-extrabold text-slate-900">{order.localName}</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {new Date(order.createdAt).toLocaleDateString([], {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  •{' '}
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Cliente</span>
                <p className="font-extrabold text-slate-900 truncate">{order.customerName}</p>
                <p className="text-[10px] text-slate-600 truncate">{order.userEmail || 'Cliente registrado'}</p>
              </div>
            </div>

            {/* Exact GPS Location on Receipt */}
            <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-600" />
                <span>Punto Exacto de Entrega</span>
              </span>
              <p className="font-bold text-slate-800 text-[11px] leading-tight">
                {order.address || 'Ubicación de entrega fijada'}
              </p>
              {order.coordinates && (
                <p className="text-[9px] font-mono text-slate-500">
                  Coordenadas GPS: {order.coordinates.latitude.toFixed(5)}, {order.coordinates.longitude.toFixed(5)} (±{order.coordinates.accuracy || 5}m)
                </p>
              )}
            </div>

            {/* PAGO MÓVIL DETAILS HIGHLIGHT (Grande y Claro) */}
            {order.paymentMethod === 'pago_movil' && order.pagoMovilDetails && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 text-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Datos del Pago Móvil</span>
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                    CONCILIADO
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Cédula / CIV:</span>
                    <strong className="text-slate-900 font-mono font-bold text-xs">{order.pagoMovilDetails.civ}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Teléfono Emisor:</span>
                    <strong className="text-slate-900 font-mono font-bold text-xs">{order.pagoMovilDetails.phone}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Banco Emisor:</span>
                    <strong className="text-slate-900 font-bold text-xs">{order.pagoMovilDetails.bank}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">N° Referencia:</span>
                    <strong className="text-emerald-700 font-mono font-black text-sm">{order.pagoMovilDetails.referenceCode}</strong>
                  </div>
                </div>
              </div>
            )}

            {order.paymentMethod === 'efectivo' && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-slate-900 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-200 text-amber-900">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-amber-950">Pago en Efectivo al Recibir</h4>
                  <p className="text-[11px] text-amber-800">
                    Ten preparado el monto exacto de {order.total.toFixed(2)} € para el repartidor.
                  </p>
                </div>
              </div>
            )}

            {/* List of food items */}
            <div className="space-y-2 border-t pt-3 border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Platos de Alimentos ({order.items.length})
              </span>

              <div className="space-y-1.5 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-extrabold text-slate-900">
                        {item.quantity}x {item.name}
                      </span>
                      {item.selectedExtras && item.selectedExtras.length > 0 && (
                        <p className="text-[10px] text-slate-500">
                          + {item.selectedExtras.map((e) => e.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      {(item.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Financial Summary (Grande) */}
            <div className="border-t-2 border-slate-900 pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal alimentos:</span>
                <span className="font-mono">{order.subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Costo de envío / despacho:</span>
                <span className="font-mono">{order.deliveryFee === 0 ? 'GRATIS' : `${order.deliveryFee.toFixed(2)} €`}</span>
              </div>
              {order.tip > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Propina motorizado:</span>
                  <span className="font-mono">{order.tip.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="text-sm font-black text-slate-900 uppercase">MONTO TOTAL:</span>
                <span className="text-2xl font-black font-mono text-slate-900">
                  {order.total.toFixed(2)} €
                </span>
              </div>
            </div>

            {/* Barcode & Security Stamp Simulation */}
            <div className="pt-2 text-center space-y-1.5 border-t border-slate-200">
              <div className="h-9 w-4/5 mx-auto bg-slate-900 flex items-center justify-around px-2 rounded">
                {Array.from({ length: 32 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-full bg-white inline-block"
                    style={{
                      width: i % 3 === 0 ? '4px' : i % 2 === 0 ? '2px' : '1px',
                    }}
                  />
                ))}
              </div>
              <p className="text-[9px] font-mono text-slate-500 uppercase">
                COMPROBANTE ELECTRÓNICO CARTALOCALES • SUPABASE VERIFIED
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          {onOpenTracking && (
            <button
              onClick={() => {
                onClose();
                onOpenTracking(order);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs shadow-md transition active:scale-95 text-center"
            >
              Ver Seguimiento en Vivo
            </button>
          )}

          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition active:scale-95"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
