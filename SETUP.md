# Full setup: Firebase → Cloudinary → Cloudflare

You have two separate repos:

- **palimpsest-frontend** (this repo) → deploys to Cloudflare Pages
- **palimpsest-backend** → deploys to Cloudflare Workers

They connect through one URL: the frontend's `VITE_API_BASE_URL` points at
wherever the backend is running. Do the steps in order.

---

## 1. Firebase project (Auth + Firestore)

1. [Firebase Console](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication → Get started.** Enable **Email/Password** and
   **Google** sign-in providers.
3. **Build → Firestore Database → Create database.** Start in production
   mode — `firestore.rules` (in this repo) locks it down properly.
4. **Project settings → General → Your apps → Add app → Web.** Copy the
   `firebaseConfig` values into this repo's `.env` (copy from `.env.example`
   first) as the `VITE_FIREBASE_*` variables.
5. Publish the rules: **Firestore → Rules**, paste in `firestore.rules`,
   **Publish**. (Or via CLI: `firebase deploy --only firestore:rules`.)
6. *(Optional)* Seed six demo artifacts so the archive isn't empty:
   **Project settings → Service accounts → Generate new private key** → save
   as `scripts/service-account.json` → `cd scripts && npm install && node
   seed-firestore.mjs`.

## 2. Cloudinary (image storage)

1. Free account at cloudinary.com.
2. **Dashboard** shows **Cloud name**, **API Key**, **API Secret**.
3. Cloud name + API key are **not secret** → put them in this repo's `.env`:
   `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_API_KEY`.
4. The **API secret is secret** — it only ever goes into the *backend* repo
   (next step), never into this frontend repo.

## 3. Deploy palimpsest-backend to Cloudflare Workers

In the **palimpsest-backend** repo:

```bash
npm install
npx wrangler login
npx wrangler secret put CLOUDINARY_API_SECRET   # paste the secret from step 2
```

Edit `wrangler.toml` → `[vars]`:
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` — same values as this repo's `.env`
- `ALLOWED_ORIGIN` — leave as `http://localhost:5173` for now, update after step 5

```bash
npm run deploy
```

Wrangler prints your Worker URL, e.g. `https://palimpsest-api.<you>.workers.dev`.

## 4. Point this frontend at the backend

In this repo's `.env`:

```
VITE_API_BASE_URL=https://palimpsest-api.<you>.workers.dev
```

## 5. Deploy this frontend to Cloudflare Pages

**Dashboard (recommended for first deploy):**
1. Push this repo to GitHub/GitLab.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git.**
3. Build command `npm run build`, output directory `dist`.
4. Add every `VITE_*` var from your `.env` under **Settings → Environment
   variables** (Production **and** Preview).
5. Deploy — you get a `https://<project>.pages.dev` URL.

**CLI instead:**
```bash
npm run build
npx wrangler pages deploy dist --project-name=palimpsest
```

## 6. Close the loop

Back in **palimpsest-backend**, set `ALLOWED_ORIGIN` in `wrangler.toml` to
your real Pages URL (e.g. `https://palimpsest.pages.dev`), then
`npm run deploy` again. This makes the Worker only accept upload requests
from your actual site instead of any website.

---

## 7. Set up the first admin (optional)

Admin access has two tiers:

- **Owner** — the bootstrap admin, set only by editing code (never through
  the UI). This guarantees there's always at least one admin who can't be
  accidentally locked out.
- **Everyone else** — added or removed entirely from inside the app, at
  **Admin panel → Manage admins**, by any current admin. No redeploy
  needed for this tier.

To set yourself up as the owner:

1. In this repo's `.env`, set `VITE_ADMIN_EMAILS` to your email
   (comma-separated if you want more than one owner).
2. In `firestore.rules`, edit the `isOwner()` function's email list to
   **exactly match** step 1, then republish the rules (Firestore → Rules →
   paste → Publish).

Both lists must match — the `.env` value only controls whether the Admin
panel *shows up* in the UI for you; the `firestore.rules` list is what
actually grants the access. Redeploy the frontend after changing `.env`.

Once you can see the Admin panel, use **Manage admins** there to grant (or
later revoke) access for anyone else — that part doesn't touch code or
`.env` at all.

## Local development (both repos at once)

```bash
# In palimpsest-backend
npm install && npm run dev      # http://127.0.0.1:8787

# In palimpsest-frontend (this repo)
npm install && npm run dev      # http://localhost:5173
```

Set this repo's `.env` → `VITE_API_BASE_URL=http://127.0.0.1:8787` for local
dev, and your deployed Worker URL for production.

## Running without any of this connected

Everything above is optional just to *explore* the app: with `.env` missing
or incomplete, this frontend runs in **demo mode** — sign-in shows a banner
and stays disabled, guests can browse the whole archive, sample data fills
in everywhere real data would go. Connect Firebase first (step 1) to turn on
real accounts; Cloudinary + the backend (steps 2–4) are only needed for real
file uploads.
