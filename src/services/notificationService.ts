import { NotificationSettings, PushNotificationItem } from '../types';

const NOTIFICATIONS_STORAGE_KEY = 'cartalocales_notifications';
const SETTINGS_STORAGE_KEY = 'cartalocales_notification_settings';
const OFFLINE_QUEUE_STORAGE_KEY = 'cartalocales_offline_push_queue';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  promotions: true,
  orderUpdates: true,
  reminders: true,
  soundAndHaptics: true,
};

export const isPushSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
};

export const getNotificationSettings = (): NotificationSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) } : DEFAULT_NOTIFICATION_SETTINGS;
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
};

export const saveNotificationSettings = (settings: NotificationSettings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
};

// Play a subtle native-like confirmation chime using Web Audio API
export const playNotificationChime = () => {
  const settings = getNotificationSettings();
  if (!settings.soundAndHaptics) return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Two-tone pleasant beep
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Ignore audio autoplay restrictions
  }
};

export const getStoredNotifications = (): PushNotificationItem[] => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      return [
        {
          id: 'welcome-notif',
          title: '¡Bienvenido a CartaLocales PWA!',
          body: 'Explora las cartas de tus locales favoritos, realiza pedidos y disfruta del modo 100% offline.',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'system',
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveStoredNotifications = (notifications: PushNotificationItem[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // storage full
  }
};

export const getOfflineQueue = (): PushNotificationItem[] => {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveOfflineQueue = (queue: PushNotificationItem[]) => {
  try {
    localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
};

// Request real push notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isPushSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sendPushNotification({
        title: '🔔 ¡Notificaciones Push Activadas!',
        body: 'Te avisaremos del estado de tus pedidos, promociones y recordatorios.',
        type: 'system',
      });
      return true;
    }
    return false;
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return false;
  }
};

// Dispatch push notification via Service Worker or Notification API + in-app store + offline queue
export const sendPushNotification = async (payload: {
  title: string;
  body: string;
  localName?: string;
  type?: 'order' | 'promo' | 'reminder' | 'system';
  actionUrl?: string;
}): Promise<PushNotificationItem | null> => {
  const settings = getNotificationSettings();

  // Filter based on user preferences
  if (payload.type === 'promo' && !settings.promotions) return null;
  if (payload.type === 'order' && !settings.orderUpdates) return null;
  if (payload.type === 'reminder' && !settings.reminders) return null;

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const newItem: PushNotificationItem = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: payload.title,
    body: payload.body,
    timestamp: new Date().toISOString(),
    read: false,
    localName: payload.localName,
    type: payload.type || 'system',
    actionUrl: payload.actionUrl,
    offlineQueued: !isOnline,
  };

  // If offline, also enqueue for offline sync tracking
  if (!isOnline) {
    const queue = getOfflineQueue();
    saveOfflineQueue([newItem, ...queue]);
  }

  // Add to local history
  const current = getStoredNotifications();
  const updated = [newItem, ...current].slice(0, 50);
  saveStoredNotifications(updated);

  // Vibration feedback if enabled
  if (settings.soundAndHaptics && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([120, 80, 120]);
    } catch {
      // ignore
    }
  }

  // Play audio chime if enabled
  if (settings.soundAndHaptics) {
    playNotificationChime();
  }

  // Trigger system notification if permitted
  if (isPushSupported() && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(payload.title, {
            body: payload.body,
            icon: '/pwa-192x192.png',
            badge: '/favicon.ico',
            tag: newItem.id,
            data: {
              url: payload.actionUrl || '/',
              type: newItem.type,
              offline: !isOnline,
            },
          });
        } else {
          new Notification(payload.title, {
            body: payload.body,
            icon: '/pwa-192x192.png',
          });
        }
      } else {
        new Notification(payload.title, {
          body: payload.body,
          icon: '/pwa-192x192.png',
        });
      }
    } catch (e) {
      console.warn('Native notification dispatch handled in-app:', e);
    }
  }

  // Dispatch custom window event so React UI reacts instantly
  window.dispatchEvent(new CustomEvent('cartalocales_notification', { detail: newItem }));

  return newItem;
};

// Flush and sync queued offline notifications when coming back online
export const syncOfflineNotifications = async () => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  saveOfflineQueue([]); // clear queue

  // Send a synchronization notification
  await sendPushNotification({
    title: '📡 ¡Conexión Restaurada!',
    body: `Se han sincronizado ${queue.length} aviso(s) pendientes durante el modo offline.`,
    type: 'system',
  });
};

// Auto attach online listener for background sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOfflineNotifications();
  });
}

// Preset Promotional Notifications
export const PROMOTIONAL_PRESETS = [
  {
    title: '🔥 ¡2x1 en Pizzas al Horno!',
    body: 'Hoy en Trattoria Bella Napoli: pide una pizza Margherita y llévate la segunda gratis.',
    localName: 'Trattoria Bella Napoli',
    type: 'promo' as const,
  },
  {
    title: '🍔 Smash Day: 20% Descuento',
    body: 'Descuento exclusivo en The Double Truffle Smash en Craft Burger Lab usando el código SMASH20.',
    localName: 'Craft Burger Lab',
    type: 'promo' as const,
  },
  {
    title: '🍣 Combo Nigiris con Envío Gratis',
    body: 'Sakura Sushi te regala los portes en pedidos superiores a 20€. ¡Pescado fresco del día!',
    localName: 'Sakura Sushi & Ramen',
    type: 'promo' as const,
  },
  {
    title: '🌮 Miércoles Taquero en La Cantina',
    body: 'Prueba los tacos de birria con queso oaxaqueño por solo 9.50€ hoy.',
    localName: 'La Cantina Chingona',
    type: 'promo' as const,
  },
  {
    title: '☕ Café + Croissant de Pistacho por 5€',
    body: 'Desayuno gourmet artesanal en Aroma Specialty Bakery. ¡Masa madre y café recién tostado!',
    localName: 'Aroma Specialty Bakery',
    type: 'promo' as const,
  },
];

// Preset Reminders
export const REMINDER_PRESETS = [
  {
    title: '🛒 ¿Olvidaste tus platos favoritos?',
    body: 'Tienes artículos guardados en tu carrito. Termina tu pedido antes de que se agoten.',
    type: 'reminder' as const,
  },
  {
    title: '🍽️ ¡Hora de Almorzar!',
    body: 'Los locales están abiertos y horneando. ¿Te apetece una burger smash o pasta fresca?',
    type: 'reminder' as const,
  },
  {
    title: '🌙 ¿Cena lista para hoy?',
    body: 'Programa tu pedido con antelación para recibirlo caliente y a la hora exacta.',
    type: 'reminder' as const,
  },
];

// Progressive multi-stage Order Push Notifications
export const scheduleOrderProgressNotifications = (
  orderId: string,
  localName: string,
  onStatusUpdate?: (status: 'recibido' | 'en_cocina' | 'en_camino' | 'entregado') => void
) => {
  // Stage 1: En Cocina in 8 seconds
  setTimeout(() => {
    sendPushNotification({
      title: `👨‍🍳 ${localName} - En el Fogón`,
      body: `¡El chef ya está preparando tu pedido #${orderId.slice(-4)} con ingredientes frescos!`,
      localName,
      type: 'order',
    });
    if (onStatusUpdate) onStatusUpdate('en_cocina');
  }, 8000);

  // Stage 2: Repartidor en camino in 18 seconds
  setTimeout(() => {
    sendPushNotification({
      title: `🛵 ${localName} - Repartidor en Camino`,
      body: `El repartidor ha recogido tu pedido #${orderId.slice(-4)} y se dirige a tu ubicación (tiempo est: 10 min).`,
      localName,
      type: 'order',
    });
    if (onStatusUpdate) onStatusUpdate('en_camino');
  }, 18000);

  // Stage 3: Entregado in 32 seconds
  setTimeout(() => {
    sendPushNotification({
      title: `🎉 ${localName} - ¡Pedido Entregado!`,
      body: `Tu pedido #${orderId.slice(-4)} ha sido entregado con éxito. ¡Que aproveche!`,
      localName,
      type: 'order',
    });
    if (onStatusUpdate) onStatusUpdate('entregado');
  }, 32000);
};
