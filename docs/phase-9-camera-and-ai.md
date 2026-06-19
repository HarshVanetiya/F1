# Phase 9 — Camera System & Rival AI

> **Goal:** Make the camera follow the player smoothly. Add AI cars that drive around the track.
> **What you'll learn:** Chase camera, `lerp`, exponential smoothing (`Math.exp`), spline-following AI, sine-wave lane weaving.
> **Code reference:** [main.js lines 1182–1242](../main.js) → [Full Reference](ref-main-js.md#camera)

---

## Chase Camera

```javascript
const cameraAnchor = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();

function updateCamera(dt) {
  const fwdX = Math.cos(player.heading);
  const fwdZ = Math.sin(player.heading);
  const followDist = 8.5;   // Units behind the car
  const followH = 3.2;      // Units above the car

  // Ideal camera position: behind and above the car
  cameraAnchor.set(
    player.position.x - fwdX * followDist,
    player.position.y + followH,
    player.position.z - fwdZ * followDist
  );

  // Smooth movement
  if (Math.abs(player.speed) < 0.1) {
    camera.position.copy(cameraAnchor);      // Snap when stopped
  } else {
    camera.position.lerp(cameraAnchor, 1 - Math.exp(-8 * dt));
  }

  // Look ahead of the car (12 units in front)
  cameraTarget.set(
    player.position.x + fwdX * 12,
    player.position.y + 1.2,
    player.position.z + fwdZ * 12
  );
  camera.lookAt(cameraTarget);
}
```

> **Reference:** [main.js lines 1213–1242](../main.js)

### Camera Position Calculation

```
                 Camera
                   ●
                  ╱│╲
              8.5╱ │3.2 (height)
               ╱   │
              ╱    │
         Car ●─────┘──→ Direction of travel
              └──12 units──→ Look-at target
```

The camera sits **behind** the car (in the opposite direction of travel) and **above** it. It looks at a point **ahead** of the car.

### `.position.copy(source)` — **Not vanilla JS**

Copies all three components from `source` to `position`. Unlike `.set(x,y,z)`, this takes a Vector3 directly.

### `.position.lerp(target, factor)` — **Not vanilla JS**

Moves the camera's position **partway** toward the target:
- `factor = 0` → stay where you are
- `factor = 1` → jump instantly to target
- `factor = 0.1` → move 10% of the remaining distance

### `1 - Math.exp(-8 * dt)` — Frame-Rate Independent Smoothing

**`Math.exp()` — IS vanilla JS.** Returns e^x (Euler's number raised to a power).

The problem with plain `lerp(target, 0.1)` is that the smoothing speed changes with frame rate:
- At 60 FPS: each frame moves 10% → total per second: ~1 - 0.9^60 ≈ 99.8%
- At 30 FPS: each frame moves 10% → total per second: ~1 - 0.9^30 ≈ 95.8%

The formula `1 - Math.exp(-rate * dt)` produces the same smoothing regardless of frame rate. `rate = 8` means the camera catches up to 99.97% of the target position per second.

### `camera.lookAt(target)` — **Not vanilla JS**

Rotates the camera to face the given point. This is much easier than manually calculating rotation angles.

---

## Why Two Variables (`cameraAnchor` and `cameraTarget`)?

Instead of creating new `Vector3` objects every frame, the code reuses two pre-created vectors with `.set()`. Creating objects in JavaScript triggers **garbage collection** — the runtime periodically pauses to clean up unused objects. In a 60 FPS game loop, creating objects every frame causes micro-stutters. Reusing vectors avoids this.

---

## Rival AI

```javascript
function updateRivals(dt) {
  rivals.forEach((rival, idx) => {
    // Move along the spline
    rival.t += (rival.speed / trackLength) * dt;
    if (rival.t >= 1) rival.t -= 1;  // Wrap around the loop

    // Lane weaving (sine wave)
    rival.laneOffset = rival.baseLaneOffset
      + Math.sin(race.elapsed * 1.5 + idx * 2) * 1.8;

    // Get track position and direction
    const pt = trackCurve.getPointAt(rival.t);
    const tn = trackCurve.getTangentAt(rival.t);
    const txz = new THREE.Vector3(tn.x, 0, tn.z).normalize();
    const lat = new THREE.Vector3(-txz.z, 0, txz.x);

    // Final position = track center + lateral offset
    const finalPos = pt.clone().add(lat.clone().multiplyScalar(rival.laneOffset));

    rival.mesh.position.set(finalPos.x, pt.y, finalPos.z);
    rival.mesh.rotation.y = Math.PI / 2 - Math.atan2(tn.z, tn.x);
  });
}
```

> **Reference:** [main.js lines 1183–1208](../main.js)

### How Rivals Move

Rivals don't have physics. They simply advance their `t` parameter along the track spline at a constant speed:

```javascript
rival.t += (rival.speed / trackLength) * dt;
//          │             │              └── Frame-rate independent
//          │             └── Total track length in world units
//          └── Speed in m/s → converted to t-units/second
```

- `rival.speed = 20` m/s and `trackLength = 500` m → `t` increases by `20/500 = 0.04` per second
- After 25 seconds, `t` reaches 1.0 → wraps back to 0 (completed one lap)

### Lane Weaving

```javascript
rival.laneOffset = rival.baseLaneOffset + Math.sin(race.elapsed * 1.5 + idx * 2) * 1.8;
```

**`Math.sin()` — IS vanilla JS.** The sine function oscillates between -1 and +1. By feeding in the elapsed time, we get smooth back-and-forth motion:

- `race.elapsed * 1.5` → oscillation speed (one full wave every ~4.2 seconds)
- `idx * 2` → each rival's wave is offset in phase (they don't weave in sync)
- `* 1.8` → maximum sideways deviation = 1.8 units

```
Time: 0s     2s     4s     6s     8s
Lane: ─0─┐       ┌─0─┐       ┌─0─
         └──1.8──┘   └──1.8──┘
```

### Facing the Right Direction

```javascript
rival.mesh.rotation.y = Math.PI / 2 - Math.atan2(tn.z, tn.x);
```

Converts the track tangent direction into a Three.js Y-rotation. The `Math.PI / 2` offset accounts for the fact that Three.js models typically face along the Z-axis, while `atan2` measures from the X-axis.

---

## Phase 9 Checkpoint

At this point you should have:
- [x] A smooth chase camera that follows behind the player
- [x] Camera snaps instantly when the car is stopped
- [x] Frame-rate independent camera smoothing
- [x] 5 rival cars driving around the track at different speeds
- [x] Rivals weaving between lanes naturally

**Next:** [Phase 10 — Post-Processing (Bloom) →](phase-10-post-processing.md)
