-- ============================================================
-- SCISSORHAND BARBERSHOP TRACKER — DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- BARBERS TABLE
-- ============================================================
create table if not exists barbers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  active boolean not null default true,
  cash_commission_pct numeric(5,2) not null default 50.00,
  tap_commission_pct  numeric(5,2) not null default 50.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- SERVICES TABLE
-- ============================================================
create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric(10,2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- TRANSACTIONS TABLE
-- ============================================================
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  barber_id uuid not null references barbers(id) on delete restrict,
  service_id uuid not null references services(id) on delete restrict,
  payment_method text not null check (payment_method in ('cash', 'tap')),
  base_price numeric(10,2) not null,
  hst_amount numeric(10,2) not null default 0,
  total_charged numeric(10,2) not null,
  tip_amount numeric(10,2) not null default 0,
  commission_pct numeric(5,2) not null,
  commission_payout numeric(10,2) not null,
  net_revenue numeric(10,2) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for fast reporting queries
create index if not exists idx_transactions_barber_id on transactions(barber_id);
create index if not exists idx_transactions_created_at on transactions(created_at);
create index if not exists idx_transactions_payment_method on transactions(payment_method);
create index if not exists idx_transactions_barber_date on transactions(barber_id, created_at);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_barbers_updated_at
  before update on barbers
  for each row execute function update_updated_at();

create trigger trg_services_updated_at
  before update on services
  for each row execute function update_updated_at();

create trigger trg_transactions_updated_at
  before update on transactions
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (admin-only via service role)
-- ============================================================
alter table barbers      enable row level security;
alter table services     enable row level security;
alter table transactions enable row level security;

-- Allow all operations for authenticated users (admin only via Supabase Auth)
create policy "authenticated_all" on barbers
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on services
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on transactions
  for all using (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA — Default Services
-- ============================================================
insert into services (name, price) values
  ('Haircut',               30.00),
  ('Haircut + Beard',       45.00),
  ('Beard Trim',            20.00),
  ('Skin Fade',             35.00),
  ('Skin Fade + Beard',     50.00),
  ('Kids Haircut',          25.00),
  ('Hot Towel Shave',       40.00),
  ('Shape Up / Line Up',    20.00),
  ('Colour Treatment',      60.00),
  ('VIP Full Package',      90.00)
on conflict do nothing;

-- ============================================================
-- SEED DATA — Default Barbers
-- ============================================================
insert into barbers (name, cash_commission_pct, tap_commission_pct) values
  ('Marcus',  60, 55),
  ('Jordan',  60, 55),
  ('Devon',   60, 55),
  ('Tyler',   55, 50),
  ('Karim',   55, 50),
  ('Andre',   55, 50),
  ('Nate',    50, 45),
  ('Zach',    50, 45),
  ('Elijah',  50, 45),
  ('Sean',    50, 45)
on conflict do nothing;
