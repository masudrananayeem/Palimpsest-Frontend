# Palimpsest Heritage Archive — Upgrade 0.7

## Added in this upgrade
1. **Real AI photo → 3D**: an "AI 3D model" tab on every artifact with a
   photo triggers the existing Meshy pipeline (`backend/src/index.js`) and
   renders the resulting `.glb` with `GLBViewer.jsx` (Three.js + OrbitControls).
   Requires `VITE_API_BASE_URL` (frontend) and a `MESHY_API_KEY` secret
   (backend) — see `backend/palimpsest-backend/README.md`.
2. **Instant pseudo-3D preview**: `PhotoRelief3D.jsx` turns any photo into a
   draggable depth-relief object client-side (no API cost) — used in the
   Upload review step and as a fast alternative view on artifact pages.
3. **3D tilt cards everywhere**: `TiltCard.jsx` gives artifact and document
   cards a mouse/touch-reactive 3D tilt with a colour-grade glare sheen.
4. **Modern scroll animations sitewide**: `Reveal.jsx` now supports
   variants (up/down/left/right/scale/blur) plus a `RevealGroup` helper for
   auto-staggered lists. Applied across Home, Archive, Collections,
   Timeline, and Research. New CSS: drifting aurora backgrounds, glow-pulse,
   float-idle, colour-grade hover washes — all respect
   `prefers-reduced-motion`.
5. **Full document CRUD**: signed-in users can add, edit, and delete
   research documents (`lib/documentsRepo.js`, Firestore-backed, same
   demo-fallback pattern as artifacts). The built-in document library stays
   read-only reference material; user-authored documents sit alongside it.
6. **Full artifact edit/delete**: contributors can now edit every field of
   their own submissions (not just status) from the Dashboard, and delete
   them.
7. `firestore.rules` updated with a `documents` collection (public read,
   owner/admin write).

## Run
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

## Deploying
See `SETUP.md` for the full Firebase + Cloudinary + Cloudflare walkthrough
(unchanged by this upgrade — both frontend and backend already deploy to
Cloudflare Pages / Workers).
