-- =========================================================================
-- CartaLocales PWA - Supabase Database Schema & Initial Data
-- Project: https://rpvpybjuwwzxlonjcalx.supabase.co
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Locales (Tiendas / Restaurantes Multitenant)
create table if not exists public.locales (
  id text primary key,
  slug text unique not null,
  name text not null,
  tagline text,
  cuisine text not null,
  rating numeric(3, 1) default 5.0,
  reviews_count integer default 0,
  delivery_time text default '25-35 min',
  min_order numeric(6, 2) default 10.00,
  delivery_fee numeric(6, 2) default 1.95,
  free_delivery_threshold numeric(6, 2) default 25.00,
  banner_image text,
  logo_image text,
  address text,
  is_open boolean default true,
  opening_hours text default '12:30 - 23:30',
  phone text,
  featured_dish text,
  categories jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Products (Platos y Cartas)
create table if not exists public.products (
  id text primary key,
  local_id text references public.locales(id) on delete cascade,
  name text not null,
  description text,
  price numeric(6, 2) not null,
  image text,
  category text not null,
  popular boolean default false,
  vegan boolean default false,
  gluten_free boolean default false,
  spicy boolean default false,
  extras jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Orders (Pedidos en Tiempo Real con Usuario Supabase)
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  local_id text references public.locales(id) on delete set null,
  local_name text not null,
  customer_name text default 'Cliente',
  delivery_type text not null check (delivery_type in ('delivery', 'pickup', 'table')),
  address text,
  coordinates jsonb,
  table_number text,
  delivery_time_preference text default 'asap',
  scheduled_time text,
  subtotal numeric(8, 2) not null,
  delivery_fee numeric(6, 2) default 0.00,
  tip numeric(6, 2) default 0.00,
  total numeric(8, 2) not null,
  payment_method text not null,
  pago_movil_details jsonb,
  status text not null default 'recibido' check (status in ('recibido', 'en_cocina', 'en_camino', 'entregado')),
  items jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. User Profiles & Roles (general, propietario, admin)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  first_name text,
  last_name text,
  phone text,
  role text default 'general' check (role in ('general', 'propietario', 'admin')),
  assigned_local_id text references public.locales(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable Row Level Security (RLS)
alter table public.locales enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.profiles enable row level security;

-- 6. RLS Policies
create policy "Public can view profiles" on public.profiles for select using (true);
create policy "Users and admins can insert profiles" on public.profiles for insert with check (true);
create policy "Users and admins can update profiles" on public.profiles for update using (true);

-- 5. RLS Policies
-- Allow anyone to read locales and products
create policy "Public can view locales" on public.locales for select using (true);
create policy "Public can view products" on public.products for select using (true);

-- Allow anyone to create orders and view their created orders
create policy "Public can insert orders" on public.orders for insert with check (true);
create policy "Public can view orders" on public.orders for select using (true);
create policy "Public can update order status" on public.orders for update using (true);

-- 6. Enable Realtime on Orders
alter publication supabase_realtime add table public.orders;

-- 7. Seed Initial Data: Locales
insert into public.locales (
  id, slug, name, tagline, cuisine, rating, reviews_count, delivery_time, min_order, delivery_fee, free_delivery_threshold, banner_image, logo_image, address, is_open, opening_hours, phone, featured_dish, categories
) values
(
  'loc-1',
  'bella-napoli',
  'Trattoria Bella Napoli',
  'Auténtica pizza al horno de leña y pasta fresca napolitana',
  'Italiana & Pizzería',
  4.8,
  342,
  '25-35 min',
  12.00,
  1.95,
  25.00,
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=200&auto=format&fit=crop&q=80',
  'Calle Mayor 42, Centro',
  true,
  '12:30 - 23:45',
  '+34 912 345 671',
  'Pizza Margherita Verace DOC',
  '["Pizzas Leña", "Pastas Frescas", "Antipasti", "Postres Caseros", "Bebidas"]'::jsonb
),
(
  'loc-2',
  'craft-burger-lab',
  'Craft Burger Lab',
  'Smash burgers gourmet con carne madurada y brioche artesanal',
  'Smash Burgers & Street Food',
  4.9,
  520,
  '20-30 min',
  10.00,
  1.50,
  20.00,
  'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
  'Avenida de la Libertad 18',
  true,
  '13:00 - 00:00',
  '+34 912 889 123',
  'The Double Truffle Smash',
  '["Smash Burgers", "Sides & Patatas", "Pollo Crujiente", "Batidos", "Bebidas"]'::jsonb
),
(
  'loc-3',
  'sakura-sushi',
  'Sakura Sushi & Ramen Bar',
  'Cocina nipona auténtica, pescado fresco diario y ramen de caldo lento',
  'Japonesa & Sushi',
  4.7,
  289,
  '30-40 min',
  15.00,
  2.20,
  30.00,
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=200&auto=format&fit=crop&q=80',
  'Paseo de las Delicias 7',
  true,
  '13:00 - 23:30',
  '+34 913 221 445',
  'Tonkotsu Ramen Especial 18h',
  '["Ramen & Sopas", "Uramakis & Rolls", "Nigiris & Sashimi", "Gyozas", "Bebidas"]'::jsonb
),
(
  'loc-4',
  'cantina-chingona',
  'La Cantina Chingona',
  'Taquería tradicional mexicana con tortillas de maíz nixtamalizado hechas a mano',
  'Mexicana Tradicional',
  4.8,
  410,
  '20-35 min',
  12.00,
  1.80,
  22.00,
  'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&auto=format&fit=crop&q=80',
  'Plaza del Sol 5',
  true,
  '13:30 - 00:30',
  '+34 915 678 901',
  'Tacos al Pastor con Piña Asada',
  '["Tacos", "Quesadillas & Burritos", "Guacamoles & Nachos", "Postres & Bebidas"]'::jsonb
),
(
  'loc-5',
  'aroma-bakery',
  'Aroma Specialty Bakery & Café',
  'Masa madre ecológica, repostería artesana y café de especialidad tostado local',
  'Cafetería & Panadería Artesanal',
  4.9,
  380,
  '15-25 min',
  8.00,
  1.20,
  18.00,
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
  'Calle San Bernardo 12',
  true,
  '08:00 - 20:30',
  '+34 914 112 334',
  'Croissant Bicolor Pistacho de Bronte',
  '["Bollería Artesana", "Tostas de Masa Madre", "Café de Especialidad", "Smoothies & Bowls"]'::jsonb
)
on conflict (id) do nothing;
