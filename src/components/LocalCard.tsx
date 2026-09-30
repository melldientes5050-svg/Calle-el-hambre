import React from 'react';
import { Clock, Bike, BookOpen, ChevronRight, Store } from 'lucide-react';
import { LocalTenant } from '../types';

interface LocalCardProps {
  local: LocalTenant;
  onSelect: (local: LocalTenant) => void;
}

export const LocalCard: React.FC<LocalCardProps> = ({ local, onSelect }) => {
  const getCuisineIcon = (cuisine: string) => {
    switch (cuisine.toLowerCase()) {
      case 'hamburguesas':
        return '🍔';
      case 'perro caliente':
        return '🌭';
      case 'pinchos':
        return '🍢';
      case 'batidos':
        return '🥤';
      case 'cachapas':
        return '🌽';
      case 'arroz chino':
        return '🥡';
      default:
        return '🍽️';
    }
  };

  return (
    <div
      onClick={() => onSelect(local)}
      className="group relative rounded-3xl bg-slate-900 border border-slate-800/90 hover:border-orange-500/60 overflow-hidden shadow-xl active:scale-[0.99] transition cursor-pointer flex flex-col"
    >
      {/* Banner / Food Image */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-950">
        <img
          src={local.bannerImage}
          alt={local.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />

        {/* Cuisine & Specialty Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-slate-950/90 backdrop-blur-md text-orange-400 border border-orange-500/40 shadow-lg">
            <span>{getCuisineIcon(local.cuisine)}</span>
            <span>Negocio {local.cuisine}</span>
          </span>
        </div>

        {/* Logo overlapping banner */}
        <div className="absolute -bottom-3 left-4 flex items-center gap-3">
          <img
            src={local.logoImage}
            alt={local.name}
            className="w-12 h-12 rounded-2xl border-2 border-slate-900 object-cover shadow-2xl shrink-0"
          />
        </div>

        {/* Dish count pill on banner */}
        <div className="absolute bottom-2.5 right-3 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-600/90 backdrop-blur-md text-white shadow">
          {local.products.length} platos en carta
        </div>
      </div>

      {/* Content */}
      <div className="pt-4 p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="min-w-0">
            <h3 className="text-base font-black text-white group-hover:text-orange-400 transition leading-snug">
              {local.name}
            </h3>
            <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
              {local.tagline}
            </p>
          </div>

          {/* Delivery Metrics */}
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              {local.deliveryTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Bike className="w-3.5 h-3.5 text-orange-400" />
              {local.deliveryFee === 0 ? 'Envío gratis' : `${local.deliveryFee.toFixed(2)} €`}
            </span>
            <span>•</span>
            <span className="truncate">Pedido mín: {local.minOrder.toFixed(2)} €</span>
          </div>

          {/* Categories available in this carta */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            {local.categories.map((cat) => (
              <span
                key={cat}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Big Action Button to enter this carta */}
        <button
          onClick={() => onSelect(local)}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 group-hover:from-orange-500 group-hover:to-amber-500 text-white font-extrabold text-xs shadow-md shadow-orange-950/50 active:scale-95 transition"
        >
          <BookOpen className="w-4 h-4" />
          <span>Ver Platos de esta Carta</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
        </button>
      </div>
    </div>
  );
};
