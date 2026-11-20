# Implementation Plan: Life Dashboard

> **Note:** This is a documentation spec for an existing, fully-implemented application. All tasks are marked `[x]` to reflect that the code is already written and working. No implementation work is needed.

## Overview

Life Dashboard is a single-page vanilla HTML/CSS/JS application. The implementation is organised in dependency order: scaffold first, then the CSS token system, then shared utilities, then each feature module.

## Tasks

- [x] 1. Project scaffold
  - [x] 1.1 Create `index.html` with semantic HTML5 skeleton (doctype, `<head>` meta tags, viewport, title, stylesheet link, script tag)
    - _Requirements: 1.1, 4.1, 5.1, 6.1_
  - [x] 1.2 Create `css/style.css` file and link it from `index.html`
    - _Requirements: 3.2_
  - [x] 1.3 Create `js/app.js` file and reference it from `index.html` with a `defer` or bottom-of-body `<script>` tag
    - _Requirements: 1.1_
  - [x] 1.4 Implement two-column responsive CSS Grid layout that collapses to a single column below 720 px
    - _Requirements: 1.1_

- [x] 2. CSS theming system
  - [x] 2.1 Define `:root` custom properties for the light palette (background, surface, text, accent, border, muted colours)
    - _Requirements: 3.1, 3.2_
  - [x] 2.2 Define `[data-theme="dark"]` rule that overrides every `:root` custom property with dark-palette values
    - _Requirements: 3.2_
  - [x] 2.3 Add a `transition` rule on `body` so colour changes animate smoothly when the theme switches
    - _Requirements: 3.5_
  - [x] 2.4 Write card base styles (`.card` class: background, border-radius, padding, box-shadow) used by all widget panels
    - _Requirements: 3.2_

- [x] 3. Utility layer
  - [x] 3.1 Implement `$(sel, ctx?)` as a thin wrapper around `document.querySelector` (or `ctx.querySelector`)
    - _Requirements: 1.1, 2.2, 4.2, 5.2, 6.2_
  - [x] 3.2 Implement `$$(sel, ctx?)` as a wrapper around `querySelectorAll` that spreads the NodeList into an Array
    - _Requirements: 5.4_
  - [x] 3.3 Implement `pad(n)` that zero-pads an integer to two digits
    - _Requirements: 1.2, 4.1_
  - [x] 3.4 Implement `Store.get(key, fallback)` with JSON parsing and a `try/catch` that returns `fallback` on any error
    - _Requirements: 2.1, 3.1, 5.1, 6.1_
  - [x] 3.5 Implement `Store.set(key, value)` with JSON serialisation and a silent `try/catch` on write failure
    - _Requirements: 2.2, 3.5, 5.2, 6.7_
  - [x] 3.6 Implement `showToast(msg, duration?)` — creates `.toast` div, appends to `#toast-container`, fades in via double `requestAnimationFrame`, removes after `duration` ms (default 2500) plus 300 ms fade-out
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 4. ThemeModule
  - [x] 4.1 On `init()`, read `dashboard_theme` from `Store` (default `'light'`) and call `apply(theme)` immediately
    - _Requirements: 3.1_
  - [x] 4.2 Implement `apply(theme)` — sets `data-theme` attribute on `document.documentElement` to `'light'` or `'dark'`
    - _Requirements: 3.2_
  - [x] 4.3 In `apply(theme)`, update the `#theme-toggle` button label to `"🌙 Dark Mode"` when theme is `'light'` and `"☀️ Light Mode"` when theme is `'dark'`
    - _Requirements: 3.3, 3.4_
  - [x] 4.4 Attach a `click` listener on `#theme-toggle` that flips the theme, calls `apply()`, and persists the new value to `Store` under `dashboard_theme`
    - _Requirements: 3.5_

- [x] 5. Greeting header
  - [x] 5.1 Implement `tick()` — reads `new Date()`, formats hours/minutes/seconds in 12-hour zero-padded `HH:MM:SS AM/PM` form, writes result to `#greeting-time`
    - _Requirements: 1.1, 1.2_
  - [x] 5.2 In `tick()`, format and write the full date string (`DayName, MonthName D, YYYY`) to `#greeting-date` using hard-coded `DAYS` and `MONTHS` arrays
    - _Requirements: 1.3_
  - [x] 5.3 Implement `getGreeting(hour)` with the four time ranges: `[5,12)` → 🌅 Good morning, `[12,17)` → ☀️ Good afternoon, `[17,21)` → 🌆 Good evening, `[21,24)` or `[0,5)` → 🌙 Good night
    - _Requirements: 1.4, 1.5, 1.6, 1.7_
  - [x] 5.4 On `init()`, call `tick()` immediately and start a `setInterval` of 1000 ms
    - _Requirements: 1.1_
  - [x] 5.5 Style the greeting section with a centered layout and a muted gradient background in `style.css`
    - _Requirements: 1.1_

- [x] 6. Custom name
  - [x] 6.1 On `init()`, read `dashboard_name` from `Store` and pre-fill `#name-input` if a value exists
    - _Requirements: 2.1_
  - [x] 6.2 Implement `saveName()` — trim `#name-input.value`; if empty show Toast `"Please enter your name."` and return; otherwise save to `Store` under `dashboard_name`, call `tick()`, and show a confirmation Toast
    - _Requirements: 2.2, 2.3_
  - [x] 6.3 Attach `saveName` to the `click` event on `#name-save` and to the `keydown` Enter event on `#name-input`
    - _Requirements: 2.2_
  - [x] 6.4 In `tick()`, read `dashboard_name` from `Store` on every tick and append `, ${name}!` to the greeting string when a name is saved; display only the greeting followed by `!` when no name is stored
    - _Requirements: 2.4, 2.5, 2.6_

- [x] 7. Focus Timer
  - [x] 7.1 Add SVG markup to `index.html` with a track circle and a `#timer-progress` circle; set `strokeDasharray` to `CIRCUMFERENCE` (≈ 440) on the progress circle
    - _Requirements: 4.1, 4.7_
  - [x] 7.2 Implement `updateRing(sec)` — sets `strokeDashoffset = CIRCUMFERENCE * (1 - sec / TOTAL)` on `#timer-progress`
    - _Requirements: 4.7_
  - [x] 7.3 Implement `formatTime(sec)` returning `MM:SS` and `render()` which syncs `#timer-label`, `#timer-status`, `#timer-start` label, and CSS classes on `#timer-circle` to current state
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 7.4 Implement `start()` — if running: pause (clear interval, `running=false`, status "Paused", button label "▶ Resume"); else: set `running=true`, start 1 s interval, status "Focus session in progress…", button label "⏸ Pause"
    - _Requirements: 4.2, 4.3_
  - [x] 7.5 Implement `stop()` — clears interval, sets `running=false`, calls `render()` without resetting `remaining` (results in Paused display state)
    - _Requirements: 4.4_
  - [x] 7.6 Implement `reset()` — clears interval, sets `remaining=TOTAL`, calls `render()` to restore the Ready state with display "25:00"
    - _Requirements: 4.5_
  - [x] 7.7 Implement the internal `tick()` callback — decrements `remaining`; when it reaches 0: clear interval, `running=false`, call `render()`, apply `.finished` to `#timer-circle`, fire 4000 ms Toast `"⏰ Focus session complete! Take a break."`
    - _Requirements: 4.6_
  - [x] 7.8 Define `.running` and `.finished` CSS classes on `#timer-circle` with appropriate stroke colours in `style.css`
    - _Requirements: 4.6_
  - [x] 7.9 Attach `start`, `stop`, and `reset` as `click` listeners on `#timer-start`, `#timer-stop`, and `#timer-reset`
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 8. To-Do List
  - [x] 8.1 Implement `load()` and `save()` — read/write `dashboard_todos` via `Store` (default empty array)
    - _Requirements: 5.1_
  - [x] 8.2 Implement `genId()` using `Date.now().toString(36)` concatenated with `Math.random().toString(36).slice(2)`
    - _Requirements: 5.11_
  - [x] 8.3 Implement `addTodo()` — trim `#todo-input`; if empty show Toast `"Please enter a task."` and return; otherwise append `{id, text, done:false}`, call `save()`, re-render, clear and focus `#todo-input`
    - _Requirements: 5.2, 5.3_
  - [x] 8.4 Attach `addTodo` to the `click` event on `#todo-add` and to the `keydown` Enter event on `#todo-input`
    - _Requirements: 5.2_
  - [x] 8.5 Implement `toggleDone(id)` — flip the `done` boolean on the matching task, call `save()`, re-render
    - _Requirements: 5.4_
  - [x] 8.6 In `render()`, apply the `.done` CSS class to list items where `task.done === true` (line-through decoration and muted colour defined in `style.css`)
    - _Requirements: 5.5_
  - [x] 8.7 Implement `startEdit(id, li)` — replace the `.todo-text` span with a focused `.todo-edit-input` pre-filled with `task.text`; hide the edit button; wire Enter → `blur()`, Escape → restore original value then `blur()`, blur → `commit()`
    - _Requirements: 5.6, 5.7, 5.8_
  - [x] 8.8 In `commit()`, if trimmed value is non-empty update `task.text` and call `save()`; if empty retain original text without saving; call `render()` in both cases
    - _Requirements: 5.7_
  - [x] 8.9 Implement `deleteTodo(id)` — filter item from array, call `save()`, re-render, show Toast `"Task deleted."`
    - _Requirements: 5.9_
  - [x] 8.10 In `render()`, when `todos` is empty render a single `.todo-empty` placeholder list item with text `"No tasks yet. Add one above!"`
    - _Requirements: 5.10_
  - [x] 8.11 Set a fixed height and `overflow-y: auto` on `#todo-list` in `style.css` so the list scrolls when it exceeds 320 px
    - _Requirements: 5.1_

- [x] 9. Quick Links
  - [x] 9.1 Implement `load()` and `save()` — read/write `dashboard_links` via `Store` (default empty array)
    - _Requirements: 6.1_
  - [x] 9.2 Implement `normalizeUrl(raw)` — if the trimmed string already starts with `http://` or `https://` (case-insensitive) return it unchanged; otherwise prepend `https://`
    - _Requirements: 6.6_
  - [x] 9.3 Implement `faviconUrl(href)` — parse URL hostname and return `https://www.google.com/s2/favicons?domain=HOSTNAME&sz=32`; return `""` if parsing fails
    - _Requirements: 6.8_
  - [x] 9.4 Implement `addLink()` — trim name (empty → Toast + focus `#link-name`, return); normalize URL then check empty (empty → Toast + focus `#link-url`, return); `new URL()` throw → Toast + focus `#link-url`, return; on success append `{id, name, url}`, save, re-render, clear inputs, focus `#link-name`, show confirmation Toast
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.7_
  - [x] 9.5 Attach `addLink` to the `click` event on `#link-add`
    - _Requirements: 6.2_
  - [x] 9.6 In `render()`, build each link card as an `<a>` with `target="_blank" rel="noopener noreferrer"`; include a favicon `<img>` with an `onerror` handler that calls `img.remove()`
    - _Requirements: 6.8, 6.9_
  - [x] 9.7 In `style.css`, define the hover-reveal delete button — position it at top-right of the card, set `opacity: 0` by default, and set `opacity: 1` on `.link-card:hover .link-delete`
    - _Requirements: 6.10_
  - [x] 9.8 Implement `deleteLink(id)` — `event.preventDefault()`, filter item from array, save, re-render, show Toast `"Link removed."`
    - _Requirements: 6.11_
  - [x] 9.9 In `render()`, when `links` is empty render a `.links-empty` placeholder with text `"No links yet. Add your favorite sites above!"`
    - _Requirements: 6.12_
  - [x] 9.10 Style `#links-grid` as CSS Grid with `auto-fill` columns in `style.css` so cards wrap automatically
    - _Requirements: 6.1_

- [x] 10. Toast notification system
  - [x] 10.1 Add `#toast-container` to `index.html` with `aria-live="polite"`
    - _Requirements: 7.3_
  - [x] 10.2 In `style.css`, position `#toast-container` as `fixed` at the bottom of the viewport with `pointer-events: none`
    - _Requirements: 7.1_
  - [x] 10.3 Style individual `.toast` elements with an initial `opacity: 0` state and a CSS `transition` on `opacity`
    - _Requirements: 7.1_
  - [x] 10.4 In `showToast()`, trigger the fade-in by adding `.show` (which sets `opacity: 1`) inside two nested `requestAnimationFrame` calls
    - _Requirements: 7.1_
  - [x] 10.5 In `showToast()`, after `duration` ms remove `.show` and then remove the element from the DOM after a further 300 ms (matching the CSS transition)
    - _Requirements: 7.2_
  - [x] 10.6 In `style.css`, give `#toast-container` `display: flex`, `flex-direction: column`, and `gap: 8px` so stacked Toasts separate correctly
    - _Requirements: 7.4_

## Notes

- All tasks are marked `[x]` because the application is fully implemented. This document records what was built, not what remains to be done.
- Tasks 4–10 all depend on task 3 (utility layer) because every module uses `$()`, `Store`, and/or `showToast`.
- Tasks 5–10 all depend on task 2 (CSS theming) because every widget uses CSS custom properties for colour, spacing, and animation.
- No property-based tests or unit tests are configured in this repository. The design document describes what a future test suite would cover.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4", "5.1", "5.2", "5.3", "5.4", "5.5", "10.1", "10.2", "10.3"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3", "6.4", "7.1", "7.2", "7.3", "8.1", "8.2", "9.1", "9.2", "9.3", "10.4", "10.5", "10.6"] },
    { "id": 5, "tasks": ["7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "8.3", "8.4", "8.5", "8.6", "8.7", "8.8", "8.9", "8.10", "8.11", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10"] }
  ]
}
```
