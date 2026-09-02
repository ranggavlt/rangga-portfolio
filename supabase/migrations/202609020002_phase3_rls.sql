create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()) $$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.experiences enable row level security;
alter table public.education enable row level security;
alter table public.organizations enable row level security;
alter table public.skills enable row level security;
alter table public.social_links enable row level security;
alter table public.contact_messages enable row level security;

revoke all on public.admin_users, public.profiles, public.projects, public.project_images, public.experiences, public.education, public.organizations, public.skills, public.social_links, public.contact_messages from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.projects, public.project_images, public.experiences, public.education, public.organizations, public.skills, public.social_links to anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.projects, public.project_images, public.experiences, public.education, public.organizations, public.skills, public.social_links, public.contact_messages to authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists admin_users_read_self on public.admin_users;
create policy admin_users_read_self on public.admin_users for select to authenticated using (user_id = auth.uid());

drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles for select to anon, authenticated using (true);
drop policy if exists profiles_admin_manage on public.profiles;
create policy profiles_admin_manage on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects for select to anon, authenticated using (status = 'published');
drop policy if exists projects_admin_manage on public.projects;
create policy projects_admin_manage on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists project_images_public_read on public.project_images;
create policy project_images_public_read on public.project_images for select to anon, authenticated using (
  exists (select 1 from public.projects where projects.id = project_images.project_id and projects.status = 'published')
);
drop policy if exists project_images_admin_manage on public.project_images;
create policy project_images_admin_manage on public.project_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists experiences_public_read on public.experiences;
create policy experiences_public_read on public.experiences for select to anon, authenticated using (published);
drop policy if exists experiences_admin_manage on public.experiences;
create policy experiences_admin_manage on public.experiences for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists education_public_read on public.education;
create policy education_public_read on public.education for select to anon, authenticated using (true);
drop policy if exists education_admin_manage on public.education;
create policy education_admin_manage on public.education for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists organizations_public_read on public.organizations;
create policy organizations_public_read on public.organizations for select to anon, authenticated using (published);
drop policy if exists organizations_admin_manage on public.organizations;
create policy organizations_admin_manage on public.organizations for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists skills_public_read on public.skills;
create policy skills_public_read on public.skills for select to anon, authenticated using (true);
drop policy if exists skills_admin_manage on public.skills;
create policy skills_admin_manage on public.skills for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists social_links_public_read on public.social_links;
create policy social_links_public_read on public.social_links for select to anon, authenticated using (enabled);
drop policy if exists social_links_admin_manage on public.social_links;
create policy social_links_admin_manage on public.social_links for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists contact_messages_public_insert on public.contact_messages;
create policy contact_messages_public_insert on public.contact_messages for insert to anon, authenticated with check (
  read = false and char_length(sender) between 1 and 200 and char_length(email) between 3 and 320 and char_length(message) between 1 and 5000
);
drop policy if exists contact_messages_admin_manage on public.contact_messages;
create policy contact_messages_admin_manage on public.contact_messages for all to authenticated using (public.is_admin()) with check (public.is_admin());
