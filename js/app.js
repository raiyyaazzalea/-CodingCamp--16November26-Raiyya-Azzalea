/* =============================================
   LIFE DASHBOARD — app.js
   ============================================= */

'use strict';

/* ─── Utility ─────────────────────────────── */

function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function pad(n) { return String(n).padStart(2, '0'); }

function showToast(msg, duration = 2500) {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ─── Storage helpers ─────────────────────── */

const Store = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

/* ═══════════════════════════════════════════
   1. THEME
   ═══════════════════════════════════════════ */

const ThemeModule = (() => {
  const STORAGE_KEY = 'dashboard_theme';
  const root = document.documentElement;
  const btn = $('#theme-toggle');

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    btn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  }

  function init() {
    const saved = Store.get(STORAGE_KEY, 'light');
    apply(saved);

    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      Store.set(STORAGE_KEY, next);
    });
  }

  return { init };
})();

/* ═══════════════════════════════════════════
   2. GREETING (clock + date + name)
   ═══════════════════════════════════════════ */

const GreetingModule = (() => {
  const STORAGE_KEY = 'dashboard_name';
  const timeEl    = $('#greeting-time');
  const dateEl    = $('#greeting-date');
  const textEl    = $('#greeting-text');
  const nameInput = $('#name-input');
  const nameBtn   = $('#name-save');

  const GREETINGS = [
    { start:  5, end: 12, text: '🌅 Good morning' },
    { start: 12, end: 17, text: '☀️ Good afternoon' },
    { start: 17, end: 21, text: '🌆 Good evening' },
    { start: 21, end: 24, text: '🌙 Good night' },
    { start:  0, end:  5, text: '🌙 Good night' }
  ];

  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  function getGreeting(hour) {
    const g = GREETINGS.find(g => hour >= g.start && hour < g.end);
    return g ? g.text : '👋 Hello';
  }

  function tick() {
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;

    timeEl.textContent = `${pad(h12)}:${pad(m)}:${pad(s)} ${ampm}`;
    dateEl.textContent = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    const name = Store.get(STORAGE_KEY, '');
    const greeting = getGreeting(h);
    textEl.textContent = name ? `${greeting}, ${name}!` : `${greeting}!`;
  }

  function saveName() {
    const val = nameInput.value.trim();
    if (!val) { showToast('Please enter your name.'); return; }
    Store.set(STORAGE_KEY, val);
    tick();
    showToast(`Name saved as "${val}" ✓`);
  }

  function init() {
    const saved = Store.get(STORAGE_KEY, '');
    if (saved) nameInput.value = saved;

    nameBtn.addEventListener('click', saveName);
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveName(); });

    tick();
    setInterval(tick, 1000);
  }

  return { init };
})();

/* ═══════════════════════════════════════════
   3. FOCUS TIMER (Pomodoro 25 min)
   ═══════════════════════════════════════════ */

const TimerModule = (() => {
  const TOTAL      = 25 * 60;          // seconds
  const CIRCUMFERENCE = 2 * Math.PI * 70; // radius=70 → ≈ 440

  const labelEl    = $('#timer-label');
  const statusEl   = $('#timer-status');
  const progressEl = $('#timer-progress');
  const circleEl   = $('#timer-circle');
  const startBtn   = $('#timer-start');
  const stopBtn    = $('#timer-stop');
  const resetBtn   = $('#timer-reset');

  let remaining = TOTAL;
  let interval  = null;
  let running   = false;

  function formatTime(sec) {
    return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
  }

  function updateRing(sec) {
    const ratio = sec / TOTAL;
    const offset = CIRCUMFERENCE * (1 - ratio);
    progressEl.style.strokeDashoffset = offset;
  }

  function render() {
    labelEl.textContent = formatTime(remaining);
    updateRing(remaining);

    if (!running && remaining === TOTAL) {
      statusEl.textContent = 'Ready';
      circleEl.classList.remove('running', 'finished');
      startBtn.textContent = '▶ Start';
    } else if (running) {
      statusEl.textContent = 'Focus session in progress…';
      circleEl.classList.add('running');
      circleEl.classList.remove('finished');
      startBtn.textContent = '⏸ Pause';
    } else if (remaining === 0) {
      statusEl.textContent = 'Session complete! 🎉';
      circleEl.classList.add('finished');
      circleEl.classList.remove('running');
    } else {
      statusEl.textContent = 'Paused';
      circleEl.classList.remove('running', 'finished');
      startBtn.textContent = '▶ Resume';
    }
  }

  function tick() {
    if (remaining <= 0) {
      clearInterval(interval);
      interval = null;
      running  = false;
      remaining = 0;
      render();
      showToast('⏰ Focus session complete! Take a break.', 4000);
      return;
    }
    remaining--;
    render();
  }

  function start() {
    if (running) {
      // pause
      clearInterval(interval);
      interval = null;
      running  = false;
    } else {
      if (remaining <= 0) return;
      running = true;
      interval = setInterval(tick, 1000);
    }
    render();
  }

  function stop() {
    clearInterval(interval);
    interval = null;
    running  = false;
    render();
  }

  function reset() {
    clearInterval(interval);
    interval  = null;
    running   = false;
    remaining = TOTAL;
    render();
  }

  function init() {
    progressEl.style.strokeDasharray  = CIRCUMFERENCE;
    progressEl.style.strokeDashoffset = 0;

    startBtn.addEventListener('click', start);
    stopBtn.addEventListener('click',  stop);
    resetBtn.addEventListener('click', reset);

    render();
  }

  return { init };
})();

/* ═══════════════════════════════════════════
   4. TO-DO LIST
   ═══════════════════════════════════════════ */

const TodoModule = (() => {
  const STORAGE_KEY = 'dashboard_todos';
  const listEl    = $('#todo-list');
  const inputEl   = $('#todo-input');
  const addBtn    = $('#todo-add');

  let todos = [];

  function load()   { todos = Store.get(STORAGE_KEY, []); }
  function save()   { Store.set(STORAGE_KEY, todos); }
  function genId()  { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

  function addTodo() {
    const text = inputEl.value.trim();
    if (!text) { showToast('Please enter a task.'); return; }
    todos.push({ id: genId(), text, done: false });
    save();
    render();
    inputEl.value = '';
    inputEl.focus();
  }

  function toggleDone(id) {
    const t = todos.find(t => t.id === id);
    if (t) { t.done = !t.done; save(); render(); }
  }

  function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
    showToast('Task deleted.');
  }

  function startEdit(id, li) {
    const t = todos.find(t => t.id === id);
    if (!t) return;

    const textSpan = li.querySelector('.todo-text');
    const editInput = document.createElement('input');
    editInput.type  = 'text';
    editInput.className = 'todo-edit-input';
    editInput.value = t.text;

    textSpan.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    // hide edit button while editing
    const editBtn = li.querySelector('.edit-btn');
    if (editBtn) editBtn.style.display = 'none';

    function commit() {
      const val = editInput.value.trim();
      if (val) { t.text = val; save(); }
      render();
    }

    editInput.addEventListener('blur',  commit);
    editInput.addEventListener('keydown', e => {
      if (e.key === 'Enter')  { editInput.blur(); }
      if (e.key === 'Escape') { editInput.value = t.text; editInput.blur(); }
    });
  }

  function render() {
    listEl.innerHTML = '';

    if (todos.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'todo-empty';
      empty.textContent = 'No tasks yet. Add one above!';
      listEl.appendChild(empty);
      return;
    }

    todos.forEach(t => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (t.done ? ' done' : '');
      li.dataset.id = t.id;

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'todo-check';
      check.checked = t.done;
      check.addEventListener('change', () => toggleDone(t.id));

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = t.text;

      const actions = document.createElement('div');
      actions.className = 'todo-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn edit-btn';
      editBtn.title = 'Edit';
      editBtn.textContent = '✏️';
      editBtn.addEventListener('click', () => startEdit(t.id, li));

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn delete';
      delBtn.title = 'Delete';
      delBtn.textContent = '🗑️';
      delBtn.addEventListener('click', () => deleteTodo(t.id));

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      li.appendChild(check);
      li.appendChild(span);
      li.appendChild(actions);
      listEl.appendChild(li);
    });
  }

  function init() {
    load();
    render();

    addBtn.addEventListener('click', addTodo);
    inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });
  }

  return { init };
})();

/* ═══════════════════════════════════════════
   5. QUICK LINKS
   ═══════════════════════════════════════════ */

const LinksModule = (() => {
  const STORAGE_KEY  = 'dashboard_links';
  const gridEl       = $('#links-grid');
  const nameInput    = $('#link-name');
  const urlInput     = $('#link-url');
  const addBtn       = $('#link-add');

  let links = [];

  function load() { links = Store.get(STORAGE_KEY, []); }
  function save() { Store.set(STORAGE_KEY, links); }
  function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

  function normalizeUrl(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return 'https://' + trimmed;
  }

  function faviconUrl(href) {
    try {
      const url = new URL(href);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
    } catch { return ''; }
  }

  function addLink() {
    const name = nameInput.value.trim();
    const url  = normalizeUrl(urlInput.value);

    if (!name) { showToast('Please enter a site name.'); nameInput.focus(); return; }
    if (!url)  { showToast('Please enter a URL.'); urlInput.focus(); return; }

    try { new URL(url); } catch {
      showToast('Please enter a valid URL.'); urlInput.focus(); return;
    }

    links.push({ id: genId(), name, url });
    save();
    render();
    nameInput.value = '';
    urlInput.value  = '';
    nameInput.focus();
    showToast(`"${name}" added ✓`);
  }

  function deleteLink(id) {
    links = links.filter(l => l.id !== id);
    save();
    render();
    showToast('Link removed.');
  }

  function render() {
    gridEl.innerHTML = '';

    if (links.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'links-empty';
      empty.textContent = 'No links yet. Add your favorite sites above!';
      gridEl.appendChild(empty);
      return;
    }

    links.forEach(link => {
      const item = document.createElement('div');
      item.className = 'link-item';

      const a = document.createElement('a');
      a.className = 'link-btn';
      a.href   = link.url;
      a.target = '_blank';
      a.rel    = 'noopener noreferrer';

      const favicon = faviconUrl(link.url);
      if (favicon) {
        const img = document.createElement('img');
        img.src     = favicon;
        img.alt     = '';
        img.className = 'link-favicon';
        img.onerror = () => img.remove();
        a.appendChild(img);
      }

      const label = document.createElement('span');
      label.textContent = link.name;
      a.appendChild(label);

      const delBtn = document.createElement('button');
      delBtn.className = 'link-delete';
      delBtn.title = 'Remove';
      delBtn.textContent = '×';
      delBtn.addEventListener('click', e => { e.preventDefault(); deleteLink(link.id); });

      item.appendChild(a);
      item.appendChild(delBtn);
      gridEl.appendChild(item);
    });
  }

  function init() {
    load();
    render();

    addBtn.addEventListener('click', addLink);
    urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') urlInput.focus(); });
  }

  return { init };
})();

/* ─── Boot ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeModule.init();
  GreetingModule.init();
  TimerModule.init();
  TodoModule.init();
  LinksModule.init();
});
