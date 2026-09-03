# SiteSnap MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the SiteSnap client-demo prototype for fast UK construction photo documentation.

**Architecture:** Next.js App Router with TypeScript and Tailwind, using local mock data behind a small repository boundary. The UI is mobile-first and keeps production integrations out of the demo while preserving clear extension points.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, lucide-react.

**Spec:** `docs/superpowers/specs/2026-09-03-sitesnap-design.md`

## Global Constraints

- Use the approved SiteSnap positioning and £179/month commercial model.
- Present setup as £295 total: £99 to start and £196 on go-live; optionally label this a limited pilot launch offer.
- Keep the demo backend-free and functional from local mock data.
- Do not present Phase 2 integrations as implemented.
- Prioritise mobile field speed and a persistent Add photo action.
- Use realistic UK construction sample data and clear status labels.

### Task 1: Scaffold and domain layer

**Files:** Create `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/globals.css`, `src/types/domain.ts`, `src/lib/mock-data.ts`.

- [ ] Create the Next.js project files and scripts for `dev`, `build`, `start`, and `typecheck`.
- [ ] Define `Project`, `PhotoRecord`, `TeamMember`, and tag/sync state unions.
- [ ] Add UK mock projects, photos, operators, and before/after pairing.
- [ ] Run `npm install` once, then `npm run typecheck`.

### Task 2: Shared shell and dashboard

**Files:** Create `src/components/app-shell.tsx`, `src/components/ui.tsx`, `src/app/page.tsx`.

- [ ] Build responsive header, desktop sidebar, mobile bottom navigation, sync status, and persistent Add photo CTA.
- [ ] Render active site cards, recent evidence, quick stats, and the approved pricing promise.
- [ ] Add accessible labels and focus states to navigation and buttons.
- [ ] Run `npm run build` and verify dashboard at mobile width.

### Task 3: Project timeline and gallery

**Files:** Create `src/app/projects/[id]/page.tsx`, `src/components/photo-card.tsx`, `src/components/photo-timeline.tsx`, `src/components/before-after.tsx`.

- [ ] Add project summary, address, client, evidence count, and tag filters.
- [ ] Render chronological photo cards with operator, timestamp, note, tags, and sync state.
- [ ] Implement touch-friendly before/after comparison for paired photos.
- [ ] Add back navigation and graceful unknown-project handling.
- [ ] Verify filtering, comparison, and responsive layout manually.

### Task 4: Capture interaction and pricing panel

**Files:** Create `src/components/capture-sheet.tsx`, `src/components/pricing-panel.tsx`; modify `src/components/app-shell.tsx` and project page.

- [ ] Implement file selection with mobile camera capture hint, project selection, tag selection, note input, and save action.
- [ ] On save, add a local pending record with current timestamp and current demo operator attribution.
- [ ] Show clear “Demo only / local preview” copy for non-persistent capture behavior.
- [ ] Implement the £179/month plan, £295 total setup split into £99 to start and £196 on go-live, and £49/site/month future option in a polished panel.
- [ ] Verify keyboard close, escape handling, and mobile scrolling.

### Task 5: PWA metadata and verification

**Files:** Create `public/manifest.webmanifest`, `public/icon.svg`, `src/app/manifest.ts`, and modify `src/app/layout.tsx`.

- [ ] Add installable app metadata, theme colour, viewport behavior, and icon references.
- [ ] Run `npm run typecheck` and `npm run build`.
- [ ] Start the app locally and browser-check dashboard, project detail, filter, capture, comparison, pricing, and manifest response.
- [ ] Record any Phase 2 limitations in the client-facing summary.
