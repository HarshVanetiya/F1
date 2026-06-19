# Glossary

Every technical term used in the documentation, sorted alphabetically.

---

| Term | Definition | Category |
|---|---|---|
| **AABB** | Axis-Aligned Bounding Box — a rectangle collision shape whose edges are aligned to the world X/Z axes. Used for building collision in this app | Physics |
| **Addon** | A Three.js module that isn't part of the core library. Imported from `three/addons/`. Examples: GLTFLoader, EffectComposer | Three.js |
| **Antialias** | A rendering technique that smooths jagged diagonal edges by blending pixel colors at boundaries | Rendering |
| **Aspect Ratio** | Width ÷ Height of the viewport. Prevents the image from looking stretched or squished | Camera |
| **`backdrop-filter`** | CSS property that applies visual effects (like blur) to the content **behind** an element. The key ingredient of glassmorphism | CSS |
| **Bloom** | A post-processing effect that makes bright areas glow and bleed light into surrounding pixels, simulating camera lens effects | Post-Processing |
| **BufferGeometry** | Three.js's way of storing geometry data (vertices, normals, indices) in GPU-friendly typed arrays | Three.js |
| **Callback** | A function passed to another function as an argument, to be called later. Used in `loader.load(url, successCallback, ...)` | JavaScript |
| **CatmullRomCurve3** | A Three.js class that creates a smooth curve passing through all given control points. Named after Edwin Catmull (Pixar co-founder) and Raphael Rom | Three.js |
| **Clamp** | Restricting a value to a minimum/maximum range. `clamp(5, 0, 10) = 5`, `clamp(15, 0, 10) = 10` | Math |
| **Clipping Plane** | Near/far boundaries beyond which objects are not rendered by the camera | Camera |
| **Clone** | Creating an independent copy of an object. In Three.js, `.clone()` deep-copies meshes, materials, and geometry references | Three.js |
| **CORS** | Cross-Origin Resource Sharing — a browser security policy that blocks loading files from different origins. Why you need a dev server instead of opening HTML directly | Web |
| **Delta Time (dt)** | Time elapsed since the last frame, in seconds. At 60 FPS, dt ≈ 0.0167. Multiplied by speeds to ensure frame-rate independent movement | Game Dev |
| **Destructuring** | ES6 JS syntax for unpacking array/object values: `const [x, y, z] = [1, 2, 3]` or `const { name } = obj` | JavaScript |
| **DevDependencies** | npm packages needed only during development (e.g., Vite). Not included in the production build | npm |
| **Dot Product** | A math operation on two vectors returning a single number. Positive = same direction, 0 = perpendicular, Negative = opposite directions. Formula: `a·b = ax*bx + ay*by + az*bz` | Math |
| **EffectComposer** | A Three.js addon that manages a chain of post-processing passes (render → bloom → screen) | Three.js |
| **ES Modules** | The modern `import`/`export` syntax for sharing code between JavaScript files. Requires `type="module"` on script tags | JavaScript |
| **Float32BufferAttribute** | A Three.js class that wraps data into a GPU-friendly `Float32Array`. Used for vertex positions, normals, etc. | Three.js |
| **FOV (Field of View)** | How wide the camera sees, measured in degrees. Human vision ≈ 120°. Games typically use 60°–90° | Camera |
| **Geometry** | The mathematical shape of a 3D object: its vertices, faces, and normals. Examples: `BoxGeometry`, `SphereGeometry` | Three.js |
| **Glassmorphism** | A UI design trend using semi-transparent backgrounds with `backdrop-filter: blur()` to create a frosted glass effect | CSS |
| **GLB** | Binary version of GLTF format. A single file containing geometry, materials, textures, and animations | 3D Models |
| **GLTF** | GL Transmission Format — the standard file format for 3D models on the web. Like "JPEG for 3D" | 3D Models |
| **GLTFLoader** | A Three.js addon class for loading GLTF/GLB 3D model files | Three.js |
| **Group** | A Three.js container (`THREE.Group`) that holds multiple meshes. Moving the group moves all children. Used for composite objects like cars and grandstands | Three.js |
| **HemisphereLight** | A Three.js light that simulates outdoor ambient lighting with a sky color (from above) and ground color (from below) | Three.js |
| **HUD** | Heads-Up Display — the on-screen UI elements (speed, gear, status) overlaid on the game view | Game Dev |
| **Index (geometry)** | A number referencing a vertex by its position in the vertex array. Three indices define one triangle. Indices allow vertex reuse (sharing corners between triangles) | 3D Graphics |
| **`inset: 0`** | CSS shorthand for `top: 0; right: 0; bottom: 0; left: 0`. Makes a positioned element cover its parent | CSS |
| **Lateral** | The sideways direction relative to the track. Perpendicular to the tangent direction | Math |
| **Layers** | A Three.js visibility system (0–31). Each object and camera has a layer bitmask. A camera only sees objects that share at least one enabled layer | Three.js |
| **Lerp** | Linear Interpolation — smoothly blending between two values. `lerp(a, b, 0.1)` moves 10% from `a` toward `b` | Math |
| **Luminance** | Perceived brightness of a color. Formula: `0.299R + 0.587G + 0.114B` (matches human eye sensitivity) | Color |
| **Material** | How a mesh appears: its color, reflectivity, transparency. Examples: `MeshStandardMaterial`, `MeshBasicMaterial` | Three.js |
| **Mesh** | A visible 3D object combining Geometry (shape) + Material (appearance). The fundamental visible object in Three.js | Three.js |
| **MeshBasicMaterial** | A Three.js material that ignores lighting. Always shows at full brightness. Used for things that should always be visible (sun glow, minimap dot) | Three.js |
| **MeshStandardMaterial** | A Three.js physically-based material with roughness and metalness properties. Reacts to lights realistically | Three.js |
| **Metalness** | Material property (0–1). 0 = non-metal (plastic, wood). 1 = pure metal (chrome, gold). Affects how light reflects | Three.js |
| **Minimap** | A small top-down view of the game world, typically shown in a corner of the screen | Game Dev |
| **Modulo (`%`)** | JavaScript operator returning the remainder of division. `7 % 3 = 1`. Used for cycling through arrays and alternating patterns | JavaScript |
| **Node.js** | A JavaScript runtime that lets you run JS outside the browser. Required for npm and Vite | Tooling |
| **Normal (geometry)** | A direction vector perpendicular to a surface. Used to calculate how light bounces off. For flat ground, normals point straight up `(0, 1, 0)` | 3D Graphics |
| **npm** | Node Package Manager — downloads JavaScript libraries, tracks dependencies, and runs scripts | Tooling |
| **Orthographic Camera** | A camera where objects don't get smaller with distance. Used for top-down views and minimaps | Three.js |
| **package.json** | A file listing a project's dependencies, scripts, and metadata. Created by `npm init` | npm |
| **PCF** | Percentage Closer Filtering — a technique to smooth shadow edges, making them soft instead of hard/pixelated | Rendering |
| **Penetration** | In collision detection, the distance by which two objects overlap. Used to calculate how far to push objects apart | Physics |
| **Perspective Camera** | A camera where objects get smaller with distance, mimicking human vision | Three.js |
| **`pointer-events: none`** | CSS property that makes an element invisible to mouse/touch interactions. Clicks pass through to elements below | CSS |
| **Post-Processing** | Visual effects applied after the scene is rendered to a texture: bloom, blur, color grading, etc. | Rendering |
| **Radians** | Angle unit used in JavaScript and Three.js. `π radians = 180°`. `π/2 = 90°`. Convert: `degrees × π/180 = radians` | Math |
| **`requestAnimationFrame`** | Browser API that schedules a function to run before the next screen repaint (~60 FPS). Three.js wraps this with `setAnimationLoop` | Web API |
| **Renderer** | The engine that converts a 3D scene into pixels on a canvas. `THREE.WebGLRenderer` uses the GPU via WebGL | Three.js |
| **RenderPass** | A post-processing pass that renders the 3D scene to an internal texture (instead of directly to screen) | Three.js |
| **Roughness** | Material property (0–1). 0 = mirror-smooth (chrome). 1 = fully diffuse (chalk, concrete). Affects light scatter | Three.js |
| **Scene** | A Three.js container (`THREE.Scene`) holding all 3D objects, lights, and fog. The "world" of the application | Three.js |
| **Set** | A JavaScript collection that stores unique values. Used for tracking currently pressed keyboard keys. Methods: `.add()`, `.delete()`, `.has()` | JavaScript |
| **Shadow Acne** | Visual artifact where surfaces incorrectly shadow themselves, creating ugly dot patterns. Fixed with `shadow.bias` | Rendering |
| **Shadow Map** | A texture rendered from the light's perspective, recording depth information. Used to calculate which surfaces are in shadow | Rendering |
| **Shorthand Property** | ES6 syntax: `{ color }` instead of `{ color: color }` when the variable name matches the property name | JavaScript |
| **Spline** | A smooth mathematical curve defined by control points. Used to define the racing circuit | Math |
| **`t` Parameter** | A value from 0 to 1 representing a position along a curve. 0 = start, 0.5 = midpoint, 1 = end | Math |
| **Tangent** | The direction a curve is heading at a specific point. A unit vector pointing "forward" along the track | Math |
| **Three.js** | A JavaScript library that makes WebGL easy to use. Provides high-level APIs for 3D graphics: scenes, cameras, meshes, lights | Library |
| **Tone Mapping** | Converting HDR (high-dynamic-range) colors to the 0–1 range your screen can display. ACES Filmic is a popular algorithm from cinema | Rendering |
| **Traverse** | Recursively walking through all children of a 3D object. `object.traverse(callback)` visits every descendant | Three.js |
| **Tree-Shaking** | Build optimization that removes unused code from the final bundle. Only code you actually `import` is included | Tooling |
| **UnrealBloomPass** | A Three.js addon post-processing pass that adds bloom glow, inspired by Unreal Engine's implementation | Three.js |
| **Vector2** | A Three.js class representing a 2D point or direction `(x, y)`. Used for 2D collision detection | Three.js |
| **Vector3** | A Three.js class representing a 3D point or direction `(x, y, z)`. The most fundamental data type in Three.js | Three.js |
| **Vertex** | A single point in 3D space `(x, y, z)`. Three vertices connected by indices form a triangle | 3D Graphics |
| **Vite** | A modern JavaScript build tool and dev server. Resolves `import` statements, serves files with hot-reload, and bundles for production | Tooling |
| **WebGL** | Web Graphics Library — a browser API for GPU-accelerated 2D and 3D graphics. Very low-level. Three.js wraps it | Web API |
| **Z-Fighting** | Visual glitch where two surfaces at the same depth flicker because the GPU can't determine which is in front. Fixed by adding tiny position offsets | Rendering |
