-- Row Level Security policies for GiveTrail.
-- Financial writes (donations, payments, allocations) are intentionally NOT
-- grantable to `anon`/`authenticated` here — they're written server-side via
-- the service-role client inside trusted Server Actions, so fee math and
-- allocation math can't be tampered with from the browser. Everything else
-- follows a straightforward donor / org_member / admin model.

alter table profiles enable row level security;
alter table donor_profiles enable row level security;
alter table companies enable row level security;
alter table corporate_profiles enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table organization_verifications enable row level security;
alter table verification_documents enable row level security;
alter table campaigns enable row level security;
alter table campaign_updates enable row level security;
alter table donations enable row level security;
alter table payments enable row level security;
alter table grants enable row level security;
alter table grant_budget_lines enable row level security;
alter table expenses enable row level security;
alter table evidence_documents enable row level security;
alter table allocations enable row level security;
alter table verification_events enable row level security;
alter table notifications enable row level security;
alter table audit_log enable row level security;
alter table platform_settings enable row level security;

-- profiles
create policy "read own profile" on profiles for select using (id = auth.uid() or is_admin());
create policy "update own profile" on profiles for update using (id = auth.uid() or is_admin());

-- donor_profiles
create policy "own donor profile" on donor_profiles for all using (user_id = auth.uid() or is_admin());

-- companies
create policy "read companies" on companies for select using (auth.role() = 'authenticated' or is_admin());
create policy "manage own company" on companies for update using (authorized_representative_user_id = auth.uid() or is_admin());
create policy "create company" on companies for insert with check (auth.role() = 'authenticated');

-- corporate_profiles
create policy "own corporate profile" on corporate_profiles for all using (user_id = auth.uid() or is_admin());

-- organizations
-- Full rows (incl. representative email/phone, tax number, address) are only
-- for the org's own members and admins. Public browsing reads the
-- `public_organizations` view instead (see views.sql), which excludes those.
create policy "org and admin read full org" on organizations for select
  using (is_org_member(id) or is_admin());
create policy "create org" on organizations for insert with check (auth.role() = 'authenticated');
create policy "update own org" on organizations for update using (is_org_member(id) or is_admin());

-- organization_members
create policy "read own memberships" on organization_members for select
  using (user_id = auth.uid() or is_org_member(organization_id) or is_admin());
create policy "join org as self or invite" on organization_members for insert
  with check (user_id = auth.uid() or is_org_member(organization_id) or is_admin());
create policy "manage org membership" on organization_members for update
  using (is_org_member(organization_id) or is_admin());
create policy "remove org membership" on organization_members for delete
  using (is_org_member(organization_id) or is_admin());

-- organization_verifications
create policy "org sees own verification" on organization_verifications for select
  using (is_org_member(organization_id) or is_admin());
create policy "org submits verification" on organization_verifications for insert
  with check (is_org_member(organization_id) or is_admin());
-- Status transitions (approve/reject/request info) are an admin-only action —
-- an org_member re-submitting just uploads new verification_documents rows
-- (allowed below) rather than setting their own status to "verified".
create policy "admin reviews verification" on organization_verifications for update using (is_admin());

-- verification_documents
create policy "org sees own documents" on verification_documents for select
  using (is_org_member(organization_id) or is_admin());
create policy "org uploads documents" on verification_documents for insert
  with check (is_org_member(organization_id) or is_admin());
create policy "admin reviews documents" on verification_documents for update using (is_admin());
create policy "org deletes own documents" on verification_documents for delete
  using (is_org_member(organization_id) or is_admin());

-- campaigns
create policy "read active campaigns of verified orgs" on campaigns for select
  using (
    is_org_member(organization_id) or is_admin()
    or (status = 'active' and is_org_verified(organization_id))
  );
create policy "org manages own campaigns" on campaigns for insert with check (is_org_member(organization_id) or is_admin());
create policy "org updates own campaigns" on campaigns for update using (is_org_member(organization_id) or is_admin());

-- campaign_updates
create policy "read campaign updates" on campaign_updates for select using (true);
create policy "org posts campaign updates" on campaign_updates for insert
  with check (exists (select 1 from campaigns c where c.id = campaign_id and (is_org_member(c.organization_id) or is_admin())));

-- donations (writes happen server-side with the service role key)
create policy "donor and org see relevant donations" on donations for select
  using (donor_user_id = auth.uid() or is_org_member(organization_id) or is_admin());

-- payments
create policy "see payments for visible donations" on payments for select
  using (exists (
    select 1 from donations d where d.id = donation_id
    and (d.donor_user_id = auth.uid() or is_org_member(d.organization_id) or is_admin())
  ));

-- grants
create policy "company and org see relevant grants" on grants for select
  using (company_id = my_company_id() or is_org_member(organization_id) or is_admin());
create policy "admin manages grants" on grants for insert with check (is_admin());
create policy "admin updates grants" on grants for update using (is_admin());

-- grant_budget_lines
create policy "see budget lines of visible grants" on grant_budget_lines for select
  using (exists (
    select 1 from grants g where g.id = grant_id
    and (g.company_id = my_company_id() or is_org_member(g.organization_id) or is_admin())
  ));
create policy "admin manages budget lines" on grant_budget_lines for insert with check (is_admin());

-- expenses (full row — internal fields included; donor-safe public access is via the public_expenses view)
create policy "org sees own expenses" on expenses for select using (is_org_member(organization_id) or is_admin());
create policy "org creates expenses" on expenses for insert with check (is_org_member(organization_id) or is_admin());
create policy "org updates expenses" on expenses for update using (is_org_member(organization_id) or is_admin());

-- evidence_documents
create policy "org sees own evidence" on evidence_documents for select
  using (exists (select 1 from expenses e where e.id = expense_id and (is_org_member(e.organization_id) or is_admin())));
create policy "public sees donor-visible evidence" on evidence_documents for select
  using (donor_visible = true and expense_org_verified(expense_id));
create policy "org manages own evidence" on evidence_documents for insert
  with check (exists (select 1 from expenses e where e.id = expense_id and (is_org_member(e.organization_id) or is_admin())));

-- allocations (writes happen server-side with the service role key)
create policy "org and donor see relevant allocations" on allocations for select
  using (
    exists (select 1 from expenses e where e.id = expense_id and (is_org_member(e.organization_id) or is_admin()))
    or (source_type = 'donation' and exists (select 1 from donations d where d.id = source_id and d.donor_user_id = auth.uid()))
  );

-- verification_events (polymorphic entity_type/entity_id — writes go through
-- the service-role client from trusted server code, which bypasses RLS;
-- reads are admin-only here to avoid leaking another org's review trail)
create policy "admin reads verification events" on verification_events for select using (is_admin());

-- notifications
create policy "own notifications" on notifications for select using (user_id = auth.uid() or is_admin());
create policy "mark own notifications read" on notifications for update using (user_id = auth.uid());

-- audit_log
create policy "admin reads audit log" on audit_log for select using (is_admin());

-- platform_settings
create policy "anyone reads platform settings" on platform_settings for select using (true);
create policy "admin updates platform settings" on platform_settings for update using (is_admin());
