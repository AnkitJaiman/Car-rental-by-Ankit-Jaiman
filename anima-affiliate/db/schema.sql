-- Anima Jewels affiliate portal schema (PostgreSQL 14+). Safe to run more than once.
create extension if not exists pgcrypto;

do $$ begin
  create type user_role as enum ('admin', 'influencer');
exception when duplicate_object then null; end $$;
do $$ begin
  create type influencer_status as enum ('pending', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;
do $$ begin
  create type code_status as enum ('pending_approval', 'active', 'rejected', 'disabled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type commission_status as enum ('pending', 'approved', 'paid', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

-- Global programme rules (one row).
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  default_commission_rate numeric(5,2) not null default 10.00,   -- percent
  default_discount_percent numeric(5,2) not null default 10.00,  -- percent off for followers
  max_discount_percent numeric(5,2) not null default 15.00,      -- hard ceiling admins can set
  code_min_length int not null default 4,
  code_max_length int not null default 20,
  hold_days int not null default 30,                             -- commission stays pending through the return window
  updated_at timestamptz not null default now()
);
insert into settings (id) values (1) on conflict do nothing;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role user_role not null default 'influencer',
  full_name text not null,
  phone text,
  country text,
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists influencers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  status influencer_status not null default 'pending',
  instagram_username text not null,
  instagram_url text not null,
  tiktok_url text,
  youtube_url text,
  total_followers int not null default 0,
  audience_country text,
  content_category text,
  introduction text,
  why_collaborate text,
  commission_rate numeric(5,2) not null,          -- percent, set by admin only
  discount_percent numeric(5,2) not null,         -- percent off with their code, set by admin only
  max_discount_percent numeric(5,2) not null,     -- ceiling for this influencer, set by admin only
  payment_details_enc text,                       -- AES-256-GCM encrypted JSON
  payment_details_hint text,                      -- e.g. "PayPal · a***@gmail.com"
  admin_notes text,
  applied_at timestamptz not null default now(),
  approved_at timestamptz,
  status_changed_at timestamptz not null default now(),
  is_test boolean not null default false
);
create index if not exists influencers_status_idx on influencers(status);

create table if not exists affiliate_codes (
  id uuid primary key default gen_random_uuid(),
  influencer_id uuid not null references influencers(id) on delete cascade,
  code text not null,
  discount_percent numeric(5,2) not null,
  status code_status not null default 'pending_approval',
  shopify_discount_id text,                        -- gid://shopify/DiscountCodeNode/...
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  is_test boolean not null default false
);
create unique index if not exists affiliate_codes_code_uq on affiliate_codes (upper(code));
create index if not exists affiliate_codes_influencer_idx on affiliate_codes(influencer_id);

create table if not exists affiliate_orders (
  id uuid primary key default gen_random_uuid(),
  shopify_order_id bigint not null unique,
  order_name text not null,                        -- e.g. #1042 (no customer data is stored)
  influencer_id uuid not null references influencers(id),
  code_id uuid not null references affiliate_codes(id),
  code_used text not null,
  ordered_at timestamptz not null,
  products_summary text not null,
  currency text not null default 'USD',
  order_subtotal numeric(12,2) not null default 0,  -- product subtotal before discounts
  discount_amount numeric(12,2) not null default 0,
  eligible_amount numeric(12,2) not null default 0, -- product value actually received: excl. shipping, tax, refunds
  commission_rate numeric(5,2) not null,
  commission_amount numeric(12,2) not null default 0,
  status commission_status not null default 'pending',
  status_reason text,
  financial_status text,
  payout_id uuid,
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists affiliate_orders_influencer_idx on affiliate_orders(influencer_id, ordered_at desc);

create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  influencer_id uuid not null references influencers(id),
  amount numeric(12,2) not null,
  method text,
  reference text,
  paid_at timestamptz not null default now(),
  created_by uuid references users(id),
  is_test boolean not null default false
);
do $$ begin
  alter table affiliate_orders add constraint affiliate_orders_payout_fk foreign key (payout_id) references payouts(id);
exception when duplicate_object then null; end $$;

-- Manual corrections by admins (bonus or deduction), always audited.
create table if not exists commission_adjustments (
  id uuid primary key default gen_random_uuid(),
  influencer_id uuid not null references influencers(id),
  amount numeric(12,2) not null,                   -- positive or negative
  reason text not null,
  created_by uuid not null references users(id),
  payout_id uuid references payouts(id),
  created_at timestamptz not null default now()
);

create table if not exists clicks (
  id bigserial primary key,
  code_id uuid not null references affiliate_codes(id) on delete cascade,
  clicked_at timestamptz not null default now()
);
create index if not exists clicks_code_idx on clicks(code_id, clicked_at);

create table if not exists audit_log (
  id bigserial primary key,
  actor_id uuid references users(id),
  actor_label text not null,                      -- 'admin:email', 'influencer:email', 'system:shopify-webhook'
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_entity_idx on audit_log(entity, entity_id);

create table if not exists email_log (
  id bigserial primary key,
  to_email text not null,
  template text not null,
  subject text not null,
  status text not null,                            -- sent | logged (no provider) | failed
  error text,
  created_at timestamptz not null default now()
);

create table if not exists password_resets (
  token_hash text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz
);

create table if not exists webhook_events (
  id text primary key,                             -- X-Shopify-Webhook-Id, for idempotency
  topic text not null,
  received_at timestamptz not null default now()
);
