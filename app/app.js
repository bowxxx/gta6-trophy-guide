// Vice City Platinum Roadmap: the tracker. Loads app/data/trophies.json, renders the
// checklist, saves progress in localStorage, and offers export / import / reset.
// Everything runs offline: the only fetch is the relative data file inside app/.
const STORE_KEY = 'vice-city-platinum-roadmap-v1';
const listEl = document.getElementById('list');
const countLine = document.getElementById('count-line');
const emptyEl = document.getElementById('empty');
const onlineNote = document.getElementById('online-note');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const progressGrades = document.getElementById('progress-grades');
const searchInput = document.getElementById('search');
const gradeSelect = document.getElementById('grade');
const spoilerBox = document.getElementById('spoiler');
const hideEarnedBox = document.getElementById('hide-earned');
const kindChips = document.getElementById('kind-chips');

const state = loadState();
let trophies = [];

function loadState() {
  const fallback = { earned: [], spoiler: false, hideEarned: false, kind: 'all', grade: 'all', search: '' };
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null');
    if (!raw || typeof raw !== 'object') return fallback;
    return {
      earned: Array.isArray(raw.earned) ? raw.earned : [],
      spoiler: raw.spoiler === true,
      hideEarned: raw.hideEarned === true,
      kind: typeof raw.kind === 'string' ? raw.kind : 'all',
      grade: typeof raw.grade === 'string' ? raw.grade : 'all',
      search: typeof raw.search === 'string' ? raw.search : '',
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

const earned = new Set(state.earned);

function persistEarned() {
  state.earned = [...earned];
  saveState();
}

function gradeLabel(grade) {
  return grade === 'platinum' ? 'Platinum' : grade === 'gold' ? 'Gold' : grade === 'silver' ? 'Silver' : 'Bronze';
}

function stageLabel(stage) {
  return stage === 1 ? 'Roadmap step 1: story' : stage === 2 ? 'Roadmap step 2: 100% checklist' : 'Roadmap step 3: cleanup';
}

function kindLabel(kind) {
  return kind === 'story' ? 'Story' : kind === 'collectibles' ? 'Collectibles' : kind === 'activities' ? 'Activities' : kind === 'online' ? 'Online' : kind === 'platinum' ? 'Platinum' : kind;
}

function countText(t) {
  if (t.count === null || t.count === undefined) return '';
  const unit = t.count_unit ?? '';
  return `Target: ${unit}${t.count.toLocaleString('en-US')}`;
}

function trophyVisible(t) {
  if (state.kind === 'missable') {
    if (!t.missable) return false;
  } else if (state.kind === 'online') {
    return false;
  } else if (state.kind !== 'all' && t.kind !== state.kind) {
    return false;
  }
  if (state.grade !== 'all' && t.grade !== state.grade) return false;
  if (state.hideEarned && earned.has(t.name)) return false;
  const q = state.search.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function spoilerHidden(t) {
  return state.spoiler && t.kind === 'story' && !earned.has(t.name);
}

function renderTrophy(t) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.name = t.name;
  if (earned.has(t.name)) card.classList.add('earned');
  if (t.missable) card.classList.add('missable-card');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'earn-box';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    persistEarned();
    render();
  });
  card.append(box);

  const body = document.createElement('div');
  body.className = 'card-body';

  const head = document.createElement('div');
  head.className = 'card-head';
  const nameEl = document.createElement('h3');
  nameEl.className = 'trophy-name';
  nameEl.textContent = spoilerHidden(t) ? 'Hidden story trophy' : t.name;
  head.append(nameEl);
  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = gradeLabel(t.grade);
  head.append(badge);
  body.append(head);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = spoilerHidden(t) ? 'Spoiler-safe mode is on: the name and description stay hidden until you earn this trophy.' : t.description;
  body.append(desc);

  const tags = document.createElement('p');
  tags.className = 'tags';
  const tagParts = [kindLabel(t.kind), stageLabel(t.stage)];
  if (t.hidden) tagParts.push('Hidden on PSN');
  if (t.missable) tagParts.push('Possibly missable');
  const target = countText(t);
  if (target) tagParts.push(target);
  for (const part of tagParts) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    if (part === 'Possibly missable') tag.classList.add('tag-missable');
    tag.textContent = part;
    tags.append(tag);
  }
  body.append(tags);

  if (!spoilerHidden(t)) {
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = t.guide;
    body.append(guide);

    const src = document.createElement('p');
    src.className = 'sources';
    src.textContent = 'Sources: ';
    for (const [i, s] of (t.sources ?? []).entries()) {
      if (i > 0) src.append(document.createTextNode(' · '));
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      src.append(a);
    }
    body.append(src);
  } else {
    const hint = document.createElement('p');
    hint.className = 'guide spoiler-hint';
    hint.textContent = 'Tick the box to reveal its guide — or turn spoiler-safe mode off above.';
    body.append(hint);
  }

  card.append(body);
  return card;
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `${done} of ${total} earned — ${pct}% to the platinum`;
  const byGrade = {};
  for (const t of trophies) {
    if (earned.has(t.name)) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  }
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] ?? 0) + 1;
  progressGrades.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${gradeLabel(g)} ${byGrade[g] ?? 0}/${totals[g] ?? 0}`)
    .join(' · ');
}

function render() {
  listEl.replaceChildren();
  const shown = trophies.filter(trophyVisible);
  for (const t of shown) listEl.append(renderTrophy(t));
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  countLine.textContent = `Showing ${shown.length} of ${total} trophies · ${done} earned`;
  emptyEl.hidden = shown.length !== 0 || state.kind === 'online';
  onlineNote.hidden = state.kind !== 'online';
  renderProgress();
}

function syncControls() {
  searchInput.value = state.search;
  gradeSelect.value = state.grade;
  spoilerBox.checked = state.spoiler;
  hideEarnedBox.checked = state.hideEarned;
  for (const chip of kindChips.querySelectorAll('.chip')) {
    chip.classList.toggle('active', chip.dataset.kind === state.kind);
  }
}

kindChips.addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;
  state.kind = chip.dataset.kind;
  saveState();
  syncControls();
  render();
});

gradeSelect.addEventListener('change', () => {
  state.grade = gradeSelect.value;
  saveState();
  render();
});

searchInput.addEventListener('input', () => {
  state.search = searchInput.value;
  saveState();
  render();
});

spoilerBox.addEventListener('change', () => {
  state.spoiler = spoilerBox.checked;
  saveState();
  render();
});

hideEarnedBox.addEventListener('change', () => {
  state.hideEarned = hideEarnedBox.checked;
  saveState();
  render();
});

document.getElementById('export').addEventListener('click', () => {
  const payload = { guide: 'Vice City Platinum Roadmap', exportedAt: new Date().toISOString(), earned: [...earned] };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = new Set(trophies.map((t) => t.name));
    const imported = (Array.isArray(data) ? data : data.earned ?? []).filter((n) => names.has(n));
    earned.clear();
    for (const n of imported) earned.add(n);
    persistEarned();
    render();
  } catch {
    alert('That file is not a progress export from this guide.');
  }
  event.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear every earned trophy in this tracker?')) return;
  earned.clear();
  persistEarned();
  render();
});

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
syncControls();
render();
