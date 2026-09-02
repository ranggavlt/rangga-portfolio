create extension if not exists pgcrypto;

do $$ begin
  create type public.project_status as enum ('draft', 'published');
exception when duplicate_object then null;
end $$;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  professional_title text not null,
  hero_eyebrow text not null default '',
  hero_heading text not null default '',
  hero_description text not null default '',
  about_heading text not null default '',
  about_biography text not null default '',
  about_secondary text not null default '',
  location text not null default '',
  availability_text text not null default '',
  email text not null default '',
  portrait_url text not null default '',
  cv_url text not null default '',
  footer_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  year text not null default '',
  category text not null default '',
  short_description text not null default '',
  full_description text not null default '',
  role text not null default '',
  tech text[] not null default '{}',
  live_url text not null default '',
  source_url text not null default '',
  status public.project_status not null default 'draft',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  src text not null,
  alt text not null default '',
  caption text not null default '',
  position smallint not null check (position between 1 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, position)
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(), period text not null default '', company text not null,
  role text not null, description text not null default '', published boolean not null default true,
  display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(), period text not null default '', institution text not null,
  degree text not null, detail text not null default '', display_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(), name text not null, meta text not null default '', detail text not null default '',
  published boolean not null default true, display_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(), label text not null, skills text[] not null default '{}',
  display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(), platform text not null, url text not null,
  display_order integer not null default 0, enabled boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(), sender text not null check (char_length(sender) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320), message text not null check (char_length(message) between 1 and 5000),
  submitted_at timestamptz not null default now(), read boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists projects_status_order_idx on public.projects(status, display_order);
create index if not exists project_images_project_position_idx on public.project_images(project_id, position);
create index if not exists experiences_published_order_idx on public.experiences(published, display_order);
create index if not exists education_order_idx on public.education(display_order);
create index if not exists organizations_published_order_idx on public.organizations(published, display_order);
create index if not exists skills_order_idx on public.skills(display_order);
create index if not exists social_links_enabled_order_idx on public.social_links(enabled, display_order);
create index if not exists contact_messages_submitted_idx on public.contact_messages(submitted_at desc);
create index if not exists contact_messages_unread_idx on public.contact_messages(read, submitted_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

do $$ declare table_name text;
begin
  foreach table_name in array array['admin_users','profiles','projects','project_images','experiences','education','organizations','skills','social_links','contact_messages'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name);
  end loop;
end $$;
