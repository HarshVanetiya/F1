# Phase 1 — Scene, Camera, Renderer

> **Goal:** Create the three core Three.js objects and get a colored sky showing in the browser.
> **What you'll learn:** `THREE.Scene`, `THREE.PerspectiveCamera`, `THREE.WebGLRenderer`, fog, tone mapping.
> **Code reference:** [main.js lines 1–75](../main.js) → [Full Reference](ref-main-js.md#scene-setup)

---

## The Three.js Trinity

Every Three.js application needs exactly **three things**:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   SCENE     │ ──→ │   CAMERA     │ ──→ │  RENDERER    │
│ (the world) │     │ (your eyes)  │     │ (draws it)   │
└─────────────┘     └──────────────┘     └──────────────┘
```

Think of it like filming a movie:
- **Scene** = the movie set (contains all the actors, props, and lights)
- **Camera** = the actual camera pointed at the set
- **Renderer** = the film/screen that captures what the camera sees

---

## Step 1: Import Three.js

```javascript
import * as THREE from "three";
```

> **Reference:** [main.js line 1](../main.js)

This imports the **entire Three.js library** and puts it in an object called `THREE`. Every class and constant is accessed through this object:
- `THREE.Scene` — the world container
- `THREE.Mesh` — a 3D object
- `THREE.Vector3` — a 3D point/direction
- `THREE.Color` — a color value
- etc.

---

## Step 2: Create the Scene

```javascript
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 160, 520);
```

> **Reference:** [main.js lines 57–59](../main.js)

### `new THREE.Scene()`

A Scene is an empty container. You'll add everything to it: meshes (3D objects), lights, cameras, groups. Nothing is visible until it's added with `scene.add(object)`.

### `new THREE.Color(0x87ceeb)`

**Not vanilla JS.** This is a Three.js color object. The `0x` prefix means hexadecimal — the same as CSS `#87ceeb` (light sky blue), but JavaScript uses `0x` instead of `#`.

Common color formats Three.js accepts:
```javascript
new THREE.Color(0xff0000)       // Hex number
new THREE.Color("#ff0000")      // CSS hex string
new THREE.Color("rgb(255,0,0)") // CSS rgb string
new THREE.Color(1, 0, 0)        // RGB floats (0–1 range, not 0–255!)
```

### `new THREE.Fog(color, near, far)`

**Not vanilla JS.** Fog gradually hides objects based on their distance from the camera:

```
Camera ── near(160) ───────── far(520) ────→

         [fully visible]  [gradually fading]  [completely hidden]
```

- Objects **closer than 160 units**: fully visible
- Objects **between 160–520 units**: gradually blending with the fog color
- Objects **beyond 520 units**: completely hidden (replaced by fog color)

**Why use fog?**
1. Creates atmospheric depth (looks like haze/mist)
2. Hides the world's edges (so the ground doesn't abruptly end)
3. Improves performance (hidden objects can be skipped by the GPU)

The fog color matches the background color (`0x87ceeb`) so the fade looks natural.

---

## Step 3: Create the Camera

```javascript
const camera = new THREE.PerspectiveCamera(
  60,                                      // Field of view (degrees)
  window.innerWidth / window.innerHeight,  // Aspect ratio
  0.1,                                     // Near clipping plane
  1000                                     // Far clipping plane
);
```

> **Reference:** [main.js lines 61–66](../main.js)

### `new THREE.PerspectiveCamera(fov, aspect, near, far)`

**Not vanilla JS.** This creates a camera that mimics how human eyes see — objects far away appear smaller (perspective projection).

#### Parameter 1: Field of View (FOV) — `60`

How wide the camera sees, in degrees. Think of it as your peripheral vision:

```
FOV = 30° (telephoto zoom)    FOV = 60° (normal)    FOV = 120° (ultra-wide/fisheye)
      ╱╲                           ╱  ╲                    ╱      ╲
     ╱  ╲                         ╱    ╲                  ╱        ╲
    ╱    ╲                       ╱      ╲                ╱          ╲
```

`60°` is a good default — wide enough to see the road ahead but not distorted.

#### Parameter 2: Aspect Ratio — `window.innerWidth / window.innerHeight`

Width divided by height of the browser window. Without this, the image would look stretched or squished. `window.innerWidth` and `window.innerHeight` are **vanilla JS** — they give the browser viewport dimensions in pixels.

#### Parameters 3–4: Clipping Planes — `0.1` and `1000`

```
                 Near (0.1)              Far (1000)
Camera ● ─── ┃ ═══════════════════════ ┃ ─────→
              ┃   VISIBLE REGION       ┃
              ┃   (gets rendered)      ┃
```

Objects closer than `0.1` or farther than `1000` units are **not drawn**. This:
- **Near = 0.1:** Prevents visual artifacts when objects are extremely close to the camera (called "z-fighting")
- **Far = 1000:** Saves GPU power by not drawing extremely distant objects

---

## Step 4: Create the Renderer

```javascript
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);
```

> **Reference:** [main.js lines 68–75](../main.js)

### `new THREE.WebGLRenderer({ antialias: true })`

**Not vanilla JS.** Creates a renderer that uses **WebGL** (the browser's built-in 3D graphics API) to draw the scene. The `antialias: true` option smooths jagged diagonal edges:

```
Without antialias:    With antialias:
  ██                    ▓▓
  ██░░                  ▓▓▒▒
    ░░██                  ▒▒▓▓
      ██                    ▓▓
(staircase edges)     (smooth edges)
```

### `renderer.setSize(width, height)`

**Not vanilla JS.** Sets the canvas dimensions to fill the entire browser window.

### `renderer.setPixelRatio(window.devicePixelRatio)`

**`window.devicePixelRatio` IS vanilla JS.** It returns how many physical pixels fit in one CSS pixel:
- Regular displays: `1`
- Retina/HiDPI displays: `2` (MacBooks, modern phones)
- Some 4K monitors: `1.5` or `2`

Without this, the game looks blurry on high-res screens because one 3D pixel maps to a 2×2 block of screen pixels.

### `renderer.shadowMap.enabled = true`

Turns on shadow rendering. Without this, objects can't cast or receive shadows — everything looks flat.

### `renderer.shadowMap.type = THREE.PCFSoftShadowMap`

**PCF** = Percentage Closer Filtering. It makes shadow edges **soft and blurry** (like real shadows) instead of hard pixelated edges.

### `renderer.toneMapping = THREE.ACESFilmicToneMapping`

**Tone mapping** is a technique from cinema/photography. It converts high-dynamic-range (HDR) colors to the 0–1 range your screen can display. **ACES Filmic** is the algorithm used in Hollywood films — it:
- Preserves detail in bright and dark areas
- Adds slight color warmth
- Prevents bright colors from "blowing out" to pure white

### `renderer.toneMappingExposure = 1.05`

Controls overall brightness. `1.0` = neutral. `1.05` = 5% brighter (slightly opens the virtual camera aperture).

### `document.body.appendChild(renderer.domElement)`

**This IS vanilla JS.** When you create a `WebGLRenderer`, it internally creates an HTML `<canvas>` element. `renderer.domElement` is that canvas. This line adds it to the page's `<body>`, making it visible.

---

## How Rendering Works

At the end of every frame, you call:

```javascript
renderer.render(scene, camera);
```

This tells the renderer: "Take the scene, look at it through this camera, and draw the result on the canvas." This must be called **every frame** (60 times per second) inside the game loop.

> In this app, we actually use `composer.render()` instead (for post-processing), but the concept is the same. See [Phase 10](phase-10-post-processing.md).

---

## Phase 1 Checkpoint

At this point you should have:
- [x] A sky-blue canvas filling the browser window
- [x] A scene with fog
- [x] A camera and renderer with shadows and tone mapping enabled
- [x] Nothing visible yet (no objects or lights added)

**Next:** [Phase 2 — Lighting & Environment →](phase-2-lighting-and-environment.md)
