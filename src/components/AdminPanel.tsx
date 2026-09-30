import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Store,
  Receipt,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Crown,
  ChefHat,
  UserCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  Smartphone,
  Banknote,
  Search,
  Filter,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { INITIAL_LOCALES } from '../data/mockLocales';
import { LocalTenant, Product, UserRole, Order } from '../types';

interface AdminPanelProps {
  locales: LocalTenant[];
  onUpdateLocales: (updatedLocales: LocalTenant[]) => void;
  onOpenReceipt: (order: Order) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  locales,
  onUpdateLocales,
  onOpenReceipt,
}) => {
  const { allUsers, updateUserRole, role } = useAuth();
  const { orders } = useCart();

  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'cartas' | 'orders'>('users');
  const [selectedLocalForEdit, setSelectedLocalForEdit] = useState<LocalTenant | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newDishName, setNewDishName] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('');
  const [newDishImage, setNewDishImage] = useState('');
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Global Financials
  const globalTotal = orders.reduce((sum, o) => sum + o.total, 0);
  const pagoMovilOrders = orders.filter((o) => o.paymentMethod === 'pago_movil');
  const efectivoOrders = orders.filter((o) => o.paymentMethod === 'efectivo');

  const handleRoleChange = async (userId: string, newRole: UserRole, targetLocalId?: string) => {
    await updateUserRole(userId, newRole, targetLocalId);
    setStatusFeedback('Rol actualizado con éxito en Supabase.');
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocalForEdit || !newDishName || !newDishPrice) return;

    const newProd: Product = {
      id: `p-${Date.now()}`,
      name: newDishName.trim(),
      description: newDishDesc.trim() || 'Nuevo plato añadido por el Administrador.',
      price: parseFloat(newDishPrice) || 5.00,
      category: newDishCategory.trim() || 'Especiales',
      image:
        newDishImage.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      popular: true,
    };

    const updated = locales.map((loc) => {
      if (loc.id === selectedLocalForEdit.id) {
        return {
          ...loc,
          products: [newProd, ...loc.products],
        };
      }
      return loc;
    });

    onUpdateLocales(updated);
    setSelectedLocalForEdit((prev) => (prev ? { ...prev, products: [newProd, ...prev.products] } : null));
    setShowAddDishModal(false);
    setNewDishName('');
    setNewDishDesc('');
    setNewDishPrice('');
    setNewDishCategory('');
    setNewDishImage('');
    setStatusFeedback(`¡Plato añadido exitosamente a la carta de ${selectedLocalForEdit.name}!`);
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  const handleDeleteDish = (productId: string) => {
    if (!selectedLocalForEdit) return;
    const updated = locales.map((loc) => {
      if (loc.id === selectedLocalForEdit.id) {
        return {
          ...loc,
          products: loc.products.filter((p) => p.id !== productId),
        };
      }
      return loc;
    });

    onUpdateLocales(updated);
    setSelectedLocalForEdit((prev) =>
      prev ? { ...prev, products: prev.products.filter((p) => p.id !== productId) } : null
    );
  };

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-red-950 via-slate-900 to-amber-950/60 border border-red-500/40 p-4 space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                <span>Panel de Super Administrador</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/80 text-white font-mono">
                  ACCESO TOTAL
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Capaz de ver todo, editar todas las cartas y asignar propietarios de negocio
              </p>
            </div>
          </div>
        </div>

        {/* Global Financial KPI Cards */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Ventas Totales</span>
            <span className="text-sm font-black text-emerald-400">{globalTotal.toFixed(2)} €</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Comandas</span>
            <span className="text-sm font-black text-white">{orders.length} pedidos</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Pago Móvil</span>
            <span className="text-sm font-black text-orange-400">{pagoMovilOrders.length} recibos</span>
          </div>
        </div>
      </div>

      {statusFeedback && (
        <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Admin Tab Switcher */}
      <div className="flex rounded-2xl bg-slate-900 border border-slate-800 p-1">
        <button
          onClick={() => {
            setActiveAdminTab('users');
            setSelectedLocalForEdit(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeAdminTab === 'users'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Asignar Roles ({allUsers.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveAdminTab('cartas');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeAdminTab === 'cartas'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Todas las Cartas ({locales.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveAdminTab('orders');
            setSelectedLocalForEdit(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeAdminTab === 'orders'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Comandas ({orders.length})</span>
        </button>
      </div>

      {/* TAB 1: ASIGNAR ROLES A USUARIOS */}
      {activeAdminTab === 'users' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Usuarios y Asignación de Propietarios
            </h3>
            <span className="text-[11px] text-slate-500">El admin asigna el dueño de cada carta</span>
          </div>

          <div className="space-y-3">
            {allUsers.map((u) => {
              const assignedLocal = locales.find((l) => l.id === u.assignedLocalId);

              return (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs ${
                          u.role === 'admin'
                            ? 'bg-red-600'
                            : u.role === 'propietario'
                            ? 'bg-emerald-600'
                            : 'bg-slate-700'
                        }`}
                      >
                        {u.role === 'admin' ? '👑' : u.role === 'propietario' ? '🏪' : '👤'}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-white">{u.fullName}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        u.role === 'admin'
                          ? 'bg-red-950/80 text-red-300 border-red-700'
                          : u.role === 'propietario'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {u.role === 'general'
                        ? 'Usuario General'
                        : u.role === 'propietario'
                        ? 'Usuario Propietario'
                        : 'Admin'}
                    </span>
                  </div>

                  {/* Role Assignment Selector */}
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        Cambiar Rol:
                      </label>
                      <select
                        value={u.role}
                        onChange={(e) => {
                          const newRole = e.target.value as UserRole;
                          const defaultLocal = newRole === 'propietario' ? (u.assignedLocalId || locales[0].id) : undefined;
                          handleRoleChange(u.id, newRole, defaultLocal);
                        }}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="general">Usuario General</option>
                        <option value="propietario">Usuario Propietario</option>
                        <option value="admin">Administrador (Admin)</option>
                      </select>
                    </div>

                    {/* If role is propietario, select WHICH local they own */}
                    {u.role === 'propietario' && (
                      <div>
                        <label className="text-[10px] font-bold text-emerald-400 block mb-1">
                          Carta de Negocio que Posee:
                        </label>
                        <select
                          value={u.assignedLocalId || locales[0].id}
                          onChange={(e) => {
                            handleRoleChange(u.id, 'propietario', e.target.value);
                          }}
                          className="w-full rounded-xl bg-slate-950 border border-emerald-600 px-2.5 py-1.5 text-xs text-white"
                        >
                          {locales.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.name} ({loc.cuisine})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {u.role === 'propietario' && assignedLocal && (
                    <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        Propietario asignado a la carta de: <strong>{assignedLocal.name}</strong> ({assignedLocal.products.length} platos).
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: VER Y GESTIONAR DENTRO DE TODAS LAS CARTAS */}
      {activeAdminTab === 'cartas' && (
        <div className="space-y-4">
          {!selectedLocalForEdit ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Selecciona una Carta para ver y editar dentro de sus platos:
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {locales.map((local) => (
                  <div
                    key={local.id}
                    onClick={() => setSelectedLocalForEdit(local)}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/60 cursor-pointer transition shadow-md flex items-center justify-between gap-3 group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={local.logoImage}
                        alt={local.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-white group-hover:text-orange-400 transition truncate">
                          {local.name}
                        </h4>
                        <span className="text-[10px] text-orange-400 font-bold block">
                          Negocio {local.cuisine}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {local.products.length} platos en su carta
                        </p>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition flex items-center gap-1 shrink-0">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Entrar</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Inside Selected Local Carta (Admin Can View and Edit Everything Inside) */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setSelectedLocalForEdit(null)}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold px-2.5"
                  >
                    &larr; Volver
                  </button>
                  <div>
                    <h3 className="text-xs font-black text-white">{selectedLocalForEdit.name}</h3>
                    <p className="text-[10px] text-orange-400 font-semibold">
                      Carta de {selectedLocalForEdit.cuisine} • {selectedLocalForEdit.products.length} platos
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddDishModal(true)}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Plato</span>
                </button>
              </div>

              {/* Add Dish Modal for this Carta */}
              {showAddDishModal && (
                <form
                  onSubmit={handleAddDish}
                  className="p-4 rounded-3xl bg-slate-900 border-2 border-emerald-500/50 space-y-3 text-xs shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white text-xs">
                      Añadir Nuevo Plato a la Carta de {selectedLocalForEdit.name}
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
                      placeholder="Ej: Hamburguesa Especial BBQ"
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
                        placeholder="8.50"
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Categoría</label>
                      <input
                        type="text"
                        value={newDishCategory}
                        onChange={(e) => setNewDishCategory(e.target.value)}
                        placeholder="Especiales, Raciones..."
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
                      placeholder="Ingredientes, preparación y detalles del alimento..."
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
                      Guardar en la Carta
                    </button>
                  </div>
                </form>
              )}

              {/* List of food dishes inside this carta */}
              <div className="space-y-2.5">
                {selectedLocalForEdit.products.map((dish) => (
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
                      title="Eliminar plato de la carta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TODAS LAS COMANDAS GLOBALES */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Todas las Comandas de la Plataforma ({orders.length})
            </h3>
            <span className="text-[11px] text-emerald-400 font-bold">
              Total: {globalTotal.toFixed(2)} €
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              No hay pedidos registrados en la plataforma.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-md"
                >
                  <div className="flex items-start justify-between border-b pb-2 border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white">{order.localName}</span>
                        <span className="text-[10px] font-mono text-slate-400">#{order.id}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Cliente: <strong>{order.customerName}</strong> • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <span className="text-xs font-black text-orange-400 font-mono">
                      {order.total.toFixed(2)} €
                    </span>
                  </div>

                  {/* Payment Details Pill */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 font-semibold text-emerald-400">
                      {order.paymentMethod === 'pago_movil' ? (
                        <>
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Pago Móvil (Ref: {order.pagoMovilDetails?.referenceCode || 'N/A'})</span>
                        </>
                      ) : (
                        <>
                          <Banknote className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-400">Efectivo al recibir</span>
                        </>
                      )}
                    </span>

                    <button
                      onClick={() => onOpenReceipt(order)}
                      className="px-2.5 py-1 rounded-lg bg-orange-600/20 text-orange-400 hover:bg-orange-600 hover:text-white border border-orange-500/40 font-bold transition text-[10px]"
                    >
                      Ver Recibo en Grande
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
