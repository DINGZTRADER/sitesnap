begin;

select plan(12);

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
      and pg_get_constraintdef(c.oid) like '%FOREIGN KEY (paired_photo_id, project_id) REFERENCES public.photo_records(id, project_id)%'
  ),
  'photo pair foreign key requires the same project'
);

select * from finish();
rollback;
