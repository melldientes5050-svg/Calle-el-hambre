import React from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  ChefHat,
  Bike,
  MapPin,
  Phone,
  Sparkles,
  Store,
  ChevronRight
} from 'lucide-react';
import { Order } from '../types';
import { useCart } from '../context/CartContext';
import { sendPushNotification } from '../services/notificationService';

interface LiveOrderTrackerModalProps {
  order: Order | null;
  onClose: () => void;
}

export const LiveOrderTrackerModal: React.FC<LiveOrderTrackerModalProps> = ({ order, onClose }) => {
  const { updateOrderStatus } = useCart();

  if (!order) return null;

  const steps = [
    {
      key: 'recibido',
      label: 'Pedido Confirmado',
      desc: 'El local ha recibido y aceptado tu comanda',
      icon: Clock,
    },
    {
      key: 'en_cocina',
      label: 'En la Cocina',
      desc: 'El chef está elaborando tus platos con mimo',
      icon: ChefHat,
    },
    {
      key: 'en_camino',
      label: 'Repartidor en Ruta',
      desc: 'Tu comida va caliente rumbo a tu dirección',
      icon: Bike,
    },
    {
      key: 'entregado',
      label: '¡Entregado!',
      desc: 'Pedido completado. ¡Que disfrutes de tu comida!',
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'recibido':
        return 0;
      case 'en_cocina':
        return 1;
      case 'en_camino':
        return 2;
      case 'entregado':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIndex = getStepIndex(order.status);

  const handleAdvanceStatus = async () => {
    const nextStatuses: Order['status'][] = ['recibido', 'en_cocina', 'en_camino', 'entregado'];
    const nextIdx = Math.min(nextStatuses.length - 1, currentStepIndex + 1);
    const newStatus = nextStatuses[nextIdx];

    updateOrderStatus(order.id, newStatus);

    if (newStatus === 'en_cocina') {
      await sendPushNotification({
        title: `👨‍🍳 ${order.localName} - ¡Al Fogón!`,
        body: `El chef ya está horneando y preparando tu pedido #${order.id.slice(-4)}.`,
        localName: order.localName,
        type: 'order',
      });
    } else if (newStatus === 'en_camino') {
      await sendPushNotification({
        title: `🛵 ${order.localName} - Repartidor en Camino`,
        body: `Tu pedido #${order.id.slice(-4)} va en ruta hacia ${order.address || 'tu mesa'}.`,
        localName: order.localName,
        type: 'order',
      });
    } else if (newStatus === 'entregado') {
      await sendPushNotification({
        title: `🎉 ${order.localName} - ¡Entregado!`,
        body: `¡Buen provecho! Tu pedido #${order.id.slice(-4)} ha sido entregado con éxito.`,
        localName: order.localName,
        type: 'order',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Handle for sheet */}
        <div className="w-12 h-1.5 rounded-full bg-slate-700 mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Seguimiento en Vivo</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700">
                  En Directo
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pedido #{order.id} • {order.localName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white"
            aria-label="Cerrar seguimiento"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 no-scrollbar flex-1">
          {/* Animated Map Simulation */}
          <div className="relative h-44 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner flex flex-col justify-between p-3">
            {/* Background Grid & Street Lines */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#64748b" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* Winding road path */}
                <path
                  d="M 30 130 Q 120 40 220 110 T 400 30"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="6 6"
                />
              </svg>
            </div>

            {/* Map Badges */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-white shadow-md">
                <Store className="w-3.5 h-3.5 text-orange-400" />
                <span>{order.localName}</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-amber-300 shadow-md">
                <Clock className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>
                  {order.status === 'entregado'
                    ? 'Completado'
                    : `Llegada estimada: ~${order.status === 'en_camino' ? '8-12' : '20-25'} min`}
                </span>
              </div>
            </div>

            {/* Route Marker Representation */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-4">
              {/* Restaurant origin pin */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-orange-500 flex items-center justify-center text-orange-400 shadow-lg">
                  <Store className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-300 mt-1">Local</span>
              </div>

              {/* Delivery Rider on Route (Animated) */}
              <div
                className={`flex flex-col items-center transition-all duration-700 ${
                  order.status === 'recibido'
                    ? 'translate-x-[-30px]'
                    : order.status === 'en_cocina'
                    ? 'translate-x-0'
                    : order.status === 'en_camino'
                    ? 'translate-x-[40px] scale-110'
                    : 'translate-x-[80px]'
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-orange-950/80 animate-bounce">
                    <Bike className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
                </div>
                <span className="text-[9px] font-bold text-orange-400 mt-1">Repartidor</span>
              </div>

              {/* Destination pin */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-lg">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-300 mt-1">Tu Destino</span>
              </div>
            </div>

            {/* Delivery address footer */}
            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="truncate max-w-[240px]">
                📍 {order.address || (order.tableNumber ? `Mesa: ${order.tableNumber}` : 'Recogida')}
              </span>
              <span className="text-orange-400 font-bold capitalize">{order.deliveryType}</span>
            </div>
          </div>

          {/* Stepper Status */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Estado de la Comanda
            </h4>

            <div className="space-y-3">
              {steps.map((st, idx) => {
                const Icon = st.icon;
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={st.key} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition ${
                        isCurrent
                          ? 'bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-950/50'
                          : isPassed
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <h5
                          className={`text-xs font-bold ${
                            isCurrent ? 'text-orange-400' : isPassed ? 'text-white' : 'text-slate-500'
                          }`}
                        >
                          {st.label}
                        </h5>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded-full border border-orange-800 animate-pulse">
                            En curso
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Summary */}
          <div className="rounded-2xl bg-slate-950/60 p-3.5 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-300 pb-1 border-b border-slate-800">
              <span>Resumen de Productos ({order.items.length})</span>
              <span className="text-orange-400 font-black">{order.total.toFixed(2)} €</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-slate-400 text-[11px]">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>

          {/* Quick Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = `tel:+34912345678`;
                }
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold active:scale-95 transition"
            >
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <span>Contactar Local</span>
            </button>

            {/* Test button to advance order and trigger real push */}
            <button
              onClick={handleAdvanceStatus}
              disabled={currentStepIndex >= 3}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-md active:scale-95 transition disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {currentStepIndex >= 3 ? 'Pedido Finalizado' : 'Avanzar Estado (Push)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
