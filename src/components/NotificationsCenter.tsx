import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle,
  Clock,
  Sparkles,
  Smartphone,
  Trash2,
  ShieldCheck,
  Send,
  Tag,
  Package,
  ShoppingBag,
  Volume2,
  RefreshCw,
  WifiOff
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import {
  getNotificationPermission,
  getOfflineQueue,
  isPushSupported,
  PROMOTIONAL_PRESETS,
  REMINDER_PRESETS,
  requestNotificationPermission,
  sendPushNotification,
  syncOfflineNotifications
} from '../services/notificationService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const NotificationsCenter: React.FC = () => {
  const {
    notifications,
    markNotificationsAsRead,
    clearNotifications,
    notificationSettings,
    updateNotificationSettings
  } = useCart();
  const isOnline = useOnlineStatus();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [activeFilter, setActiveFilter] = useState<'all' | 'order' | 'promo' | 'reminder'>('all');
  const [offlineQueue, setOfflineQueue] = useState(getOfflineQueue());

  useEffect(() => {
    setPermission(getNotificationPermission());
    markNotificationsAsRead();
    setOfflineQueue(getOfflineQueue());
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
  };

  const handleTestPromo = async () => {
    const randomPromo = PROMOTIONAL_PRESETS[Math.floor(Math.random() * PROMOTIONAL_PRESETS.length)];
    await sendPushNotification(randomPromo);
    setOfflineQueue(getOfflineQueue());
  };

  const handleTestOrder = async () => {
    await sendPushNotification({
      title: '🛵 Repartidor en Camino - Trattoria Bella Napoli',
      body: 'Tu comanda #PED-402 está en camino. El rider llegará en aproximadamente 10 min.',
      localName: 'Trattoria Bella Napoli',
      type: 'order',
    });
    setOfflineQueue(getOfflineQueue());
  };

  const handleTestReminder = async () => {
    const randomReminder = REMINDER_PRESETS[Math.floor(Math.random() * REMINDER_PRESETS.length)];
    await sendPushNotification(randomReminder);
    setOfflineQueue(getOfflineQueue());
  };

  const handleSyncOffline = async () => {
    await syncOfflineNotifications();
    setOfflineQueue(getOfflineQueue());
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-orange-400" />
            <span>Notificaciones Push PWA</span>
          </h2>
          <p className="text-xs text-slate-400">
            Avisos nativos para promociones, pedidos y recordatorios
          </p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="p-1.5 text-slate-400 hover:text-red-400 transition"
            title="Limpiar historial"
            aria-label="Limpiar historial"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Offline Status Alert if Offline */}
      {!isOnline && (
        <div className="rounded-2xl bg-amber-950/60 border border-amber-600/50 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <WifiOff className="w-4 h-4" />
              <span>Modo Offline Activo</span>
            </div>
            <span className="text-[10px] bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded-full border border-amber-700">
              {offlineQueue.length} en cola
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Las notificaciones se encolan en almacenamiento local y se sincronizan automáticamente con el sistema operativo en cuanto se reanude la conexión.
          </p>
          {offlineQueue.length > 0 && (
            <button
              onClick={handleSyncOffline}
              className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Forzar Sincronización</span>
            </button>
          )}
        </div>
      )}

      {/* System Permission Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/30 border border-slate-800 p-4 space-y-3 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Permiso en el Dispositivo</h3>
              <p className="text-[11px] text-slate-400">
                {permission === 'granted'
                  ? 'Activo: Recibirás avisos nativos en la barra de notificaciones'
                  : permission === 'denied'
                  ? 'Bloqueado por el navegador (habilítalo en los ajustes del sitio)'
                  : 'Requiere activación para mostrar alertas en el sistema operativo'}
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
              permission === 'granted'
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700'
                : permission === 'denied'
                ? 'bg-red-950/80 text-red-400 border-red-700'
                : 'bg-amber-950/80 text-amber-300 border-amber-700'
            }`}
          >
            {permission === 'granted' ? 'Concedido' : permission === 'denied' ? 'Bloqueado' : 'Por Solicitar'}
          </span>
        </div>

        {permission !== 'granted' && isPushSupported() && (
          <button
            onClick={handleRequestPermission}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-95 text-white font-bold text-xs shadow-md transition"
          >
            <Bell className="w-4 h-4" />
            <span>Permitir Notificaciones Nativas en este Dispositivo</span>
          </button>
        )}
      </div>

      {/* Interactive Push Triggers (Promos, Pedidos, Recordatorios) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>Probar Tipos de Notificaciones Push</span>
        </h3>
        <p className="text-[11px] text-slate-400">
          Lanza notificaciones de prueba para verificar cómo se muestran en la pantalla de tu móvil o escritorio:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Promo */}
          <button
            onClick={handleTestPromo}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 text-left transition active:scale-95 group"
          >
            <div className="p-1.5 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-800 shrink-0">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block group-hover:text-orange-400 truncate">
                Promoción
              </span>
              <span className="text-[10px] text-slate-400">2x1 o descuentos</span>
            </div>
          </button>

          {/* Order */}
          <button
            onClick={handleTestOrder}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 text-left transition active:scale-95 group"
          >
            <div className="p-1.5 rounded-lg bg-orange-950/80 text-orange-400 border border-orange-800 shrink-0">
              <Package className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block group-hover:text-orange-400 truncate">
                Actualización Pedido
              </span>
              <span className="text-[10px] text-slate-400">En ruta o cocina</span>
            </div>
          </button>

          {/* Reminder */}
          <button
            onClick={handleTestReminder}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 text-left transition active:scale-95 group"
          >
            <div className="p-1.5 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-800 shrink-0">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block group-hover:text-orange-400 truncate">
                Recordatorio
              </span>
              <span className="text-[10px] text-slate-400">Carrito abandonado</span>
            </div>
          </button>
        </div>
      </div>

      {/* Push Preferences Toggles */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Preferencias de Avisos
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Promociones y Ofertas</span>
              <span className="text-[11px] text-slate-400">Descuentos 2x1 y días temáticos de locales</span>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.promotions}
              onChange={(e) => updateNotificationSettings({ promotions: e.target.checked })}
              className="w-4 h-4 accent-orange-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-800">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Estado de los Pedidos</span>
              <span className="text-[11px] text-slate-400">Avisos en tiempo real: comanda, cocina y reparto</span>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.orderUpdates}
              onChange={(e) => updateNotificationSettings({ orderUpdates: e.target.checked })}
              className="w-4 h-4 accent-orange-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-800">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Recordatorios Inteligentes</span>
              <span className="text-[11px] text-slate-400">Platos en carrito pendiente y horas de comer</span>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.reminders}
              onChange={(e) => updateNotificationSettings({ reminders: e.target.checked })}
              className="w-4 h-4 accent-orange-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-800">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Sonido y Vibración Háptica</span>
              <span className="text-[11px] text-slate-400">Tono de confirmación y vibración suave</span>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.soundAndHaptics}
              onChange={(e) => updateNotificationSettings({ soundAndHaptics: e.target.checked })}
              className="w-4 h-4 accent-orange-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Notification Filter Chips & History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Bandeja de Entrada ({filteredNotifications.length})
          </h3>

          <div className="flex gap-1">
            {(['all', 'order', 'promo', 'reminder'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize transition ${
                  activeFilter === tab
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {tab === 'all'
                  ? 'Todos'
                  : tab === 'order'
                  ? 'Pedidos'
                  : tab === 'promo'
                  ? 'Promos'
                  : 'Recordatorios'}
              </button>
            ))}
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-4">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-medium">No hay notificaciones de este tipo.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notif) => {
              const badgeConfig =
                notif.type === 'order'
                  ? { label: 'Pedido', color: 'bg-orange-950/80 text-orange-400 border-orange-800' }
                  : notif.type === 'promo'
                  ? { label: 'Promoción', color: 'bg-purple-950/80 text-purple-400 border-purple-800' }
                  : notif.type === 'reminder'
                  ? { label: 'Recordatorio', color: 'bg-sky-950/80 text-sky-400 border-sky-800' }
                  : { label: 'Sistema', color: 'bg-slate-800 text-slate-300 border-slate-700' };

              return (
                <div
                  key={notif.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs shadow-md space-y-1 relative"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeConfig.color}`}>
                        {badgeConfig.label}
                      </span>
                      <h4 className="font-bold text-white truncate">{notif.title}</h4>
                    </div>

                    <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {notif.body}
                  </p>

                  {notif.localName && (
                    <div className="pt-1">
                      <span className="text-[9px] font-semibold text-orange-300 bg-orange-950/50 px-2 py-0.5 rounded-full border border-orange-800/40">
                        {notif.localName}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
