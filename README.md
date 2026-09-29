# Frontend apps

npm workspaces for the NGO Nabarun web apps. Shared UI libraries are **npm dependencies**, not local packages.

This folder does **not** use Turborepo or tsup:

- **Turbo** was only needed to build `packages/*` before the apps (`^build`). With no local libraries, `npm run … --workspaces` is enough.
- **tsup** is a library bundler. The Angular app uses `ng build`; the public site uses `next build`.

## Structure

| Path | Package | Stack |
|------|---------|--------|
| [`apps/public-site`](apps/public-site) | `@nabarun-ngo/public-site` | Next.js 15 (static export) |
| [`apps/internal-app`](apps/internal-app) | `@nabarun-ngo/internal-app` | Angular (portal shell) |
| [`shared/`](shared) | design tokens | CSS consumed by the internal app |

## Prerequisites

- Node.js 22+
- npm 10+

Install once at the repo root:

```bash
npm install
```

## Commands (from repo root)

| Script | Description |
|--------|-------------|
| `npm run build` | Build both apps |
| `npm run lint` | Typecheck/lint both apps |
| `npm run test` | Test both apps |
| `npm run start:dev` | Dev servers for public site (new window) and internal app |

### Apps (run in the app folder or via workspace)

```bash
npm run dev -w @nabarun-ngo/public-site
npm run build -w @nabarun-ngo/public-site

npm run dev -w @nabarun-ngo/internal-app
npm run build -w @nabarun-ngo/internal-app
npm run build:stage -w @nabarun-ngo/internal-app
```

## Environment

| Path | When | Source |
|------|------|--------|
| PR CI | lint / build / test | committed `.env.example` (copied to `.env` in the CI job) |
| CD | Firebase deploy | Doppler (`fe-public-site` manifest: project `frontend-public`, config `stg` / `prd`) |
| Local | `npm run dev` / `build` | copy each app’s `.env.example` to `.env` and edit |

Internal app: [`apps/internal-app/.env.example`](apps/internal-app/.env.example).  
Public site: [`apps/public-site/.env.example`](apps/public-site/.env.example).

## Libraries

Install published `@ssdev-toolkit/*` packages (`1.0.0`) from npm. Do not add a `packages/` workspace here.
