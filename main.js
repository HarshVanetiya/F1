import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// ─── Constants ─────────────────────────────────────────
const TRACK_WIDTH = 22;
const NUM_RIVALS = 5;

// ─── Settings ──────────────────────────────────────────
let sensitivityMultiplier = 1.0;

// ─── DOM Elements ──────────────────────────────────────
const speedEl = document.querySelector("#speed");
const gearEl = document.querySelector("#gear");
const statusEl = document.querySelector("#status");
const messageEl = document.querySelector("#message");
const hintEl = document.querySelector("#hint");
const settingsBtn = document.querySelector("#settings-btn");
const settingsOverlay = document.querySelector("#settings-overlay");
const settingsClose = document.querySelector("#settings-close");
const mainMenu = document.querySelector("#main-menu");
const btnPlay = document.querySelector("#btn-play");
const btnMenuSettings = document.querySelector("#btn-menu-settings");
const hud = document.querySelector("#hud");
const minimapCanvas = document.querySelector("#minimap");

// ─── Settings Panel ────────────────────────────────────
settingsBtn.addEventListener("click", () => {
  settingsOverlay.classList.toggle("hidden");
});
btnMenuSettings.addEventListener("click", () => {
  settingsOverlay.classList.toggle("hidden");
});
settingsClose.addEventListener("click", () => {
  settingsOverlay.classList.add("hidden");
});

// ─── Main Menu ─────────────────────────────────────────
btnPlay.addEventListener("click", () => {
  mainMenu.classList.add("hidden");
  hud.classList.remove("hidden");
  race.phase = "countdown";
  race.countdown = 3.8;
  race.elapsed = 0;
});
document.querySelectorAll(".sens-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sens-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    sensitivityMultiplier = parseFloat(btn.dataset.value);
  });
});

// ─── Scene ─────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 160, 520);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

// ─── Post-Processing ───────────────────────────────────
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2,  // strength
  0.4,  // radius
  0.85  // threshold
);
composer.addPass(bloomPass);

// ─── Minimap ───────────────────────────────────────────
const minimapRenderer = new THREE.WebGLRenderer({ canvas: minimapCanvas, alpha: true, antialias: true });
minimapRenderer.setSize(220, 220);
const minimapCamera = new THREE.OrthographicCamera(-140, 140, 100, -180, 1, 1000);
minimapCamera.position.set(10, 300, -75);
minimapCamera.lookAt(10, 0, -75);
minimapCamera.layers.enable(1); // See minimap specific objects

const playerDot = new THREE.Mesh(
  new THREE.CircleGeometry(6, 16),
  new THREE.MeshBasicMaterial({ color: 0xff3333, depthTest: false })
);
playerDot.rotation.x = -Math.PI / 2;
playerDot.position.y = 50;
playerDot.layers.set(1);
scene.add(playerDot);

// ─── Lighting ──────────────────────────────────────────
const hemiLight = new THREE.HemisphereLight(0xaaccff, 0x3c5a38, 1.2);
scene.add(hemiLight);

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

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(16, 24, 24),
  new THREE.MeshBasicMaterial({ color: 0xfff0b5 }),
);
sunGlow.position.set(-120, 150, -180);
scene.add(sunGlow);

// ─── Track Circuit Definition (Clean Racing Circuit) ───
// Designed with wide spacing so no track section overlaps another.
// The circuit is roughly 500m, flowing clockwise.
const trackControlPoints = [
  // Start/Finish straight (heading east)
  new THREE.Vector3(-80, 0, 0),
  new THREE.Vector3(-40, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(40, 0, 0),
  // Turn 1 — wide sweeping right
  new THREE.Vector3(70, 0, -8),
  new THREE.Vector3(90, 0, -25),
  new THREE.Vector3(100, 0, -50),
  // Back straight (heading south)
  new THREE.Vector3(100, 1, -80),
  new THREE.Vector3(95, 2, -110),
  // Turn 2 — long right-hander
  new THREE.Vector3(82, 2, -135),
  new THREE.Vector3(60, 2, -148),
  new THREE.Vector3(35, 2, -150),
  // Hairpin (wide U-turn)
  new THREE.Vector3(10, 2, -145),
  new THREE.Vector3(-8, 2, -130),
  new THREE.Vector3(-12, 2, -110),
  new THREE.Vector3(-5, 1, -90),
  // Esses section
  new THREE.Vector3(10, 1, -72),
  new THREE.Vector3(25, 0, -55),
  new THREE.Vector3(15, 0, -38),
  new THREE.Vector3(0, 0, -28),
  // Sweeping left back towards start
  new THREE.Vector3(-25, 0, -25),
  new THREE.Vector3(-50, 0, -30),
  new THREE.Vector3(-70, 0, -25),
  // Final corner
  new THREE.Vector3(-85, 0, -15),
  new THREE.Vector3(-90, 0, -5),
];

const trackCurve = new THREE.CatmullRomCurve3(
  trackControlPoints,
  true,
  "catmullrom",
  0.5,
);
const trackLength = trackCurve.getLength();

// ─── Spline Cache ──────────────────────────────────────
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

function getClosestSplineData(pos, lastT, windowSize) {
  const win = windowSize || 0.15;
  let minDist = Infinity;
  let bestIdx = 0;
  let found = false;

  for (let i = 0; i < splineCache.length; i++) {
    let tDiff = Math.abs(splineCache[i].t - lastT);
    if (tDiff > 0.5) tDiff = 1 - tDiff;
    if (tDiff > win) continue;
    const dx = pos.x - splineCache[i].point.x;
    const dz = pos.z - splineCache[i].point.z;
    const d = dx * dx + dz * dz;
    if (d < minDist) {
      minDist = d;
      bestIdx = i;
      found = true;
    }
  }

  if (!found) {
    for (let i = 0; i < splineCache.length; i++) {
      const dx = pos.x - splineCache[i].point.x;
      const dz = pos.z - splineCache[i].point.z;
      const d = dx * dx + dz * dz;
      if (d < minDist) {
        minDist = d;
        bestIdx = i;
      }
    }
  }

  return {
    t: splineCache[bestIdx].t,
    point: splineCache[bestIdx].point,
    tangent: splineCache[bestIdx].tangent,
    distance: Math.sqrt(minDist),
  };
}

// ─── Track Mesh Builder ────────────────────────────────
function buildTrackGeometry(curve, width, segments) {
  const vertices = [];
  const normals = [];
  const indices = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const tangXZ = new THREE.Vector3(tangent.x, 0, tangent.z).normalize();
    const lat = new THREE.Vector3(-tangXZ.z, 0, tangXZ.x);

    const left = point.clone().add(lat.clone().multiplyScalar(width / 2));
    const right = point.clone().add(lat.clone().multiplyScalar(-width / 2));

    vertices.push(left.x, left.y + 0.02, left.z);
    vertices.push(right.x, right.y + 0.02, right.z);
    normals.push(0, 1, 0, 0, 1, 0);

    if (i < segments) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = (i + 1) * 2;
      const d = (i + 1) * 2 + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  return geo;
}

// ─── Build Track Surface ───────────────────────────────
const trackMesh = new THREE.Mesh(
  buildTrackGeometry(trackCurve, TRACK_WIDTH, 600),
  new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.85, metalness: 0.1 }),
);
trackMesh.receiveShadow = true;
trackMesh.layers.enable(1);
scene.add(trackMesh);

// ─── Ground & Sea ──────────────────────────────────
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(600, 600),
  new THREE.MeshStandardMaterial({ color: 0x2f7d3c, roughness: 1 }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
ground.receiveShadow = true;
scene.add(ground);

const sea = new THREE.Mesh(
  new THREE.PlaneGeometry(600, 200),
  new THREE.MeshStandardMaterial({
    color: 0x1a7b9e,
    roughness: 0.25,
    metalness: 0.15,
    transparent: true,
    opacity: 0.92,
  }),
);
sea.rotation.x = -Math.PI / 2;
sea.position.set(0, -0.15, 120);
scene.add(sea);

const racingLine = new THREE.Mesh(
  buildTrackGeometry(trackCurve, 1.5, 400),
  new THREE.MeshStandardMaterial({
    color: 0x565f6e,
    roughness: 0.7,
    transparent: true,
    opacity: 0.4,
  }),
);
racingLine.position.y = 0.01;
racingLine.layers.enable(1);
scene.add(racingLine);

// ─── Continuous Kerbs & Barriers ─────────────────────────
// Store barrier positions for collision detection
const barrierColliders = []; // {point, normal, side}

function buildTrackEdgeAssets(curve, width, segments) {
  const kerbWidth = 1.2;
  const barrierOffset = 1.6; // From track edge
  
  const kerbVerts = [];
  const kerbNormals = [];
  const barrierVerts = [];
  const barrierNormals = [];
  
  const kerbIndicesRed = [];
  const kerbIndicesWhite = [];
  const barrierIndices = [];

  for (let i = 0; i < segments; i++) {
    const t1 = i / segments;
    const t2 = (i + 1) / segments;
    
    const p1 = curve.getPointAt(t1);
    const p2 = curve.getPointAt(t2);
    
    const tang1 = curve.getTangentAt(t1);
    const tang2 = curve.getTangentAt(t2);
    
    const tXZ1 = new THREE.Vector3(tang1.x, 0, tang1.z).normalize();
    const lat1 = new THREE.Vector3(-tXZ1.z, 0, tXZ1.x);
    const tXZ2 = new THREE.Vector3(tang2.x, 0, tang2.z).normalize();
    const lat2 = new THREE.Vector3(-tXZ2.z, 0, tXZ2.x);
    
    for (const s of [-1, 1]) {
      // -- KERBS --
      const isRed = (i % 8) < 4;
      const kInner1 = p1.clone().add(lat1.clone().multiplyScalar(s * width / 2));
      const kOuter1 = kInner1.clone().add(lat1.clone().multiplyScalar(s * kerbWidth));
      const kInner2 = p2.clone().add(lat2.clone().multiplyScalar(s * width / 2));
      const kOuter2 = kInner2.clone().add(lat2.clone().multiplyScalar(s * kerbWidth));
      
      const vOffset = kerbVerts.length / 3;
      kerbVerts.push(
        kInner1.x, kInner1.y + 0.05, kInner1.z,
        kOuter1.x, kOuter1.y + 0.15, kOuter1.z,
        kInner2.x, kInner2.y + 0.05, kInner2.z,
        kOuter2.x, kOuter2.y + 0.15, kOuter2.z
      );
      kerbNormals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
      
      const a = vOffset, b = vOffset + 1, c = vOffset + 2, d = vOffset + 3;
      if (s === -1) {
        if (isRed) kerbIndicesRed.push(a, b, c, b, d, c);
        else kerbIndicesWhite.push(a, b, c, b, d, c);
      } else {
        if (isRed) kerbIndicesRed.push(a, c, b, b, c, d);
        else kerbIndicesWhite.push(a, c, b, b, c, d);
      }
      
      // -- BARRIERS (ARMCO) --
      const bOuter1 = p1.clone().add(lat1.clone().multiplyScalar(s * (width / 2 + barrierOffset)));
      const bOuter2 = p2.clone().add(lat2.clone().multiplyScalar(s * (width / 2 + barrierOffset)));
      
      const bVOffset = barrierVerts.length / 3;
      const h = 2.0;
      barrierVerts.push(
        bOuter1.x, bOuter1.y, bOuter1.z,
        bOuter1.x, bOuter1.y + h, bOuter1.z,
        bOuter2.x, bOuter2.y, bOuter2.z,
        bOuter2.x, bOuter2.y + h, bOuter2.z
      );
      barrierNormals.push(
        -s*lat1.x, 0, -s*lat1.z,
        -s*lat1.x, 0, -s*lat1.z,
        -s*lat2.x, 0, -s*lat2.z,
        -s*lat2.x, 0, -s*lat2.z
      );
      if (s === -1) {
        barrierIndices.push(bVOffset, bVOffset+1, bVOffset+2, bVOffset+1, bVOffset+3, bVOffset+2);
      } else {
        barrierIndices.push(bVOffset, bVOffset+2, bVOffset+1, bVOffset+1, bVOffset+2, bVOffset+3);
      }
      
      // Top cap thickness
      const bThick1 = bOuter1.clone().add(lat1.clone().multiplyScalar(s * 0.4));
      const bThick2 = bOuter2.clone().add(lat2.clone().multiplyScalar(s * 0.4));
      const capVOffset = barrierVerts.length / 3;
      barrierVerts.push(
        bOuter1.x, bOuter1.y + h, bOuter1.z,
        bThick1.x, bThick1.y + h, bThick1.z,
        bOuter2.x, bOuter2.y + h, bOuter2.z,
        bThick2.x, bThick2.y + h, bThick2.z
      );
      barrierNormals.push(0,1,0, 0,1,0, 0,1,0, 0,1,0);
      if (s === -1) {
        barrierIndices.push(capVOffset, capVOffset+2, capVOffset+1, capVOffset+1, capVOffset+2, capVOffset+3);
      } else {
        barrierIndices.push(capVOffset, capVOffset+1, capVOffset+2, capVOffset+1, capVOffset+3, capVOffset+2);
      }
    }
  }

  const kerbGeo = new THREE.BufferGeometry();
  kerbGeo.setAttribute('position', new THREE.Float32BufferAttribute(kerbVerts, 3));
  kerbGeo.setAttribute('normal', new THREE.Float32BufferAttribute(kerbNormals, 3));
  const allKerbIndices = [...kerbIndicesRed, ...kerbIndicesWhite];
  kerbGeo.setIndex(allKerbIndices);
  kerbGeo.addGroup(0, kerbIndicesRed.length, 0);
  kerbGeo.addGroup(kerbIndicesRed.length, kerbIndicesWhite.length, 1);
  
  const barrierGeo = new THREE.BufferGeometry();
  barrierGeo.setAttribute('position', new THREE.Float32BufferAttribute(barrierVerts, 3));
  barrierGeo.setAttribute('normal', new THREE.Float32BufferAttribute(barrierNormals, 3));
  barrierGeo.setIndex(barrierIndices);
  
  // Build barrier colliders for physics
  // Only add colliders that won't conflict with other track sections
  const colliderStep = Math.max(1, Math.floor(segments / 200));
  for (let i = 0; i < segments; i += colliderStep) {
    const t = i / segments;
    const pt = curve.getPointAt(t);
    const tang = curve.getTangentAt(t);
    const tXZ = new THREE.Vector3(tang.x, 0, tang.z).normalize();
    const lat = new THREE.Vector3(-tXZ.z, 0, tXZ.x);
    for (const s of [-1, 1]) {
      const bPos = pt.clone().add(lat.clone().multiplyScalar(s * (width / 2 + barrierOffset)));

      // Check: is this barrier point too close to a DIFFERENT part of the track?
      let tooClose = false;
      for (let j = 0; j < splineCache.length; j++) {
        let tDiff = Math.abs(splineCache[j].t - t);
        if (tDiff > 0.5) tDiff = 1 - tDiff;
        if (tDiff < 0.08) continue; // Skip nearby same-section points
        const dx = bPos.x - splineCache[j].point.x;
        const dz = bPos.z - splineCache[j].point.z;
        if (dx * dx + dz * dz < (width * 0.8) * (width * 0.8)) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      barrierColliders.push({
        point: new THREE.Vector2(bPos.x, bPos.z),
        normal: new THREE.Vector2(lat.x * -s, lat.z * -s),
      });
    }
  }

  return { kerbGeo, barrierGeo };
}

const edges = buildTrackEdgeAssets(trackCurve, TRACK_WIDTH, 800);

const kerbMesh = new THREE.Mesh(edges.kerbGeo, [
  new THREE.MeshStandardMaterial({ color: 0xd94735, roughness: 0.8 }),
  new THREE.MeshStandardMaterial({ color: 0xf7f4ed, roughness: 0.8 })
]);
kerbMesh.receiveShadow = true;
kerbMesh.layers.enable(1);
scene.add(kerbMesh);

const barrierMesh = new THREE.Mesh(edges.barrierGeo, new THREE.MeshStandardMaterial({ color: 0xd0d5dd, metalness: 0.7, roughness: 0.35 }));
barrierMesh.receiveShadow = true;
barrierMesh.castShadow = true;
barrierMesh.layers.enable(1);
scene.add(barrierMesh);

// ─── Start / Finish Line ───────────────────────────────
{
  const sp = trackCurve.getPointAt(0);
  const st = trackCurve.getTangentAt(0);
  const heading = Math.atan2(st.z, st.x);
  const txz = new THREE.Vector3(st.x, 0, st.z).normalize();
  const lat = new THREE.Vector3(-txz.z, 0, txz.x);

  const startLine = new THREE.Mesh(
    new THREE.PlaneGeometry(TRACK_WIDTH, 3.5),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
  );
  startLine.rotation.x = -Math.PI / 2;
  startLine.rotation.z = -heading;
  startLine.position.set(sp.x, sp.y + 0.04, sp.z);
  scene.add(startLine);

  for (let j = -4; j <= 4; j++) {
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.8),
      new THREE.MeshStandardMaterial({
        color: j % 2 === 0 ? 0x111111 : 0xffffff,
      }),
    );
    stripe.rotation.x = -Math.PI / 2;
    stripe.rotation.z = -heading;
    const off = lat.clone().multiplyScalar(j * 0.55);
    stripe.position.set(sp.x + off.x, sp.y + 0.05, sp.z + off.z);
    scene.add(stripe);
  }

  // Start gantry
  const gMat = new THREE.MeshStandardMaterial({
    color: 0x20252e,
    metalness: 0.35,
    roughness: 0.5,
  });
  for (const s of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 1), gMat);
    const pOff = lat.clone().multiplyScalar(s * (TRACK_WIDTH / 2 + 1.5));
    pole.position.set(sp.x + pOff.x, sp.y + 5, sp.z + pOff.z);
    pole.castShadow = true;
    scene.add(pole);
  }
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1, TRACK_WIDTH + 4),
    gMat,
  );
  beam.position.set(sp.x, sp.y + 10, sp.z);
  beam.rotation.y = -heading;
  beam.castShadow = true;
  scene.add(beam);
}

// ─── GTA-Style Checkpoints Removed ──────────────────────

// ─── Tunnel Section ────────────────────────────────
{
  const tunnelStartT = 0.28;
  const tunnelEndT = 0.35;
  const tunnelFrames = 10;
  const tMat = new THREE.MeshStandardMaterial({
    color: 0x454545,
    roughness: 0.9,
  });

  for (let i = 0; i < tunnelFrames; i++) {
    const t =
      tunnelStartT + (i / (tunnelFrames - 1)) * (tunnelEndT - tunnelStartT);
    const pt = trackCurve.getPointAt(t);
    const tn = trackCurve.getTangentAt(t);
    const heading = Math.atan2(tn.z, tn.x);
    const txz = new THREE.Vector3(tn.x, 0, tn.z).normalize();
    const lat = new THREE.Vector3(-txz.z, 0, txz.x);

    for (const s of [-1, 1]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(1, 8, 2.5), tMat);
      const wPos = pt
        .clone()
        .add(lat.clone().multiplyScalar(s * (TRACK_WIDTH / 2 + 1)));
      wall.position.set(wPos.x, pt.y + 4, wPos.z);
      wall.rotation.y = -heading + Math.PI / 2;
      wall.castShadow = true;
      scene.add(wall);
    }

    const ceil = new THREE.Mesh(
      new THREE.BoxGeometry(TRACK_WIDTH + 3, 1, 2.5),
      tMat,
    );
    ceil.position.set(pt.x, pt.y + 8, pt.z);
    ceil.rotation.y = -heading + Math.PI / 2;
    ceil.castShadow = true;
    ceil.receiveShadow = true;
    scene.add(ceil);
  }
}

// ─── Scenery: Buildings ────────────────────────────────
const buildingColliders = []; // {cx, cz, halfW, halfD}

function addBuilding(x, y, z, w, h, d, color) {
  const bld = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.82 }),
  );
  bld.position.set(x, y + h / 2, z);
  bld.castShadow = true;
  bld.receiveShadow = true;
  scene.add(bld);
  // Register for collision (small padding only)
  buildingColliders.push({ cx: x, cz: z, halfW: w / 2 + 0.5, halfD: d / 2 + 0.5 });
}

// Buildings placed well outside the track boundary (30+ units from track center)
// East side
addBuilding(130, 0, -30, 16, 22, 16, 0xd4c49a);
addBuilding(135, 0, -70, 14, 28, 14, 0xc9b88c);
addBuilding(128, 0, -110, 14, 20, 15, 0xe0d5b5);

// South side
addBuilding(60, 0, -180, 22, 16, 20, 0xf5e6c8);
addBuilding(20, 0, -178, 16, 14, 16, 0xc4b09a);
addBuilding(-20, 0, -175, 14, 18, 14, 0xd9cbb0);

// West side
addBuilding(-115, 0, -50, 16, 14, 14, 0xc4b09a);
addBuilding(-120, 0, -15, 14, 18, 14, 0xd9cbb0);

// North side (waterfront)
addBuilding(-60, 0, 35, 18, 10, 14, 0xcec2af);
addBuilding(0, 0, 38, 14, 13, 12, 0xd4c49a);
addBuilding(50, 0, 30, 16, 11, 14, 0xbfb39e);

// ─── Scenery: Palm Trees ──────────────────────────────
function addPalmTree(x, y, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.5, 6, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b6914 }),
  );
  trunk.position.set(x, y + 3, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const fronds = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0x228b22 }),
  );
  fronds.position.set(x, y + 6.5, z);
  fronds.scale.y = 0.45;
  fronds.castShadow = true;
  scene.add(fronds);
}

const treePositions = [
  // North side (along waterfront)
  [-30, 0, 30],
  [20, 0, 32],
  [70, 0, 20],
  // East side
  [120, 0, -5],
  [122, 0, -45],
  [118, 0, -85],
  // South side
  [80, 0, -170],
  [40, 0, -172],
  [0, 0, -170],
  [-30, 0, -168],
  // West side
  [-105, 0, -40],
  [-108, 0, -10],
];
treePositions.forEach(([x, y, z]) => addPalmTree(x, y, z));

// Conifer trees (inland/elevated areas)
function addConiferTree(x, y, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.6, 3.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x6b4127 }),
  );
  trunk.position.set(x, y + 1.7, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(2.5, 5.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x2d6d33 }),
  );
  crown.position.set(x, y + 5.5, z);
  crown.castShadow = true;
  scene.add(crown);
}

[
  [-40, 0, -165],
  [-60, 0, -155],
  [-90, 0, -80],
  [-100, 0, -55],
  [-95, 0, -25],
  [115, 2, -130],
].forEach(([x, y, z]) => addConiferTree(x, y, z));

// ─── Scenery: Grandstands ─────────────────────────────
function addGrandstand(x, y, z, rotY, width, color) {
  const stand = new THREE.Group();
  for (let row = 0; row < 4; row++) {
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(width - row * 3, 1.4, 4),
      new THREE.MeshStandardMaterial({ color }),
    );
    block.position.y = 0.7 + row * 1.2;
    block.position.z = -row * 2.2;
    block.castShadow = true;
    block.receiveShadow = true;
    stand.add(block);
  }
  stand.position.set(x, y, z);
  stand.rotation.y = rotY;
  scene.add(stand);
}

addGrandstand(0, 0, 25, Math.PI, 20, 0xe2e6ef);
addGrandstand(80, 0, -165, 0.3, 16, 0xf2c14e);
addGrandstand(-30, 0, -168, -0.2, 16, 0xe86952);

// ─── Low-Poly Car ──────────────────────────────────────
function createLowPolyCar(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.48,
    metalness: 0.2,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x15171c,
    roughness: 0.7,
  });

  const floor = new THREE.Mesh(new THREE.BoxGeometry(2, 0.25, 4.4), mat);
  floor.position.y = 0.6;
  floor.castShadow = true;
  group.add(floor);

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 2.2), mat);
  body.position.set(0, 1, -0.1);
  body.castShadow = true;
  group.add(body);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 1.6), mat);
  nose.position.set(0, 0.82, 1.7);
  nose.castShadow = true;
  group.add(nose);

  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1, 0.55, 1), dark);
  cockpit.position.set(0, 1.3, -0.15);
  cockpit.castShadow = true;
  group.add(cockpit);

  const rearWing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 0.4), dark);
  rearWing.position.set(0, 1.45, -2.05);
  rearWing.castShadow = true;
  group.add(rearWing);

  const frontWing = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.16, 0.35),
    dark,
  );
  frontWing.position.set(0, 0.55, 2.25);
  frontWing.castShadow = true;
  group.add(frontWing);

  const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.45, 18);
  for (const x of [-1.08, 1.08]) {
    for (const z of [-1.4, 1.55]) {
      const wheel = new THREE.Mesh(wheelGeo, dark);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.45, z);
      wheel.castShadow = true;
      group.add(wheel);
    }
  }
  return group;
}

// ─── Player Car ────────────────────────────────────────
const playerCar = new THREE.Group();
playerCar.rotation.order = "YXZ"; // Allow proper pitch/roll relative to heading
const fallbackCar = createLowPolyCar(0xff5a36);
playerCar.add(fallbackCar);
scene.add(playerCar);

// ─── Rival Cars ────────────────────────────────────────
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
    t: i * 0.18,
    baseLaneOffset: -4 + (i % 3) * 4,
    laneOffset: -4 + (i % 3) * 4,
    speed: 20 + i * 3,
  };
});

// ─── GLTF Model Loading ───────────────────────────────
const loader = new GLTFLoader();
loader.load(
  "models/car.glb",
  (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const targetLen = 4.5;
    const maxDim = Math.max(size.x, size.y, size.z);
    const autoScale = targetLen / maxDim;

    // Player model
    const pm = model.clone();
    pm.scale.set(autoScale, autoScale, autoScale);
    pm.position.set(
      -center.x * autoScale,
      -center.y * autoScale + 0.45,
      -center.z * autoScale,
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

    // Rival models — same model, different tint
    rivals.forEach((rival) => {
      const clone = model.clone();
      clone.scale.set(autoScale, autoScale, autoScale);
      clone.position.set(
        -center.x * autoScale,
        -center.y * autoScale + 0.45,
        -center.z * autoScale,
      );
      clone.rotation.y = Math.PI;
      clone.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
          c.material = c.material.clone();
          c.material.metalness = 0.7;
          c.material.roughness = 0.2;
          const lum =
            c.material.color.r * 0.299 +
            c.material.color.g * 0.587 +
            c.material.color.b * 0.114;
          if (lum > 0.12) {
            c.material.color.set(rival.tintColor);
          }
        }
      });
      rival.fallback.visible = false;
      rival.mesh.add(clone);
    });
  },
  undefined,
  () => {
    fallbackCar.visible = true;
  },
);

// ─── Player State ──────────────────────────────────────
const player = {
  position: new THREE.Vector3(),
  heading: 0,
  speed: 0,
  trackT: 0,
  lastTrackT: 0,
  collisionTimer: 0,
};

const race = {
  phase: "menu",
  countdown: 3.8,
  elapsed: 0,
  flashText: "",
  flashTimer: 0,
};

// ─── Helpers ───────────────────────────────────────────
function setFlash(text, duration) {
  race.flashText = text;
  race.flashTimer = duration;
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  const millis = Math.floor((safe % 1) * 1000)
    .toString()
    .padStart(3, "0");
  return `${minutes}:${secs.toString().padStart(2, "0")}.${millis}`;
}

// ─── Input ─────────────────────────────────────────────
const keys = new Set();
window.addEventListener("keydown", (event) => {
  if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
      event.code,
    )
  ) {
    event.preventDefault();
  }
  keys.add(event.code);
  if (event.code === "Enter" && race.phase === "finished") restartRace();
  if (event.code === "KeyR") restartRace();
});
window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

// ─── Reset ─────────────────────────────────────────────
function resetPlayer() {
  const sp = trackCurve.getPointAt(0.001);
  const st = trackCurve.getTangentAt(0.001);
  player.position.set(sp.x, sp.y, sp.z);
  player.heading = Math.atan2(st.z, st.x);
  player.speed = 0;
  player.trackT = 0.001;
  player.lastTrackT = 0.001;
  player.collisionTimer = 0;
  playerCar.position.copy(player.position);
  playerCar.rotation.y = Math.PI / 2 - player.heading;
}

function resetRivals() {
  rivals.forEach((rival, i) => {
    rival.t = Math.random(); // Random start positions
    rival.laneOffset = rival.baseLaneOffset;
    rival.speed = 18 + Math.random() * 15;
  });
}

function restartRace() {
  if (race.phase === "menu") return;
  resetPlayer();
  resetRivals();
  race.phase = "countdown";
  race.countdown = 3.8;
  race.elapsed = 0;
  race.flashText = "";
  race.flashTimer = 0;
  hintEl.textContent =
    "Arrow keys / WASD to drive · Space = handbrake · R = restart";
  updateCamera(1);
  camera.position.copy(cameraAnchor);
  camera.lookAt(cameraTarget);
}

resetPlayer();
resetRivals();

// ─── Player Physics ────────────────────────────────────
function updatePlayer(dt) {
  const accel = keys.has("ArrowUp") || keys.has("KeyW");
  const brake = keys.has("ArrowDown") || keys.has("KeyS");
  const turnL = keys.has("ArrowLeft") || keys.has("KeyA");
  const turnR = keys.has("ArrowRight") || keys.has("KeyD");
  const handbrake = keys.has("Space");

  // Track proximity
  const nearest = getClosestSplineData(
    player.position,
    player.trackT,
    0.15,
  );
  player.lastTrackT = player.trackT;
  player.trackT = nearest.t;

  const tangXZ = new THREE.Vector3(
    nearest.tangent.x,
    0,
    nearest.tangent.z,
  ).normalize();
  const lateral = new THREE.Vector3(-tangXZ.z, 0, tangXZ.x);
  const toPlayer = new THREE.Vector3(
    player.position.x - nearest.point.x,
    0,
    player.position.z - nearest.point.z,
  );
  const signedOffset = toPlayer.dot(lateral);
  const onTrack = Math.abs(signedOffset) <= TRACK_WIDTH * 0.47;

  // ── Realistic Physics ──
  const maxSpeed = 75; // ~270 km/h top speed
  const aeroCoeff = 0.012; // Aerodynamic drag grows with speed²
  const rollingResist = 1.8; // Constant rolling resistance
  const offTrackMultiplier = 3.5;
  const totalDrag = onTrack
    ? (rollingResist + aeroCoeff * player.speed * player.speed)
    : (rollingResist * offTrackMultiplier + aeroCoeff * player.speed * player.speed);

  // Engine torque — slow buildup, peaks at mid-rpm, tapers at high speed
  // 0-100 km/h (~28 m/s) should take ~4 seconds
  let engineForce = 0;
  if (accel) {
    const absSpeed = Math.abs(player.speed);
    const speedRatio = absSpeed / maxSpeed;
    // Low-end torque ramp (simulates clutch engagement)
    const lowEndRamp = Math.min(1, absSpeed / 5 + 0.3);
    // Peak torque at ~30%, tapering at high speed
    const torqueCurve = (1 - Math.pow(speedRatio, 2)) * lowEndRamp;
    engineForce = 14 * torqueCurve;
    if (!onTrack) engineForce *= 0.4; // Wheelspin on grass
  }

  // Apply forces
  if (accel && player.speed >= 0) {
    player.speed += engineForce * dt;
  } else if (accel && player.speed < 0) {
    // Accelerating while moving backwards = braking first
    player.speed += 20 * dt;
  }

  if (brake) {
    if (player.speed > 1) {
      // ABS braking — strong but not instant
      player.speed -= 28 * dt;
    } else if (player.speed > -10) {
      // Reverse gear (slow)
      player.speed -= 6 * dt;
    }
  }

  // Coasting drag
  if (!accel && !brake) {
    if (player.speed > 0) player.speed = Math.max(0, player.speed - totalDrag * dt);
    else if (player.speed < 0) player.speed = Math.min(0, player.speed + totalDrag * dt * 2);
  } else {
    // Even when accelerating, drag still applies
    if (player.speed > 0) player.speed -= aeroCoeff * player.speed * player.speed * dt * 0.3;
  }

  // Handbrake — locks rear wheels, bleeding speed but allowing yaw
  if (handbrake && player.speed > 0) {
    player.speed = Math.max(0, player.speed - 22 * dt);
  }

  player.speed = THREE.MathUtils.clamp(player.speed, -10, maxSpeed);

  // ── Steering ──
  // Key change: You CAN steer at standstill / very low speed (like turning wheels while parked)
  // but the car only rotates meaningfully when it has some speed
  const steering = (turnR ? 1 : 0) - (turnL ? 1 : 0);
  if (steering !== 0) {
    const absSpeed = Math.abs(player.speed);
    let steerRate;

    if (absSpeed < 3) {
      // Low-speed / standstill steering — slow but works
      steerRate = 1.2;
    } else {
      // Speed-dependent: more speed = less turning ability (understeer)
      steerRate = 35 / Math.max(10, absSpeed);
      if (handbrake) steerRate *= 2.0; // Handbrake oversteer / drift
    }

    if (!onTrack && absSpeed > 3) steerRate *= 0.65; // Less grip off-road

    const direction = player.speed >= 0 ? 1 : -0.8;
    player.heading += steering * steerRate * sensitivityMultiplier * dt * direction;
  }

  // ── Movement ──
  const fwdX = Math.cos(player.heading);
  const fwdZ = Math.sin(player.heading);
  const prevX = player.position.x;
  const prevZ = player.position.z;
  player.position.x += fwdX * player.speed * dt;
  player.position.z += fwdZ * player.speed * dt;

  // Elevation following
  player.position.y = THREE.MathUtils.lerp(
    player.position.y,
    nearest.point.y,
    8 * dt,
  );

  // ── Barrier Collision ──
  const carRadius = 2.2;
  const playerPos2D = new THREE.Vector2(player.position.x, player.position.z);
  for (let i = 0; i < barrierColliders.length; i++) {
    const bc = barrierColliders[i];
    const dx = playerPos2D.x - bc.point.x;
    const dy = playerPos2D.y - bc.point.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < carRadius) {
      const penetration = carRadius - dist;
      const nx = dx / (dist || 0.01);
      const ny = dy / (dist || 0.01);
      player.position.x += nx * penetration;
      player.position.z += ny * penetration;

      // Reflect speed — bounce off with energy loss
      const velX = fwdX * player.speed;
      const velZ = fwdZ * player.speed;
      const dotVN = velX * nx + velZ * ny;
      if (dotVN < 0) {
        // Only bounce if moving towards barrier
        player.speed *= Math.max(0.1, 1 - Math.abs(dotVN / (Math.abs(player.speed) || 1)) * 0.6);
        player.speed = Math.max(player.speed * 0.3, 0);
      }

      if (player.collisionTimer <= 0) {
        player.collisionTimer = 0.3;
      }
    }
  }

  // ── Building Collision ──
  for (let i = 0; i < buildingColliders.length; i++) {
    const b = buildingColliders[i];
    // Axis-aligned box vs circle collision
    const closestX = Math.max(b.cx - b.halfW, Math.min(player.position.x, b.cx + b.halfW));
    const closestZ = Math.max(b.cz - b.halfD, Math.min(player.position.z, b.cz + b.halfD));
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
      player.speed *= 0.2; // Big speed loss hitting a building

      if (player.collisionTimer <= 0) {
        player.collisionTimer = 0.3;
        setFlash("Impact!", 0.5);
      }
    }
  }

  // Timers
  if (player.collisionTimer > 0) player.collisionTimer -= dt;

  // ── Car-to-Car Collision ──
  rivals.forEach((rival) => {
    if (!rival.mesh) return;
    const dx = player.position.x - rival.mesh.position.x;
    const dz = player.position.z - rival.mesh.position.z;
    const distSq = dx * dx + dz * dz;
    const colDist = 3.2;
    if (distSq < colDist * colDist) {
      const dist = Math.sqrt(distSq) || 0.1;
      const overlap = colDist - dist;
      const pushX = (dx / dist) * overlap * 0.7;
      const pushZ = (dz / dist) * overlap * 0.7;
      player.position.x += pushX;
      player.position.z += pushZ;
      player.speed *= 0.75;

      if (player.collisionTimer <= 0) {
         player.collisionTimer = 0.4;
         setFlash("Collision!", 0.4);
      }
    }
  });

  // Update car visual
  playerCar.position.set(
    player.position.x,
    player.position.y,
    player.position.z,
  );

  // Car Dynamics (Roll & Pitch)
  const targetRoll = -steering * Math.min(1, Math.abs(player.speed) / 30) * 0.12;
  const targetPitch = accel ? -0.03 : (brake ? 0.06 : 0);

  playerCar.rotation.y = Math.PI / 2 - player.heading;
  playerCar.rotation.z = THREE.MathUtils.lerp(playerCar.rotation.z, targetRoll, 8 * dt);
  playerCar.rotation.x = THREE.MathUtils.lerp(playerCar.rotation.x, targetPitch, 8 * dt);
}

// ─── Rival AI ──────────────────────────────────────────
function updateRivals(dt) {
  rivals.forEach((rival, idx) => {
    const radius = TRACK_WIDTH / 2;
    rival.t += (rival.speed / trackLength) * dt;
    if (rival.t >= 1) {
      rival.t -= 1;
    }

    // Slight lane weave
    rival.laneOffset =
      rival.baseLaneOffset + Math.sin(race.elapsed * 1.5 + idx * 2) * 1.8;

    const pt = trackCurve.getPointAt(rival.t);
    const tn = trackCurve.getTangentAt(rival.t);
    const txz = new THREE.Vector3(tn.x, 0, tn.z).normalize();
    const lat = new THREE.Vector3(-txz.z, 0, txz.x);

    const finalPos = pt
      .clone()
      .add(lat.clone().multiplyScalar(rival.laneOffset));

    rival.mesh.position.set(finalPos.x, pt.y, finalPos.z);
    rival.mesh.rotation.y =
      Math.PI / 2 - Math.atan2(tn.z, tn.x);
  });
}

// ─── Checkpoint Animation Removed ──────────────────────

// ─── Camera ────────────────────────────────────────────
const cameraAnchor = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();

function updateCamera(dt) {
  const fwdX = Math.cos(player.heading);
  const fwdZ = Math.sin(player.heading);
  // Fixed follow distance and height for consistent camera placement
  const followDist = 8.5;
  const followH = 3.2;

  cameraAnchor.set(
    player.position.x - fwdX * followDist,
    player.position.y + followH,
    player.position.z - fwdZ * followDist,
  );
  
  // Instantly snap to the anchor when at a standstill, otherwise lerp
  if (Math.abs(player.speed) < 0.1) {
    camera.position.copy(cameraAnchor);
  } else {
    camera.position.lerp(cameraAnchor, 1 - Math.exp(-8 * dt));
  }

  cameraTarget.set(
    player.position.x + fwdX * 12,
    player.position.y + 1.2,
    player.position.z + fwdZ * 12,
  );
  camera.lookAt(cameraTarget);
}

// ─── HUD ───────────────────────────────────────────────
function updateHud() {
  const kmh = Math.round(Math.max(0, Math.abs(player.speed) * 3.6));
  speedEl.textContent = `${kmh} km/h`;

  // Simulated gear display
  if (player.speed < -0.5) {
    gearEl.textContent = "R";
  } else if (Math.abs(player.speed) < 0.5) {
    gearEl.textContent = "N";
  } else if (kmh < 35) {
    gearEl.textContent = "1";
  } else if (kmh < 70) {
    gearEl.textContent = "2";
  } else if (kmh < 110) {
    gearEl.textContent = "3";
  } else if (kmh < 160) {
    gearEl.textContent = "4";
  } else if (kmh < 220) {
    gearEl.textContent = "5";
  } else {
    gearEl.textContent = "6";
  }

  if (race.phase === "countdown") {
    statusEl.textContent = "Engine start...";
  } else if (!isOnTrack()) {
    statusEl.textContent = "Off road (Low grip)";
  } else {
    statusEl.textContent = "Free Drive";
  }

  if (race.phase === "countdown") {
    const cd = race.countdown > 0.85 ? Math.ceil(race.countdown - 0.8) : "GO";
    messageEl.textContent = cd;
  } else if (race.flashTimer > 0) {
    messageEl.textContent = race.flashText;
  } else {
    messageEl.textContent = "";
  }
}

function isOnTrack() {
  const nearest = getClosestSplineData(player.position, player.trackT, 0.1);
  const txz = new THREE.Vector3(
    nearest.tangent.x,
    0,
    nearest.tangent.z,
  ).normalize();
  const lat = new THREE.Vector3(-txz.z, 0, txz.x);
  const toP = new THREE.Vector3(
    player.position.x - nearest.point.x,
    0,
    player.position.z - nearest.point.z,
  );
  return Math.abs(toP.dot(lat)) <= TRACK_WIDTH * 0.47;
}

// ─── Resize ────────────────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Game Loop ─────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  const dt = Math.min(clock.getDelta(), 0.035);

  if (race.phase === "countdown") {
    race.countdown -= dt;
    if (race.countdown <= 0) {
      race.phase = "running";
      race.elapsed = 0;
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
  
  // Minimap updates
  playerDot.position.set(player.position.x, 50, player.position.z);
  
  composer.render();
  if (race.phase !== "menu") {
    minimapRenderer.render(scene, minimapCamera);
  }
}

restartRace();
renderer.setAnimationLoop(animate);
