begin;

select plan(19);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'workspaces', 'workspaces table exists');
select has_table('public', 'workspace_members', 'workspace_members table exists');
select has_table('public', 'projects', 'projects table exists');
select has_table('public', 'photo_records', 'photo_records table exists');

select ok(
  coalesce((
    select c.relrowsecurity
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'profiles'
  ), false),
  'profiles has row level security enabled'
);

select ok(
  coalesce((
    select c.relrowsecurity
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'workspaces'
  ), false),
  'workspaces has row level security enabled'
);

select ok(
  coalesce((
    select c.relrowsecurity
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'workspace_members'
  ), false),
  'workspace_members has row level security enabled'
);

select ok(
  coalesce((
    select c.relrowsecurity
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'projects'
  ), false),
  'projects has row level security enabled'
);

select ok(
  coalesce((
    select c.relrowsecurity
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'photo_records'
  ), false),
  'photo_records has row level security enabled'
);

select ok(
  coalesce((
    select b.public = false
    from storage.buckets as b
    where b.id = 'site-photos'
  ), false),
  'site-photos bucket is private'
);

select ok(
  exists (
    select 1
    from pg_constraint as c
    where c.conrelid = 'public.photo_records'::regclass
      and c.confrelid = 'public.photo_records'::regclass
      and c.conname = 'paired_photo_same_project'
      and c.contype = 'f'
      and c.confdeltype = 'r'
      and pg_get_constraintdef(c.oid) like '%FOREIGN KEY (paired_photo_id, project_id) REFERENCES public.photo_records(id, project_id)%'
  ),
  'photo pair foreign key requires the same project and restricts direct target deletion'
);

select ok(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workspaces'
      and cmd = 'UPDATE'
  ) = 1
  and exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workspaces'
      and policyname = 'workspace owners can update workspaces'
      and roles @> array['authenticated']::name[]
      and qual like '%owner_id%'
      and with_check like '%owner_id%'
  ),
  'only workspace owners can update workspaces and owner_id remains constrained'
);

select ok(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workspaces'
      and cmd = 'DELETE'
  ) = 1
  and exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workspaces'
      and policyname = 'workspace owners can delete workspaces'
      and roles @> array['authenticated']::name[]
      and qual like '%owner_id%'
  ),
  'only workspace owners can delete workspaces'
);

select ok(
  (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workspace_members'
      and cmd = 'UPDATE'
  ) = 1
  and exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workspace_members'
      and policyname = 'workspace owners can update their owner membership'
      and roles @> array['authenticated']::name[]
      and qual like '%role = ''owner''%'
      and with_check like '%role = ''owner''%'
  ),
  'workspace members cannot self-escalate their membership role'
);

select ok(
  not exists (
    select 1
    from pg_constraint as c
    where c.conrelid = 'public.photo_records'::regclass
      and c.contype = 'f'
      and pg_get_constraintdef(c.oid) like 'FOREIGN KEY (paired_photo_id) %'
  ),
  'photo records do not have a conflicting single-column pair foreign key'
);

select ok(
  exists (
    select 1
    from pg_trigger as t
    where t.tgrelid = 'public.photo_records'::regclass
      and t.tgname = 'photo_records_clear_pair_reference'
      and not t.tgisinternal
  ),
  'deleting a photo has a trigger to clear only paired_photo_id references'
);

insert into public.photo_records (id, project_id, image_path, captured_by, paired_photo_id)
values
  (
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-4000-8000-000000000201',
    'test/target.webp',
    '00000000-0000-4000-8000-000000000001',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000402',
    '00000000-0000-4000-8000-000000000201',
    'test/pair.webp',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000401'
  );

delete from public.photo_records
where id = '00000000-0000-4000-8000-000000000401';

select is(
  (
    select project_id
    from public.photo_records
    where id = '00000000-0000-4000-8000-000000000402'
  ),
  '00000000-0000-4000-8000-000000000201'::uuid,
  'deleting a pair target preserves the referencing photo project'
);

select ok(
  (
    select paired_photo_id is null
    from public.photo_records
    where id = '00000000-0000-4000-8000-000000000402'
  ),
  'deleting a pair target clears only paired_photo_id'
);

select * from finish();
rollback;
