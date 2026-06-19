# Reference: index.html — Line-by-Line Code Documentation

> This file documents [index.html](../index.html) (70 lines), explaining every element, attribute, and design decision.

---

## Document Head (Lines 1–9)

```html
<!doctype html>                                              <!-- L1 -->
<html lang="en">                                             <!-- L2 -->
  <head>
    <meta charset="UTF-8" />                                 <!-- L4 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />  <!-- L5 -->
    <title>Monaco Free Drive</title>                         <!-- L6 -->
    <meta name="description" content="Realistic free-drive simulator..." />   <!-- L7 -->
    <link rel="stylesheet" href="style.css" />               <!-- L8 -->
  </head>
```

| Line | Element | Purpose |
|---|---|---|
| 1 | `<!doctype html>` | Tells the browser to use modern HTML5 rendering mode |
| 2 | `<html lang="en">` | Root element. `lang="en"` helps screen readers and search engines |
| 4 | `<meta charset="UTF-8">` | Character encoding — supports all languages and emoji |
| 5 | `<meta name="viewport" ...>` | Makes the page responsive on mobile devices. Without this, phones would render the page at desktop width and zoom out |
| 6 | `<title>` | Browser tab title and SEO title |
| 7 | `<meta name="description">` | SEO — search engines show this in results |
| 8 | `<link rel="stylesheet">` | Loads the CSS file. `href` is relative to this HTML file |

All **standard HTML** — no frameworks or libraries.

---

## UI Container (Line 11)

```html
<div id="ui">
```

The parent container for ALL user interface elements. Styled with `position: fixed; inset: 0; pointer-events: none;` — covers the entire viewport but lets clicks pass through to the 3D canvas below.

---

## Main Menu (Lines 12–19)

```html
<div id="main-menu">
  <h1 class="menu-title">Monaco Free Drive</h1>
  <p class="menu-subtitle">Realistic Street Driving</p>
  <div class="menu-buttons">
    <button id="btn-play" class="glow-btn">FREE DRIVE</button>
    <button id="btn-menu-settings" class="glow-btn outline">SETTINGS</button>
  </div>
</div>
```

| Element | Purpose |
|---|---|
| `#main-menu` | Full-screen overlay shown at startup. Hidden when "FREE DRIVE" is clicked |
| `.menu-title` | Large game title with glow text shadow |
| `.menu-subtitle` | Smaller subtitle text |
| `#btn-play` | Starts the game. JS adds click listener → hides menu, shows HUD, starts countdown |
| `#btn-menu-settings` | Opens the settings panel. `.outline` class = transparent background with border |
| `.glow-btn` | Shared button style with orange glow effect |

**JS reference:** [main.js lines 41–47](../main.js) — btnPlay click handler

---

## HUD — Heads-Up Display (Lines 21–50)

```html
<div id="hud" class="hidden">
```

The in-game overlay. Starts with `class="hidden"` (invisible). JS removes "hidden" when the game starts.

### Title Badge (Line 22)

```html
<div id="title">Monaco Free Drive</div>
```

Top-left pill-shaped badge. Styled as a rounded rectangle with glassmorphism (`backdrop-filter: blur`).

### Top Bar (Lines 23–25)

```html
<div id="topbar">
  <!-- Free Drive Mode -->
</div>
```

Centered at the top. Currently empty (just a comment). Could display lap times, position, etc.

### Settings Button (Line 27)

```html
<button id="settings-btn" title="Settings">⚙</button>
```

Top-right gear icon button. `title="Settings"` shows a tooltip on hover. The ⚙ character is a Unicode symbol (no image needed).

**JS reference:** [main.js lines 30–32](../main.js) — toggles settings overlay

### Flash Message (Line 29)

```html
<div id="message" aria-live="polite"></div>
```

Large centered text for countdown (3, 2, 1, GO!) and collision messages. `aria-live="polite"` tells screen readers to announce content changes — an **accessibility** attribute.

### Bottom Bar (Lines 31–45)

```html
<div id="bottom">
  <div id="speed-card">
    <div class="label">Speed</div>
    <div id="speed">0 km/h</div>
  </div>
  <div id="gear-card">
    <div class="label">Gear</div>
    <div id="gear">N</div>
  </div>
  <div id="info-card">
    <div class="label">Status</div>
    <div id="status">Engine start...</div>
    <div id="hint">Arrow keys / WASD to drive · Space = handbrake · R = restart</div>
  </div>
</div>
```

| Element | Updated By | Displays |
|---|---|---|
| `#speed` | JS `updateHud()` | Current speed in km/h |
| `#gear` | JS `updateHud()` | Current gear (N, 1–6, R) |
| `#status` | JS `updateHud()` | "Free Drive", "Off road", "Engine start..." |
| `#hint` | Static | Control instructions for the player |

**JS reference:** [main.js lines 1245–1284](../main.js) — updateHud()

### Minimap (Lines 47–49)

```html
<div id="minimap-container">
  <canvas id="minimap"></canvas>
</div>
```

A `<canvas>` element inside a styled container. This canvas is passed directly to a second `THREE.WebGLRenderer` in JS — it renders the top-down track view.

**JS reference:** [main.js lines 90–95](../main.js) — minimap renderer setup

---

## Settings Overlay (Lines 52–65)

```html
<div id="settings-overlay" class="hidden">
  <div id="settings-panel">
    <h2>SETTINGS</h2>
    <div class="setting-row">
      <div class="setting-label">Steering Sensitivity</div>
      <div class="sensitivity-options">
        <button class="sens-btn" data-value="0.6">Low</button>
        <button class="sens-btn active" data-value="1.0">Medium</button>
        <button class="sens-btn" data-value="1.5">High</button>
      </div>
    </div>
    <button id="settings-close">CLOSE</button>
  </div>
</div>
```

| Element | Purpose |
|---|---|
| `#settings-overlay` | Full-screen dark backdrop with blur. Starts hidden |
| `#settings-panel` | Centered card with glassmorphism styling |
| `.sens-btn` | Sensitivity option buttons. `data-value` stores the multiplier value |
| `.active` | CSS class that highlights the selected option (orange border/background) |
| `#settings-close` | Closes the overlay by adding "hidden" class back |

### `data-value` Attribute

Custom HTML `data-*` attributes store arbitrary data on elements. In JS, accessed via `element.dataset.value`. This lets the button know what sensitivity value it represents without hardcoding it in JavaScript.

**JS reference:** [main.js lines 48–54](../main.js) — sensitivity button handlers

---

## Script Tag (Line 67)

```html
<script type="module" src="main.js"></script>
```

| Attribute | Purpose |
|---|---|
| `type="module"` | Enables ES module syntax (`import`/`export`). Without this, `import` statements in main.js would cause a syntax error |
| `src="main.js"` | Path to the game logic file (relative to index.html) |

Module scripts are **automatically deferred** — they run after the HTML is fully parsed. This means DOM elements (like `#speed`, `#minimap`) are guaranteed to exist when the script runs.

**Phase:** [Phase 0](phase-0-project-setup.md#what-are-es-modules)
