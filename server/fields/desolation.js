'use strict';
/**
 * Pokemon Desolation (Ep6) exclusive field effects (4 families / 6 states including Darkness 1-3).
 */
const {defineField} = require('./engine');

const DESO = ['Desolation'];

// 1. Cloud Field
defineField({
  id: 'cloud',
  name: 'Cloud Field',
  games: DESO,
  intro: 'Cloudy with a chance of battle!',
  mimicry: 'Flying',
  naturePower: 'Hurricane',
  secretPower: {chance: 30, boosts: {accuracy: -1}},
  theme: {bg1: '#35526b', bg2: '#192a3b', ground: '#496d8a', accent: '#b8e1ff', fx: 'wind'},
  info: [
    'Flying-type moves deal 1.3× damage; Electric moves deal 0.9×; Rock moves deal 0.75×.',
    'Fairy/Icy/Ominous/Razor/Silver Wind, Twister & Steel Wing deal an additional 1.2×.',
    'Hurricane, Thunder, Fly & Bounce have 100% accuracy!',
    'Earthquake, Bulldoze, Earth Power, Dig, Fissure, Magnitude, Spikes, Toxic Spikes & Sticky Web fail in the clouds!',
    'Cloud Nine & Forecast boost Def/SpD on switch-in; Overcoat boosts Def on switch-in.',
  ],
  mods: [
    {types: ['Flying'], mult: 1.3, msg: 'Cushioned currents boosted the attack!'},
    {types: ['Electric'], mult: 0.9},
    {types: ['Rock'], mult: 0.75, msg: 'The soft clouds cushioned the rocks...'},
    {moves: ['Fairy Wind', 'Icy Wind', 'Ominous Wind', 'Razor Wind', 'Silver Wind', 'Steel Wing', 'Twister'], mult: 1.2},
  ],
  fail: [{
    moves: ['Bulldoze', 'Dig', 'Earth Power', 'Earthquake', 'Fissure', 'Magnitude', 'Rototiller', 'Spikes', 'Sticky Web', 'Toxic Spikes'],
    msg: 'The attack fell right through the clouds!',
  }],
  accuracy: {Bounce: 100, Fly: 100, Hurricane: 100, Thunder: 100},
  onSwitchIn(pokemon) {
    if (pokemon.hasAbility(['cloudnine', 'forecast'])) this.boost({def: 1, spd: 1}, pokemon, pokemon);
    else if (pokemon.hasAbility('overcoat')) this.boost({def: 1}, pokemon, pokemon);
  },
});

// 2. Crowd Field
const CHEER_MOVES = [
  'Acrobatics', 'Aerial Ace', 'Beat Up', 'Blaze Kick', 'Body Press', 'Body Slam', 'Brave Bird',
  'Brutal Swing', 'Bullet Punch', 'Comet Punch', 'Dizzy Punch', 'Double Hit', 'Double-Edge',
  'Fire Punch', 'Giga Impact', 'Head Smash', 'Headbutt', 'Heavy Slam', 'Ice Punch', 'Iron Head',
  'Knock Off', 'Mega Kick', 'Mega Punch', 'Meteor Mash', 'Play Rough', 'Punishment', 'Shadow Punch',
  'Skull Bash', 'Slam', 'Spirit Break', 'Steel Wing', 'Strength', 'Sucker Punch', 'Thunder Punch',
  'Triple Axel', 'Trop Kick', 'Zen Headbutt',
];
const CHEER_SET = new Set(CHEER_MOVES.map(m => m.toLowerCase().replace(/[^a-z0-9]+/g, '')));

defineField({
  id: 'crowd',
  name: 'Crowd Field',
  games: DESO,
  intro: 'A crowd of spectators gathers!',
  mimicry: 'Fighting',
  naturePower: 'Brick Break',
  secretPower: {chance: 30, boosts: {def: -1}},
  theme: {bg1: '#422c1d', bg2: '#1e140e', ground: '#593b26', accent: '#f59e0b', fx: 'confetti'},
  info: [
    'CHEERS & BOOS: Damaging Fighting moves deal 1.3× and brawling/punching/slamming moves deal 1.2× — each triggers a Crowd Cheer (+1 Offense → +1 Defense → +1 Speed cycling)!',
    'Special Psychic-type moves deal 0.8× and draw a Crowd Boo (−1 highest stat)!',
    'Iron Fist boosts Defense on switch-in; Bulk Up & Work Up grant an extra +1 Speed.',
  ],
  mods: [
    {types: ['Fighting'], damaging: true, mult: 1.3, msg: 'The crowd cheered for the fighter!'},
    {types: ['Psychic'], cats: ['Special'], mult: 0.8, msg: 'Boooo! The spectators want a real brawl!'},
    {moves: CHEER_MOVES, mult: 1.2},
  ],
  onSwitchIn(pokemon) {
    if (pokemon.hasAbility('ironfist')) this.boost({def: 1}, pokemon, pokemon);
  },
  hooks: {
    onAfterMove(source, target, move) {
      if (move.category !== 'Status' && (move.type === 'Fighting' || CHEER_SET.has(move.id))) {
        const phase = source.volatiles.crowdphase?.n || 0;
        if (!source.volatiles.crowdphase) source.volatiles.crowdphase = {n: 0};
        source.volatiles.crowdphase.n = (phase + 1) % 3;
        const stat = phase === 0
          ? (source.storedStats.atk >= source.storedStats.spa ? 'atk' : 'spa')
          : phase === 1
            ? (source.storedStats.def >= source.storedStats.spd ? 'def' : 'spd')
            : 'spe';
        this.add('-message', `A cheer rang out for ${source.name}!`);
        this.boost({[stat]: 1}, source, source);
      } else if (move.category === 'Special' && move.type === 'Psychic') {
        const entries = Object.entries(source.storedStats).sort((a, b) => b[1] - a[1]);
        this.add('-message', `Boos rained down on ${source.name}!`);
        this.boost({[entries[0][0]]: -1}, source, source);
      } else if (move.id === 'bulkup' || move.id === 'workup') {
        this.boost({spe: 1}, source, source);
      }
    },
  },
});

// 3. Darkness Field (Stages 1–3; starts at Stage 2 per Desolation rules!)
const SHADOW_MOVES = [
  'Astral Barrage', 'Dark Pulse', 'False Surrender', 'Moongeist Beam', 'Night Daze',
  'Night Slash', 'Ominous Wind', 'Phantom Force', 'Shadow Ball', 'Shadow Bone', 'Shadow Claw',
  'Shadow Force', 'Shadow Punch', 'Shadow Sneak', 'Spectral Thief', 'Spirit Shackle',
  'Sucker Punch', 'Throat Chop', 'Bitter Malice', 'Kowtow Cleave', 'Poltergeist',
];
const LIGHT_MOVES = [
  'Aurora Beam', 'Dazzling Gleam', 'Doom Desire', 'Flash Cannon', 'Luster Purge',
  'Mirror Shot', 'Photon Geyser', 'Power Gem', 'Signal Beam', 'Strange Steam', 'Techno Blast',
];
const GROW_DARK = ['Astral Barrage', 'Dark Pulse', 'Moongeist Beam', 'Night Daze', 'Ominous Wind'];
const PUSH_LIGHT = ['Dazzling Gleam', 'Flash', 'Flash Cannon', 'Luster Purge', 'Photon Geyser', 'Sunny Day', 'Wish'];

const DARK_STAGES = [
  {
    stage: 1, shadowMult: 1.1, lightMult: 0.9, defMult: 1,
    intro: 'A shroud of darkness, however slight, gently envelops the field... (Stage 1/3)',
  },
  {
    stage: 2, shadowMult: 1.2, lightMult: 0.75, defMult: 1.12,
    intro: 'The thick fog of darkness feels constricting... (Stage 2/3)',
  },
  {
    stage: 3, shadowMult: 1.4, lightMult: 0.5, defMult: 1.33,
    intro: 'In an endless sea of darkness, any glimmer of hope fades away... (Stage 3/3)',
  },
];

for (const d of DARK_STAGES) {
  const s = d.stage;
  const transforms = [];
  if (s === 1) {
    transforms.push({moves: ['Dark Void'], to: 'darkness3', msg: 'Plunged straight into the abyss!'});
    transforms.push({moves: GROW_DARK, to: 'darkness2', msg: 'The shadows grew thicker!'});
  } else if (s === 2) {
    transforms.push({moves: [...GROW_DARK, 'Dark Void'], to: 'darkness3', msg: 'The shadows engulfed the battlefield!'});
    transforms.push({moves: PUSH_LIGHT, to: 'darkness1', msg: 'The shadows retreated from the light!'});
    transforms.push({weather: ['sunnyday', 'desolateland'], to: 'darkness1', msg: 'Bright sunlight pushed back the darkness!'});
  } else if (s === 3) {
    transforms.push({moves: PUSH_LIGHT, to: 'darkness2', msg: 'A ray of light pierced the abyss!'});
    transforms.push({weather: ['sunnyday', 'desolateland'], to: 'darkness2', msg: 'Sunlight weakened the abyssal fog!'});
  }

  defineField({
    id: `darkness${s}`,
    family: 'darkness',
    stage: s,
    random: s === 2, // Desolation starts Darkness Field at Stage 2!
    name: `Darkness Field (Stage ${s})`,
    games: DESO,
    intro: d.intro,
    mimicry: 'Dark',
    naturePower: 'Dark Pulse',
    secretPower: {chance: 30, boosts: {def: -1}},
    theme: {bg1: s === 3 ? '#0e1017' : '#181c28', bg2: '#05060a', ground: '#151924', accent: '#6c8ebf', fx: 'wisp'},
    info: [
      `Stage ${s}/3 — Shadow & Dark signature attacks deal ${d.shadowMult}×; Light & beam attacks deal ${d.lightMult}×!`,
      s >= 2 ? `Dark- & Ghost-type Pokémon gain ${d.defMult}× Def & Sp. Def${s === 3 ? ' AND their type weaknesses are annulled' : ''}! Solar Beam & Solar Blade fail; Dark Void has ${s === 3 ? 100 : 70}% accuracy.` : 'At Stage 2+, Dark & Ghost types take reduced damage and Solar Beam/Blade fail.',
      'Dark Pulse, Night Daze, Ominous Wind, Moongeist Beam, Astral Barrage & Dark Void deepen the Darkness (+stage).',
      'Dazzling Gleam, Flash Cannon, Photon Geyser, Luster Purge, Wish & Sunny Day push the Darkness back (−stage)!',
    ],
    mods: [
      {moves: SHADOW_MOVES, mult: d.shadowMult, msg: 'Shadows surged with the attack!'},
      {moves: LIGHT_MOVES, mult: d.lightMult, msg: 'The darkness swallowed the light...'},
    ],
    fail: s >= 2 ? [{moves: ['Solar Beam', 'Solar Blade'], msg: 'No sunlight reaches through the shrouding darkness!'}] : [],
    accuracy: s === 3 ? {'Dark Void': 100} : s === 2 ? {'Dark Void': 70} : {},
    defMods: d.defMult > 1 ? [{types: ['Dark', 'Ghost'], stat: 'both', mult: d.defMult}] : [],
    onSwitchIn(pokemon) {
      if (pokemon.hasAbility('rattled') || (s >= 2 && pokemon.hasAbility('pickpocket'))) {
        this.boost({spe: 1}, pokemon, pokemon);
      }
    },
    hooks: s === 3 ? {
      onEffectiveness(typeMod, target, type) {
        if ((type === 'Dark' || type === 'Ghost') && typeMod > 0) return 0;
        return typeMod;
      },
    } : {},
    transforms,
  });
}

// 4. Dance Floor Field
defineField({
  id: 'dancefloor',
  name: 'Dance Floor Field',
  games: DESO,
  intro: "The dance floor beckons... it's time to bust a move!",
  mimicry: 'Psychic',
  naturePower: 'Psyshock',
  secretPower: {chance: 30, volatileStatus: 'confusion'},
  theme: {bg1: '#1e3240', bg2: '#0d1720', ground: '#2a4557', accent: '#2ec4b6', fx: 'prism'},
  info: [
    'Psychic-type moves deal 1.3× damage!',
    'Fiery Dance, Petal Dance, Revelation Dance & Aqua Step deal 1.4×!',
    'Sound & dazzling light moves (Hyper/Echoed/Disarming Voice, Boomburst, Overdrive, Relic Song, Sparkling Aria, Dazzling Gleam, Flash Cannon, Aura Sphere, Mystical Fire, Eerie Spell) deal 1.2×.',
    'Using Dragon Dance, Quiver Dance, Swords Dance, Victory Dance, Feather Dance or Teeter Dance grants an extra +1 Speed groove boost!',
  ],
  mods: [
    {types: ['Psychic'], mult: 1.3, msg: 'Grooving on the beat!'},
    {moves: ['Fiery Dance', 'Petal Dance', 'Revelation Dance', 'Aqua Step'], mult: 1.4, msg: 'What footwork!'},
    {
      moves: ['Aura Sphere', 'Boomburst', 'Bug Buzz', 'Chatter', 'Clanging Scales', 'Dazzling Gleam',
        'Disarming Voice', 'Echoed Voice', 'Eerie Spell', 'Flash Cannon', 'Hyper Voice', 'Mystical Fire',
        'Overdrive', 'Relic Song', 'Round', 'Signal Beam', 'Snarl', 'Sparkling Aria', 'Uproar', 'Torch Song', 'Alluring Voice'],
      mult: 1.2,
    },
  ],
  hooks: {
    onAfterMove(source, target, move) {
      if (['dragondance', 'quiverdance', 'swordsdance', 'victorydance', 'featherdance', 'teeterdance'].includes(move.id)) {
        this.boost({spe: 1}, source, source);
      }
    },
  },
});
