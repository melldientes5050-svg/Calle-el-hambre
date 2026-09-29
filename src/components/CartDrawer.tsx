import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Store,
  Utensils,
  Bike,
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CheckoutModal } from './CheckoutModal';
import { INITIAL_LOCALES } from '../data/mockLocales';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: () => void;
  onNavigateToStore?: (localId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderCompleted,
  onNavigateToStore,
}) => {
  const { cart, cartTotal, updateQuantity, clearCart, clearStoreCart } = useCart();
  const [selectedLocalForCheckout, setSelectedLocalForCheckout] = useState<string | null>(null);

  if (!isOpen) return null;

  // Group cart items by local tenant
  const itemsByLocal = cart.reduce<
    Record<string, { localName: string; localId: string; items: typeof cart }>
  >((acc, item) => {
    if (!acc[item.localId]) {
      acc[item.localId] = { localName: item.localName, localId: item.localId, items: [] };
    }
    acc[item.localId].items.push(item);
    return acc;
  }, {});

  const tenantIds = Object.keys(itemsByLocal);

  const handleStartCheckout = (localId: string) => {
    setSelectedLocalForCheckout(localId);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Carrito Multi-Tienda</h2>
              <p className="text-[11px] text-slate-400">
                {cart.length === 0
                  ? 'Sin productos'
                  : `${cart.length} platos en ${tenantIds.length} ${
                      tenantIds.length === 1 ? 'tienda' : 'tiendas'
                    }`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="p-2 text-slate-400 hover:text-red-400 transition"
                title="Vaciar todo el carrito"
                aria-label="Vaciar todo el carrito"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {cart.length === 0 ? (
            <div className="py-24 text-center text-slate-400 space-y-3">
              <Utensils className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <h3 className="text-base font-bold text-slate-200">Tu carrito está vacío</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Explora las cartas de cada tienda para añadir tus comidas y bebidas favoritas.
              </p>
            </div>
          ) : (
            tenantIds.map((localId) => {
              const { localName, items } = itemsByLocal[localId];
              const storeData = INITIAL_LOCALES.find((l) => l.id === localId);
              const storeSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
              const freeDeliveryThreshold = storeData?.freeDeliveryThreshold || 25;
              const deliveryFee = storeData?.deliveryFee || 1.95;
              const remainingForFree = Math.max(0, freeDeliveryThreshold - storeSubtotal);
              const progressPct = Math.min(100, Math.round((storeSubtotal / freeDeliveryThreshold) * 100));

              return (
                <div
                  key={localId}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-3.5 shadow-lg relative"
                >
                  {/* Store Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      {storeData?.logoImage && (
                        <img
                          src={storeData.logoImage}
                          alt={localName}
                          className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                        />
                      )}
                      <div>
                        <h3 className="text-xs font-black text-white">{localName}</h3>
                        <p className="text-[10px] text-slate-400">
                          {storeData?.deliveryTime || '25-35 min'} • Pedido mín: {storeData?.minOrder.toFixed(2)} €
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => clearStoreCart(localId)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Eliminar artículos de esta tienda"
                        aria-label="Vaciar tienda"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {onNavigateToStore && (
                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToStore(localId);
                          }}
                          className="text-[10px] font-bold text-orange-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>+ Platos</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Free Delivery Progress Bar */}
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Bike className="w-3 h-3 text-orange-400" />
                        {remainingForFree === 0 ? (
                          <span className="text-emerald-400 font-bold">¡Envío Gratis Conseguido!</span>
                        ) : (
                          <span>
                            Añade <strong className="text-white">{remainingForFree.toFixed(2)} €</strong> para envío gratis
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-orange-400">{progressPct}%</span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Store Items List */}
                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 text-xs bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-white truncate">{item.name}</h4>
                          {item.selectedExtras && item.selectedExtras.length > 0 && (
                            <p className="text-[10px] text-orange-300 mt-0.5">
                              + {item.selectedExtras.map((e) => e.name).join(', ')}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1">
                              "{item.specialInstructions}"
                            </p>
                          )}
                          <span className="text-xs font-black text-orange-400 mt-1 inline-block">
                            {(item.price * item.quantity).toFixed(2)} €
                          </span>
                        </div>

                        {/* Quantity Modifier */}
                        <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-1 border border-slate-800">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white active:scale-95"
                            aria-label="Restar 1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-xs text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white active:scale-95"
                            aria-label="Sumar 1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Store Subtotal & Direct Checkout */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Subtotal tienda:</span>
                      <span className="text-sm font-black text-white">{storeSubtotal.toFixed(2)} €</span>
                    </div>

                    <button
                      onClick={() => handleStartCheckout(localId)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md active:scale-95 transition"
                    >
                      <span>Tramitar este Local</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Global Combined Footer if more than 1 tenant or single tenant */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal total ({cart.length} artículos)</span>
                <span>{cartTotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>IVA (10%)</span>
                <span className="text-emerald-400">Incluido</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                <span>Total General</span>
                <span className="text-orange-400">{cartTotal.toFixed(2)} €</span>
              </div>
            </div>

            {/* Quick checkout first store or combined */}
            <button
              onClick={() => handleStartCheckout(tenantIds[0])}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-[0.98] text-white py-3.5 px-4 font-extrabold text-sm shadow-xl shadow-orange-950/60 transition"
            >
              <span>Tramitar Pedido ({itemsByLocal[tenantIds[0]]?.localName || 'Seleccionado'})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {selectedLocalForCheckout && (
        <CheckoutModal
          localId={selectedLocalForCheckout}
          onClose={() => setSelectedLocalForCheckout(null)}
          onSuccess={() => {
            setSelectedLocalForCheckout(null);
            onClose();
            onOrderCompleted();
          }}
        />
      )}
    </div>
  );
};
