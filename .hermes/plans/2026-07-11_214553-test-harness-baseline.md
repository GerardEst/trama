# Test Harness Baseline Repair Plan

> **For Hermes:** Implement this plan task-by-task. Keep production behavior unchanged; this work is limited to test configuration, test fixtures, package scripts, and CI.

**Goal:** Make one deterministic local command install, lint, unit-test, build, and exercise the playground against the checked-out application, with failures that represent application regressions rather than broken test setup.

**Architecture:** Preserve Angular 18, Karma/Jasmine, and Playwright. Repair the existing harness instead of introducing another test framework. Use explicit test fixtures for components, explicit Playwright browser projects, and a local Playwright-managed dev server. Keep authenticated dashboard testing separate from the public playground gate.

**Tech Stack:** Angular CLI 18, Karma/Jasmine, Chromium, Playwright, npm, GitHub Actions.

---

## Scope boundary

This plan may modify:

- Test files (`*.spec.ts`, `tests/**`)
- Test runner configuration
- `package.json` and the lockfile only if scripts/tooling dependencies genuinely change
- Node-version metadata
- GitHub Actions workflows
- Documentation about running tests

This plan must not:

- Change application behavior to satisfy a broken test
- Refactor production components or services
- Rename application outputs or selectors
- Change Supabase data, schema, credentials, or deployed functions
- Change payment logic
- Deploy anything
- Hide failures by disabling tests or weakening meaningful assertions

If a failing test reveals a real production defect, stop and record it as separate application work.

## Known starting baseline

- `npm ci`: passes; 1,279 packages installed
- `npm run lint`: passes with 194 warnings
- `npm run build`: passes; bundle-size warning remains
- Unit tests: 64 pass, 9 fail
- Playground e2e: blocked before application execution by Playwright configuration and WebKit host dependencies
- Existing `playwright.config.ts` spreads Chrome, Firefox, and Safari device descriptors into one `use` object; Safari/WebKit wins
- Existing Playwright `webServer` block is disabled
- Existing HTML reporter can keep an interactive terminal command alive
- System Chromium is available at `/snap/bin/chromium`, but Karma does not discover it automatically

---

### Task 1: Pin and document the Node runtime

**Objective:** Ensure developers, agents, and CI use the same supported Node major version.

**Files:**

- Create: `.nvmrc`
- Modify: `package.json`
- Modify: `README.md`

**Steps:**

1. Confirm Angular 18 compatibility with the chosen Node release. Prefer Node 22 only if all current tooling supports it; otherwise pin Node 20 LTS.
2. Put the chosen major/version in `.nvmrc`.
3. Add a matching `engines.node` constraint to `package.json`.
4. Document `nvm use` before `npm ci` in `README.md`.
5. Run `npm ci` and `npm run build` under the pinned runtime.

**Verification:**

```bash
node --version
npm ci
npm run build
```

Expected: the reported Node version satisfies `package.json`; install and build pass.

---

### Task 2: Add bounded, non-interactive npm commands

**Objective:** Give humans and agents canonical commands that terminate and return meaningful exit codes.

**Files:**

- Modify: `package.json`
- Modify: `README.md`
- Modify: `AGENTS.md`

**Proposed scripts:**

```json
{
  "test:unit:ci": "ng test --watch=false --browsers=ChromeHeadless",
  "test:e2e:playground": "playwright test --project=playground-chromium --reporter=line",
  "test:e2e:dashboard": "playwright test --project=dashboard-chromium --reporter=line",
  "check": "npm run lint && npm run test:unit:ci && npm run build",
  "check:full": "npm run check && npm run test:e2e:playground"
}
```

**Steps:**

1. Add the scripts without removing the existing developer-friendly commands yet.
2. Use local package binaries through npm scripts; avoid `npx` downloading unexpected packages.
3. Document `npm run check` as the default pre-commit gate.
4. Document `npm run check:full` as the public-flow gate.
5. Do not include dashboard e2e in the default gate because it requires authentication.

**Verification:**

```bash
npm run
npm run build
```

Expected: all new scripts are listed and the existing build still passes.

---

### Task 3: Make Karma find a browser portably and exit cleanly

**Objective:** Run unit tests without manually exporting a machine-specific `CHROME_BIN`, and eliminate the post-suite disconnect delay.

**Files:**

- Inspect/modify or create the Karma configuration used by Angular (`karma.conf.js` if introduced)
- Modify: `angular.json` only if needed to point at the Karma config
- Modify: `package.json`

**Steps:**

1. Check for `CHROME_BIN` first so CI and developer overrides continue to work.
2. Detect common local browser executables only in the runner configuration, not application code:
   - `google-chrome`
   - `google-chrome-stable`
   - `chromium`
   - `chromium-browser`
3. If no browser is found, fail immediately with an actionable message.
4. Define a CI launcher based on `ChromeHeadless` with appropriate flags only if the environment requires them. Do not add `--no-sandbox` by default unless CI proves it necessary.
5. Tune Karma single-run completion settings so it exits after reporting results instead of waiting for a 30-second disconnect.
6. Run the suite twice to detect flaky runner behavior.

**Verification:**

```bash
npm run test:unit:ci
npm run test:unit:ci
```

Expected after Tasks 4–6: both runs terminate promptly with 73/73 passing and exit code 0.

---

### Task 4: Repair the four animation test fixtures

**Objective:** Give modal tests the animation provider supplied by the real application, without changing modal production code.

**Files:**

- Modify: `src/app/shared/components/ui/modal-window/modal-window.component.spec.ts`
- Modify: `src/app/features/dashboard/modals/profile-modal/profile-modal.component.spec.ts`
- Modify: `src/app/features/dashboard/modals/creator-paywall/creator-paywall.component.spec.ts`
- Modify: `src/app/features/dashboard/modals/share-story/share-story.component.spec.ts`

**Steps:**

1. Add Angular's no-op animation provider/module to each test bed. For Angular 18 standalone tests, prefer the non-deprecated supported provider API available in this project.
2. Keep the component's actual animations configured; do not remove animation metadata from production components.
3. Run each affected spec in isolation if Angular CLI's include option is available.
4. Run the full unit suite to catch shared TestBed effects.

**Verification:**

```bash
npm run test:unit:ci -- --include='src/app/shared/components/ui/modal-window/modal-window.component.spec.ts'
npm run test:unit:ci
```

Expected: the four `NG05105: Unexpected synthetic property` failures disappear.

---

### Task 5: Repair component input and service fixtures

**Objective:** Construct `ConditionComponent`, `GameNodeComponent`, and `AnswerComponent` with the minimum valid state their production parents are expected to provide.

**Files:**

- Modify: `src/app/features/board/components/condition/condition.component.spec.ts`
- Modify: `src/app/features/playground/components/game/components/game-node/game-node.component.spec.ts`
- Modify: `src/app/features/board/components/node/answer/answer.component.spec.ts`

**Condition fixture:**

1. Inspect `ActiveStoryService.entireTree()` and provide a controlled test double containing at least an empty `refs` object.
2. Give the host/native element a deterministic ID before the initial `detectChanges()` if component initialization relies on it.
3. Test that the component builds its reference options from the supplied tree; do not retain only a vacuous “should create” assertion.

**Game node fixture:**

1. Set `component.data` before the initial `detectChanges()`.
2. Use the smallest valid node matching the template's unconditional reads, including fields such as `image`, `type`, text/answers, and joins where required.
3. Add one assertion proving the fixture renders the expected text or control.

**Answer fixture:**

1. Supply deterministic doubles for `ActiveStoryService.getEventsOfAnswer`, `getRequirementsOfAnswer`, and `PanzoomService.focusElements`.
2. Give the element a stable answer ID before initialization.
3. Assert that events and requirements are loaded from the service double.

**Rule:** If valid parent input still crashes production code for an ordinary persisted story, record a separate application bug instead of adding production null guards in this harness branch.

**Verification:**

```bash
npm run test:unit:ci -- --include='src/app/features/board/components/condition/condition.component.spec.ts'
npm run test:unit:ci -- --include='src/app/features/playground/components/game/components/game-node/game-node.component.spec.ts'
npm run test:unit:ci -- --include='src/app/features/board/components/node/answer/answer.component.spec.ts'
```

Expected: all three specs pass with meaningful fixture assertions.

---

### Task 6: Update dropdown tests to interact with the rendered component contract

**Objective:** Test dropdown behavior without assuming the child standalone button renders a native `<button>` directly in the parent fixture query.

**Files:**

- Modify: `src/app/shared/components/ui/dropdown-button/dropdown-button.components.spec.ts`

**Steps:**

1. Query `polo-basic-button` or `BasicButtonComponent`, matching the actual template.
2. Trigger the click on the element/event boundary that Angular uses in production.
3. Assert both component state (`openedDropdown`) and visible DOM (`.dropdown`) after opening and closing.
4. Keep the mouse-leave behavior test, but query the outer container deliberately rather than the first generic `div` if possible.
5. Do not add test-only selectors to production markup unless no stable semantic selector exists.

**Verification:**

```bash
npm run test:unit:ci -- --include='src/app/shared/components/ui/dropdown-button/dropdown-button.components.spec.ts'
npm run test:unit:ci
```

Expected: all dropdown tests pass; full unit result is 73/73 with no delayed disconnect.

---

### Task 7: Split Playwright into explicit browser and authentication projects

**Objective:** Stop accidental WebKit-only execution and make the intended browser visible in every command and report.

**Files:**

- Modify: `playwright.config.ts`

**Proposed project shape:**

```ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'playground-chromium',
    testMatch: /playground\/.*\.test\.ts/,
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'playground-firefox',
    testMatch: /playground\/.*\.test\.ts/,
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'playground-webkit',
    testMatch: /playground\/.*\.test\.ts/,
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'dashboard-chromium',
    testMatch: /dashboard\/.*\.test\.ts/,
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'playwright/.auth/user.json',
    },
    dependencies: ['setup'],
  },
]
```

Adapt `testMatch` to the repository's actual dashboard test paths; do not assume directories that do not exist.

**Steps:**

1. Replace descriptor spreading with one descriptor per project.
2. Keep public playground projects independent of authenticated setup.
3. Make Chromium the canonical fast local project.
4. Keep Firefox/WebKit available as optional cross-browser checks.
5. Use a terminal reporter in npm/CI commands; retain HTML reports as CI artifacts if useful.

**Verification:**

```bash
./node_modules/.bin/playwright test --list
./node_modules/.bin/playwright test --project=playground-chromium --list
```

Expected: projects and seven playground tests are listed clearly, without invoking setup for the public suite.

---

### Task 8: Let Playwright own the local application server

**Objective:** Ensure e2e tests exercise the checked-out code without a separately managed terminal server.

**Files:**

- Modify: `playwright.config.ts`

**Proposed configuration:**

```ts
webServer: process.env['CI_TARGET_URL']
  ? undefined
  : {
      command: 'npm start -- --host 127.0.0.1',
      url: 'http://127.0.0.1:4200',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
use: {
  baseURL: process.env['CI_TARGET_URL'] ?? 'http://127.0.0.1:4200',
  trace: 'on-first-retry',
}
```

Do not retain the current implicit rule that `CI=true` means “test production.” CI should test the checked-out branch by default. A production smoke test, if desired, must be a separate explicit workflow and URL variable.

**Steps:**

1. Enable `webServer` for local and PR runs.
2. Use `127.0.0.1` consistently for the server and base URL.
3. Add an explicit environment variable only for intentional remote smoke tests.
4. Run the Chromium playground suite without manually starting Angular.
5. Confirm Playwright shuts down the server after the run.

**Verification:**

```bash
npm run test:e2e:playground
```

Expected: Angular starts automatically, seven playground tests execute in Chromium, the reporter terminates, and the server is cleaned up.

---

### Task 9: Make the public e2e suite green before adding browser breadth

**Objective:** Establish a reliable Chromium baseline without confusing browser-installation failures with application failures.

**Files:**

- Modify only test files/configuration if failures are harness-related
- Record application defects separately; do not fix them in this branch

**Steps:**

1. Install only the required browser for the fast gate:

   ```bash
   ./node_modules/.bin/playwright install chromium
   ```

2. Run `npm run test:e2e:playground`.
3. For each failure, classify it as:
   - Harness/configuration
   - Stale selector or fixture
   - Real application behavior defect
4. Repair harness/configuration and selectors only when the user-visible behavior remains the same.
5. Stop and create a separate issue/task for real application defects.
6. After Chromium is green, run Firefox and WebKit where host dependencies are available.

**Verification:**

```bash
npm run test:e2e:playground
```

Expected: 7/7 Chromium playground tests pass against the local checked-out app.

---

### Task 10: Replace the GitHub Actions gate

**Objective:** Make pull requests run the same deterministic checks as local agents.

**Files:**

- Modify: `.github/workflows/playwright.yml`, or replace it with clearly named workflow files

**Recommended jobs:**

1. `quality`:
   - Checkout
   - Setup pinned Node with npm cache
   - `npm ci`
   - `npm run lint`
   - `npm run test:unit:ci`
   - `npm run build`

2. `playground-e2e`:
   - Checkout
   - Setup pinned Node with npm cache
   - `npm ci`
   - `npx playwright install --with-deps chromium` (the repository-local CLI is invoked by npm/npx after install)
   - `npm run test:e2e:playground`
   - Upload traces/report only when produced

3. Authenticated dashboard testing:
   - Separate workflow/job
   - Run only when required secrets are available
   - Never run for untrusted fork PRs with secrets

**Steps:**

1. Stop using `node-version: lts/*`; use the pinned major.
2. Stop running the entire ambiguous Playwright project set.
3. Ensure CI tests the local checkout, not `https://trama.app`.
4. Add concurrency cancellation for superseded PR runs.
5. Keep artifacts bounded and useful.

**Verification:**

- Open a draft PR or manually run the workflow after local checks pass.
- Confirm every job terminates and reports its own failure category.
- Confirm no production credentials are exposed.

---

### Task 11: Add a single canonical full verification and document residual debt

**Objective:** Finish with one trustworthy command and an explicit list of intentionally deferred issues.

**Files:**

- Modify: `README.md`
- Modify: `AGENTS.md`
- Optionally create: `docs/testing.md` if README content becomes too long

**Steps:**

1. Run:

   ```bash
   npm run check:full
   ```

2. Verify:
   - lint exits 0
   - unit tests are 73/73
   - build exits 0
   - playground Chromium e2e is 7/7
   - no command leaves a server running
3. Document deferred, non-harness debt separately:
   - 194 lint warnings
   - production bundle budget warning
   - CommonJS optimization warnings
   - dependency vulnerability remediation
   - any real application defects uncovered
4. Inspect `git diff` and ensure no production behavior files changed.

**Final acceptance criteria:**

- A clean checkout can run the documented setup and checks.
- `npm run check` is bounded and deterministic.
- `npm run check:full` tests the checked-out app locally and terminates.
- Unit suite passes 73/73.
- Public playground Chromium suite passes 7/7.
- Dashboard authentication is not required for the default gate.
- CI mirrors local commands.
- No application feature or production behavior was changed merely to make tests green.

## Suggested commit sequence

Keep reviewable commits rather than one mixed repair:

1. `chore: pin node and add deterministic test scripts`
2. `test: repair angular component fixtures`
3. `test: split playwright browser projects`
4. `test: run playwright against local dev server`
5. `ci: add deterministic quality and playground gates`
6. `docs: document test workflow and deferred debt`

Do not commit until explicitly requested.

## Risks and decisions

- **Node version:** Angular 18 may be happier on Node 20 than the current Node 22. Verify rather than assume.
- **Karma browser discovery:** Machine-specific executable paths are brittle. Prefer environment override plus common executable detection.
- **Generated specs:** “Should create” tests have low value. Improve only the currently failing fixtures in this branch; broader test-quality work is separate.
- **WebKit dependencies:** Do not make local WebKit a prerequisite for the fast gate. Keep cross-browser coverage in an environment designed for it.
- **Production versus PR tests:** Production smoke tests and branch validation answer different questions and must not share an implicit `CI` switch.
- **Security audit:** Dependency remediation is explicitly outside this harness branch because major upgrades can change application behavior.
