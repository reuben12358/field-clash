'use strict';
/**
 * Reborn / Rejuvenation / Desolation field effect engine for Pokemon Showdown.
 *
 * Compiles all declarative field definitions (reborn.js, rejuvenation.js, desolation.js)
 * into a permanent Showdown pseudo-weather ("rebornfield") that dispatches battle events,
 * stat modifiers, ability activations, residuals, and mid-battle field transformations.
 */
const {Dex, toID} = require('pokemon-showdown');

const NATIVE_TERRAIN_FIELD = {
  electricterrain: 'electric',
  grassyterrain: 'grassy',
  mistyterrain: 'misty',
  psychicterrain: 'psychic',
};

const FIELDS = new Map();
const HOOK_EVENTS = new Set();

const ALL_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground',
  'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
];

const dex = Dex.mod('champions');

function moveIds(list) {
  if (!list) return null;
  const out = new Set();
  for (const name of list) {
    const id = toID(name);
    if (dex.moves.get(id).exists) out.add(id);
  }
  return out;
}

function abilityIds(list) {
  if (!list) return null;
  const out = new Set();
  for (const name of list) {
    const id = toID(name);
    if (dex.abilities.get(id).exists) out.add(id);
  }
  return out;
}

function normRule(rule) {
  const r = {...rule};
  if (r.moves) r.moves = moveIds(r.moves);
  if (r.notMoves) r.notMoves = moveIds(r.notMoves);
  if (r.abilities) r.abilities = abilityIds(r.abilities);
  if (r.types) r.types = new Set(r.types);
  if (r.cats) r.cats = new Set(r.cats);
  if (r.flags && !Array.isArray(r.flags)) r.flags = [r.flags];
  return r;
}

function defineField(def) {
  if (!def.id || !def.name) throw new Error('Field needs id + name');
  const f = {
    games: [],
    info: [],
    mods: [],
    typeAdd: [],
    typeChange: [],
    fail: [],
    secondary: [],
    priority: [],
    defMods: [],
    speMods: [],
    atkMods: [],
    preventStatus: [],
    transforms: [],
    counters: [],
    accuracy: {},
    hooks: {},
    random: true,
    mimicry: null,
    naturePower: null,
    secretPower: null,
    seedBoosts: null,
    ...def,
  };
  f.mods = f.mods.map(normRule).filter(r => !r.moves || r.moves.size > 0 || r.types || r.cats || r.flags || r.anyMove);
  f.typeAdd = f.typeAdd.map(normRule).filter(r => !r.moves || r.moves.size > 0 || r.types || r.cats || r.flags || r.anyMove);
  f.typeChange = f.typeChange.map(normRule).filter(r => !r.moves || r.moves.size > 0 || r.types || r.cats || r.flags || r.anyMove);
  f.fail = f.fail.map(normRule).filter(r => !r.moves || r.moves.size > 0 || r.types || r.cats || r.flags);
  f.secondary = f.secondary.map(normRule).filter(r => !r.moves || r.moves.size > 0 || r.types || r.cats || r.flags);
  f.priority = f.priority.map(normRule).filter(r => !r.moves || r.moves.size > 0 || r.types || r.cats || r.flags);
  f.defMods = f.defMods.map(r => ({
    ...r,
    types: r.types ? new Set(r.types) : null,
    abilities: abilityIds(r.abilities),
  }));
  f.speMods = f.speMods.map(r => ({
    ...r,
    types: r.types ? new Set(r.types) : null,
    abilities: abilityIds(r.abilities),
  }));
  f.atkMods = f.atkMods.map(r => ({
    ...r,
    types: r.types ? new Set(r.types) : null,
    abilities: abilityIds(r.abilities),
  }));
  f.counters = f.counters.map(c => ({
    key: 'counter',
    add: 1,
    ...normRule(c),
  })).filter(c => !c.moves || c.moves.size > 0 || c.types);
  f.transforms = f.transforms.map(t => {
    const n = normRule(t);
    if (n.weather) n.weather = new Set(n.weather.map(toID));
    return n;
  }).filter(t => t.weather || t.onlyEvent || !t.moves || t.moves.size > 0 || t.types);

  const acc = {};
  for (const [k, v] of Object.entries(f.accuracy)) {
    const id = toID(k);
    if (dex.moves.get(id).exists) acc[id] = v;
  }
  f.accuracy = acc;
  if (f.naturePower) {
    const np = toID(f.naturePower);
    f.naturePower = dex.moves.get(np).exists ? np : 'triattack';
  }
  for (const ev of Object.keys(f.hooks)) HOOK_EVENTS.add(ev);
  FIELDS.set(f.id, f);
  return f;
}

// ---------------------------------------------------------------------------
// Matching helpers
// ---------------------------------------------------------------------------
function moveMatches(rule, move, source, target, battle) {
  if (!move) return false;
  if (rule.moves || rule.types || rule.cats || rule.flags || rule.abilities || rule.anyMove) {
    let ok = false;
    if (rule.anyMove) ok = true;
    if (rule.moves && rule.moves.has(move.id)) ok = true;
    if (rule.types && rule.types.has(move.type)) {
      let typeOk = !rule.cats || rule.cats.has(move.category);
      if (typeOk && rule.flags) typeOk = rule.flags.some(fl => move.flags?.[fl]);
      if (typeOk) ok = true;
    } else if (!rule.types && rule.cats && rule.cats.has(move.category)) {
      if (!rule.flags || rule.flags.some(fl => move.flags?.[fl])) ok = true;
    } else if (!rule.types && !rule.cats && rule.flags && rule.flags.some(fl => move.flags?.[fl])) {
      ok = true;
    }
    if (rule.abilities && source && rule.abilities.has(source.ability) && !rule.moves && !rule.types && !rule.cats && !rule.flags) {
      ok = true;
    }
    if (!ok) return false;
  }
  if (rule.notMoves && rule.notMoves.has(move.id)) return false;
  if (rule.noContact && move.flags?.contact) return false;
  if (rule.contact && !move.flags?.contact) return false;
  if (rule.damaging && move.category === 'Status') return false;
  if (rule.grounded && source && !source.isGrounded()) return false;
  if (rule.airborne && source && source.isGrounded()) return false;
  if (rule.targetGrounded && target && !target.isGrounded()) return false;
  if (rule.targetAirborne && target && target.isGrounded()) return false;
  if (rule.cond && !rule.cond.call(battle, {battle, source, target, move})) return false;
  return true;
}

function getState(battle) {
  if (!battle.rfield) {
    battle.rfield = {
      base: 'none',
      current: 'none',
      history: [],
      overlay: null,
      counter: 0,
      counter2: 0,
      counter3: 0,
      counter4: 0,
      weatherTurns: 0,
      rollIdx: 0,
      changes: 0,
    };
  }
  return battle.rfield;
}

function currentField(battle) {
  const st = getState(battle);
  return FIELDS.get(st.current) || null;
}

function fieldDamageMultiplier(battle, source, target, move, out) {
  const f = currentField(battle);
  if (!f || !move || move.category === 'Status') return 1;
  let mult = 1;
  for (const rule of f.mods) {
    if (!moveMatches(rule, move, source, target, battle)) continue;
    const m = typeof rule.mult === 'function' ? rule.mult.call(battle, {battle, source, target, move}) : rule.mult;
    if (!m || m === 1) continue;
    mult *= m;
    if (out && rule.msg) out.push(rule.msg);
  }
  return mult;
}

function addedTypes(battle, source, target, move) {
  const f = currentField(battle);
  if (!f || !move || move.category === 'Status') return [];
  const res = [];
  for (const rule of f.typeAdd) {
    if (!moveMatches(rule, move, source, target, battle)) continue;
    const add = typeof rule.add === 'function' ? rule.add.call(battle, {battle, source, target, move}) : rule.add;
    if (add && add !== move.type && !res.includes(add)) res.push(add);
  }
  return res;
}

function changedType(battle, source, target, move) {
  const f = currentField(battle);
  if (!f || !move) return null;
  for (const rule of f.typeChange) {
    if (!moveMatches(rule, move, source, target, battle)) continue;
    return typeof rule.to === 'function' ? rule.to.call(battle, {battle, source, target, move}) : rule.to;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public metadata & field switching
// ---------------------------------------------------------------------------
function resolveTargetName(to) {
  if (to === 'none') return 'Plain Field';
  if (to === 'backup') return 'Previous / Plain Field';
  return FIELDS.get(to)?.name || to;
}

function describeTrigger(t) {
  const parts = [];
  if (t.moves && t.moves.size) {
    const names = [...t.moves].slice(0, 8).map(id => dex.moves.get(id).name);
    if (t.moves.size > 8) names.push(`+${t.moves.size - 8} more`);
    parts.push(names.join(', '));
  }
  if (t.types) parts.push(`${[...t.types].join('/')}-type ${t.damaging ? 'attacks' : 'moves'}`);
  if (t.weather) parts.push(`Weather: ${[...t.weather].map(w => dex.conditions.get(w).name || w).join(', ')}`);
  return parts.join('; ') || 'Special interaction';
}

function publicInfo(id) {
  const f = FIELDS.get(id);
  if (!f) {
    return {
      id: 'none',
      name: 'Plain Field',
      games: [],
      intro: 'The battlefield has returned to normal.',
      info: ['No active field modifiers — standard Pokémon Champions battle rules apply.'],
      theme: {bg1: '#1a202c', bg2: '#0f141d', ground: '#222938', accent: '#d99b26'},
      transforms: [],
    };
  }
  const transforms = [];
  for (const c of f.counters) {
    if (c.to && !c.hidden) {
      transforms.push({
        to: resolveTargetName(c.to),
        trigger: c.label || `${describeTrigger(c)} (${c.threshold || 2}×)`,
      });
    }
  }
  for (const t of f.transforms) {
    if (t.hidden) continue;
    const toName = resolveTargetName(t.to);
    const trig = t.label || describeTrigger(t);
    if (!transforms.some(x => x.to === toName && x.trigger === trig)) {
      transforms.push({to: toName, trigger: trig});
    }
  }
  return {
    id: f.id,
    name: f.name,
    family: f.family || f.id,
    stage: f.stage || null,
    random: f.random,
    games: f.games,
    intro: f.intro,
    info: f.info,
    mimicry: f.mimicry,
    naturePower: f.naturePower ? dex.moves.get(f.naturePower).name : 'Tri Attack',
    theme: f.theme || {},
    transforms,
  };
}

function applyMimicryAndSeeds(battle) {
  const f = currentField(battle);
  for (const side of battle.sides) {
    for (const pokemon of side.active) {
      if (!pokemon || pokemon.fainted) continue;
      applyPokemonFieldEntry(battle, pokemon, f);
    }
  }
}

function applyPokemonFieldEntry(battle, pokemon, f) {
  if (!pokemon || pokemon.fainted) return;
  // Mimicry adapts to custom Reborn/Rejuv/Deso field type
  if (pokemon.hasAbility('mimicry')) {
    if (f?.mimicry && !pokemon.hasType(f.mimicry)) {
      if (pokemon.setType(f.mimicry)) {
        battle.add('-start', pokemon, 'typechange', f.mimicry, '[from] ability: Mimicry');
      }
    }
  }
  // Activate matching terrain seeds on custom fields too
  if (f?.seedBoosts && pokemon.item) {
    const seedItems = ['electricseed', 'grassyseed', 'mistyseed', 'psychicseed'];
    const wantedSeed = f.seedItem || null;
    if ((wantedSeed && pokemon.item === wantedSeed) || (!f.terrain && seedItems.includes(pokemon.item) && f.acceptAnySeed)) {
      if (pokemon.useItem()) {
        battle.boost(f.seedBoosts, pokemon, pokemon);
        if (f.onSeed) f.onSeed.call(battle, pokemon);
      }
    }
  }
  if (f?.onSwitchIn) f.onSwitchIn.call(battle, pokemon);
}

function setField(battle, rawId, opts = {}) {
  const st = getState(battle);
  let id = rawId;
  if (id === 'backup') {
    id = st.history.length ? st.history.pop() : 'none';
  }
  if (!FIELDS.has(id) && id !== 'none') throw new Error(`Unknown field ${id}`);
  const prevId = st.current;
  if (prevId === id && !opts.force) return false;
  const prev = FIELDS.get(prevId);
  const next = FIELDS.get(id);
  if (opts.msg) battle.add('-message', opts.msg);
  if (prev?.onEnd) prev.onEnd.call(battle, battle);

  if (opts.overlay) {
    st.overlay = {id, prev: st.overlay ? st.overlay.prev : prevId};
  } else {
    if (rawId !== 'backup' && prevId && prevId !== 'none' && id !== 'none' && !opts.noHistory) {
      // Avoid pushing stage-to-stage transitions of the same family repeatedly
      const prevFam = prev?.family || prevId;
      const nextFam = next?.family || id;
      if (prevFam !== nextFam) {
        st.history.push(prevId);
        if (st.history.length > 6) st.history.shift();
      }
    }
    if (id === 'none') st.history = [];
    st.overlay = null;
    st.base = id;
  }

  st.current = id;
  st.counter = 0;
  st.counter2 = 0;
  st.counter3 = 0;
  st.counter4 = 0;
  st.weatherTurns = 0;
  st.changes++;

  st.syncing = true;
  try {
    const nativeTerrain = next?.terrain || '';
    if (!opts.keepTerrain) {
      if (nativeTerrain) {
        const srcMon = battle.sides[0]?.active[0] || battle.sides[0]?.pokemon[0];
        if (battle.field.terrain !== nativeTerrain && srcMon) {
          battle.field.setTerrain(nativeTerrain, srcMon, battle.dex.conditions.get('rebornfield'));
        }
        if (!opts.overlay && battle.field.terrain === nativeTerrain) delete battle.field.terrainState.duration;
      } else if (battle.field.terrain && NATIVE_TERRAIN_FIELD[battle.field.terrain]) {
        battle.field.clearTerrain();
      }
    }
  } finally {
    st.syncing = false;
  }
  st.lastTerrain = battle.field.terrain;
  battle.add('rfield', id, opts.overlay ? 'overlay' : 'base');
  if (next) {
    battle.add('-message', next.intro);
    if (next.onStart) next.onStart.call(battle, battle);
    applyMimicryAndSeeds(battle);
  } else {
    battle.add('-message', 'The battlefield returned to normal!');
  }
  return true;
}

function revertOverlay(battle) {
  const st = getState(battle);
  if (!st.overlay) return;
  const prev = st.overlay.prev;
  st.overlay = null;
  setField(battle, prev, {force: true, noHistory: true});
}

function tryTransform(battle, kind, payload) {
  const f = currentField(battle);
  if (!f) return false;
  const st = getState(battle);

  if (kind === 'move') {
    const {source, target, move} = payload;
    for (const c of f.counters) {
      if (!moveMatches(c, move, source, target, battle)) continue;
      const key = c.key || 'counter';
      if (c.set !== undefined) st[key] = c.set;
      else st[key] = (st[key] || 0) + (c.add ?? 1);
      if (c.threshold && st[key] >= c.threshold) {
        if (c.onTrigger) {
          const changed = c.onTrigger.call(battle, {battle, source, target, move, state: st});
          if (changed) return true;
        }
        if (c.to) {
          if (c.before) c.before.call(battle, {battle, ...payload});
          setField(battle, c.to, {msg: c.msg});
          if (c.after) c.after.call(battle, {battle, ...payload});
          return true;
        }
      } else if (c.progressMsg) {
        battle.add('-message', c.progressMsg);
      }
    }
  }

  for (const t of f.transforms) {
    if (kind === 'move') {
      if (t.weather || t.onlyEvent) continue;
      const {source, target, move} = payload;
      if (!moveMatches(t, move, source, target, battle)) continue;
    } else if (kind === 'weather') {
      if (!t.weather || !t.weather.has(payload.weather)) continue;
      if (t.cond && !t.cond.call(battle, {battle})) continue;
    } else {
      continue;
    }
    if (t.chance && battle.random(100) >= t.chance) continue;
    if (t.before) t.before.call(battle, {battle, ...payload});
    setField(battle, t.to, {msg: t.msg, overlay: !!t.overlay});
    if (t.after) t.after.call(battle, {battle, ...payload});
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Compiled Showdown pseudo-weather condition
// ---------------------------------------------------------------------------
function hook(battle, name, args) {
  const f = currentField(battle);
  const fn = f?.hooks?.[name];
  if (!fn) return undefined;
  return fn.apply(battle, args);
}

function applyStatRules(rules, kind, battle, pokemon, source, move) {
  for (const r of rules) {
    if (r.stat && r.stat !== 'both' && r.stat !== kind) continue;
    if (r.types && ![...r.types].some(t => pokemon.hasType(t))) continue;
    if (r.abilities && !r.abilities.has(pokemon.ability)) continue;
    if (r.grounded && !pokemon.isGrounded()) continue;
    if (r.airborne && pokemon.isGrounded()) continue;
    if (r.weather) {
      const w = battle.field.effectiveWeather();
      const allowed = Array.isArray(r.weather) ? r.weather : [r.weather];
      if (!allowed.includes(w)) continue;
    }
    if (r.cond && !r.cond.call(battle, {battle, pokemon, source, move})) continue;
    battle.chainModify(r.mult);
  }
}

function buildCondition() {
  const cond = {
    name: 'Reborn Field',
    effectType: 'Condition',

    onBasePowerPriority: 1,
    onBasePower(basePower, source, target, move) {
      const msgs = [];
      const mult = fieldDamageMultiplier(this, source, target, move, msgs);
      const res = hook(this, 'onBasePower', [basePower, source, target, move]);
      if (msgs.length && !move.rfieldMsg) {
        move.rfieldMsg = true;
        for (const m of [...new Set(msgs)]) this.add('-message', m);
      }
      if (mult !== 1) this.chainModify(mult);
      if (typeof res === 'number') return res;
    },

    onModifyAtkPriority: 5,
    onModifyAtk(atk, pokemon, target, move) {
      const f = currentField(this);
      if (f?.atkMods?.length) applyStatRules(f.atkMods, 'atk', this, pokemon, target, move);
      return hook(this, 'onModifyAtk', [atk, pokemon, target, move]);
    },

    onModifySpAPriority: 5,
    onModifySpA(spa, pokemon, target, move) {
      const f = currentField(this);
      if (f?.atkMods?.length) applyStatRules(f.atkMods, 'spa', this, pokemon, target, move);
      return hook(this, 'onModifySpA', [spa, pokemon, target, move]);
    },

    onModifyDefPriority: 6,
    onModifyDef(def, pokemon, source, move) {
      const f = currentField(this);
      if (f?.defMods?.length) applyStatRules(f.defMods, 'def', this, pokemon, source, move);
      return hook(this, 'onModifyDef', [def, pokemon, source, move]);
    },

    onModifySpDPriority: 6,
    onModifySpD(spd, pokemon, source, move) {
      const f = currentField(this);
      if (f?.defMods?.length) applyStatRules(f.defMods, 'spd', this, pokemon, source, move);
      return hook(this, 'onModifySpD', [spd, pokemon, source, move]);
    },

    onModifySpe(spe, pokemon) {
      const f = currentField(this);
      if (f?.speMods?.length) applyStatRules(f.speMods, 'spe', this, pokemon, null, null);
      return hook(this, 'onModifySpe', [spe, pokemon]);
    },

    onModifyTypePriority: -2,
    onModifyType(move, pokemon, target) {
      const t = changedType(this, pokemon, target, move);
      if (t && t !== move.type) move.type = t;
      hook(this, 'onModifyType', [move, pokemon, target]);
    },

    onEffectiveness(typeMod, target, type, move) {
      if (!move || !move.id || move.category === 'Status') return;
      const source = this.activePokemon || null;
      let mod = typeMod;
      const adds = addedTypes(this, source, target, move);
      for (const add of adds) mod += this.dex.getEffectiveness(add, type);
      const res = hook(this, 'onEffectiveness', [mod, target, type, move]);
      if (typeof res === 'number') return res;
      return mod;
    },

    onModifyMove(move, pokemon, target) {
      const f = currentField(this);
      if (!f) return;
      if (move.id in f.accuracy) move.accuracy = f.accuracy[move.id];
      if (move.id === 'secretpower' && f.secretPower) {
        move.secondaries = [f.secretPower];
      }
      for (const s of f.secondary) {
        if (!moveMatches(s, move, pokemon, target, this)) continue;
        if (move.category === 'Status') continue;
        if (!move.secondaries) move.secondaries = [];
        const sec = {chance: s.chance ?? 100};
        if (s.status) sec.status = s.status;
        if (s.volatileStatus) sec.volatileStatus = s.volatileStatus;
        if (s.boosts) sec.boosts = s.boosts;
        if (s.self) sec.self = s.self;
        move.secondaries.push(sec);
      }
      hook(this, 'onModifyMove', [move, pokemon, target]);
    },

    onModifyPriority(priority, pokemon, target, move) {
      const f = currentField(this);
      if (!f || !move) return;
      let p = priority;
      for (const r of f.priority) if (moveMatches(r, move, pokemon, target, this)) p += r.add;
      const res = hook(this, 'onModifyPriority', [p, pokemon, target, move]);
      return typeof res === 'number' ? res : p;
    },

    onTryMovePriority: 100,
    onTryMove(source, target, move) {
      const f = currentField(this);
      if (!f) return;
      for (const r of f.fail) {
        if (!moveMatches(r, move, source, target, this)) continue;
        this.attrLastMove('[still]');
        this.add('-message', r.msg || `${move.name} failed on the ${f.name}!`);
        return null;
      }
      if (move.id === 'naturepower' && f.naturePower) {
        this.add('-message', `Nature Power turned into ${this.dex.moves.get(f.naturePower).name}!`);
        this.actions.useMove(f.naturePower, source, {target});
        return null;
      }
      if (move.id === 'camouflage' && f.mimicry) {
        this.attrLastMove('[still]');
        if (!source.hasType(f.mimicry) && source.setType(f.mimicry)) {
          this.add('-start', source, 'typechange', f.mimicry);
        } else {
          this.add('-fail', source);
        }
        return null;
      }
      return hook(this, 'onTryMove', [source, target, move]);
    },

    onSetStatus(status, target, source, effect) {
      const f = currentField(this);
      if (!f) return;
      for (const r of f.preventStatus) {
        if (!r.status.includes(status.id)) continue;
        if (r.grounded && !target.isGrounded()) continue;
        if (r.types && ![...r.types].some(t => target.hasType(t))) continue;
        if (r.cond && !r.cond.call(this, {battle: this, target, source, effect})) continue;
        if (effect && (effect.effectType === 'Move' || effect.id === 'yawn') && !effect.secondaries) {
          this.add('-message', r.msg || `The ${f.name} prevents that!`);
        }
        return false;
      }
      return hook(this, 'onSetStatus', [status, target, source, effect]);
    },

    onResidualOrder: 4,
    onResidual(pokemon) {
      const f = currentField(this);
      if (!f || !pokemon || pokemon.fainted || !pokemon.hp) return;
      if (f.residual) f.residual.call(this, pokemon);
    },

    onFieldResidualOrder: 30,
    onFieldResidual() {
      const f = currentField(this);
      if (f?.fieldResidual) f.fieldResidual.call(this);
    },

    onSwitchIn(pokemon) {
      const f = currentField(this);
      applyPokemonFieldEntry(this, pokemon, f);
    },

    onAfterMove(source, target, move) {
      if (!move || source.moveThisTurnResult === false) return;
      if (move.flags?.futuremove && !move.rfieldFuture) return;
      hook(this, 'onAfterMove', [source, target, move]);
      tryTransform(this, 'move', {source, target, move});
    },

    onWeatherChange() {
      const st = getState(this);
      const w = this.field.effectiveWeather() || this.field.weather || '';
      if (w === st.lastWeather) return;
      st.lastWeather = w;
      st.weatherTurns = 0;
      if (w) tryTransform(this, 'weather', {weather: w});
    },

    onTerrainChange() {
      const st = getState(this);
      if (st.syncing) return;
      const t = this.field.terrain || '';
      if (t === st.lastTerrain) return;
      st.lastTerrain = t;
      const f = currentField(this);
      const mapped = NATIVE_TERRAIN_FIELD[t];
      if (t && mapped) {
        if (f?.blockTerrain) {
          st.syncing = true;
          this.field.clearTerrain();
          st.syncing = false;
          st.lastTerrain = this.field.terrain;
          this.add('-message', f.blockTerrainMsg || `The ${f.name} prevented the terrain from forming!`);
          return;
        }
        const custom = f?.onTerrainSet ? f.onTerrainSet.call(this, t) : undefined;
        if (custom === false) return;
        if (st.current === mapped) return;
        if (FIELDS.has(mapped)) setField(this, mapped, {overlay: true, keepTerrain: true});
      } else if (!t) {
        if (st.overlay) {
          revertOverlay(this);
        } else if (f?.terrain) {
          setField(this, 'backup', {msg: `The ${f.name} faded away!`});
        }
      }
    },
  };

  for (const ev of HOOK_EVENTS) {
    if (cond[ev]) continue;
    cond[ev] = function (...args) {
      return hook(this, ev, args);
    };
  }
  for (const f of FIELDS.values()) {
    for (const [k, v] of Object.entries(f.hookPriorities || {})) cond[k] = v;
  }
  return cond;
}

let installed = false;
function install() {
  if (installed) return;
  installed = true;
  require('./reborn');
  require('./rejuvenation');
  require('./desolation');
  const condition = buildCondition();
  for (const mod of ['champions', 'gen9']) {
    const d = Dex.mod(mod);
    d.data.Conditions.rebornfield = condition;
  }
}

function startField(battle, id) {
  const st = getState(battle);
  st.lastWeather = battle.field.weather || '';
  st.lastTerrain = battle.field.terrain || '';
  if (!battle.field.pseudoWeather.rebornfield) battle.field.addPseudoWeather('rebornfield');
  setField(battle, id, {force: true, noHistory: true});
}

function randomFieldId(filter) {
  const pool = [...FIELDS.values()].filter(f => f.random && (!filter || filter === 'all' || f.games.includes(filter)));
  return pool[Math.floor(Math.random() * pool.length)].id;
}

function listFields() {
  return [...FIELDS.values()].map(f => ({
    id: f.id,
    name: f.name,
    family: f.family || f.id,
    stage: f.stage || null,
    games: f.games,
    random: f.random,
  }));
}

function describeMoveOnField(battle, pokemon, moveId) {
  const move = battle.dex.getActiveMove(moveId);
  const t = changedType(battle, pokemon, null, move);
  if (t) move.type = t;
  const f = currentField(battle);
  const res = {type: move.type};
  if (!f) return res;
  const mult = fieldDamageMultiplier(battle, pokemon, null, move);
  if (mult !== 1 && move.category !== 'Status') res.mult = Math.round(mult * 100) / 100;
  const adds = addedTypes(battle, pokemon, null, move);
  if (adds.length && move.category !== 'Status') res.adds = adds;
  if (f.fail.some(r => moveMatches(r, move, pokemon, null, battle))) res.fails = true;

  for (const c of f.counters) {
    if (c.to && moveMatches(c, move, pokemon, null, battle)) {
      res.transforms = resolveTargetName(c.to);
      break;
    }
  }
  if (!res.transforms) {
    const tr = f.transforms.find(x => !x.weather && !x.onlyEvent && moveMatches(x, move, pokemon, null, battle));
    if (tr) res.transforms = resolveTargetName(tr.to);
  }
  return res;
}

module.exports = {
  defineField,
  install,
  startField,
  setField,
  revertOverlay,
  randomFieldId,
  listFields,
  publicInfo,
  fieldDamageMultiplier,
  addedTypes,
  changedType,
  currentField,
  getState,
  describeMoveOnField,
  FIELDS,
  ALL_TYPES,
  moveMatches,
};
