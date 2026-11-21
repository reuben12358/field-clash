'use strict';
/**
 * Shared move groups and special battlefield effect helpers from
 * Pokemon Reborn (PBFields), Rejuvenation, and Desolation.
 */

const CHESS_MOVES = [
  'Strength', 'Ancient Power', 'Psychic', 'Secret Power', 'Barrage', 'Rock Throw',
  'Fury Attack', 'Feint', 'Feint Attack', 'Fake Out', 'Stomp', 'Smart Strike',
];

const STRIKER_MOVES = [
  'Strength', 'Wood Hammer', 'Dual Chop', 'Heat Crash', 'Sky Drop', 'Bulldoze',
  'Pound', 'Icicle Crash', 'Body Slam', 'Stomp', 'Slam', 'Giga Impact',
  'Smack Down', 'Iron Tail', 'Meteor Mash', 'Dragon Rush', 'Crabhammer', 'Bounce',
  'Heavy Slam', 'Magnitude', 'Earthquake', 'Stomping Tantrum', 'Brutal Swing',
  'High Horsepower', 'Ice Hammer', 'Dragon Hammer', 'Blaze Kick', 'Grav Apple',
  'Gigaton Hammer',
];

const WIND_MOVES = [
  'Ominous Wind', 'Icy Wind', 'Silver Wind', 'Twister', 'Razor Wind', 'Fairy Wind',
  'Gust', 'Air Cutter', 'Hurricane', 'Bleakwind Storm', 'Wildbolt Storm', 'Sandsear Storm',
  'Springtide Storm',
];

const MIRROR_BEAMS = [
  'Charge Beam', 'Solar Beam', 'Psybeam', 'Tri Attack', 'Bubble Beam', 'Hyper Beam',
  'Ice Beam', 'Origin Pulse', 'Moongeist Beam', 'Fleur Cannon', 'Aurora Beam',
  'Signal Beam', 'Flash Cannon', 'Luster Purge', 'Dazzling Gleam', 'Techno Blast',
  'Prismatic Laser', 'Photon Geyser', 'Meteor Beam', 'Twin Beam', 'Lumina Crash',
];

const BLINDING_MOVES = [
  'Aurora Beam', 'Signal Beam', 'Flash Cannon', 'Luster Purge', 'Dazzling Gleam',
  'Techno Blast', 'Prismatic Laser', 'Photon Geyser', 'Mirror Shot', 'Flash',
  'Lumina Crash',
];

const IGNITE_MOVES = [
  'Heat Wave', 'Eruption', 'Searing Shot', 'Flame Burst', 'Lava Plume', 'Fire Pledge',
  'Mind Blown', 'Incinerate', 'Raging Fury', 'Inferno', 'Blast Burn', 'Burn Up',
];

const BLOW_MOVES = [
  'Whirlwind', 'Gust', 'Razor Wind', 'Defog', 'Hurricane', 'Twister', 'Tailwind',
  'Bleakwind Storm',
];

const DOUSE_WATER_MOVES = [
  'Water Sport', 'Surf', 'Muddy Water', 'Water Spout', 'Water Pledge',
  'Sparkling Aria', 'Wave Crash', 'Chilling Water',
];

const GROW_MOVES = [
  'Growth', 'Flower Shield', 'Rain Dance', 'Sunny Day', 'Rototiller', 'Ingrain',
  'Water Sport', 'Floral Healing', 'Grassy Glide', 'Jungle Healing',
];

const QUAKE_MOVES = [
  'Earthquake', 'Bulldoze', 'Magnitude', 'Fissure', 'High Horsepower', 'Headlong Rush',
];

const FREEZE_FIELD_MOVES = ['Blizzard', 'Glaciate', 'Sheer Cold', 'Mountain Gale'];

const GEN1_SPECIAL_TYPES = new Set(['Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Psychic', 'Dragon', 'Dark']);

function isRainy(battle) {
  const w = battle.field.effectiveWeather();
  return w === 'raindance' || w === 'primordialsea';
}

function isSunny(battle) {
  const w = battle.field.effectiveWeather();
  return w === 'sunnyday' || w === 'desolateland';
}

function isHailing(battle) {
  const w = battle.field.effectiveWeather();
  return w === 'hail' || w === 'snow' || w === 'snowscape';
}

function igniteCheck({battle}) {
  return !isRainy(battle) && !battle.field.pseudoWeather.watersport;
}

function sunCheck({battle}) {
  return isSunny(battle);
}

function isProtectedFromFieldHazard(pokemon) {
  if (!pokemon || pokemon.fainted || !pokemon.hp) return true;
  if (pokemon.volatiles.protect || pokemon.volatiles.kingsshield || pokemon.volatiles.spikyshield ||
      pokemon.volatiles.banefulbunker || pokemon.volatiles.silktrap || pokemon.volatiles.burningbulwark ||
      pokemon.volatiles.obstruct || pokemon.volatiles.twoturnmove) {
    return true;
  }
  if (pokemon.side.sideConditions.wideguard) return true;
  return false;
}

function typeEffMult(battle, atkType, pokemon) {
  if (!battle.dex.getImmunity(atkType, pokemon.getTypes())) return 0;
  return Math.pow(2, battle.dex.getEffectiveness(atkType, pokemon.getTypes()));
}

/**
 * Cave ceiling collapse on second quake move.
 */
function caveCollapse({battle, state}) {
  state.counter = 0;
  battle.add('-message', 'The quake collapsed the ceiling!');
  for (const side of battle.sides) {
    for (const p of side.active) {
      if (isProtectedFromFieldHazard(p)) continue;
      if (p.hasAbility(['bulletproof', 'rockhead', 'magicguard', 'wonderguard'])) continue;
      let dmg = p.maxhp;
      if (p.hasAbility(['shellarmor', 'battlearmor'])) dmg = Math.floor(p.maxhp / 2);
      else if (p.hasAbility(['solidrock', 'filter', 'prismarmor'])) dmg = Math.floor(p.maxhp / 3);
      else if ((p.hasAbility('sturdy') && p.hp === p.maxhp) || p.volatiles.endure) dmg = Math.max(0, p.hp - 1);
      if (dmg > 0) battle.damage(dmg, p);
    }
  }
  return false;
}

/**
 * Mirror Arena shatter: deals 1/2 max HP to unprotected battlers without Shell/Battle Armor.
 */
function mirrorShatter({battle}) {
  battle.add('-message', 'The mirror arena shattered! Shards flew everywhere!');
  for (const side of battle.sides) {
    for (const p of side.active) {
      if (isProtectedFromFieldHazard(p)) continue;
      if (p.hasAbility(['shellarmor', 'battlearmor', 'magicguard', 'wonderguard'])) continue;
      battle.damage(Math.max(1, Math.floor(p.maxhp / 2)), p);
    }
  }
}

/**
 * Corrosive Mist / Corrupted Cave combustion explosion.
 */
function mistExplosion(fraction = 0.5) {
  return function ({battle}) {
    if (battle.sides.some(s => s.active.some(p => p && !p.fainted && p.hasAbility('damp')))) {
      battle.add('-message', 'Damp prevented the toxic mist from combusting!');
      return;
    }
    battle.add('-message', 'The toxic mist combusted violently!');
    for (const side of battle.sides) {
      for (const p of side.active) {
        if (isProtectedFromFieldHazard(p)) continue;
        if (p.hasAbility(['flashfire', 'wellbakedbody', 'magicguard', 'wonderguard'])) continue;
        let dmg = Math.max(1, Math.floor(p.maxhp * fraction));
        if (dmg >= p.hp && ((p.hasAbility('sturdy') && p.hp === p.maxhp) || p.volatiles.endure)) {
          dmg = Math.max(0, p.hp - 1);
        }
        if (dmg > 0) battle.damage(dmg, p);
      }
    }
  };
}

/**
 * Underwater pollution surge when turning into Murkwater Surface.
 */
function waterPollution({battle}) {
  battle.add('-message', 'Toxic sludge surged through the depths!');
  for (const side of battle.sides) {
    for (const p of side.active) {
      if (isProtectedFromFieldHazard(p)) continue;
      if (p.hasType(['Poison', 'Steel']) || p.hasAbility(['immunity', 'poisonheal', 'magicguard', 'pastelveil', 'purifyingSalt'])) continue;
      battle.damage(Math.max(1, Math.floor(p.maxhp / 2)), p);
      if (!p.status) p.trySetStatus('tox');
    }
  }
}

/**
 * Volcanic Top eruption burst.
 */
function volcanicEruption({battle}) {
  battle.add('-message', 'The volcano erupted!');
  for (const side of battle.sides) {
    for (const h of ['stealthrock', 'spikes', 'toxicspikes', 'stickyweb']) {
      if (side.removeSideCondition(h)) {
        battle.add('-sideend', side, battle.dex.conditions.get(h).name);
      }
    }
    for (const p of side.active) {
      if (!p || p.fainted || !p.hp) continue;
      if (p.volatiles.leechseed) p.removeVolatile('leechseed');
      if (p.status === 'slp' && !p.hasAbility('soundproof')) p.cureStatus();
      if (p.hasAbility('magmaarmor')) {
        battle.boost({def: 1, spd: 1}, p, p);
        continue;
      }
      if (p.hasAbility('flareboost')) {
        battle.boost({spa: 1}, p, p);
        continue;
      }
      if (isProtectedFromFieldHazard(p) || p.hasType('Fire') || p.volatiles.aquaring) continue;
      if (p.hasAbility(['flashfire', 'wellbakedbody', 'flamebody', 'blaze', 'solidrock', 'sturdy', 'battlearmor', 'shellarmor', 'waterbubble', 'magicguard', 'wonderguard', 'prismarmor'])) continue;
      const eff = typeEffMult(battle, 'Fire', p);
      if (eff <= 0) continue;
      const dmg = Math.max(1, Math.floor(p.maxhp * Math.min(0.25, 0.125 * eff)));
      battle.damage(dmg, p);
    }
  }
}

/**
 * Lower accuracy of all active Pokémon by 1 stage (steam cloud / sand swirl).
 */
function fieldAccuracyDrop(msg) {
  return function (source, target, move) {
    const st = this.rfield;
    if (!st || st.steamTurn === this.turn) return;
    st.steamTurn = this.turn;
    this.add('-message', msg);
    for (const side of this.sides) {
      for (const p of side.active) {
        if (p && !p.fainted) this.boost({accuracy: -1}, p, source, move);
      }
    }
  };
}

module.exports = {
  CHESS_MOVES,
  STRIKER_MOVES,
  WIND_MOVES,
  MIRROR_BEAMS,
  BLINDING_MOVES,
  IGNITE_MOVES,
  BLOW_MOVES,
  DOUSE_WATER_MOVES,
  GROW_MOVES,
  QUAKE_MOVES,
  FREEZE_FIELD_MOVES,
  GEN1_SPECIAL_TYPES,
  isRainy,
  isSunny,
  isHailing,
  igniteCheck,
  sunCheck,
  typeEffMult,
  caveCollapse,
  mirrorShatter,
  mistExplosion,
  waterPollution,
  volcanicEruption,
  fieldAccuracyDrop,
};
