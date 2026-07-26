# Shared packages

Cross-framework custom forms UI (aligned with NestJS `custom-forms` ruleset semantics, no runtime coupling):

| Package | Role |
|---------|------|
| `@nabarun-ngo/forms-core` | Models, visibility/dependency engine, validation, API adapters, submit serialization, demo fixture |
| `@nabarun-ngo/forms-react` | `useCustomForm`, `CustomForm`, field renderers; subpaths `@nabarun-ngo/forms-react/bootstrap` (Bootstrap preset + CSS), `@nabarun-ngo/forms-react/zod` |
| `@nabarun-ngo/forms-angular` | `CfForm`, `CfField`, `FormEngineService`, Angular Material defaults, `provideCfFormMaterial()` |

Each package has its own `package.json` and builds to `dist/**`. Apps depend on workspace packages with `"@nabarun-ngo/forms-core": "*"` (and `@nabarun-ngo/forms-react` / `@nabarun-ngo/forms-angular` as needed).

```bash
npm run build   # turbo builds packages before apps (^build)
```

After changing a package, run `npm run changeset` from the repo root to record a semver bump. Forms packages (`forms-core`, `forms-react`, `forms-angular`) and comment packages (`comment-core`, `comment-react`, `comment-angular`) version together as linked families. See the root [README](../README.md#package-versioning-changesets).

**Style override:** pass custom `components` (React) or `CUSTOM_FORM_FIELD_RENDERERS` / `CF_FORM_CLASS_NAMES` (Angular). Public Bootstrap preset: `@nabarun-ngo/forms-react/bootstrap` + `@nabarun-ngo/forms-react/bootstrap.css`. Angular defaults use Material; call `provideCfFormMaterial()` and import a theme.

**Legacy API payloads:** use `fromPublicFormDefinition()` and `normalizeFieldType()` to map uppercase mock types (`TEXT`, `CHECKBOX`) to canonical lowercase types.
