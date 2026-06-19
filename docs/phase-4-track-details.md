# Phase 4 — Track Details: Kerbs, Barriers, Start Line

> **Goal:** Add the red/white kerbs, metal barriers, start/finish line, and a tunnel section.
> **What you'll learn:** Multi-material meshes, `addGroup()`, barrier collider data generation, `THREE.Group`, `Math.atan2`.
> **Code reference:** [main.js lines 311–578](../main.js) → [Full Reference](ref-main-js.md#track-edges)

---

## Kerbs & Barriers — `buildTrackEdgeAssets()`

This single function builds **four** things along the track:
1. Red kerb strips (left + right edges)
2. White kerb strips (left + right edges)
3. Metal barriers (left + right, set back from the track edge)
4. Collision data for the barriers (used by physics later)

```javascript
function buildTrackEdgeAssets(curve, width, segments) {
  const kerbWidth = 1.2;
  const barrierOffset = 1.6;  // Distance from track edge to barrier
  // ...
}
```

> **Reference:** [main.js lines 315–460](../main.js)

### How Kerbs Are Built

For each segment of the track, the function:
1. Gets the track center point and tangent
2. Calculates the lateral (sideways) direction
3. Creates four vertices: inner edge, outer edge, for both left and right sides
4. Alternates between red and white every 4 segments

```javascript
const isRed = (i % 8) < 4;  // Red for first 4 segments, white for next 4, repeat
```

**`%` is vanilla JS** — the modulo operator. `i % 8` gives the remainder when dividing by 8, cycling 0→7 repeatedly.

### Multi-Material Meshes

A single mesh can use **multiple materials** by dividing its indices into groups:

```javascript
// Define which triangles use which material
kerbGeo.addGroup(0, kerbIndicesRed.length, 0);
//               │  │                       └── Material index 0 (red)
//               │  └── How many indices in this group
//               └── Starting index

kerbGeo.addGroup(kerbIndicesRed.length, kerbIndicesWhite.length, 1);
//               │                      │                        └── Material index 1 (white)
//               │                      └── Count
//               └── Start (right after the red group ends)

// Pass an ARRAY of materials
const kerbMesh = new THREE.Mesh(edges.kerbGeo, [
  new THREE.MeshStandardMaterial({ color: 0xd94735 }),  // Index 0 = Red
  new THREE.MeshStandardMaterial({ color: 0xf7f4ed })   // Index 1 = White
]);
```

> **Reference:** [main.js lines 412–470](../main.js)

**`geo.addGroup(start, count, materialIndex)`** — **Not vanilla JS.** Tells Three.js: "For indices from `start` to `start + count`, use the material at `materialIndex` in the materials array."

### Barrier Geometry

Barriers are walls — vertical rectangles along each edge. Each segment creates 4 vertices per side:

```
     ● ─────── ●   ← Top edge (y = height)
     │  BARRIER │
     │   FACE   │
     ● ─────── ●   ← Bottom edge (y = 0)

  segment i    segment i+1
```

Plus a **top cap** for thickness (so barriers don't look paper-thin from above).

### Barrier Colliders — Physics Data

While building barrier geometry, the function also generates **collision data** for the physics engine:

```javascript
barrierColliders.push({
  point: new THREE.Vector2(bPos.x, bPos.z),   // 2D position (ignore Y)
  normal: new THREE.Vector2(lat.x * -s, lat.z * -s)  // Direction pointing inward
});
```

> **Reference:** [main.js lines 425–457](../main.js)

### `new THREE.Vector2(x, y)`

**Not vanilla JS.** Like `Vector3` but only 2 components. Used here because collision detection is done in 2D (top-down view — we ignore the vertical axis).

### Smart Collider Filtering

Not every barrier point gets a collider. The code checks if a barrier is near a **different section** of the track:

```javascript
// Check: is this barrier too close to another part of the track?
for (let j = 0; j < splineCache.length; j++) {
  let tDiff = Math.abs(splineCache[j].t - t);
  if (tDiff > 0.5) tDiff = 1 - tDiff;
  if (tDiff < 0.08) continue;  // Skip nearby same-section points
  // ... check distance
}
```

**Why?** On tight circuits, track sections can run parallel and close together. A barrier between them would block the car from one valid track section while driving on another. This filter skips those colliders.

---

## Start/Finish Line

```javascript
{
  const sp = trackCurve.getPointAt(0);     // Start position (t = 0)
  const st = trackCurve.getTangentAt(0);   // Start direction
  const heading = Math.atan2(st.z, st.x);  // Angle in radians
  // ...
}
```

> **Reference:** [main.js lines 478–534](../main.js)

### `Math.atan2(y, x)` — **IS vanilla JS**

Returns the angle (in radians) between the positive X-axis and the point `(x, y)`. Unlike `Math.atan(y/x)`, it handles all four quadrants correctly.

```
        90° (π/2)
          │
  180° ───┼─── 0°
  (π)     │
       -90° (-π/2)
```

Used here to convert the track's direction vector into an angle for rotating the start line.

### The Block Scope `{ ... }`

```javascript
{
  const sp = ...;
  const heading = ...;
  // ... all start line code
}
```

**IS vanilla JS.** Wrapping code in `{ }` creates a **block scope** — the `const` variables declared inside can't be accessed outside. This keeps the namespace clean without needing a function.

### Checkered Pattern

```javascript
for (let j = -4; j <= 4; j++) {
  const stripe = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 1.8),
    new THREE.MeshStandardMaterial({
      color: j % 2 === 0 ? 0x111111 : 0xffffff  // Alternating black and white
    })
  );
  // Position each stripe along the lateral direction
}
```

Creates a row of alternating black/white rectangles across the track — the classic F1 start/finish pattern.

### Start Gantry

```javascript
const gMat = new THREE.MeshStandardMaterial({
  color: 0x20252e, metalness: 0.35, roughness: 0.5
});

for (const s of [-1, 1]) {   // Left side and right side
  const pole = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 1), gMat);
  // Position at track edges...
}

const beam = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1, TRACK_WIDTH + 4), gMat
);
// Position above the poles...
```

Two vertical poles and a horizontal beam spanning the track — the overhead gantry you see at race starts.

### `for (const s of [-1, 1])` — **IS vanilla JS**

The `for...of` loop iterates over array values. `s` takes values `-1` then `1`, creating objects on both sides of the track with a single loop.

---

## Tunnel Section

```javascript
{
  const tunnelStartT = 0.28;   // Starts at 28% around the track
  const tunnelEndT = 0.35;     // Ends at 35%
  const tunnelFrames = 10;     // 10 arch-like frames

  for (let i = 0; i < tunnelFrames; i++) {
    const t = tunnelStartT + (i / (tunnelFrames - 1)) * (tunnelEndT - tunnelStartT);
    const pt = trackCurve.getPointAt(t);
    const tn = trackCurve.getTangentAt(t);
    // ... create walls and ceiling at each frame
  }
}
```

> **Reference:** [main.js lines 538–578](../main.js)

The tunnel is built from 10 evenly spaced "frames," each consisting of:
- Two walls (left and right) — tall thin boxes
- One ceiling — a wide box spanning the track

Each frame is rotated to match the track's direction at that point using the tangent.

---

## Phase 4 Checkpoint

At this point you should have:
- [x] Red and white kerbs along both track edges
- [x] Metal barriers with collision data
- [x] A checkered start/finish line with overhead gantry
- [x] A tunnel section covering part of the track
- [x] Understanding of multi-material meshes and geometry groups

**Next:** [Phase 5 — Scenery: Buildings, Trees, Grandstands →](phase-5-scenery.md)
