'use strict';
/**
 * Canonical AI trainer titles across Pokémon Reborn, Rejuvenation, and Desolation,
 * plus preloaded Boss Challenge presets pairing iconic trainers with their
 * signature fields and Lv.50 Champions-legal teams.
 */
const {Dex, toID} = require('pokemon-showdown');
const {randomInt} = require('./rand');
const {getGenerator} = require('./fields/affinity');

const dex = Dex.mod('champions');

const AI_TRAINERS = [
  // Pokémon Reborn
  {name: 'Cheer Captain Julia', game: 'Reborn', fields: ['electric', 'shortcircuit']},
  {name: 'Head Instructor Florinia', game: 'Reborn', fields: ['desert', 'forest']},
  {name: 'Agent Corey', game: 'Reborn', fields: ['corrosive', 'corrosivemist']},
  {name: 'Bookworm Shelly', game: 'Reborn', fields: ['forest', 'swamp']},
  {name: 'Entity Shade', game: 'Reborn', fields: ['shortcircuit', 'darkcrystalcavern']},
  {name: 'Sensei Kiki', game: 'Reborn', fields: ['ashenbeach']},
  {name: 'Wasteland Punk Aya', game: 'Reborn', fields: ['wasteland', 'swamp']},
  {name: 'Beauty Queen Serra', game: 'Reborn', fields: ['mirror', 'icy']},
  {name: 'Prodigy Noel', game: 'Reborn', fields: ['grassy', 'holy']},
  {name: 'Grandmaster Radomus', game: 'Reborn', fields: ['chess', 'psychic']},
  {name: 'Dark Dreamer Luna', game: 'Reborn', fields: ['darkcrystalcavern', 'crystalcavern']},
  {name: 'Strongman Samson', game: 'Reborn', fields: ['bigtop', 'colosseum']},
  {name: 'Firebug Charlotte', game: 'Reborn', fields: ['superheated', 'burning']},
  {name: 'M3G4 T3RR4', game: 'Reborn', fields: ['glitch', 'desert']},
  {name: 'Skydancer Ciel', game: 'Reborn', fields: ['bigtop', 'sky', 'mountain']},
  {name: 'Visionary Adrienn', game: 'Reborn', fields: ['misty', 'fairytale', 'factory']},
  {name: 'Guardian Princess Titania', game: 'Reborn', fields: ['fairytale']},
  {name: 'Flotsam Amaria', game: 'Reborn', fields: ['watersurface', 'underwater']},
  {name: 'Rockstar Hardy', game: 'Reborn', fields: ['rocky', 'mountain']},
  {name: 'Keeper Saphira', game: 'Reborn', fields: ['dragonsden', 'cave']},
  {name: 'Wind Maiden Heather', game: 'Reborn', fields: ['mountain', 'snowymountain']},
  {name: 'Floral Artist Laura', game: 'Reborn', fields: ['flowergarden1', 'flowergarden2', 'flowergarden3', 'flowergarden4', 'flowergarden5']},
  {name: 'Imago Bennett', game: 'Reborn', fields: ['rainbow', 'flowergarden4']},
  {name: 'Starcrosser Anna', game: 'Reborn', fields: ['starlight']},
  {name: 'Meteor Champion Lin', game: 'Reborn', fields: ['newworld', 'inverse']},
  {name: 'Pretty Boy Cain', game: 'Reborn', fields: ['wasteland', 'murkwatersurface']},
  {name: 'Vagrant Scion Taka', game: 'Reborn', fields: ['corruptedcave', 'deepearth']},
  {name: 'Meteor Leader Solaris', game: 'Reborn', fields: ['volcanictop', 'burning']},

  // Pokémon Rejuvenation
  {name: 'Punk Girl Venam', game: 'Rejuvenation', fields: ['corrosive', 'backalley', 'city']},
  {name: 'Actress Narcissa', game: 'Rejuvenation', fields: ['haunted', 'bewitchedwoods']},
  {name: 'Head Ranger Crawli', game: 'Rejuvenation', fields: ['forest', 'swamp']},
  {name: 'Music Enthusiast Amber', game: 'Rejuvenation', fields: ['concert1', 'concert2', 'concert3', 'concert4', 'volcanictop']},
  {name: 'Madame X', game: 'Rejuvenation', fields: ['dimensional', 'frozendimensional', 'infernal']},
  {name: 'Puppet Master', game: 'Rejuvenation', fields: ['psychic', 'chess', 'glitch']},

  // Pokémon Desolation
  {name: 'Black Fox Boss Lilith', game: 'Desolation', fields: ['darkness1', 'darkness2', 'darkness3']},
];

function pickAIName(used = [], fieldId = null) {
  const avail = AI_TRAINERS.filter(t => !used.includes(t.name));
  if (!avail.length) return 'Wandering Ace';
  if (fieldId) {
    const fieldMatches = avail.filter(t => t.fields.includes(fieldId));
    // 65% chance to pick a signature trainer for this field when available
    if (fieldMatches.length && randomInt(100) < 65) {
      return fieldMatches[randomInt(fieldMatches.length)].name;
    }
  }
  return avail[randomInt(avail.length)].name;
}

const BOSS_DEFS = [
  {
    id: 'julia',
    name: 'Cheer Captain Julia',
    game: 'Reborn',
    subtitle: 'Peridot Gym · Electric Terrain',
    fieldId: 'electric',
    mons: ['ampharos-mega', 'raichu-alola', 'heliolisk', 'rotom', 'jolteon', 'bellibolt'],
  },
  {
    id: 'shelly',
    name: 'Bookworm Shelly',
    game: 'Reborn',
    subtitle: 'Lapis Gym · Forest Field',
    fieldId: 'forest',
    mons: ['scizor-mega', 'volcarona', 'araquanid', 'vivillon', 'heracross', 'kleavor'],
  },
  {
    id: 'aya',
    name: 'Wasteland Punk Aya',
    game: 'Reborn',
    subtitle: 'Byxbysion Gym · Wasteland',
    fieldId: 'wasteland',
    mons: ['dragalge-mega', 'toxapex', 'venusaur', 'salazzle', 'gengar', 'overqwil'],
  },
  {
    id: 'serra',
    name: 'Beauty Queen Serra',
    game: 'Reborn',
    subtitle: 'Spinel Gym · Mirror Arena',
    fieldId: 'mirror',
    mons: ['froslass-mega', 'ninetales-alola', 'glaceon', 'mamoswine', 'aurorus', 'vanilluxe'],
  },
  {
    id: 'radomus',
    name: 'Grandmaster Radomus',
    game: 'Reborn',
    subtitle: 'Vanhanen Castle · Chess Board',
    fieldId: 'chess',
    mons: ['gardevoir-mega', 'metagross', 'reuniclus', 'slowbro', 'malamar', 'gallade'],
  },
  {
    id: 'luna',
    name: 'Dark Dreamer Luna',
    game: 'Reborn',
    subtitle: 'Iolia Valley · Dark Crystal Cavern',
    fieldId: 'darkcrystalcavern',
    mons: ['sableye-mega', 'umbreon', 'tyranitar', 'weavile', 'kingambit', 'hydreigon'],
  },
  {
    id: 'charlotte',
    name: 'Firebug Charlotte',
    game: 'Reborn',
    subtitle: 'Calcenon Gym · Super-Heated Field',
    fieldId: 'superheated',
    mons: ['delphox-mega', 'ninetales', 'typhlosion', 'volcarona', 'rotom-heat', 'chandelure'],
  },
  {
    id: 'terra',
    name: 'M3G4 T3RR4',
    game: 'Reborn',
    subtitle: 'Glitch World · Glitch Field',
    fieldId: 'glitch',
    mons: ['garchomp-mega', 'hippowdon', 'excadrill', 'swampert', 'gliscor', 'clefable'],
  },
  {
    id: 'titania',
    name: 'Guardian Princess Titania',
    game: 'Reborn',
    subtitle: 'Once Upon a Somewhere · Fairy Tale Field',
    fieldId: 'fairytale',
    mons: ['scizor-mega', 'aegislash', 'excadrill', 'empoleon', 'skarmory', 'klefki'],
  },
  {
    id: 'amaria',
    name: 'Flotsam Amaria',
    game: 'Reborn',
    subtitle: 'Reshiram/Zekrom Route · Water Surface',
    fieldId: 'watersurface',
    mons: ['swampert-mega', 'milotic', 'gyarados', 'starmie', 'primarina', 'vaporeon'],
  },
  {
    id: 'saphira',
    name: 'Keeper Saphira',
    game: 'Reborn',
    subtitle: "Labradorra Gym · Dragon's Den",
    fieldId: 'dragonsden',
    mons: ['charizard-mega-x', 'dragonite', 'garchomp', 'hydreigon', 'noivern', 'archaludon'],
  },
  {
    id: 'lin',
    name: 'Meteor Champion Lin',
    game: 'Reborn',
    subtitle: 'Reborn League · New World',
    fieldId: 'newworld',
    mons: ['tyranitar-mega', 'hydreigon', 'gardevoir', 'garchomp', 'clefable', 'aegislash'],
  },
  {
    id: 'venam',
    name: 'Punk Girl Venam',
    game: 'Rejuvenation',
    subtitle: 'East Gearen Gym · Corrosive Field',
    fieldId: 'corrosive',
    mons: ['venusaur-mega', 'scolipede', 'arbok', 'salazzle', 'toxicroak', 'dragalge'],
  },
  {
    id: 'narcissa',
    name: 'Actress Narcissa',
    game: 'Rejuvenation',
    subtitle: 'Goldenleaf Theatre · Haunted Field',
    fieldId: 'haunted',
    mons: ['chandelure-mega', 'mimikyu', 'gengar', 'spiritomb', 'trevenant', 'basculegion-f'],
  },
  {
    id: 'amber',
    name: 'Music Enthusiast Amber',
    game: 'Rejuvenation',
    subtitle: 'Teila Resort · Concert Venue',
    fieldId: 'concert1',
    mons: ['charizard-mega-y', 'rotom-heat', 'pyroar', 'skeledirge', 'chandelure', 'talonflame'],
  },
  {
    id: 'lilith',
    name: 'Black Fox Boss Lilith',
    game: 'Desolation',
    subtitle: 'Black Foxes · Darkness Field',
    fieldId: 'darkness2',
    mons: ['houndoom-mega', 'zoroark', 'absol', 'spiritomb', 'chandelure', 'grimmsnarl'],
  },
];

const BOSS_BY_ID = new Map(BOSS_DEFS.map(b => [b.id, b]));

function listBosses() {
  return BOSS_DEFS.map(b => ({
    id: b.id,
    name: b.name,
    game: b.game,
    subtitle: b.subtitle,
    fieldId: b.fieldId,
  }));
}

function getBoss(id) {
  return BOSS_BY_ID.get(id) || null;
}

function buildBossTeam(bossId) {
  const b = BOSS_BY_ID.get(bossId);
  if (!b) return null;
  const gen = getGenerator();
  const team = [];
  for (const rawKey of b.mons) {
    const key = toID(rawKey);
    const sp = dex.species.get(key);
    const set = gen.randomSet(sp, {});
    set.level = 50;
    team.push(set);
  }
  // Keep Zoroark out of final slot so Illusion functions
  const zIdx = team.findIndex((s, i) => i === team.length - 1 && dex.species.get(s.species).baseSpecies === 'Zoroark');
  if (zIdx > 0) {
    const tmp = team[0];
    team[0] = team[zIdx];
    team[zIdx] = tmp;
  }
  return team;
}

module.exports = {
  AI_TRAINERS,
  pickAIName,
  listBosses,
  getBoss,
  buildBossTeam,
};
