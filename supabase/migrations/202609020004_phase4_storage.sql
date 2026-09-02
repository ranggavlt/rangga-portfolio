insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-images', 'portfolio-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-documents', 'portfolio-documents', true, 10485760, array['application/pdf'])
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.project_images add column if not exists storage_path text;
alter table public.profiles add column if not exists portrait_storage_path text;
alter table public.profiles add column if not exists cv_storage_path text;

drop policy if exists portfolio_images_admin_insert on storage.objects;
create policy portfolio_images_admin_insert on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio-images' and public.is_admin());
drop policy if exists portfolio_images_admin_update on storage.objects;
create policy portfolio_images_admin_update on storage.objects for update to authenticated
using (bucket_id = 'portfolio-images' and public.is_admin())
with check (bucket_id = 'portfolio-images' and public.is_admin());
drop policy if exists portfolio_images_admin_delete on storage.objects;
create policy portfolio_images_admin_delete on storage.objects for delete to authenticated
using (bucket_id = 'portfolio-images' and public.is_admin());

drop policy if exists portfolio_documents_admin_insert on storage.objects;
create policy portfolio_documents_admin_insert on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio-documents' and public.is_admin());
drop policy if exists portfolio_documents_admin_update on storage.objects;
create policy portfolio_documents_admin_update on storage.objects for update to authenticated
using (bucket_id = 'portfolio-documents' and public.is_admin())
with check (bucket_id = 'portfolio-documents' and public.is_admin());
drop policy if exists portfolio_documents_admin_delete on storage.objects;
create policy portfolio_documents_admin_delete on storage.objects for delete to authenticated
using (bucket_id = 'portfolio-documents' and public.is_admin());

create or replace function public.save_project_with_images(
  p_project_id uuid,
  p_slug text,
  p_title text,
  p_year text,
  p_category text,
  p_short_description text,
  p_full_description text,
  p_role text,
  p_tech text[],
  p_live_url text,
  p_source_url text,
  p_status public.project_status,
  p_display_order integer,
  p_images jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  saved_project_id uuid;
  image_record jsonb;
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  if jsonb_typeof(p_images) is distinct from 'array' then
    raise exception 'Exactly three project images are required';
  end if;
  if jsonb_array_length(p_images) <> 3 then
    raise exception 'Exactly three project images are required';
  end if;
  if (select count(distinct (value->>'position')::integer) from jsonb_array_elements(p_images)) <> 3
     or exists (select 1 from jsonb_array_elements(p_images) where (value->>'position')::integer not between 1 and 3) then
    raise exception 'Project image positions must be exactly 1, 2, and 3';
  end if;

  if p_project_id is null then
    insert into public.projects (slug, title, year, category, short_description, full_description, role, tech, live_url, source_url, status, display_order)
    values (p_slug, p_title, p_year, p_category, p_short_description, p_full_description, p_role, p_tech, p_live_url, p_source_url, p_status, p_display_order)
    returning id into saved_project_id;
  else
    update public.projects set slug = p_slug, title = p_title, year = p_year, category = p_category,
      short_description = p_short_description, full_description = p_full_description, role = p_role, tech = p_tech,
      live_url = p_live_url, source_url = p_source_url, status = p_status, display_order = p_display_order
    where id = p_project_id
    returning id into saved_project_id;
    if saved_project_id is null then raise exception 'Project not found'; end if;
  end if;

  for image_record in select value from jsonb_array_elements(p_images) loop
    insert into public.project_images (project_id, src, storage_path, alt, caption, position)
    values (saved_project_id, image_record->>'src', nullif(image_record->>'storage_path', ''), image_record->>'alt', image_record->>'caption', (image_record->>'position')::smallint)
    on conflict (project_id, position) do update set
      src = excluded.src,
      storage_path = excluded.storage_path,
      alt = excluded.alt,
      caption = excluded.caption;
  end loop;

  return saved_project_id;
end;
$$;

revoke all on function public.save_project_with_images(uuid, text, text, text, text, text, text, text, text[], text, text, public.project_status, integer, jsonb) from public, anon;
grant execute on function public.save_project_with_images(uuid, text, text, text, text, text, text, text, text[], text, text, public.project_status, integer, jsonb) to authenticated;
