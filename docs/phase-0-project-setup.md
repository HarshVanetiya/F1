# Phase 0 — Project Setup

> **Goal:** Set up a working project folder, install dependencies, and understand the tooling.
> **What you'll learn:** npm, package.json, Vite, ES modules.

---

## Step 1: Create the Project Folder

```bash
mkdir F1
cd F1
```

## Step 2: Initialize npm

```bash
npm init -y
```

This creates a `package.json` file — a manifest that describes your project and its dependencies.

### What is npm?

**npm** (Node Package Manager) is a tool that:
1. Downloads JavaScript libraries (called **packages**) from the internet
2. Tracks which libraries your project depends on
3. Runs scripts (like starting a dev server)

You need **Node.js** installed to use npm. Download it from [nodejs.org](https://nodejs.org).

## Step 3: Install Dependencies

```bash
npm install three           # 3D rendering library (runtime dependency)
npm install --save-dev vite  # Build tool (development-only dependency)
```

### What Does `install` Do?

- Downloads the library code into a `node_modules/` folder
- Adds the library name and version to `package.json`
- `--save-dev` marks it as a **dev dependency** (only needed during development, not shipped to users)

## Step 4: Configure package.json

Edit `package.json` to look like this:

```json
{
  "name": "f1",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^8.0.16"
  },
  "dependencies": {
    "three": "^0.184.0"
  }
}
```

> **Reference:** [package.json](../package.json)

### Key Fields Explained

| Field | What It Does |
|---|---|
| `"type": "module"` | Tells Node.js to use modern `import`/`export` syntax instead of the older `require()` syntax |
| `"private": true` | Prevents accidentally publishing this to npm's public registry |
| `"scripts"` | Shortcut commands you can run with `npm run <name>` |
| `"dependencies"` | Libraries needed at runtime (Three.js renders the game) |
| `"devDependencies"` | Libraries needed only during development (Vite runs the dev server) |
| `"^0.184.0"` | The `^` means "any version compatible with 0.184.x" (allows patch updates) |

## Step 5: Create the File Structure

```
F1/
├── index.html      ← Web page entry point
├── main.js         ← All game logic
├── style.css       ← UI styling
├── package.json    ← Project manifest
└── public/
    └── models/
        └── car.glb ← 3D model file
```

Vite expects `index.html` at the **root** of your project. Everything in the `public/` folder is served as-is at the root URL (so `public/models/car.glb` is accessible at `/models/car.glb`).

## Step 6: Start the Dev Server

```bash
npm run dev
```

This runs the `"dev": "vite"` script, which starts a local web server (usually at `http://localhost:5173`).

---

## What is Vite and Why Do We Need It?

### The Problem

If you try to open `index.html` directly in the browser (double-clicking the file), this line will fail:

```javascript
import * as THREE from "three";
```

**Why?** Two reasons:
1. Browsers block `import` statements when loading from `file://` URLs (security restriction called CORS)
2. The browser doesn't know that `"three"` means `node_modules/three/build/three.module.js`

### The Solution: Vite

Vite is a **development server and build tool**. It:

1. **Runs a local web server** — serves files over `http://` so `import` works
2. **Resolves package names** — translates `"three"` to the actual file path in `node_modules/`
3. **Hot-reloads** — when you save a file, the browser updates instantly without a manual refresh
4. **Bundles for production** — `npm run build` combines all files into optimized output for deployment

### Could I Use Something Else?

Yes. Alternatives include:
- **webpack** — Older, more complex, same purpose
- **Parcel** — Similar to Vite, zero-config
- **Plain `<script>` tags** — Works if you load Three.js from a CDN with `<script src="https://...">`, but you lose `import` syntax and sub-module access

---

## What are ES Modules?

ES Modules are the modern way JavaScript files share code with each other.

### The Old Way (Before ES Modules)

```html
<!-- Load everything as global variables -->
<script src="three.js"></script>
<script src="game.js"></script>
<!-- game.js accesses THREE as a global variable -->
```

**Problems:** Everything is global, load order matters, no way to import just what you need.

### The Modern Way (ES Modules — What This App Uses)

```javascript
// Import specific things from a library
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
```

```html
<!-- Tell the browser this script uses modules -->
<script type="module" src="main.js"></script>
```

**Benefits:** Code is isolated, explicit dependencies, tree-shaking (unused code is removed during build).

### The `import` Syntax

```javascript
// Import EVERYTHING from a library as one object
import * as THREE from "three";
// Usage: THREE.Scene, THREE.Mesh, THREE.Vector3, etc.

// Import SPECIFIC exports by name (destructuring)
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// Usage: GLTFLoader (directly, no THREE. prefix)

// Import from a relative file path
import { myFunction } from "./utils.js";
```

---

## Phase 0 Checkpoint

At this point you should have:
- [x] A project folder with `package.json`
- [x] `node_modules/` containing `three` and `vite`
- [x] An empty `index.html`, `main.js`, and `style.css`
- [x] `npm run dev` starts a server and opens the browser

**Next:** [Phase 1 — Scene, Camera, Renderer →](phase-1-scene-camera-renderer.md)
