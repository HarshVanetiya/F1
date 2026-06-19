# Reference: main.js — Line-by-Line Code Documentation

> This file documents **every section** of [main.js](../main.js) (1347 lines), explaining what each block does, which methods are **not vanilla JS** (Three.js or library-specific), and linking to the relevant learning phase.

---

## Imports (Lines 1–5) {#imports}

```javascript
import * as THREE from "three";                                           // L1
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";         // L2
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";  // L3
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";          // L4
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js"; // L5
```

| Import | Type | What It Is |
|---|---|---|
| `THREE` | Three.js core | The entire Three.js library |
| `GLTFLoader` | Three.js addon | Loads .glb/.gltf 3D model files |
| `EffectComposer` | Three.js addon | Manages a chain of post-processing effects |
| `RenderPass` | Three.js addon | Renders the 3D scene to an internal texture |
| `UnrealBloomPass` | Three.js addon | Applies a glow/bloom effect |

**Phase:** [Phase 0 — ES Modules](phase-0-project-setup.md#what-are-es-modules), [Phase 6 — GLTF](phase-6-cars-and-models.md), [Phase 10 — Post-Processing](phase-10-post-processing.md)

---

## Constants & Settings (Lines 7–12) {#constants}

```javascript
const TRACK_WIDTH = 22;              // L8 — Track width in world units
const NUM_RIVALS = 5;                // L9 — Number of AI cars
let sensitivityMultiplier = 1.0;     // L12 — Steering sensitivity (changed by settings)
```

All vanilla JS. `const` for values that never change, `let` for values that can be reassigned.

---

## DOM Elements (Lines 14–27) {#dom-elements}

```javascript
const speedEl = document.querySelector("#speed");          // L15
const gearEl = document.querySelector("#gear");            // L16
const statusEl = document.querySelector("#status");        // L17
const messageEl = document.querySelector("#message");      // L18
const hintEl = document.querySelector("#hint");            // L19
const settingsBtn = document.querySelector("#settings-btn");       // L20
const settingsOverlay = document.querySelector("#settings-overlay"); // L21
const settingsClose = document.querySelector("#settings-close");     // L22
const mainMenu = document.querySelector("#main-menu");     // L23
const btnPlay = document.querySelector("#btn-play");       // L24
const btnMenuSettings = document.querySelector("#btn-menu-settings"); // L25
const hud = document.querySelector("#hud");                // L26
const minimapCanvas = document.querySelector("#minimap");  // L27
```

All **vanilla JS**. `document.querySelector()` returns the first DOM element matching a CSS selector.

**Phase:** [Phase 11](phase-11-ui-hud-minimap.md#dom-element-references)

---

## Settings & Menu Event Listeners (Lines 29–54) {#settings-events}

```javascript
settingsBtn.addEventListener("click", () => { ... });      // L30–32
btnMenuSettings.addEventListener("click", () => { ... });  // L33–35
settingsClose.addEventListener("click", () => { ... });    // L36–38
btnPlay.addEventListener("click", () => { ... });          // L41–47
document.querySelectorAll(".sens-btn").forEach(btn => ...) // L48–54
```

All **vanilla JS**. `.addEventListener()`, `.classList.toggle()`, `.classList.add()`, `.classList.remove()`, `.dataset`, `parseFloat()`.

**Phase:** [Phase 11](phase-11-ui-hud-minimap.md#settings-panel-events)

---

## Scene Setup (Lines 56–75) {#scene-setup}

| Line | Code | Vanilla JS? | Purpose |
|---|---|---|---|
| 57 | `new THREE.Scene()` | ❌ Three.js | Creates the 3D world container |
| 58 | `new THREE.Color(0x87ceeb)` | ❌ Three.js | Sky-blue background color |
| 59 | `new THREE.Fog(color, 160, 520)` | ❌ Three.js | Distance-based fog effect |
| 61 | `new THREE.PerspectiveCamera(60, ...)` | ❌ Three.js | Perspective camera (FOV 60°) |
| 68 | `new THREE.WebGLRenderer({ antialias: true })` | ❌ Three.js | Creates the rendering engine |
| 69 | `renderer.setSize(w, h)` | ❌ Three.js | Sets canvas dimensions |
| 70 | `renderer.setPixelRatio(window.devicePixelRatio)` | Mixed | `devicePixelRatio` is vanilla, `.setPixelRatio()` is Three.js |
| 71 | `renderer.shadowMap.enabled = true` | ❌ Three.js | Enables shadow rendering |
| 72 | `THREE.PCFSoftShadowMap` | ❌ Three.js | Soft shadow algorithm constant |
| 73 | `THREE.ACESFilmicToneMapping` | ❌ Three.js | Cinematic color grading constant |
| 75 | `document.body.appendChild(renderer.domElement)` | ✅ Vanilla | Adds canvas to the page |

**Phase:** [Phase 1](phase-1-scene-camera-renderer.md)

---

## Post-Processing (Lines 77–87) {#post-processing}

| Line | Code | Purpose |
|---|---|---|
| 78 | `new EffectComposer(renderer)` | Creates the post-processing pipeline |
| 79 | `new RenderPass(scene, camera)` | Renders scene to internal texture |
| 80 | `composer.addPass(renderPass)` | Adds render pass to the chain |
| 81–86 | `new UnrealBloomPass(...)` | Bloom glow effect (strength=1.2, radius=0.4, threshold=0.85) |
| 87 | `composer.addPass(bloomPass)` | Adds bloom to the chain |

All **Three.js addons** (not vanilla JS).

**Phase:** [Phase 10](phase-10-post-processing.md)

---

## Minimap (Lines 89–104) {#minimap}

| Line | Code | Purpose |
|---|---|---|
| 90 | `new THREE.WebGLRenderer({ canvas, alpha: true })` | Second renderer targeting minimap canvas |
| 91 | `.setSize(220, 220)` | Minimap is 220×220 pixels |
| 92 | `new THREE.OrthographicCamera(-140, 140, 100, -180, 1, 1000)` | Top-down camera (no perspective) |
| 93–94 | `.position.set(...)`, `.lookAt(...)` | Position high above the track, looking down |
| 95 | `.layers.enable(1)` | Camera can see layer 1 objects |
| 97–104 | Player dot setup | Red circle on layer 1 only (minimap-visible) |

**Phase:** [Phase 11](phase-11-ui-hud-minimap.md#the-minimap)

---

## Lighting (Lines 106–128) {#lighting}

| Line | Code | Purpose |
|---|---|---|
| 107 | `new THREE.HemisphereLight(sky, ground, intensity)` | Ambient sky + ground light |
| 110 | `new THREE.DirectionalLight(color, intensity)` | Sun light with parallel rays |
| 111 | `.position.set(120, 150, 45)` | Sun position (defines light direction) |
| 112–120 | `sun.shadow.*` | Shadow map config: resolution, bounds, bias |
| 123–128 | `new THREE.Mesh(SphereGeometry, MeshBasicMaterial)` | Visual sun glow (not a light) |

**Phase:** [Phase 2](phase-2-lighting-and-environment.md)

---

## Track Circuit (Lines 130–227) {#track-circuit}

| Lines | Code | Purpose |
|---|---|---|
| 133–167 | `trackControlPoints` array | 25 Vector3 points defining the circuit shape |
| 169–174 | `new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.5)` | Smooth closed spline curve |
| 175 | `trackCurve.getLength()` | Total track length in world units |
| 178–187 | Spline cache loop | Pre-computes 600 sample points for fast lookups |
| 189–227 | `getClosestSplineData()` | Finds nearest cached point to a given position |

**Phase:** [Phase 3](phase-3-track-with-splines.md)

---

## Track Mesh Builder (Lines 229–309) {#track-mesh}

| Lines | Code | Purpose |
|---|---|---|
| 230–263 | `buildTrackGeometry()` | Builds custom geometry following the spline curve |
| 258–262 | `new THREE.BufferGeometry()`, `setAttribute()`, `setIndex()` | Creates GPU-ready geometry from raw data |
| 266–272 | `trackMesh` creation | Dark asphalt surface mesh |
| 275–296 | Ground plane + sea plane | Green ground, blue-tinted water |
| 298–309 | Racing line | Thin semi-transparent strip along track center |

**Phase:** [Phase 3](phase-3-track-with-splines.md#building-the-track-mesh--custom-geometry)

---

## Track Edges (Lines 311–476) {#track-edges}

| Lines | Code | Purpose |
|---|---|---|
| 315–460 | `buildTrackEdgeAssets()` | Builds kerbs, barriers, and barrier collision data |
| 412–418 | `kerbGeo.addGroup(...)` | Assigns red/white material groups |
| 425–457 | Barrier collider generation | Creates 2D collision points with smart filtering |
| 462–476 | Kerb and barrier mesh creation | Multi-material kerbs, metallic barriers |

**Phase:** [Phase 4](phase-4-track-details.md)

---

## Start Line & Tunnel (Lines 478–578) {#start-tunnel}

| Lines | Code | Purpose |
|---|---|---|
| 478–534 | Start/finish line block | Checkered pattern, gantry poles and beam |
| 538–578 | Tunnel section | 10 frames with walls and ceiling (t=0.28 to t=0.35) |

**Phase:** [Phase 4](phase-4-track-details.md#startfinish-line)

---

## Scenery (Lines 580–705) {#scenery}

| Lines | Code | Purpose |
|---|---|---|
| 581–614 | `addBuilding()` + placements | Buildings with AABB collision data |
| 617–654 | `addPalmTree()` + placements | Cylinder trunk + squashed sphere fronds |
| 657–682 | `addConiferTree()` + placements | Cylinder trunk + cone crown |
| 685–705 | `addGrandstand()` + placements | Stepped seating using THREE.Group |

**Phase:** [Phase 5](phase-5-scenery.md)

---

## Cars (Lines 707–863) {#cars}

| Lines | Code | Purpose |
|---|---|---|
| 708–764 | `createLowPolyCar()` | Builds a car from box/cylinder primitives |
| 767–771 | Player car setup | Outer group with rotation.order "YXZ" |
| 774–789 | Rival cars setup | 5 rivals with different colors, speeds, positions |
| 792–863 | GLTF model loading | Loads car.glb, auto-scales, applies to player + rivals |

**Phase:** [Phase 6](phase-6-cars-and-models.md)

---

## State & Helpers (Lines 865–956) {#state}

| Lines | Code | Purpose |
|---|---|---|
| 866–873 | `player` object | Position, heading, speed, trackT |
| 875–881 | `race` object | Phase, countdown, elapsed time, flash messages |
| 884–897 | Helper functions | `setFlash()`, `formatTime()` |
| 900–915 | Keyboard input | `keydown`/`keyup` with Set |
| 918–956 | Reset functions | `resetPlayer()`, `resetRivals()`, `restartRace()` |

**Phase:** [Phase 7](phase-7-physics-and-input.md#player-state-object)

---

## Physics (Lines 958–1180) {#physics}

| Lines | Code | Purpose |
|---|---|---|
| 960–964 | Input reading | `keys.has()` for acceleration, brake, steering |
| 967–987 | Track proximity | Find nearest spline point, calculate on/off track |
| 989–1044 | Force model | Drag, engine torque, braking, coasting, handbrake |
| 1046–1067 | Steering | Speed-dependent turn rate, handbrake drift |
| 1069–1082 | Movement | cos/sin heading, elevation lerp |
| 1084–1113 | Barrier collision | Circle vs point, bounce with energy loss |
| 1116–1138 | Building collision | AABB vs circle, heavy speed loss |
| 1143–1164 | Car-car collision | Circle vs circle, push apart |
| 1167–1179 | Visual updates | Car position, roll, pitch |

**Phase:** [Phase 7](phase-7-physics-and-input.md), [Phase 8](phase-8-collisions.md)

---

## Rival AI (Lines 1182–1208) {#rival-ai}

| Lines | Code | Purpose |
|---|---|---|
| 1186 | `rival.t += (rival.speed / trackLength) * dt` | Advance along spline |
| 1192–1193 | Lane weaving | Sine wave lateral offset |
| 1195–1206 | Positioning | Get spline point + tangent, apply lane offset |

**Phase:** [Phase 9](phase-9-camera-and-ai.md#rival-ai)

---

## Camera (Lines 1212–1242) {#camera}

| Lines | Code | Purpose |
|---|---|---|
| 1216–1241 | `updateCamera()` | Chase camera with exponential lerp smoothing |
| 1233 | `camera.position.lerp(anchor, 1 - Math.exp(-8 * dt))` | Frame-rate independent smoothing |
| 1241 | `camera.lookAt(cameraTarget)` | Point camera at a target |

**Phase:** [Phase 9](phase-9-camera-and-ai.md#chase-camera)

---

## HUD (Lines 1244–1300) {#hud}

| Lines | Code | Purpose |
|---|---|---|
| 1246–1247 | Speed display | `speed * 3.6` converts m/s to km/h |
| 1250–1266 | Gear display | Speed-range-based gear simulation |
| 1268–1283 | Status & messages | Countdown, flash messages, driving status |
| 1286–1300 | `isOnTrack()` | Checks if player is within track bounds |

**Phase:** [Phase 11](phase-11-ui-hud-minimap.md#hud-updates)

---

## Resize & Game Loop (Lines 1302–1347) {#game-loop}

| Lines | Code | Purpose |
|---|---|---|
| 1303–1308 | Resize handler | Updates camera aspect, renderer size, composer size |
| 1311 | `new THREE.Clock()` | Timer for delta time |
| 1313–1343 | `animate()` | Main game loop — updates physics, camera, HUD, renders |
| 1314 | `Math.min(clock.getDelta(), 0.035)` | Delta time capped at 35ms |
| 1339 | `composer.render()` | Renders with post-processing |
| 1341 | `minimapRenderer.render(scene, minimapCamera)` | Renders minimap |
| 1346 | `renderer.setAnimationLoop(animate)` | Starts the loop at ~60 FPS |

**Phase:** [Phase 11](phase-11-ui-hud-minimap.md#the-game-loop)
