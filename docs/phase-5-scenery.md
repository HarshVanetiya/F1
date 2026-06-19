# Phase 5 — Scenery: Buildings, Trees, Grandstands

> **Goal:** Populate the world with buildings (that have collision), trees, and grandstands.
> **What you'll learn:** Reusable scene-building functions, `THREE.Group`, `CylinderGeometry`, `ConeGeometry`, object colliders.
> **Code reference:** [main.js lines 580–705](../main.js) → [Full Reference](ref-main-js.md#scenery)

---

## Buildings with Collision

```javascript
const buildingColliders = [];  // Array to store collision boxes

function addBuilding(x, y, z, w, h, d, color) {
  const bld = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.82 })
  );
  bld.position.set(x, y + h / 2, z);   // Center vertically (box origin is center)
  bld.castShadow = true;
  bld.receiveShadow = true;
  scene.add(bld);

  // Register for collision
  buildingColliders.push({ cx: x, cz: z, halfW: w / 2 + 0.5, halfD: d / 2 + 0.5 });
}
```

> **Reference:** [main.js lines 581–594](../main.js)

### Why `y + h / 2`?

`BoxGeometry` places its origin at the **center** of the box. If a building is 22 units tall and we want its base at ground level (y=0), we position it at y = 0 + 22/2 = 11. The bottom of the box is then at y = 11 - 11 = 0.

### Collision Data

```javascript
buildingColliders.push({
  cx: x,               // Center X
  cz: z,               // Center Z
  halfW: w / 2 + 0.5,  // Half-width (with 0.5 unit padding)
  halfD: d / 2 + 0.5   // Half-depth (with 0.5 unit padding)
});
```

Each building stores an **Axis-Aligned Bounding Box (AABB)** for collision detection. The `+ 0.5` padding prevents the car from clipping into building surfaces.

### Placing Buildings

```javascript
// East side
addBuilding(130, 0, -30, 16, 22, 16, 0xd4c49a);
addBuilding(135, 0, -70, 14, 28, 14, 0xc9b88c);
// South side
addBuilding(60, 0, -180, 22, 16, 20, 0xf5e6c8);
// ... more buildings around the circuit
```

> **Reference:** [main.js lines 597–614](../main.js)

All buildings are placed **30+ units from the track center** to avoid interfering with driving. Colors use warm Mediterranean tones (`0xd4c49a`, `0xc9b88c`, etc.) to match the Monaco theme.

### `{ color, roughness: 0.82 }` — **IS vanilla JS (ES6 shorthand)**

When a property name matches the variable name, you can write `{ color }` instead of `{ color: color }`. This is called **shorthand property notation**.

---

## Palm Trees

```javascript
function addPalmTree(x, y, z) {
  // Trunk — a cylinder
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.5, 6, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b6914 })
  );
  trunk.position.set(x, y + 3, z);
  trunk.castShadow = true;
  scene.add(trunk);

  // Fronds — a squashed sphere
  const fronds = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0x228b22 })
  );
  fronds.position.set(x, y + 6.5, z);
  fronds.scale.y = 0.45;   // Squash vertically
  fronds.castShadow = true;
  scene.add(fronds);
}
```

> **Reference:** [main.js lines 617–634](../main.js)

### `new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments)`

**Not vanilla JS.** Creates a cylinder (or cone if the radii differ):
- `radiusTop: 0.3` — thin at the top
- `radiusBottom: 0.5` — wider at the base (trunk tapers upward)
- `height: 6` — 6 units tall
- `segments: 8` — 8-sided (low-poly look)

### `.scale.y = 0.45`

**Not vanilla JS.** Every Three.js object has a `.scale` property (`Vector3`). Setting `scale.y = 0.45` squashes the sphere to 45% of its height, making it look like a wide, flat canopy of leaves instead of a perfect sphere.

### Positioning Trees

```javascript
const treePositions = [
  [-30, 0, 30],   // North side
  [20, 0, 32],
  // ... more positions
];
treePositions.forEach(([x, y, z]) => addPalmTree(x, y, z));
```

**`([x, y, z]) =>` — IS vanilla JS.** This is **destructuring** in a callback. Each array `[x, y, z]` is unpacked into three separate variables.

---

## Conifer Trees

```javascript
function addConiferTree(x, y, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.6, 3.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x6b4127 })
  );
  trunk.position.set(x, y + 1.7, z);
  scene.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(2.5, 5.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x2d6d33 })
  );
  crown.position.set(x, y + 5.5, z);
  scene.add(crown);
}
```

> **Reference:** [main.js lines 657–682](../main.js)

### `new THREE.ConeGeometry(radius, height, segments)`

**Not vanilla JS.** Creates a cone shape — perfect for conifer tree crowns. `radius` is the base circle, `height` is the tip-to-base distance.

---

## Grandstands

```javascript
function addGrandstand(x, y, z, rotY, width, color) {
  const stand = new THREE.Group();

  for (let row = 0; row < 4; row++) {
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(width - row * 3, 1.4, 4),
      new THREE.MeshStandardMaterial({ color })
    );
    block.position.y = 0.7 + row * 1.2;
    block.position.z = -row * 2.2;
    block.castShadow = true;
    block.receiveShadow = true;
    stand.add(block);   // Add to the GROUP, not the scene
  }

  stand.position.set(x, y, z);
  stand.rotation.y = rotY;
  scene.add(stand);     // Add the GROUP to the scene
}
```

> **Reference:** [main.js lines 685–705](../main.js)

### `new THREE.Group()`

**Not vanilla JS.** A Group is an invisible container that holds multiple meshes. When you move/rotate the group, all children move/rotate together.

```
Group (grandstand)
├── Block (row 0) — wide, at ground level
├── Block (row 1) — slightly narrower, higher up, further back
├── Block (row 2) — even narrower, even higher
└── Block (row 3) — smallest, highest, furthest back
```

**Why use a Group?**
1. Move all pieces by positioning just the group
2. Rotate the entire grandstand to face the track
3. Keeps code organized

### Stair-step Effect

Each row gets:
- **Narrower:** `width - row * 3` (row 0 is widest)
- **Higher:** `0.7 + row * 1.2` (each row 1.2 units above the last)
- **Further back:** `-row * 2.2` (offset in Z to create the stair-step seating)

---

## Phase 5 Checkpoint

At this point you should have:
- [x] Buildings around the circuit with collision boxes
- [x] Palm trees along the waterfront and track edges
- [x] Conifer trees on the inland/elevated areas
- [x] Grandstands facing the track at key viewing points
- [x] A fully populated Monaco-like environment

**Next:** [Phase 6 — Cars & 3D Model Loading →](phase-6-cars-and-models.md)
