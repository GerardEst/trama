# Landing editor captures

The 12 images in `src/assets/images/landing/authoring/` show the actual editor in CA, ES and EN, with a fictional example story and author. They are screenshots, not mock-ups. All Supabase requests are intercepted and credentials are deliberately invalid: no real account or backend writes are involved.

## Regenerate

Start the local application, then run:

```bash
npx playwright test --config=scripts/capture-landing-authoring/playwright.config.ts
```

The script uses only normal UI actions: pan/zoom, resize the reading pane, edit, preview and share. PNGs are written to `$TMPDIR/trama-landing-captures/` (normally `/tmp/trama-landing-captures/`), not the repository. Optional variables:

- `TRAMA_CAPTURE_BASE_URL`: local preview URL; use a locally served production build to capture production link labels.
- `CHROME_BIN`: Chromium executable, if the bundled Playwright browser is unavailable.

Review the captures before replacing the assets. With ImageMagick installed:

```bash
for lang in ca es en; do
  for view in write map preview share; do
    convert "/tmp/trama-landing-captures/$lang-$view.png" -quality 88 \
      "src/assets/images/landing/authoring/$lang-$view.webp"
  done
done
```

Keep the dimensions at 1600 × 1000 and update the component dimensions/tests if they change. Do not add real account data or authentication state to the repository.
