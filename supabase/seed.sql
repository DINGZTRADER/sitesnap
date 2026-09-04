-- Local-only demo data. The .invalid address is reserved for documentation and tests.
insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'demo.manager@sitesnap.invalid',
  '',
  timestamptz '2026-09-04 00:00:00+00',
  '{}',
  '{}',
  timestamptz '2026-09-04 00:00:00+00',
  timestamptz '2026-09-04 00:00:00+00'
)
on conflict (id) do nothing;

insert into public.profiles (id, display_name, role)
values (
  '00000000-0000-4000-8000-000000000001',
  'Demo Site Manager',
  'Site Manager'
)
on conflict (id) do update
set display_name = excluded.display_name,
    role = excluded.role;

insert into public.workspaces (id, name, owner_id)
values (
  '00000000-0000-4000-8000-000000000101',
  'SiteSnap demo workspace',
  '00000000-0000-4000-8000-000000000001'
)
on conflict (id) do nothing;

insert into public.workspace_members (workspace_id, user_id, role)
values (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  'owner'
)
on conflict (workspace_id, user_id) do update
set role = excluded.role;

insert into public.projects (id, workspace_id, name, code, client_name, address, progress, created_by)
values
  (
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000101',
    'Mews Redevelopment · Unit 4B',
    'HACK-04',
    'Derwent London',
    '14 Warburton St, Hackney, London E8 3RT',
    68,
    '00000000-0000-4000-8000-000000000001'
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000101',
    'Oaklands Logistics Park · Core 2',
    'OAK-C2',
    'Prologis UK',
    'Gallows Corner, Northampton NN4 9BA',
    41,
    '00000000-0000-4000-8000-000000000001'
  ),
  (
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000101',
    'Victorian Terrace Loft & Extension',
    'RICH-22',
    'Private client',
    '88 Onslow Rd, Richmond TW10 6QH',
    82,
    '00000000-0000-4000-8000-000000000001'
  )
on conflict (id) do nothing;
