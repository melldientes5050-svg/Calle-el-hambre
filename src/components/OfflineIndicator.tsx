import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = React.useState(false);
  const wasOffline = React.useRef(false);

  React.useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (showReconnected) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-600/95 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-white shadow-xl border border-emerald-400/40 animate-bounce">
        <Wifi className="w-3.5 h-3.5" />
        <span>¡Conexión restaurada! Sincronizado</span>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-600/95 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-white shadow-xl border border-amber-400/40 animate-pulse">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Modo sin conexión — Todas las cartas y pedidos disponibles en caché</span>
    </div>
  );
};
