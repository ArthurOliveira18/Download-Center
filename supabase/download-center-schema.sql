create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text null,
  role text not null default 'viewer',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_users_role_check check (role in ('admin', 'editor', 'viewer'))
);

create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  marca text,
  modelo text,
  categoria text,
  descricao text,
  conteudo jsonb not null default '{}'::jsonb,
  passos jsonb not null default '[]'::jsonb,
  observacoes jsonb not null default '[]'::jsonb,
  erros_comuns jsonb not null default '[]'::jsonb,
  keywords jsonb not null default '[]'::jsonb,
  type text not null default 'guia',
  active boolean not null default true,
  created_by uuid references public.admin_users(id) on delete set null,
  updated_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guides_type_check check (type in ('guia', 'tutorial'))
);

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  marca text,
  modelo text,
  categoria text,
  descricao text,
  compatibilidade jsonb not null default '[]'::jsonb,
  keywords jsonb not null default '[]'::jsonb,
  destaque boolean not null default false,
  driver_nome text not null,
  driver_versao text,
  download_url text,
  storage_path text,
  file_name text,
  file_size_bytes bigint,
  file_type text,
  guia_vinculado_id uuid constraint drivers_guia_vinculado_id_fkey references public.guides(id) on delete set null,
  created_by uuid references public.admin_users(id) on delete set null,
  updated_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.internal_apps (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text,
  descricao text,
  versao text,
  download_url text,
  storage_path text,
  file_name text,
  file_size_bytes bigint,
  file_type text,
  guia_vinculado_id uuid constraint internal_apps_guia_vinculado_id_fkey references public.guides(id) on delete set null,
  keywords jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_by uuid references public.admin_users(id) on delete set null,
  updated_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.drivers
  add column if not exists file_name text,
  add column if not exists file_size_bytes bigint,
  add column if not exists file_type text;

alter table public.internal_apps
  add column if not exists file_name text,
  add column if not exists file_size_bytes bigint,
  add column if not exists file_type text;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

drop trigger if exists guides_set_updated_at on public.guides;
create trigger guides_set_updated_at
before update on public.guides
for each row execute function public.set_updated_at();

drop trigger if exists drivers_set_updated_at on public.drivers;
create trigger drivers_set_updated_at
before update on public.drivers
for each row execute function public.set_updated_at();

drop trigger if exists internal_apps_set_updated_at on public.internal_apps;
create trigger internal_apps_set_updated_at
before update on public.internal_apps
for each row execute function public.set_updated_at();

create or replace function public.prevent_download_resource_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Drivers e aplicativos internos nao podem ser excluidos.';
end;
$$;

drop trigger if exists drivers_prevent_delete on public.drivers;
create trigger drivers_prevent_delete
before delete on public.drivers
for each row execute function public.prevent_download_resource_delete();

drop trigger if exists internal_apps_prevent_delete on public.internal_apps;
create trigger internal_apps_prevent_delete
before delete on public.internal_apps
for each row execute function public.prevent_download_resource_delete();

create index if not exists admin_users_email_idx on public.admin_users (email);
create index if not exists guides_slug_idx on public.guides (slug);
create index if not exists guides_categoria_idx on public.guides (categoria);
create index if not exists guides_type_idx on public.guides (type);
create index if not exists guides_active_idx on public.guides (active);
create index if not exists guides_keywords_gin_idx on public.guides using gin (keywords);
create index if not exists drivers_categoria_idx on public.drivers (categoria);
create index if not exists drivers_marca_modelo_idx on public.drivers (marca, modelo);
create index if not exists drivers_guia_vinculado_id_idx on public.drivers (guia_vinculado_id);
create index if not exists drivers_keywords_gin_idx on public.drivers using gin (keywords);
create index if not exists drivers_file_size_bytes_idx on public.drivers (file_size_bytes);
create index if not exists internal_apps_categoria_idx on public.internal_apps (categoria);
create index if not exists internal_apps_active_idx on public.internal_apps (active);
create index if not exists internal_apps_guia_vinculado_id_idx on public.internal_apps (guia_vinculado_id);
create index if not exists internal_apps_keywords_gin_idx on public.internal_apps using gin (keywords);
create index if not exists internal_apps_file_size_bytes_idx on public.internal_apps (file_size_bytes);

create or replace view public.download_center_drivers_view
with (security_invoker = true)
as
select
  d.*,
  g.titulo as guia_titulo,
  g.slug as guia_slug,
  g.type as guia_type
from public.drivers d
left join public.guides g on g.id = d.guia_vinculado_id;

create or replace view public.download_center_internal_apps_view
with (security_invoker = true)
as
select
  a.*,
  g.titulo as guia_titulo,
  g.slug as guia_slug,
  g.type as guia_type
from public.internal_apps a
left join public.guides g on g.id = a.guia_vinculado_id;

create or replace view public.download_center_guides_view
with (security_invoker = true)
as
select *
from public.guides
where active = true;

alter table public.admin_users enable row level security;
alter table public.guides enable row level security;
alter table public.drivers enable row level security;
alter table public.internal_apps enable row level security;

drop policy if exists "Public can read active guides" on public.guides;
create policy "Public can read active guides"
on public.guides
for select
to anon, authenticated
using (active = true);

drop policy if exists "Public can read drivers" on public.drivers;
create policy "Public can read drivers"
on public.drivers
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read active internal apps" on public.internal_apps;
create policy "Public can read active internal apps"
on public.internal_apps
for select
to anon, authenticated
using (active = true);

grant usage on schema public to anon, authenticated;
grant select on public.guides to anon, authenticated;
grant select on public.drivers to anon, authenticated;
grant select on public.internal_apps to anon, authenticated;
grant select on public.download_center_drivers_view to anon, authenticated;
grant select on public.download_center_internal_apps_view to anon, authenticated;
grant select on public.download_center_guides_view to anon, authenticated;

grant all on public.admin_users to service_role;
grant all on public.guides to service_role;
grant all on public.drivers to service_role;
grant all on public.internal_apps to service_role;
grant select on public.download_center_drivers_view to service_role;
grant select on public.download_center_internal_apps_view to service_role;
grant select on public.download_center_guides_view to service_role;

insert into public.admin_users (name, email, role, active, password_hash)
values ('Admin Takeat', 'admin@takeat.app', 'admin', true, null)
on conflict (email)
do update set
  name = excluded.name,
  role = excluded.role,
  active = excluded.active;

