# Trama

Trama is a web app for **building and playing interactive, branching
narratives**. Authors design stories visually on a node-based board, and
players move through them in a runtime "playground". It is the codebase behind
[trama.app](https://trama.app).

Built with **Angular 18** (standalone components) and a **Supabase** backend
(Postgres + Auth + Edge Functions), with Stripe for subscriptions and an AWS
Lambda for image optimization.

## Tech stack

- **Frontend:** Angular 18.2, standalone components, RxJS, SASS (indented)
- **Backend:** Supabase (`@supabase/supabase-js`) — auth, Postgres, storage, edge functions
- **Payments:** Stripe (subscription links + edge functions)
- **Testing:** Playwright (e2e), Karma + Jasmine (unit)
- **Misc:** panzoom (board canvas), html2canvas, ngx-markdown

## Project structure

```
src/app/
  core/        Singletons & contracts: database/auth/modal/alert services,
               guards, interfaces (the domain model), constants
  shared/      Reusable UI components, app-wide state
               (active-story.service holds the in-memory story tree), utils
  features/
    landing-page/  Marketing site
    login/         Auth pages (Supabase + Google OAuth)
    dashboard/     Authoring shell (story menu, stats, modals)
    board/         The node-based story editor
    playground/    The runtime player that executes a story tree
    statistics/    Aggregated play results / analytics
    feedback/      Feedback modal -> edge function email
supabase/functions/   Deno edge functions (subscriptions, feedback email)
aws/resize-image/     Standalone Lambda for image optimization
tests/                Playwright e2e specs
```

The story domain model lives in `src/app/core/interfaces/interfaces.ts`
(`node`, `node_answer`, `event`, `condition`, `tree`, `game`, …).

## Development

Install dependencies and start the dev server:

```bash
npm install
npm start          # ng serve -> http://localhost:4200/
```

Environment config lives in `src/environments/`. `environment.ts` is used for
production builds and `environment.development.ts` for development (Supabase URL
+ anon key, Stripe links). The Supabase anon key is public by design; data
access is protected by Supabase Row-Level Security policies.

## Build

```bash
npm run build      # production build to dist/polo-angular
npm run watch      # development build, rebuild on change
```

## Testing

```bash
npm test                       # unit tests (Karma/Jasmine)
npm run tests-e2e-playground   # Playwright e2e, playground project
npm run tests-e2e-dashboard    # Playwright e2e, dashboard project (needs auth)
```

Playwright config is in `playwright.config.ts`; e2e specs live in `tests/`.
In CI the suite runs against `https://trama.app`; locally against
`http://localhost:4200`.

## Edge functions

Supabase edge functions are under `supabase/functions/`. Deploy the
subscription function with:

```bash
npm run deploy-edge
```
