# ADR: Unified List Dashboard (Experience absorbed)

## Status

Accepted — Experience packages removed

## Decision

Absorb `@nabarun-ngo/experience-core` / `@nabarun-ngo/experience-angular` into
`@nabarun-ngo/list-dashboard-core` / `@nabarun-ngo/list-dashboard-angular`, then
delete the Experience packages. There is no shim layer.

Consumers write one typed `ListDashboardConfig` and bind it to `<na-list-dashboard>`.
Pages do not own controllers, preparation sync, or list mutation.

## Public API (locked)

- `ListDashboardConfig` — unified consumer config
- `list.mapToListRow` — domain → `ListRowItem` for load + post-save refresh
- `actions` — declarative bulk / detailFooter / floating actions
- `forms` / `preparation` / `operations`
- `ListDetailItemListSection` (`type: 'item_list'`) — nested collections in detail
- Host: `na-list-dashboard`
- `forRoot`: `DocumentListComponent` + `FileUploadComponent` only

## Consumer folders (mandatory)

Exactly: `config/`, `data/`, `domain/`, `page/`.

## Signed-off pilot

`apps/internal-app/src/app/feature/finance/donation/` is the reference consumer.
Cursor rules and the migrate skill treat it as authoritative for new migrations.

## Non-authoritative

Prior entity folder patterns (`experience/`, `forms/`, `mappers/`, `operations/`)
and outdated prompts that still say `donations/` (plural) are cleanup targets —
use `donation/` instead.
