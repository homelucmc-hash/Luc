# Original espresso sequence

The source is the original procedural Blender scene in `scripts/render-coffee.py`, not the five storyboard reference images. Every frame is a complete render of the same scene. Geometry, camera, liquid height, droplets, crema surface and steam depend only on the frame's progression `frame / 159`.

The portable `atelier-espresso.blend` packs its original crema microtexture. Reproduce the 160 raw frames from the project root:

```sh
nice -n 10 blender --background --factory-startup --python scripts/render-coffee.py -- --frames all --width 1280 --samples 10 --threads 5 --crema-exposure -1.5 --output production/final-renders --save-blend
```

The intermediate raw format is RGB PNG, 1280 × 720, numbered `frame-000.png` through `frame-159.png`. These large intermediate files and review renders are retained in the working environment and excluded from the source archive. The delivered source includes the scene, texture and scripts needed to reproduce them. `frame-metadata.json` records the normalized progression, actual liquid height, fill, stream and steam for all 160 frames. Working render timing is recorded in `final-render.log`, `final-render-corrected.log` and `final-render-5threads.log`. `render-batches.json` records the original four-thread batches and the five-thread continuation, which resumes at frame 080 without re-rendering validated files.

To render one exact state, use `--frames 80`; to render a range, use `--frames 80:160`. This reproduces the same state independently of wall-clock time and allows the browser to rewind the sequence exactly.

Blender 4.3.2 uses Cycles on the CPU. Its Debian build does not include Open Image Denoise, so the original noisy renders are retained and the browser assets are derived separately with Intel Open Image Denoise 2.3.3 and FFmpeg. The project encoder documents that step:

```sh
python scripts/encode-sequence.py --input production/final-renders --output public/espresso-frames --oidn /path/to/oidnDenoise
```

Asset provenance is in `ASSET-CREDITS.txt` and `textures/crema-original-provenance.txt`. The small original AI-assisted crema texture is a Blender material input. No storyboard image pixels, stock videos or third-party models are part of the rendered scene.

The render uses a deterministic animated surface and stream geometry, not a fluid-solver cache. This gives exact control of the visible fill level and reversible playback. Browser scroll, accessibility and delivery tests are separate from the source-render checks.

The final crema material uses `--crema-exposure -1.5`, a linear albedo multiplier of `2 ** -1.5`. This affects only the original crema image albedo; the cup, metal, geometry and studio lights remain unchanged. Raw frames 000–044 are reused from the initial render because the crema is not visible in that interval. Frames 045–159 are rendered with the corrected coffee color. The initial bright-crema renders are kept separately in `obsolete-crema-bright` and are not delivery assets.

After rendering and encoding all 160 frames, run the source checks and generate the local review video:

```sh
python production/validate-source.py
```

This checks raw PNG checksums, decodes both complete WebP variants, checks the manifests and monotone fill metadata, and verifies the packed Blender texture and final crema factor. It exports `assets/espresso-source.mp4` at 20 fps for exactly 8 seconds and writes the results and SHA-256 hashes to `production/source-validation.json`. The MP4 is a review/export source; it does not add autoplay to the application.
