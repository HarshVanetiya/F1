# Phase 3 — Track with Splines

> **Goal:** Define a smooth racing circuit and build a track surface mesh from custom geometry.
> **What you'll learn:** `CatmullRomCurve3`, `Vector3`, the `t` parameter, `BufferGeometry`, vertices/normals/indices, lateral direction math.
> **Code reference:** [main.js lines 130–309](../main.js) → [Full Reference](ref-main-js.md#track-circuit)

---

## What is a Spline?

A spline is a **smooth curve** that passes through a series of control points. Instead of connecting points with straight lines (sharp corners), a spline calculates curves that flow smoothly:

```
Straight lines (polyline):      Spline (smooth curve):
  •─────•                        •╲    ╱•
  │     │                          ╲╭╮╱
  •─────•                        •──╰╯──•
```

In this app, the racing circuit is defined as a spline — a smooth closed loop.

---

## Defining the Track Shape

```javascript
const trackControlPoints = [
  new THREE.Vector3(-80, 0, 0),   // Start/Finish straight
  new THREE.Vector3(-40, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(40, 0, 0),
  // Turn 1 — wide sweeping right
  new THREE.Vector3(70, 0, -8),
  new THREE.Vector3(90, 0, -25),
  new THREE.Vector3(100, 0, -50),
  // ... more points
];
```

> **Reference:** [main.js lines 133–167](../main.js)

### `new THREE.Vector3(x, y, z)`

**Not vanilla JS.** A `Vector3` is a fundamental Three.js class representing a point in 3D space or a direction. It has three components:

```
        y (up/down)
        │
        │      z (north/south — in Three.js, Z points TOWARD the viewer by default)
        │     ╱
        │    ╱
        │   ╱
        │  ╱
        │ ╱
        │╱──────────── x (east/west)
```

In this app:
- **x** = left/right (east/west)
- **y** = up/down (elevation changes on the track — some sections are raised)
- **z** = forward/back (north/south)

#### Commonly Used Vector3 Methods

```javascript
vector.clone()                    // Creates a copy (so the original isn't modified)
vector.add(otherVector)           // Adds component-wise: (x1+x2, y1+y2, z1+z2)
vector.multiplyScalar(n)          // Multiplies all components by n: (x*n, y*n, z*n)
vector.normalize()                // Scales to length 1 (keeps direction, changes size)
vector.dot(otherVector)           // Dot product: returns a single number
vector.set(x, y, z)              // Overwrites all three components
vector.copy(otherVector)          // Copies values from another vector
vector.length()                   // Returns the magnitude (distance from origin)
```

> **Why `.clone()` matters:** If you do `const b = a.add(c)`, it modifies `a` IN PLACE and returns `a`. To keep `a` unchanged, do `const b = a.clone().add(c)`.

---

## Creating the Curve

```javascript
const trackCurve = new THREE.CatmullRomCurve3(
  trackControlPoints,   // Array of Vector3 points
  true,                 // closed — the curve loops back to the start
  "catmullrom",         // Curve type
  0.5                   // Tension: 0 = loose swooping curves, 1 = tight sharp curves
);
const trackLength = trackCurve.getLength();
```

> **Reference:** [main.js lines 169–175](../main.js)

### `new THREE.CatmullRomCurve3(points, closed, type, tension)`

**Not vanilla JS.** Creates a smooth curve that passes through every control point.

- **`closed: true`** — The curve connects the last point back to the first, forming a loop. Essential for a racing circuit.
- **`type: "catmullrom"`** — The algorithm used for smoothing. Catmull-Rom splines are widely used in games because they naturally pass through every control point.
- **`tension: 0.5`** — Controls how "tight" the curves are. `0` = very round/loose. `1` = sharp/angular. `0.5` is a balanced default.

### The `t` Parameter

Every spline has a parameter `t` that goes from **0.0** (start) to **1.0** (end):

```
t = 0.0        t = 0.25       t = 0.5        t = 0.75       t = 1.0
  START ────── Quarter ────── Halfway ────── Three-Quarter ──── END
  │                                                             │
  └───────── Same point (because closed = true) ───────────────┘
```

Key methods:
```javascript
trackCurve.getPointAt(t)     // Returns the 3D position at t → Vector3
trackCurve.getTangentAt(t)   // Returns the direction at t → Vector3 (unit length)
trackCurve.getLength()       // Total length of the curve in world units → number
```

- **`getPointAt(0.5)`** → "Where is the midpoint of the track?" → returns `Vector3(x, y, z)`
- **`getTangentAt(0.5)`** → "Which direction is the track heading at the midpoint?" → returns a unit `Vector3`

---

## Spline Cache — Performance Optimization

```javascript
const SPLINE_SAMPLES = 600;
const splineCache = [];
for (let i = 0; i <= SPLINE_SAMPLES; i++) {
  const t = i / SPLINE_SAMPLES;
  splineCache.push({
    t,
    point: trackCurve.getPointAt(t),
    tangent: trackCurve.getTangentAt(t),
  });
}
```

> **Reference:** [main.js lines 178–187](../main.js)

### Why Cache?

Calculating positions on a spline involves solving polynomial equations — this is slow. During gameplay, we need to find the **nearest point on the track** to the player car **every single frame** (60 times per second). Instead of recalculating, we pre-compute 600 evenly spaced samples and store them in an array.

### `getClosestSplineData()` — Nearest Point Finder

```javascript
function getClosestSplineData(pos, lastT, windowSize) {
  const win = windowSize || 0.15;
  let minDist = Infinity;
  let bestIdx = 0;

  // First pass: only search near where the car was last frame
  for (let i = 0; i < splineCache.length; i++) {
    let tDiff = Math.abs(splineCache[i].t - lastT);
    if (tDiff > 0.5) tDiff = 1 - tDiff;  // Handle wrap-around
    if (tDiff > win) continue;            // Skip distant points

    const dx = pos.x - splineCache[i].point.x;
    const dz = pos.z - splineCache[i].point.z;
    const d = dx * dx + dz * dz;  // Distance² (no sqrt for speed)
    if (d < minDist) { minDist = d; bestIdx = i; }
  }

  // Fallback: search everything (in case car teleported)
  // ... (similar loop without the window filter)

  return { t, point, tangent, distance };
}
```

> **Reference:** [main.js lines 189–227](../main.js)

**Key optimizations:**
- **Windowed search:** Only checks points where `t` is within ±0.15 of the car's last known `t`. A car can't jump halfway around the track in one frame.
- **Distance squared:** `dx*dx + dz*dz` avoids `Math.sqrt()` which is slow. We only need to compare distances (not compute exact values), and comparing squares works fine.
- **Wrap-around handling:** `if (tDiff > 0.5) tDiff = 1 - tDiff` — on a closed loop, t=0.95 and t=0.05 are very close (difference is 0.1), not 0.9.

---

## Building the Track Mesh — Custom Geometry

The track surface isn't a simple rectangle — it curves along the spline. We build its geometry manually.

```javascript
function buildTrackGeometry(curve, width, segments) {
  const vertices = [];
  const normals = [];
  const indices = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    // Lateral direction = perpendicular to tangent (sideways)
    const tangXZ = new THREE.Vector3(tangent.x, 0, tangent.z).normalize();
    const lat = new THREE.Vector3(-tangXZ.z, 0, tangXZ.x);

    const left  = point.clone().add(lat.clone().multiplyScalar(width / 2));
    const right = point.clone().add(lat.clone().multiplyScalar(-width / 2));

    vertices.push(left.x, left.y + 0.02, left.z);
    vertices.push(right.x, right.y + 0.02, right.z);
    normals.push(0, 1, 0,  0, 1, 0);

    if (i < segments) {
      const a = i * 2, b = i * 2 + 1;
      const c = (i + 1) * 2, d = (i + 1) * 2 + 1;
      indices.push(a, c, b,  b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  return geo;
}
```

> **Reference:** [main.js lines 230–263](../main.js)

### Understanding Vertices, Normals, and Indices

#### Vertices — The Corners

Every 3D shape is made of **triangles**, and triangles are defined by their **corners (vertices)**. Vertices are stored as a flat array:

```javascript
vertices = [x0,y0,z0, x1,y1,z1, x2,y2,z2, ...]
//          └─point 0─┘ └─point 1─┘ └─point 2─┘
```

#### Normals — Which Way the Surface Faces

A **normal** is a direction vector perpendicular to the surface. The GPU uses normals to calculate how light bounces off. For a flat ground-like track, all normals point straight up: `(0, 1, 0)`.

```
         ↑ Normal (0, 1, 0) — points up
         │
    ─────●───── Surface
```

#### Indices — Which Vertices Form Triangles

Instead of repeating vertex data for shared corners, **indices** reference vertices by number:

```
    Vertex 0 (left) ●───────● Vertex 2 (left)
                     │╲  T1  │
                     │  ╲    │
                     │ T2 ╲  │
    Vertex 1 (right) ●───────● Vertex 3 (right)

    indices = [0, 2, 1,   1, 2, 3]
              └─ T1 ──┘  └─ T2 ──┘
```

### The Lateral Direction Math

```javascript
const tangXZ = new THREE.Vector3(tangent.x, 0, tangent.z).normalize();
const lat = new THREE.Vector3(-tangXZ.z, 0, tangXZ.x);
```

This is 2D vector rotation. To get a perpendicular (90°) direction from a vector `(x, z)`, you swap and negate: `(-z, x)`.

```
If track heads east → tangent = (1, 0)
Lateral = (0, 1) → north (sideways to the track!)

If track heads northeast → tangent = (0.7, 0.7)
Lateral = (-0.7, 0.7) → northwest (still sideways!)
```

The `normalize()` ensures the tangent has length 1 before we use it, so the lateral direction is also length 1.

### `new THREE.BufferGeometry()`

**Not vanilla JS.** An empty geometry container. You fill it with attributes:

```javascript
geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
//                                                             data      items per vertex (x,y,z = 3)
geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
geo.setIndex(indices);
```

### `new THREE.Float32BufferAttribute(array, itemSize)`

**Not vanilla JS.** Wraps a JavaScript array into a GPU-friendly typed array (`Float32Array`). The `itemSize` parameter tells Three.js how to group the numbers:
- `3` for positions (x, y, z)
- `3` for normals (nx, ny, nz)
- `2` for UV coordinates (u, v) — not used here

---

## Using the Track Geometry

```javascript
const trackMesh = new THREE.Mesh(
  buildTrackGeometry(trackCurve, TRACK_WIDTH, 600),
  new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.85, metalness: 0.1 })
);
trackMesh.receiveShadow = true;
trackMesh.layers.enable(1);
scene.add(trackMesh);
```

> **Reference:** [main.js lines 266–272](../main.js)

- `TRACK_WIDTH = 22` — the track is 22 world-units wide
- `600` segments — the track geometry is divided into 600 strips for smooth curves
- Dark gray color (`0x22252a`) with high roughness = realistic asphalt look

---

## Phase 3 Checkpoint

At this point you should have:
- [x] A smooth closed circuit defined by control points
- [x] A dark track surface following the spline curve
- [x] A pre-computed spline cache for fast lookups
- [x] Understanding of custom geometry (vertices, normals, indices)

**Next:** [Phase 4 — Track Details: Kerbs, Barriers, Start Line →](phase-4-track-details.md)
