# Phase 11 — UI, HUD & Minimap

> **Goal:** Build the HTML/CSS overlay (main menu, speed/gear display, minimap), the game loop, and game state management.
> **What you'll learn:** HTML-over-canvas pattern, `pointer-events`, `backdrop-filter`, second renderer, Three.js layers, `THREE.Clock`, `setAnimationLoop`, game state machine.
> **Code reference:** [main.js lines 14–54, 89–104, 1244–1347](../main.js), [index.html](../index.html), [style.css](../style.css)

---

## The HTML-Over-Canvas Pattern

The 3D scene renders on a `<canvas>` element. The UI is regular HTML elements positioned **on top** of the canvas using CSS `position: fixed`.

```
┌─────────────────────────────────────┐
│  ┌─────────┐          ┌──────────┐  │ ← HTML overlay (pointer-events: none)
│  │  TITLE  │          │ MINIMAP  │  │
│  └─────────┘          └──────────┘  │
│                                     │
│       ╔═══════════════╗             │
│       ║  3D CANVAS    ║             │ ← WebGL canvas (behind everything)
│       ║  (the game)   ║             │
│       ╚═══════════════╝             │
│                                     │
│  ┌──────────┐ ┌────┐ ┌──────────┐  │
│  │ SPEED    │ │GEAR│ │ STATUS   │  │
│  └──────────┘ └────┘ └──────────┘  │
└─────────────────────────────────────┘
```

### How Clicks Work Through Layers

```css
#ui {
  position: fixed;
  inset: 0;               /* Cover entire viewport */
  pointer-events: none;   /* Clicks pass THROUGH to the canvas below */
}

#settings-btn {
  pointer-events: all;    /* BUT this specific button IS clickable */
}
```

> **Reference:** [style.css lines 37–41, 192](../style.css)

Without `pointer-events: none`, the UI overlay would capture all mouse clicks and the 3D canvas below would never receive them.

---

## DOM Element References

```javascript
const speedEl = document.querySelector("#speed");
const gearEl = document.querySelector("#gear");
const statusEl = document.querySelector("#status");
const messageEl = document.querySelector("#message");
// ... more elements
```

> **Reference:** [main.js lines 15–27](../main.js)

**`document.querySelector()` — IS vanilla JS.** Returns the first element matching a CSS selector. These references are stored once at startup so we don't search the DOM every frame.

---

## Settings Panel Events

```javascript
settingsBtn.addEventListener("click", () => {
  settingsOverlay.classList.toggle("hidden");
});

settingsClose.addEventListener("click", () => {
  settingsOverlay.classList.add("hidden");
});
```

> **Reference:** [main.js lines 30–38](../main.js)

**`classList.toggle()`, `.add()`, `.remove()` — IS vanilla JS.** Manipulates CSS classes:
- `.toggle("hidden")` → adds the class if absent, removes if present
- `.add("hidden")` → always adds the class
- `.remove("hidden")` → always removes the class

The `"hidden"` class in CSS has `display: none` (for the settings overlay) or `opacity: 0` (for the HUD), making elements appear/disappear.

### Sensitivity Buttons

```javascript
document.querySelectorAll(".sens-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sens-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    sensitivityMultiplier = parseFloat(btn.dataset.value);
  });
});
```

> **Reference:** [main.js lines 48–54](../main.js)

**`btn.dataset.value` — IS vanilla JS.** Reads the `data-value` HTML attribute. In the HTML: `<button data-value="0.6">Low</button>`. The `dataset` object converts `data-*` attributes to camelCase properties.

**`parseFloat()` — IS vanilla JS.** Converts a string to a floating-point number: `"0.6"` → `0.6`.

---

## Main Menu Flow

```javascript
btnPlay.addEventListener("click", () => {
  mainMenu.classList.add("hidden");     // Hide menu
  hud.classList.remove("hidden");        // Show HUD
  race.phase = "countdown";             // Start countdown
  race.countdown = 3.8;
  race.elapsed = 0;
});
```

> **Reference:** [main.js lines 41–47](../main.js)

---

## The Minimap

The minimap is a **second WebGL renderer** drawing the same scene from a top-down view.

```javascript
const minimapRenderer = new THREE.WebGLRenderer({
  canvas: minimapCanvas,    // Use the existing <canvas id="minimap">
  alpha: true,              // Transparent background
  antialias: true
});
minimapRenderer.setSize(220, 220);

const minimapCamera = new THREE.OrthographicCamera(-140, 140, 100, -180, 1, 1000);
minimapCamera.position.set(10, 300, -75);
minimapCamera.lookAt(10, 0, -75);
minimapCamera.layers.enable(1);
```

> **Reference:** [main.js lines 90–95](../main.js)

### Passing an Existing Canvas

Most tutorials create a renderer without specifying a canvas, then append it with `document.body.appendChild(renderer.domElement)`. Here, we pass the **existing** `<canvas id="minimap">` element so the minimap renders inside the HUD panel.

### `alpha: true`

Makes the canvas background transparent instead of black. This lets the dark HUD panel show through behind the minimap.

### Orthographic Camera for Minimap

```javascript
new THREE.OrthographicCamera(left, right, top, bottom, near, far);
//                           -140   140   100  -180    1    1000
```

**Not vanilla JS.** Unlike a perspective camera (things get smaller with distance), an orthographic camera shows everything at the **same scale** — perfect for a top-down map view.

The parameters define a rectangular viewing box in world units.

### Three.js Layers

```javascript
minimapCamera.layers.enable(1);  // Camera can see layers 0 AND 1
playerDot.layers.set(1);         // Dot is ONLY on layer 1
trackMesh.layers.enable(1);      // Track is on layers 0 AND 1
```

> **Reference:** [main.js lines 95, 103, 271](../main.js)

**`.layers.set(n)` — Not vanilla JS.** Puts the object on layer `n` ONLY (removes from all others).
**`.layers.enable(n)` — Not vanilla JS.** ADDS layer `n` while keeping existing layers.

| Object | Layer 0 (main camera) | Layer 1 (minimap camera) |
|---|---|---|
| Player dot | ✗ | ✓ (only visible on minimap) |
| Track mesh | ✓ | ✓ (visible on both) |
| Buildings | ✓ (main only) | ✗ |
| Kerbs | ✓ | ✓ |

### Player Dot

```javascript
const playerDot = new THREE.Mesh(
  new THREE.CircleGeometry(6, 16),
  new THREE.MeshBasicMaterial({ color: 0xff3333, depthTest: false })
);
playerDot.rotation.x = -Math.PI / 2;
playerDot.position.y = 50;
playerDot.layers.set(1);
scene.add(playerDot);
```

> **Reference:** [main.js lines 97–104](../main.js)

A red circle that tracks the player's position on the minimap. `depthTest: false` means it's always visible even if something is in front of it. `position.y = 50` places it high up so it's above the ground for the top-down camera.

---

## HUD Updates

```javascript
function updateHud() {
  const kmh = Math.round(Math.max(0, Math.abs(player.speed) * 3.6));
  speedEl.textContent = `${kmh} km/h`;

  // Gear display based on speed ranges
  if (player.speed < -0.5)       gearEl.textContent = "R";
  else if (Math.abs(player.speed) < 0.5) gearEl.textContent = "N";
  else if (kmh < 35)             gearEl.textContent = "1";
  else if (kmh < 70)             gearEl.textContent = "2";
  else if (kmh < 110)            gearEl.textContent = "3";
  else if (kmh < 160)            gearEl.textContent = "4";
  else if (kmh < 220)            gearEl.textContent = "5";
  else                           gearEl.textContent = "6";

  // Countdown message
  if (race.phase === "countdown") {
    const cd = race.countdown > 0.85 ? Math.ceil(race.countdown - 0.8) : "GO";
    messageEl.textContent = cd;
  } else if (race.flashTimer > 0) {
    messageEl.textContent = race.flashText;
  } else {
    messageEl.textContent = "";
  }
}
```

> **Reference:** [main.js lines 1245–1284](../main.js)

### `player.speed * 3.6` — m/s to km/h Conversion

**IS vanilla JS math.** 1 m/s = 3.6 km/h (because 1 km = 1000 m and 1 hour = 3600 seconds: 3600/1000 = 3.6).

### `Math.ceil()` — **IS vanilla JS**

Rounds up to the nearest integer. `Math.ceil(2.3) = 3`. Used for the countdown: `Math.ceil(countdown - 0.8)` converts the decimal timer into integers 3, 2, 1.

---

## The Game Loop

```javascript
const clock = new THREE.Clock();

function animate() {
  const dt = Math.min(clock.getDelta(), 0.035);

  if (race.phase === "countdown") {
    race.countdown -= dt;
    if (race.countdown <= 0) {
      race.phase = "running";
      setFlash("GO!", 0.8);
    }
  } else {
    if (race.phase === "running") {
      race.elapsed += dt;
      updatePlayer(dt);
    }
    updateRivals(dt);
  }

  if (race.flashTimer > 0) race.flashTimer -= dt;

  updateCamera(dt || 0.016);
  updateHud();

  playerDot.position.set(player.position.x, 50, player.position.z);

  composer.render();
  if (race.phase !== "menu") {
    minimapRenderer.render(scene, minimapCamera);
  }
}

renderer.setAnimationLoop(animate);
```

> **Reference:** [main.js lines 1311–1346](../main.js)

### `new THREE.Clock()` — **Not vanilla JS**

A timer utility that tracks time between frames.

### `clock.getDelta()` — **Not vanilla JS**

Returns the time (in seconds) since the last call to `getDelta()`. At 60 FPS, this is approximately `0.0167`. At 30 FPS, approximately `0.033`.

### `Math.min(clock.getDelta(), 0.035)` — **IS vanilla JS**

Caps the delta time at 35ms. Why? If you switch browser tabs and come back after 5 seconds, `getDelta()` would return `5.0` — the physics would calculate 5 seconds of movement in a single step, likely launching the car through barriers. Capping at 35ms prevents physics explosions.

### `renderer.setAnimationLoop(callback)` — **Not vanilla JS**

Three.js's version of `requestAnimationFrame`. It calls your function before each screen repaint (~60 FPS). Benefits over raw `requestAnimationFrame`:
- Automatically pauses when the browser tab is hidden
- Handles WebXR (VR) timing
- Simpler API (no need to re-call in the callback)

### Game State Machine

```
      ┌─────┐   click "PLAY"   ┌───────────┐   countdown = 0   ┌─────────┐
      │ MENU├──────────────────→│ COUNTDOWN ├──────────────────→│ RUNNING │
      └─────┘                   └───────────┘                   └────┬────┘
         ↑                                                           │
         │              press R (restart)                             │
         └───────────────────────────────────────────────────────────┘
```

---

## Phase 11 Checkpoint

At this point you should have:
- [x] Main menu with play button and settings
- [x] In-game HUD showing speed, gear, and status
- [x] Minimap with player dot and track outline
- [x] Settings panel for steering sensitivity
- [x] Complete game loop with state management
- [x] Countdown → GO! → Free Drive flow

**🎉 You've covered every system in the game! Check the reference docs for line-by-line details:**
- [ref-index-html.md](ref-index-html.md)
- [ref-main-js.md](ref-main-js.md)
- [ref-style-css.md](ref-style-css.md)
