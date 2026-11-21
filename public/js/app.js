import {
  TYPE_COLORS,
  STAT_SHORT,
  rememberSprite,
  setSprite,
  staticSprite,
  typeBadge,
  esc,
} from './data.js';
import {LogFormatter, parseHP} from './format.js';
import {ArenaFX} from './fx.js';
import {Connection, IS_STATIC} from './net.js';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];

const FIELDS_BY_ID = new Map();
let ALL_FIELDS = [];
let spotlightFieldId = null;
let selectedGuideId = null;

let conn = null;
let connected = false;

// Token is per-tab (survives refresh for reconnects, but two tabs = two trainers).
let myToken = sessionStorage.getItem('pf_token') || '';
let myName = localStorage.getItem('pf_name') || '';
let homeDifficulty = 'normal';
let lastQuickMode = null; // {mode, fillAI} if launched via Quick Start

let currentRoom = null;
let mySeat = -1;

// Battle playback state
const formatter = new LogFormatter();
let latestState = null;
let latestRequest = null;
let visualMons = {}; // sid ('p1'..'p4') -> {species, name, level, gender, shiny, hpPct, hp, maxhp, status, fainted}
let displayedField = null;
let animQueue = [];
let draining = false;
let battleKey = '';
let endModalShownKey = '';
let pendingTargetMove = null; // {index, move} when picking target in 1v1v1v1 FFA
let megaArmed = false;
let forfeitConfirmTimer = null;
let unreadChat = 0;
let activeSideTab = 'log';

const arenaFX = new ArenaFX($('#arena-fx'));

const initialUrlParams = new URLSearchParams(window.location.search);
let pendingUrlRoom = (initialUrlParams.get('room') || '').toUpperCase().trim();

// ---------------------------------------------------------------------------
// Utilities & Toasts
// ---------------------------------------------------------------------------
function toast(text, isError = false) {
  const wrap = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' err' : '');
  el.textContent = text;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.25s ease';
    setTimeout(() => el.remove(), 260);
  }, 3600);
}

function sleep(ms) {
  const mult = Number($('#sel-speed')?.value || 1);
  return new Promise(r => setTimeout(r, Math.max(12, Math.round(ms * mult))));
}

function showScreen(name) {
  $('#screen-home').classList.toggle('hidden', name !== 'home');
  $('#screen-lobby').classList.toggle('hidden', name !== 'lobby');
  $('#screen-battle').classList.toggle('hidden', name !== 'battle');

  if (name === 'battle') {
    arenaFX.start();
    requestAnimationFrame(() => arenaFX.resize());
  } else {
    arenaFX.stop();
  }
}

function parseDetails(details = '') {
  const parts = String(details).split(',').map(s => s.trim());
  const species = parts[0] || 'Pikachu';
  let level = 100;
  let gender = '';
  let shiny = false;
  for (const p of parts.slice(1)) {
    if (/^L\d+$/.test(p)) level = Number(p.slice(1));
    else if (p === 'M' || p === 'F') gender = p;
    else if (p === 'shiny') shiny = true;
  }
  return {species, level, gender, shiny};
}

function cacheRoomSprites(room) {
  if (!room?.seats) return;
  for (const s of room.seats) {
    if (!s?.team) continue;
    for (const mon of s.team) rememberSprite(mon.species, mon.spriteid);
  }
}

function cacheBattleSprites(state) {
  if (!state?.sides) return;
  for (const side of state.sides) {
    if (side.active) rememberSprite(side.active.species, side.active.spriteid);
    for (const mon of side.team || []) rememberSprite(mon.species, mon.spriteid);
  }
}

// ---------------------------------------------------------------------------
// Field Metadata & Shared Card Renderer
// ---------------------------------------------------------------------------
async function loadFields() {
  try {
    const list = await conn.apiFields();
    ALL_FIELDS = list;
    FIELDS_BY_ID.clear();
    for (const f of list) FIELDS_BY_ID.set(f.id, f);
    FIELDS_BY_ID.set('none', {
      id: 'none',
      name: 'Plain Field',
      games: [],
      intro: 'The battlefield has returned to normal.',
      info: ['No active field modifiers — standard Pokémon Champions battle rules apply.'],
      naturePower: 'Tri Attack',
      mimicry: 'Normal',
      theme: {bg1: '#1e2736', bg2: '#0f141d', ground: 'rgba(24,32,46,0.72)', accent: '#f5a623', fx: ''},
      transforms: [],
    });

    const families = new Set(list.map(f => f.family || f.id)).size;
    $('#brand-field-count').textContent = `${families} Fields · ${list.length} States`;

    rollSpotlightField();
    renderGuideList();
  } catch (err) {
    console.error('Failed to load fields', err);
  }
}

function rollSpotlightField() {
  const pool = ALL_FIELDS.filter(f => f.random !== false);
  if (!pool.length) return;
  let pick = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length > 1 && pick.id === spotlightFieldId) {
    pick = pool[(pool.indexOf(pick) + 1) % pool.length];
  }
  spotlightFieldId = pick.id;
  $('#spotlight-games').innerHTML = (pick.games || [])
    .map(g => `<span class="game-tag ${esc(g)}">${esc(g)}</span>`)
    .join('');
  $('#spotlight-name').textContent = pick.name;
  const previewLine = pick.info?.[0] || pick.intro || '';
  $('#spotlight-desc').textContent = `${pick.intro ? `"${pick.intro}" — ` : ''}${previewLine}`;
}

function renderFieldCardHTML(f, {compact = false, overlayBase = null} = {}) {
  if (!f) return '';
  const gamesHtml = (f.games || [])
    .map(g => `<span class="game-tag ${esc(g)}">${esc(g)}</span>`)
    .join('');
  const overlayHtml = overlayBase
    ? `<div class="overlay-note">Terrain Overlay · Reverts to ${esc(overlayBase)}</div>`
    : '';
  const submeta = [];
  if (f.naturePower) submeta.push(`<span>Nature Power: <b>${esc(f.naturePower)}</b></span>`);
  if (f.mimicry) submeta.push(`<span>Camouflage / Mimicry: <b>${esc(f.mimicry)}</b></span>`);

  const infoItems = (f.info || []).map(line => `<li>${esc(line)}</li>`).join('');
  const tfItems = (f.transforms || [])
    .map(t => `<div><b>→ ${esc(t.to)}</b>: ${esc(t.trigger)}</div>`)
    .join('');

  return `
    <div class="games">${gamesHtml || '<span class="game-tag">Neutral</span>'}</div>
    <h3>${esc(f.name)}</h3>
    ${overlayHtml}
    ${f.intro ? `<p class="intro">${esc(f.intro)}</p>` : ''}
    ${!compact && submeta.length ? `<div class="field-submeta">${submeta.join('')}</div>` : ''}
    <ul class="effects">${infoItems}</ul>
    ${tfItems ? `<div class="label">Field Transitions</div><div class="transforms">${tfItems}</div>` : ''}
  `;
}

function applyFieldCardVars(el, f) {
  if (!el || !f) return;
  const th = f.theme || {};
  el.style.setProperty('--f1', th.bg1 || '#1e2736');
  el.style.setProperty('--f2', th.bg2 || '#10151f');
  el.style.setProperty('--f-accent', th.accent || '#f5a623');
}

function applyArenaFieldTheme(f) {
  if (!f) return;
  const full = FIELDS_BY_ID.get(f.id) || f;
  const th = full.theme || f.theme || {};
  const root = document.documentElement;
  root.style.setProperty('--field1', th.bg1 || '#1e2736');
  root.style.setProperty('--field2', th.bg2 || '#0f141d');
  root.style.setProperty('--field-ground', th.ground || 'rgba(24, 32, 46, 0.72)');
  root.style.setProperty('--field-accent', th.accent || '#f5a623');
  arenaFX.setField(th.fx || '', th.accent || '#f5a623');

  displayedField = {...full, ...f};
  $('#field-pill').textContent = f.overlay && f.overlayBase
    ? `${full.name} (on ${f.overlayBase})`
    : full.name;

  const mini = $('#field-mini');
  mini.innerHTML = renderFieldCardHTML(displayedField, {
    compact: true,
    overlayBase: f.overlay ? f.overlayBase : null,
  });
}

// ---------------------------------------------------------------------------
// Field Guide Modal
// ---------------------------------------------------------------------------
function openGuide(fieldId = null) {
  $('#modal-guide').classList.remove('hidden');
  if (fieldId && FIELDS_BY_ID.has(fieldId) && fieldId !== 'none') {
    selectedGuideId = fieldId;
    $('#guide-search').value = '';
    $('#guide-filter').value = 'all';
  } else if (!selectedGuideId && ALL_FIELDS.length) {
    selectedGuideId = ALL_FIELDS[0].id;
  }
  renderGuideList();
}

function renderGuideList() {
  const q = ($('#guide-search').value || '').trim().toLowerCase();
  const game = $('#guide-filter').value || 'all';
  const listEl = $('#guide-list');

  const filtered = ALL_FIELDS.filter(f => {
    if (game !== 'all' && !(f.games || []).includes(game)) return false;
    if (!q) return true;
    const hay = [
      f.name,
      f.intro,
      f.naturePower,
      f.mimicry,
      ...(f.info || []),
      ...(f.transforms || []).map(t => `${t.to} ${t.trigger}`),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });

  if (filtered.length && !filtered.some(f => f.id === selectedGuideId)) {
    selectedGuideId = filtered[0].id;
  }

  listEl.innerHTML = '';
  if (!filtered.length) {
    listEl.innerHTML = '<div style="padding:12px;color:var(--text-secondary);font-size:0.85rem;">No matching fields found.</div>';
    $('#guide-detail').innerHTML = '';
    return;
  }

  for (const f of filtered) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'guide-item' + (f.id === selectedGuideId ? ' on' : '');
    const dots = (f.games || [])
      .map(g => `<i class="dot-${esc(g)}" title="${esc(g)}"></i>`)
      .join('');
    btn.innerHTML = `<span>${esc(f.name)}</span><span class="dots">${dots}</span>`;
    btn.addEventListener('click', () => {
      selectedGuideId = f.id;
      renderGuideList();
    });
    listEl.appendChild(btn);
  }

  const chosen = FIELDS_BY_ID.get(selectedGuideId) || filtered[0];
  if (chosen) {
    const detail = $('#guide-detail');
    detail.innerHTML = `<div class="field-card" id="guide-field-card">${renderFieldCardHTML(chosen)}</div>`;
    applyFieldCardVars($('#guide-field-card'), chosen);
  }
}

// ---------------------------------------------------------------------------
// Connection (WebSocket server, or in-browser engine + peer-to-peer)
// ---------------------------------------------------------------------------
conn = new Connection(
  msg => onServerMessage(msg),
  status => {
    if (!status.online) connected = false;
    $('#name-chip').classList.toggle('online', !!status.online);
  },
  () => {
    const hello = {
      t: 'hello',
      token: myToken,
      name: myName || $('#input-name').value.trim(),
      room: pendingUrlRoom || currentRoom?.code || undefined,
    };
    if (IS_STATIC) pendingUrlRoom = '';
    return hello;
  },
);

function send(msg) {
  conn.send(msg);
}

function onServerMessage(msg) {
  switch (msg.t) {
  case 'welcome': {
    connected = true;
    myToken = msg.token;
    myName = msg.name;
    sessionStorage.setItem('pf_token', myToken);
    localStorage.setItem('pf_name', myName);
    $('#name-display').textContent = myName;
    $('#name-chip').classList.add('online');
    if (document.activeElement !== $('#input-name')) {
      $('#input-name').value = myName;
    }
    if (pendingUrlRoom && !IS_STATIC) {
      const code = pendingUrlRoom;
      pendingUrlRoom = '';
      // Wait briefly in case hello already re-bound us to our seat
      setTimeout(() => {
        if (!currentRoom || currentRoom.code !== code) {
          send({t: 'join', code});
        }
      }, 40);
    }
    break;
  }
  case 'room':
    onRoomUpdate(msg.room);
    break;
  case 'battle':
    onBattleUpdate(msg);
    break;
  case 'chat':
    appendChatLine(msg.msg);
    break;
  case 'left':
    resetToHome();
    break;
  case 'kicked':
    toast('You were removed from the room.', true);
    resetToHome();
    break;
  case 'error':
    toast(msg.msg || 'Action could not be completed.', true);
    break;
  default:
    break;
  }
}

function resetToHome() {
  currentRoom = null;
  latestState = null;
  latestRequest = null;
  animQueue = [];
  pendingTargetMove = null;
  $('#modal-end').classList.add('hidden');
  if (window.location.search) {
    window.history.replaceState({}, '', window.location.pathname);
  }
  showScreen('home');
}

// ---------------------------------------------------------------------------
// Lobby Rendering
// ---------------------------------------------------------------------------
function onRoomUpdate(room) {
  currentRoom = room;
  mySeat = room.you;
  cacheRoomSprites(room);

  // Update URL bar cleanly for PvP / FFA rooms so copying address bar also works
  if (room.mode !== 'ai') {
    const targetUrl = `${window.location.pathname}?room=${room.code}`;
    if (window.location.search !== `?room=${room.code}`) {
      window.history.replaceState({}, '', targetUrl);
    }
  }

  if (room.status === 'lobby') {
    $('#modal-end').classList.add('hidden');
    renderLobby(room);
    showScreen('lobby');
  } else if (room.status === 'battle') {
    renderChatHistory(room.chat || [], '#battle-chat');
    showScreen('battle');
  } else if (room.status === 'ended') {
    // Keep battle screen visible; room.winner is reflected in end modal once queue finishes
    renderChatHistory(room.chat || [], '#battle-chat');
  }
}

function populateFieldSelect(selectEl, fieldList, currentChoice) {
  const prevLen = selectEl.options.length;
  if (prevLen <= 1 && fieldList?.length) {
    selectEl.innerHTML = '';
    const randOpt = document.createElement('option');
    randOpt.value = 'random';
    randOpt.textContent = 'Random Field (from pool)';
    selectEl.appendChild(randOpt);

    const groups = {
      Reborn: document.createElement('optgroup'),
      Rejuvenation: document.createElement('optgroup'),
      Desolation: document.createElement('optgroup'),
      Stages: document.createElement('optgroup'),
    };
    groups.Reborn.label = 'Pokémon Reborn';
    groups.Rejuvenation.label = 'Pokémon Rejuvenation Exclusive';
    groups.Desolation.label = 'Pokémon Desolation Exclusive';
    groups.Stages.label = 'Multi-Stage & Transformed States';

    for (const f of fieldList) {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      if (!f.random) groups.Stages.appendChild(opt);
      else if (f.games.includes('Reborn')) groups.Reborn.appendChild(opt);
      else if (f.games.includes('Rejuvenation')) groups.Rejuvenation.appendChild(opt);
      else groups.Desolation.appendChild(opt);
    }
    for (const g of Object.values(groups)) {
      if (g.children.length) selectEl.appendChild(g);
    }
  }
  selectEl.value = currentChoice || 'random';
}

function renderMonTooltipHTML(mon) {
  const types = (mon.types || []).map(typeBadge).join(' ');
  const metaParts = [];
  if (mon.ability) metaParts.push(`Ability: <b>${esc(mon.ability)}</b>`);
  if (mon.item) metaParts.push(`Item: <b>${esc(mon.item)}</b>`);
  const movesHtml = (mon.moves || [])
    .map(m => {
      const right = m.pp !== undefined
        ? `<span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-secondary)">${m.pp}/${m.maxpp}</span>`
        : `${typeBadge(m.type)}`;
      return `<div class="mv"><span>${esc(m.name)}</span>${right}</div>`;
    })
    .join('');

  return `
    <div class="mon-tip">
      <div class="tip-head">
        <span>${esc(mon.species || mon.name)} <small style="color:var(--text-secondary)">Lv.${mon.level || 100}</small></span>
        <span>${types}</span>
      </div>
      ${metaParts.length ? `<div class="tip-meta">${metaParts.join(' · ')}</div>` : ''}
      ${movesHtml || '<div style="color:var(--text-secondary);font-size:0.74rem;">Hidden team sheet</div>'}
    </div>
  `;
}

function renderLobby(room) {
  const modeLabels = {
    ai: 'Solo 6v6 · VS AI Trainer',
    pvp: 'Online 6v6 · Head-to-Head',
    ffa: '1v1v1v1 · Four-Trainer Free-For-All',
  };
  $('#lobby-mode').textContent = modeLabels[room.mode] || 'Match Staging';
  $('#lobby-code').textContent = room.code;

  const fieldCard = $('#lobby-field');
  const fullField = FIELDS_BY_ID.get(room.field?.id) || room.field;
  fieldCard.innerHTML = renderFieldCardHTML(fullField);
  applyFieldCardVars(fieldCard, fullField);

  populateFieldSelect($('#sel-field'), room.fieldList, room.fieldChoice);
  $('#sel-filter').value = room.fieldFilter || 'all';
  $('#row-filter').classList.toggle('hidden', room.fieldChoice !== 'random');
  $('#chk-open').checked = !!room.openSheets;

  const hasAISeats = room.mode === 'ai' || room.mode === 'ffa' || room.seats.some(s => s?.isAI);
  $('#row-difficulty').classList.toggle('hidden', !hasAISeats);
  $$('#seg-lobby-difficulty button').forEach(b => {
    b.classList.toggle('on', b.dataset.v === room.difficulty);
    b.disabled = !room.isHost;
  });

  // Enable/disable host controls
  $('#sel-field').disabled = !room.isHost;
  $('#sel-filter').disabled = !room.isHost;
  $('#chk-open').disabled = !room.isHost;
  $('#btn-reroll-field').disabled = !room.isHost;
  $('#btn-reroll-teams').disabled = !room.isHost;
  $('#btn-reroll-mine').disabled = room.you < 0;

  const startBtn = $('#btn-start');
  if (!room.isHost) {
    startBtn.disabled = true;
    startBtn.textContent = 'Waiting for Host…';
  } else if (room.mode === 'pvp' && room.seats.some(s => !s)) {
    startBtn.disabled = true;
    startBtn.textContent = 'Waiting for Opponent…';
  } else {
    startBtn.disabled = false;
    startBtn.textContent = room.mode === 'ffa' && room.seats.some(s => !s)
      ? 'Start FFA (Auto-Fill AI)'
      : 'Launch Battle';
  }

  // Seats
  const seatsEl = $('#lobby-seats');
  seatsEl.innerHTML = '';
  room.seats.forEach((seat, idx) => {
    const card = document.createElement('div');
    if (!seat) {
      card.className = 'seat empty';
      card.innerHTML = `
        <div>Corner ${idx + 1} · Open Seat</div>
        <div style="font-size:0.8rem;">Share code <b style="color:var(--accent-amber);font-family:var(--font-mono)">${esc(room.code)}</b> to invite a friend</div>
        ${room.isHost && room.mode !== 'ai' ? `<button type="button" class="ghost small" data-add-ai="${idx}">+ Add AI Trainer</button>` : ''}
      `;
    } else {
      const isYou = idx === room.you;
      card.className = 'seat' + (isYou ? ' you' : '');
      const badges = [];
      if (isYou) badges.push('<span class="badge you-tag">You</span>');
      if (seat.isHost) badges.push('<span class="badge host">Host</span>');
      if (seat.isAI) badges.push('<span class="badge ai">AI</span>');
      if (!seat.connected) badges.push('<span class="badge off">Offline</span>');
      const canKick = room.isHost && !seat.isHost && room.mode !== 'ai';

      card.innerHTML = `
        <div class="seat-head">
          <div class="seat-name">
            <span>${esc(seat.name)}</span>
          </div>
          <div class="seat-badges">
            ${badges.join('')}
            ${canKick ? `<button type="button" class="ghost small danger" data-kick="${idx}" style="padding:2px 7px;font-size:0.7rem;">Remove</button>` : ''}
          </div>
        </div>
        <div class="team-grid"></div>
      `;
      const grid = card.querySelector('.team-grid');
      for (const mon of seat.team || []) {
        const mc = document.createElement('div');
        mc.className = 'mon-card';
        mc.innerHTML = `
          <img alt="${esc(mon.species)}">
          <div class="nm">${esc(mon.species)}</div>
          <div class="types">${(mon.types || []).map(typeBadge).join('')}</div>
          ${renderMonTooltipHTML(mon)}
        `;
        staticSprite(mc.querySelector('img'), mon.species);
        grid.appendChild(mc);
      }
    }
    seatsEl.appendChild(card);
  });

  seatsEl.querySelectorAll('[data-add-ai]').forEach(btn => {
    btn.addEventListener('click', () => send({t: 'addAI', seat: Number(btn.dataset.addAi)}));
  });
  seatsEl.querySelectorAll('[data-kick]').forEach(btn => {
    btn.addEventListener('click', () => send({t: 'kick', seat: Number(btn.dataset.kick)}));
  });

  renderChatHistory(room.chat || [], '#lobby-chat');
}

function renderChatHistory(list, selector) {
  const el = $(selector);
  if (!el) return;
  el.innerHTML = '';
  for (const m of list) {
    el.appendChild(buildChatRow(m));
  }
  el.scrollTop = el.scrollHeight;
}

function buildChatRow(m) {
  const div = document.createElement('div');
  if (!m.from) {
    div.className = 'sys';
    div.textContent = m.text;
  } else {
    div.innerHTML = `<b>${esc(m.from)}:</b> ${esc(m.text)}`;
  }
  return div;
}

function appendChatLine(m) {
  if (currentRoom) {
    currentRoom.chat = currentRoom.chat || [];
    currentRoom.chat.push(m);
  }
  for (const sel of ['#lobby-chat', '#battle-chat']) {
    const el = $(sel);
    if (!el) continue;
    el.appendChild(buildChatRow(m));
    el.scrollTop = el.scrollHeight;
  }
  if (!$('#screen-battle').classList.contains('hidden') && activeSideTab !== 'chat' && m.from) {
    unreadChat++;
    $('#tab-btn-chat').textContent = `Chat (${unreadChat})`;
  }
}

// ---------------------------------------------------------------------------
// Battle Update, Arena Slots & Animation Playback Engine
// ---------------------------------------------------------------------------
function slotLayoutFor(totalSides, seatIdx, viewerSeat) {
  const base = viewerSeat >= 0 ? viewerSeat : 0;
  if (totalSides <= 2) {
    const isSelf = seatIdx === base;
    return {
      cls: isSelf ? 'slot s2-self back' : 'slot s2-foe',
      back: isSelf,
    };
  }
  const rel = (seatIdx - base + 4) % 4;
  const map = [
    {cls: 'slot ffa-bl back', back: true},
    {cls: 'slot ffa-tl', back: false},
    {cls: 'slot ffa-tr', back: false},
    {cls: 'slot ffa-br', back: false},
  ];
  return map[rel];
}

function onBattleUpdate(msg) {
  mySeat = msg.you;
  latestState = msg.state;
  latestRequest = msg.request;
  pendingTargetMove = null;
  cacheBattleSprites(msg.state);

  formatter.you = mySeat;
  formatter.ffa = msg.state.gameType === 'freeforall';
  for (const s of msg.state.sides) {
    formatter.sideNames[s.sid] = s.name;
  }

  const thisKey = `${currentRoom?.code || 'local'}`;
  const isFreshBattle = msg.reset || battleKey !== thisKey;
  if (isFreshBattle) {
    battleKey = thisKey;
    animQueue = [];
    visualMons = {};
    $('#battle-log').innerHTML = '';
    $('#slots').innerHTML = '';
    megaArmed = false;
  }

  showScreen('battle');

  if (msg.reset) {
    // Fast-forward full log on reconnect/resync without animation delays
    for (const raw of msg.log || []) {
      const f = formatter.format(raw);
      if (f.ev?.type === 'rfield') {
        const rf = FIELDS_BY_ID.get(f.ev.id);
        if (rf) appendBattleLog(`Field Effect: ${esc(rf.name)}`, 'fieldchg');
      }
      if (f.html) appendBattleLog(f.html, f.cls);
    }
    syncVisualFromLatest();
    renderControls();
    maybeShowEndModal();
    return;
  }

  // Enqueue incremental protocol lines for animated playback
  const items = [];
  for (const raw of msg.log || []) {
    const f = formatter.format(raw);
    if (f.html || f.ev) items.push(f);
  }

  if (!items.length) {
    if (!draining) {
      syncVisualFromLatest();
      renderControls();
      maybeShowEndModal();
    }
    return;
  }

  animQueue.push(...items);
  if (!draining) {
    // Ensure initial slot containers exist before playing turn events
    ensureSlotElements();
    renderControlsWaiting('Resolving turn…');
    drainQueue();
  }
}

function appendBattleLog(html, cls = '') {
  const logEl = $('#battle-log');
  const div = document.createElement('div');
  if (cls) div.className = cls;
  div.innerHTML = html;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

function flashArenaBanner(title, subtitle = '') {
  const banner = $('#field-banner');
  banner.innerHTML = `${esc(title)}${subtitle ? `<small>${esc(subtitle)}</small>` : ''}`;
  banner.classList.add('show');
  clearTimeout(banner._t);
  banner._t = setTimeout(() => banner.classList.remove('show'), 2100);
}

let msgTimer = null;
function showArenaMessage(text, duration = 1700) {
  const el = $('#arena-message');
  if (!text) {
    el.classList.remove('show');
    return;
  }
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => el.classList.remove('show'), duration);
}

function triggerSpriteAnim(sid, cls) {
  const img = $(`#slot-${sid} .sprite`);
  if (!img) return;
  img.classList.remove(cls);
  void img.offsetWidth;
  img.classList.add(cls);
  setTimeout(() => img.classList.remove(cls), 750);
}

function shakeArena(flashColor = null) {
  const arena = $('#arena');
  arena.classList.remove('shake');
  void arena.offsetWidth;
  arena.classList.add('shake');
  if (flashColor) {
    const fl = $('#arena-flash');
    fl.style.setProperty('--flash', flashColor);
    fl.classList.remove('go');
    void fl.offsetWidth;
    fl.classList.add('go');
  }
}

async function drainQueue() {
  draining = true;
  try {
    while (animQueue.length > 0) {
      const item = animQueue.shift();
      const ev = item.ev;

      if (ev?.type === 'rfield') {
        const fInfo = FIELDS_BY_ID.get(ev.id) || latestState?.field;
        if (fInfo) {
          applyArenaFieldTheme({
            ...fInfo,
            overlay: ev.overlay,
            overlayBase: ev.overlay ? latestState?.field?.overlayBase : null,
          });
          appendBattleLog(`◆ Field Active: <b>${esc(fInfo.name)}</b>`, 'fieldchg');
          flashArenaBanner(fInfo.name, fInfo.intro || '');
          arenaFX.burst(fInfo.theme?.accent || '#f5a623', 28);
          await sleep(650);
        }
        continue;
      }

      if (item.html) appendBattleLog(item.html, item.cls);
      if (!ev) continue;

      switch (ev.type) {
      case 'turn':
        $('#turn-pill').textContent = `Turn ${ev.turn}`;
        await sleep(180);
        break;

      case 'switch': {
        const sid = ev.sid;
        const parsed = parseDetails(ev.details);
        const hpInfo = parseHP(ev.hp) || {pct: 100, status: ''};
        visualMons[sid] = {
          species: parsed.species,
          name: formatter.monName(ev.ident) || parsed.species,
          level: parsed.level,
          gender: parsed.gender,
          shiny: parsed.shiny,
          hpPct: hpInfo.pct,
          hp: hpInfo.cur,
          maxhp: hpInfo.max,
          status: hpInfo.status || '',
          fainted: !!hpInfo.fainted,
        };
        renderSingleSlot(sid);
        triggerSpriteAnim(sid, 'anim-in');
        await sleep(360);
        break;
      }

      case 'forme': {
        const sid = formatter.sideOf(ev.ident);
        const parsed = parseDetails(ev.details);
        if (visualMons[sid]) {
          visualMons[sid].species = parsed.species;
          renderSingleSlot(sid);
        }
        break;
      }

      case 'mega': {
        const sid = formatter.sideOf(ev.ident);
        triggerSpriteAnim(sid, 'anim-mega');
        arenaFX.burst('#f5a623', 26);
        await sleep(520);
        break;
      }

      case 'move': {
        const sid = formatter.sideOf(ev.ident);
        const actor = formatter.pk(ev.ident, true);
        showArenaMessage(`${actor} used ${ev.move}!`, 1300);
        if (!ev.still) {
          triggerSpriteAnim(sid, 'anim-lunge-up');
        }
        await sleep(380);
        break;
      }

      case 'crit':
      case 'se':
        shakeArena(ev.type === 'crit' ? '#f5a623' : '#ffffff');
        await sleep(160);
        break;

      case 'damage': {
        const sid = formatter.sideOf(ev.ident);
        const hpInfo = parseHP(ev.hp);
        if (visualMons[sid] && hpInfo) {
          visualMons[sid].hpPct = hpInfo.pct;
          if (hpInfo.cur !== undefined) visualMons[sid].hp = hpInfo.cur;
          if (hpInfo.max !== undefined) visualMons[sid].maxhp = hpInfo.max;
          visualMons[sid].status = hpInfo.status ?? visualMons[sid].status;
          renderSingleSlot(sid);
        }
        if (!ev.silent) {
          triggerSpriteAnim(sid, 'anim-hit');
          arenaFX.burst('#ea5b3d', 14);
          await sleep(320);
        }
        break;
      }

      case 'heal': {
        const sid = formatter.sideOf(ev.ident);
        const hpInfo = parseHP(ev.hp);
        if (visualMons[sid] && hpInfo) {
          visualMons[sid].hpPct = hpInfo.pct;
          if (hpInfo.cur !== undefined) visualMons[sid].hp = hpInfo.cur;
          if (hpInfo.max !== undefined) visualMons[sid].maxhp = hpInfo.max;
          renderSingleSlot(sid);
        }
        triggerSpriteAnim(sid, 'anim-heal');
        await sleep(260);
        break;
      }

      case 'status': {
        const sid = formatter.sideOf(ev.ident);
        if (visualMons[sid]) {
          visualMons[sid].status = ev.status || '';
          renderSingleSlot(sid);
        }
        await sleep(180);
        break;
      }

      case 'boost':
      case 'unboost': {
        const sid = formatter.sideOf(ev.ident);
        triggerSpriteAnim(sid, ev.type === 'boost' ? 'anim-stat-up' : 'anim-stat-down');
        await sleep(220);
        break;
      }

      case 'faint': {
        const sid = formatter.sideOf(ev.ident);
        if (visualMons[sid]) {
          visualMons[sid].hpPct = 0;
          visualMons[sid].hp = 0;
          visualMons[sid].fainted = true;
          renderSingleSlot(sid);
        }
        triggerSpriteAnim(sid, 'anim-faint');
        await sleep(500);
        break;
      }

      case 'weather':
        arenaFX.setWeather(ev.weather);
        await sleep(200);
        break;

      case 'message':
        showArenaMessage(ev.text, 1900);
        await sleep(280);
        break;

      default:
        break;
      }
    }
  } finally {
    draining = false;
    syncVisualFromLatest();
    renderControls();
    maybeShowEndModal();
  }
}

function ensureSlotElements() {
  if (!latestState) return;
  const wrap = $('#slots');
  const count = latestState.sides.length;
  for (const side of latestState.sides) {
    let el = $(`#slot-${side.sid}`);
    const layout = slotLayoutFor(count, side.seat, mySeat);
    if (!el) {
      el = document.createElement('div');
      el.id = `slot-${side.sid}`;
      el.dataset.seat = String(side.seat);
      el.innerHTML = `
        <div class="sprite-wrap">
          <div class="shadow"></div>
          <img class="sprite" alt="">
        </div>
        <div class="hpbox"></div>
      `;
      el.addEventListener('click', () => {
        if (pendingTargetMove !== null && el.classList.contains('target-able')) {
          submitMoveWithTarget(pendingTargetMove.index, side.seat);
        }
      });
      wrap.appendChild(el);
    }
    el.className = layout.cls;
    el.dataset.back = layout.back ? '1' : '0';
  }
}

function syncVisualFromLatest() {
  if (!latestState) return;
  $('#turn-pill').textContent = `Turn ${Math.max(1, latestState.turn || 1)}`;
  applyArenaFieldTheme(latestState.field);
  arenaFX.setWeather(latestState.weather?.id || '');

  // Top condition pills (weather, terrain if distinct, Trick Room / Gravity / etc.)
  const pills = [];
  if (latestState.weather) {
    const t = latestState.weather.turns ? ` (${latestState.weather.turns}t)` : '';
    pills.push(`<span>${esc(latestState.weather.name)}${t}</span>`);
  }
  for (const pw of latestState.pseudo || []) {
    pills.push(`<span>${esc(pw)}</span>`);
  }
  $('#cond-pills').innerHTML = pills.join('');

  ensureSlotElements();
  for (const side of latestState.sides) {
    if (side.active) {
      visualMons[side.sid] = {...side.active};
    } else {
      visualMons[side.sid] = null;
    }
    renderSingleSlot(side.sid, side);
  }

  renderTeamDetailTab();
  updateForfeitButton();
}

function renderSingleSlot(sid, authoritativeSide = null) {
  const el = $(`#slot-${sid}`);
  if (!el || !latestState) return;
  const side = authoritativeSide || latestState.sides.find(s => s.sid === sid);
  if (!side) return;

  const mon = visualMons[sid];
  const img = el.querySelector('.sprite');
  const hpbox = el.querySelector('.hpbox');
  const back = el.dataset.back === '1';

  el.classList.toggle('out', side.pokemonLeft <= 0 && (!mon || mon.fainted));

  if (!mon || mon.fainted) {
    img.style.opacity = '0';
    img.dataset.spriteKey = '';
  } else {
    img.style.opacity = '1';
    const key = `${mon.species}|${back}|${!!mon.shiny}`;
    if (img.dataset.spriteKey !== key) {
      img.dataset.spriteKey = key;
      setSprite(img, mon.species, {back, shiny: !!mon.shiny});
    }
  }

  const balls = (side.team || [])
    .map(p => {
      if (p.fainted) return '<i class="fnt" title="Fainted"></i>';
      if (p.status) return `<i class="st" title="${esc(p.species)} (${esc(p.status.toUpperCase())})"></i>`;
      return `<i title="${esc(p.species)}"></i>`;
    })
    .join('');

  if (!mon) {
    hpbox.className = 'hpbox' + (side.isYou ? ' you' : '');
    hpbox.innerHTML = `
      <div class="owner-row">
        <span class="owner">${esc(side.name)}</span>
      </div>
      <div style="font-size:0.8rem;color:var(--text-secondary);">Eliminated</div>
      <div class="pokeballs">${balls}</div>
    `;
    return;
  }

  const pct = Math.max(0, Math.min(100, mon.hpPct ?? 100));
  const barCls = pct <= 22 ? 'low' : pct <= 52 ? 'mid' : '';
  const hpLabel = mon.hp !== undefined && mon.maxhp
    ? `${mon.hp}/${mon.maxhp}`
    : `${pct}%`;

  const metaTags = [];
  if (mon.status) {
    metaTags.push(`<span class="st ${esc(mon.status)}">${esc(mon.status)}</span>`);
  }
  const boosts = (!draining && side.active?.boosts) || mon.boosts || {};
  for (const [st, val] of Object.entries(boosts)) {
    if (!val) continue;
    const mult = val > 0 ? `+${val}` : `${val}`;
    metaTags.push(`<span class="bst ${val < 0 ? 'neg' : ''}">${STAT_SHORT[st] || st} ${mult}</span>`);
  }
  const vols = (!draining && side.active?.volatiles) || mon.volatiles || [];
  for (const v of vols) {
    metaTags.push(`<span class="vol">${esc(v)}</span>`);
  }
  if (!draining) {
    for (const sc of side.conditions || []) {
      metaTags.push(`<span class="vol">${esc(sc)}</span>`);
    }
  }

  const genderMark = mon.gender === 'M' ? ' ♂' : mon.gender === 'F' ? ' ♀' : '';
  const readyMark = !draining && !latestState.ended && side.choiceDone && !side.isYou && !side.isAI
    ? '<span class="wait-dot">READY</span>'
    : '';

  hpbox.className = 'hpbox' + (side.isYou ? ' you' : '');
  hpbox.innerHTML = `
    <div class="owner-row">
      <span class="owner">${esc(side.name)}${side.isYou ? ' · YOU' : ''}</span>
      ${readyMark}
    </div>
    <div class="top">
      <span class="nm">${esc(mon.name || mon.species)}${genderMark}</span>
      <span class="lv">Lv.${mon.level || 100}</span>
    </div>
    <div class="hpbar"><i class="${barCls}" style="width:${pct}%"></i></div>
    <div class="meta">
      ${metaTags.join('')}
      <span class="hpnum">${hpLabel}</span>
    </div>
    <div class="pokeballs">${balls}</div>
  `;
}

// ---------------------------------------------------------------------------
// Tactical Command Deck (#controls) & 1v1v1v1 Target Selection
// ---------------------------------------------------------------------------
function clearTargetHighlights() {
  $$('#slots .slot').forEach(el => el.classList.remove('target-able'));
}

function aliveOpponentSides() {
  if (!latestState) return [];
  return latestState.sides.filter(s => s.seat !== mySeat && s.pokemonLeft > 0 && s.active && !s.active.fainted);
}

function moveNeedsFFATarget(m) {
  if (!latestState || latestState.gameType !== 'freeforall') return false;
  const tgt = m.target || m.moveTarget || 'normal';
  return ['normal', 'any', 'adjacentFoe'].includes(tgt);
}

function submitMoveWithTarget(moveIndex, targetSeat = null) {
  const mega = megaArmed;
  megaArmed = false;
  pendingTargetMove = null;
  clearTargetHighlights();
  const choice = {kind: 'move', index: moveIndex, mega};
  if (targetSeat !== null && targetSeat !== undefined) choice.target = targetSeat;
  send({t: 'choose', choice});
  renderControlsWaiting('Waiting for other trainers…', true);
}

function renderControlsWaiting(text, allowUndo = false) {
  clearTargetHighlights();
  const el = $('#controls');
  el.innerHTML = `
    <div class="waiting">
      <div class="spinner"></div>
      <span>${esc(text)}</span>
      ${allowUndo ? '<button type="button" class="ghost small" id="btn-undo-choice">Cancel / Undo</button>' : ''}
    </div>
  `;
  $('#btn-undo-choice')?.addEventListener('click', () => {
    send({t: 'choose', choice: {kind: 'undo'}});
  });
}

function renderControls() {
  clearTargetHighlights();
  const el = $('#controls');
  if (!latestState) {
    el.innerHTML = '';
    return;
  }

  if (latestState.ended) {
    const winnerText = latestState.winner ? `${latestState.winner} won the battle!` : 'The battle ended!';
    el.innerHTML = `
      <div class="prompt">
        <h4>${esc(winnerText)}</h4>
        <div class="btn-row">
          <button type="button" class="primary" id="btn-ctrl-rematch">Play Again</button>
          <button type="button" class="ghost" id="btn-ctrl-home">Return Home</button>
        </div>
      </div>
    `;
    $('#btn-ctrl-rematch')?.addEventListener('click', handlePlayAgain);
    $('#btn-ctrl-home')?.addEventListener('click', () => send({t: 'leave'}));
    return;
  }

  if (mySeat < 0) {
    el.innerHTML = '<div class="waiting"><span>Spectating live match</span></div>';
    return;
  }

  const mySide = latestState.sides[mySeat];
  if (mySide && mySide.pokemonLeft <= 0) {
    el.innerHTML = '<div class="waiting"><span>Your team has been eliminated — watching remaining trainers battle!</span></div>';
    return;
  }

  const req = latestRequest;
  if (!req || req.wait) {
    const canUndo = mySide?.choiceDone;
    renderControlsWaiting('Waiting for other trainers…', canUndo);
    return;
  }

  const forceSwitch = Array.isArray(req.forceSwitch) && req.forceSwitch.some(Boolean);
  const activeReq = req.active?.[0];
  const activeMon = mySide?.active;
  const canMega = !!activeReq?.canMegaEvo;
  if (!canMega) megaArmed = false;

  let html = '<div class="prompt">';
  if (forceSwitch) {
    html += `<h4>Choose the next Pokémon to send in</h4>`;
  } else {
    html += `<h4>What will ${esc(activeMon?.name || activeMon?.species || 'your Pokémon')} do?</h4>`;
  }
  if (canMega && !forceSwitch) {
    html += `
      <button type="button" class="mega-toggle ${megaArmed ? 'on' : ''}" id="btn-mega-toggle">
        <span>◆ MEGA EVOLVE</span>
      </button>
    `;
  }
  html += '</div>';

  // FFA Target Selection Bar (when a single-target move is armed)
  if (pendingTargetMove !== null && !forceSwitch) {
    const foes = aliveOpponentSides();
    const targetBtns = foes
      .map(f => {
        const mon = f.active;
        return `<button type="button" class="target-btn" data-target-seat="${f.seat}">${esc(f.name)}: ${esc(mon.species)} (${mon.hpPct}%)</button>`;
      })
      .join('');
    html += `
      <div class="target-bar">
        <span class="target-label">TARGET FOR ${esc(pendingTargetMove.move.name.toUpperCase())}:</span>
        ${targetBtns}
        <button type="button" class="ghost small" id="btn-cancel-target" style="margin-left:auto;">Cancel</button>
      </div>
    `;
  }

  // Moves Grid
  if (!forceSwitch && activeReq?.moves) {
    html += '<div class="moves">';
    activeReq.moves.forEach((m, idx) => {
      const effType = m.field?.type || m.type || 'Normal';
      const color = TYPE_COLORS[effType] || '#687082';
      const disabled = !!m.disabled || m.pp === 0;
      const selected = pendingTargetMove?.index === idx;

      const fxBadges = [];
      if (m.field?.fails) {
        fxBadges.push('<span class="fxb fail">FAILS</span>');
      } else {
        if (m.field?.mult && m.field.mult > 1) fxBadges.push(`<span class="fxb up">${m.field.mult}×</span>`);
        if (m.field?.mult && m.field.mult < 1) fxBadges.push(`<span class="fxb down">${m.field.mult}×</span>`);
        if (m.field?.adds?.length) {
          for (const a of m.field.adds) fxBadges.push(`<span class="fxb add">+${esc(a)}</span>`);
        }
        if (m.field?.transforms) {
          fxBadges.push(`<span class="fxb tf">→ ${esc(m.field.transforms)}</span>`);
        }
      }

      const typeChangedNote = m.field?.type && m.field.type !== m.type
        ? ` (was ${esc(m.type)})`
        : '';
      const bpLabel = m.category === 'Status' ? 'Status' : `${m.basePower || '—'} BP · ${m.category}`;
      const accLabel = m.accuracy === true ? '—' : `${m.accuracy}%`;

      html += `
        <button type="button" class="move-btn ${selected ? 'selected' : ''}" data-move-idx="${idx}" style="--tc:${color}" ${disabled ? 'disabled' : ''}>
          <span class="mn">${esc(m.name || m.move)}</span>
          <span class="ms">
            <span>${esc(effType)}</span>
            <span>·</span>
            <span>PP ${m.pp ?? '—'}/${m.maxpp ?? '—'}</span>
          </span>
          <div class="fx">${fxBadges.join('')}</div>
          <div class="move-tip">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <b>${esc(m.name || m.move)}</b>
              <span>${typeBadge(effType)}</span>
            </div>
            <div style="color:var(--text-secondary);font-size:0.73rem;margin-bottom:5px;">
              ${esc(bpLabel)} · Acc ${esc(accLabel)}${esc(typeChangedNote)}
            </div>
            <div>${esc(m.desc || '')}</div>
          </div>
        </button>
      `;
    });
    html += '</div>';
  }

  // 6-Pokémon Switch Bar
  const sideMons = mySide?.team || [];
  const reqPokemon = req.side?.pokemon || [];
  const trapped = !!activeReq?.trapped && !forceSwitch;

  html += '<div class="switches">';
  sideMons.forEach((mon, idx) => {
    const rMon = reqPokemon[idx];
    const isActive = !!rMon?.active || mon.active;
    const isFainted = mon.fainted || (rMon && String(rMon.condition).endsWith('fnt'));
    const canSwitch = !isActive && !isFainted && !trapped;
    const pct = mon.hpPct ?? 100;
    const barCls = pct <= 22 ? 'low' : pct <= 52 ? 'mid' : '';

    html += `
      <button type="button" class="sw-btn ${isActive ? 'active-mon' : ''}" data-switch-idx="${idx}" ${canSwitch ? '' : 'disabled'}>
        <img alt="${esc(mon.species)}">
        <span class="nm">${esc(mon.species)}</span>
        <div class="hpbar"><i class="${barCls}" style="width:${pct}%"></i></div>
        ${renderMonTooltipHTML(mon)}
      </button>
    `;
  });
  html += '</div>';

  el.innerHTML = html;

  // Hydrate switch sprites
  el.querySelectorAll('.sw-btn').forEach(btn => {
    const idx = Number(btn.dataset.switchIdx);
    const mon = sideMons[idx];
    if (mon) staticSprite(btn.querySelector('img'), mon.species, {shiny: !!mon.shiny});
    btn.addEventListener('click', () => {
      pendingTargetMove = null;
      clearTargetHighlights();
      send({t: 'choose', choice: {kind: 'switch', index: idx}});
      renderControlsWaiting('Waiting for other trainers…', true);
    });
  });

  // Mega toggle
  $('#btn-mega-toggle')?.addEventListener('click', () => {
    megaArmed = !megaArmed;
    renderControls();
  });

  // Move clicks
  el.querySelectorAll('.move-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.moveIdx);
      const m = activeReq.moves[idx];
      if (!m) return;
      if (moveNeedsFFATarget(m)) {
        const foes = aliveOpponentSides();
        if (foes.length <= 1) {
          submitMoveWithTarget(idx, foes[0]?.seat ?? null);
          return;
        }
        pendingTargetMove = {index: idx, move: m};
        renderControls();
        for (const f of foes) {
          $(`#slot-${f.sid}`)?.classList.add('target-able');
        }
        return;
      }
      submitMoveWithTarget(idx, null);
    });
  });

  // Target bar buttons in 1v1v1v1 FFA
  if (pendingTargetMove !== null) {
    const foes = aliveOpponentSides();
    for (const f of foes) $(`#slot-${f.sid}`)?.classList.add('target-able');

    el.querySelectorAll('[data-target-seat]').forEach(btn => {
      btn.addEventListener('click', () => {
        submitMoveWithTarget(pendingTargetMove.index, Number(btn.dataset.targetSeat));
      });
    });
    $('#btn-cancel-target')?.addEventListener('click', () => {
      pendingTargetMove = null;
      renderControls();
    });
  }
}

// ---------------------------------------------------------------------------
// Side Panel: Team Inspector, Turn Timer & End Modal
// ---------------------------------------------------------------------------
function renderTeamDetailTab() {
  const wrap = $('#team-detail');
  if (!wrap || !latestState) return;
  const orderedSides = [...latestState.sides].sort((a, b) => (b.isYou ? 1 : 0) - (a.isYou ? 1 : 0));

  let html = '';
  for (const side of orderedSides) {
    html += `<div class="td-section-title">${esc(side.name)}${side.isYou ? ' (Your Team)' : ''} · ${side.pokemonLeft}/6 Left</div>`;
    for (const m of side.team || []) {
      const statsLine = m.stats
        ? `Atk ${m.stats.atk} · Def ${m.stats.def} · SpA ${m.stats.spa} · SpD ${m.stats.spd} · Spe ${m.stats.spe}`
        : '';
      const movesLine = m.moves
        ? m.moves.map(mv => esc(mv.name)).join(' · ')
        : 'Hidden moveset';
      html += `
        <div class="td-mon" style="${m.fainted ? 'opacity:0.45;' : ''}">
          <img data-sp="${esc(m.species)}" alt="${esc(m.species)}">
          <div>
            <div style="display:flex;justify-content:space-between;gap:6px;">
              <b>${esc(m.species)} <small style="color:var(--text-secondary)">Lv.${m.level}</small></b>
              <span>${m.fainted ? 'FNT' : `${m.hpPct}%`}</span>
            </div>
            <div style="font-size:0.74rem;color:var(--text-secondary);">
              ${m.ability ? esc(m.ability) : '???'} · ${m.item ? esc(m.item) : '???'}
            </div>
            ${statsLine ? `<div class="stats">${esc(statsLine)}</div>` : ''}
            <div style="font-size:0.74rem;margin-top:2px;">${movesLine}</div>
          </div>
        </div>
      `;
    }
  }
  wrap.innerHTML = html;
  wrap.querySelectorAll('img[data-sp]').forEach(img => {
    staticSprite(img, img.dataset.sp);
  });
}

function updateForfeitButton() {
  const btn = $('#btn-forfeit');
  if (!btn) return;
  clearTimeout(forfeitConfirmTimer);
  btn.dataset.armed = '';
  if (!latestState || latestState.ended || mySeat < 0 || latestState.sides[mySeat]?.pokemonLeft <= 0) {
    btn.textContent = 'Leave Match';
    btn.classList.remove('danger');
  } else {
    btn.textContent = 'Forfeit';
    btn.classList.add('danger');
  }
}

function maybeShowEndModal() {
  if (!latestState?.ended) return;
  const key = `${currentRoom?.code || ''}-${latestState.turn}-${latestState.winner}`;
  if (endModalShownKey === key) return;
  endModalShownKey = key;

  const myTrainerName = mySeat >= 0 ? latestState.sides[mySeat]?.name : null;
  const won = myTrainerName && latestState.winner === myTrainerName;
  $('#end-title').textContent = !latestState.winner || latestState.winner === 'Nobody'
    ? 'Draw'
    : mySeat < 0
      ? `${latestState.winner} Wins!`
      : won
        ? 'Victory!'
        : 'Defeat';
  $('#end-sub').textContent = latestState.winner && latestState.winner !== 'Nobody'
    ? `${latestState.winner} claimed the match on ${displayedField?.name || 'the battlefield'} in ${latestState.turn} turns.`
    : 'No Pokémon remained standing.';

  const againBtn = $('#btn-end-again');
  if (currentRoom?.isHost || lastQuickMode) {
    againBtn.textContent = lastQuickMode ? 'Instant Rematch' : 'Back to Lobby (Fresh Roll)';
    againBtn.disabled = false;
  } else {
    againBtn.textContent = 'New Solo Match';
    againBtn.disabled = false;
  }
  $('#modal-end').classList.remove('hidden');
}

function handlePlayAgain() {
  $('#modal-end').classList.add('hidden');
  if (lastQuickMode && (currentRoom?.mode === 'ai' || currentRoom?.mode === 'ffa')) {
    send({
      t: 'create',
      mode: lastQuickMode.mode,
      difficulty: currentRoom?.difficulty || homeDifficulty,
      fillAI: lastQuickMode.fillAI,
      fieldFilter: $('#home-field-filter').value,
      quickStart: true,
    });
  } else if (currentRoom?.isHost) {
    send({t: 'rematch'});
  } else {
    send({
      t: 'create',
      mode: 'ai',
      difficulty: homeDifficulty,
      fieldFilter: $('#home-field-filter').value,
      quickStart: true,
    });
  }
}

// Turn Timer Loop
setInterval(() => {
  const pill = $('#timer-pill');
  if (!pill) return;
  if (!latestState?.deadline || latestState.ended) {
    pill.classList.add('hidden');
    return;
  }
  const rem = Math.max(0, Math.ceil((latestState.deadline - Date.now()) / 1000));
  const m = Math.floor(rem / 60);
  const s = String(rem % 60).padStart(2, '0');
  pill.textContent = `${String(m).padStart(2, '0')}:${s}`;
  pill.classList.remove('hidden');
  pill.classList.toggle('low', rem <= 25);
}, 500);

// ---------------------------------------------------------------------------
// Event Listeners
// ---------------------------------------------------------------------------
function bindEvents() {
  // Brand / Home navigation
  $('#nav-brand-home').addEventListener('click', e => {
    e.preventDefault();
    if (currentRoom) {
      send({t: 'leave'});
    } else {
      showScreen('home');
    }
  });

  // Name sync
  if (myName) {
    $('#input-name').value = myName;
    $('#name-display').textContent = myName;
  }
  let nameTimer = null;
  $('#input-name').addEventListener('input', () => {
    clearTimeout(nameTimer);
    nameTimer = setTimeout(() => {
      const val = $('#input-name').value.trim();
      if (val) send({t: 'setName', name: val});
    }, 350);
  });

  $('#name-chip').addEventListener('click', () => {
    if (!$('#screen-home').classList.contains('hidden')) {
      $('#input-name').focus();
      $('#input-name').select();
    } else {
      toast(`Signed in as ${myName || 'Trainer'}`);
    }
  });

  // Home difficulty segmented control
  $$('#seg-difficulty button').forEach(btn => {
    btn.addEventListener('click', () => {
      homeDifficulty = btn.dataset.v;
      $$('#seg-difficulty button').forEach(b => b.classList.toggle('on', b === btn));
    });
  });

  // Home Match Launchers
  $('#btn-ai-quick').addEventListener('click', () => {
    lastQuickMode = {mode: 'ai', fillAI: false};
    send({
      t: 'create',
      mode: 'ai',
      difficulty: homeDifficulty,
      fieldFilter: $('#home-field-filter').value,
      quickStart: true,
    });
  });

  $('#btn-ai-lobby').addEventListener('click', () => {
    lastQuickMode = null;
    send({
      t: 'create',
      mode: 'ai',
      difficulty: homeDifficulty,
      fieldFilter: $('#home-field-filter').value,
      quickStart: false,
    });
  });

  $('#btn-pvp').addEventListener('click', () => {
    lastQuickMode = null;
    send({
      t: 'create',
      mode: 'pvp',
      difficulty: homeDifficulty,
      fieldFilter: $('#home-field-filter').value,
    });
  });

  $('#btn-ffa-quick').addEventListener('click', () => {
    lastQuickMode = {mode: 'ffa', fillAI: true};
    send({
      t: 'create',
      mode: 'ffa',
      difficulty: homeDifficulty,
      fillAI: true,
      fieldFilter: $('#home-field-filter').value,
      quickStart: true,
    });
  });

  $('#btn-ffa-lobby').addEventListener('click', () => {
    lastQuickMode = null;
    send({
      t: 'create',
      mode: 'ffa',
      difficulty: homeDifficulty,
      fillAI: $('#chk-ffa-ai').checked,
      fieldFilter: $('#home-field-filter').value,
      quickStart: false,
    });
  });

  $('#form-join-room').addEventListener('submit', e => {
    e.preventDefault();
    const code = ($('#input-code').value || '').toUpperCase().trim();
    if (code.length < 4) {
      toast('Enter a 5-character room code.', true);
      $('#input-code').focus();
      return;
    }
    lastQuickMode = null;
    send({t: 'join', code});
  });

  // Home Field Spotlight
  $('#btn-spotlight-roll').addEventListener('click', rollSpotlightField);
  $('#btn-spotlight-inspect').addEventListener('click', () => openGuide(spotlightFieldId));

  // Field Guide Modal
  $('#btn-encyclopedia').addEventListener('click', () => openGuide(displayedField?.id || spotlightFieldId));
  $('#field-pill').addEventListener('click', () => openGuide(displayedField?.id));
  $('#guide-search').addEventListener('input', renderGuideList);
  $('#guide-filter').addEventListener('change', renderGuideList);
  $('#btn-guide-close').addEventListener('click', () => $('#modal-guide').classList.add('hidden'));
  $('#modal-guide').addEventListener('click', e => {
    if (e.target === $('#modal-guide')) $('#modal-guide').classList.add('hidden');
  });

  // Lobby Controls
  $('#btn-copy-code').addEventListener('click', async () => {
    if (!currentRoom) return;
    try {
      await navigator.clipboard.writeText(currentRoom.code);
      toast(`Room code ${currentRoom.code} copied.`);
    } catch {
      toast(`Room code: ${currentRoom.code}`);
    }
  });

  $('#btn-copy-link').addEventListener('click', async () => {
    if (!currentRoom) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${currentRoom.code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Invite link copied to clipboard.');
    } catch {
      toast(`Invite URL: ${url}`);
    }
  });

  $('#btn-leave').addEventListener('click', () => send({t: 'leave'}));

  $('#sel-field').addEventListener('change', () => {
    send({t: 'setField', id: $('#sel-field').value, filter: $('#sel-filter').value});
  });
  $('#sel-filter').addEventListener('change', () => {
    send({t: 'setField', id: 'random', filter: $('#sel-filter').value});
  });

  $$('#seg-lobby-difficulty button').forEach(btn => {
    btn.addEventListener('click', () => send({t: 'setDifficulty', value: btn.dataset.v}));
  });

  $('#chk-open').addEventListener('change', () => {
    send({t: 'setOpenSheets', value: $('#chk-open').checked});
  });

  $('#btn-reroll-field').addEventListener('click', () => send({t: 'reroll', what: 'field'}));
  $('#btn-reroll-teams').addEventListener('click', () => send({t: 'reroll', what: 'teams'}));
  $('#btn-reroll-mine').addEventListener('click', () => send({t: 'reroll', what: 'myteam'}));
  $('#btn-start').addEventListener('click', () => send({t: 'start'}));

  // Chat Forms
  $$('form[data-chat]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const inp = form.querySelector('input');
      const text = (inp.value || '').trim();
      if (!text) return;
      send({t: 'chat', text});
      inp.value = '';
    });
  });

  // Battle Side Tabs
  $$('.tabs .tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSideTab = btn.dataset.tab;
      $$('.tabs .tab').forEach(b => b.classList.toggle('on', b === btn));
      $('#tab-log').classList.toggle('hidden', activeSideTab !== 'log');
      $('#tab-chat').classList.toggle('hidden', activeSideTab !== 'chat');
      $('#tab-team').classList.toggle('hidden', activeSideTab !== 'team');
      if (activeSideTab === 'chat') {
        unreadChat = 0;
        $('#tab-btn-chat').textContent = 'Chat';
      }
    });
  });

  // Two-step inline Forfeit / Leave Match
  $('#btn-forfeit').addEventListener('click', () => {
    const btn = $('#btn-forfeit');
    if (!latestState || latestState.ended || mySeat < 0 || latestState.sides[mySeat]?.pokemonLeft <= 0) {
      send({t: 'leave'});
      return;
    }
    if (btn.dataset.armed === '1') {
      btn.dataset.armed = '';
      clearTimeout(forfeitConfirmTimer);
      send({t: 'forfeit'});
      return;
    }
    btn.dataset.armed = '1';
    btn.textContent = 'Confirm Forfeit?';
    forfeitConfirmTimer = setTimeout(() => {
      btn.dataset.armed = '';
      btn.textContent = 'Forfeit';
    }, 3200);
  });

  // End Modal Buttons
  $('#btn-end-view').addEventListener('click', () => $('#modal-end').classList.add('hidden'));
  $('#btn-end-again').addEventListener('click', handlePlayAgain);
  $('#btn-end-home').addEventListener('click', () => {
    $('#modal-end').classList.add('hidden');
    send({t: 'leave'});
  });

  // Escape key closes modals or cancels FFA target selection
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!$('#modal-guide').classList.contains('hidden')) {
        $('#modal-guide').classList.add('hidden');
      } else if (pendingTargetMove !== null) {
        pendingTargetMove = null;
        renderControls();
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
bindEvents();
loadFields();
conn.start();
