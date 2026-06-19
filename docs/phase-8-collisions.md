# Phase 8 — Collision Detection

> **Goal:** Prevent the car from passing through barriers, buildings, and rival cars.
> **What you'll learn:** Circle-vs-point collision, AABB-vs-circle collision, circle-vs-circle collision, penetration resolution, bounce physics.
> **Code reference:** [main.js lines 1084–1164](../main.js) → [Full Reference](ref-main-js.md#collisions)

---

## Overview

The app has **three collision systems**, all in 2D (top-down, ignoring the Y axis):

| System | Shapes | Where |
|---|---|---|
| Barrier collision | Circle (car) vs Points (barrier samples) | [main.js lines 1084–1113](../main.js) |
| Building collision | Circle (car) vs AABB (building rectangle) | [main.js lines 1116–1138](../main.js) |
| Car-to-car collision | Circle (car) vs Circle (rival car) | [main.js lines 1143–1164](../main.js) |

The player car is treated as a circle with `radius = 2.2` units.

---

## 1. Barrier Collision — Circle vs Point

Barriers are stored as sampled points along the track edges (generated in Phase 4). Each collider has a position and an inward-facing normal.

```javascript
const carRadius = 2.2;
const playerPos2D = new THREE.Vector2(player.position.x, player.position.z);

for (let i = 0; i < barrierColliders.length; i++) {
  const bc = barrierColliders[i];
  const dx = playerPos2D.x - bc.point.x;
  const dy = playerPos2D.y - bc.point.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < carRadius) {
    // COLLISION! Push the car out
    const penetration = carRadius - dist;
    const nx = dx / (dist || 0.01);
    const ny = dy / (dist || 0.01);
    player.position.x += nx * penetration;
    player.position.z += ny * penetration;

    // Reduce speed (bounce with energy loss)
    const velX = fwdX * player.speed;
    const velZ = fwdZ * player.speed;
    const dotVN = velX * nx + velZ * ny;
    if (dotVN < 0) {  // Only if moving TOWARD the barrier
      player.speed *= Math.max(0.1, 1 - Math.abs(dotVN / (Math.abs(player.speed) || 1)) * 0.6);
      player.speed = Math.max(player.speed * 0.3, 0);
    }
  }
}
```

> **Reference:** [main.js lines 1084–1113](../main.js)

### How It Works — Step by Step

```
1. Calculate distance from car center to barrier point
2. If distance < carRadius → collision detected!
3. Calculate penetration depth (how far the car is inside the barrier)
4. Push car outward by the penetration amount
5. Calculate how directly the car hit the barrier (dot product)
6. Reduce speed proportionally to the impact angle
```

### Key Concepts

**Penetration Resolution:**
```
Before:                          After push:
   ●═══╪═══●  barrier            ●═══╪═══●
     (car overlaps)                 ○
        ○                        (car pushed out)
```

The car is pushed along the direction from barrier → car center, by exactly the penetration depth.

**`(dist || 0.01)`** — **IS vanilla JS.** The `||` operator returns the right side if the left is falsy (0). This prevents division by zero if `dist` is exactly 0.

**Dot Product for Impact Angle:**
```javascript
const dotVN = velX * nx + velZ * ny;
if (dotVN < 0) { ... }  // Only bounce if moving TOWARD barrier
```

The dot product of velocity and the push normal tells us:
- **Negative** = car is moving toward the barrier → apply bounce
- **Positive** = car is already moving away → do nothing (prevent double-bounce)

---

## 2. Building Collision — Circle vs AABB

Buildings are rectangles (Axis-Aligned Bounding Boxes). The collision finds the **closest point on the rectangle** to the car center.

```javascript
for (let i = 0; i < buildingColliders.length; i++) {
  const b = buildingColliders[i];

  // Find closest point on rectangle to car center
  const closestX = Math.max(b.cx - b.halfW, Math.min(player.position.x, b.cx + b.halfW));
  const closestZ = Math.max(b.cz - b.halfD, Math.min(player.position.z, b.cz + b.halfD));

  // Distance from car center to closest point
  const ddx = player.position.x - closestX;
  const ddz = player.position.z - closestZ;
  const distSq = ddx * ddx + ddz * ddz;

  if (distSq < carRadius * carRadius && distSq > 0.001) {
    const dist = Math.sqrt(distSq);
    const penetration = carRadius - dist;
    const nx = ddx / dist;
    const nz = ddz / dist;
    player.position.x += nx * penetration;
    player.position.z += nz * penetration;
    player.speed *= 0.2;  // Lose 80% speed
  }
}
```

> **Reference:** [main.js lines 1116–1138](../main.js)

### Finding the Closest Point on a Rectangle

```javascript
const closestX = Math.max(b.cx - b.halfW, Math.min(player.position.x, b.cx + b.halfW));
```

**`Math.max` and `Math.min` — IS vanilla JS.** This is the **clamping** pattern — it restricts a value to a range:

```
If car is LEFT of the building:    closestX = left edge
If car is INSIDE the building:     closestX = car's X
If car is RIGHT of the building:   closestX = right edge
```

```
  ┌──────────┐
  │ Building │    ● Car
  │          │   ╱
  │    ★ ←───╫──╱  ★ = closest point on rectangle
  │          │
  └──────────┘
```

### `distSq < carRadius * carRadius`

**Why compare squared distances?** `Math.sqrt()` is computationally expensive. Since `a < b` is equivalent to `a² < b²` (for positive numbers), we skip the square root in the comparison and only compute it when we actually need the distance for the push calculation.

### `distSq > 0.001`

Prevents division by zero when the car center is exactly on the closest point.

---

## 3. Car-to-Car Collision — Circle vs Circle

The simplest collision type — just check if two circles overlap.

```javascript
rivals.forEach((rival) => {
  if (!rival.mesh) return;
  const dx = player.position.x - rival.mesh.position.x;
  const dz = player.position.z - rival.mesh.position.z;
  const distSq = dx * dx + dz * dz;
  const colDist = 3.2;  // Combined radius of both cars

  if (distSq < colDist * colDist) {
    const dist = Math.sqrt(distSq) || 0.1;
    const overlap = colDist - dist;
    const pushX = (dx / dist) * overlap * 0.7;
    const pushZ = (dz / dist) * overlap * 0.7;
    player.position.x += pushX;
    player.position.z += pushZ;
    player.speed *= 0.75;  // Lose 25% speed
  }
});
```

> **Reference:** [main.js lines 1143–1164](../main.js)

### How Circle-Circle Collision Works

```
     ○ Player (radius ≈ 1.6)
    ╱│╲
   ╱ │ ╲  ← distance between centers
  ╱  │  ╲
 ○───┘   ← Rival (radius ≈ 1.6)

If distance < 3.2 (both radii combined) → overlap!
Push player away from rival.
```

The `overlap * 0.7` factor means the push is slightly less than the full overlap — this creates a softer, less bouncy collision.

---

## Collision Timer (Cooldown)

```javascript
if (player.collisionTimer <= 0) {
  player.collisionTimer = 0.3;    // 300ms cooldown
  setFlash("Impact!", 0.5);       // Show message
}

// Later in the frame:
if (player.collisionTimer > 0) player.collisionTimer -= dt;
```

> **Reference:** [main.js lines 1109–1111, 1141](../main.js)

This prevents the "Impact!" message from spamming when the car slides along a barrier. After triggering, there's a 0.3-second cooldown before it can trigger again.

### `setFlash(text, duration)` — Custom Function

```javascript
function setFlash(text, duration) {
  race.flashText = text;
  race.flashTimer = duration;
}
```

> **Reference:** [main.js lines 884–887](../main.js)

Sets a big message to display on screen (like "GO!", "Impact!", "Collision!"). The message disappears after `duration` seconds.

---

## Phase 8 Checkpoint

At this point you should have:
- [x] Car bouncing off barriers with speed loss
- [x] Car stopped by buildings with heavy speed loss
- [x] Car pushed away from rival cars on contact
- [x] Collision messages ("Impact!", "Collision!")
- [x] Understanding of three collision detection methods

**Next:** [Phase 9 — Camera System & Rival AI →](phase-9-camera-and-ai.md)
