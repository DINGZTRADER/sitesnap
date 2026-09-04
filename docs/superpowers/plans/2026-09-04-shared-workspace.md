# SiteSnap Shared Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn SiteSnap into one responsive PWA where the same signed-in user can create sites and share project photo records between a phone and a desktop browser.

**Architecture:** Keep the existing Next.js App Router and responsive UI. Add a small data-access boundary that selects either the existing browser-only demo repository or a Supabase-backed pilot repository. Supabase Auth identifies the user, Postgres stores workspaces/projects/records, private Storage stores images, and RLS limits every query and object to workspace members.

**Tech Stack:** Next.js 15.5.24, React 19, TypeScript 5.7, Tailwind CSS 3.4, Supabase Auth, Supabase Postgres, Supabase Storage, Node test runner, Chrome DevTools browser checks.

**Spec:** `docs/superpowers/specs/2026-09-04-shared-workspace-design.md`

## Global Constraints

- The same responsive PWA must expose the same project creation, photo capture, timeline, tags, and before/after behaviour at 360px, 390px, 430px, and desktop widths.
- Existing no-Supabase mock-data mode must continue to build and run when Supabase environment variables are absent.
- Cloud mode uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the browser; service-role and secret keys never enter source, client bundles, logs, or commits.
- Every public-schema table has RLS enabled; every policy uses `TO authenticated` plus a workspace-membership predicate based on `(select auth.uid())`.
- The `site-photos` bucket is private and object paths are `workspace_id/project_id/record_id.ext`.
- Do not add payments, billing administration, AI, chat, conversations, geofencing, voice dictation, PDF export, ZIP handover, automatic EXIF processing, offline queues, or enterprise administration.
- Pin Supabase package versions and commit the lockfile after installation.
- Use test-first changes: write a failing test or browser assertion, observe the expected failure, then implement the smallest change that makes it pass.

---

### Task 1: Add an explicit demo/cloud runtime boundary

**Files:**
- Create: `src/lib/runtime-mode.ts`
- Create: `tests/runtime-mode.test.ts`
- Create: `.env.example`
- Modify: `package.json`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces `type RuntimeMode = 'demo' | 'cloud'`.
- Produces `getRuntimeMode(env: Pick<NodeJS.ProcessEnv, 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'>): RuntimeMode`.
- Produces `isCloudConfigured(env): boolean`.

- [ ] **Step 1: Write the failing runtime-mode tests.**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { getRuntimeMode, isCloudConfigured } from '../src/lib/runtime-mode';

test('uses demo mode when either public Supabase setting is missing', () => {
  assert.equal(getRuntimeMode({ NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '' }), 'demo');
  assert.equal(isCloudConfigured({ NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-key' }), false);
});

test('uses cloud mode only when both public settings are present', () => {
  const env = { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-key' };
  assert.equal(getRuntimeMode(env), 'cloud');
  assert.equal(isCloudConfigured(env), true);
});
```

- [ ] **Step 2: Run the focused test and confirm the expected failure.**

Run: `node --experimental-strip-types --test tests/runtime-mode.test.ts`

Expected: FAIL because `src/lib/runtime-mode.ts` does not exist.

- [ ] **Step 3: Implement the runtime boundary.**

```ts
export type RuntimeMode = 'demo' | 'cloud';

type PublicSupabaseEnv = Pick<NodeJS.ProcessEnv, 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'>;

export function isCloudConfigured(env: PublicSupabaseEnv): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL?.trim() && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim());
}

export function getRuntimeMode(env: PublicSupabaseEnv): RuntimeMode {
  return isCloudConfigured(env) ? 'cloud' : 'demo';
}
```

Update `.env.example` with the two public variable names and comments that values belong in the local environment only. Update metadata copy in `src/app/layout.tsx` so the app description does not imply cloud persistence in demo mode.

- [ ] **Step 4: Run the focused test and the existing suite.**

Run: `node --experimental-strip-types --test tests/runtime-mode.test.ts`

Expected: 2 passing tests.

Run: `npm.cmd test`

Expected: all existing evidence tests plus the two runtime-mode tests pass.

- [ ] **Step 5: Make the test script discover both current and future unit tests.**

On Windows with the repository's current Node version, use the cross-platform-compatible script `node --experimental-strip-types --test tests/*.test.ts` and run `npm.cmd test` to confirm Node discovers both current `.test.ts` files. On platforms where Node accepts directory discovery directly, `node --experimental-strip-types --test tests` is equivalent.

- [ ] **Step 6: Commit the runtime boundary.**

```text
git add .env.example package.json src/app/layout.tsx src/lib/runtime-mode.ts tests/runtime-mode.test.ts
git commit -m "feat: define SiteSnap demo and cloud runtime modes"
```

---

### Task 2: Create the shared workspace database and private photo bucket

**Files:**
- Create through the Supabase CLI: the CLI-generated migration under `supabase/migrations/` named `sitesnap_shared_workspace`
- Create: `supabase/seed.sql`
- Create: `supabase/tests/shared_workspace.sql`
- Create: `src/types/database.ts`

**Interfaces:**
- Produces tables `profiles`, `workspaces`, `workspace_members`, `projects`, and `photo_records`.
- Produces a private Storage bucket named `site-photos`.
- Produces generated TypeScript database types consumed by repository modules.

- [ ] **Step 1: Check the installed Supabase CLI before creating schema files.**

Run: `supabase --version` and `supabase migration new --help`.

If the CLI is unavailable, stop this task and report that the user must install/authenticate the CLI before schema work can be verified. Do not create a hand-named migration file.

- [ ] **Step 2: Create the migration with the CLI.**

Run: `supabase migration new sitesnap_shared_workspace`.

Edit the generated migration file under `supabase/migrations/` with this schema:

```sql
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
  paired_photo_id uuid references public.photo_records(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.photo_records
  add constraint paired_photo_identity unique (id, project_id);

alter table public.photo_records
  add constraint paired_photo_same_project
  foreign key (paired_photo_id, project_id)
  references public.photo_records(id, project_id)
  on delete set null;

create index projects_workspace_id_idx on public.projects(workspace_id);
create index photo_records_project_id_idx on public.photo_records(project_id, captured_at desc);
```

Add an `updated_at` trigger for `projects`, enable RLS on all five tables, and add policies that allow a user to select/insert/update/delete only rows whose workspace is present in `workspace_members` for `(select auth.uid())`. Use `TO authenticated`; do not use `auth.role()` or user metadata for authorization.

Create the private `site-photos` bucket and Storage policies for select/insert/update/delete that require the first path segment to be a workspace ID where the authenticated user has a matching `workspace_members` row. Do not grant the bucket public access.

- [ ] **Step 3: Add local seed data without production credentials.**

Put only local Supabase seed rows in `supabase/seed.sql`, using the existing UK demo project names and fixed demo UUIDs. Do not put real email addresses, tokens, publishable keys, or image bytes in the seed file. The deployed pilot starts with a user-created workspace and site.

- [ ] **Step 4: Generate database types using the installed CLI.**

Discover the exact command with `supabase gen types --help`, generate the TypeScript output into `src/types/database.ts`, and review the file for the five tables and Storage types. Commit the generated type file and migration together.

- [ ] **Step 5: Verify the schema and RLS contract.**

Run the CLI’s documented local database test command discovered from `supabase test --help` against `supabase/tests/shared_workspace.sql` or apply the migration to a local Supabase project. The SQL test file must assert the five tables exist, all five have RLS enabled, the private bucket is present, and a same-project pair constraint exists. Confirm with SQL that every public table reports `rowsecurity = true`. Exercise two authenticated users: user A can create/read a project in workspace A; user B receives zero rows for that project and cannot read its Storage object.

- [ ] **Step 6: Commit the database contract.**

```text
git add supabase src/types/database.ts
git commit -m "feat: add shared workspace schema and storage policies"
```

---

### Task 3: Add passwordless authentication and workspace bootstrap

**Files:**
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/auth.ts`
- Create: `src/lib/repository-context.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/middleware.ts`
- Create: `tests/auth.test.ts`
- Modify: `src/components/app-shell.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces `createSupabaseBrowserClient()` for client components.
- Produces `createSupabaseServerClient()` with cookie read/write support for App Router handlers.
- Produces `getCurrentUser()` and `ensureWorkspaceForUser(userId)`.
- Produces `type RepositoryContext = { mode: RuntimeMode; workspaceId: string | null; userId: string | null; supabase: SupabaseClient<Database> | null }`.
- Produces a login route that sends a magic link with a same-origin callback URL.

- [ ] **Step 1: Write failing auth contract tests.**

Test `getSafeNextPath(path)` so `/projects/hackney` is accepted and `https://malicious.example` becomes `/`. Test `getDisplayName(user)` so a missing display name falls back to the email local-part without throwing.

- [ ] **Step 2: Run the focused tests and confirm failure.**

Run: `node --experimental-strip-types --test tests/auth.test.ts`

Expected: FAIL because `src/lib/auth.ts` does not exist.

- [ ] **Step 3: Install pinned Supabase client packages.**

Run `npm.cmd install --save-exact @supabase/supabase-js @supabase/ssr`, then inspect `package.json` and `package-lock.json` to confirm exact versions are recorded. Never add a service-role key or secret environment variable.

- [ ] **Step 4: Implement SSR-safe clients and magic-link callback.**

Use `createBrowserClient` in `browser.ts` and `createServerClient` in `server.ts`. The callback handler must call `exchangeCodeForSession(code)` and redirect only to a same-origin path returned by `getSafeNextPath`. Middleware refreshes the session and redirects unauthenticated cloud-mode page requests to `/login?next=...`; demo mode bypasses auth and keeps the existing mock app usable.

- [ ] **Step 5: Bootstrap one workspace per authenticated user.**

`ensureWorkspaceForUser(userId)` must read the user’s membership, create a workspace named `My SiteSnap workspace` plus an owner membership only when none exists, and upsert a profile with the current display name. This function must use normal authenticated client calls protected by RLS; it must not use `SECURITY DEFINER` or a service-role key in the web app.

- [ ] **Step 6: Add login, sign-out, and visible mode status.**

The login page has one email field and one primary `Send sign-in link` button, with a clear message that the same email is used on phone and PC. The shell shows `Cloud pilot · synced` in cloud mode and preserves `Demo workspace · local only` in demo mode. Add a sign-out action without adding account administration.

- [ ] **Step 7: Run auth tests and typecheck.**

Run: `node --experimental-strip-types --test tests/auth.test.ts`

Expected: all auth contract tests pass.

Run: `npm.cmd run typecheck`

Expected: exit code 0.

- [ ] **Step 8: Commit authentication.**

```text
git add package.json package-lock.json src/lib/supabase src/lib/auth.ts src/app/login src/app/auth src/middleware.ts src/components/app-shell.tsx src/app/page.tsx src/app/projects tests/auth.test.ts
git commit -m "feat: add passwordless SiteSnap pilot authentication"
```

---

### Task 4: Add project/site creation from phone and desktop

**Files:**
- Create: `src/lib/project-input.ts`
- Create: `src/lib/projects-repository.ts`
- Create: `src/components/workspace-provider.tsx`
- Create: `src/components/project-form.tsx`
- Create: `src/app/projects/page.tsx`
- Create: `src/app/projects/new/page.tsx`
- Create: `tests/project-input.test.ts`
- Modify: `src/types/domain.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/app-shell.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces `type CreateProjectInput = { name: string; address: string; clientName: string; code: string }`.
- Produces `validateProjectInput(input): { ok: true; value: CreateProjectInput } | { ok: false; errors: Record<string, string> }`.
- Produces `createProject(input, context): Promise<Project>` and `listProjects(context): Promise<Project[]>`, where `context.mode` selects the demo or cloud repository.
- Produces `WorkspaceProvider` and `useWorkspace(): { projects: Project[]; loading: boolean; error: string | null; refreshProjects(): Promise<void>; createProject(input: CreateProjectInput): Promise<Project> }`.

- [ ] **Step 1: Write failing project-input tests.**

```ts
test('requires a site name and address and normalises whitespace', () => {
  assert.deepEqual(validateProjectInput({ name: '  Mews Site  ', address: '  14 Warburton St  ', clientName: ' Derwent London ', code: '' }), {
    ok: true,
    value: { name: 'Mews Site', address: '14 Warburton St', clientName: 'Derwent London', code: 'MEWS-SITE' },
  });
});

test('rejects a missing site name or address', () => {
  const result = validateProjectInput({ name: '', address: '', clientName: '', code: '' });
  assert.equal(result.ok, false);
});
```

- [ ] **Step 2: Run the focused tests and confirm failure.**

Run: `node --experimental-strip-types --test tests/project-input.test.ts`

Expected: FAIL because `src/lib/project-input.ts` does not exist.

- [ ] **Step 3: Implement validation and repository adapters.**

Demo mode reads and writes a browser-local project key for the current demonstration. Cloud mode inserts into `public.projects` using the authenticated workspace ID and maps database rows to the existing `Project` view model. The repository must never mix projects between workspaces.

- [ ] **Step 4: Build the workspace provider.**

Wrap the application body with `WorkspaceProvider` in `src/app/layout.tsx`. On mount, it calls `listProjects` with the current `RepositoryContext`; `createProject` awaits the repository, prepends the result, and returns it to the form. The provider must show an error state rather than silently replacing cloud results with mock projects.

- [ ] **Step 5: Build the shared project form.**

Use labelled fields for Site name and Address, optional Client and Project code, inline validation, a disabled Save button until required fields are valid, and a clear `Saved locally` or `Saved to workspace` result. The form must be usable with a phone keyboard, support Enter submission from the final field, and return to the new project page with the created project ID after success.

- [ ] **Step 6: Add the project list and entry points.**

Create `/projects` with the active project cards and a prominent `New project` button. Update desktop sidebar, mobile bottom navigation, dashboard project section, and empty states to link to `/projects` and `/projects/new` rather than only using hash anchors. The same form component must render at phone and desktop widths.

- [ ] **Step 7: Run project tests and verify both modes.**

Run: `node --experimental-strip-types --test tests/project-input.test.ts`

Expected: all project-input tests pass.

Run: `npm.cmd run typecheck`

Expected: exit code 0.

In demo mode, create a site at 390px and confirm it appears after refresh. In cloud mode, create the same site and confirm a second authenticated browser sees it.

- [ ] **Step 8: Commit project creation.**

```text
git add src/types/domain.ts src/lib/project-input.ts src/lib/projects-repository.ts src/components/project-form.tsx src/app/projects src/components/app-shell.tsx src/app/page.tsx tests/project-input.test.ts
git commit -m "feat: create and list SiteSnap projects"
```

---

### Task 5: Store and synchronise photo records across devices

**Files:**
- Create: `src/lib/image-upload.ts`
- Create: `src/lib/photo-repository.ts`
- Create: `tests/image-upload.test.ts`
- Modify: `src/components/capture-sheet.tsx`
- Modify: `src/components/photo-image.tsx`
- Modify: `src/app/projects/[id]/page.tsx`
- Modify: `src/lib/evidence.ts`
- Modify: `src/types/domain.ts`

**Interfaces:**
- Produces `validateImageFile(file: File | null): { ok: true; file: File } | { ok: false; message: string }`.
- Produces `compressImage(file: File, options?: { maxEdge?: number; quality?: number }): Promise<File>` with defaults `maxEdge: 1600` and `quality: 0.82`.
- Produces `listPhotoRecords(context, projectId): Promise<PhotoRecord[]>`.
- Produces `createPhotoRecord(context, input: { projectId: string; file: File; note: string; tags: Tag[] }): Promise<PhotoRecord>`.

- [ ] **Step 1: Write failing upload contract tests.**

Cover rejection of `null`, `text/plain`, and an image with a size above 10 MB; accept `image/jpeg`, `image/png`, and `image/heic`. Assert that the default compression options are 1600px and 0.82 without requiring a browser canvas in the unit test.

- [ ] **Step 2: Run the focused tests and confirm failure.**

Run: `node --experimental-strip-types --test tests/image-upload.test.ts`

Expected: FAIL because `src/lib/image-upload.ts` does not exist.

- [ ] **Step 3: Implement validation and compression.**

Use a browser canvas only in `compressImage`; preserve the original extension when possible, return a new `File`, and show a specific error for unsupported type or size. Keep the existing save-disabled behaviour until a valid image is selected.

- [ ] **Step 4: Implement the cloud photo repository.**

Compress the selected image, insert a `photo_records` row with the authenticated user ID, upload the compressed file to `site-photos/{workspaceId}/{projectId}/{recordId}.{extension}`, and request a signed URL for display. If Storage upload fails, delete the inserted row before showing the error. Do not store image data URLs in cloud records. Demo mode continues to use the existing localStorage/data-URL path.

- [ ] **Step 5: Connect the capture sheet to the selected project.**

Pass the current project ID and repository context into `CaptureSheet`. The save handler must await `createPhotoRecord`, close the sheet only after both row and image succeed, and immediately prepend the returned record to the visible timeline. Keep optional note/tag fields, current-user attribution, clear upload state, Escape-to-close, dialog semantics, and a mobile-visible primary action.

- [ ] **Step 6: Replace project-page demo loading with the repository boundary.**

Load records for the current project only. In cloud mode, fetch on mount and show `Syncing records…`, `Cloud synced`, and a retry state for network errors. In demo mode, preserve `Saved locally · cloud sync not connected`. Keep tag filters and before/after selection scoped to the current project.

- [ ] **Step 7: Run tests and verify the two-device journey.**

Run: `node --experimental-strip-types --test tests/image-upload.test.ts`

Expected: all upload tests pass.

Run: `npm.cmd test` and `npm.cmd run typecheck`.

Expected: zero test failures and exit code 0.

With two authenticated browser profiles, create a project on the phone-sized profile, open it on the desktop-sized profile, upload a compressed image with note/tag, and confirm the record appears in the desktop timeline after the upload completes and after refresh.

- [ ] **Step 8: Commit shared photo records.**

```text
git add src/lib/image-upload.ts src/lib/photo-repository.ts tests/image-upload.test.ts src/components/capture-sheet.tsx src/components/photo-image.tsx src/app/projects/[id]/page.tsx src/lib/evidence.ts src/types/domain.ts
git commit -m "feat: sync SiteSnap photo records across devices"
```

---

### Task 6: Preserve project-specific comparisons, team attribution, and demo labels

**Files:**
- Create: `src/lib/project-view-model.ts`
- Create: `tests/project-view-model.test.ts`
- Modify: `src/app/projects/[id]/page.tsx`
- Modify: `src/components/app-shell.tsx`
- Modify: `src/components/before-after.tsx`
- Modify: `src/components/pricing-panel.tsx`

**Interfaces:**
- Produces `getProjectPair(records, projectId): { before: PhotoRecord; after: PhotoRecord } | null`.
- Produces `getWorkspaceStatus(mode, isAuthenticated): 'Demo workspace · local only' | 'Cloud pilot · synced' | 'Sign in to sync across devices'`.

- [ ] **Step 1: Write failing view-model tests.**

Assert that records from another project are excluded from the pair, that an incomplete pair returns `null`, and that the status copy is correct for demo, authenticated cloud, and unauthenticated cloud states.

- [ ] **Step 2: Run the focused tests and confirm failure.**

Run: `node --experimental-strip-types --test tests/project-view-model.test.ts`

Expected: FAIL because `src/lib/project-view-model.ts` does not exist.

- [ ] **Step 3: Implement the project-scoped view model.**

Use the existing `stage` and `pairedPhotoId` fields, filter by project ID before selecting a pair, and keep the existing keyboard-accessible divider. Do not make a Hackney record available on Northampton or Richmond pages.

- [ ] **Step 4: Update labels and team attribution.**

Cloud records show the authenticated profile name and role. Demo records retain sample UK team members. The interface must explicitly distinguish `Cloud pilot · synced`, `Saved locally · cloud sync not connected`, and unavailable future features. Do not imply offline sync, EXIF processing, geofencing, exports, or billing are active.

- [ ] **Step 5: Run view-model tests and browser checks.**

Run: `node --experimental-strip-types --test tests/project-view-model.test.ts` and `npm.cmd run typecheck`.

Expected: all focused tests pass and typecheck exits 0.

Verify Hackney, Northampton, and Richmond comparisons and tag filters in both demo and cloud-mode browser profiles.

- [ ] **Step 6: Commit project-scoped presentation.**

```text
git add src/lib/project-view-model.ts tests/project-view-model.test.ts src/app/projects/[id]/page.tsx src/components/app-shell.tsx src/components/before-after.tsx src/components/pricing-panel.tsx
git commit -m "fix: keep SiteSnap evidence scoped and clearly labelled"
```

---

### Task 7: Full verification, environment setup, and pilot release gate

**Files:**
- Create: `work/verify-sitesnap-shared.ps1` (ignored browser harness; do not commit credentials or session profiles)
- Create: `README.md`
- Modify: `.env.example`

**Interfaces:**
- Produces a repeatable local verification run for demo mode and configured cloud mode.
- Documents local setup, Supabase callback URL, bucket name, RLS verification, and the deliberate non-production limitations.

- [ ] **Step 1: Add the acceptance checks to the browser harness before final code changes.**

The harness must check at 360px, 390px, 430px, and 1440px:

```text
login or demo-mode landing
create project/site on phone-sized viewport
project visible in desktop-sized viewport
open Hackney, Northampton, and Richmond
project-specific before/after pair
tag filter isolation
capture validation and disabled save
image + note + tag upload
new record in correct timeline
refresh persistence
cloud/demo status label
pricing panel values
manifest and local PWA icons
no horizontal overflow
```

- [ ] **Step 2: Run the complete local checks.**

Run sequentially:

```text
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd start -- --hostname 127.0.0.1 --port 3002
powershell -NoProfile -ExecutionPolicy Bypass -File .\work\verify-sitesnap-shared.ps1
```

Expected: zero unit-test failures, typecheck exit code 0, production build exit code 0, every browser assertion true, all routes HTTP 200, and `/manifest.webmanifest` valid with two working icons.

- [ ] **Step 3: Verify cloud-mode security and cross-device behaviour.**

Use two browser profiles signed into the same account on the configured Supabase project. Confirm a project created on the phone profile appears on the desktop profile; confirm a photo uploaded on the phone profile appears on desktop after upload and refresh; confirm a different account cannot access the project or Storage object.

- [ ] **Step 4: Configure only non-secret deployment settings.**

Set the Supabase URL and publishable key in the local/Vercel environment settings. Configure the Supabase Auth callback URL for the final SiteSnap domain. Keep `.env.local`, access tokens, service-role keys, and session profiles outside Git.

- [ ] **Step 5: Update the pilot README and release decision.**

Document the exact login flow, same-account phone/PC expectation, image size limit, cloud/demo distinction, and excluded Phase 2 features. Do not describe the app as a production SaaS until retention, backups, monitoring, invitation controls, and privacy terms have been separately approved.

- [ ] **Step 6: Commit the verification documentation.**

```text
git add README.md .env.example
git commit -m "docs: define SiteSnap shared pilot verification"
```

## Self-review

- **Spec coverage:** Authentication and same-account access are covered by Tasks 1 and 3; project creation on both devices by Task 4; shared image and record persistence by Task 5; project-specific comparisons, tags, attribution, and labels by Task 6; responsive and cross-device acceptance by Task 7; RLS and private Storage by Task 2.
- **No enterprise drift:** Payments, billing administration, AI, chat, geofencing, voice, exports, offline queues, and native apps are explicitly excluded.
- **Fallback safety:** Demo mode remains available without Supabase settings and is explicitly labelled browser-only.
- **Security:** No client service-role key, no user metadata authorization, private Storage, membership-based RLS, and same-origin auth redirects are specified.
- **Placeholder scan:** No `TBD`, `TODO`, or unspecified “add appropriate handling” steps remain. The Supabase migration path is intentionally created by the CLI rather than guessed.
- **Type consistency:** `RuntimeMode`, `CreateProjectInput`, repository methods, upload methods, and view-model functions are named consistently across tasks.
