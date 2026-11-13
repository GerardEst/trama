# Story map artwork

`story-map-colour-landscape.json` and `story-map-colour-portrait.json` paint the
existing ink maps in ComfyUI with the atlas's Krea2 model and PencilartD LoRA.
Their prompts and seeds are saved in the workflows.

Generate both colour variants from the committed ink images:

```bash
node scripts/image-workflows/colour-story-map.mjs http://localhost:8000/
```

For Windows ComfyUI accessed from WSL:

```bash
node scripts/image-workflows/colour-story-map.mjs http://127.0.0.1:8000/ /mnt/c/Windows/System32/curl.exe
```

The script uploads the original maps, runs image-to-image colourisation, saves
raw PNGs to the ignored `tmp/map-colour/` folder and restores the original ink
contours over the generated colour washes. This keeps the colour reveal aligned
with the monochrome drawing instead of displaying a second set of outlines.
Final assets are `site/src/assets/landing/story-map-colour-{landscape,portrait}.webp`.
Rebuild those assets from saved PNGs without generating again:

```bash
node scripts/image-workflows/colour-story-map.mjs --process-only
```

The separate `map-illustrations/` folder contains the boat and event vignettes.

Build the small sea masks used to switch between walking and the paper boat:

```bash
node scripts/image-workflows/build-map-water.mjs
```

They flood-fill the central sea from the existing pencil coastline; the portrait
bay also has a broad boundary to exclude the paths opening into it. Each mask is
about 6 kB and is sampled once on load, alongside the colour image.
