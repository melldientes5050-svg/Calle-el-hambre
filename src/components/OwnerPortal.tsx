import React, { useState } from 'react';
import {
  Store,
  ChefHat,
  Bike,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  TrendingUp,
  MapPin,
  Smartphone,
  Banknote,
  Receipt,
  Crosshair,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { LocalTenant, Product, Order } from '../types';

interface OwnerPortalProps {
  locales: LocalTenant[];
  onUpdateLocales: (updatedLocales: LocalTenant[]) => void;
  onOpenReceipt: (order: Order) => void;
}

export const OwnerPortal: React.FC<OwnerPortalProps> = ({
  locales,
  onUpdateLocales,
  onOpenReceipt,
}) => {
  const { assignedLocalId, userName } = useAuth();
  const { orders, updateOrderStatus } = useCart();

  // Find the store assigned to this owner
  const myStore = locales.find((l) => l.id === assignedLocalId) || locales[0];

  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filter orders for this specific business
  const storeOrders = orders.filter((o) => o.localId === myStore.id || o.localName === myStore.name);
  const storeRevenue = storeOrders.reduce((sum, o) => sum + o.total, 0);

  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) return;

    const newDish: Product = {
      id: `dish-${Date.now()}`,
      name: newDishName.trim(),
      description: newDishDesc.trim() || 'Nuevo plato de la casa.',
      price: parseFloat(newDishPrice) || 6.00,
      category: newDishCategory.trim() || myStore.categories[0] || 'Especiales',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      popular: true,
    };

    const updated = locales.map((l) => {
      if (l.id === myStore.id) {
        return {
          ...l,
          products: [newDish, ...l.products],
        };
      }
      return l;
    });

    onUpdateLocales(updated);
    setShowAddDishModal(false);
    setNewDishName('');
    setNewDishDesc('');
    setNewDishPrice('');
    setNewDishCategory('');
    setFeedback(`¡"${newDish.name}" añadido exitosamente a tu carta!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteDish = (productId: string) => {
    const updated = locales.map((l) => {
      if (l.id === myStore.id) {
        return {
          ...l,
          products: l.products.filter((p) => p.id !== productId),
        };
      }
      return l;
    });
    onUpdateLocales(updated);
  };

  const handleAdvanceStatus = (orderId: string, currentStatus: Order['status']) => {
    let nextStatus: Order['status'] = 'en_cocina';
    if (currentStatus === 'recibido') nextStatus = 'en_cocina';
    else if (currentStatus === 'en_cocina') nextStatus = 'en_camino';
    else if (currentStatus === 'en_camino') nextStatus = 'entregado';
    else return;

    updateOrderStatus(orderId, nextStatus);
  };

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Business Owner Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/40 p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={myStore.logoImage}
              alt={myStore.name}
              className="w-12 h-12 rounded-2xl border-2 border-emerald-500/50 object-cover shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  Usuario Propietario
                </span>
                <span className="text-[10px] text-slate-400">{userName}</span>
              </div>
              <h2 className="text-base font-black text-white leading-tight mt-0.5">
                {myStore.name}
              </h2>
              <p className="text-[11px] text-emerald-400 font-semibold">
                Carta de {myStore.cuisine}
              </p>
            </div>
          </div>
        </div>

        {/* Store Metrics */}
        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Ventas Negocio</span>
            <span className="text-sm font-black text-emerald-400">{storeRevenue.toFixed(2)} €</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Comandas</span>
            <span className="text-sm font-black text-white">{storeOrders.length} ped.</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Platos en Carta</span>
            <span className="text-sm font-black text-orange-400">{myStore.products.length} platos</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-900 border border-slate-800 p-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Comandas de Mi Negocio ({storeOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'menu'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>Gestionar Mi Carta ({myStore.products.length})</span>
        </button>
      </div>

      {/* TAB 1: COMANDAS EN TIEMPO REAL */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pedidos Recibidos en Tu Local
            </h3>
            <span className="text-[10px] text-slate-500">Actualización en vivo</span>
          </div>

          {storeOrders.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              No tienes pedidos activos en tu negocio en este momento.
            </div>
          ) : (
            <div className="space-y-3">
              {storeOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between border-b pb-2 border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">Orden #{order.id}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950 text-orange-400 border border-orange-800 capitalize">
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Cliente: <strong>{order.customerName}</strong> • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <span className="text-sm font-black text-orange-400 font-mono">
                      {order.total.toFixed(2)} €
                    </span>
                  </div>

                  {/* Payment Details */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Método:</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        {order.paymentMethod === 'pago_movil' ? (
                          <>
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Pago Móvil</span>
                          </>
                        ) : (
                          <>
                            <Banknote className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-amber-400">Efectivo al recibir</span>
                          </>
                        )}
                      </span>
                    </div>

                    {order.paymentMethod === 'pago_movil' && order.pagoMovilDetails && (
                      <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-300 pt-1 border-t border-slate-800">
                        <div>CIV: {order.pagoMovilDetails.civ}</div>
                        <div>Telf: {order.pagoMovilDetails.phone}</div>
                        <div>Banco: {order.pagoMovilDetails.bank}</div>
                        <div className="text-emerald-400 font-bold">Ref: #{order.pagoMovilDetails.referenceCode}</div>
                      </div>
                    )}
                  </div>

                  {/* Items Ordered */}
                  <div className="space-y-1 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300">
                        <span>
                          <strong className="text-white">{item.quantity}x</strong> {item.name}
                        </span>
                        <span className="font-mono text-slate-400">
                          {(item.price * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status Progress Button & Receipt Button */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenReceipt(order)}
                      className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                    >
                      Ver Recibo Oficial
                    </button>

                    {order.status !== 'entregado' && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, order.status)}
                        className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md transition active:scale-95"
                      >
                        {order.status === 'recibido'
                          ? 'Avanzar a Cocina →'
                          : order.status === 'en_cocina'
                          ? 'Avanzar a En Camino →'
                          : 'Marcar Entregado ✓'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GESTIONAR MI CARTA DE ALIMENTOS */}
      {activeTab === 'menu' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Platos de tu Carta ({myStore.products.length})
            </h3>
            <button
              onClick={() => setShowAddDishModal(true)}
              className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Plato</span>
            </button>
          </div>

          {showAddDishModal && (
            <form
              onSubmit={handleAddDish}
              className="p-4 rounded-3xl bg-slate-900 border-2 border-emerald-500/50 space-y-3 text-xs shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-xs">
                  Añadir Plato a tu Carta ({myStore.name})
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Nombre del Plato *</label>
                <input
                  type="text"
                  required
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  placeholder="Ej: Hamburguesa Doble BBQ"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Precio (€) *</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    placeholder="9.50"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={newDishCategory}
                    onChange={(e) => setNewDishCategory(e.target.value)}
                    placeholder="Especiales..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Descripción</label>
                <textarea
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  rows={2}
                  placeholder="Ingredientes del plato..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Guardar en mi Carta
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2.5">
            {myStore.products.map((dish) => (
              <div
                key={dish.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{dish.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{dish.description}</p>
                    <span className="text-xs font-black text-orange-400 font-mono mt-0.5 block">
                      {dish.price.toFixed(2)} €
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteDish(dish.id)}
                  className="p-2 rounded-xl bg-slate-800 text-red-400 hover:bg-red-950/60 hover:text-red-300 transition shrink-0"
                  title="Eliminar plato"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
