# Reference: style.css — Line-by-Line Code Documentation

> This file documents [style.css](../style.css) (467 lines), explaining every CSS property, technique, and design decision.

---

## CSS Custom Properties / Variables (Lines 1–11) {#variables}

```css
:root {
  color-scheme: dark;
  --panel: rgba(13, 18, 28, 0.76);
  --panel-strong: rgba(9, 13, 20, 0.88);
  --line: rgba(255, 255, 255, 0.12);
  --accent: #ff6b2c;
  --accent-soft: rgba(255, 107, 44, 0.2);
  --text: #f7f0e3;
  --muted: #c6cfdd;
  --glow: rgba(255, 185, 116, 0.34);
}
```

| Variable | Value | Used For |
|---|---|---|
| `--panel` | Dark blue at 76% opacity | Card backgrounds (speed, gear, info) |
| `--panel-strong` | Darker at 88% opacity | Settings overlay background |
| `--line` | White at 12% opacity | Subtle border lines |
| `--accent` | Orange `#ff6b2c` | Buttons, active states, brand color |
| `--accent-soft` | Orange at 20% opacity | Button glow, hover backgrounds |
| `--text` | Warm off-white `#f7f0e3` | Primary text |
| `--muted` | Gray-blue `#c6cfdd` | Secondary/label text |
| `--glow` | Warm amber at 34% opacity | Text shadow glow effects |

### `color-scheme: dark`

Tells the browser this page uses a dark theme. Affects default scrollbar colors, form elements, and system UI colors.

### `:root` Selector

Matches the `<html>` element. Variables defined here are **globally accessible** via `var(--name)`.

### `rgba(r, g, b, a)` vs `#hex`

- `rgba()` allows transparency (the `a` = alpha channel: 0 = invisible, 1 = solid)
- `#hex` is always fully opaque
- The panels use `rgba()` specifically for the **glassmorphism** effect — you need to see the 3D scene through them

---

## Reset & Base (Lines 13–35) {#reset}

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }
body {
  overflow: hidden;
  background: radial-gradient(...), linear-gradient(...);
  color: var(--text);
  font-family: "Trebuchet MS", "Segoe UI", sans-serif;
}
canvas { display: block; }
```

| Property | Purpose |
|---|---|
| `box-sizing: border-box` | Padding and border are **included** in element width/height (much saner layout math) |
| `margin: 0; padding: 0` | Remove default browser spacing from all elements |
| `overflow: hidden` | Prevent scrollbars (the game fills the entire viewport) |
| `background: radial-gradient(...), linear-gradient(...)` | Layered gradients — visible briefly before the 3D canvas loads |
| `canvas { display: block }` | Removes the tiny gap below inline `<canvas>` elements (canvas is inline by default, which adds whitespace) |

---

## UI Overlay (Lines 37–41) {#ui-overlay}

```css
#ui {
  position: fixed;
  inset: 0;
  pointer-events: none;
}
```

### `position: fixed`

Positions the element relative to the **viewport** (browser window), not the page. It stays in place even if the page scrolls (though there's no scrolling here).

### `inset: 0`

Shorthand for `top: 0; right: 0; bottom: 0; left: 0`. Makes the element cover the entire viewport.

### `pointer-events: none`

The critical property for the HTML-over-canvas pattern. Mouse clicks, hovers, and touches **pass through** this element as if it doesn't exist. The 3D canvas below receives all interaction.

Individual interactive elements (buttons) override this with `pointer-events: all`.

---

## Title Badge (Lines 43–57) {#title}

```css
#title {
  position: absolute;
  top: 18px; left: 18px;
  padding: 10px 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--panel);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
  font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
  font-size: 1.25rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

### `border-radius: 999px`

A very large value that makes any rectangle into a **pill shape** (fully rounded ends).

### `box-shadow: 0 18px 45px rgba(0,0,0,0.28)`

```
box-shadow: offsetX  offsetY  blurRadius  color
            0        18px     45px        semi-transparent black
```
Creates a deep shadow below the element, adding depth. The large `18px` offset and `45px` blur create a floating/elevated effect.

### `letter-spacing: 0.08em`

Adds space between characters. `em` is relative to the font size. `0.08em` = 8% of the font size. Used for headings to create a premium, airy feel.

### `text-transform: uppercase`

Converts all text to UPPERCASE regardless of what's in the HTML.

---

## Glassmorphism Cards (Lines 68–76) {#glassmorphism}

```css
.panel, #speed-card, #gear-card, #info-card {
  border: 1px solid var(--line);
  background: var(--panel);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);
}
```

### `backdrop-filter: blur(14px)`

**The key glassmorphism property.** Applies a blur effect to everything **behind** the element (the 3D game scene). Combined with a semi-transparent background, this creates a frosted glass effect.

```
Without backdrop-filter:          With backdrop-filter: blur(14px):
┌──────────────┐                  ┌──────────────┐
│ Sharp 3D     │                  │ Blurred 3D   │
│ scene behind │                  │ scene behind  │
│ dark overlay │                  │ frosted glass │
└──────────────┘                  └──────────────┘
```

---

## Message / Countdown Text (Lines 87–106) {#message}

```css
#message {
  position: absolute;
  top: 19%;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(2.2rem, 6vw, 4.5rem);
  text-shadow: 0 0 30px var(--glow);
  white-space: pre-line;
}
```

### `left: 50%; transform: translateX(-50%)`

A common centering technique:
1. `left: 50%` — moves the element's left edge to the center
2. `translateX(-50%)` — shifts it back by half its own width

Together, this perfectly centers the element horizontally regardless of its width.

### `clamp(min, preferred, max)`

Responsive font sizing:
- **Minimum:** `2.2rem` (35px) — never smaller than this
- **Preferred:** `6vw` (6% of viewport width) — scales with screen size
- **Maximum:** `4.5rem` (72px) — never larger than this

### `text-shadow: 0 0 30px var(--glow)`

A large glow effect behind the text. `0 0` = no offset, `30px` = large blur radius. Combined with the warm amber glow color, this creates a fiery text effect.

### `white-space: pre-line`

Preserves line breaks in the text content (`\n` works), while still wrapping long lines normally.

---

## Speed Display (Lines 156–163) {#speed}

```css
#speed {
  font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
  font-size: clamp(2rem, 4.8vw, 3.9rem);
  line-height: 0.95;
}
```

### `line-height: 0.95`

Sets the line height to 95% of the font size — slightly tighter than normal. This removes extra space above/below the large text, making the card more compact.

---

## Settings Button (Lines 178–205) {#settings-btn}

```css
#settings-btn {
  width: 46px; height: 46px;
  border-radius: 50%;
  backdrop-filter: blur(14px);
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

#settings-btn:hover {
  transform: rotate(45deg) scale(1.1);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
}
```

### `border-radius: 50%`

Makes a square element perfectly circular.

### `transition: all 0.25s ease`

Animates **all** CSS property changes over 0.25 seconds with an ease curve (starts slow, speeds up, slows down). This makes the hover rotation and scale change smooth.

### `transform: rotate(45deg) scale(1.1)`

On hover, the gear icon ⚙ rotates 45° and scales to 110% size. Multiple transforms are combined in one property, applied right-to-left.

### `display: flex; align-items: center; justify-content: center`

Centers the ⚙ icon both horizontally and vertically inside the circle.

---

## Settings Overlay (Lines 207–247) {#settings-overlay}

```css
#settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: all;
  backdrop-filter: blur(6px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

#settings-panel {
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### `z-index: 100`

Ensures the overlay appears above everything else (default z-index is 0).

### `@keyframes` Animations

CSS animations defined with `@keyframes` run once when the element appears:
- `fadeIn` — the dark backdrop fades from transparent to visible
- `slideUp` — the settings panel slides up 20px while fading in

### `animation: slideUp 0.25s ease`

- `slideUp` — name of the `@keyframes`
- `0.25s` — duration
- `ease` — timing function (starts slow, speeds up, slows down)

---

## Sensitivity Buttons (Lines 276–301) {#sensitivity-btns}

```css
.sens-btn {
  flex: 1;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: transparent;
  transition: all 0.2s ease;
}

.sens-btn:hover {
  border-color: var(--accent);
  background: rgba(255, 107, 44, 0.08);
}

.sens-btn.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 20px rgba(255, 107, 44, 0.15);
}
```

### `flex: 1`

In a flex container, `flex: 1` makes all children share equal width. Three buttons → each takes 1/3 of the space.

### Active State

The `.active` class is added by JavaScript when a button is clicked. It shows an orange background, orange border, and a subtle glow — making the selected option visually obvious.

---

## Responsive Design (Lines 322–356) {#responsive}

```css
@media (max-width: 860px) {
  #topbar {
    top: 72px;
    width: calc(100% - 24px);
    flex-wrap: wrap;
    justify-content: center;
  }
  #bottom {
    flex-direction: column;
    align-items: stretch;
  }
  #settings-panel {
    min-width: 280px;
    padding: 24px;
  }
}
```

### `@media (max-width: 860px)`

A **media query** — these styles only apply when the viewport is 860px wide or less (tablets, phones).

### `calc(100% - 24px)`

CSS calculation — 100% viewport width minus 24px of padding. Mixes units (`%` and `px`).

### `flex-wrap: wrap`

Allows flex children to wrap to the next line when they don't fit in one row.

### `flex-direction: column`

Changes the bottom bar from horizontal layout to vertical stack on small screens.

---

## Main Menu (Lines 358–433) {#main-menu}

```css
#main-menu {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center,
    rgba(13, 18, 28, 0.8), rgba(9, 13, 20, 0.98));
  backdrop-filter: blur(8px);
  z-index: 50;
  pointer-events: all;
  transition: opacity 0.5s ease;
}

#main-menu.hidden {
  opacity: 0;
  pointer-events: none;
}
```

### Menu Transition

When `.hidden` is added (by JavaScript on "FREE DRIVE" click), the menu fades out over 0.5 seconds (`transition: opacity 0.5s`). `pointer-events: none` ensures clicks pass through immediately even during the fade.

### `radial-gradient(circle at center, ...)`

A circular gradient: darkest at the edges, slightly lighter at the center — creates a vignette/spotlight effect.

### Glow Button

```css
.glow-btn {
  padding: 18px 24px;
  background: var(--accent);
  border: none;
  border-radius: 999px;
  box-shadow: 0 0 30px var(--accent-soft);
  transition: all 0.2s ease;
}

.glow-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 50px rgba(255, 107, 44, 0.5);
}

.glow-btn.outline {
  background: transparent;
  border: 2px solid var(--line);
  box-shadow: none;
}
```

Two button styles sharing the same base:
- **Solid:** Orange background with ambient glow — the primary action
- **Outline:** Transparent with a subtle border — the secondary action

On hover, both scale up 5% and increase their glow radius — a satisfying micro-interaction.

---

## Minimap Container (Lines 447–466) {#minimap}

```css
#minimap-container {
  position: absolute;
  top: 18px; right: 80px;
  width: 220px; height: 220px;
  border-radius: 24px;
  background: rgba(9, 13, 20, 0.6);
  border: 1px solid var(--line);
  backdrop-filter: blur(14px);
  overflow: hidden;
  pointer-events: none;
}

#minimap {
  width: 100%;
  height: 100%;
}
```

### `overflow: hidden`

Clips any content that extends beyond the container's bounds. The minimap canvas might render slightly outside the rounded corners — this hides those edges.

### `right: 80px`

Positioned 80px from the right edge (leaving room for the settings button at `right: 18px`).
