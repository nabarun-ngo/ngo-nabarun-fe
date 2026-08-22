---
"@nabarun-ngo/forms-angular": minor
"@nabarun-ngo/comment-angular": minor
---

Support Angular 21 alongside 19 and 20

Peer ranges widen to `^19.0.0 || ^20.0.0 || ^21.0.0` so the internal app can
consume these packages on Angular 21 without existing consumers on 19 having
to move.

Both packages also pointed `types` at `dist/index.d.ts`, which ng-packagr no
longer emits; it writes `dist/types/<name>.d.ts` instead. TypeScript was
therefore treating both packages as untyped `any`. They now point at the file
that is actually produced.

Because forms-angular and comment-angular sit in fixed version groups, this
also versions the corresponding core and react packages.
