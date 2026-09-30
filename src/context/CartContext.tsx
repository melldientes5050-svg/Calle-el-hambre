import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CartItem,
  NotificationSettings,
  Order,
  Product,
  ProductExtra,
  PushNotificationItem,
  LocationCoordinates,
  PagoMovilDetails,
} from '../types';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  getNotificationSettings,
  getStoredNotifications,
  saveNotificationSettings,
  saveStoredNotifications,
  scheduleOrderProgressNotifications,
  sendPushNotification
} from '../services/notificationService';


interface CreateOrderPayload {
  localId: string;
  localName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tip: number;
  total: number;
  deliveryType: 'delivery' | 'pickup' | 'table';
  deliveryTimePreference?: 'asap' | 'scheduled';
  scheduledTime?: string;
  tableNumber?: string;
  address?: string;
  coordinates?: LocationCoordinates;
  customerName?: string;
  paymentMethod: 'efectivo' | 'pago_movil';
  pagoMovilDetails?: PagoMovilDetails;
  userId?: string;
  userEmail?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (
    product: Product,
    localId: string,
    localName: string,
    quantity?: number,
    extras?: ProductExtra[],
    notes?: string
  ) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  clearStoreCart: (localId: string) => void;
  getStoreCartItems: (localId: string) => CartItem[];
  getStoreSubtotal: (localId: string) => number;
  orders: Order[];
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
  completedReceiptOrder: Order | null;
  setCompletedReceiptOrder: (order: Order | null) => void;
  createOrder: (payload: CreateOrderPayload) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  notifications: PushNotificationItem[];
  unreadCount: number;
  markNotificationsAsRead: () => void;
  addNotificationDirect: (notif: PushNotificationItem) => void;
  clearNotifications: () => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  currentAddress: string;
  currentCoordinates: LocationCoordinates | null;
  setCurrentLocation: (address: string, coords?: LocationCoordinates) => void;
  setCurrentAddress: (address: string) => void;
}

const CART_STORAGE_KEY = 'cartalocales_cart_items';
const ORDERS_STORAGE_KEY = 'cartalocales_orders_list';
const ADDRESS_STORAGE_KEY = 'cartalocales_current_address';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [completedReceiptOrder, setCompletedReceiptOrder] = useState<Order | null>(null);

  const [currentAddress, setCurrentAddress] = useState<string>(() => {
    try {
      return localStorage.getItem(ADDRESS_STORAGE_KEY) || 'Ubicación GPS fijada';
    } catch {
      return 'Ubicación GPS fijada';
    }
  });

  const [currentCoordinates, setCurrentCoordinates] = useState<LocationCoordinates | null>(() => {
    try {
      const saved = localStorage.getItem('cartalocales_gps_coords');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setCurrentLocation = (address: string, coords?: LocationCoordinates) => {
    setCurrentAddress(address);
    if (coords) {
      setCurrentCoordinates(coords);
      try {
        localStorage.setItem('cartalocales_gps_coords', JSON.stringify(coords));
      } catch {
        // ignore
      }
    }
  };

  const [notifications, setNotifications] = useState<PushNotificationItem[]>(getStoredNotifications);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(getNotificationSettings);

  // Sync cart to storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed saving cart to local storage:', e);
    }
  }, [cart]);

  // Sync orders to storage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed saving orders to local storage:', e);
    }
  }, [orders]);

  // Sync address
  useEffect(() => {
    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, currentAddress);
    } catch (e) {
      // ignore
    }
  }, [currentAddress]);

  // Listen to custom push notifications broadcast
  useEffect(() => {
    const handleNotifEvent = (e: Event) => {
      const customEvent = e as CustomEvent<PushNotificationItem>;
      if (customEvent.detail) {
        setNotifications((prev) => [customEvent.detail, ...prev]);
      }
    };

    window.addEventListener('cartalocales_notification', handleNotifEvent);
    return () => {
      window.removeEventListener('cartalocales_notification', handleNotifEvent);
    };
  }, []);

  const addToCart = (
    product: Product,
    localId: string,
    localName: string,
    quantity: number = 1,
    extras: ProductExtra[] = [],
    notes: string = ''
  ) => {
    const extraIds = extras.map((e) => e.id).sort().join('-');
    const cartItemId = `${product.id}-${localId}-${extraIds}-${notes.trim()}`;

    // Haptic vibration feedback
    if (notificationSettings.soundAndHaptics && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(35);
      } catch {
        // ignore
      }
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        const extrasCost = extras.reduce((sum, item) => sum + item.price, 0);
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          localId,
          localName,
          name: product.name,
          price: product.price + extrasCost,
          image: product.image,
          quantity,
          selectedExtras: extras,
          specialInstructions: notes,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const clearStoreCart = (localId: string) => {
    setCart((prev) => prev.filter((item) => item.localId !== localId));
  };

  const getStoreCartItems = (localId: string): CartItem[] => {
    return cart.filter((item) => item.localId === localId);
  };

  const getStoreSubtotal = (localId: string): number => {
    return cart
      .filter((item) => item.localId === localId)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    if (activeTrackingOrder && activeTrackingOrder.id === orderId) {
      setActiveTrackingOrder((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const createOrder = async (payload: CreateOrderPayload): Promise<Order | null> => {
    if (payload.items.length === 0) return null;

    const orderId = `PED-${Date.now().toString().slice(-6)}`;

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      userId: payload.userId,
      userEmail: payload.userEmail,
      localId: payload.localId,
      localName: payload.localName,
      items: [...payload.items],
      subtotal: payload.subtotal,
      deliveryFee: payload.deliveryFee,
      tip: payload.tip,
      total: payload.total,
      deliveryType: payload.deliveryType,
      deliveryTimePreference: payload.deliveryTimePreference,
      scheduledTime: payload.scheduledTime,
      tableNumber: payload.tableNumber,
      address: payload.address,
      coordinates: payload.coordinates,
      customerName: payload.customerName || 'Cliente Gourmet',
      paymentMethod: payload.paymentMethod,
      pagoMovilDetails: payload.pagoMovilDetails,
      status: 'recibido',
      estimatedMinutes: payload.deliveryType === 'delivery' ? 30 : 15,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveTrackingOrder(newOrder);
    setCompletedReceiptOrder(newOrder);



    // Remove ordered items from cart
    const orderedItemIds = new Set(payload.items.map((i) => i.id));
    setCart((prev) => prev.filter((item) => !orderedItemIds.has(item.id)));

    // Send instant native push notification
    await sendPushNotification({
      title: `🛍️ ¡Pedido #${orderId.slice(-4)} Confirmado!`,
      body: `Tu pedido en "${payload.localName}" ha sido recibido por el local (${payload.total.toFixed(2)} €).`,
      localName: payload.localName,
      type: 'order',
    });

    // Schedule progressive notifications sequence
    scheduleOrderProgressNotifications(orderId, payload.localName, (newStatus) => {
      updateOrderStatus(orderId, newStatus);
    });

    return newOrder;
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveStoredNotifications(updated);
      return updated;
    });
  };

  const addNotificationDirect = (notif: PushNotificationItem) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
    saveStoredNotifications([]);
  };

  const updateNotificationSettings = (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...notificationSettings, ...newSettings };
    setNotificationSettings(updated);
    saveNotificationSettings(updated);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        clearStoreCart,
        getStoreCartItems,
        getStoreSubtotal,
        orders,
        activeTrackingOrder,
        setActiveTrackingOrder,
        completedReceiptOrder,
        setCompletedReceiptOrder,
        createOrder,
        updateOrderStatus,
        notifications,
        unreadCount,
        markNotificationsAsRead,
        addNotificationDirect,
        clearNotifications,
        notificationSettings,
        updateNotificationSettings,
        currentAddress,
        currentCoordinates,
        setCurrentLocation,
        setCurrentAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

