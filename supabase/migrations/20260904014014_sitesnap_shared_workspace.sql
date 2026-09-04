create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'Site Manager',
  created_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  code text not null,
  client_name text not null default '',
  address text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  progress integer not null default 0 check (progress between 0 and 100),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.photo_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_path text not null,
  captured_at timestamptz not null default now(),
  captured_by uuid not null references auth.users(id) on delete restrict,
  location text not null default '',
  tags text[] not null default '{}',
  note text not null default '',
  stage text check (stage in ('before', 'after')),
  paired_photo_id uuid,
  created_at timestamptz not null default now()
);

alter table public.photo_records
  add constraint paired_photo_identity unique (id, project_id);

alter table public.photo_records
  add constraint paired_photo_same_project
  foreign key (paired_photo_id, project_id)
  references public.photo_records(id, project_id)
  on delete restrict;

create index workspace_members_user_id_idx on public.workspace_members(user_id);
create index projects_workspace_id_idx on public.projects(workspace_id);
create index photo_records_project_id_idx on public.photo_records(project_id, captured_at desc);

create or replace function public.set_projects_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_projects_updated_at() from public;

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_projects_updated_at();

create or replace function public.clear_photo_pair_reference()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.photo_records
  set paired_photo_id = null
  where paired_photo_id = old.id;
  return old;
end;
$$;

revoke all on function public.clear_photo_pair_reference() from public;

create trigger photo_records_clear_pair_reference
before delete on public.photo_records
for each row
execute function public.clear_photo_pair_reference();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.photo_records enable row level security;

-- Profiles are not workspace-owned, so a user may access only their own profile.
create policy "authenticated users can select their profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "authenticated users can insert their profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "authenticated users can update their profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "authenticated users can delete their profile"
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = id);

-- Workspace creation is the one bootstrap path before the owner membership exists.
create policy "authenticated users can select member workspaces"
on public.workspaces
for select
to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id = workspaces.id
      and wm.user_id = (select auth.uid())
  )
);

create policy "authenticated users can create owned workspaces"
on public.workspaces
for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "workspace owners can update workspaces"
on public.workspaces
for update
to authenticated
using (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id = workspaces.id
      and wm.user_id = (select auth.uid())
      and wm.role = 'owner'
  )
)
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id = workspaces.id
      and wm.user_id = (select auth.uid())
      and wm.role = 'owner'
  )
);

create policy "workspace owners can delete workspaces"
on public.workspaces
for delete
to authenticated
using (
  owner_id = (select auth.uid())
  and exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id = workspaces.id
      and wm.user_id = (select auth.uid())
      and wm.role = 'owner'
  )
);

-- Invitations and role administration are out of scope; bootstrap permits only
-- the owner to create their own owner membership.
create policy "authenticated users can select their memberships"
on public.workspace_members
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "workspace owners can create their owner membership"
on public.workspace_members
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and exists (
    select 1
    from public.workspaces as w
    where w.id = workspace_members.workspace_id
      and w.owner_id = (select auth.uid())
  )
);

create policy "workspace owners can update their owner membership"
on public.workspace_members
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and role = 'owner'
  and exists (
    select 1
    from public.workspaces as w
    where w.id = workspace_members.workspace_id
      and w.owner_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and role = 'owner'
  and exists (
    select 1
    from public.workspaces as w
    where w.id = workspace_members.workspace_id
      and w.owner_id = (select auth.uid())
  )
);

create policy "authenticated users can delete their membership"
on public.workspace_members
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "authenticated members can select projects"
on public.projects
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id = projects.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

create policy "authenticated members can insert projects"
on public.projects
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id = projects.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

create policy "authenticated members can update projects"
on public.projects
for update
to authenticated
using (
  exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id = projects.workspace_id
      and wm.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id = projects.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

create policy "authenticated members can delete projects"
on public.projects
for delete
to authenticated
using (
  exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id = projects.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

create policy "authenticated members can select photo records"
on public.photo_records
for select
to authenticated
using (
  exists (
    select 1
    from public.projects as p
    join public.workspace_members as wm on wm.workspace_id = p.workspace_id
    where p.id = photo_records.project_id
      and wm.user_id = (select auth.uid())
  )
);

create policy "authenticated members can insert photo records"
on public.photo_records
for insert
to authenticated
with check (
  captured_by = (select auth.uid())
  and exists (
    select 1
    from public.projects as p
    join public.workspace_members as wm on wm.workspace_id = p.workspace_id
    where p.id = photo_records.project_id
      and wm.user_id = (select auth.uid())
  )
);

create policy "authenticated members can update photo records"
on public.photo_records
for update
to authenticated
using (
  exists (
    select 1
    from public.projects as p
    join public.workspace_members as wm on wm.workspace_id = p.workspace_id
    where p.id = photo_records.project_id
      and wm.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.projects as p
    join public.workspace_members as wm on wm.workspace_id = p.workspace_id
    where p.id = photo_records.project_id
      and wm.user_id = (select auth.uid())
  )
);

create policy "authenticated members can delete photo records"
on public.photo_records
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects as p
    join public.workspace_members as wm on wm.workspace_id = p.workspace_id
    where p.id = photo_records.project_id
      and wm.user_id = (select auth.uid())
  )
);

grant select, insert, update, delete
on table public.profiles, public.workspaces, public.workspace_members, public.projects, public.photo_records
to authenticated;

insert into storage.buckets (id, name, public)
values ('site-photos', 'site-photos', false)
on conflict (id) do update set public = false;

create policy "authenticated members can select site photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'site-photos'
  and exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id::text = (storage.foldername(name))[1]
      and wm.user_id = (select auth.uid())
  )
);

create policy "authenticated members can insert site photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-photos'
  and exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id::text = (storage.foldername(name))[1]
      and wm.user_id = (select auth.uid())
  )
);

create policy "authenticated members can update site photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-photos'
  and exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id::text = (storage.foldername(name))[1]
      and wm.user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'site-photos'
  and exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id::text = (storage.foldername(name))[1]
      and wm.user_id = (select auth.uid())
  )
);

create policy "authenticated members can delete site photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-photos'
  and exists (
    select 1
    from public.workspace_members as wm
    where wm.workspace_id::text = (storage.foldername(name))[1]
      and wm.user_id = (select auth.uid())
  )
);
