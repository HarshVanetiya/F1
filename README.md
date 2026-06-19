# Monaco Free Drive — Learn by Building

> **A complete guide to building a 3D racing game in the browser.**
> You only need to know HTML, CSS, and JavaScript. Everything else is taught here.

---

## What Is This App?

**Monaco Free Drive** is a 3D driving simulator that runs in your browser. You drive an F1-style car around a Monaco-inspired street circuit with rival cars, barriers, kerbs, buildings, and trees — all rendered in real-time using Three.js.

### Technologies Used

| Technology | What It Is | Why We Use It |
|---|---|---|
| **HTML** | Page structure | The UI overlay (menus, speed display, minimap) |
| **CSS** | Visual styling | Glassmorphism panels, dark theme, responsive layout |
| **JavaScript** | Logic & behavior | ALL game logic: physics, rendering, AI, input |
| **[Three.js](https://threejs.org/)** | 3D graphics library | Renders the 3D world (wraps WebGL) |
| **[Vite](https://vitejs.dev/)** | Build tool & dev server | Enables `import` statements + hot reload |
| **[GLTF/GLB](https://www.khronos.org/gltf/)** | 3D model format | The car model file |

---

## How to Read This Guide

This guide is split into **Phases** — each one teaches a concept and shows how it's used in this app. Follow them in order to understand how the entire game was built from scratch.

Each phase links to the exact lines of code in the project files. There are also **Reference Docs** for each file that document every method and block of code.

---

## Phase Roadmap

### Phase 0 — Project Setup
📄 [docs/phase-0-project-setup.md](docs/phase-0-project-setup.md)

> Set up the project folder, install dependencies, understand Vite and npm.
> **You'll learn:** npm, package.json, Vite dev server, ES modules (`import`/`export`).

---

### Phase 1 — Scene, Camera, Renderer
📄 [docs/phase-1-scene-camera-renderer.md](docs/phase-1-scene-camera-renderer.md)

> Create the three core Three.js objects. Get a colored background showing in the browser.
> **You'll learn:** `THREE.Scene`, `THREE.PerspectiveCamera`, `THREE.WebGLRenderer`, fog, tone mapping, pixel ratio.

---

### Phase 2 — Lighting & Environment
📄 [docs/phase-2-lighting-and-environment.md](docs/phase-2-lighting-and-environment.md)

> Add lights so objects are visible. Create the ground, sea, and sky.
> **You'll learn:** `HemisphereLight`, `DirectionalLight`, shadows, `MeshStandardMaterial`, `PlaneGeometry`.

---

### Phase 3 — Track with Splines
📄 [docs/phase-3-track-with-splines.md](docs/phase-3-track-with-splines.md)

> Define the racing circuit as a smooth curve. Build the track surface as custom geometry.
> **You'll learn:** `CatmullRomCurve3`, `Vector3`, the `t` parameter, `BufferGeometry`, vertices/normals/indices, lateral direction math.

---

### Phase 4 — Track Details: Kerbs, Barriers, Start Line
📄 [docs/phase-4-track-details.md](docs/phase-4-track-details.md)

> Add kerbs (rumble strips), metal barriers, the start/finish line, and a tunnel section.
> **You'll learn:** Multi-material meshes, geometry groups, `addGroup()`, collision data generation.

---

### Phase 5 — Scenery: Buildings, Trees, Grandstands
📄 [docs/phase-5-scenery.md](docs/phase-5-scenery.md)

> Populate the world with buildings, palm trees, conifer trees, and grandstands.
> **You'll learn:** `THREE.Group`, combining primitives, function-based scene building, building colliders.

---

### Phase 6 — Cars & 3D Model Loading
📄 [docs/phase-6-cars-and-models.md](docs/phase-6-cars-and-models.md)

> Build a low-poly car from box primitives. Load a proper GLTF model to replace it.
> **You'll learn:** `GLTFLoader`, `.traverse()`, `.clone()`, auto-scaling models, fallback patterns.

---

### Phase 7 — Input & Player Physics
📄 [docs/phase-7-physics-and-input.md](docs/phase-7-physics-and-input.md)

> Handle keyboard input. Simulate realistic acceleration, braking, drag, and steering.
> **You'll learn:** `keydown`/`keyup` with `Set`, delta time, force-based physics, torque curves, speed-dependent steering.

---

### Phase 8 — Collision Detection
📄 [docs/phase-8-collisions.md](docs/phase-8-collisions.md)

> Prevent the car from passing through barriers, buildings, and rival cars.
> **You'll learn:** Circle-vs-point, AABB-vs-circle, circle-vs-circle collision, penetration resolution, speed reduction on impact.

---

### Phase 9 — Camera System & Rival AI
📄 [docs/phase-9-camera-and-ai.md](docs/phase-9-camera-and-ai.md)

> Make the camera follow the player smoothly. Add AI cars that drive around the track.
> **You'll learn:** Chase camera, `lerp`, exponential smoothing, spline-following AI, lane weaving.

---

### Phase 10 — Post-Processing (Bloom)
📄 [docs/phase-10-post-processing.md](docs/phase-10-post-processing.md)

> Add a cinematic glow effect to bright surfaces.
> **You'll learn:** `EffectComposer`, `RenderPass`, `UnrealBloomPass`, render pipelines.

---

### Phase 11 — UI, HUD & Minimap
📄 [docs/phase-11-ui-hud-minimap.md](docs/phase-11-ui-hud-minimap.md)

> Build the HTML/CSS overlay: main menu, speed/gear display, minimap, settings panel.
> **You'll learn:** HTML-over-canvas pattern, `pointer-events`, `backdrop-filter`, second renderer, Three.js layers, game state management.

---

## Code Reference Files

These are line-by-line annotated references for every file in the project:

| File | Reference Doc |
|---|---|
| [index.html](index.html) | 📄 [docs/ref-index-html.md](docs/ref-index-html.md) |
| [main.js](main.js) | 📄 [docs/ref-main-js.md](docs/ref-main-js.md) |
| [style.css](style.css) | 📄 [docs/ref-style-css.md](docs/ref-style-css.md) |

---

## Glossary

📄 [docs/glossary.md](docs/glossary.md)

A dictionary of every technical term used in this guide.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open http://localhost:5173 in your browser
```

### Controls

| Key | Action |
|---|---|
| `↑` / `W` | Accelerate |
| `↓` / `S` | Brake / Reverse |
| `←` / `A` | Steer left |
| `→` / `D` | Steer right |
| `Space` | Handbrake (drift) |
| `R` | Restart |

---

## Project Structure

```
F1/
├── README.md               ← You are here
├── index.html              ← Single HTML page (UI + script tag)
├── main.js                 ← ALL game logic (1347 lines)
├── style.css               ← UI styling (467 lines)
├── package.json            ← Dependencies: three, vite
├── docs/                   ← 📚 All documentation
│   ├── phase-0 through 11  ← Phase-by-phase learning guide
│   ├── ref-*.md            ← Line-by-line code references
│   └── glossary.md         ← Term definitions
├── public/
│   └── models/
│       └── car.glb         ← 3D car model (92 KB)
└── node_modules/           ← Installed libraries (auto-generated)
```
