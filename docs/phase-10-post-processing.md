# Phase 10 — Post-Processing (Bloom)

> **Goal:** Add a cinematic glow effect to bright surfaces.
> **What you'll learn:** `EffectComposer`, `RenderPass`, `UnrealBloomPass`, render pipelines.
> **Code reference:** [main.js lines 3–5, 77–87](../main.js) → [Full Reference](ref-main-js.md#post-processing)

---

## What is Post-Processing?

Post-processing applies visual effects **after** the 3D scene has been rendered to pixels. It's like applying an Instagram filter to a photo — the photo (3D scene) is taken first, then the filter (effect) modifies the pixels.

Common post-processing effects:
- **Bloom** — bright areas glow (used in this app)
- **Depth of Field** — far/near objects get blurry (like camera bokeh)
- **Color Grading** — adjust hue, saturation, contrast
- **Vignette** — darken corners of the screen
- **Motion Blur** — streaking when moving fast

---

## What is Bloom?

Bloom simulates how real cameras and eyes handle bright light — bright areas "bleed" light into surrounding pixels:

```
Without bloom:            With bloom:
┌───────────────┐        ┌───────────────┐
│               │        │    ✧  ✧       │
│      ●        │        │   ✧ ● ✧      │
│   (car light) │        │    ✧  ✧       │
│               │        │  (glow halo)  │
└───────────────┘        └───────────────┘
```

In this app, bloom makes the sun glow sphere, car paint highlights, and bright materials look more cinematic.

---

## Imports

```javascript
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
```

> **Reference:** [main.js lines 3–5](../main.js)

All three are **Three.js addons** — not part of the core library. They're imported from `three/addons/postprocessing/`.

---

## Setup

```javascript
// Step 1: Create the effect chain manager
const composer = new EffectComposer(renderer);

// Step 2: Add a render pass (renders the 3D scene)
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Step 3: Add a bloom pass (applies the glow effect)
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),  // Resolution
  1.2,    // strength  — how intense the glow is
  0.4,    // radius    — how far the glow spreads
  0.85    // threshold — minimum brightness to glow
);
composer.addPass(bloomPass);
```

> **Reference:** [main.js lines 78–87](../main.js)

### `new EffectComposer(renderer)` — **Not vanilla JS**

Creates a **post-processing pipeline**. Instead of the renderer drawing directly to the screen, it draws to an internal texture. Then each "pass" processes that texture and passes the result to the next pass.

### `new RenderPass(scene, camera)` — **Not vanilla JS**

The first pass in any post-processing chain. It renders the 3D scene (exactly like `renderer.render(scene, camera)` would) but stores the result in a texture instead of showing it on screen.

### `new UnrealBloomPass(resolution, strength, radius, threshold)` — **Not vanilla JS**

The bloom effect, inspired by Unreal Engine's bloom implementation.

| Parameter | Value | What It Does |
|---|---|---|
| `resolution` | `Vector2(width, height)` | The size of the internal bloom texture. Matches the screen resolution |
| `strength` | `1.2` | How bright the glow is. 0 = off, 3 = extremely bright |
| `radius` | `0.4` | How far the glow extends from bright areas. Higher = softer, wider glow |
| `threshold` | `0.85` | Only pixels brighter than this value (on a 0–1 scale) get the bloom effect. Lower = more things glow |

### How the Pipeline Works

```
Step 1: RenderPass                Step 2: UnrealBloomPass
┌─────────────────┐              ┌─────────────────┐
│  Render 3D      │    texture   │  Find bright     │    final
│  scene to ──────┼────────→    │  pixels, blur    │    image
│  internal       │              │  them, add back  ├─────→ Screen
│  texture        │              │  to original     │
└─────────────────┘              └─────────────────┘
```

### `composer.addPass(pass)` — **Not vanilla JS**

Adds a pass to the pipeline. Passes execute in the order they're added.

---

## Using the Composer

In the game loop, instead of:
```javascript
renderer.render(scene, camera);  // Direct rendering (no effects)
```

We use:
```javascript
composer.render();  // Renders through the post-processing pipeline
```

> **Reference:** [main.js line 1339](../main.js)

---

## Handling Window Resize

When the window is resized, the composer also needs to be updated:

```javascript
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);  // ← Post-processing too!
});
```

> **Reference:** [main.js lines 1303–1308](../main.js)

### `camera.updateProjectionMatrix()` — **Not vanilla JS**

When you change camera properties (like `aspect`), the internal projection matrix needs to be recalculated. This method does that. Without it, the camera would use stale calculations and the image would be distorted after resizing.

### `composer.setSize(w, h)` — **Not vanilla JS**

Resizes the internal textures used by the post-processing pipeline. Without this, the bloom effect would render at the old resolution.

---

## Phase 10 Checkpoint

At this point you should have:
- [x] Bloom glow on bright surfaces (sun, car highlights)
- [x] A post-processing pipeline rendering through the composer
- [x] Correct resizing for the composer on window resize
- [x] Understanding of how pass-based rendering works

**Next:** [Phase 11 — UI, HUD & Minimap →](phase-11-ui-hud-minimap.md)
