import React from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Store,
  Bike,
  ChefHat,
  Sparkles,
  MapPin,
  ChevronRight,
  Navigation
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

interface OrdersViewProps {
  onExploreLocales: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onExploreLocales }) => {
  const { orders, setActiveTrackingOrder } = useCart();

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'recibido':
        return {
          label: 'Pedido Recibido',
          color: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
          icon: Clock,
        };
      case 'en_cocina':
        return {
          label: 'En Preparación',
          color: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
          icon: ChefHat,
        };
      case 'en_camino':
        return {
          label: 'En Camino / Listo',
          color: 'bg-orange-950/80 text-orange-300 border-orange-700/60',
          icon: Bike,
        };
      case 'entregado':
        return {
          label: 'Completado',
          color: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
          icon: CheckCircle2,
        };
      default:
        return {
          label: status,
          color: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: Clock,
        };
    }
  };

  const handleOpenTracking = (order: Order) => {
    setActiveTrackingOrder(order);
  };

  const activeOrders = orders.filter((o) => o.status !== 'entregado');

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-400" />
            <span>Mis Pedidos</span>
          </h2>
          <p className="text-xs text-slate-400">
            Seguimiento en vivo y comandas multi-tienda (disponible offline)
          </p>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-orange-400">
          {orders.length} pedidos
        </span>
      </div>

      {/* Active Orders Banner */}
      {activeOrders.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-orange-950/60 via-slate-900 to-amber-950/40 border border-orange-500/40 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 animate-pulse" />
              <span>Pedido Activo en Curso</span>
            </span>
            <span className="text-[10px] font-bold bg-orange-600 text-white px-2 py-0.5 rounded-full animate-pulse">
              En Directo
            </span>
          </div>

          {activeOrders.slice(0, 1).map((active) => (
            <div key={active.id} className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white">{active.localName}</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Pedido #{active.id} • {active.items.length} artículos ({active.total.toFixed(2)} €)
                </p>
              </div>

              <button
                onClick={() => handleOpenTracking(active)}
                className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg transition active:scale-95 shrink-0"
              >
                <span>Ver Mapa en Vivo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <Package className="w-12 h-12 mx-auto text-slate-600 mb-2" />
          <h3 className="text-base font-bold text-slate-200">Aún no has realizado pedidos</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Explora las cartas de nuestras tiendas gastronómicas para disfrutar de los mejores platos.
          </p>
          <button
            onClick={onExploreLocales}
            className="mt-3 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg transition active:scale-95"
          >
            Explorar Tiendas y Cartas
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Historial de Comandas
          </h3>

          {orders.map((order) => {
            const statusConfig = getStatusBadge(order.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={order.id}
                onClick={() => handleOpenTracking(order)}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 p-4 shadow-lg space-y-3 cursor-pointer transition active:scale-[0.99] group"
              >
                {/* Order Top Bar */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-800 text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition">
                        {order.localName}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Pedido #{order.id} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusConfig.color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    <span>{statusConfig.label}</span>
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-0.5">
                      <div className="truncate pr-2">
                        <span className="font-bold text-orange-400">{item.quantity}x</span>{' '}
                        <span>{item.name}</span>
                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                          <span className="text-[10px] text-slate-400 block pl-4">
                            +{item.selectedExtras.map((e) => e.name).join(', ')}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-slate-200 shrink-0">
                        {(item.price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>

                {/* Details Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-slate-400 flex items-center gap-2">
                    <span className="capitalize font-medium">
                      {order.deliveryType === 'delivery'
                        ? '🛵 Domicilio'
                        : order.deliveryType === 'table'
                        ? `🍽️ Mesa ${order.tableNumber || ''}`
                        : '🛍️ Recogida'}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{order.paymentMethod}</span>
                  </div>

                  <div className="text-sm font-black text-white flex items-center gap-2">
                    <span>
                      Total: <span className="text-orange-400">{order.total.toFixed(2)} €</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-orange-400 transition" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
