# Phase 7 — Input & Player Physics

> **Goal:** Handle keyboard input and simulate realistic car physics: acceleration, braking, drag, and steering.
> **What you'll learn:** `keydown`/`keyup` with `Set`, delta time (`dt`), force-based physics, torque curves, speed-dependent steering, `THREE.MathUtils.clamp`, `THREE.MathUtils.lerp`.
> **Code reference:** [main.js lines 865–1180](../main.js) → [Full Reference](ref-main-js.md#physics)

---

## Player State Object

```javascript
const player = {
  position: new THREE.Vector3(),  // Where the car is (x, y, z)
  heading: 0,                     // Direction the car faces (radians)
  speed: 0,                       // Current speed (meters/second)
  trackT: 0,                      // Position along the track spline (0–1)
  lastTrackT: 0,                  // Previous frame's track position
  collisionTimer: 0,              // Cooldown for collision messages
};
```

> **Reference:** [main.js lines 866–873](../main.js)

The car is simulated as a **point** with a heading and speed — not a rigid body. This keeps the physics simple but effective.

---

## Game State Object

```javascript
const race = {
  phase: "menu",         // "menu" | "countdown" | "running" | "finished"
  countdown: 3.8,        // Seconds remaining in countdown
  elapsed: 0,            // Total driving time
  flashText: "",          // Big on-screen message text
  flashTimer: 0,          // How long to show the message
};
```

> **Reference:** [main.js lines 875–881](../main.js)

The `phase` field controls the entire game flow:
- `"menu"` → main menu visible, no updates
- `"countdown"` → 3-2-1-GO countdown, car frozen
- `"running"` → player can drive, physics active
- `"finished"` → (not used in free drive mode, but the structure supports it)

---

## Keyboard Input

```javascript
const keys = new Set();

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"]
      .includes(event.code)) {
    event.preventDefault();
  }
  keys.add(event.code);
  if (event.code === "Enter" && race.phase === "finished") restartRace();
  if (event.code === "KeyR") restartRace();
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});
```

> **Reference:** [main.js lines 900–915](../main.js)

### Why Use a `Set`? — **IS vanilla JS**

A `Set` stores unique values. Using `keys.add()` on keydown and `keys.delete()` on keyup, we always know exactly which keys are **currently held down**.

This is better than using a boolean for each key because:
- You can check any key with `keys.has("KeyW")`
- Multiple simultaneous keys work automatically (e.g., accelerate + steer)
- Adding/removing is O(1) — instant

### `event.code` vs `event.key` — **Both are vanilla JS**

- `event.code` = the **physical key** pressed: `"ArrowUp"`, `"KeyW"`, `"Space"`
- `event.key` = the **character** produced: `"w"`, `"W"`, `" "`

We use `event.code` because it works regardless of keyboard layout (QWERTY, AZERTY, etc.) or whether Caps Lock is on.

### `event.preventDefault()` — **IS vanilla JS**

Stops the browser's default behavior for that key. Without it, arrow keys would scroll the page while you're trying to drive!

### Reading Input in the Physics Loop

```javascript
const accel = keys.has("ArrowUp") || keys.has("KeyW");
const brake = keys.has("ArrowDown") || keys.has("KeyS");
const turnL = keys.has("ArrowLeft") || keys.has("KeyA");
const turnR = keys.has("ArrowRight") || keys.has("KeyD");
const handbrake = keys.has("Space");
```

> **Reference:** [main.js lines 960–964](../main.js)

Each input is `true`/`false`. Both arrow keys and WASD are supported.

---

## The Physics Model

### Force Diagram

```
                    Speed
                      ↑
Engine Force ────────→│+
                      │
Aero Drag ───────────→│-   (grows with speed²)
Rolling Resistance ──→│-   (constant)
Braking ─────────────→│-   (strong deceleration)
Handbrake ───────────→│-   (locks rear wheels)
Off-track penalty ───→│×   (extra drag + reduced engine power)
```

### Track Proximity — Am I On the Road?

```javascript
const nearest = getClosestSplineData(player.position, player.trackT, 0.15);
player.trackT = nearest.t;

const tangXZ = new THREE.Vector3(nearest.tangent.x, 0, nearest.tangent.z).normalize();
const lateral = new THREE.Vector3(-tangXZ.z, 0, tangXZ.x);
const toPlayer = new THREE.Vector3(
  player.position.x - nearest.point.x, 0, player.position.z - nearest.point.z
);
const signedOffset = toPlayer.dot(lateral);
const onTrack = Math.abs(signedOffset) <= TRACK_WIDTH * 0.47;
```

> **Reference:** [main.js lines 967–987](../main.js)

**How `.dot()` works here:** The dot product of `toPlayer` and `lateral` gives the **signed distance** from the track centerline:
- Positive = car is on the right side
- Negative = car is on the left side
- `Math.abs(signedOffset) <= TRACK_WIDTH * 0.47` = within 47% of half the track width = on the road

### Aerodynamic Drag

```javascript
const aeroCoeff = 0.012;
const rollingResist = 1.8;
const totalDrag = onTrack
  ? (rollingResist + aeroCoeff * player.speed * player.speed)
  : (rollingResist * 3.5 + aeroCoeff * player.speed * player.speed);
```

> **Reference:** [main.js lines 991–996](../main.js)

Drag grows with **speed squared** — this is physically accurate. At low speed the drag is tiny; at high speed it's enormous. This creates a natural top-speed limit.

| Speed (m/s) | Speed (km/h) | Drag on track | Drag off track |
|---|---|---|---|
| 10 | 36 | 3.0 | 7.5 |
| 40 | 144 | 21.0 | 25.5 |
| 70 | 252 | 60.6 | 65.1 |

### Engine Torque Curve

```javascript
let engineForce = 0;
if (accel) {
  const absSpeed = Math.abs(player.speed);
  const speedRatio = absSpeed / maxSpeed;
  const lowEndRamp = Math.min(1, absSpeed / 5 + 0.3);
  const torqueCurve = (1 - Math.pow(speedRatio, 2)) * lowEndRamp;
  engineForce = 14 * torqueCurve;
  if (!onTrack) engineForce *= 0.4;  // Wheelspin on grass
}
```

> **Reference:** [main.js lines 1000–1010](../main.js)

**`Math.pow(x, n)` — IS vanilla JS.** Returns x raised to the power n. Here `speedRatio²`.

**`Math.min(a, b)` — IS vanilla JS.** Returns the smaller value.

This creates realistic power delivery:
- **Standstill:** `lowEndRamp = 0.3` → 30% power (simulates clutch engagement)
- **Low speed:** `lowEndRamp` rises to 1.0, `torqueCurve` ≈ 1.0 → full power
- **Near top speed:** `speedRatio² → 1`, so `torqueCurve → 0` → almost no power

### Braking

```javascript
if (brake) {
  if (player.speed > 1) {
    player.speed -= 28 * dt;      // Strong braking (ABS)
  } else if (player.speed > -10) {
    player.speed -= 6 * dt;       // Reverse gear (slow)
  }
}
```

> **Reference:** [main.js lines 1020–1028](../main.js)

If the car is moving forward (speed > 1), braking removes 28 m/s² (strong deceleration). If already stopped/slow, the same key acts as reverse gear at a gentler rate.

### Coasting (No Input)

```javascript
if (!accel && !brake) {
  if (player.speed > 0)
    player.speed = Math.max(0, player.speed - totalDrag * dt);
  else if (player.speed < 0)
    player.speed = Math.min(0, player.speed + totalDrag * dt * 2);
}
```

> **Reference:** [main.js lines 1031–1037](../main.js)

When no pedal is pressed, drag gradually slows the car. `Math.max(0, ...)` prevents the speed from going negative from drag alone (car shouldn't start rolling backwards from friction).

### `THREE.MathUtils.clamp(value, min, max)` — **Not vanilla JS**

```javascript
player.speed = THREE.MathUtils.clamp(player.speed, -10, maxSpeed);
```

> **Reference:** [main.js line 1044](../main.js)

Restricts a value to a range: if below `min`, returns `min`; if above `max`, returns `max`; otherwise returns `value` unchanged. Here it limits reverse speed to -10 m/s and forward speed to 75 m/s.

---

## Steering

```javascript
const steering = (turnR ? 1 : 0) - (turnL ? 1 : 0);  // -1, 0, or +1

if (steering !== 0) {
  const absSpeed = Math.abs(player.speed);
  let steerRate;

  if (absSpeed < 3) {
    steerRate = 1.2;    // Slow parking-speed steering
  } else {
    steerRate = 35 / Math.max(10, absSpeed);
    if (handbrake) steerRate *= 2.0;     // Drift mode
  }

  if (!onTrack && absSpeed > 3) steerRate *= 0.65;  // Less grip off-road

  const direction = player.speed >= 0 ? 1 : -0.8;
  player.heading += steering * steerRate * sensitivityMultiplier * dt * direction;
}
```

> **Reference:** [main.js lines 1049–1067](../main.js)

### Speed-Dependent Steering

`steerRate = 35 / speed` means:
- At 10 m/s (36 km/h): steerRate = 3.5 rad/s → **sharp turns**
- At 35 m/s (126 km/h): steerRate = 1.0 rad/s → moderate turns
- At 70 m/s (252 km/h): steerRate = 0.5 rad/s → **gentle curves only**

This simulates **understeer** — at high speed, the tires lose grip and the car can't turn as sharply.

### `player.heading +=` — Changing Direction

`heading` is in **radians**. Adding to it rotates the car. The formula multiplies several factors:
- `steering` — +1 (right) or -1 (left)
- `steerRate` — how fast the car can turn
- `sensitivityMultiplier` — user's sensitivity setting (0.6, 1.0, or 1.5)
- `dt` — delta time (frame-rate independent)
- `direction` — positive when going forward, negative (and gentler) when reversing

---

## Movement

```javascript
const fwdX = Math.cos(player.heading);
const fwdZ = Math.sin(player.heading);
player.position.x += fwdX * player.speed * dt;
player.position.z += fwdZ * player.speed * dt;
```

> **Reference:** [main.js lines 1070–1075](../main.js)

### `Math.cos` and `Math.sin` — **IS vanilla JS**

Given an angle, `cos` gives the X component and `sin` gives the Z component of a unit direction:

```
If heading = 0 (east):    cos(0) = 1, sin(0) = 0 → move right
If heading = π/2 (north): cos(π/2) = 0, sin(π/2) = 1 → move forward
If heading = π (west):    cos(π) = -1, sin(π) = 0 → move left
```

### Elevation Following

```javascript
player.position.y = THREE.MathUtils.lerp(
  player.position.y, nearest.point.y, 8 * dt
);
```

> **Reference:** [main.js lines 1078–1082](../main.js)

### `THREE.MathUtils.lerp(current, target, factor)` — **Not vanilla JS**

**Lerp = Linear Interpolation.** Smoothly blends between two values:

```javascript
lerp(a, b, 0)   → a        // No change
lerp(a, b, 1)   → b        // Jump to target
lerp(a, b, 0.1) → a + 0.1 * (b - a)  // Move 10% toward target
```

Here it smoothly adjusts the car's height to match the track elevation, preventing abrupt jumps on hills.

---

## Car Body Dynamics (Roll & Pitch)

```javascript
const targetRoll = -steering * Math.min(1, Math.abs(player.speed) / 30) * 0.12;
const targetPitch = accel ? -0.03 : (brake ? 0.06 : 0);

playerCar.rotation.y = Math.PI / 2 - player.heading;
playerCar.rotation.z = THREE.MathUtils.lerp(playerCar.rotation.z, targetRoll, 8 * dt);
playerCar.rotation.x = THREE.MathUtils.lerp(playerCar.rotation.x, targetPitch, 8 * dt);
```

> **Reference:** [main.js lines 1173–1179](../main.js)

- **Roll (Z rotation):** The car tilts sideways when turning. The amount depends on speed and steering input.
- **Pitch (X rotation):** The nose dips when braking, lifts when accelerating.
- **Heading (Y rotation):** Converts the heading angle to Three.js rotation.

The `Math.PI / 2 - player.heading` conversion is needed because Three.js Y rotation and the heading angle use different zero-directions.

---

## Reset Functions

```javascript
function resetPlayer() {
  const sp = trackCurve.getPointAt(0.001);
  const st = trackCurve.getTangentAt(0.001);
  player.position.set(sp.x, sp.y, sp.z);
  player.heading = Math.atan2(st.z, st.x);
  player.speed = 0;
  player.trackT = 0.001;
}
```

> **Reference:** [main.js lines 918–929](../main.js)

Places the car at the start of the track (t = 0.001, slightly past the start to avoid edge cases). The heading is set to match the track direction using `Math.atan2`.

---

## Phase 7 Checkpoint

At this point you should have:
- [x] Keyboard input working (arrow keys + WASD)
- [x] Realistic acceleration with torque curve
- [x] Aerodynamic drag that limits top speed
- [x] Speed-dependent steering with understeer at high speed
- [x] Handbrake for drifting
- [x] Off-track grip penalty
- [x] Car body roll and pitch

**Next:** [Phase 8 — Collision Detection →](phase-8-collisions.md)
