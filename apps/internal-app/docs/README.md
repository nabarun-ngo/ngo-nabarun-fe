# @nabarun-ngo/internal-app

Nabarun NGO internal Angular app.

## Getting started

```bash
npm run setup        # env.generated.ts + PWA icons/splash from logo.png
npm run dev          # http://localhost:4200
npm run build        # production
npm run build:stage  # stage configuration
npm run lint         # tsc --noEmit
npm run test
npm run sync:api     # regenerate OpenAPI client from swagger.json
npm run clean:all    # wipe generated artifacts + dist/cache
```

Generated (gitignored): `src/environments/env.generated.ts`, `src/assets/icons/`,
`src/assets/splash/`, `src/app/core/api/api-client/`.

Demo/mock data lives under `src/demo/` (sibling of `src/app/`), swapped in via
feature `data/*.providers.ts` when `NG_APP_MOCK_DATA=true`.

## Feature folder structure

Canonical layout for list/detail features. Signed-off pilot code:
`src/app/feature/finance/donation/`.

Also enforced by `.cursor/rules/reusable-first-migrations.mdc` and
`.cursor/rules/demo-data-isolation.mdc`.

### Standard list entity

```text
src/app/feature/<domain>/<entity>/
├── config/   # <entity>.config.ts (only public factory: create<Entity>ListConfig)
│             # <entity>.forms.ts, <entity>.rules.ts, <entity>.view.ts
├── data/
│   ├── api/                 # *ApiDataSource
│   ├── <entity>-data.source.ts
│   ├── <entity>-data.mapper.ts
│   ├── <entity>.providers.ts  # ONLY place that reads MOCK_DATA
│   └── <entity>.resolver.ts   # when needed
├── domain/   # pure models, criteria, ref-data keys
└── page/     # thin host → <na-list-dashboard [config]>
```

```text
src/demo/<domain>/<entity>/
├── <entity>-demo.data-source.ts
└── <entity>-demo.fixtures.ts   # or *.demo-data.ts
```

### Rules

- Page binds `[config]` to `<na-list-dashboard>` only.
- Do not import `FilteredListDashboardController` / `ListDashboardRuntime` in pages.
- Domain I/O, mapping, preparation, and actions live in `config/`.
- `data/` maps API DTOs → domain only — never `ListRowItem`.
- UI row/detail shaping lives in `config/<entity>.view.ts`.
- Condition-hidden field values must not be submitted.
- Create deep links must run `createOpen` preparation before opening the sheet.

### Forbidden under a feature entity

`experience/`, `forms/`, `preparation/`, `operations/`, `mappers/`, `services/`,
`service/`, `model/`, `pages/`, `application/`, `presentation/`, `fields/`,
`data/demo/` (use `src/demo/` instead).

### Exceptions

| Kind | Layout |
| --- | --- |
| **Domain hub** (`finance-hub/`, `project-hub/`) | Tile landing only. Module/routing/providers at domain root. |
| **Dashboard** | `page/` + `data/` (API metrics + providers). Demo under `src/demo/dashboard/`. |
| **Help** | `data/`, `domain/`, `page/`, plus `components/` and `styles/`. Content from Help Portal API (or demo). |
| **Optional `components/`** | Entity-local UI only (e.g. meeting stepper steps). |

### Domain with many entities (project)

```text
src/app/feature/project/
├── project-hub/
├── project/ | activity/ | goal/ | beneficiary/ | milestone/ | team/ | risk/
│   └── config/ data/ domain/ page/
├── project.module.ts
├── project-routing.module.ts
└── project.providers.ts
```

Demo: `src/demo/project/<entity>/`.

## Donation pilot (behavior)

Copy `src/app/feature/finance/donation/` when adding a list dashboard.

**Integration**

- `provideDonationInfrastructure()` in feature providers
- `donationRefDataResolver` for route data key `ref_data`
- Route to standalone `DonationDashboardComponent`

**Behavior**

- Mine / All Outstanding / All Closed chips
- Search, route-bound filters, project activity scope
- Detail, documents, create stepper, bulk edit
- Declarative actions (Pay Now, Bulk Update, Create FAB)
- Donor overlay via `listOverlay` + operation callback
- API/demo selection through providers
- Create deep link prepares donor options before open
- Edit/bulk forms use status-driven conditions; hidden values are not submitted

## Related

- List dashboard (core): [`../../../packages/list-dashboard-core/docs/`](../../../packages/list-dashboard-core/docs/)
- List dashboard (Angular guide): [`../../../packages/list-dashboard-angular/docs/DEVELOPER-GUIDE.html`](../../../packages/list-dashboard-angular/docs/DEVELOPER-GUIDE.html)
- Business capability docs (workspace): `.cursor/docs/business/`
