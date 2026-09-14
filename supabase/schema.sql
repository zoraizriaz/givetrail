-- GiveTrail database schema
-- Mirrors src/lib/types.ts almost directly. Money is always bigint minor-units + currency.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('donor','corporate','org_member','admin');
create type currency_code as enum ('USD','GBP','EUR','CAD','AED','PKR','AUD');
create type org_category as enum ('health','education','emergency_relief','children','poverty','food_security','disability','environment','other');
create type org_verification_status as enum ('not_submitted','under_review','additional_info_required','verified','suspended','rejected');
create type campaign_status as enum ('draft','active','completed','paused');
create type payment_method as enum ('card','bank_transfer','ach','international_wire','corporate_transfer');
create type payment_status as enum ('initiated','processing','confirmed','funds_transferred','available_to_ngo','refunded','failed');
create type expense_category as enum ('medical_supplies','medication','food_assistance','transportation','training','monitoring_evaluation','community_outreach','operations','personnel','other');
create type verification_level as enum ('declared','documented','financially_verified','program_verified','independently_verified');
create type evidence_type as enum ('receipt','invoice','supporting_document','program_photo','delivery_evidence');
create type doc_type as enum ('registration_certificate','tax_certificate','proof_of_authorization','annual_report','other');
create type doc_status as enum ('pending','accepted','rejected');
create type grant_status as enum ('pending_transfer','transferred','active','closed');
create type source_type as enum ('donation','grant');
create type designation_type as enum ('campaign','general_fund');

-- ---------------------------------------------------------------------------
-- Core identity
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'donor',
  avatar_url text,
  country_code text not null default 'US',
  account_activated boolean not null default true,
  created_at timestamptz not null default now()
);

create table donor_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  preferred_currency currency_code not null default 'USD',
  causes_followed org_category[] not null default '{}'
);

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  country_code text not null,
  authorized_representative_user_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table corporate_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  company_id uuid not null references companies(id)
);

-- ---------------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------------
create table organizations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  logo_url text,
  cover_image_url text,
  category org_category[] not null default '{}',
  operating_country text not null,
  legal_entity_country text not null,
  base_currency currency_code not null,
  payout_currency currency_code not null,
  registration_number text not null,
  tax_number text,
  website text,
  address text,
  representative_name text not null,
  representative_title text not null,
  representative_email text not null,
  representative_phone text,
  description text,
  mission text,
  operating_regions text[] not null default '{}',
  verification_status org_verification_status not null default 'not_submitted',
  verified_since timestamptz,
  allocation_policy_program_pct numeric not null default 0.8,
  allocation_policy_operations_pct numeric not null default 0.12,
  allocation_policy_fundraising_pct numeric not null default 0.05,
  allocation_policy_processing_pct numeric not null default 0.03,
  documentation_completeness_pct numeric not null default 0,
  created_at timestamptz not null default now()
);

create table organization_members (
  user_id uuid references profiles(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  title text,
  is_primary_contact boolean not null default false,
  primary key (user_id, organization_id)
);

create table organization_verifications (
  organization_id uuid primary key references organizations(id) on delete cascade,
  status org_verification_status not null default 'not_submitted',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_note text
);

create table verification_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  type doc_type not null,
  file_name text not null,
  storage_path text,
  uploaded_at timestamptz not null default now(),
  status doc_status not null default 'pending'
);

-- ---------------------------------------------------------------------------
-- Campaigns
-- ---------------------------------------------------------------------------
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  image_url text,
  category org_category not null,
  location text,
  currency currency_code not null,
  funding_goal bigint not null default 0,
  amount_raised bigint not null default 0,
  amount_utilized bigint not null default 0,
  start_date timestamptz not null default now(),
  end_date timestamptz,
  status campaign_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table campaign_updates (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  title text not null,
  body text not null,
  image_url text,
  posted_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Money: donations, payments, grants
-- ---------------------------------------------------------------------------
create table donations (
  id uuid primary key default gen_random_uuid(),
  donor_user_id uuid references profiles(id),
  organization_id uuid not null references organizations(id),
  designation_type designation_type not null,
  campaign_id uuid references campaigns(id),
  gross_amount bigint not null,
  currency currency_code not null,
  exchange_rate numeric,
  platform_fee_pct numeric not null default 0.01,
  platform_fee bigint not null,
  payment_processing_fee bigint not null,
  amount_received_by_org bigint not null,
  net_proceeds bigint not null,
  is_anonymous boolean not null default false,
  donor_name text,
  donor_email text,
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references donations(id) on delete cascade,
  method payment_method not null,
  status payment_status not null default 'initiated',
  processing_fee bigint not null default 0,
  history jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table grants (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  organization_id uuid not null references organizations(id),
  campaign_id uuid references campaigns(id),
  title text not null,
  currency currency_code not null,
  amount bigint not null,
  amount_transferred bigint not null default 0,
  amount_utilized bigint not null default 0,
  amount_verified bigint not null default 0,
  status grant_status not null default 'pending_transfer',
  created_at timestamptz not null default now()
);

create table grant_budget_lines (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid references grants(id) on delete cascade,
  label text not null,
  amount bigint not null
);

-- ---------------------------------------------------------------------------
-- Expenses, evidence, allocations
-- ---------------------------------------------------------------------------
create table expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  campaign_id uuid references campaigns(id),
  title text not null,
  vendor text,
  expense_date date not null default current_date,
  amount bigint not null,
  currency currency_code not null,
  category expense_category not null,
  description text,
  donor_safe_description text not null,
  payment_method text,
  reference_number text,
  internal_notes text,
  verification_level verification_level not null default 'declared',
  amount_allocated bigint not null default 0,
  beneficiary_protected boolean not null default false,
  created_at timestamptz not null default now()
);

create table evidence_documents (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid references expenses(id) on delete cascade,
  type evidence_type not null,
  file_name text not null,
  storage_path text,
  uploaded_at timestamptz not null default now(),
  donor_visible boolean not null default true,
  redacted boolean not null default false
);

create table allocations (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  source_type source_type not null,
  source_id uuid not null,
  amount bigint not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Verification events, notifications, audit log, platform settings
-- ---------------------------------------------------------------------------
create table verification_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  from_level text,
  to_level text not null,
  actor_user_id uuid references profiles(id),
  note text,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  message text not null,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table platform_settings (
  id boolean primary key default true,
  platform_fee_pct numeric not null default 0.01,
  supported_currencies currency_code[] not null default '{USD,GBP,EUR,CAD,AED,PKR,AUD}',
  constraint singleton check (id)
);
insert into platform_settings (id) values (true);

-- ---------------------------------------------------------------------------
-- Helper functions for RLS
-- ---------------------------------------------------------------------------
create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function is_org_member(org_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists(
    select 1 from organization_members
    where organization_id = org_id and user_id = auth.uid()
  );
$$;

create or replace function my_organization_id() returns uuid
language sql security definer stable set search_path = public as $$
  select organization_id from organization_members where user_id = auth.uid() limit 1;
$$;

create or replace function my_company_id() returns uuid
language sql security definer stable set search_path = public as $$
  select company_id from corporate_profiles where user_id = auth.uid() limit 1;
$$;

-- Cross-table checks used inside RLS policies must be security definer,
-- otherwise the referenced table's own RLS (evaluated for the *calling*
-- role) can silently block the subquery for anonymous/public readers.
create or replace function is_org_verified(org_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists(select 1 from organizations where id = org_id and verification_status = 'verified');
$$;

create or replace function expense_org_verified(exp_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists(
    select 1 from expenses e join organizations o on o.id = e.organization_id
    where e.id = exp_id and o.verification_status = 'verified'
  );
$$;

-- new-user hook: create a profiles row whenever a Supabase auth user is created.
-- security definer functions do NOT inherit the caller's search_path, and the
-- auth.users insert is performed by supabase_auth_admin (search_path = auth
-- only) — without this, the unqualified `user_role` enum cast below fails
-- and rolls back the entire signup.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  insert into public.profiles (id, full_name, email, role, country_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'donor'),
    coalesce(new.raw_user_meta_data->>'country_code', 'US')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
