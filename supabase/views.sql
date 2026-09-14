-- Public-safe views for anonymous/donor browsing. These are owned by the
-- postgres role (created via the SQL editor), so they run with that
-- ownership and are NOT subject to the caller's RLS on the underlying
-- table — the view's own WHERE clause and column list are what make it
-- safe to expose to `anon`. Internal/authenticated flows (org dashboard,
-- admin) should keep querying the base tables directly, which have their
-- own stricter RLS.

create view public_organizations as
select
  id, slug, name, logo_url, cover_image_url, category, operating_country, legal_entity_country,
  base_currency, payout_currency, registration_number, website, description, mission,
  operating_regions, verification_status, verified_since,
  allocation_policy_program_pct, allocation_policy_operations_pct,
  allocation_policy_fundraising_pct, allocation_policy_processing_pct,
  documentation_completeness_pct, created_at
from organizations
where verification_status = 'verified';

grant select on public_organizations to anon, authenticated;

create view public_expenses as
select
  id, organization_id, campaign_id, expense_date, amount, currency, category,
  donor_safe_description, verification_level, amount_allocated, beneficiary_protected, created_at
from expenses
where verification_level <> 'declared'
  and exists (
    select 1 from organizations o
    where o.id = expenses.organization_id and o.verification_status = 'verified'
  );

grant select on public_expenses to anon, authenticated;
