export type UserRole = 'general' | 'propietario' | 'admin';

export interface AppUserProfile {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  assignedLocalId?: string;
  createdAt: string;
}

export interface ProductExtra {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  spicy?: boolean;
  extras?: ProductExtra[];
}

export interface LocalTenant {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  cuisine: string;
  rating?: number;
  reviewsCount?: number;
  deliveryTime: string;
  minOrder: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  bannerImage: string;
  logoImage: string;
  address: string;
  isOpen: boolean;
  openingHours: string;
  phone: string;
  categories: string[];
  products: Product[];
}

export interface CartItem {
  id: string; // unique item uuid (product.id + extras)
  productId: string;
  localId: string;
  localName: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedExtras: ProductExtra[];
  specialInstructions?: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  label?: string;
}

export interface PagoMovilDetails {
  civ: string; // C.I. o RIF
  phone: string; // Teléfono
  bank: string; // Banco
  referenceCode: string; // Código de referencia
}

export interface Order {
  id: string;
  createdAt: string;
  userId?: string;
  userEmail?: string;
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
  status: 'recibido' | 'en_cocina' | 'en_camino' | 'entregado';
  estimatedMinutes?: number;
}

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  localName?: string;
  type: 'order' | 'promo' | 'reminder' | 'system';
  actionUrl?: string;
  offlineQueued?: boolean;
}

export interface NotificationSettings {
  promotions: boolean;
  orderUpdates: boolean;
  reminders: boolean;
  soundAndHaptics: boolean;
}
