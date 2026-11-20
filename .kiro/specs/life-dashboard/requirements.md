# Requirements Document

> **Note:** This is a documentation spec for an existing, fully-implemented application. No implementation work is needed. All requirements describe behavior already present in the codebase (`index.html`, `css/style.css`, `js/app.js`).

## Introduction

Life Dashboard is a single-page web application (no framework) that gives a user a personal productivity hub in the browser. It displays a live clock and time-based greeting, lets the user save their name, toggle between light and dark themes, run a 25-minute Pomodoro focus timer, manage a to-do list, and maintain a set of quick-launch links. All user data is persisted in `localStorage`. The layout is a two-column responsive grid that collapses to a single column on viewports narrower than 720 px.

## Glossary

- **Dashboard**: The single HTML page that hosts all widgets.
- **Store**: The JSON-safe `localStorage` wrapper (`Store.get` / `Store.set`) used by all modules.
- **ThemeModule**: The JavaScript module responsible for light/dark theme management.
- **GreetingModule**: The JavaScript module responsible for the live clock, date display, and personalised greeting.
- **TimerModule**: The JavaScript module responsible for the 25-minute Pomodoro countdown timer.
- **TodoModule**: The JavaScript module responsible for the to-do list.
- **LinksModule**: The JavaScript module responsible for the quick-links grid.
- **Toast**: A transient notification element (`.toast`) appended to `#toast-container` and removed automatically after a configurable duration.
- **TOTAL**: The fixed timer duration of 1500 seconds (25 minutes).
- **Circumference**: The SVG ring circumference value (≈ 440, derived from radius 70).

---

## Requirements

### Requirement 1: Live Clock and Date Display

**User Story:** As a user, I want to see the current time and date update continuously, so that I always have an accurate reference without leaving the Dashboard.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE GreetingModule SHALL start a one-second interval that updates `#greeting-time` and `#greeting-date` on every tick.
2. WHEN the clock ticks, THE GreetingModule SHALL display the time in `HH:MM:SS AM/PM` 12-hour format in `#greeting-time`.
3. WHEN the clock ticks, THE GreetingModule SHALL display the date in `DayName, MonthName D, YYYY` format in `#greeting-date`.
4. WHEN the clock ticks and the hour is between 05:00 (inclusive) and 12:00 (exclusive), THE GreetingModule SHALL display "🌅 Good morning" in `#greeting-text`.
5. WHEN the clock ticks and the hour is between 12:00 (inclusive) and 17:00 (exclusive), THE GreetingModule SHALL display "☀️ Good afternoon" in `#greeting-text`.
6. WHEN the clock ticks and the hour is between 17:00 (inclusive) and 21:00 (exclusive), THE GreetingModule SHALL display "🌆 Good evening" in `#greeting-text`.
7. WHEN the clock ticks and the hour is between 21:00 (inclusive) and 24:00 (exclusive) or between 00:00 (inclusive) and 05:00 (exclusive), THE GreetingModule SHALL display "🌙 Good night" in `#greeting-text`.

---

### Requirement 2: Custom User Name

**User Story:** As a user, I want to save my name so that the greeting addresses me personally on every visit.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE GreetingModule SHALL read the saved name from `localStorage` key `dashboard_name` and pre-fill the `#name-input` field if a value exists.
2. WHEN the user submits the name form with a non-empty value (via the `#name-save` button or the Enter key), THE GreetingModule SHALL trim the input, save it to `localStorage` key `dashboard_name`, immediately update `#greeting-text`, and display a confirmation Toast.
3. IF the user submits the name form with an empty or whitespace-only value, THEN THE GreetingModule SHALL display a Toast with the message "Please enter your name." and SHALL NOT save any value.
4. WHEN a name is saved and the clock ticks, THE GreetingModule SHALL append `, ${name}!` to the time-based greeting string in `#greeting-text`.
5. WHEN no name is saved and the clock ticks, THE GreetingModule SHALL display only the time-based greeting string followed by `!` in `#greeting-text`.
6. WHEN the clock ticks, THE GreetingModule SHALL re-read the name from `localStorage` on every tick so that changes take effect without a page reload.

---

### Requirement 3: Light / Dark Theme Toggle

**User Story:** As a user, I want to switch between light and dark themes so that the Dashboard suits my environment and preference.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE ThemeModule SHALL read the saved theme from `localStorage` key `dashboard_theme`, defaulting to `'light'` if no value is stored.
2. WHEN a theme is applied, THE ThemeModule SHALL set the `data-theme` attribute on `<html>` to either `'light'` or `'dark'`.
3. WHEN the active theme is `'light'`, THE ThemeModule SHALL display the `#theme-toggle` button label as "🌙 Dark Mode".
4. WHEN the active theme is `'dark'`, THE ThemeModule SHALL display the `#theme-toggle` button label as "☀️ Light Mode".
5. WHEN the user clicks `#theme-toggle`, THE ThemeModule SHALL flip the active theme to the opposite value, update the `data-theme` attribute, update the button label, and persist the new theme to `localStorage` key `dashboard_theme`.

---

### Requirement 4: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with a visual progress ring so that I can run focused work sessions.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE TimerModule SHALL initialise the countdown to TOTAL (1500 seconds), display "25:00" in `#timer-label`, set `#timer-status` to "Ready", and render the SVG ring at full stroke.
2. WHEN the user clicks `#timer-start` while the timer is in the Ready or Paused state, THE TimerModule SHALL start a one-second interval that decrements `remaining` each tick, update `#timer-label` and the SVG ring, set `#timer-status` to "Focus session in progress…", and change the `#timer-start` button label to "⏸ Pause".
3. WHEN the user clicks `#timer-start` while the timer is running, THE TimerModule SHALL clear the interval, set `running` to `false`, set `#timer-status` to "Paused", and change the `#timer-start` button label to "▶ Resume".
4. WHEN the user clicks `#timer-stop`, THE TimerModule SHALL clear the interval and set `running` to `false` without resetting `remaining`, resulting in a Paused display state.
5. WHEN the user clicks `#timer-reset`, THE TimerModule SHALL clear the interval, set `remaining` to TOTAL, and restore the timer to the Ready state.
6. WHEN `remaining` reaches 0, THE TimerModule SHALL clear the interval, set `running` to `false`, set `#timer-status` to "Session complete! 🎉", apply the `.finished` class to `#timer-circle` (changing the ring stroke to the success colour), and display a Toast with the message "⏰ Focus session complete! Take a break." for 4000 ms.
7. WHEN the timer is running, THE TimerModule SHALL update `strokeDashoffset` on `#timer-progress` proportionally to `remaining / TOTAL` so that the ring depletes as time elapses.
8. THE TimerModule SHALL NOT persist any timer state to `localStorage`.

---

### Requirement 5: To-Do List

**User Story:** As a user, I want to manage a persistent list of tasks with the ability to add, complete, edit, and delete items so that I can track what I need to do.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE TodoModule SHALL read the task array from `localStorage` key `dashboard_todos` (default: empty array) and render all tasks in `#todo-list`.
2. WHEN the user submits a non-empty task (via `#todo-add` or the Enter key in `#todo-input`), THE TodoModule SHALL trim the input, append a new task object `{ id, text, done: false }` to the array, save to `localStorage`, re-render the list, clear `#todo-input`, and return focus to `#todo-input`.
3. IF the user submits an empty or whitespace-only task, THEN THE TodoModule SHALL display a Toast with the message "Please enter a task." and SHALL NOT add any item.
4. WHEN the user toggles the checkbox of a task, THE TodoModule SHALL flip the `done` property of that task, save to `localStorage`, and re-render the list.
5. WHEN a task has `done: true`, THE TodoModule SHALL apply the `.done` class to the list item, rendering the task text with a line-through decoration and muted colour.
6. WHEN the user clicks the edit button (✏️) of a task, THE TodoModule SHALL replace the `.todo-text` span with a focused `.todo-edit-input` text field pre-filled with the current task text and hide the edit button.
7. WHEN the user presses Enter or removes focus from an active `.todo-edit-input`, THE TodoModule SHALL commit the trimmed value to the task's `text` property and save to `localStorage` if the trimmed value is non-empty; otherwise it SHALL retain the original text without saving.
8. WHEN the user presses Escape while a `.todo-edit-input` is active, THE TodoModule SHALL revert the input value to the original text without saving and trigger a commit (blur).
9. WHEN the user clicks the delete button (🗑️) of a task, THE TodoModule SHALL remove the task from the array, save to `localStorage`, re-render the list, and display a Toast with the message "Task deleted.".
10. WHEN the task array is empty, THE TodoModule SHALL render a single placeholder list item with class `todo-empty` and the text "No tasks yet. Add one above!".
11. THE TodoModule SHALL generate task IDs using `Date.now().toString(36)` concatenated with a random base-36 string.

---

### Requirement 6: Quick Links

**User Story:** As a user, I want to save and launch frequently visited websites from a persistent link grid so that I can navigate to them in one click.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE LinksModule SHALL read the link array from `localStorage` key `dashboard_links` (default: empty array) and render all links in `#links-grid`.
2. WHEN the user clicks `#link-add`, THE LinksModule SHALL trim `#link-name` and normalise `#link-url` before validation.
3. IF the site name field is empty when the user clicks `#link-add`, THEN THE LinksModule SHALL display a Toast, focus `#link-name`, and SHALL NOT add any link.
4. IF the URL field is empty after normalisation when the user clicks `#link-add`, THEN THE LinksModule SHALL display a Toast, focus `#link-url`, and SHALL NOT add any link.
5. IF the normalised URL fails `new URL()` parsing when the user clicks `#link-add`, THEN THE LinksModule SHALL display a Toast, focus `#link-url`, and SHALL NOT add any link.
6. WHEN a URL is submitted without an `http://` or `https://` protocol prefix, THE LinksModule SHALL prepend `https://` before saving.
7. WHEN a valid link is added, THE LinksModule SHALL append `{ id, name, url }` to the array, save to `localStorage`, re-render `#links-grid`, clear both input fields, return focus to `#link-name`, and display a Toast confirming the addition.
8. WHEN rendering a link, THE LinksModule SHALL display a favicon fetched from `https://www.google.com/s2/favicons?domain=HOSTNAME&sz=32`; IF the favicon image fails to load, THE LinksModule SHALL remove the image element.
9. WHEN the user clicks a rendered link, THE LinksModule SHALL open the target URL in a new browser tab with `rel="noopener noreferrer"`.
10. WHEN the user hovers over a link card, THE LinksModule SHALL reveal a delete button (×) positioned at the top-right corner of the card.
11. WHEN the user clicks the delete button of a link, THE LinksModule SHALL prevent navigation, remove the link from the array, save to `localStorage`, re-render `#links-grid`, and display a Toast with the message "Link removed.".
12. WHEN the link array is empty, THE LinksModule SHALL render a `.links-empty` placeholder with the text "No links yet. Add your favorite sites above!".

---

### Requirement 7: Toast Notifications

**User Story:** As a user, I want brief, non-blocking notifications to confirm my actions or warn me of input errors, so that I receive immediate feedback without interrupting my workflow.

#### Acceptance Criteria

1. WHEN `showToast` is called, THE Dashboard SHALL create a `.toast` element, append it to `#toast-container`, and trigger a fade-in animation via two nested `requestAnimationFrame` calls that add the `.show` class.
2. WHEN a Toast is displayed, THE Dashboard SHALL remove the `.show` class after the specified duration (default 2500 ms), wait an additional 300 ms for the CSS fade-out transition, and then remove the element from the DOM.
3. THE Dashboard SHALL render `#toast-container` as an `aria-live="polite"` region so that assistive technologies announce new Toast messages.
4. WHEN multiple Toasts are triggered in quick succession, THE Dashboard SHALL stack them vertically in `#toast-container` with an 8 px gap between each Toast.
