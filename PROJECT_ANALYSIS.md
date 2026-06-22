# Trama — Project Analysis

_Generated: 2026-06-22 · Updated: 2026-06-22 after an initial cleanup pass_

> **Update note:** Several items flagged below have since been addressed on
> branch `claude/awesome-curie-c6snch` (data-boundary typing, ESLint setup,
> modal/alert de-duplication, two broken specs, README). Fixed items are marked
> ~~struck through~~ with a ✅; see §8 for the change log.

## 1. Overview

**Trama** (package name `polo-angular`) is an Angular 18 single-page web
application for **building and playing interactive, branching narratives**
("stories"). Authors design stories visually on a node-based board, and end
users play through them in a runtime "playground". The product is commercial:
it has a marketing landing page, tiered subscription pricing (Stripe), and a
Supabase backend.

- **Public site:** https://trama.app
- **Framework:** Angular 18.2 (standalone components, partial signals adoption)
- **Backend:** Supabase (Postgres + Auth + Edge Functions)
- **Auxiliary:** AWS Lambda (image resizing), Stripe (payments)
- **Styling:** SASS (indented syntax), per-component stylesheets
- **Repo state:** branch `claude/awesome-curie-c6snch`, working tree clean

---

## 2. Architecture & Sections

The app uses a conventional **`core` / `shared` / `features`** layout under
`src/app`, with feature-based lazy routing assembled in `src/app/routes.ts`.

### 2.1 Core (`src/app/core`)
Cross-cutting singletons and contracts.

| Part | Notes |
|------|-------|
| `services/database.service.ts` (~390 lines) | Supabase client wrapper; the central data-access layer. Now typed (`SupabaseClient`, `WritableSignal<appUser \| null>`). |
| `services/auth.service.ts` | Logout / session teardown. |
| `services/apis.service.ts` | Calls the AWS Lambda image optimizer. |
| `services/overlay.service.ts` | Shared base for dynamic-component mounting via `ApplicationRef` + `createComponent`. |
| `services/modal.service.ts`, `alert.service.ts` | Thin subclasses of `OverlayService` (Alert returns a Promise; Modal returns the ref). Previously near-identical, now de-duplicated. |
| `services/context-menus.service.ts` | Imperative context-menu mounting. |
| `guards/auth.guard.ts` | Route protection. |
| `interfaces/interfaces.ts` (131 lines) | Central domain model: `node`, `node_answer`, `event`, `condition`, `tree`, `game`, `result`, etc. |
| `constants.ts` | Pricing constants. |

### 2.2 Shared (`src/app/shared`)
Reusable UI and app-wide state.

- **`components/ui/`** — design-system primitives: `basic-button`, `modal-window`,
  `alert-window`, `selector`, `dropdown-button`, `select-or-create`, `image`,
  `separator`, `google-login`, `popup-base`.
- **`components/`** — marketing/commerce widgets: `pricing`, `billing-cycle`, `link`.
- **`services/active-story.service.ts` (674 lines)** — the **largest and most
  central file**: holds the in-memory story tree (nodes, refs, config) as signals
  and is the source of truth for the editor.
- **`services/statistics.service.ts`, `storage.service.ts`**
- **`utils/tree-searching.ts`, `normalizers.ts`** — pure helpers for locating
  nodes/answers/conditions in the tree and ID generation.

### 2.3 Features (`src/app/features`)
Each feature ships its own `routes.ts`.

| Feature | Purpose |
|---------|---------|
| **`landing-page`** | Marketing site (cards, mobile variant, `exampleStory.ts` demo data). |
| **`login`** | Auth pages: login, reset-password, change-password (Supabase + Google OAuth). |
| **`dashboard`** | Authoring shell: story menu, top bar, tree legend, statistics layer, and modals (share-story, profile, creator-paywall, delete-story). |
| **`board`** | **The editor core.** Node-based canvas with pan/zoom (`panzoom`). Rich node model: answers, conditions, events, requirements, references; context-menus for editing. Largest sub-tree in the app. |
| **`playground`** | **The runtime player.** Executes a story tree: `player.service.ts`, `game.component.ts` (465 lines), handles flows, conditions, stats, user-text input. |
| **`statistics`** | Aggregated play results / analytics views. |
| **`feedback`** | Feedback modal → Supabase edge function email. |

### 2.4 Backend (`supabase/`)
Edge Functions (Deno): `create-subscription`, `update-subscription`,
`cancel-subscription-request`, `send-feedback-email`. Plus `config.toml` and
`seed.sql`. Deployed via the `deploy-edge` npm script.

### 2.5 Other
- **`aws/resize-image/`** — standalone Lambda (Node) for image optimization.
- **`illaDesertaBackup.json`** (51 KB) — a serialized example/backup story tree
  committed to the repo root.

---

## 3. Domain Model (the interesting part)

The product's depth lives in `interfaces.ts`. A story is a `tree` of `node`s
(`text | content | distributor | end`). Each node can carry:
- **answers** with their own `events` and `requirements`,
- **conditions** + a **fallbackCondition** (branching logic),
- **events** (`alterStat | alterCondition | alterProperty`),
- **joins** (graph edges), links, share options, and free-text input options.

Playthroughs produce a `game` record (`path`, `result`, `stats`, `conditions`,
plus `external_events` like tab-blur tracking) — feeding the statistics feature.
This is a well-thought-out, genuinely expressive narrative engine.

---

## 4. Tooling & Quality Gates

- **TypeScript:** `strict: true` plus `noImplicitOverride`,
  `noImplicitReturns`, `noFallthroughCasesInSwitch`,
  `noPropertyAccessFromIndexSignature`. Angular `strictTemplates` on. **Strong.**
- **Formatting:** Prettier + `.editorconfig` + `.prettierignore`.
- **Linting:** ESLint (flat config, `angular-eslint` v18) via `npm run lint`.
  `no-console` and `no-unused-vars` are active as warnings; accessibility and
  `onXxx`-output rules are warnings (existing debt, doesn't fail the lint).
  **0 errors / ~197 warnings** as a baseline to pay down.
- **Unit tests:** Karma + Jasmine. 47 `.spec.ts` files, but **45 are default
  "should create" scaffolds** — effectively no real unit coverage. (Two of
  these were broken imports that couldn't compile; both now fixed.)
- **E2E tests:** Playwright (`tests/`), split into `dashboard` (auth'd) and
  `playground` projects across Chrome/Firefox/Safari. These are **real,
  behavior-driven tests** (single flows, cumulative flows, edge cases) and are
  the project's meaningful test asset.
- **CI:** `.github/workflows/playwright.yml` (single workflow).
- **TS coverage reporting:** `typescript-coverage-report` configured.

---

## 5. Code Health Assessment

### Strengths
- ✅ Clean, predictable feature-based architecture; easy to navigate.
- ✅ Strict TypeScript + strict Angular templates enabled.
- ✅ Modern Angular: **49 standalone components**, lazy per-feature routes.
- ✅ Meaningful Playwright E2E suite covering core play flows cross-browser.
- ✅ Pure, testable utilities isolated in `shared/utils`.
- ✅ Consistent styling/formatting conventions.

### Weaknesses & Risks
- ✅ ~~**`any` overload** at the data boundary (`supabase: any`, `user`
  untyped).~~ **Fixed** for the data layer: `supabase` is now `SupabaseClient`
  and `user` is `WritableSignal<appUser | null>`, which surfaced and fixed
  several latent null-safety bugs. **Still open:** `entireTree:
  WritableSignal<any>` (the central story state, ~109 usages) remains `any`
  — typing it is a larger, deliberate refactor. ~110 other `: any` remain.
- ⚠️ **Unit tests are stubs:** only 2 of 47 specs do anything beyond
  instantiation. The safety net is E2E-only.
- ✅ ~~**Broken specs** that couldn't compile~~ — **Fixed**:
  `board.component.spec.ts` (wrong import path) and
  `landing-link.component.spec.ts` (non-existent component name).
- ⚠️ **God objects:** `active-story.service.ts` (674 lines) and
  `game.component.ts` (465 lines) concentrate a lot of logic; candidates for
  decomposition. _(Still open.)_
- ✅ ~~**Duplication:** `modal.service` vs `alert.service`.~~ **Fixed** —
  extracted a shared `OverlayService` base; each is now a ~10-line subclass.
- ⚠️ **~86 `console.log`** statements remain, now flagged by the `no-console`
  lint rule (a handful of egregious debug logs were removed; the bulk and the
  dev-gated `%cdb` tracing are left as lint warnings to pay down).
- ⚠️ **Partial signals adoption:** only ~7 files use signals/`computed`/`effect`;
  state management style is mixed (signals + imperative DOM + 7 raw `.subscribe`
  calls without obvious teardown). _(Still open.)_
- ✅ ~~**Stale README** (default Angular boilerplate).~~ **Fixed** — rewritten
  with real stack/structure/dev/test/deploy docs.
- ⚠️ Repo-committed artifact (`illaDesertaBackup.json`, 51 KB) and a large
  committed `package-lock.json` (expected) bloat the root. _(Still open.)_

### Security Notes
- The Supabase **anon key** is committed in `src/environments/environment.ts`.
  This is by design public (client-side, protected by Row-Level Security) — **not
  a leak** — but it means **security correctness depends entirely on Supabase RLS
  policies**, which are not visible in this repo. Worth auditing separately.
- No `.env` or service-role keys are tracked (`.gitignore` covers `.env`). Good.
- Edge functions handle payments (Stripe) — those should be reviewed for
  signature verification, but live server-side which is correct.
- ⚠️ **Dependency vulnerabilities:** `npm audit` reports ~58 vulnerabilities
  (after applying the safe subset). The remaining ones only resolve via
  `npm audit fix --force`, which would **downgrade** `@angular-devkit/build-angular`
  to a 2019-era version and break the build — so they require a *coordinated*
  Angular/Supabase upgrade, not an autofix. (Note: even the "non-breaking"
  autofix bumps `@supabase/supabase-js` into a type-incompatibility with the
  pinned `auth-js` override, so it was intentionally not applied.)

---

## 6. Activity / Maintenance Status

- **50 commits total**, project started **2024-11-02**.
- **Most recent commit dates from 2025-07-18** — i.e. **no commits in the last
  ~11 months** relative to today (2026-06-22). The codebase appears **dormant /
  in maintenance hibernation** despite being a live product.

---

## 7. Recommendations (prioritized)

**Remaining (open):**

1. **Audit Supabase RLS policies** — the entire data-security model rests on
   them and they aren't in-repo. _(Highest priority; unchanged.)_
2. **Type `entireTree`** — the last big `any` at the data boundary (~109
   usages, shape diverges from the `tree` interface). A deliberate refactor,
   but it would close out the strict-mode story-state gap.
3. **Add real unit tests** for `tree-searching` utils and `player.service`
   logic — pure, high-value, currently untested.
4. **Pay down the lint warnings** — drive `no-console` / `no-unused-vars` to
   zero; consider renaming `onXxx` `@Output()`s and fixing template a11y.
5. **Decompose** `active-story.service.ts` and `game.component.ts`.
6. **Plan a coordinated dependency upgrade** to clear the remaining audit
   vulnerabilities (cannot be autofixed without breaking the build).

**Completed in the cleanup pass (see §8):**

- ✅ Fixed both broken specs.
- ✅ Typed the Supabase client + `user` signal (fixing latent null bugs).
- ✅ De-duplicated `modal`/`alert` into a shared `OverlayService`.
- ✅ Added ESLint (`no-console`, `no-unused-vars`) + `npm run lint`.
- ✅ Rewrote the README.

---

## 8. Change Log — cleanup pass (branch `claude/awesome-curie-c6snch`)

Each step verified with a green `ng build`, ESLint (0 errors), and spec
typecheck (`tsc -p tsconfig.spec.json`).

1. **Quick fixes** — corrected `board.component.spec.ts` import; changed an
   invalid literal-as-type (`external_event.time: 1708971350724`) to `number`;
   removed leftover debug `console.log`s.
2. **Data-boundary typing** — `supabase: SupabaseClient`,
   `user: WritableSignal<appUser | null>`; added `appUser`/`userProfile`
   interfaces; consolidated duplicate `externalEvent`/`external_event`; added
   null guards (fixing e.g. `!stories[0]` throwing when a query errored).
3. **Tooling & cleanup** — ESLint flat config + `npm run lint`; safe
   `eslint --fix` + Prettier (`prefer-const`, lifecycle interfaces); extracted
   `OverlayService`; renamed root selector `app-root` → `polo-root`; fixed the
   `landing-link` spec; rewrote the README.

**Deliberately not done:** `npm audit fix` (breaks the build — see §5 Security),
and typing `entireTree` (larger refactor — see recommendation #2).
