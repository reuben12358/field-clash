'use strict';
/**
 * Pokemon Showdown setup: custom Champions formats + field engine + random teams.
 */
const {Dex, Teams, Battle, toID} = require('pokemon-showdown');
const fields = require('./fields/engine');

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
    ruleset: ['Species Clause', 'Sleep Clause Mod', 'Cancel Mod', 'Illusion Level Mod'],
    onBegin,
  }),
  ffa: addFormat({
    name: '[Gen 9 Champions] Reborn Field Free-For-All',
    gameType: 'freeforall',
    ruleset: ['Species Clause', 'Cancel Mod', 'Illusion Level Mod'],
    onBegin,
  }),
};

fields.install();

/** Random Champions-legal team (uses Showdown's [Gen 9 Champions] Random Battle generator). */
function randomTeam() {
  return Teams.generate('gen9championsrandombattle');
}

function createBattle(mode, opts) {
  const format = Dex.formats.get(mode === 'ffa' ? FORMATS.ffa : FORMATS.singles);
  return new Battle({format, send: opts.send, seed: opts.seed});
}

/** Minimal species info for team previews. */
function describeSet(set) {
  const species = Dex.mod('champions').species.get(set.species);
  return {
    name: set.name || set.species,
    species: species.name,
    spriteid: species.spriteid,
    types: species.types,
    item: set.item,
    ability: set.ability,
    level: set.level,
    nature: set.nature,
    moves: set.moves.map(m => {
      const mv = Dex.mod('champions').moves.get(m);
      return {name: mv.name, type: mv.type, category: mv.category, basePower: mv.basePower};
    }),
    gender: set.gender,
    shiny: !!set.shiny,
    baseStats: species.baseStats,
  };
}

module.exports = {FORMATS, randomTeam, createBattle, describeSet, fields, Dex, toID};
