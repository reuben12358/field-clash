'use strict';
/**
 * Pokemon Showdown setup: custom Champions Lv.50 formats + field engine + random teams.
 */
const {Dex, Battle, Teams, toID} = require('pokemon-showdown');
const fields = require('./fields/engine');
const {scoreSetOnField, generateFieldTeam, generateAIMatchupTeams, getGenerator} = require('./fields/affinity');

fields.install();
Dex.formats.load();
const Format = Dex.formats.get('gen9customgame').constructor;

function addFormat(data) {
  const id = toID(data.name);
  if (Dex.formats.rulesetCache.has(id)) return id;
  data.effectType = 'Format';
  data.baseRuleset = data.ruleset.slice();
  data.mod = data.mod || 'champions';
  Dex.formats.rulesetCache.set(id, new Format(data));
  return id;
}

function onBegin() {
  fields.startField(this, this.rfieldInitial || fields.randomFieldId());
}

const FORMATS = {
  singles: addFormat({
    name: '[Gen 9 Champions] Reborn Field Battle',
    gameType: 'singles',
    mod: 'champions',
    ruleset: ['Adjust Level = 50', 'Species Clause', 'Sleep Clause Mod', 'Cancel Mod', 'Illusion Level Mod'],
    onBegin,
  }),
  ffa: addFormat({
    name: '[Gen 9 Champions] Reborn Field Free-For-All',
    gameType: 'freeforall',
    mod: 'champions',
    ruleset: ['Adjust Level = 50', 'Species Clause', 'Cancel Mod', 'Illusion Level Mod'],
    onBegin,
  }),
  natdex_singles: addFormat({
    name: '[Gen 9 NatDex] Reborn Field Battle',
    gameType: 'singles',
    mod: 'gen9',
    ruleset: ['NatDex Mod', 'Terastal Clause', 'Adjust Level = 50', 'Sleep Clause Mod', 'Cancel Mod', 'Illusion Level Mod'],
    onBegin,
  }),
  natdex_canonical: addFormat({
    name: '[Gen 9 NatDex] Reborn Story Simulation',
    gameType: 'singles',
    mod: 'gen9',
    ruleset: ['NatDex Mod', 'Terastal Clause', 'Max Level = 9999', 'Cancel Mod', 'Illusion Level Mod'],
    onBegin,
  }),
  natdex_ffa: addFormat({
    name: '[Gen 9 NatDex] Reborn Field Free-For-All',
    gameType: 'freeforall',
    mod: 'gen9',
    ruleset: ['NatDex Mod', 'Terastal Clause', 'Adjust Level = 50', 'Cancel Mod', 'Illusion Level Mod'],
    onBegin,
  }),
};

/** Random 6-Pokémon team (Champions Dex or National Dex, default Lv.50). */
function randomTeam(opts = {}) {
  const dexMode = opts.dexMode === 'natdex' ? 'natdex' : 'champions';
  const targetLevel = Math.max(1, Number(opts.level) || 50);
  const team = getGenerator(dexMode).randomTeam();
  for (const s of team) s.level = targetLevel;
  return team;
}

function createBattle(mode, opts = {}) {
  const isNatDex = opts.dexMode === 'natdex';
  const isCanonical = opts.levelMode === 'canonical';
  let fmtId;
  if (mode === 'ffa') {
    fmtId = isNatDex ? FORMATS.natdex_ffa : FORMATS.ffa;
  } else if (isNatDex && isCanonical) {
    fmtId = FORMATS.natdex_canonical;
  } else if (isNatDex) {
    fmtId = FORMATS.natdex_singles;
  } else {
    fmtId = FORMATS.singles;
  }
  const format = Dex.formats.get(fmtId);
  return new Battle({format, send: opts.send, seed: opts.seed});
}

/**
 * Public type-chart + field effectiveness multiplier of `moveId` used by `attacker`
 * against `defender` (does NOT inspect unrevealed defender abilities).
 */
function publicMoveEffectiveness(battle, attacker, defender, moveId) {
  if (!attacker || !defender || defender.fainted) return null;
  const move = battle.dex.getActiveMove(moveId);
  if (!move || move.category === 'Status') return null;
  const type = fields.changedType(battle, attacker, defender, move) || move.type;
  const fid = fields.getState(battle).current;
  const defTypes = defender.getTypes();

  if (fid === 'inverse') {
    let eff = 0;
    for (const dt of defTypes) {
      eff += !battle.dex.getImmunity(type, dt) ? 1 : -battle.dex.getEffectiveness(type, dt);
    }
    return Math.pow(2, eff);
  }

  const groundHitsAir = fid === 'cave' || fid === 'deepearth';
  if (type === 'Ground' && defTypes.includes('Flying') && !groundHitsAir && !defender.volatiles.smackdown && !battle.field.pseudoWeather.gravity) {
    return 0;
  }
  if (fid === 'glitch' && type === 'Ghost' && defTypes.includes('Psychic')) {
    return 0;
  }

  if (!battle.dex.getImmunity(type, defTypes)) {
    const holyBypass = fid === 'holy' && type === 'Normal' && defTypes.some(t => t === 'Ghost' || t === 'Dark');
    const groundBypass = type === 'Ground' && groundHitsAir;
    if (!holyBypass && !groundBypass) return 0;
  }

  let eff = 0;
  for (const dt of defTypes) {
    if (fid === 'holy' && type === 'Normal' && (dt === 'Ghost' || dt === 'Dark')) eff += 1;
    else if (fid === 'fairytale' && type === 'Steel' && dt === 'Dragon') eff += 1;
    else if (fid === 'glitch' && ((type === 'Bug' && dt === 'Poison') || (type === 'Poison' && dt === 'Bug'))) eff += 1;
    else if (fid === 'glitch' && type === 'Ice' && dt === 'Fire') eff += 0;
    else if (fid === 'glitch' && type === 'Dragon' && dt === 'Dragon') eff += 0;
    else if (fid === 'flowergarden4' || fid === 'flowergarden5') {
      const e = battle.dex.getImmunity(type, dt) ? battle.dex.getEffectiveness(type, dt) : 0;
      eff += dt === 'Grass' && e > 0 ? 0 : e;
    } else if (fid === 'darkness3') {
      const e = battle.dex.getImmunity(type, dt) ? battle.dex.getEffectiveness(type, dt) : 0;
      eff += (dt === 'Dark' || dt === 'Ghost') && e > 0 ? 0 : e;
    } else if (battle.dex.getImmunity(type, dt)) {
      eff += battle.dex.getEffectiveness(type, dt);
    }
  }
  for (const add of fields.addedTypes(battle, attacker, defender, move)) {
    if (!battle.dex.getImmunity(add, defTypes)) return 0;
    eff += battle.dex.getEffectiveness(add, defTypes);
  }
  return Math.pow(2, eff);
}

/**
 * Import & validate a Showdown paste string (1..6 Pokémon) against Gen 9 + Custom Dex.
 */
function parseTeamPaste(paste, opts = {}) {
  const raw = String(paste || '').trim();
  if (!raw) return {ok: false, error: 'Paste a Pokémon Showdown team export (1–6 Pokémon).'};
  const imported = Teams.import(raw);
  if (!Array.isArray(imported) || !imported.length) {
    return {ok: false, error: 'Could not parse any Pokémon from the team paste.'};
  }
  if (imported.length > 6) {
    return {ok: false, error: 'Teams may have at most 6 Pokémon.'};
  }
  const d = Dex.mod('gen9');
  const forceLevel = opts.forceLevel ? Number(opts.forceLevel) : null;
  const rawBlocks = raw.split(/\r?\n\s*\r?\n/).filter(b => b.trim());
  const out = [];
  for (let idx = 0; idx < imported.length; idx++) {
    const s = imported[idx];
    let sp = d.species.get(s.species || s.name);
    if (!sp.exists) {
      return {ok: false, error: `Unknown Pokémon species: "${s.species || s.name}".`};
    }
    let rawItem = s.item;
    if (sp.isMega && sp.baseSpecies) {
      if (!rawItem && sp.requiredItem) rawItem = sp.requiredItem;
      sp = d.species.get(sp.baseSpecies);
    }
    const moves = (s.moves || [])
      .map(m => d.moves.get(m))
      .filter(mv => mv.exists)
      .slice(0, 4)
      .map(mv => mv.name);
    if (!moves.length) {
      return {ok: false, error: `${sp.name} needs at least 1 valid move.`};
    }
    const ab = s.ability && d.abilities.get(s.ability).exists
      ? d.abilities.get(s.ability).name
      : (sp.abilities['0'] || 'Pressure');
    const it = rawItem && d.items.get(rawItem).exists ? d.items.get(rawItem).name : '';
    const explicitLevel = /^\s*Level:\s*\d+/im.test(rawBlocks[idx] || '');
    out.push({
      name: s.name && s.name !== sp.name && !d.species.get(s.name).isMega ? s.name : sp.name,
      species: sp.name,
      item: it,
      ability: ab,
      moves,
      nature: s.nature && d.natures.get(s.nature).exists ? d.natures.get(s.nature).name : 'Serious',
      evs: {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...(s.evs || {})},
      ivs: {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31, ...(s.ivs || {})},
      gender: s.gender || '',
      shiny: !!s.shiny,
      level: forceLevel || (explicitLevel ? Math.max(1, Math.min(250, Number(s.level) || 50)) : 50),
      explicitLevel,
    });
  }
  return {ok: true, team: out};
}

function exportTeamPaste(team) {
  if (!Array.isArray(team) || !team.length) return '';
  return Teams.export(team);
}

/** Species + set info for team previews (including optional field synergy). */
function describeSet(set, fieldId = null) {
  const d = Dex.mod('gen9');
  const species = d.species.get(set.species);
  const affinity = fieldId ? scoreSetOnField(set, fieldId) : null;
  return {
    name: set.name || set.species,
    species: species.name || set.species,
    spriteid: species.spriteid || toID(set.species),
    types: species.types || ['Normal'],
    item: set.item,
    ability: set.ability,
    level: set.level || 50,
    nature: set.nature,
    moves: (set.moves || []).map(m => {
      const mv = d.moves.get(m);
      return {name: mv.name || m, type: mv.type || 'Normal', category: mv.category || 'Physical', basePower: mv.basePower || 0};
    }),
    gender: set.gender,
    shiny: !!set.shiny,
    baseStats: species.baseStats,
    fieldTier: affinity ? affinity.tier : 'neutral',
    fieldReasons: affinity ? affinity.reasons : [],
  };
}

module.exports = {
  FORMATS,
  randomTeam,
  createBattle,
  parseTeamPaste,
  exportTeamPaste,
  describeSet,
  publicMoveEffectiveness,
  scoreSetOnField,
  generateFieldTeam,
  generateAIMatchupTeams,
  fields,
  Dex,
  Teams,
  toID,
};
