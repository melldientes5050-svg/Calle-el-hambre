import React from 'react';
import { Bell, MapPin, ChevronDown, Store, Smartphone, Monitor } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useCart } from '../context/CartContext';
import { PWAInstallBanner } from './PWAInstallBanner';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenLocationPicker: () => void;
  isDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenLocationPicker,
  isDeviceFrame,
  onToggleDeviceFrame,
  onGoHome,
}) => {
  const isOnline = useOnlineStatus();
  const { unreadCount, currentAddress } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-3.5 py-2 pt-safe transition-all shadow-lg">
      <div className="flex flex-col gap-1.5 max-w-lg mx-auto">
        {/* Top Row: Brand & Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Identity */}
          <button
            onClick={onGoHome}
            className="flex items-center gap-2.5 text-left group active:scale-95 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-950/40 text-white font-black text-base">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-orange-400 transition">
                  CartaLocales
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  PWA
                </span>
              </div>
            </div>
          </button>

          {/* Action icons & install */}
          <div className="flex items-center gap-1.5">
            {/* PWA Install Button */}
            <PWAInstallBanner compact />

            {/* Desktop/Mobile preview toggle (useful on wider screens) */}
            <button
              onClick={onToggleDeviceFrame}
              className="hidden md:flex p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isDeviceFrame ? 'Modo Pantalla Completa' : 'Modo Marco Móvil Nativo'}
              aria-label="Alternar vista de dispositivo"
            >
              {isDeviceFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition"
              aria-label="Centro de notificaciones push"
            >
              <Bell className="w-4 h-4 text-orange-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-md animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Second Row: Delivery Address Chip & Online Badge */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          {/* Address dropdown trigger */}
          <button
            onClick={onOpenLocationPicker}
            className="flex items-center gap-1 text-slate-300 hover:text-orange-400 active:scale-95 transition truncate max-w-[280px]"
            title="Cambiar dirección de entrega"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="text-[11px] font-semibold truncate text-white">
              {currentAddress}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {/* Status pill */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isOnline
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                  : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span className="font-medium">
              {isOnline ? 'Online' : 'Offline (Caché)'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
