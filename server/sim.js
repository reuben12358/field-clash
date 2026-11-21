'use strict';
/**
 * Pokemon Showdown setup: custom Champions Lv.50 formats + field engine + random teams.
 */
const {Dex, Battle, toID} = require('pokemon-showdown');
const fields = require('./fields/engine');
const {scoreSetOnField, generateFieldTeam, generateAIMatchupTeams, getGenerator} = require('./fields/affinity');

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
    ruleset: ['Adjust Level = 50', 'Species Clause', 'Sleep Clause Mod', 'Cancel Mod', 'Illusion Level Mod'],
    onBegin,
  }),
  ffa: addFormat({
    name: '[Gen 9 Champions] Reborn Field Free-For-All',
    gameType: 'freeforall',
    ruleset: ['Adjust Level = 50', 'Species Clause', 'Cancel Mod', 'Illusion Level Mod'],
    onBegin,
  }),
};

fields.install();

/** Random Lv.50 Champions-legal team. */
function randomTeam() {
  const team = getGenerator().randomTeam();
  for (const s of team) s.level = 50;
  return team;
}

function createBattle(mode, opts) {
  const format = Dex.formats.get(mode === 'ffa' ? FORMATS.ffa : FORMATS.singles);
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

/** Species + set info for team previews (including optional field synergy). */
function describeSet(set, fieldId = null) {
  const species = Dex.mod('champions').species.get(set.species);
  const affinity = fieldId ? scoreSetOnField(set, fieldId) : null;
  return {
    name: set.name || set.species,
    species: species.name,
    spriteid: species.spriteid,
    types: species.types,
    item: set.item,
    ability: set.ability,
    level: set.level || 50,
    nature: set.nature,
    moves: set.moves.map(m => {
      const mv = Dex.mod('champions').moves.get(m);
      return {name: mv.name, type: mv.type, category: mv.category, basePower: mv.basePower};
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
  describeSet,
  publicMoveEffectiveness,
  scoreSetOnField,
  generateFieldTeam,
  generateAIMatchupTeams,
  fields,
  Dex,
  toID,
};
