import { supabase, getSupabaseConfig } from '../lib/supabase';
import { LocalTenant, Order } from '../types';
import { INITIAL_LOCALES } from '../data/mockLocales';

export interface SupabaseHealth {
  connected: boolean;
  tablesExist: boolean;
  projectUrl: string;
  error?: string;
}

// Check Supabase connection and table availability
export const checkSupabaseHealth = async (): Promise<SupabaseHealth> => {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return {
      connected: false,
      tablesExist: false,
      projectUrl: config.url,
      error: 'Variables de Supabase no configuradas',
    };
  }

  try {
    const { data, error } = await supabase.from('locales').select('id').limit(1);
    if (error) {
      // Table doesn't exist yet, but project is reachable
      return {
        connected: true,
        tablesExist: false,
        projectUrl: config.url,
        error: error.message,
      };
    }

    return {
      connected: true,
      tablesExist: true,
      projectUrl: config.url,
    };
  } catch (err: unknown) {
    return {
      connected: false,
      tablesExist: false,
      projectUrl: config.url,
      error: err instanceof Error ? err.message : 'Error de conexión',
    };
  }
};

// Fetch locales from Supabase with offline & fallback handling
export const fetchLocalesFromSupabase = async (): Promise<{
  locales: LocalTenant[];
  fromSupabase: boolean;
}> => {
  try {
    const { data, error } = await supabase.from('locales').select('*');
    if (error || !data || data.length === 0) {
      return { locales: INITIAL_LOCALES, fromSupabase: false };
    }

    // Map database snake_case columns to TypeScript camelCase interface
    const mappedLocales: LocalTenant[] = data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline || '',
      cuisine: row.cuisine,
      rating: Number(row.rating) || 5.0,
      reviewsCount: row.reviews_count || 0,
      deliveryTime: row.delivery_time || '25-35 min',
      minOrder: Number(row.min_order) || 10,
      deliveryFee: Number(row.delivery_fee) || 1.95,
      freeDeliveryThreshold: Number(row.free_delivery_threshold) || 25,
      bannerImage: row.banner_image || '',
      logoImage: row.logo_image || '',
      address: row.address || '',
      isOpen: row.is_open ?? true,
      openingHours: row.opening_hours || '12:30 - 23:30',
      phone: row.phone || '',
      featuredDish: row.featured_dish || '',
      categories: Array.isArray(row.categories) ? row.categories : [],
      products: INITIAL_LOCALES.find((l) => l.id === row.id)?.products || [],
    }));

    return { locales: mappedLocales, fromSupabase: true };
  } catch {
    return { locales: INITIAL_LOCALES, fromSupabase: false };
  }
};

// Save order to Supabase
export const insertOrderToSupabase = async (order: Order): Promise<boolean> => {
  try {
    const { error } = await supabase.from('orders').insert({
      id: order.id,
      user_id: order.userId || null,
      user_email: order.userEmail || null,
      local_id: order.localId,
      local_name: order.localName,
      customer_name: order.customerName || 'Cliente',
      delivery_type: order.deliveryType,
      address: order.address || null,
      table_number: order.tableNumber || null,
      delivery_time_preference: order.deliveryTimePreference || 'asap',
      scheduled_time: order.scheduledTime || null,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      tip: order.tip,
      total: order.total,
      payment_method: order.paymentMethod,
      pago_movil_details: order.pagoMovilDetails || null,
      coordinates: order.coordinates || null,
      status: order.status,
      items: order.items,
    });

    if (error) {
      console.warn('Could not insert order into Supabase (will remain in offline local storage):', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase order insert failed:', e);
    return false;
  }
};

// Subscribe to Realtime order updates
export const subscribeToOrderRealtime = (
  orderId: string,
  onStatusChange: (newStatus: Order['status']) => void
) => {
  const channel = supabase
    .channel(`order-updates-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        if (payload.new && payload.new.status) {
          onStatusChange(payload.new.status as Order['status']);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
