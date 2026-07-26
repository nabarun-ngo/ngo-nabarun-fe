# Angular monorepo

npm workspaces + [Turborepo](https://turbo.build/) for the NGO Nabarun web apps.

## Structure

| Path | Package | Stack |
|------|---------|--------|
| [`apps/public`](apps/public) | `public` | Next.js 15 (static export) |
| [`apps/internal`](apps/internal) | `internal` | Angular 19 (portal shell) |
| [`packages/`](packages) | — | Shared libraries (add later) |

## Prerequisites

- Node.js 20+
- npm 10+

Install once at the repo root:

```bash
npm install
```

## Commands (from repo root)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start **both** apps (Next :3000, Angular :4200) |
| `npm run dev:public` | Next.js dev server only |
| `npm run dev:internal` | Angular dev server only |
| `npm run build` | Production build for all apps |
| `npm run build:public` | Static export → `apps/public/out` |
| `npm run build:internal` | Angular build → `apps/internal/dist/internal/browser` |
| `npm run lint` | Lint all workspace packages |
| `npm run changeset` | Record a semver bump + changelog entry for a package |
| `npm run changeset:status` | Show pending changesets and packages to be released |
| `npm run version-packages` | Apply changesets (bump versions, update changelogs) |
| `npm run release:build` | Build all packages under `packages/` |
| `npm run release:publish` | Publish versioned packages to npm |
| `npm run release` | Build and publish (same as `release:ci`) |

Filter with Turbo directly:

```bash
npx turbo run dev --filter=public
```

## Environment (public site)

Copy [`apps/public/.env.example`](apps/public/.env.example) to `apps/public/.env.local` and set values for local builds.

## Adding shared packages

Create `packages/<name>/package.json`, then depend on it from an app with a workspace version (for example `"@org/lib": "*"`). Turborepo runs dependency builds first via `dependsOn: ["^build"]`.

## Package versioning (Changesets)

This repo uses [Changesets](https://github.com/changesets/changesets) to version and publish libraries under `packages/`. Apps (`public`, `internal`) are ignored.

### Day-to-day workflow

1. **After making a change** to a library, add a changeset:

   ```bash
   npm run changeset
   ```

   Choose the affected package(s), semver bump (`patch` / `minor` / `major`), and write a short summary for the changelog.

2. **When ready to release**, on your main branch with all changesets merged:

   ```bash
   npm run version-packages   # bumps package.json + CHANGELOG.md
   npm run release:build      # build packages
   npm run release:publish    # publish to npm (requires auth)
   ```

   Commit the version/changelog updates (for example `chore: version packages`).

3. **Check pending releases** at any time (requires a git repo with a `main` branch):

   ```bash
   npm run changeset:status
   ```

Dependent packages that use workspace `"*"` ranges get a patch bump automatically when an upstream library changes (`updateInternalDependencies` in [`.changeset/config.json`](.changeset/config.json)).

**Linked families:** packages in the same `fixed` group always release together at the same version:

| Group | Packages |
|-------|----------|
| Forms | `@nabarun-ngo/forms-core`, `@nabarun-ngo/forms-react`, `@nabarun-ngo/forms-angular` |
| Comments | `@nabarun-ngo/comment-core`, `@nabarun-ngo/comment-react`, `@nabarun-ngo/comment-angular` |

A changeset for any member bumps the whole group (the highest semver among selected bumps wins).

### CI release pipeline

GitHub Actions automates versioning and publishing on push to `main`:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [`.github/workflows/changeset-check.yml`](.github/workflows/changeset-check.yml) | Pull requests to `main` | Fails if `packages/` changed without a changeset |
| [`.github/workflows/release.yml`](.github/workflows/release.yml) | Push to `main` | Opens a **Version Packages** PR when changesets exist; publishes when that PR merges |

**Setup (one-time):**

1. Add repository secret **`NPM_TOKEN`** with an npm automation token that can publish `@nabarun-ngo/*` packages.
2. Ensure root [`.npmrc`](.npmrc) points `@nabarun-ngo` at GitHub Packages (already configured).
3. Merge PRs with changesets as usual — the release workflow opens a follow-up PR that bumps versions and changelogs.
4. Merge the **Version Packages** PR — packages are built and published automatically.

Local releases (`npm run release`, etc.) still work if you prefer manual control.

### Publishing notes

- Libraries under `packages/` are configured for restricted GitHub Packages publish (`publishConfig.access: restricted`).
- Scoped packages use `"access": "restricted"` in the changesets config; use `"access": "public"` for public npm packages.
- Configure npm auth before publish (`npm login` or `NPM_TOKEN` in CI / local shell).
