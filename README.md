# SiteSnap

SiteSnap is a focused, mobile-first construction photo record prototype for small UK construction teams.

> Professional site photo records for small construction teams, without enterprise software pricing.

## Pilot scope

- Create projects/sites from a phone or desktop browser.
- Capture or choose a JPG, PNG, or HEIC site image.
- Add an optional note and construction tag.
- Save the record to the selected project's timeline.
- View project-specific before/after comparisons and tag filters.
- Use the same signed-in account on a phone and PC in cloud pilot mode.
- Install the responsive interface as a PWA.

The commercial prototype uses £99 to start, £196 on go-live (£295 total setup), and £179/month.

## Demo and cloud pilot modes

With no public Supabase settings, the app runs as a local demo. Projects and photo records use browser storage and show `Demo workspace · local only`. They are not shared between devices.

With both public Supabase settings, the app runs as a passwordless cloud pilot. Use the same email address on the phone and PC, then open the sign-in link on the device you want to use. Projects and photos are stored in the hosted pilot workspace and show `Cloud pilot · synced` after authentication.

Required browser-safe settings:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

In Supabase Auth URL configuration, add the final callback URL:

```text
https://sitesnap.wachaai.com/auth/callback
```

The `site-photos` Storage bucket is private. Service-role keys and other secrets must never be placed in `.env.local`, client code, or Git.

## Local development

```text
npm.cmd install
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev -- --hostname 127.0.0.1 --port 3004
```

Open `http://127.0.0.1:3004`. To check the production server instead, stop the dev server and run `npm.cmd start -- --hostname 127.0.0.1 --port 3002` after a successful build.

## Deliberate prototype limitations

This is a local/demo and hosted pilot prototype, not a production SaaS release. Demo records are browser-local and cloud pilot records depend on the configured Supabase project. Production retention, backups, monitoring, invitations, privacy terms, billing, and account administration are not included.

Offline queues and sync, EXIF processing, geofencing, AI, chat, voice dictation, PDF export, ZIP handover, payments, and enterprise features are unavailable Phase 2 items.
