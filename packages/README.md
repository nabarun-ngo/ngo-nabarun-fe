# Shared packages

Cross-framework custom forms UI (aligned with NestJS `custom-forms` ruleset semantics, no runtime coupling):

| Package | Role |
|---------|------|
| `@nabarun-ngo/forms-core` | Models, visibility/dependency engine, validation, API adapters, submit serialization, demo fixture |
| `@nabarun-ngo/forms-react` | `useCustomForm`, `CustomForm`, field renderers; subpaths `@nabarun-ngo/forms-react/bootstrap` (Bootstrap preset + CSS), `@nabarun-ngo/forms-react/zod` |
| `@nabarun-ngo/forms-angular` | `CfForm`, `CfField`, `FormEngineService`, Angular Material defaults, `provideCfFormMaterial()` |
| `@nabarun-ngo/comment-core` | Mention tokens, comment editor value builders |
| `@nabarun-ngo/comment-angular` | `cm-mention-comment-editor`, `cm-comment-content` |
| `@nabarun-ngo/list-dashboard-core` | Unified list/detail/form config, form resolution, preparation, compilation |
| `@nabarun-ngo/list-dashboard-angular` | `<na-list-dashboard>` Angular host |
| `@nabarun-ngo/auth-core` | Auth user / RBAC models and helpers |
| `@nabarun-ngo/auth-angular` | Angular auth/RBAC services, guards, permission directive |

Each package has its own `package.json` and builds to `dist/**`. Apps depend on workspace packages with `"@nabarun-ngo/...": "*"`.

```bash
npm run build   # turbo builds packages before apps (^build)
```

After changing a package, run `npm run changeset` from the repo root to record a semver bump. Fixed version groups: forms, comments, list-dashboard, and auth. Packages publish as public scoped packages to npmjs. See the root [README](../README.md#package-versioning-changesets).

**Style override:** pass custom `components` (React) or `CUSTOM_FORM_FIELD_RENDERERS` / `CF_FORM_CLASS_NAMES` (Angular). Public Bootstrap preset: `@nabarun-ngo/forms-react/bootstrap` + `@nabarun-ngo/forms-react/bootstrap.css`. Angular defaults use Material; call `provideCfFormMaterial()` and import a theme.

**Legacy API payloads:** use `fromPublicFormDefinition()` and `normalizeFieldType()` to map uppercase mock types (`TEXT`, `CHECKBOX`) to canonical lowercase types.
