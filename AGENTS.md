# AGENTS.md

Guidance for coding agents working in this repository.

## Project overview

Trama is the Angular application behind [trama.app](https://trama.app). It lets authors build branching narratives on a node-based board and lets players execute those stories in the playground. The public pages, the landing (`/`, `/es`, `/ca`) and the docs (`/docs/features` and its `/es` and `/ca` versions), are a separate static Astro site in `site/`, served from the same origin.

Main technologies:

- Angular 18 with standalone components
- TypeScript 5.5 and RxJS
- Native CSS with a shared token-based theme
- Supabase for Postgres, authentication, storage, and Deno edge functions
- Stripe subscription integration
- Astro (static, no UI framework) for the landing and docs pages in `site/`
- Playwright for end-to-end tests
- Karma and Jasmine for unit tests
- A separate AWS Lambda under `aws/resize-image/`

## Repository map

- `src/app/core/`: singleton services, guards, contracts, constants, and domain interfaces
- `src/app/shared/`: reusable UI, utilities, and application-wide state
- `src/app/features/`: feature areas such as the board, playground, and dashboard
- `src/app/core/interfaces/interfaces.ts`: canonical story domain model
- `src/app/shared/example-story/`: the example story new authors start with, also played on the landing
- `site/`: the Astro public site: pages (`site/src/pages/`, one per path in `site/src/lib/pages.ts`), components, interface copy in `site/src/i18n/` and the docs chapters in `site/src/docs/`
- `src/environments/`: Angular environment configuration
- `tests/`: Playwright end-to-end tests
- `supabase/functions/`: Deno edge functions
- `aws/resize-image/`: standalone image-resizing Lambda

Before changing story behavior, trace both authoring in `features/board/` and execution in `features/playground/`. They operate on the same tree model and can drift if only one side is updated.

## Setup and common commands

Use npm; `package-lock.json` is committed.

```bash
npm ci && npm ci --prefix site
npm start                       # local app at http://localhost:4200
npm run start:site              # local landing and docs at http://localhost:4321
npm run build                   # app + site merged in dist/polo-angular
npm run serve-dist              # serves that build like Vercel, at http://localhost:4300
npm run lint
npm test                        # Karma/Jasmine unit tests
npm run test:site               # Vitest unit tests of the site
npm run tests-e2e-playground    # Playwright playground suite
npm run tests-e2e-landing       # landing suite, against npm run serve-dist
npm run tests-e2e-dashboard     # authenticated Playwright dashboard suite
```

Do not run `npm run deploy-edge` unless the user explicitly requests a deployment. It targets the configured Supabase project.

## Development rules

- Keep changes narrowly scoped. Do not refactor unrelated legacy code while fixing a feature.
- Follow the existing Angular standalone-component architecture and local file organization.
- Preserve established naming conventions even where they differ from current Angular style guidance. Component selectors use `polo-`; directive selectors use `polo`.
- Match the existing formatting: two-space indentation, no semicolons, and single quotes in TypeScript.
- Use native `.css` files, with two-space indentation. Do not introduce Sass/SCSS or a parallel page-specific palette.
- `src/styles/tokens.css` is the single source of truth for the light/dark theme. Components consume semantic CSS variables; add shared tokens there rather than hardcoding theme colors.
- Treat `interfaces.ts` as a compatibility boundary. Changes to persisted story types must account for existing Supabase data and older stories with optional or missing fields.
- Avoid introducing more `any`; narrow values at data boundaries when practical, but do not broaden the task into a type-system rewrite.
- Keep business logic out of templates. Put shared behavior in services or utilities rather than duplicating it across components.
- Never add always-on global listeners (`@HostListener('document:…')`, `window:…`, or `document.addEventListener`) to components that can render many times. Every listener invocation triggers change detection, so one per instance multiplies the cost of each pointer move, click, or keypress by the number of instances. Register them only while needed (e.g. while pressed or open), outside Angular when the state is not rendered, and remove them on close and destroy. The board is the priority: real stories render hundreds of nodes, answers, and popovers, and efficiency comes first there.
- The public site (`site/`) is static HTML, built in every language for every page. Add interactivity with Astro `<script>` tags and custom elements, not a UI framework, and keep content in the HTML so it reads without JavaScript. It imports the theme, the engine and the example story from the app instead of copying them; `npm run lint` checks its styles against the shared tokens too.
- Production builds write the app's page as `app.html` so the site can own `index.html`; `vercel.json` maps the site's pages to their `.html` files and sends every other path to `app.html`. Links from the app to the site must be plain `href`s built with `siteUrl` (`src/app/core/site-links.ts`), not router links; in development they open the site's dev server.
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

For story execution changes, also run the playground Playwright tests. For landing or docs changes, run `npm run test:site`, then `npm run build`, `npm run serve-dist` and the landing Playwright tests. For authenticated dashboard changes, run the dashboard project when credentials and auth state are available. Do not claim that authenticated tests passed if they could not run.

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
