-- Helper: ambil role user yang sedang login
create or replace function public.auth_user_role()
returns text
language sql
stable
security definer
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

-- Semua user terautentikasi bisa baca
create policy "categories: authenticated read"
  on public.categories for select
  to authenticated
  using (true);

-- Hanya kepala_toko yang bisa tambah/ubah/hapus
create policy "categories: kepala_toko write"
  on public.categories for all
  to authenticated
  using (public.auth_user_role() = 'kepala_toko')
  with check (public.auth_user_role() = 'kepala_toko');

-- ============================================================
-- PRODUCTS
-- ============================================================
create type public.movement_category as enum ('fast_moving', 'slow_moving', 'non_moving');

create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  sku               text not null unique,
  name              text not null,
  category_id       uuid references public.categories(id) on delete set null,
  buy_price         numeric(15,2) not null default 0,
  sell_price        numeric(15,2) not null default 0,
  stock             integer not null default 0,
  safety_stock      integer not null default 0,
  movement_category public.movement_category not null default 'slow_moving',
  description       text,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.products enable row level security;

-- Semua user terautentikasi bisa baca
create policy "products: authenticated read"
  on public.products for select
  to authenticated
  using (true);

-- kepala_toko bisa insert produk baru
create policy "products: kepala_toko insert"
  on public.products for insert
  to authenticated
  with check (public.auth_user_role() = 'kepala_toko');

-- kepala_toko dan kepala_gudang bisa update (kepala_gudang hanya update stock via action)
create policy "products: kepala_toko and gudang update"
  on public.products for update
  to authenticated
  using (public.auth_user_role() in ('kepala_toko', 'kepala_gudang'))
  with check (public.auth_user_role() in ('kepala_toko', 'kepala_gudang'));

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================
-- STOCK MOVEMENTS
-- ============================================================
create table if not exists public.stock_movements (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null check (type in ('in', 'out', 'adjustment')),
  quantity   integer not null,
  note       text,
  created_at timestamptz not null default now()
);

alter table public.stock_movements enable row level security;

-- Semua user terautentikasi bisa baca
create policy "stock_movements: authenticated read"
  on public.stock_movements for select
  to authenticated
  using (true);

-- kepala_toko dan kepala_gudang bisa catat pergerakan stok
create policy "stock_movements: kepala_toko and gudang insert"
  on public.stock_movements for insert
  to authenticated
  with check (public.auth_user_role() in ('kepala_toko', 'kepala_gudang'));
