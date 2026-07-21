# AGENTS.md

Guidance for coding agents working in this repository.

## Project overview

Trama is the Angular application behind [trama.app](https://trama.app). It lets authors build branching narratives on a node-based board and lets players execute those stories in the playground.

Main technologies:

- Angular 18 with standalone components
- TypeScript 5.5 and RxJS
- Indented SASS
- Supabase for Postgres, authentication, storage, and Deno edge functions
- Stripe subscription integration
- Playwright for end-to-end tests
- Karma and Jasmine for unit tests
- A separate AWS Lambda under `aws/resize-image/`

## Repository map

- `src/app/core/`: singleton services, guards, contracts, constants, and domain interfaces
- `src/app/shared/`: reusable UI, utilities, and application-wide state
- `src/app/features/`: feature areas such as the board, playground, dashboard, and landing page
- `src/app/core/interfaces/interfaces.ts`: canonical story domain model
- `src/environments/`: Angular environment configuration
- `tests/`: Playwright end-to-end tests
- `supabase/functions/`: Deno edge functions
- `aws/resize-image/`: standalone image-resizing Lambda

Before changing story behavior, trace both authoring in `features/board/` and execution in `features/playground/`. They operate on the same tree model and can drift if only one side is updated.

## Setup and common commands

Use npm; `package-lock.json` is committed.

```bash
npm ci
npm start                       # local app at http://localhost:4200
npm run build                   # production build in dist/polo-angular
npm run lint
npm test                        # Karma/Jasmine unit tests
npm run tests-e2e-playground    # Playwright playground suite
npm run tests-e2e-dashboard     # authenticated Playwright dashboard suite
```

Do not run `npm run deploy-edge` unless the user explicitly requests a deployment. It targets the configured Supabase project.

## Development rules

- Keep changes narrowly scoped. Do not refactor unrelated legacy code while fixing a feature.
- Follow the existing Angular standalone-component architecture and local file organization.
- Preserve established naming conventions even where they differ from current Angular style guidance. Component selectors use `polo-`; directive selectors use `polo`.
- Match the existing formatting: two-space indentation, no semicolons, and single quotes in TypeScript.
- Use indented `.sass`, not SCSS syntax.
- Treat `interfaces.ts` as a compatibility boundary. Changes to persisted story types must account for existing Supabase data and older stories with optional or missing fields.
- Avoid introducing more `any`; narrow values at data boundaries when practical, but do not broaden the task into a type-system rewrite.
- Keep business logic out of templates. Put shared behavior in services or utilities rather than duplicating it across components.
- Do not leave `console.log` or `console.debug` calls. ESLint permits `console.warn` and `console.error`.
- Never commit credentials, service-role keys, Stripe secrets, authenticated Playwright state, or local `.env` files. Supabase anon keys are public client configuration, but privileged keys are not.
- Do not edit production infrastructure or deploy application/backend changes unless explicitly asked.

## Testing and verification

Run the smallest relevant test first, then the broader checks justified by the change.

Minimum verification for frontend changes:

```bash
npm run lint
npm run build
```

For story execution changes, also run the playground Playwright tests. For authenticated dashboard changes, run the dashboard project when credentials and auth state are available. Do not claim that authenticated tests passed if they could not run.

Playwright uses:

- `http://localhost:4200` locally
- `https://trama.app` in CI
- `playwright/.auth/user.json` for dashboard authentication

Add or update tests for behavior changes. Prefer regression tests that fail before the fix. Do not weaken assertions merely to make an existing failure disappear.

## Change hygiene

- Inspect `git diff` before finishing.
- Do not modify generated output such as `dist/`.
- Do not rewrite the lockfile unless dependencies actually changed.
- Report the commands run and their real results, including skipped or blocked checks.
- Do not commit or push unless explicitly requested.
