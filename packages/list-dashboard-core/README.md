# @nabarun-ngo/list-dashboard-core

Framework-agnostic types, configs, adapters, form/preparation runtime, and
route-query utilities for the Universal List Dashboard.

## Exports

- **Models** — `ListRowItem`, `ListDetailSection` (incl. `item_list`), `ChipFilter`, etc.
- **Configs** — `ListDashboardConfig` (unified consumer config), `FilteredListPageConfig`,
  `ListDetailPageConfig`, `FilteredListDashboardConfig`, `ListActionDef`
- **Runtime** — form resolve (local/backend/hybrid), preparation runner,
  `resolveListDashboardConfig` / `compileListDashboardConfig`
- **Adapters** — `createListPageAdapter`, `createDetailPageAdapter`
- **Utils** — route query, detail helpers (`detailItemListSection`), bulk-edit derive

## Consumer contract

Feature authors write one `ListDashboardConfig` and pass it to
`<na-list-dashboard>` in `@nabarun-ngo/list-dashboard-angular`.

Nested collections use `type: 'item_list'` sections — not host forRoot widgets.

## Build

```bash
npm run build -w @nabarun-ngo/list-dashboard-core
npm test -w @nabarun-ngo/list-dashboard-core
```

## Consumers

- `@nabarun-ngo/list-dashboard-angular` — Angular host
- `@nabarun-ngo/list-dashboard-react` — planned
- `@nabarun-ngo/public-site` — backend form resolution via `resolveListForm`

## Docs

- [ADR: unified list dashboard](./docs/ADR-unified-list-dashboard.md)
- [Design tokens](./docs/TOKENS.md)
- Angular developer guide: `@nabarun-ngo/list-dashboard-angular` → `docs/DEVELOPER-GUIDE.html`
