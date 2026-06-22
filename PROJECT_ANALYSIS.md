# Trama — Project Analysis

_Generated: 2026-06-22_

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
| `services/database.service.ts` (381 lines) | Supabase client wrapper; the central data-access layer. Holds the `user` signal. |
| `services/auth.service.ts` | Logout / session teardown. |
| `services/apis.service.ts` | Calls the AWS Lambda image optimizer. |
| `services/modal.service.ts`, `alert.service.ts`, `context-menus.service.ts` | Imperative dynamic-component mounting via `ApplicationRef` + `createComponent`. Modal & Alert services are near-duplicates (acknowledged in a code comment). |
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
- **Unit tests:** Karma + Jasmine. 47 `.spec.ts` files, but **45 are default
  "should create" scaffolds** — effectively no real unit coverage.
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
- ⚠️ **`any` overload:** ~170 `: any` annotations (incl. `supabase: any`,
  `entireTree: WritableSignal<any>`, `user: signal(null)` untyped). This
  largely defeats the strict-mode safety net at the most important boundaries
  (data layer + central story state).
- ⚠️ **Unit tests are stubs:** only 2 of 47 specs do anything beyond
  instantiation. The safety net is E2E-only.
- ⚠️ **Broken spec:** `features/board/board.component.spec.ts` imports
  `./components/board/board.component`, but the file lives at
  `features/board/board.component.ts` — the path is wrong, so this spec cannot
  compile/run as written.
- ⚠️ **God objects:** `active-story.service.ts` (674 lines) and
  `game.component.ts` (465 lines) concentrate a lot of logic; candidates for
  decomposition.
- ⚠️ **Duplication:** `modal.service` vs `alert.service` are near-identical by
  the author's own comment.
- ⚠️ **71 `console.log`** statements left in source.
- ⚠️ **Partial signals adoption:** only ~7 files use signals/`computed`/`effect`;
  state management style is mixed (signals + imperative DOM + 7 raw `.subscribe`
  calls without obvious teardown).
- ⚠️ **Stale README:** still the default Angular CLI boilerplate referencing
  "PoloAngular" / CLI v16 — no project-specific documentation.
- ⚠️ Repo-committed artifact (`illaDesertaBackup.json`, 51 KB) and a large
  committed `package-lock.json` (expected) bloat the root.

### Security Notes
- The Supabase **anon key** is committed in `src/environments/environment.ts`.
  This is by design public (client-side, protected by Row-Level Security) — **not
  a leak** — but it means **security correctness depends entirely on Supabase RLS
  policies**, which are not visible in this repo. Worth auditing separately.
- No `.env` or service-role keys are tracked (`.gitignore` covers `.env`). Good.
- Edge functions handle payments (Stripe) — those should be reviewed for
  signature verification, but live server-side which is correct.

---

## 6. Activity / Maintenance Status

- **50 commits total**, project started **2024-11-02**.
- **Most recent commit dates from 2025-07-18** — i.e. **no commits in the last
  ~11 months** relative to today (2026-06-22). The codebase appears **dormant /
  in maintenance hibernation** despite being a live product.

---

## 7. Recommendations (prioritized)

1. **Audit Supabase RLS policies** — the entire data-security model rests on
   them and they aren't in-repo.
2. **Fix the broken `board.component.spec.ts` import** so the unit suite at
   least compiles.
3. **Type the data boundary:** replace `any` on the Supabase client, `user`,
   and `entireTree` with the existing `interfaces.ts` types (or generated
   Supabase types). Highest ROI for the strict-mode investment.
4. **Strip `console.log`** statements (lint rule to enforce).
5. **Add real unit tests** for `tree-searching` utils and `player.service`
   logic — pure, high-value, currently untested.
6. **Decompose** `active-story.service.ts` and `game.component.ts`.
7. **De-duplicate** `modal`/`alert` services into one parameterized service.
8. **Rewrite the README** with actual setup, env, and architecture docs.
