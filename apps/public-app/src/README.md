# NABARUN Foundation — Public Website

Public-facing website for **Ichapur Nabarun Welfare Society** (Nabarun NGO), built with
[Next.js 15](https://nextjs.org) (App Router) and Bootstrap 5. The site is **fully static
(SSG)** — every page is pre-rendered to HTML at build time and deployed to Firebase Hosting.

## Key architecture

- **100% SSG** (`output: 'export'`). No server at runtime; the whole site is static HTML in `out/`.
- **Two API surfaces** (see `src/lib/api`):
  - **GET (build-time, server-only, API-key protected)** — fetches dynamic sections during `npm run build`.
  - **POST (browser, public, rate-limited)** — form submissions with silent reCAPTCHA v3.
- **Mock mode** (`NEXT_PUBLIC_USE_MOCK_API=true`, the default) — builds with no backend.
- **Content-driven routing** (`public/content2.json`) — nav links, page paths, enablement, and sitemap metadata.

## Project structure

```
src/
├── app/              # Routes + layouts
│   ├── page.tsx      # Home (/)
│   └── (site)/       # Inner pages (shared Navbar + Footer layout)
├── components/       # Shared UI
├── lib/              # API, config, types, validation
└── hooks/            # UI + reCAPTCHA hooks
```

## Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` — static export to `out/` (then postbuild: prune → sitemap)
- `npm run lint` — ESLint

See `.env.example` for environment variables.
