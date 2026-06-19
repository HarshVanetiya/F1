# Phase 6 — Cars & 3D Model Loading

> **Goal:** Build a low-poly car from box primitives, then load a proper 3D model (GLTF) to replace it.
> **What you'll learn:** `THREE.Group` for composite objects, `GLTFLoader`, `.traverse()`, `.clone()`, auto-scaling, fallback pattern.
> **Code reference:** [main.js lines 707–863](../main.js) → [Full Reference](ref-main-js.md#cars)

---

## Building a Low-Poly Car from Primitives

```javascript
function createLowPolyCar(color) {
  const group = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color, roughness: 0.48, metalness: 0.2
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x15171c, roughness: 0.7
  });

  // Floor plate
  const floor = new THREE.Mesh(new THREE.BoxGeometry(2, 0.25, 4.4), mat);
  floor.position.y = 0.6;
  group.add(floor);

  // Main body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 2.2), mat);
  body.position.set(0, 1, -0.1);
  group.add(body);

  // ... nose, cockpit, rear wing, front wing

  // Wheels (4 cylinders)
  const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.45, 18);
  for (const x of [-1.08, 1.08]) {
    for (const z of [-1.4, 1.55]) {
      const wheel = new THREE.Mesh(wheelGeo, dark);
      wheel.rotation.z = Math.PI / 2;   // Rotate to roll on the ground
      wheel.position.set(x, 0.45, z);
      group.add(wheel);
    }
  }

  return group;
}
```

> **Reference:** [main.js lines 708–764](../main.js)

### Design Pattern: Composite Objects

The car is a `THREE.Group` containing ~10 meshes (body parts + 4 wheels). This means:
- Move/rotate the group → the entire car moves/rotates
- Each part is independently positioned relative to the group's origin

```
Group (car)
├── Floor plate (wide, flat box — the chassis)
├── Body (central body block)
├── Nose (forward-facing narrow box)
├── Cockpit (dark recessed area)
├── Rear wing (dark flat plate)
├── Front wing (dark flat plate)
├── Wheel (front-left)
├── Wheel (front-right)
├── Wheel (rear-left)
└── Wheel (rear-right)
```

### Shared Geometry

```javascript
const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.45, 18);
```

The geometry is created **once** and reused for all four wheels. This saves GPU memory — all wheels share the same shape data.

### `wheel.rotation.z = Math.PI / 2`

Cylinders are created vertically by default (standing up). Rotating 90° around the Z axis makes them lie sideways — the correct orientation for wheels.

---

## Player Car Setup

```javascript
const playerCar = new THREE.Group();
playerCar.rotation.order = "YXZ";
const fallbackCar = createLowPolyCar(0xff5a36);  // Orange
playerCar.add(fallbackCar);
scene.add(playerCar);
```

> **Reference:** [main.js lines 767–771](../main.js)

### `.rotation.order = "YXZ"`

**Not vanilla JS.** Three.js rotations are applied in a specific order (by default `"XYZ"` — rotate around X first, then Y, then Z). Changing to `"YXZ"` means:
1. First rotate around **Y** (heading/yaw — which direction the car faces)
2. Then **X** (pitch — nose up/down)
3. Then **Z** (roll — lean left/right)

This order is important for vehicles because pitch and roll should be **relative to the car's heading**, not to the world axes.

### Two-Level Group Nesting

```
playerCar (outer group) — holds position/rotation for physics
└── fallbackCar (inner group) — the visual model
    ├── floor
    ├── body
    └── ...wheels
```

Later, the GLTF model is also added to `playerCar`. The outer group handles positioning/rotation from physics, while the inner groups handle the visual appearance.

---

## Rival Cars

```javascript
const rivalTints = [0x3388ff, 0xffdd33, 0xeeeeee, 0xff6699, 0x44ddaa];

const rivals = Array.from({ length: NUM_RIVALS }, (_, i) => {
  const car = new THREE.Group();
  const fb = createLowPolyCar(rivalTints[i % rivalTints.length]);
  car.add(fb);
  scene.add(car);
  return {
    mesh: car,
    fallback: fb,
    tintColor: rivalTints[i % rivalTints.length],
    t: i * 0.18,                       // Starting position on track
    baseLaneOffset: -4 + (i % 3) * 4,  // Lane position (-4, 0, or 4)
    laneOffset: -4 + (i % 3) * 4,
    speed: 20 + i * 3,                 // Different speeds
  };
});
```

> **Reference:** [main.js lines 774–789](../main.js)

### `Array.from({ length: N }, callback)` — **IS vanilla JS**

Creates an array of N items, calling the callback for each. The `_` parameter (unused) would be `undefined` (since we're creating from a length, not from existing values), and `i` is the index.

### `i % rivalTints.length` — **IS vanilla JS**

The modulo operator cycles through the tint colors: `0, 1, 2, 3, 4, 0, 1, 2, ...` — so if there were more than 5 rivals, colors would repeat.

---

## Loading GLTF Models

### What is GLTF/GLB?

**GLTF** (GL Transmission Format) is the standard file format for 3D models on the web. Think of it as the "JPEG of 3D":
- Contains geometry, materials, textures, and animations in one package
- **GLB** is the binary version (single file, smaller, faster to load)
- The car model is `public/models/car.glb` (92 KB)

### The Loading Code

```javascript
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
loader.load(
  "models/car.glb",           // Path (relative to public/)

  (gltf) => {                 // SUCCESS callback
    const model = gltf.scene;

    // Auto-scale to fit the game
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const targetLen = 4.5;
    const maxDim = Math.max(size.x, size.y, size.z);
    const autoScale = targetLen / maxDim;

    // Player model
    const pm = model.clone();
    pm.scale.set(autoScale, autoScale, autoScale);
    pm.position.set(
      -center.x * autoScale,
      -center.y * autoScale + 0.45,
      -center.z * autoScale
    );
    pm.rotation.y = Math.PI;

    pm.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        if (c.material) {
          c.material.metalness = 0.7;
          c.material.roughness = 0.2;
        }
      }
    });

    fallbackCar.visible = false;
    playerCar.add(pm);

    // Clone for each rival with different colors...
  },

  undefined,            // Progress callback (not used)

  () => {               // ERROR callback
    fallbackCar.visible = true;
  }
);
```

> **Reference:** [main.js lines 792–863](../main.js)

### `GLTFLoader` — **Not vanilla JS**

A Three.js addon class for loading GLTF/GLB files. It's imported from `three/addons/loaders/GLTFLoader.js`.

### `loader.load(url, onSuccess, onProgress, onError)`

- **url:** Path to the file. Vite serves `public/` at the root, so `"models/car.glb"` resolves to `public/models/car.glb`
- **onSuccess:** Callback when the model is loaded. Receives a `gltf` object with `gltf.scene` (the model as a Three.js Group)
- **onProgress:** Optional progress callback (set to `undefined` here)
- **onError:** Callback if loading fails (shows the fallback box-car)

### `new THREE.Box3().setFromObject(model)` — Bounding Box

**Not vanilla JS.** `Box3` is an axis-aligned bounding box. `.setFromObject(model)` calculates the smallest box that contains the entire model.

```javascript
const box = new THREE.Box3().setFromObject(model);
const size = new THREE.Vector3();
box.getSize(size);     // size.x = width, size.y = height, size.z = depth
const center = new THREE.Vector3();
box.getCenter(center); // Center point of the box
```

### Auto-Scaling

```javascript
const targetLen = 4.5;                          // Desired car length
const maxDim = Math.max(size.x, size.y, size.z); // Actual largest dimension
const autoScale = targetLen / maxDim;            // Scale factor
pm.scale.set(autoScale, autoScale, autoScale);   // Apply uniformly
```

3D models come in all sizes. This code automatically scales any model so its longest side is 4.5 units — perfect for the game world.

### `.traverse(callback)` — **Not vanilla JS**

Walks through **every child** of an object recursively. `gltf.scene` might contain groups, which contain meshes, which contain sub-meshes. `.traverse()` visits them all:

```javascript
pm.traverse((child) => {
  if (child.isMesh) {          // Only process renderable meshes
    child.castShadow = true;
    child.material.metalness = 0.7;
  }
});
```

### `.isMesh` — **Not vanilla JS**

A boolean property. `true` if the object is a `THREE.Mesh`. Used to skip non-renderable objects (groups, lights, cameras) during traversal.

### `.clone()` — **Not vanilla JS**

Creates a **deep copy** of the model. Each rival needs its own independent model instance so they can have different colors and positions.

### Rival Color Tinting

```javascript
clone.traverse((c) => {
  if (c.isMesh) {
    c.material = c.material.clone();  // Clone material too!
    const lum = c.material.color.r * 0.299 +
                c.material.color.g * 0.587 +
                c.material.color.b * 0.114;
    if (lum > 0.12) {
      c.material.color.set(rival.tintColor);
    }
  }
});
```

> **Reference:** [main.js lines 839–857](../main.js)

**Why clone the material?** If you modify `c.material.color` without cloning, ALL clones share the same material object — changing one changes all of them.

**Luminance check:** `0.299R + 0.587G + 0.114B` is the standard formula for perceived brightness. The code only recolors **bright parts** of the model (body paint, not dark parts like tires or cockpit). Parts darker than `lum = 0.12` keep their original color.

### `.visible = false` — **Not vanilla JS**

```javascript
fallbackCar.visible = false;  // Hide the box-car
```

Sets an object to invisible. It's still in the scene but not rendered. Used here to hide the fallback box-car once the GLTF model loads successfully.

---

## The Fallback Pattern

```
1. Create simple box-car → show immediately
2. Start loading GLTF (takes time)
3a. GLTF loads? → hide box-car, show GLTF model
3b. GLTF fails? → keep box-car visible
```

This pattern ensures the game is **always playable**, even if the 3D model file is missing or fails to load.

---

## Phase 6 Checkpoint

At this point you should have:
- [x] A low-poly car built from box/cylinder primitives
- [x] A GLTF car model loaded and auto-scaled
- [x] 5 rival cars with different colors
- [x] Fallback box-car in case model loading fails
- [x] Understanding of `.traverse()`, `.clone()`, `.visible`, `GLTFLoader`

**Next:** [Phase 7 — Input & Player Physics →](phase-7-physics-and-input.md)
