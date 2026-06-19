# Phase 2 — Lighting & Environment

> **Goal:** Add lights so objects are visible. Create the ground plane, sea, and a sun glow.
> **What you'll learn:** `HemisphereLight`, `DirectionalLight`, shadow configuration, `Mesh`, `MeshStandardMaterial`, `MeshBasicMaterial`, `PlaneGeometry`, `SphereGeometry`.
> **Code reference:** [main.js lines 106–296](../main.js) → [Full Reference](ref-main-js.md#lighting)

---

## Why Do We Need Lights?

In Three.js, `MeshStandardMaterial` (the most common material) is **physically-based** — it simulates how real surfaces interact with light. Without any lights in the scene, every surface receives zero light and renders as **pure black**.

The only exception is `MeshBasicMaterial`, which ignores lighting entirely and always shows its color at full brightness.

---

## Hemisphere Light — Ambient Sky + Ground Light

```javascript
const hemiLight = new THREE.HemisphereLight(0xaaccff, 0x3c5a38, 1.2);
scene.add(hemiLight);
```

> **Reference:** [main.js lines 107–108](../main.js)

### `new THREE.HemisphereLight(skyColor, groundColor, intensity)`

**Not vanilla JS.** Simulates outdoor ambient lighting by casting light from two hemispheres:

```
         ☁️ Sky color (0xaaccff — light blue)
         ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
    ─────────────────────────────
    ░░░░░░░░░ OBJECT ░░░░░░░░░░░
    ─────────────────────────────
         ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑
         🌿 Ground color (0x3c5a38 — dark green)
```

- Top surfaces receive the **sky color** (cool blue)
- Bottom surfaces receive the **ground color** (warm green — simulating light bouncing off grass)
- `intensity: 1.2` — slightly brighter than the default 1.0

**Why use it?** It prevents pitch-black shadows. In real life, shadows aren't pure black because light bounces around the environment. This light simulates that effect cheaply.

---

## Directional Light — The Sun

```javascript
const sun = new THREE.DirectionalLight(0xffeedd, 2.5);
sun.position.set(120, 150, 45);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
sun.shadow.camera.near = 10;
sun.shadow.camera.far = 600;
sun.shadow.camera.left = -200;
sun.shadow.camera.right = 200;
sun.shadow.camera.top = 200;
sun.shadow.camera.bottom = -200;
sun.shadow.bias = -0.0005;
scene.add(sun);
```

> **Reference:** [main.js lines 110–121](../main.js)

### `new THREE.DirectionalLight(color, intensity)`

**Not vanilla JS.** Creates a light where all rays are **parallel** — like real sunlight. The position doesn't define where the light comes from, it defines the **direction** (from `position` toward the scene origin `(0,0,0)`).

### `.position.set(x, y, z)`

**Not vanilla JS.** Sets the 3D position. Every Three.js object has a `.position` property which is a `THREE.Vector3`. The `.set(x, y, z)` method updates all three components at once.

### Shadow Configuration Explained

| Property | Value | What It Does |
|---|---|---|
| `castShadow = true` | — | Enables this light to create shadows |
| `shadow.mapSize.set(4096, 4096)` | 4096×4096 | The resolution of the shadow texture. Higher = sharper shadows but slower. 4096 is high quality |
| `shadow.camera.near/far` | 10 / 600 | Only objects between 10–600 units from the light cast shadows |
| `shadow.camera.left/right/top/bottom` | -200 / 200 | The rectangular area that receives shadows (a 400×400 world-unit box) |
| `shadow.bias = -0.0005` | Small negative | Prevents **shadow acne** — ugly dot patterns on surfaces that incorrectly shadow themselves |

#### What is Shadow Acne?

Shadow acne happens because the shadow map has limited precision. A surface might think it's in its own shadow due to rounding errors, creating a noisy dot pattern. The `bias` slightly offsets shadow calculations to fix this.

---

## Sun Glow — A Visual Decoration

```javascript
const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(16, 24, 24),
  new THREE.MeshBasicMaterial({ color: 0xfff0b5 })
);
sunGlow.position.set(-120, 150, -180);
scene.add(sunGlow);
```

> **Reference:** [main.js lines 123–128](../main.js)

### What is a `THREE.Mesh`?

**Not vanilla JS.** A Mesh is a visible 3D object. It combines:
- **Geometry** — the shape (where are the vertices?)
- **Material** — the appearance (what color? how shiny?)

```
Mesh = Geometry + Material
       (shape)    (looks)
```

### `new THREE.SphereGeometry(radius, widthSegments, heightSegments)`

Creates a sphere shape. More segments = smoother sphere (but more triangles for the GPU).

- `radius: 16` — 16 world-units across
- `widthSegments: 24` — 24 divisions around the equator
- `heightSegments: 24` — 24 divisions from pole to pole

### `new THREE.MeshBasicMaterial({ color: 0xfff0b5 })`

**Key difference from MeshStandardMaterial:** `MeshBasicMaterial` ignores ALL lights. It always shows at full brightness. Perfect for things that should glow (like a sun in the sky).

### `scene.add(object)`

**Not vanilla JS.** Adds an object to the scene. Nothing is visible until you `add` it to the scene (or to a group that's in the scene).

---

## Ground Plane

```javascript
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(600, 600),
  new THREE.MeshStandardMaterial({ color: 0x2f7d3c, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
ground.receiveShadow = true;
scene.add(ground);
```

> **Reference:** [main.js lines 275–282](../main.js)

### `new THREE.PlaneGeometry(width, height)`

Creates a flat rectangle. By default it faces the camera (vertical). We rotate it to be horizontal (the ground).

### `ground.rotation.x = -Math.PI / 2`

**`.rotation` is not vanilla JS** (it's a `THREE.Euler`), but **`Math.PI` IS vanilla JS**.

Rotations in Three.js use **radians**, not degrees:
- `Math.PI` = 180°
- `Math.PI / 2` = 90°
- `-Math.PI / 2` = -90° (rotates the plane to face upward)

### `MeshStandardMaterial` Properties

```javascript
new THREE.MeshStandardMaterial({
  color: 0x2f7d3c,   // Green
  roughness: 1        // Fully matte (no reflections)
})
```

- **`roughness: 0`** = mirror-smooth (reflects everything)
- **`roughness: 1`** = fully diffuse, like chalk or grass
- **`metalness`** (not set here, defaults to 0) = non-metallic surface

### `ground.receiveShadow = true`

Tells the renderer: "Other objects can cast shadows onto this surface." Without this, the ground would have no shadows even if the sun is set up for shadows.

**The shadow pair:**
- `object.castShadow = true` — "I block light and create shadows"
- `object.receiveShadow = true` — "I show other objects' shadows on my surface"

---

## Sea Plane

```javascript
const sea = new THREE.Mesh(
  new THREE.PlaneGeometry(600, 200),
  new THREE.MeshStandardMaterial({
    color: 0x1a7b9e,
    roughness: 0.25,
    metalness: 0.15,
    transparent: true,
    opacity: 0.92
  })
);
sea.rotation.x = -Math.PI / 2;
sea.position.set(0, -0.15, 120);
scene.add(sea);
```

> **Reference:** [main.js lines 284–296](../main.js)

### Transparency

```javascript
transparent: true,  // Enable the transparency system (required!)
opacity: 0.92       // 0 = invisible, 1 = fully solid
```

You must set `transparent: true` before `opacity` has any effect. `0.92` means 92% opaque (slightly see-through, like water).

### Low Roughness + Some Metalness

`roughness: 0.25` makes the sea reflective (shinier than the grass). `metalness: 0.15` adds a subtle metallic tint to the reflections. Together, they simulate a water-like surface.

---

## Racing Line

```javascript
const racingLine = new THREE.Mesh(
  buildTrackGeometry(trackCurve, 1.5, 400),
  new THREE.MeshStandardMaterial({
    color: 0x565f6e,
    roughness: 0.7,
    transparent: true,
    opacity: 0.4
  })
);
racingLine.position.y = 0.01;
racingLine.layers.enable(1);
scene.add(racingLine);
```

> **Reference:** [main.js lines 298–309](../main.js)

### `position.y = 0.01`

This places the racing line very slightly above the track surface (0.01 units) to prevent **Z-fighting** — a visual glitch where two surfaces at the same height flicker because the GPU can't decide which one is "in front."

### `.layers.enable(1)`

**Not vanilla JS.** Three.js has a **layer system** (0–31). By default, all objects are on layer 0, and cameras see layer 0. This line adds the racing line to layer 1 as well, so the minimap camera (which has layer 1 enabled) can also see it. More on layers in [Phase 11](phase-11-ui-hud-minimap.md).

---

## Phase 2 Checkpoint

At this point you should have:
- [x] A sky-blue scene with fog
- [x] A hemisphere light (ambient) and a directional light (sun) with shadows
- [x] A green ground plane and a blue sea plane
- [x] A glowing sun sphere in the sky
- [x] Shadow mapping configured and working

**Next:** [Phase 3 — Track with Splines →](phase-3-track-with-splines.md)
