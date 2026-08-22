---
"@nabarun-ngo/list-dashboard-core": minor
"@nabarun-ngo/list-dashboard-angular": minor
---

Separate detail ids from detail titles, add a hero slot, and re-read the edit flow kind

The detail sheet used `getTitle(entity)` as the deep-link query param and as the
documents lookup id. That only works when the title happens to be the id, so
dashboards with display titles (members, donors, projects, transactions) wrote a
name into the URL and closed the sheet on reload because `fetchById` could not
resolve it. `ListDetailPageConfig` now accepts `getEntityId(entity)`, which the
route sync and document loading prefer, falling back to `getTitle` for configs
where the two are the same.

`createDetailPageAdapter` also snapshotted `edit.kind` at init, so configs that
choose between the single form and the stepper at runtime were locked into
whichever value existed before the dashboard had an active chip — leaving the
Edit button inert for the other branch. It is now read per edit.

New `listDetailHero` template directive on `na-list-dashboard` projects content
into the sheet's existing hero slot above the detail body, so pages no longer
have to put avatars and badges in the footer actions slot.

Stepper edit and action-form sheets also used to stack on top of an open detail
sheet, unlike the single-form edit which swaps the same sheet into edit mode. The
detail sheet now steps aside while an action form is open and comes back when it
closes, and the stepper edit header reads `<title> — Edit` like the in-sheet one.
