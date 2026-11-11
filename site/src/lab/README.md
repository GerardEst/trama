# Landing lab

Four directions for the landing, built side by side to compare them. The real
landing (`src/pages/[...locale].astro`) is untouched.

- Pages: `/lab` (index with seeds and reasoning) and `/lab/a` to `/lab/d`, with
  the `/es` and `/ca` prefixes. They are `noindex` and not in the sitemap. In the
  merged build they are served as `.html` files, because `vercel.json` only maps
  the real site pages.
- `directions.ts`: each seed and what was read from it.
- `content/`: copy for the 14 features in three languages; the rest comes from
  `src/i18n/`.
- `Art.astro` + `art.css`: each feature's author and reader illustrations.
- `versions/`: one page and one stylesheet per direction.
- `atlas/`: direction B's catalogue of 21 capabilities, comparison and FAQ, its
  playable examples (real story trees, tested in `trees.test.ts`) and the plain
  text summary served at `/lab/llms-full.txt`. The comparison must be re-checked
  against each tool's official pages; the date lives in `COMPARISON_CHECKED`.

## When one is chosen

1. Move its page and shared parts to `components/landing/` and replace the
   current landing's sections with them.
2. Delete this folder and `src/pages/[...locale]/lab*`.
3. In `src/styles/tokens.css`, keep only the chosen palette, as real theme tokens.
4. In `astro.config.mjs`, keep only the chosen direction's fonts.
5. Rewrite `tests/landing/` for the new page.
6. Remove the `noindex` that `LabLayout.astro` adds. If it is direction B, also
   serve the summary at `/llms-full.txt`, and link it from `src/llms.txt`.
