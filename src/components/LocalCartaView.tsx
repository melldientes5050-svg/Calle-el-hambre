import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  Search,
  MapPin,
  Plus,
  Flame,
  Leaf,
  Wheat,
  ShoppingBag,
  Info,
  CheckCircle2,
  Store,
  ChevronDown
} from 'lucide-react';
import { LocalTenant, Product } from '../types';
import { useCart } from '../context/CartContext';
import { ProductDetailModal } from './ProductDetailModal';
import { INITIAL_LOCALES } from '../data/mockLocales';

interface LocalCartaViewProps {
  local: LocalTenant;
  onBack: () => void;
  onOpenCart: () => void;
  onSwitchStore?: (store: LocalTenant) => void;
}

export const LocalCartaView: React.FC<LocalCartaViewProps> = ({
  local,
  onBack,
  onOpenCart,
  onSwitchStore,
}) => {
  const { cart, cartCount, cartTotal, getStoreSubtotal } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [showStoreSwitcher, setShowStoreSwitcher] = useState(false);

  // Store free delivery calculations
  const storeSubtotal = getStoreSubtotal(local.id);
  const freeThreshold = local.freeDeliveryThreshold || 25;
  const remainingForFree = Math.max(0, freeThreshold - storeSubtotal);
  const progressPct = Math.min(100, Math.round((storeSubtotal / freeThreshold) * 100));

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return local.products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [local.products, selectedCategory, searchQuery]);

  const allCategories = ['Todos', ...local.categories];

  const handleProductAdded = () => {
    setAddedToast('¡Añadido al pedido!');
    setTimeout(() => setAddedToast(null), 2500);
  };

  const itemsFromThisLocal = cart.filter((item) => item.localId === local.id);
  const localCartCount = itemsFromThisLocal.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-full pb-28">
      {/* Toast confirmation */}
      {addedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-600/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Top sticky navigation bar */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white active:scale-95 transition"
        >
          <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-300">Todas las Tiendas</span>
        </button>

        {/* Store Switcher trigger */}
        <div className="relative">
          <button
            onClick={() => setShowStoreSwitcher(!showStoreSwitcher)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-orange-400 hover:border-orange-500/50 active:scale-95 transition"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="max-w-[130px] truncate">{local.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Switcher Dropdown */}
          {showStoreSwitcher && (
            <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
                Cambiar de Tienda
              </span>
              <div className="space-y-1">
                {INITIAL_LOCALES.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      setShowStoreSwitcher(false);
                      if (onSwitchStore) onSwitchStore(store);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition ${
                      store.id === local.id
                        ? 'bg-orange-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <img
                      src={store.logoImage}
                      alt={store.name}
                      className="w-6 h-6 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1 truncate">
                      <p className="truncate font-semibold">{store.name}</p>
                      <p className="text-[10px] opacity-75">{store.cuisine}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Local Tenant Hero Banner */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-950">
        <img
          src={local.bannerImage}
          alt={local.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-black/20" />

        <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3">
          <img
            src={local.logoImage}
            alt={local.name}
            className="w-16 h-16 rounded-2xl border-2 border-slate-900 object-cover shadow-2xl shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-600/90 text-white">
                Negocio {local.cuisine}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/90 text-emerald-400 border border-emerald-500/40">
                {local.isOpen ? 'Abierto para pedidos' : 'Cerrado'}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white leading-tight mt-1 truncate">
              {local.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Local Info bar */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/80 text-xs text-slate-300 space-y-2">
        <p className="text-xs text-slate-300">{local.tagline}</p>

        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            {local.deliveryTime} • {local.openingHours}
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <Bike className="w-3.5 h-3.5 text-orange-400" />
            {local.deliveryFee === 0 ? 'Envío gratis' : `Envío: ${local.deliveryFee.toFixed(2)} €`}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {local.address}
          </span>
        </div>

        {/* Free Delivery Bar inside Store */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-300 font-medium">
              {remainingForFree === 0 ? (
                <span className="text-emerald-400 font-bold">¡Envío gratis conseguido en esta tienda!</span>
              ) : (
                <span>
                  Te faltan <strong className="text-white">{remainingForFree.toFixed(2)} €</strong> para envío gratis
                </span>
              )}
            </span>
            <span className="text-orange-400 font-bold">{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="sticky top-[53px] z-20 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 space-y-2">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar platos en ${local.name}...`}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        {/* Categories scrollable pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-950/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products list */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
          <span className="font-semibold text-slate-300">
            {selectedCategory === 'Todos' ? 'Carta Completa' : selectedCategory} ({filteredProducts.length})
          </span>
          <span className="text-[11px]">Pulsa para personalizar ración y extras</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium">No se han encontrado platos con este criterio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="group flex gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-orange-500/50 cursor-pointer active:scale-[0.99] transition shadow-md relative overflow-hidden"
              >
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start gap-1.5 flex-wrap mb-1">
                      {product.popular && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-950/80 text-orange-400 border border-orange-700/60">
                          TOP Venta
                        </span>
                      )}
                      {product.vegan && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-700/60">
                          <Leaf className="w-2.5 h-2.5" /> Vegano
                        </span>
                      )}
                      {product.glutenFree && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-700/60">
                          <Wheat className="w-2.5 h-2.5" /> Sin Gluten
                        </span>
                      )}
                      {product.spicy && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-700/60">
                          <Flame className="w-2.5 h-2.5" /> Picante
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-black text-orange-400">
                      {product.price.toFixed(2)} €
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md active:scale-90 transition"
                      aria-label="Personalizar y añadir plato"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir</span>
                    </button>
                  </div>
                </div>

                {/* Product Image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-950 shrink-0 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.extras && product.extras.length > 0 && (
                    <span className="absolute bottom-1 right-1 text-[9px] font-medium bg-black/80 backdrop-blur-sm text-slate-300 px-1 rounded border border-white/10">
                      +{product.extras.length} extras
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar (if user has items) */}
      {cartCount > 0 && (
        <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 z-40 max-w-lg mx-auto">
          <button
            onClick={onOpenCart}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white font-bold text-sm shadow-2xl shadow-orange-950/80 active:scale-[0.98] transition border border-orange-400/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black">
                {cartCount}
              </div>
              <div className="text-left">
                <p className="leading-tight">Ver Carrito Multi-Tienda</p>
                <p className="text-[11px] text-orange-200 font-normal">
                  {localCartCount > 0
                    ? `${localCartCount} de ${local.name} (${storeSubtotal.toFixed(2)} €)`
                    : 'Artículos de otras tiendas'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black">{cartTotal.toFixed(2)} €</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Product Detail & Customization Modal */}
      <ProductDetailModal
        product={selectedProduct}
        local={local}
        onClose={() => setSelectedProduct(null)}
        onAdded={handleProductAdded}
      />
    </div>
  );
};
