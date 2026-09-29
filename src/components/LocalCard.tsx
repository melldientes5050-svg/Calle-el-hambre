import React from 'react';
import { Star, Clock, MapPin, Bike, ChevronRight } from 'lucide-react';
import { LocalTenant } from '../types';

interface LocalCardProps {
  local: LocalTenant;
  onSelect: (local: LocalTenant) => void;
}

export const LocalCard: React.FC<LocalCardProps> = ({ local, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(local)}
      className="group relative rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-orange-500/50 overflow-hidden shadow-lg active:scale-[0.98] transition cursor-pointer"
    >
      {/* Banner */}
      <div className="relative h-36 w-full overflow-hidden bg-slate-950">
        <img
          src={local.bannerImage}
          alt={local.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

        {/* Cuisine badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-orange-400 border border-orange-500/30 shadow-md">
            {local.cuisine}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-300 border border-slate-700 shadow-md">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{local.rating}</span>
          <span className="text-[10px] text-slate-400 font-normal">({local.reviewsCount})</span>
        </div>

        {/* Logo overlapping banner */}
        <div className="absolute -bottom-3 left-4">
          <img
            src={local.logoImage}
            alt={local.name}
            className="w-12 h-12 rounded-2xl border-2 border-slate-900 object-cover shadow-xl"
          />
        </div>
      </div>

      {/* Content */}
      <div className="pt-4 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-white group-hover:text-orange-400 transition truncate">
              {local.name}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              {local.tagline}
            </p>
          </div>
          <div className="p-1.5 rounded-xl bg-slate-800 text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition shrink-0 mt-0.5">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Info pills */}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>{local.deliveryTime}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Bike className="w-3.5 h-3.5 text-orange-400" />
            <span>{local.deliveryFee === 0 ? 'Envío gratis' : `${local.deliveryFee.toFixed(2)} €`}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 truncate text-slate-400">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{local.address}</span>
          </div>
        </div>

        {/* Featured dish teaser */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Carta: <span className="text-white font-medium">{local.products.length} platos disponibles</span>
          </span>
          <span className="text-orange-400 font-bold group-hover:underline">
            Explorar Carta &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};
