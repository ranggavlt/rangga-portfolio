-- Apply after the Phase 5 migration and before deploying the matching frontend.
alter table public.profiles add column if not exists whatsapp_number text not null default '';
alter table public.profiles add column if not exists whatsapp_message text not null default '';
alter table public.profiles drop constraint if exists profiles_whatsapp_number_format;
alter table public.profiles add constraint profiles_whatsapp_number_format
  check (whatsapp_number = '' or whatsapp_number ~ '^628[0-9]{7,12}$');
alter table public.profiles drop constraint if exists profiles_whatsapp_message_length;
alter table public.profiles add constraint profiles_whatsapp_message_length
  check (char_length(whatsapp_message) <= 300);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  issuer text not null check (length(trim(issuer)) > 0),
  issued_on date not null,
  verification_url text not null default '' check (verification_url = '' or verification_url ~* '^https?://[^[:space:]]+$'),
  credential_id text not null default '',
  proof_url text not null default '' check (proof_url = '' or proof_url ~* '^https?://[^[:space:]]+$'),
  proof_storage_path text,
  published boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint certificates_published_has_proof check (not published or proof_url <> '')
);
create index if not exists certificates_published_order_idx on public.certificates(published, display_order);
drop trigger if exists set_updated_at on public.certificates;
create trigger set_updated_at before update on public.certificates
  for each row execute function public.set_updated_at();

alter table public.certificates enable row level security;
revoke all on public.certificates from anon, authenticated;
grant select on public.certificates to anon, authenticated;
grant insert, update, delete on public.certificates to authenticated;
drop policy if exists certificates_public_read on public.certificates;
create policy certificates_public_read on public.certificates for select to anon, authenticated using (published);
drop policy if exists certificates_admin_manage on public.certificates;
create policy certificates_admin_manage on public.certificates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- The existing document bucket and admin-only Storage policies also cover certificates.
update storage.buckets set allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
where id = 'portfolio-documents';

create or replace function public.reorder_certificates(p_ordered_ids uuid[])
returns void language plpgsql security invoker set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  if p_ordered_ids is null or cardinality(p_ordered_ids) = 0 then
    raise exception 'An ordered item list is required';
  end if;
  if cardinality(p_ordered_ids) <> (select count(distinct ordered.item_id) from unnest(p_ordered_ids) as ordered(item_id)) then
    raise exception 'Ordered item IDs must be unique';
  end if;
  if cardinality(p_ordered_ids) <> (select count(*) from public.certificates)
    or exists (select 1 from unnest(p_ordered_ids) as ordered(item_id) where not exists (select 1 from public.certificates where certificates.id = ordered.item_id)) then
    raise exception 'Certificate list changed; refresh and try again';
  end if;
  update public.certificates as item set display_order = ordering.position::integer
  from unnest(p_ordered_ids) with ordinality as ordering(id, position)
  where item.id = ordering.id;
end;
$$;
revoke all on function public.reorder_certificates(uuid[]) from public, anon;
grant execute on function public.reorder_certificates(uuid[]) to authenticated;
