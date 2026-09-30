import React, { useRef } from 'react';
import { Sparkles, ChevronRight, Star, Clock, Plus, BookOpen, Layers } from 'lucide-react';
import { LocalTenant } from '../types';
import { useCart } from '../context/CartContext';

interface FixedCartasSectionProps {
  locales: LocalTenant[];
  selectedLocalId: string | null;
  onSelectLocal: (local: LocalTenant) => void;
}

export const FixedCartasSection: React.FC<FixedCartasSectionProps> = ({
  locales,
  selectedLocalId,
  onSelectLocal,
}) => {
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleQuickAdd = (e: React.MouseEvent, local: LocalTenant) => {
    e.stopPropagation();
    const featuredProduct = local.products[0];
    if (featuredProduct) {
      addToCart(featuredProduct, local.id, local.name, 1, []);
    }
  };

  return (
    <section className="bg-slate-900/90 border-b border-slate-800/80 pt-3.5 pb-4 shadow-xl">
      {/* Header of the fixed section */}
      <div className="px-4 flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>Cartas de Locales</span>
              <span className="text-[10px] font-semibold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-800/50">
                1 Carta por Local ({locales.length})
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Sección fija: explora y entra directamente al menú digital de cada local
            </p>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-flex items-center gap-1">
          Desliza para ver más <ChevronRight className="w-3 h-3 text-orange-400" />
        </span>
      </div>

      {/* Swipeable Carousel of 1 Carta per local */}
      <div
        ref={scrollRef}
        className="flex gap-3 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1"
      >
        {locales.map((local) => {
          const featuredProduct = local.products[0];
          const isSelected = selectedLocalId === local.id;

          return (
            <div
              key={local.id}
              onClick={() => onSelectLocal(local)}
              className={`snap-center shrink-0 w-[270px] sm:w-[290px] rounded-2xl bg-gradient-to-b from-slate-850 to-slate-900 border transition-all duration-200 cursor-pointer overflow-hidden shadow-lg group relative ${
                isSelected
                  ? 'border-orange-500 ring-2 ring-orange-500/40 shadow-orange-950/30'
                  : 'border-slate-800 hover:border-slate-700 active:scale-[0.98]'
              }`}
            >
              {/* Carta Header Banner */}
              <div className="relative h-28 w-full overflow-hidden bg-slate-950">
                <img
                  src={local.bannerImage}
                  alt={local.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Local logo badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                  <img
                    src={local.logoImage}
                    alt={local.name}
                    className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover shadow-md"
                  />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/85 backdrop-blur-md text-orange-400 border border-orange-500/40">
                    {local.cuisine === 'Hamburguesas'
                      ? '🍔 Hamburguesas'
                      : local.cuisine === 'Perro caliente'
                      ? '🌭 Perro Caliente'
                      : local.cuisine === 'Pinchos'
                      ? '🍢 Pinchos'
                      : local.cuisine === 'Batidos'
                      ? '🥤 Batidos'
                      : local.cuisine === 'Cachapas'
                      ? '🌽 Cachapas'
                      : local.cuisine === 'Arroz chino'
                      ? '🥡 Arroz Chino'
                      : local.cuisine}
                  </span>
                </div>

                {/* Rating & Prep time */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300 border border-white/10">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{local.rating}</span>
                </div>

                {/* Local name */}
                <div className="absolute bottom-2 left-2.5 right-2.5">
                  <h3 className="text-sm font-bold text-white leading-tight truncate drop-shadow-md">
                    {local.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-300 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-400" />
                      {local.deliveryTime}
                    </span>
                    <span>•</span>
                    <span className="text-orange-300 font-medium">
                      {local.products.length} platos en carta
                    </span>
                  </div>
                </div>
              </div>

              {/* Carta Preview Body: Plato Estrella */}
              <div className="p-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1 text-orange-400">
                    <Sparkles className="w-3 h-3" />
                    Plato Estrella de la Carta
                  </span>
                  <span className="text-white font-bold">{featuredProduct?.price.toFixed(2)} €</span>
                </div>

                {featuredProduct && (
                  <div className="flex items-center gap-2.5 bg-slate-950/70 rounded-xl p-2 border border-slate-800/80">
                    <img
                      src={featuredProduct.image}
                      alt={featuredProduct.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-slate-100 truncate">
                        {featuredProduct.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {featuredProduct.description}
                      </p>
                    </div>

                    {/* Quick Add Button */}
                    <button
                      onClick={(e) => handleQuickAdd(e, local)}
                      className="p-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 active:scale-90 text-white shadow transition shrink-0"
                      title="Añadir plato estrella al carrito"
                      aria-label="Añadir al carrito"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Categories tags preview */}
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  {local.categories.slice(0, 3).map((cat) => (
                    <span
                      key={cat}
                      className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 truncate"
                    >
                      {cat}
                    </span>
                  ))}
                  {local.categories.length > 3 && (
                    <span className="text-[9px] text-slate-500 font-medium">
                      +{local.categories.length - 3} más
                    </span>
                  )}
                </div>

                {/* Main Action Button */}
                <button
                  onClick={() => onSelectLocal(local)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-orange-600 hover:text-white text-orange-400 text-xs font-bold border border-slate-700 hover:border-orange-500 transition group-hover:bg-orange-600 group-hover:text-white shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ver Carta Completa</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
