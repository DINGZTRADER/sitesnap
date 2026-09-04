# SiteSnap Shared Workspace Design

**Date:** 2026-09-04

**Status:** Proposed for implementation

## Goal

Make SiteSnap one responsive PWA with the same project-creation, photo-capture, timeline, tag, and before/after behaviour on a phone and a desktop browser.

## Product decision

The next stage is a pilot-ready shared workspace, not a separate native mobile app. The existing responsive Next.js UI remains the client; Supabase Auth, Postgres, and private Storage provide the minimum shared persistence needed for a user who signs in on two devices.

## User journey

1. A user opens SiteSnap on either device.
2. The user signs in with the same email account.
3. The user creates a project/site with name, code, client, and address.
4. The new site appears in the project list on both devices.
5. The user opens the site on the phone, selects or captures a photo, adds an optional note and tag, and saves it.
6. The record uploads to the private project storage and appears in the project timeline on both devices.
7. Refreshing either device restores the same records, tags, and project-specific before/after pair.

## Scope

### Included

- Email magic-link authentication using Supabase Auth.
- One workspace per pilot account, with a workspace membership row for access control.
- Create, edit, and archive project/site records from phone or desktop.
- Shared project and photo-record persistence in Supabase Postgres.
- Private project photo storage in a Supabase Storage bucket with signed URLs.
- Current photo notes, tags, project-specific before/after pair, and current-user attribution.
- Explicit cloud/demo status labels and network/upload error states.
- Local mock-data fallback when Supabase configuration is absent, so the client-demo mode remains runnable.
- Image validation and client-side compression before upload to preserve the low-bandwidth goal.

### Excluded

- Payments, billing administration, AI, chat, conversations, geofencing, voice dictation, PDF export, ZIP handover, offline queueing, automatic EXIF processing, and enterprise administration.
- Native iOS/Android applications.
- Self-service invitations and complex role administration. The pilot uses the authenticated workspace owner; the existing sample team remains demo data until invitations are separately designed.

## Data and access model

The database contains `profiles`, `workspaces`, `workspace_members`, `projects`, and `photo_records`. Each project belongs to a workspace; each photo record belongs to a project. Every exposed table has RLS enabled. Policies grant access only to authenticated users who have a matching `workspace_members` row. Authorization uses `auth.uid()` and database membership rows, never editable user metadata.

The `site-photos` Storage bucket is private. Object paths use `workspace_id/project_id/record_id.ext`. Storage policies check workspace membership from the path before allowing select or insert. The browser receives only the publishable Supabase key; no service-role or secret key is allowed in client or repository files.

## Compatibility and fallback

The current mock-data and localStorage path remains available when the public Supabase environment variables are absent. This preserves local client demonstrations, but it is labelled as browser-only and is not presented as cross-device sync. When cloud configuration is present, unauthenticated users see the login page and authenticated users use the shared repository.

## Acceptance criteria

- At 360px, 390px, 430px, and desktop widths, the same responsive PWA exposes the project list, New project action, project tabs, Add photo flow, and save action without horizontal overflow.
- A project created on the phone is visible after signing into the same account on the desktop.
- A photo captured on the phone is visible in the correct project timeline on the desktop after upload completes.
- A project created on the desktop is visible on the phone.
- Notes, tags, current-user attribution, and project-specific records persist after refresh.
- A user cannot read or write another workspace's project rows or Storage objects.
- The existing no-Supabase demo mode still builds and runs with mock UK project data.
- TypeScript, tests, production build, local cloud-mode browser checks, and mobile/desktop browser checks are green before pilot deployment.
