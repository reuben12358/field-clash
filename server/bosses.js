'use strict';
/**
 * Canonical AI trainer titles across Pokémon Reborn, Rejuvenation, and Desolation,
 * plus the full 594-fight Boss Campaign database (`boss-data.json`) pairing every
 * major story boss with their exact canonical field, species/forms, items (Seeds,
 * Crests, Mega Stones, Z-Crystals), abilities, EVs/IVs, natures, and movesets.
 */
const {randomInt} = require('./rand');
const BOSS_DATA = require('./boss-data.json');

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
  {name: 'Sensei Keta', game: 'Rejuvenation', fields: ['forest', 'holy']},
  {name: 'Child of Light Marianette', game: 'Rejuvenation', fields: ['holy']},
  {name: 'Actress Narcissa', game: 'Rejuvenation', fields: ['haunted', 'bewitchedwoods']},
  {name: 'Water Show Performer Valarie', game: 'Rejuvenation', fields: ['watersurface', 'underwater', 'murkwatersurface']},
  {name: 'Head Ranger Crawli', game: 'Rejuvenation', fields: ['forest', 'swamp']},
  {name: 'Faithful Servant Angie', game: 'Rejuvenation', fields: ['frozendimensional', 'icy', 'snowymountain']},
  {name: 'Music Enthusiast Amber', game: 'Rejuvenation', fields: ['concert1', 'concert2', 'concert3', 'concert4', 'volcanictop']},
  {name: 'Electrical Engineer Erick', game: 'Rejuvenation', fields: ['murkwatersurface', 'shortcircuit', 'electric']},
  {name: 'Botanist Flora', game: 'Rejuvenation', fields: ['bewitchedwoods', 'grassy']},
  {name: 'Spiritual Healer Souta', game: 'Rejuvenation', fields: ['sky', 'mountain']},
  {name: 'Aevium Sensation Adam', game: 'Rejuvenation', fields: ['inverse', 'rocky']},
  {name: 'Popstar Risa', game: 'Rejuvenation', fields: ['starlight', 'concert2', 'crowd']},
  {name: 'Ultimate Engineer Saki', game: 'Rejuvenation', fields: ['factory', 'glitch']},
  {name: 'Crown Prince Allen', game: 'Rejuvenation', fields: ['rainbow', 'fairytale']},
  {name: 'Crown Princess Alice', game: 'Rejuvenation', fields: ['bewitchedwoods', 'icy']},
  {name: 'Xen Dictator Madame X', game: 'Rejuvenation', fields: ['dimensional', 'frozendimensional', 'infernal']},
  {name: 'Puppet Master', game: 'Rejuvenation', fields: ['psychic', 'chess', 'glitch']},

  // Pokémon Desolation
  {name: 'Super Nerd Connor', game: 'Desolation', fields: ['burning', 'grassy']},
  {name: 'Ranger Aderyn', game: 'Desolation', fields: ['cloud', 'sky']},
  {name: 'Ninja Tristan', game: 'Desolation', fields: ['grassy', 'forest']},
  {name: 'Mascot Emily', game: 'Desolation', fields: ['electric', 'factory']},
  {name: 'Dream Catcher Aurora', game: 'Desolation', fields: ['darkness1', 'darkness2', 'darkness3']},
  {name: 'Grand Idol Rosetta', game: 'Desolation', fields: ['starlight', 'fairytale']},
  {name: 'Brawler Garret', game: 'Desolation', fields: ['colosseum']},
  {name: 'City Director Aaron', game: 'Desolation', fields: ['factory']},
  {name: 'East Icon Reeve', game: 'Desolation', fields: ['dancefloor', 'psychic']},
  {name: 'Black Fox Boss Lilith', game: 'Desolation', fields: ['darkness1', 'darkness2', 'darkness3']},
  {name: 'Black Fox Scientist Waldenhall', game: 'Desolation', fields: ['glitch', 'factory']},
  {name: 'Team Crescent Head Baron', game: 'Desolation', fields: ['volcanictop', 'forest']},
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

const LEGACY_BOSS_ALIASES = {
  julia: 'reb_cheercaptainjulia_1',
  shelly: 'reb_bookwormshelly',
  aya: 'reb_wastelandpunkaya',
  serra: 'reb_beautyqueenserra',
  radomus: 'reb_grandmasterradomus',
  luna: 'reb_darkdreamerluna',
  charlotte: 'reb_firebugcharlotte',
  terra: 'reb_m3g4t3rr4_1',
  titania: 'reb_guardianprincesstitania',
  amaria: 'reb_jetsamamaria',
  saphira: 'reb_keepersaphira',
  lin: 'reb_meteorchampionlin_1',
  venam: 'rej_punkgirlvenam_1',
  narcissa: 'rej_actressnarcissa',
  amber: 'rej_musicenthusiastamber',
  lilith: 'des_blackfoxbosslilith',
};

const BOSS_BY_ID = new Map(BOSS_DATA.map(b => [b.id, b]));

function getBoss(id) {
  if (!id) return null;
  const resolved = LEGACY_BOSS_ALIASES[id] || id;
  return BOSS_BY_ID.get(resolved) || null;
}

function listBosses() {
  return BOSS_DATA.map(b => ({
    id: b.id,
    order: b.order,
    game: b.game,
    category: b.category,
    name: b.name,
    displayName: b.displayName,
    section: b.section,
    fieldId: b.fieldId,
    fieldName: b.fieldName,
    cap: b.cap,
    ace: b.ace,
    monCount: b.team.length,
    subtitle: b.subtitle,
  }));
}

function expandBossSet(c, forceLevel = null) {
  const evs = typeof c.e === 'number'
    ? {hp: c.e, atk: c.e, def: c.e, spa: c.e, spd: c.e, spe: c.e}
    : {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...(c.e || {})};
  const ivs = typeof c.v === 'number'
    ? {hp: c.v, atk: c.v, def: c.v, spa: c.v, spd: c.v, spe: c.v}
    : {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31, ...(c.v || {})};
  return {
    name: c.s,
    species: c.s,
    level: forceLevel || c.l || 50,
    item: c.i || '',
    ability: c.a || 'Pressure',
    nature: c.n || 'Serious',
    moves: [...c.m],
    evs,
    ivs,
    gender: c.g || '',
  };
}

function buildBossTeam(bossId, {levelMode = 'lv50'} = {}) {
  const b = getBoss(bossId);
  if (!b) return null;
  const forceLevel = levelMode === 'canonical' ? null : 50;
  return b.team.map(c => expandBossSet(c, forceLevel));
}

module.exports = {
  AI_TRAINERS,
  pickAIName,
  listBosses,
  getBoss,
  expandBossSet,
  buildBossTeam,
};
