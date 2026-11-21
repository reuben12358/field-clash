'use strict';
/**
 * Pokemon Reborn fields (Part A: #1 Electric Terrain through #19 Wasteland),
 * including cross-game transformations from Rejuvenation and Desolation.
 */
const {defineField, ALL_TYPES} = require('./engine');
const H = require('./helpers');

const ALL3 = ['Reborn', 'Rejuvenation', 'Desolation'];
const REB_REJ = ['Reborn', 'Rejuvenation'];
const REB_DES = ['Reborn', 'Desolation'];

// 1. Electric Terrain
defineField({
  id: 'electric',
  name: 'Electric Terrain',
  games: ALL3,
  terrain: 'electricterrain',
  intro: 'The field is hyper-charged!',
  mimicry: 'Electric',
  naturePower: 'Thunderbolt',
  secretPower: {chance: 30, status: 'par'},
  theme: {bg1: '#3b3210', bg2: '#17150a', ground: '#4a3d12', accent: '#f5c531', fx: 'sparks'},
  info: [
    'Grounded Pokémon cannot fall asleep; Electric moves from grounded attackers deal 1.5× damage.',
    'Magnet Bomb deals 2× damage.',
    'Surf, Muddy Water, Hurricane, Smack Down, Thousand Arrows, Explosion & Self-Destruct deal 1.5× damage and gain Electric typing.',
    'Activates Surge Surfer (2× Speed); Motor Drive boosts Speed at end of turn; Focus Punch fails.',
    'Transforms: Mud Sport shorts out the field.',
  ],
  mods: [
    // Native terrain already gives 1.3x grounded Electric in Gen 8/9; top up to Reborn's 1.5x (~1.15x extra)
    {types: ['Electric'], grounded: true, mult: 1.15, msg: 'The hyper-charged terrain boosted the attack!'},
    {moves: ['Magnet Bomb'], mult: 2, msg: 'The magnetic charge super-powered the attack!'},
    {
      moves: ['Explosion', 'Self-Destruct', 'Hurricane', 'Surf', 'Muddy Water', 'Smack Down', 'Thousand Arrows', 'Wildbolt Storm'],
      mult: 1.5,
      msg: 'The attack was hyper-charged!',
    },
  ],
  typeAdd: [
    {moves: ['Explosion', 'Self-Destruct', 'Hurricane', 'Surf', 'Muddy Water', 'Smack Down', 'Thousand Arrows'], add: 'Electric'},
  ],
  fail: [{moves: ['Focus Punch'], msg: 'The hyper-charged current disrupted Focus Punch!'}],
  speMods: [{abilities: ['Surge Surfer'], mult: 2}],
  preventStatus: [{status: ['slp'], grounded: true, msg: 'The electric current prevents sleep!'}],
  residual(pokemon) {
    if (pokemon.hasAbility('motordrive')) this.boost({spe: 1}, pokemon, pokemon);
  },
  transforms: [
    {moves: ['Mud Sport'], to: 'backup', msg: 'The hyper-charged terrain shorted out!'},
  ],
});

// 2. Grassy Terrain
defineField({
  id: 'grassy',
  name: 'Grassy Terrain',
  games: ALL3,
  terrain: 'grassyterrain',
  intro: 'The field is in full bloom.',
  mimicry: 'Grass',
  naturePower: 'Energy Ball',
  secretPower: {chance: 30, status: 'slp'},
  theme: {bg1: '#183822', bg2: '#0d1e13', ground: '#214d2d', accent: '#58c964', fx: 'spores'},
  info: [
    'Grounded Pokémon recover 1/16 max HP each turn; grounded Grass attacks deal 1.5× damage.',
    'Fire attacks against grounded targets deal 1.5× damage!',
    'Wind moves & Grass Knot deal 1.5×; Earthquake, Bulldoze, Magnitude, Surf & Muddy Water deal 0.5×.',
    'Activates Grass Pelt (1.5× Defense); Sap Sipper heals 1/16 HP per turn.',
    'Transforms: Flame spread moves → Burning Field; Sludge Wave → Corrosive Field; Surf / Muddy Water (repeated) → Swamp Field.',
  ],
  mods: [
    {types: ['Grass'], grounded: true, mult: 1.15},
    {types: ['Fire'], targetGrounded: true, mult: 1.5, msg: 'The grass below caught flame!'},
    {moves: ['Fairy Wind', 'Silver Wind', 'Ominous Wind', 'Icy Wind', 'Razor Wind', 'Gust', 'Twister', 'Grass Knot'], mult: 1.5},
    {moves: ['Muddy Water', 'Surf'], mult: 0.5, msg: 'The tall grass dampened the wave...'},
  ],
  accuracy: {'Grass Whistle': 80},
  defMods: [{abilities: ['Grass Pelt'], stat: 'def', mult: 1.5}],
  residual(pokemon) {
    if (pokemon.hasAbility('sapsipper') && pokemon.hp < pokemon.maxhp) {
      this.heal(Math.max(1, Math.floor(pokemon.maxhp / 16)), pokemon);
    }
  },
  counters: [
    {moves: ['Surf'], add: 1, threshold: 3, to: 'swamp', progressMsg: 'The grass is getting marshy!', msg: 'The grassy terrain became a Swamp!'},
    {moves: ['Muddy Water'], add: 2, threshold: 3, to: 'swamp', progressMsg: 'The grass is getting marshy!', msg: 'The grassy terrain became a Swamp!'},
  ],
  transforms: [
    {moves: H.IGNITE_MOVES, cond: H.igniteCheck, to: 'burning', msg: 'The grassy terrain caught fire!'},
    {moves: ['Sludge Wave'], to: 'corrosive', msg: 'The grassy terrain was corroded!'},
  ],
});

// 3. Misty Terrain
defineField({
  id: 'misty',
  name: 'Misty Terrain',
  games: ALL3,
  terrain: 'mistyterrain',
  intro: 'Mist settles on the field.',
  mimicry: 'Fairy',
  naturePower: 'Mist Ball',
  secretPower: {chance: 30, boosts: {spa: -1}},
  theme: {bg1: '#3a243b', bg2: '#1b1422', ground: '#4a2e4c', accent: '#eb87b5', fx: 'mist'},
  info: [
    'Grounded Pokémon are immune to status; Dragon attacks deal 0.5× damage.',
    'Fairy-type Pokémon gain 1.5× Sp. Def; Marvel Scale is active.',
    'Moonblast, Dazzling Gleam, Mystical Fire, Aura Sphere, Magical Leaf, Steam Eruption & Fairy/Silver/Icy Wind deal 1.5×.',
    'Dark Pulse, Night Daze & Shadow Ball deal 0.5×; Explosion, Self-Destruct & Mind Blown fail.',
    'Transforms: Wind moves clear the mist; Smog / Clear Smog / Poison Gas (2×) → Corrosive Mist.',
  ],
  mods: [
    {
      moves: ['Aura Sphere', 'Dazzling Gleam', 'Doom Desire', 'Fairy Wind', 'Icy Wind', 'Magical Leaf',
        'Mist Ball', 'Moonblast', 'Moongeist Beam', 'Mystical Fire', 'Silver Wind', 'Steam Eruption', 'Strange Steam'],
      mult: 1.5,
      msg: 'The mist empowered the attack!',
    },
    {moves: ['Dark Pulse', 'Night Daze', 'Shadow Ball'], mult: 0.5, msg: 'The mist softened the shadows...'},
  ],
  fail: [{moves: ['Explosion', 'Self-Destruct', 'Mind Blown'], msg: 'The damp mist prevented the explosion!'}],
  defMods: [
    {types: ['Fairy'], stat: 'spd', mult: 1.5},
    {abilities: ['Marvel Scale'], stat: 'def', mult: 1.5},
  ],
  residual(pokemon) {
    if (pokemon.hasAbility('dryskin') && pokemon.hp < pokemon.maxhp) {
      this.heal(Math.max(1, Math.floor(pokemon.maxhp / 8)), pokemon);
    }
  },
  counters: [
    {
      moves: ['Smog', 'Clear Smog', 'Poison Gas'],
      add: 1,
      threshold: 2,
      to: 'corrosivemist',
      progressMsg: 'Poison spread through the mist!',
      msg: 'The mist was corroded!',
    },
  ],
  transforms: [
    {moves: H.BLOW_MOVES, to: 'backup', msg: 'The mist was blown away!'},
  ],
});

// 4. Psychic Terrain
defineField({
  id: 'psychic',
  name: 'Psychic Terrain',
  games: ALL3,
  terrain: 'psychicterrain',
  intro: 'The field became mysterious!',
  mimicry: 'Psychic',
  naturePower: 'Psychic',
  secretPower: {chance: 30, volatileStatus: 'confusion'},
  theme: {bg1: '#3c1e38', bg2: '#1a1020', ground: '#4e2547', accent: '#f06292', fx: 'rings'},
  info: [
    'Grounded Pokémon are protected from priority moves; grounded Psychic moves deal 1.5× damage.',
    'Aura Sphere, Focus Blast, Hex, Magical Leaf, Mind Blown, Moonblast & Mystical Fire deal 1.5× damage.',
    'Hypnosis has 90% accuracy; Telepathy doubles Speed.',
  ],
  mods: [
    {types: ['Psychic'], grounded: true, mult: 1.15},
    {moves: ['Aura Sphere', 'Focus Blast', 'Hex', 'Magical Leaf', 'Mind Blown', 'Moonblast', 'Mystical Fire', 'Secret Power'], mult: 1.5},
  ],
  accuracy: {Hypnosis: 90},
  speMods: [{abilities: ['Telepathy'], mult: 2}],
});

// 5. Dark Crystal Cavern
defineField({
  id: 'darkcrystalcavern',
  name: 'Dark Crystal Cavern',
  games: REB_REJ,
  intro: 'Darkness is gathering...',
  mimicry: 'Dark',
  naturePower: 'Dark Pulse',
  secretPower: {chance: 30, boosts: {accuracy: -1}},
  seedItem: 'psychicseed',
  seedBoosts: {spd: 1},
  theme: {bg1: '#1a1c2e', bg2: '#0b0d17', ground: '#23263d', accent: '#6289d8', fx: 'crystals'},
  info: [
    'Dark- and Ghost-type Pokémon gain 1.5× Defense and Sp. Def!',
    'Prismatic Laser deals 2×; Dark Pulse, Night Daze, Night Slash, Shadow Ball/Claw/Bone/Sneak/Force, Moongeist Beam, Power Gem, Diamond Storm & light beams deal 1.5×.',
    'Dark Void has 100% accuracy; Solar Beam & Solar Blade fail.',
    'Transforms: Earthquake / Bulldoze / Magnitude → Cave; Sunny weather → Crystal Cavern.',
  ],
  mods: [
    {moves: ['Prismatic Laser'], mult: 2, msg: 'The dark crystal split the laser!'},
    {
      moves: ['Aurora Beam', 'Dark Pulse', 'Dazzling Gleam', 'Diamond Storm', 'Doom Desire', 'Flash Cannon',
        'Luster Purge', 'Mirror Shot', 'Moongeist Beam', 'Night Daze', 'Night Slash', 'Photon Geyser',
        'Power Gem', 'Shadow Ball', 'Shadow Bone', 'Shadow Claw', 'Shadow Force', 'Shadow Punch',
        'Shadow Sneak', 'Signal Beam', 'Techno Blast'],
      mult: 1.5,
      msg: 'The dark crystals amplified the attack!',
    },
  ],
  fail: [{moves: ['Solar Beam', 'Solar Blade'], msg: 'There is no sunlight in the Dark Crystal Cavern!'}],
  accuracy: {'Dark Void': 100},
  defMods: [
    {types: ['Dark', 'Ghost'], stat: 'both', mult: 1.5},
    {abilities: ['Prism Armor'], stat: 'both', mult: 1.33},
  ],
  transforms: [
    {moves: H.QUAKE_MOVES, to: 'cave', msg: 'The dark crystals were shattered!'},
    {weather: ['sunnyday', 'desolateland'], to: 'crystalcavern', msg: 'The sun lit up the crystal cavern!'},
  ],
});

// 6. Chess Board
defineField({
  id: 'chess',
  name: 'Chess Board',
  games: ALL3,
  intro: 'Opening variation set.',
  mimicry: 'Psychic',
  naturePower: 'Ancient Power',
  secretPower: {chance: 30, boosts: {def: -1}},
  theme: {bg1: '#282c34', bg2: '#12151a', ground: '#343944', accent: '#d8b25c', fx: 'motes'},
  info: [
    'Chess moves (Psychic, Ancient Power, Strength, Secret Power) deal 1.5× damage and gain Rock typing (2× vs Oblivious/Unaware/Simple/Klutz or confused foes!).',
    'Priority & feint moves (Fake Out, Feint, Feint Attack, First Impression, Shadow Sneak, Sucker Punch, Smart Strike) deal 1.5× damage.',
    'Queen (final party slot) deals 1.2× damage & gains 1.2× Def/SpD; Calm Mind & Nasty Plot gain an extra +1 SpD/Spe.',
    'Transforms: Stomping Tantrum flips the board!',
  ],
  mods: [
    {
      moves: ['Ancient Power', 'Fake Out', 'Feint', 'Feint Attack', 'First Impression', 'Psychic',
        'Secret Power', 'Shadow Sneak', 'Smart Strike', 'Strength', 'Sucker Punch'],
      mult: 1.5,
      msg: 'Check!',
    },
    {
      moves: H.CHESS_MOVES,
      cond({target}) {
        return target && (target.volatiles.confusion || target.hasAbility(['oblivious', 'simple', 'unaware', 'klutz']));
      },
      mult: 2,
      msg: 'Outmaneuvered on the board!',
    },
    {
      anyMove: true,
      damaging: true,
      cond({source}) {
        return source && source === source.side.pokemon[source.side.pokemon.length - 1];
      },
      mult: 1.2,
    },
  ],
  typeAdd: [{moves: ['Ancient Power', 'Psychic', 'Secret Power', 'Strength'], add: 'Rock'}],
  defMods: [
    {
      stat: 'both',
      mult: 1.2,
      cond({pokemon}) {
        return pokemon && pokemon === pokemon.side.pokemon[pokemon.side.pokemon.length - 1];
      },
    },
  ],
  hooks: {
    onAfterMove(source, target, move) {
      if (move.id === 'calmmind' || move.id === 'nastyplot') {
        this.boost({spd: 1}, source, source);
      }
    },
  },
  transforms: [
    {moves: ['Stomping Tantrum'], to: 'backup', msg: 'The board was flipped and destroyed!'},
  ],
});

// 7. Big Top Arena
defineField({
  id: 'bigtop',
  name: 'Big Top Arena',
  games: REB_REJ,
  intro: 'Now presenting...!',
  mimicry: 'Normal',
  naturePower: 'Acrobatics',
  secretPower: {chance: 30, boosts: {spd: -1}},
  theme: {bg1: '#421d1d', bg2: '#1e0e10', ground: '#592822', accent: '#f0b23a', fx: 'confetti'},
  info: [
    'High-Striker moves (slams, hammers, kicks, quakes & physical Fighting attacks) roll between 0.5× and 3× power — boosted Attack or Huge/Pure Power/Guts/Sheer Force weights high rolls!',
    'Sound-based moves, Dance moves, Acrobatics, Fly, First Impression, Power Whip, Fire Lash & Vine Whip deal 1.5×; Pay Day deals 2×.',
    'Sing has 100% accuracy; Swords Dance, Dragon Dance & Quiver Dance grant heightened crowd energy.',
  ],
  mods: [
    {moves: ['Pay Day'], mult: 2, msg: 'Coins showered the arena!'},
    {flags: 'sound', damaging: true, mult: 1.5, msg: 'Loud and clear!'},
    {
      moves: ['Acrobatics', 'Fiery Dance', 'Fire Lash', 'First Impression', 'Fly', 'Petal Dance', 'Power Whip', 'Revelation Dance', 'Vine Whip', 'Aqua Step'],
      mult: 1.5,
      msg: 'What a performance!',
    },
    {
      moves: H.STRIKER_MOVES,
      mult({battle, source}) {
        const rolls = [0.5, 1, 1.25, 1.5, 2, 3];
        let idx = battle.random(rolls.length);
        if (source?.hasAbility(['hugepower', 'purepower', 'guts', 'sheerforce']) || (source?.boosts?.atk || 0) > 0) {
          idx = Math.max(idx, battle.random(rolls.length));
        }
        const m = rolls[idx];
        const bell = m >= 3 ? 'RING-A-DING!! 3× Bell Ringer!' : m >= 2 ? 'High Striker: Great hit! (2×)' : m <= 0.5 ? 'High Striker: Weak swing... (0.5×)' : `High Striker: ${m}×!`;
        battle.add('-message', bell);
        return m;
      },
    },
  ],
  accuracy: {Sing: 100},
});

// 8. Burning Field / Volcanic Field
defineField({
  id: 'burning',
  name: 'Burning Field',
  games: ALL3,
  intro: 'The field is ablaze!',
  mimicry: 'Fire',
  naturePower: 'Flamethrower',
  secretPower: {chance: 30, status: 'brn'},
  theme: {bg1: '#4d1c12', bg2: '#1f0b07', ground: '#662414', accent: '#f46a25', fx: 'embers'},
  info: [
    'Grounded Fire attacks deal 1.5× damage; Ice attacks and Grass attacks vs grounded targets deal 0.5×.',
    'Non-Fire grounded Pokémon take Fire-effectiveness burn hazard damage (1/8 base) each turn (Flame Body, Flash Fire, Magma Armor, Heatproof, Water Bubble/Veil immune; Fluffy/Grass Pelt/Ice Body take 2×).',
    'Smack Down & Thousand Arrows deal 2×; Smog, Clear Smog & Infernal Parade deal 1.5× — all gain Fire typing!',
    'Will-O-Wisp has 100% accuracy; Pokémon cannot be frozen; Hail fails.',
    'Transforms: Surf / Muddy Water / Sludge Wave / Defog / Hurricane / Tailwind / Sandstorm / Rain snuffs out the blaze!',
  ],
  mods: [
    {types: ['Fire'], grounded: true, mult: 1.5, msg: 'The blaze amplified the attack!'},
    {types: ['Grass'], targetGrounded: true, mult: 0.5, msg: 'The blaze scorched the attack...'},
    {types: ['Ice'], mult: 0.5, msg: 'The blaze softened the ice...'},
    {moves: ['Smack Down', 'Thousand Arrows'], mult: 2, msg: 'Knocked right into the flames!'},
    {moves: ['Smog', 'Clear Smog', 'Infernal Parade', 'Rock Slide'], mult: 1.5, msg: 'The flames spread through the attack!'},
  ],
  typeAdd: [
    {moves: ['Smack Down', 'Thousand Arrows', 'Smog', 'Clear Smog', 'Rock Slide'], add: 'Fire'},
  ],
  fail: [{moves: ['Hail', 'Snowscape'], msg: 'The intense blaze melted the snow away!'}],
  accuracy: {'Will-O-Wisp': 100},
  preventStatus: [{status: ['frz'], msg: 'The blazing heat prevents freezing!'}],
  residual(pokemon) {
    if (!pokemon.isGrounded() || pokemon.hasType('Fire') || pokemon.volatiles.aquaring) return;
    if (pokemon.hasAbility(['flamebody', 'flareboost', 'flashfire', 'wellbakedbody', 'heatproof', 'magmaarmor', 'waterbubble', 'waterveil', 'magicguard', 'wonderguard', 'thermalexchange'])) return;
    const eff = H.typeEffMult(this, 'Fire', pokemon);
    if (eff <= 0) return;
    let dmg = Math.floor(pokemon.maxhp * eff / 8);
    if (pokemon.hasAbility(['fluffy', 'grasspelt', 'icebody', 'leafguard', 'dryskin'])) dmg *= 2;
    this.damage(Math.max(1, dmg), pokemon);
  },
  transforms: [
    {moves: [...H.DOUSE_WATER_MOVES, ...H.BLOW_MOVES, 'Sludge Wave', 'Sand Tomb'], to: 'backup', msg: 'The flames were snuffed out!'},
    {weather: ['raindance', 'primordialsea', 'sandstorm'], to: 'backup', msg: 'The weather snuffed out the blaze!'},
  ],
});

// 9. Swamp Field
defineField({
  id: 'swamp',
  name: 'Swamp Field',
  games: ALL3,
  intro: 'The field is swamped.',
  mimicry: 'Water',
  naturePower: 'Muddy Water',
  secretPower: {chance: 30, boosts: {spe: -1}},
  theme: {bg1: '#233329', bg2: '#101914', ground: '#2d3f2e', accent: '#7ab85c', fx: 'bubbles'},
  info: [
    'Grounded Pokémon lose 1 stage of Speed at the end of each turn!',
    'Poison attacks against grounded foes deal 1.5× damage; Sleep Powder has 100% accuracy.',
    'Surf, Muddy Water, Brine, Sludge Wave, Gunk Shot, Mud Bomb/Shot/Slap, Smack Down & Thousand Arrows deal 1.5×.',
    'Earthquake, Bulldoze & Magnitude sink into the mire (0.25×); Explosion, Self-Destruct & Mind Blown fail.',
  ],
  mods: [
    {types: ['Poison'], targetGrounded: true, mult: 1.5, msg: 'Poison permeated the swamp!'},
    {
      moves: ['Brine', 'Gunk Shot', 'Mud Bomb', 'Mud Shot', 'Mud-Slap', 'Muddy Water', 'Sludge Wave', 'Smack Down', 'Surf', 'Thousand Arrows'],
      mult: 1.5,
      msg: 'The murky mire strengthened the attack!',
    },
    {moves: ['Bulldoze', 'Earthquake', 'Magnitude'], mult: 0.25, msg: 'The attack dissipated in the marshy ground...'},
  ],
  typeAdd: [{moves: ['Smack Down', 'Thousand Arrows'], add: 'Water'}],
  fail: [{moves: ['Explosion', 'Self-Destruct', 'Mind Blown'], msg: 'The thick mud smothered the explosion!'}],
  accuracy: {'Sleep Powder': 100},
  residual(pokemon) {
    if (pokemon.isGrounded() && !pokemon.hasAbility(['clearbody', 'whitesmoke', 'fullmetalbody', 'goodasgold'])) {
      this.boost({spe: -1}, pokemon, pokemon);
    }
    if (pokemon.status === 'slp' && !pokemon.hasAbility('magicguard')) {
      this.damage(Math.max(1, Math.floor(pokemon.maxhp / 16)), pokemon);
    }
  },
});

// 10. Rainbow Field
defineField({
  id: 'rainbow',
  name: 'Rainbow Field',
  games: ALL3,
  intro: 'What does it mean?',
  mimicry: 'Dragon',
  naturePower: 'Aurora Beam',
  secretPower: {chance: 60, status: 'par'},
  theme: {bg1: '#2a3548', bg2: '#141c29', ground: '#313d52', accent: '#48c9b0', fx: 'prism'},
  info: [
    'All move secondary effect chances are doubled! Sleeping Pokémon heal 1/16 HP per turn.',
    'Special Normal moves deal 1.5× damage and gain a random extra elemental type!',
    'Beam, Pledge, Gleam, Moonblast, Dragon Pulse, Mystical Fire, Sacred Fire, Solar Beam/Blade, Weather Ball & Tri Attack deal 1.5×.',
    'Dark Pulse, Night Daze & Shadow Ball deal 0.5×; Marvel Scale & Prism Armor are boosted.',
    'Transforms: Sandstorm or Hail disperses the rainbow.',
  ],
  mods: [
    {types: ['Normal'], cats: ['Special'], mult: 1.5, msg: 'The rainbow refracted the attack!'},
    {
      moves: ['Aurora Beam', 'Dazzling Gleam', 'Dragon Pulse', 'Fire Pledge', 'Fleur Cannon', 'Grass Pledge',
        'Heart Stamp', 'Judgment', 'Mist Ball', 'Moonblast', 'Mystical Fire', 'Prismatic Laser', 'Relic Song',
        'Sacred Fire', 'Secret Power', 'Silver Wind', 'Solar Beam', 'Solar Blade', 'Sparkling Aria',
        'Tri Attack', 'Water Pledge', 'Weather Ball', 'Zen Headbutt'],
      mult: 1.5,
      msg: 'The rainbow powered up the attack!',
    },
    {moves: ['Dark Pulse', 'Night Daze', 'Shadow Ball'], mult: 0.5, msg: 'The rainbow softened the darkness...'},
  ],
  typeAdd: [
    {
      types: ['Normal'],
      cats: ['Special'],
      add({battle}) {
        return ALL_TYPES[battle.random(ALL_TYPES.length)];
      },
    },
  ],
  defMods: [
    {abilities: ['Marvel Scale'], stat: 'def', mult: 1.5},
    {abilities: ['Prism Armor'], stat: 'both', mult: 1.33},
  ],
  hooks: {
    onModifyMove(move) {
      if (move.secondaries) {
        for (const s of move.secondaries) {
          if (s.chance && s.chance < 100) s.chance = Math.min(100, s.chance * 2);
        }
      }
    },
  },
  residual(pokemon) {
    if (pokemon.status === 'slp' && pokemon.hp < pokemon.maxhp) {
      this.heal(Math.max(1, Math.floor(pokemon.maxhp / 16)), pokemon);
    }
    if (pokemon.hasAbility('cloudnine')) {
      const stats = ['atk', 'def', 'spa', 'spd', 'spe'];
      this.boost({[stats[this.random(stats.length)]]: 1}, pokemon, pokemon);
    }
  },
  transforms: [
    {weather: ['sandstorm', 'hail', 'snow', 'snowscape'], to: 'backup', msg: 'The harsh weather dispersed the rainbow!'},
  ],
});

// 11. Corrosive Field
defineField({
  id: 'corrosive',
  name: 'Corrosive Field',
  games: ALL3,
  intro: 'The field is corrupted!',
  mimicry: 'Poison',
  naturePower: 'Acid Spray',
  secretPower: {chance: 30, status: 'psn'},
  theme: {bg1: '#2e3818', bg2: '#151a0c', ground: '#3d4a1c', accent: '#a8d838', fx: 'acid'},
  info: [
    'Grounded non-Poison/Steel Pokémon take corrosive damage on switch-in (1/8 base, Poison-effectiveness scaled)!',
    'Acid, Acid Spray & Grass Knot deal 2× damage; all Grass-type attacks gain Poison typing!',
    'Mud Bomb, Mud Shot, Mud-Slap, Muddy Water, Smack Down, Thousand Arrows & Whirlpool deal 1.5× and gain Poison typing.',
    'Toxic, Sleep Powder, Poison Powder & Stun Spore have 100% accuracy; Poison Heal heals 1/8 HP grounded.',
    'Transforms: Seed Flare or Purify cleanses into Grassy Terrain.',
  ],
  mods: [
    {moves: ['Acid', 'Acid Spray', 'Grass Knot', 'Apple Acid'], mult: 2, msg: 'The corrosive acid intensified the attack!'},
    {moves: ['Mud Bomb', 'Mud Shot', 'Mud-Slap', 'Muddy Water', 'Smack Down', 'Thousand Arrows', 'Whirlpool'], mult: 1.5},
  ],
  typeAdd: [
    {types: ['Grass'], damaging: true, add: 'Poison'},
    {moves: ['Mud Bomb', 'Mud Shot', 'Mud-Slap', 'Muddy Water', 'Smack Down', 'Thousand Arrows', 'Whirlpool'], add: 'Poison'},
  ],
  accuracy: {'Poison Powder': 100, 'Sleep Powder': 100, 'Stun Spore': 100, Toxic: 100},
  onSwitchIn(pokemon) {
    if (!pokemon.isGrounded() || pokemon.hasType(['Poison', 'Steel'])) return;
    if (pokemon.hasAbility(['immunity', 'poisonheal', 'toxicboost', 'magicguard', 'wonderguard', 'pastelveil'])) return;
    const eff = H.typeEffMult(this, 'Poison', pokemon);
    if (eff > 0) this.damage(Math.max(1, Math.floor(pokemon.maxhp * eff / 8)), pokemon);
  },
  residual(pokemon) {
    if (pokemon.isGrounded() && pokemon.hasAbility('poisonheal') && !pokemon.status && pokemon.hp < pokemon.maxhp) {
      this.heal(Math.max(1, Math.floor(pokemon.maxhp / 8)), pokemon);
    }
  },
  transforms: [
    {moves: ['Seed Flare', 'Purify'], to: 'grassy', msg: 'The polluted field was purified!'},
  ],
});

// 12. Corrosive Mist Field
defineField({
  id: 'corrosivemist',
  name: 'Corrosive Mist Field',
  games: ALL3,
  intro: 'Corrosive mist settles on the field!',
  mimicry: 'Poison',
  naturePower: 'Venoshock',
  secretPower: {chance: 50, status: 'tox'},
  theme: {bg1: '#352f1c', bg2: '#18160d', ground: '#453d22', accent: '#c5d63a', fx: 'mist'},
  info: [
    'Every active Pokémon that can be poisoned is poisoned at the end of each turn!',
    'Fire-type attacks deal 1.5× damage; Acid Spray, Bubble Beam, Smog, Clear Smog & Sparkling Aria deal 1.5×.',
    'Special Flying attacks, Energy Ball, Bubble Beam & Sparkling Aria gain Poison typing; Toxic has 100% accuracy.',
    'Transforms: Flame spread moves / Explosion ignite the mist (dealing 50% max HP explosion damage!) and clear the field; Wind moves blow it away; Gravity settles it into Corrosive Field; Seed Flare / Purify → Misty Terrain.',
  ],
  mods: [
    {types: ['Fire'], mult: 1.5, msg: 'The volatile mist fueled the flames!'},
    {moves: ['Acid Spray', 'Bubble', 'Bubble Beam', 'Clear Smog', 'Smog', 'Sparkling Aria'], mult: 1.5},
  ],
  typeAdd: [
    {types: ['Flying'], cats: ['Special'], add: 'Poison'},
    {moves: ['Bubble', 'Bubble Beam', 'Energy Ball', 'Sparkling Aria'], add: 'Poison'},
  ],
  accuracy: {Toxic: 100},
  residual(pokemon) {
    if (!pokemon.status && !pokemon.hasType(['Poison', 'Steel'])) {
      pokemon.trySetStatus('psn');
    }
  },
  transforms: [
    {
      moves: [...H.IGNITE_MOVES, 'Explosion', 'Self-Destruct'],
      before: H.mistExplosion(0.5),
      to: 'backup',
      msg: 'The combusted mist cleared away!',
    },
    {moves: H.BLOW_MOVES, to: 'backup', msg: 'The corrosive mist was blown away!'},
    {moves: ['Gravity'], to: 'corrosive', msg: 'The toxic mist collected on the ground!'},
    {moves: ['Seed Flare', 'Purify'], to: 'misty', msg: 'The polluted mist was purified!'},
  ],
});

// 13. Desert Field
defineField({
  id: 'desert',
  name: 'Desert Field',
  games: ALL3,
  intro: 'The field is rife with sand.',
  mimicry: 'Ground',
  naturePower: 'Sand Tomb',
  secretPower: {chance: 30, boosts: {accuracy: -1}},
  theme: {bg1: '#4d3a1e', bg2: '#22190c', ground: '#6b5028', accent: '#e5b35a', fx: 'sand'},
  info: [
    'Ground-type Pokémon gain 1.5× Sp. Def; Sand Rush, Sand Force & Sand Veil are active!',
    'Grounded Water moves and Electric moves against grounded targets deal 0.5× damage.',
    'Dig, Heat Wave, Sand Tomb, Burn Up, Needle Arm, Pin Missile, Solar Beam/Blade, Scorching Sands & Bone moves deal 1.5×.',
    'Dry Skin Pokémon lose 1/8 HP per turn in the arid heat.',
  ],
  mods: [
    {types: ['Water'], grounded: true, notMoves: ['Scald', 'Steam Eruption'], mult: 0.5, msg: 'The desert sand absorbed the water...'},
    {types: ['Electric'], targetGrounded: true, mult: 0.5, msg: 'The sand grounded the electricity...'},
    {
      moves: ['Burn Up', 'Dig', 'Heat Wave', 'Needle Arm', 'Pin Missile', 'Sand Tomb', 'Solar Beam',
        'Solar Blade', 'Thousand Waves', 'Scorching Sands', 'Bone Club', 'Bone Rush', 'Bonemerang'],
      mult: 1.5,
      msg: 'The desert heat strengthened the attack!',
    },
  ],
  defMods: [{types: ['Ground'], stat: 'spd', mult: 1.5}],
  speMods: [{abilities: ['Sand Rush'], mult: 2}],
  atkMods: [{abilities: ['Sand Force'], stat: 'both', mult: 1.3}],
  residual(pokemon) {
    if (pokemon.hasAbility('dryskin') && !pokemon.hasAbility('magicguard')) {
      this.damage(Math.max(1, Math.floor(pokemon.maxhp / 8)), pokemon);
    }
  },
});

// 14. Icy Field
defineField({
  id: 'icy',
  name: 'Icy Field',
  games: ALL3,
  intro: 'The field is covered in ice.',
  mimicry: 'Ice',
  naturePower: 'Ice Beam',
  secretPower: {chance: 20, status: 'frz'},
  theme: {bg1: '#1d3c4e', bg2: '#0d1d28', ground: '#2a556e', accent: '#6dd5ed', fx: 'snow'},
  info: [
    'Ice-type attacks deal 1.5× damage; Fire-type attacks & Scald / Steam Eruption deal 0.5×.',
    'All Rock-type attacks gain Ice typing! Grounded physical contact priority / lunging moves grant +1 Speed on use.',
    'Activates Slush Rush (2× Speed) & Ice Body (1/16 HP heal); Ice types get 1.5× Defense during Hail/Snow.',
    'Transforms: Heat Wave / Eruption / Lava Plume / Scald (2×) melts the ice into Water Surface! Quake moves scatter Spikes.',
  ],
  mods: [
    {types: ['Ice'], mult: 1.5, msg: 'The cold strengthened the attack!'},
    {types: ['Fire'], mult: 0.5, msg: 'The cold softened the flames...'},
    {moves: ['Scald', 'Steam Eruption'], mult: 0.5},
  ],
  typeAdd: [{types: ['Rock'], damaging: true, add: 'Ice'}],
  defMods: [{types: ['Ice'], stat: 'def', weather: ['hail', 'snow', 'snowscape'], mult: 1.5}],
  speMods: [{abilities: ['Slush Rush'], mult: 2}],
  hooks: {
    onAfterMove(source, target, move) {
      if (source.isGrounded() && move.category === 'Physical' && move.flags?.contact &&
          (move.priority > 0 || ['lunge', 'rollout', 'steamroller', 'feint'].includes(move.id))) {
        this.boost({spe: 1}, source, source);
      }
      if (['earthquake', 'bulldoze', 'magnitude', 'fissure'].includes(move.id)) {
        for (const side of this.sides) {
          if (side !== source.side && !side.sideConditions.spikes) {
            side.addSideCondition('spikes');
            this.add('-message', 'Jagged ice spikes scattered across the field!');
          }
        }
      }
    },
  },
  residual(pokemon) {
    if (pokemon.hasAbility('icebody') && pokemon.hp < pokemon.maxhp) {
      this.heal(Math.max(1, Math.floor(pokemon.maxhp / 16)), pokemon);
    }
  },
  counters: [
    {moves: ['Scald', 'Steam Eruption'], add: 1, threshold: 2, to: 'watersurface', progressMsg: 'The scalding water cracked the ice!', msg: 'The ice melted into open water!'},
  ],
  transforms: [
    {moves: H.IGNITE_MOVES, to: 'watersurface', msg: 'The ice melted away into open water!'},
  ],
});

// 15. Rocky Field
defineField({
  id: 'rocky',
  name: 'Rocky Field',
  games: ALL3,
  intro: 'The field is littered with rocks.',
  mimicry: 'Rock',
  naturePower: 'Rock Smash',
  secretPower: {chance: 30, volatileStatus: 'flinch'},
  theme: {bg1: '#3b3228', bg2: '#1b1712', ground: '#524436', accent: '#c9a46c', fx: 'dust'},
  info: [
    'Rock-type attacks deal 1.5× damage; Rock Smash deals 2× damage.',
    'Earthquake, Bulldoze, Magnitude, Accelerock, Rock Climb & Strength deal 1.5× and gain Rock typing!',
    'Missed physical contact moves deal 1/8 max HP crash damage to the attacker (unless Rock Head); Rock Polish grants +3 Speed.',
  ],
  mods: [
    {types: ['Rock'], mult: 1.5, msg: 'The rocks strengthened the attack!'},
    {moves: ['Rock Smash'], mult: 2, msg: 'Smashed boulders flew at the target!'},
    {moves: ['Accelerock', 'Bulldoze', 'Earthquake', 'Magnitude', 'Rock Climb', 'Strength'], mult: 1.5},
  ],
  typeAdd: [{moves: ['Bulldoze', 'Earthquake', 'Magnitude', 'Rock Climb', 'Strength'], add: 'Rock'}],
  hooks: {
    onMoveFail(target, source, move) {
      if (source && move?.category === 'Physical' && move.flags?.contact && !source.hasAbility(['rockhead', 'magicguard'])) {
        this.add('-message', `${source.name} slammed into the rocks!`);
        this.damage(Math.max(1, Math.floor(source.maxhp / 8)), source);
      }
    },
    onAfterMove(source, target, move) {
      if (move.id === 'rockpolish') this.boost({spe: 1}, source, source);
    },
  },
});

// 16. Forest Field
defineField({
  id: 'forest',
  name: 'Forest Field',
  games: ALL3,
  intro: 'The field is abound with trees.',
  mimicry: 'Grass',
  naturePower: 'Wood Hammer',
  secretPower: {chance: 30, status: 'slp'},
  theme: {bg1: '#17331e', bg2: '#0b190f', ground: '#214528', accent: '#6cc24a', fx: 'leaves'},
  info: [
    'Grass-type attacks and Special Bug-type attacks deal 1.5× damage!',
    'Attack Order, Cut, Electroweb & Grav Apple deal 1.5×; Surf & Muddy Water deal 0.5×.',
    'Activates Grass Pelt (1.5× Defense); Sap Sipper heals 1/16 max HP each turn.',
    'Transforms: Flame spread moves → Burning Field; Surf / Muddy Water (repeated) → Swamp Field.',
  ],
  mods: [
    {types: ['Grass'], mult: 1.5, msg: 'The forestry strengthened the attack!'},
    {types: ['Bug'], cats: ['Special'], mult: 1.5, msg: 'Echoes through the canopy boosted the attack!'},
    {moves: ['Attack Order', 'Cut', 'Electroweb', 'Grav Apple', 'Branch Poke'], mult: 1.5},
    {moves: ['Muddy Water', 'Surf'], mult: 0.5, msg: 'The dense trees broke the wave...'},
  ],
  defMods: [{abilities: ['Grass Pelt'], stat: 'def', mult: 1.5}],
  residual(pokemon) {
    if (pokemon.hasAbility('sapsipper') && pokemon.hp < pokemon.maxhp) {
      this.heal(Math.max(1, Math.floor(pokemon.maxhp / 16)), pokemon);
    }
  },
  counters: [
    {moves: ['Surf'], add: 1, threshold: 3, to: 'swamp', progressMsg: 'The forest floor is flooding!', msg: 'The flooded forest became a Swamp!'},
    {moves: ['Muddy Water'], add: 2, threshold: 3, to: 'swamp', progressMsg: 'The forest floor is flooding!', msg: 'The flooded forest became a Swamp!'},
  ],
  transforms: [
    {moves: H.IGNITE_MOVES, cond: H.igniteCheck, to: 'burning', msg: 'The forest caught fire!'},
  ],
});

// 17. Super-Heated Field
defineField({
  id: 'superheated',
  name: 'Super-Heated Field',
  games: REB_DES,
  intro: 'The field is super-heated!',
  mimicry: 'Fire',
  naturePower: 'Heat Wave',
  secretPower: {chance: 30, status: 'brn'},
  theme: {bg1: '#4a2614', bg2: '#211109', ground: '#5e3119', accent: '#f58832', fx: 'embers'},
  info: [
    'Fire moves deal 1.1× damage; Water moves deal 0.9× (Surf, Muddy Water, Water Spout, Sparkling Aria deal ~0.55× and billow accuracy-dropping steam!).',
    'Scald & Steam Eruption are super-charged (1.67× total); Ice moves deal 0.5×; Hail fails.',
    'Transforms: Flame spread moves / Explosion ignite into Burning Field; Blizzard / Glaciate cools the field to normal.',
  ],
  mods: [
    {types: ['Fire'], mult: 1.1},
    {types: ['Water'], notMoves: ['Scald', 'Steam Eruption'], mult: 0.9},
    {types: ['Ice'], mult: 0.5, msg: 'The extreme heat weakened the ice...'},
    {moves: ['Scald', 'Steam Eruption'], mult: 1.67, msg: 'Super-heated steam erupted!'},
    {moves: ['Muddy Water', 'Sparkling Aria', 'Surf', 'Water Pledge', 'Water Spout'], mult: 0.625},
  ],
  fail: [{moves: ['Hail', 'Snowscape'], msg: 'The super-heated air vaporized the snow!'}],
  hooks: {
    onAfterMove(source, target, move) {
      if (['surf', 'muddywater', 'waterpledge', 'watersport', 'waterspout', 'sparklingaria'].includes(move.id)) {
        H.fieldAccuracyDrop('Steam billowed across the battlefield, obscuring vision!').call(this, source, target, move);
      }
    },
  },
  transforms: [
    {moves: [...H.IGNITE_MOVES, 'Explosion', 'Self-Destruct'], cond: H.igniteCheck, to: 'burning', msg: 'The super-heated field combusted!'},
    {moves: H.FREEZE_FIELD_MOVES, to: 'backup', msg: 'The super-heated field cooled off!'},
  ],
});

// 18. Factory Field
defineField({
  id: 'factory',
  name: 'Factory Field',
  games: ALL3,
  intro: 'Machines whir in the background.',
  mimicry: 'Steel',
  naturePower: 'Gear Grind',
  secretPower: {chance: 30, boosts: {atk: -1}},
  theme: {bg1: '#232c36', bg2: '#10151b', ground: '#2e3a47', accent: '#4db6ac', fx: 'sparks'},
  info: [
    'Electric-type attacks deal 1.2× damage; Steelworker deals 2×.',
    'Flash Cannon, Gear Grind, Gyro Ball, Magnet Bomb & Double Iron Bash deal 2×; Steamroller, Techno Blast & Heavy Slam deal 1.5×.',
    'Shift Gear, Autotomize, Iron Defense & Metal Sound receive amplified mechanical boosts.',
    'Transforms: Discharge, Earthquake, Bulldoze, Magnitude, Explosion or Self-Destruct → Short-Circuit Field!',
  ],
  mods: [
    {types: ['Electric'], mult: 1.2, msg: 'Power surged from the machinery!'},
    {moves: ['Flash Cannon', 'Gear Grind', 'Gyro Ball', 'Magnet Bomb', 'Double Iron Bash'], mult: 2, msg: 'ATTACK SEQUENCE INITIATED.'},
    {moves: ['Steamroller', 'Techno Blast', 'Heavy Slam', 'Make It Rain'], mult: 1.5},
  ],
  hooks: {
    onAfterMove(source, target, move) {
      if (move.id === 'shiftgear' || move.id === 'irondefense') {
        this.boost({spe: 1}, source, source);
      }
    },
  },
  transforms: [
    {moves: [...H.QUAKE_MOVES, 'Explosion', 'Self-Destruct', 'Discharge'], to: 'shortcircuit', msg: 'The machinery overloaded! Short-circuit!'},
  ],
});

// 19. Short-Circuit Field
const SC_ROLLS = [1.5, 0.5, 0.5, 2.0, 0.5, 1.5, 1.2, 2.0];
defineField({
  id: 'shortcircuit',
  name: 'Short-Circuit Field',
  games: ALL3,
  intro: 'Bzzt!',
  mimicry: 'Electric',
  naturePower: 'Discharge',
  secretPower: {chance: 30, status: 'par'},
  theme: {bg1: '#262418', bg2: '#11100a', ground: '#36321e', accent: '#f2c94c', fx: 'sparks'},
  info: [
    'Electric moves cycle through erratic voltage multipliers (1.5×, 0.5×, 0.5×, 2.0×, 0.5×, 1.5×, 1.2×, 2.0×)!',
    'Flash Cannon, Gear Grind, Gyro Ball, Magnet Bomb, Surf & Muddy Water deal 1.5× and gain Electric typing; Dazzling Gleam deals 1.5×.',
    'Dark & Ghost attacks in the flickering shadows deal 1.3×; Zap Cannon has 80% accuracy.',
    'Activates Surge Surfer (2× Speed); Volt Absorb heals 1/16 HP each turn.',
    'Transforms: Charge Beam, Parabolic Charge, Wild Charge, Discharge or Overdrive reboots Factory Field!',
  ],
  mods: [
    {
      types: ['Electric'],
      mult({battle}) {
        const st = battle.rfield;
        const m = SC_ROLLS[st.rollIdx % SC_ROLLS.length];
        st.rollIdx++;
        battle.add('-message', m >= 1.5 ? `BZZT! High voltage surge (${m}×)!` : m < 1 ? `Fzzt... Low voltage (${m}×)...` : `Voltage steady (${m}×).`);
        return m;
      },
    },
    {moves: ['Dazzling Gleam', 'Flash Cannon', 'Gear Grind', 'Gyro Ball', 'Magnet Bomb', 'Muddy Water', 'Surf'], mult: 1.5},
    {moves: ['Dark Pulse', 'Night Daze', 'Night Slash', 'Shadow Ball', 'Shadow Bone', 'Shadow Claw', 'Shadow Force', 'Shadow Punch', 'Shadow Sneak'], mult: 1.3},
  ],
  typeAdd: [{moves: ['Flash Cannon', 'Gear Grind', 'Gyro Ball', 'Magnet Bomb', 'Muddy Water', 'Surf'], add: 'Electric'}],
  accuracy: {'Zap Cannon': 80},
  speMods: [{abilities: ['Surge Surfer'], mult: 2}],
  residual(pokemon) {
    if (pokemon.hasAbility('voltabsorb') && pokemon.hp < pokemon.maxhp) {
      this.heal(Math.max(1, Math.floor(pokemon.maxhp / 16)), pokemon);
    }
  },
  transforms: [
    {moves: ['Charge Beam', 'Parabolic Charge', 'Wild Charge', 'Discharge', 'Overdrive', 'Supercell Slam'], to: 'factory', msg: 'SYSTEM ONLINE. Factory power restored!'},
  ],
});

// 20. Wasteland
defineField({
  id: 'wasteland',
  name: 'Wasteland',
  games: ALL3,
  intro: 'The waste is watching...',
  mimicry: 'Poison',
  naturePower: 'Gunk Shot',
  secretPower: {chance: 30, boosts: {atk: -1, def: -1}},
  theme: {bg1: '#332930', bg2: '#171217', ground: '#45353d', accent: '#9bcf53', fx: 'acid'},
  info: [
    'Spit Up deals 2×; Mud Bomb/Shot/Slap, Power Whip & Vine Whip deal 1.5× (Mud moves gain Poison typing!).',
    'Gunk Shot, Octazooka, Sludge, Sludge Bomb & Sludge Wave deal 1.2× and have an extra 30% status chance!',
    'Earthquake, Bulldoze & Magnitude are swallowed by the sludge (0.25×).',
    'Grounded Poison Heal heals 1/8 HP even without status; entry hazards strike immediately as toxic waste surges.',
  ],
  mods: [
    {moves: ['Spit Up'], mult: 2, msg: 'Bile erupted across the wasteland!'},
    {moves: ['Mud Bomb', 'Mud Shot', 'Mud-Slap', 'Power Whip', 'Vine Whip'], mult: 1.5},
    {moves: ['Gunk Shot', 'Octazooka', 'Sludge', 'Sludge Bomb', 'Sludge Wave'], mult: 1.2},
    {moves: ['Bulldoze', 'Earthquake', 'Magnitude'], mult: 0.25, msg: 'The waste swallowed the tremor...'},
  ],
  typeAdd: [{moves: ['Mud Bomb', 'Mud Shot', 'Mud-Slap'], add: 'Poison'}],
  secondary: [
    {moves: ['Gunk Shot', 'Octazooka', 'Sludge', 'Sludge Bomb', 'Sludge Wave'], chance: 30, status: 'psn'},
  ],
  residual(pokemon) {
    if (pokemon.isGrounded() && pokemon.hasAbility('poisonheal') && !pokemon.status && pokemon.hp < pokemon.maxhp) {
      this.heal(Math.max(1, Math.floor(pokemon.maxhp / 8)), pokemon);
    }
  },
});
