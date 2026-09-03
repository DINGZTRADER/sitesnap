# SiteSnap Client-Demo Prototype Design

## Goal

Build a polished, lightweight mobile-first prototype for UK construction teams to document site progress with photos, notes, tags, before/after evidence, and a clean project timeline.

## Product promise

Professional site photo records for small construction teams, without enterprise software pricing.

## Approved commercial shape

- £295 total assisted setup and branding fee, split into £99 to start and £196 on go-live.
- £179/month Standard Company plan.
- Up to 10 users and 15 active sites in the prototype presentation.
- Optional £49/site/month solo starter shown as a future commercial option.
- The first 5–10 pilot customers may receive the £99 launch offer, with the balance still due at go-live.

## Scope

The demo includes realistic UK projects, responsive navigation, project cards, a photo timeline/gallery, filterable compliance tags, notes, a before/after comparison, team members, a capture interaction using local preview data, PWA manifest/install metadata, and a pricing panel. It uses local mock data with a repository-shaped boundary so Supabase can replace it later.

The demo does not claim production authentication, cloud storage, offline sync, EXIF/legal watermark processing, geofencing, voice dictation, PDF generation, ZIP handover archives, or client magic links. These are Phase 2 items and must be labelled accordingly in the UI or documentation.

## Architecture

Use Next.js App Router with TypeScript and Tailwind CSS. Keep domain types, mock data, repository access, and UI components separate. The first route is a dashboard; project detail is a client-side route with selected project state and mock photo records. Capture is a controlled local interaction that adds a realistic pending record to the visible timeline without external persistence.

## Data and UX

Use three UK sample sites: Hackney, Northampton, and Richmond. Use construction-specific tags such as Pre-Cover, Firestop Inspection, Sub-base, JCT Variation, Snagging Defect, and Daily Progress. Show timestamp, operator, location label, sync state, and note on each record. The primary mobile action is always “Add photo”.

## Quality bar

The build must pass TypeScript/build checks, render without a backend, be keyboard accessible for core controls, remain usable at mobile and desktop widths, and expose no invented production claims. The final verification must include a local browser pass of dashboard, project detail, filters, capture, before/after, pricing, and install metadata.
