import React, { useState } from 'react';
import {
  User as UserIcon,
  LogOut,
  Wallet,
  ShoppingBag,
  TrendingUp,
  Store,
  Clock,
  ChevronRight,
  ShieldCheck,
  LogIn,
  UserPlus,
  Crown,
  ChefHat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AuthModal } from './AuthModal';
import { Order, UserRole } from '../types';

interface UserProfileViewProps {
  onOpenOrderTracking: (order: Order) => void;
  onExploreCartas: () => void;
  onOpenAdminPanel?: () => void;
  onOpenOwnerPortal?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  onOpenOrderTracking,
  onExploreCartas,
  onOpenAdminPanel,
  onOpenOwnerPortal,
}) => {
  const { user, signOut, userName, userPhone, role, assignedLocalId } = useAuth();
  const { orders, setCompletedReceiptOrder } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Filter orders by user if logged in, or show all device orders
  const userOrders = user
    ? orders.filter((o) => !o.userId || o.userId === user.id || o.userEmail === user.email)
    : orders;

  // Calculate total spent
  const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);

  // Group spending by local business
  const spendingByLocal = userOrders.reduce<Record<string, { name: string; amount: number; count: number }>>(
    (acc, order) => {
      if (!acc[order.localName]) {
        acc[order.localName] = { name: order.localName, amount: 0, count: 0 };
      }
      acc[order.localName].amount += order.total;
      acc[order.localName].count += 1;
      return acc;
    },
    {}
  );

  const localSpendingList = Object.values(spendingByLocal).sort((a, b) => b.amount - a.amount);

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-orange-400" />
            <span>Mi Cuenta & Gasto</span>
          </h2>
          <p className="text-xs text-slate-400">
            Historial de compras y monto total gastado en Supabase
          </p>
        </div>

        {user && (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 py-1 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-900/60 text-xs font-semibold transition"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        )}
      </div>

      {/* User Card or Auth Banner */}
      {!user ? (
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/40 border border-orange-500/30 p-5 space-y-3.5 shadow-xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 mx-auto flex items-center justify-center border border-orange-500/30 shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Inicia Sesión con Supabase</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
              Crea tu usuario para asociar tus pedidos, calcular tu monto gastado y recibir seguimiento en vivo.
            </p>
          </div>

          <div className="flex gap-2 pt-1 max-w-xs mx-auto">
            <button
              onClick={() => {
                setAuthModalMode('signin');
                setIsAuthModalOpen(true);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-orange-400" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              onClick={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Crear Cuenta</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white truncate">{userName}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                    role === 'admin'
                      ? 'bg-red-950/80 text-red-300 border-red-700'
                      : role === 'propietario'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {role === 'admin' ? '👑 Admin' : role === 'propietario' ? '🏪 Propietario' : '👤 Usuario General'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              {userPhone && (
                <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                  <span>📞 {userPhone}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SPECIAL ROLE ACCESS BANNERS */}
      {role === 'admin' && onOpenAdminPanel && (
        <div className="p-3.5 rounded-3xl bg-gradient-to-r from-red-950/80 to-slate-900 border border-red-500/50 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600 text-white">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Panel de Administrador</h4>
              <p className="text-[10px] text-slate-300">Ver todo, editar todas las cartas y asignar roles</p>
            </div>
          </div>
          <button
            onClick={onOpenAdminPanel}
            className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition active:scale-95 shrink-0"
          >
            Abrir Panel &rarr;
          </button>
        </div>
      )}

      {role === 'propietario' && onOpenOwnerPortal && (
        <div className="p-3.5 rounded-3xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/50 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Portal de Mi Negocio</h4>
              <p className="text-[10px] text-slate-300">Gestionar mi carta y pedidos recibidos en tiempo real</p>
            </div>
          </div>
          <button
            onClick={onOpenOwnerPortal}
            className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition active:scale-95 shrink-0"
          >
            Mi Negocio &rarr;
          </button>
        </div>
      )}

      {/* METRICS OF SPENDING & ORDERS */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Spent */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-md">
          <div className="flex items-center gap-1.5 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Wallet className="w-4 h-4" />
            <span>Monto Gastado</span>
          </div>
          <p className="text-xl font-black text-white">{totalSpent.toFixed(2)} €</p>
          <p className="text-[10px] text-slate-400">Total acumulado en pedidos</p>
        </div>

        {/* Total Orders Placed */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 shadow-md">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos Realizados</span>
          </div>
          <p className="text-xl font-black text-white">{userOrders.length}</p>
          <p className="text-[10px] text-slate-400">Comandas registradas</p>
        </div>
      </div>

      {/* Spending Breakdown by Local */}
      {localSpendingList.length > 0 && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
              <span>Gasto por Negocio</span>
            </h4>
            <span className="text-[10px] text-slate-400">{localSpendingList.length} negocios</span>
          </div>

          <div className="space-y-2.5">
            {localSpendingList.map((item) => {
              const pct = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white truncate max-w-[200px]">
                      {item.name} ({item.count} ped.)
                    </span>
                    <span className="font-black text-orange-400">{item.amount.toFixed(2)} €</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EXACT ORDERS LIST (Qué pedido realizó y qué monto gastó) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Detalle de Pedidos Realizados ({userOrders.length})
        </h4>

        {userOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-4 space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-slate-600 mb-1" />
            <p className="text-xs font-semibold text-slate-300">Aún no has realizado pedidos.</p>
            <p className="text-[11px] text-slate-500">
              Explora las cartas de comida en el inicio para hacer tu primera comanda.
            </p>
            <button
              onClick={onExploreCartas}
              className="mt-2 py-2 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition"
            >
              Explorar Cartas de Comida
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onOpenOrderTracking(order)}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 cursor-pointer transition shadow-md space-y-2.5 active:scale-[0.99] group"
              >
                {/* Header of order */}
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 text-orange-400 group-hover:bg-orange-600 group-hover:text-white transition">
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white group-hover:text-orange-400 transition">
                        {order.localName}
                      </h5>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString([], {
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        •{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Status pill */}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950/80 text-orange-400 border border-orange-800 capitalize">
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* List of items ordered (Qué pidió) */}
                <div className="space-y-1 text-[11px] text-slate-300">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate pr-2">
                        <strong className="text-orange-400">{item.quantity}x</strong> {item.name}
                      </span>
                      <span className="text-slate-400 shrink-0">
                        {(item.price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>

                {/* Amount Spent (Qué monto gastó) */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">
                      Monto gastado:{' '}
                      <strong className="text-white font-extrabold text-xs">
                        {order.total.toFixed(2)} €
                      </strong>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {order.paymentMethod === 'pago_movil' ? '📱 Pago Móvil' : '💵 Efectivo'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompletedReceiptOrder(order);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition"
                    >
                      Ver Recibo
                    </button>
                    <span className="text-[11px] font-bold text-orange-400 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                      <span>Rastrear</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
