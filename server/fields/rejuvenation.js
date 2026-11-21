'use strict';
/**
 * Pokemon Rejuvenation (v13+) exclusive field effects (13 families / 16 states including Concert Venue 1-4).
 */
const {defineField} = require('./engine');
const H = require('./helpers');

const REJ = ['Rejuvenation'];

// 1. Volcanic Top
defineField({
  id: 'volcanictop',
  name: 'Volcanic Top',
  games: REJ,
  intro: 'The mountain top is super-heated!',
  mimicry: 'Fire',
  naturePower: 'Eruption',
  secretPower: {chance: 30, status: 'brn'},
  theme: {bg1: '#4d2015', bg2: '#1f0d09', ground: '#632919', accent: '#ff7043', fx: 'embers'},
  info: [
    'Fire moves deal 1.1× (Eruption, Heat Wave, Magma Storm & Lava Plume an extra 1.3×); ALL Rock moves gain Fire typing!',
    'Scald & Steam Eruption deal 1.67×; Thunder deals 1.5× and never misses; Ice moves deal 0.5×; Hail fails.',
    'Wind moves, Precipice Blades, Smog & Clear Smog deal 1.2× and gain Fire typing.',
    'Earthquake, Bulldoze, Magnitude, Precipice Blades, Eruption & Lava Plume trigger a VOLCANIC ERUPTION (clearing hazards & scorching non-Fire Pokémon)!',
    'Surf, Muddy Water, Water Spout & Sparkling Aria deal ~0.5× and billow accuracy-dropping steam!',
    'Transforms: Fly / Bounce → Sky Field; Dig → Burning Field; Blizzard / Glaciate → Mountain.',
  ],
  mods: [
    {types: ['Fire'], mult: 1.1},
    {types: ['Water'], notMoves: ['Scald', 'Steam Eruption'], mult: 0.9},
    {types: ['Ice'], mult: 0.5, msg: 'The volcanic heat melted the ice...'},
    {moves: ['Scald', 'Steam Eruption'], mult: 1.67, msg: 'Volcanic steam erupted!'},
    {moves: ['Thunder'], mult: 1.5},
    {moves: ['Eruption', 'Heat Wave', 'Magma Storm', 'Lava Plume'], mult: 1.3, msg: 'Magma surged from the crater!'},
    {moves: ['Ominous Wind', 'Silver Wind', 'Razor Wind', 'Icy Wind', 'Gust', 'Twister', 'Precipice Blades', 'Smog', 'Clear Smog'], mult: 1.2},
    {moves: ['Surf', 'Muddy Water', 'Water Pledge', 'Water Spout', 'Sparkling Aria'], mult: 0.555},
  ],
  typeAdd: [
    {types: ['Rock'], damaging: true, add: 'Fire'},
    {moves: ['Ominous Wind', 'Silver Wind', 'Razor Wind', 'Icy Wind', 'Gust', 'Twister', 'Precipice Blades', 'Smog', 'Clear Smog'], add: 'Fire'},
  ],
  fail: [{moves: ['Hail', 'Snowscape'], msg: 'The volcanic heat vaporized the snow!'}],
  accuracy: {Thunder: true},
  hooks: {
    onAfterMove(source, target, move) {
      if (['surf', 'muddywater', 'waterpledge', 'watersport', 'waterspout', 'sparklingaria'].includes(move.id)) {
        H.fieldAccuracyDrop('Super-heated steam clouded the volcanic peak!').call(this, source, target, move);
      }
      if (['bulldoze', 'earthquake', 'magnitude', 'eruption', 'precipiceblades', 'lavaplume', 'earthpower'].includes(move.id)) {
        H.volcanicEruption({battle: this});
      }
    },
  },
  transforms: [
    {moves: ['Fly', 'Bounce'], to: 'sky', msg: 'The battle was taken to the skies!'},
    {moves: ['Dig'], to: 'burning', msg: 'Broke through the crust into the molten depths!'},
    {moves: H.FREEZE_FIELD_MOVES, to: 'mountain', msg: 'The volcanic peak cooled into a Mountain!'},
  ],
});

// 2. Dimensional Field
defineField({
  id: 'dimensional',
  name: 'Dimensional Field',
  games: REJ,
  intro: 'Darkness Radiates.',
  mimicry: 'Dark',
  naturePower: 'Dark Pulse',
  secretPower: {chance: 30, volatileStatus: 'flinch'},
  theme: {bg1: '#1a1524', bg2: '#09070d', ground: '#261e33', accent: '#c94b4b', fx: 'rings'},
  info: [
    'Dark-type moves deal 1.5× damage; Ghost moves deal 1.2×; Fairy moves deal 0.5×!',
    'Spacial Rend, Roar of Time, Hyperspace Fury/Hole, Shadow Force, Fiery Wrath, Freezing Glare, Lash Out, Outrage, Raging Fury, Thrash, Stomping Tantrum, Dynamax Cannon & Eternabeam deal 1.5×!',
    'Dark Pulse & Night Daze deal an extra 1.2× and never miss; Dark Void never misses!',
    'Weather-setting moves & Lucky Chant fail; sleeping Pokémon lose 1/16 HP per turn; Rattled boosts Speed on switch-in.',
    'Transforms: Glaciate / Freeze Shock / Ice Burn (or Blizzard 2×) → Frozen Dimensional; Precipice Blades → Infernal Field; Purify / Seed Flare → clears field.',
  ],
  mods: [
    {types: ['Dark'], mult: 1.5, msg: 'Dimensional darkness amplified the attack!'},
    {types: ['Ghost'], mult: 1.2},
    {types: ['Fairy'], mult: 0.5, msg: 'Dimensional distortion stifled the light...'},
    {
      moves: ['Dynamax Cannon', 'Eternabeam', 'Fiery Wrath', 'Freezing Glare', 'Hyperspace Fury',
        'Hyperspace Hole', 'Lash Out', 'Outrage', 'Raging Fury', 'Roar of Time', 'Shadow Force',
        'Spacial Rend', 'Stomping Tantrum', 'Thrash'],
      mult: 1.5,
    },
    {moves: ['Dark Pulse', 'Night Daze'], mult: 1.2},
  ],
  fail: [{moves: ['Rain Dance', 'Sunny Day', 'Sandstorm', 'Hail', 'Snowscape', 'Lucky Chant', 'Teatime'], msg: 'The dimensional rift swallowed the effect!'}],
  accuracy: {'Dark Pulse': true, 'Night Daze': true, 'Dark Void': true},
  onSwitchIn(pokemon) {
    if (pokemon.hasAbility('rattled')) this.boost({spe: 1}, pokemon, pokemon);
  },
  residual(pokemon) {
    if (pokemon.status === 'slp' && !pokemon.hasAbility('magicguard')) {
      this.damage(Math.max(1, Math.floor(pokemon.maxhp / 16)), pokemon);
    }
  },
  counters: [
    {moves: ['Blizzard', 'Sheer Cold'], add: 1, threshold: 2, to: 'frozendimensional', progressMsg: 'Frost crept across the dimension!', msg: 'The dimension froze over!'},
  ],
  transforms: [
    {moves: ['Glaciate', 'Freeze Shock', 'Ice Burn'], to: 'frozendimensional', msg: 'The dimension froze up!'},
    {moves: ['Precipice Blades'], to: 'infernal', msg: 'The rift tore open into an Infernal landscape!'},
    {moves: ['Purify', 'Seed Flare'], to: 'backup', msg: 'The dimension was purified!'},
  ],
});

// 3. Frozen Dimensional Field
defineField({
  id: 'frozendimensional',
  name: 'Frozen Dimensional Field',
  games: REJ,
  blockTerrain: true,
  blockTerrainMsg: 'The frozen dimension rejected the terrain!',
  intro: 'Hate and anger radiates.',
  mimicry: 'Ice',
  naturePower: 'Ice Beam',
  secretPower: {chance: 20, status: 'frz'},
  theme: {bg1: '#16293b', bg2: '#08111a', ground: '#1f3b54', accent: '#56ccf2', fx: 'snow'},
  info: [
    'Dark-type moves deal 1.5× damage; Ice-type moves deal 1.2×; Fire-type moves deal 0.5×!',
    'Fiery Wrath, Freezing Glare, Lash Out, Outrage, Raging Fury, Roar of Time, Stomping Tantrum & Thrash deal 1.5×.',
    'Surf, Muddy Water, Hydro Pump, Water Pulse, Dark Pulse, Night Slash & Hyperspace moves deal 1.2× and gain Ice typing!',
    'Terrains & Room moves fail; Dark Void has 100% accuracy; activates Slush Rush (2× Speed) & Ice Body.',
    'Transforms: Heat Wave / Eruption / Lava Plume / Raging Fury thaws back into Dimensional Field; Purify / Seed Flare → Icy Field.',
  ],
  mods: [
    {types: ['Dark'], mult: 1.5, msg: 'Bitter malice empowered the attack!'},
    {types: ['Ice'], mult: 1.2},
    {types: ['Fire'], mult: 0.5, msg: 'The subzero void smothered the flames...'},
    {moves: ['Fiery Wrath', 'Freezing Glare', 'Lash Out', 'Outrage', 'Rage', 'Raging Fury', 'Roar of Time', 'Stomping Tantrum', 'Thrash'], mult: 1.5},
    {moves: ['Dark Pulse', 'Hydro Pump', 'Hyperspace Fury', 'Hyperspace Hole', 'Muddy Water', 'Night Slash', 'Surf', 'Water Pulse'], mult: 1.2},
  ],
  typeAdd: [{moves: ['Dark Pulse', 'Hydro Pump', 'Muddy Water', 'Night Slash', 'Surf', 'Water Pulse'], add: 'Ice'}],
  fail: [{moves: ['Court Change', 'Electric Terrain', 'Grassy Terrain', 'Gravity', 'Magic Room', 'Misty Terrain', 'Psychic Terrain', 'Teatime', 'Trick Room', 'Wonder Room'], msg: 'The frozen dimension locked space in place!'}],
  accuracy: {'Dark Void': 100},
  speMods: [{abilities: ['Slush Rush'], mult: 2}],
  residual(pokemon) {
    if (pokemon.hasAbility('icebody') && pokemon.hp < pokemon.maxhp) {
      this.heal(Math.max(1, Math.floor(pokemon.maxhp / 16)), pokemon);
    }
  },
  transforms: [
    {moves: H.IGNITE_MOVES, to: 'dimensional', msg: 'The frozen dimension thawed back into darkness!'},
    {moves: ['Purify', 'Seed Flare'], to: 'icy', msg: 'The dark malice was purified, leaving an Icy Field!'},
  ],
});

// 4. Haunted Field
defineField({
  id: 'haunted',
  name: 'Haunted Field',
  games: REJ,
  intro: 'The field is haunted!',
  mimicry: 'Ghost',
  naturePower: 'Phantom Force',
  secretPower: {chance: 30, volatileStatus: 'flinch'},
  theme: {bg1: '#232033', bg2: '#0f0d17', ground: '#302b45', accent: '#64dfdf', fx: 'wisp'},
  info: [
    'Ghost-type attacks deal 1.5× damage; Shadow Bone deals an extra 1.2×!',
    'Will-O-Wisp flames: Fire Spin, Flame Burst, Flame Charge & Inferno deal 1.5× and gain Ghost typing!',
    'Astonish, Bone Club, Bone Rush & Bonemerang deal 1.5×; Hypnosis & Will-O-Wisp have 90% accuracy.',
    'Sleeping non-Ghost Pokémon are tormented by spirits for 1/8 max HP each turn.',
    'Transforms: Judgment, Origin Pulse, Sacred Fire or Purify exorcises into Blessed Field; Dazzling Gleam / Flash clears the spirits!',
  ],
  mods: [
    {types: ['Ghost'], mult: 1.5, msg: 'Restless spirits amplified the attack!'},
    {moves: ['Astonish', 'Bone Club', 'Bone Rush', 'Bonemerang', 'Fire Spin', 'Flame Burst', 'Flame Charge', 'Inferno', 'Infernal Parade'], mult: 1.5},
    {moves: ['Shadow Bone'], mult: 1.2},
  ],
  typeAdd: [{moves: ['Fire Spin', 'Flame Burst', 'Flame Charge', 'Inferno'], add: 'Ghost'}],
  accuracy: {Hypnosis: 90, 'Will-O-Wisp': 90},
  residual(pokemon) {
    if (pokemon.status === 'slp' && !pokemon.hasType('Ghost') && !pokemon.hasAbility('magicguard')) {
      this.damage(Math.max(1, Math.floor(pokemon.maxhp / 8)), pokemon);
    }
  },
  transforms: [
    {moves: ['Judgment', 'Origin Pulse', 'Purify', 'Sacred Fire'], to: 'holy', msg: 'The evil spirits were exorcised! Blessed light filled the field!'},
    {moves: ['Dazzling Gleam', 'Flash'], to: 'backup', msg: 'Blinding light drove the spirits back!'},
  ],
});

// 5. Corrupted Cave
defineField({
  id: 'corruptedcave',
  name: 'Corrupted Cave',
  games: REJ,
  intro: 'Corruption seeps from every crevice!',
  mimicry: 'Poison',
  naturePower: 'Gunk Shot',
  secretPower: {chance: 40, status: 'psn'},
  theme: {bg1: '#2b2429', bg2: '#131012', ground: '#3b3036', accent: '#a8d838', fx: 'acid'},
  info: [
    'Poison-type moves deal 1.5×; Grass & Rock moves deal 1.2×; Fairy & non-contact Flying moves deal 0.5×!',
    'Rock Slide, Stone Edge, Rock Tomb, Smack Down & Diamond Storm gain Poison typing!',
    'Gunk Shot & Sludge Wave gain Rock typing; Apple Acid & Seed Flare deal 1.5×.',
    'Grounded non-Poison/Steel Pokémon take 1/16 max HP corruption chip each turn.',
    'Transforms: Heat Wave / Eruption / Lava Plume / Blast Burn DETONATES the cave (50% max HP damage!) → Burning Field; Purify / Seed Flare / Solar Beam / Solar Blade → Cave; Sky Uppercut → Mountain; Draco Meteor → Dragon\'s Den.',
  ],
  mods: [
    {types: ['Poison'], mult: 1.5, msg: 'Toxic crystals amplified the attack!'},
    {types: ['Grass', 'Rock'], mult: 1.2},
    {types: ['Fairy'], mult: 0.5},
    {types: ['Flying'], noContact: true, mult: 0.5},
    {moves: ['Apple Acid', 'Seed Flare'], mult: 1.5},
  ],
  typeAdd: [
    {moves: ['Diamond Storm', 'Rock Slide', 'Rock Tomb', 'Smack Down', 'Stone Edge'], add: 'Poison'},
    {moves: ['Gunk Shot', 'Sludge Wave'], add: 'Rock'},
  ],
  residual(pokemon) {
    if (!pokemon.isGrounded() || pokemon.hasType(['Poison', 'Steel'])) return;
    if (pokemon.hasAbility(['immunity', 'poisonheal', 'magicguard', 'wonderguard'])) return;
    this.damage(Math.max(1, Math.floor(pokemon.maxhp / 16)), pokemon);
  },
  counters: [
    {moves: ['Dragon Pulse'], add: 1, threshold: 2, to: 'dragonsden', progressMsg: 'Draconic energy shook off the corruption!', msg: 'The cavern became a Dragon\'s Den!'},
  ],
  transforms: [
    {
      moves: ['Blast Burn', 'Eruption', 'Heat Wave', 'Lava Plume'],
      before: H.mistExplosion(0.5),
      to: 'burning',
      msg: 'The corrupted cavern erupted into flames!',
    },
    {moves: ['Purify', 'Seed Flare', 'Solar Beam', 'Solar Blade'], to: 'cave', msg: 'The cave was purified!'},
    {moves: ['Sky Uppercut'], to: 'mountain', msg: 'Smashed right through the cavern roof onto the Mountain!'},
    {moves: ['Draco Meteor'], to: 'dragonsden', msg: 'Meteors carved out a Dragon\'s Den!'},
  ],
});

// 6. Bewitched Woods
defineField({
  id: 'bewitchedwoods',
  name: 'Bewitched Woods',
  games: REJ,
  intro: 'Everlasting glow and glamour!',
  mimicry: 'Fairy',
  naturePower: 'Dazzling Gleam',
  secretPower: {chance: 30, status: 'slp'},
  theme: {bg1: '#1d302d', bg2: '#0d1716', ground: '#26403c', accent: '#56e39f', fx: 'wisp'},
  info: [
    'Fairy- and Grass-type moves deal 1.5× damage; Dark-type moves deal 1.3×!',
    'Hex, Mystical Fire & Spirit Break deal 1.5×; Beam moves, Flash Cannon & Magical Leaf deal 1.4×; Moonblast, Dark Pulse & Night Daze deal 1.2×.',
    'Sleep Powder, Poison Powder, Stun Spore & Grass Whistle have 85% accuracy.',
    'Transforms: Purify dispels the enchantment → Forest Field.',
  ],
  mods: [
    {types: ['Fairy', 'Grass'], mult: 1.5, msg: 'Fae glamour empowered the attack!'},
    {types: ['Dark'], mult: 1.3},
    {moves: ['Hex', 'Mystical Fire', 'Spirit Break'], mult: 1.5},
    {moves: ['Aurora Beam', 'Bubble Beam', 'Charge Beam', 'Flash Cannon', 'Hyper Beam', 'Ice Beam', 'Magical Leaf', 'Psybeam', 'Signal Beam'], mult: 1.4},
    {moves: ['Dark Pulse', 'Moonblast', 'Night Daze'], mult: 1.2},
  ],
  accuracy: {'Grass Whistle': 85, 'Poison Powder': 85, 'Sleep Powder': 85, 'Stun Spore': 85},
  transforms: [
    {moves: ['Purify'], to: 'forest', msg: 'The bewitching glamour faded into a quiet Forest!'},
  ],
});

// 7. Sky Field
defineField({
  id: 'sky',
  name: 'Sky Field',
  games: REJ,
  intro: 'The sky is filled with clouds.',
  mimicry: 'Flying',
  naturePower: 'Sky Attack',
  secretPower: {chance: 30, volatileStatus: 'confusion'},
  theme: {bg1: '#234b6e', bg2: '#112538', ground: '#346994', accent: '#80d8ff', fx: 'wind'},
  info: [
    'Flying-type moves deal 1.5× damage! Hurricane & Thunder never miss!',
    'Wind moves, Aeroblast, Dragon Ascent, Dragon Darts, Esper Wing, Flying Press, Sky Uppercut, Steel Wing, Dive, Grav Apple & Thunderbolt/Thunder deal 1.5×; Storm trio moves deal 1.3×.',
    'Dive & Twister gain Flying typing! Earthquake, Bulldoze, Magnitude, Dig, Spikes, Toxic Spikes & Sticky Web all fail in mid-air!',
    'Levitate grants +1 Speed & Big Pecks grants +1 Defense on switch-in; Gale Wings works at any HP!',
    'Transforms: Gravity, Smack Down, Thousand Arrows, Grav Apple or Ingrain brings the battle down to Mountain!',
  ],
  mods: [
    {types: ['Flying'], mult: 1.5, msg: 'Tailwinds carried the attack!'},
    {
      moves: ['Aeroblast', 'Bleakwind Storm', 'Dive', 'Dragon Ascent', 'Dragon Darts', 'Esper Wing',
        'Fairy Wind', 'Flying Press', 'Grav Apple', 'Icy Wind', 'Ominous Wind', 'Razor Wind',
        'Silver Wind', 'Sky Uppercut', 'Steel Wing', 'Thunder', 'Thunder Shock', 'Thunderbolt', 'Twister'],
      mult: 1.5,
    },
    {moves: ['Sandsear Storm', 'Springtide Storm', 'Wildbolt Storm'], mult: 1.3},
  ],
  typeAdd: [{moves: ['Dive', 'Twister'], add: 'Flying'}],
  fail: [{moves: ['Bulldoze', 'Dig', 'Earthquake', 'Magnitude', 'Rototiller', 'Spikes', 'Sticky Web', 'Toxic Spikes'], msg: 'There is no ground up in the Sky!'}],
  accuracy: {Hurricane: true, Thunder: true},
  priority: [{types: ['Flying'], cond: ({source}) => source?.hasAbility('galewings') && source.hp < source.maxhp, add: 1}],
  onSwitchIn(pokemon) {
    if (pokemon.hasAbility('levitate')) this.boost({spe: 1}, pokemon, pokemon);
    if (pokemon.hasAbility('bigpecks')) this.boost({def: 1}, pokemon, pokemon);
  },
  transforms: [
    {moves: ['Grav Apple', 'Gravity', 'Ingrain', 'Smack Down', 'Thousand Arrows'], to: 'mountain', msg: 'The battle was brought down to the Mountains!'},
  ],
});

// 8. Colosseum
defineField({
  id: 'colosseum',
  name: 'Colosseum',
  games: REJ,
  intro: 'All eyes are on the combatants!',
  mimicry: 'Steel',
  naturePower: 'Beat Up',
  secretPower: {chance: 30, self: {boosts: {atk: 1}}},
  theme: {bg1: '#4a3520', bg2: '#21180e', ground: '#66492b', accent: '#e8a838', fx: 'dust'},
  info: [
    'NO COWARDICE: Baton Pass, Encore & Whirlwind fail in the arena!',
    'Beat Up, Fell Stinger, Pay Day & Reversal deal 2× damage!',
    'Gladiator weapons (Sacred/Secret Sword, Leaf Blade, Night Slash, Psycho Cut, Smart Strike, Bone moves, Brutal Swing, Bullet Punch, First Impression, Meteor Mash/Assault, Payback, Punishment, Smack Down, Submission, Vine Whip) deal 1.5×!',
    'Hammers, drills, whips, chains & Sucker Punch / Throat Chop deal 1.2×; Swords Dance & Howl hype the gladiator (+1 Spe).',
  ],
  mods: [
    {moves: ['Beat Up', 'Fell Stinger', 'Pay Day', 'Pursuit', 'Reversal'], mult: 2, msg: 'The Colosseum roared!'},
    {
      moves: ['Bone Club', 'Bone Rush', 'Bonemerang', 'Brutal Swing', 'Bullet Punch', 'Clanging Scales',
        'Electroweb', 'First Impression', 'Leaf Blade', 'Meteor Assault', 'Meteor Mash', 'Night Slash',
        'Payback', 'Psycho Cut', 'Punishment', 'Sacred Sword', 'Secret Sword', 'Smack Down', 'Smart Strike',
        'Steamroller', 'Submission', 'Vine Whip', 'Bitter Blade', 'Ceaseless Edge', 'Kowtow Cleave'],
      mult: 1.5,
    },
    {
      moves: ['Anchor Shot', 'Crabhammer', 'Dragon Hammer', 'Drill Peck', 'Drill Run', 'Fire Lash',
        'Ice Hammer', 'Icicle Spear', 'Power Whip', 'Shadow Bone', 'Spirit Shackle', 'Storm Throw',
        'Sucker Punch', 'Throat Chop', 'Wood Hammer', 'Gigaton Hammer'],
      mult: 1.2,
    },
  ],
  fail: [{moves: ['Baton Pass', 'Encore', 'Whirlwind'], msg: 'Gladiators cannot flee or stall in the Colosseum!'}],
  hooks: {
    onAfterMove(source, target, move) {
      if (['swordsdance', 'howl', 'noretreat'].includes(move.id)) {
        this.boost({spe: 1}, source, source);
      }
    },
  },
});

// 9. Infernal Field
defineField({
  id: 'infernal',
  name: 'Infernal Field',
  games: REJ,
  intro: 'The souls of the damned burn on.',
  mimicry: 'Fire',
  naturePower: 'Punishment',
  secretPower: {chance: 50, status: 'brn'},
  theme: {bg1: '#451212', bg2: '#1a0606', ground: '#5e1818', accent: '#ff5252', fx: 'embers'},
  info: [
    'Dark- and Fire-type moves deal 1.5× damage; Water & Fairy moves (except Spirit Break!) deal 0.5×.',
    'ALL Ground-, Rock- and Steel-type attacks gain Fire typing! Aura Sphere & Spirit Break gain Dark typing!',
    'Dream Eater, Punishment & Smog deal 2×; Blast Burn, Earth Power, Infernal Parade, Inferno, Precipice Blades & Raging Fury deal 1.5×.',
    'Dark Void, Inferno & Will-O-Wisp never miss! Rain Dance & Hail/Snowscape fail; sleeping Pokémon burn for 1/8 HP per turn.',
    'Transforms: Glaciate → Dimensional Field; Judgment, Origin Pulse or Purify → Volcanic Top.',
  ],
  mods: [
    {types: ['Dark', 'Fire'], mult: 1.5, msg: 'Hellfire empowered the attack!'},
    {types: ['Water'], mult: 0.5, msg: 'Hellfire evaporated the water...'},
    {types: ['Fairy'], notMoves: ['Spirit Break'], mult: 0.5},
    {moves: ['Dream Eater', 'Punishment', 'Smog'], mult: 2},
    {moves: ['Blast Burn', 'Earth Power', 'Infernal Parade', 'Inferno', 'Precipice Blades', 'Raging Fury'], mult: 1.5},
  ],
  typeAdd: [
    {types: ['Ground', 'Rock', 'Steel'], damaging: true, add: 'Fire'},
    {moves: ['Aura Sphere', 'Spirit Break'], add: 'Dark'},
  ],
  fail: [{moves: ['Hail', 'Snowscape', 'Rain Dance'], msg: 'The infernal heat rejected the weather!'}],
  accuracy: {'Dark Void': true, Inferno: true, 'Will-O-Wisp': true},
  residual(pokemon) {
    if (pokemon.status === 'slp' && !pokemon.hasAbility('magicguard')) {
      this.damage(Math.max(1, Math.floor(pokemon.maxhp / 8)), pokemon);
    }
  },
  transforms: [
    {moves: ['Glaciate'], to: 'dimensional', msg: 'The hellish flames froze into a Dimensional rift!'},
    {moves: ['Judgment', 'Origin Pulse', 'Purify'], to: 'volcanictop', msg: 'The infernal malice was purified, leaving a Volcanic Top!'},
  ],
});

// 10. Concert Venue (Stages 1–4)
const HYPE_UP_MOVES = [
  'Boomburst', 'Bug Buzz', 'Chatter', 'Clanging Scales', 'Clangorous Soul', 'Disarming Voice',
  'Dragon Dance', 'Drum Beating', 'Echoed Voice', 'Feather Dance', 'Fiery Dance', 'First Impression',
  'Growl', 'Howl', 'Hyper Voice', 'Metal Sound', 'Noble Roar', 'Overdrive', 'Parting Shot',
  'Petal Dance', 'Quiver Dance', 'Relic Song', 'Revelation Dance', 'Roar', 'Rollout', 'Round',
  'Screech', 'Sing', 'Snarl', 'Sparkling Aria', 'Supersonic', 'Swagger', 'Swords Dance', 'Uproar',
  'Work Up', 'Torch Song', 'Alluring Voice', 'Aqua Step', 'Victory Dance',
];
const KILLJOY_MOVES = ['Baby-Doll Eyes', 'Embargo', 'Play Nice', 'Quash', 'Slack Off', 'Throat Chop', 'Tickle', 'Yawn'];

for (let s = 1; s <= 4; s++) {
  const soundMult = [0, 1.2, 1.35, 1.5, 1.7][s];
  const intros = [
    '',
    "Let's get HYPED! (Hype Level 1/4)",
    'The crowd is warming up! (Hype Level 2/4)',
    'The venue is shaking with noise!! (Hype Level 3/4)',
    'MAXIMUM OVERDRIVE!! THE CROWD GOES WILD!! (Hype Level 4/4)',
  ];
  const transforms = [];
  if (s < 4) {
    transforms.push({moves: ['Explosion', 'Self-Destruct'], to: 'concert4', msg: 'The audience cheers for the explosive pyrotechnics!!'});
    if (s < 3) {
      transforms.push({moves: ['Focus Energy', 'Follow Me', 'Laser Focus', 'Lucky Chant'], to: `concert${Math.min(4, s + 2)}`, msg: "The audience's full attention is on the stage!"});
    }
    transforms.push({moves: HYPE_UP_MOVES, to: `concert${s + 1}`, msg: 'The performance is getting the audience HYPED!'});
  }
  if (s > 1) {
    transforms.push({moves: ['Sheer Cold'], to: 'concert1', msg: 'The freezing cold drove the audience away...'});
    transforms.push({moves: KILLJOY_MOVES, to: `concert${s - 1}`, msg: 'The crowd is booing — they want action!'});
  }

  defineField({
    id: `concert${s}`,
    family: 'concert',
    stage: s,
    random: s === 1,
    name: `Concert Venue (Hype ${s})`,
    games: REJ,
    intro: intros[s],
    mimicry: 'Normal',
    naturePower: 'Hyper Voice',
    secretPower: {chance: 30, volatileStatus: 'flinch'},
    theme: {bg1: s >= 3 ? '#4a1c2d' : '#2e2438', bg2: '#14101c', ground: '#3d2c44', accent: s >= 3 ? '#ff6b6b' : '#f7b731', fx: 'confetti'},
    info: [
      `Hype Level ${s}/4 — All Sound-based moves deal ${soundMult}× damage!`,
      'Drum Beating, Fake Out, First Impression, Outrage, Rollout, Stomping Tantrum, Thrash, Circle Throw, Dragon Tail & Acid/Acid Spray deal 1.5×; Sing has 100% accuracy.',
      'Sound & Dance moves raise Hype +1; Explosion/Self-Destruct jumps straight to Hype 4; Yawn, Slack Off, Throat Chop & Play Nice kill the crowd vibe (−1)!',
      s === 4 ? 'MAX HYPE: Sound moves also grant the user +1 Speed or Sp. Atk from the roaring crowd!' : 'Reach Hype 4 for bonus crowd stat boosts on Sound moves!',
    ],
    mods: [
      {flags: 'sound', damaging: true, mult: soundMult, msg: s >= 3 ? 'THE CROWD ROARED WITH THE BEAT!' : 'Amplified through the stage speakers!'},
      {moves: ['Acid', 'Acid Spray', 'Circle Throw', 'Dragon Tail', 'Drum Beating', 'Fake Out', 'First Impression', 'Outrage', 'Rage', 'Rollout', 'Stomping Tantrum', 'Thrash'], mult: 1.5},
    ],
    accuracy: {Sing: 100},
    hooks: s === 4 ? {
      onAfterMove(source, target, move) {
        if (move.flags?.sound) this.boost({spe: 1}, source, source);
      },
    } : {},
    transforms,
  });
}

// 11. Deep Earth
defineField({
  id: 'deepearth',
  name: 'Deep Earth',
  games: REJ,
  intro: 'The core is pulling you in...',
  mimicry: 'Ground',
  naturePower: 'Gravity',
  secretPower: {chance: 30, boosts: {spe: -1}},
  theme: {bg1: '#3d2419', bg2: '#1a0f0a', ground: '#543222', accent: '#e07a5f', fx: 'embers'},
  info: [
    'Ground moves (vs non-Ground targets) deal 1.5× damage; Psychic & Rock moves deal 1.3×!',
    'Extreme core gravity: Ground-type attacks hit airborne / Flying / Levitate Pokémon!',
    'Precipice Blades, Land\'s Wrath, Core Enforcer, Crush Grip, Magnet Bomb & Smack Down deal 2×!',
    'Heavy Slam, Heat Crash, Body Press, Body Slam, Grass Knot, Low Kick, Grav Apple, Hammer Arm, Ice Hammer, Icicle Crash, Thousand Arrows/Waves, Spacial Rend & Throws deal 1.5×.',
  ],
  mods: [
    {types: ['Ground'], cond: ({target}) => !target || !target.hasType('Ground'), mult: 1.5, msg: 'Planetary gravity crushed the target!'},
    {types: ['Psychic', 'Rock'], mult: 1.3},
    {moves: ['Core Enforcer', 'Crush Grip', 'Land\'s Wrath', 'Magnet Bomb', 'Precipice Blades', 'Smack Down'], mult: 2},
    {
      moves: ['Ancient Power', 'Body Press', 'Body Slam', 'Circle Throw', 'Crabhammer', 'Dragon Rush',
        'Fling', 'Grass Knot', 'Grav Apple', 'Hammer Arm', 'Heat Crash', 'Heavy Slam', 'Ice Hammer',
        'Icicle Crash', 'Low Kick', 'Spacial Rend', 'Steamroller', 'Stomp', 'Storm Throw', 'Submission',
        'Thousand Arrows', 'Thousand Waves', 'Vital Throw'],
      mult: 1.5,
    },
  ],
  hooks: {
    onModifyMove(move) {
      if (move.type === 'Ground') move.ignoreImmunity = {'Ground': true};
    },
  },
});

// 12. Back Alley
defineField({
  id: 'backalley',
  name: 'Back Alley',
  games: REJ,
  intro: 'Shifty eyes are all around...',
  mimicry: 'Steel',
  naturePower: 'Beat Up',
  secretPower: {chance: 30, status: 'psn'},
  theme: {bg1: '#23262b', bg2: '#0f1114', ground: '#30343b', accent: '#95a5a6', fx: 'mist'},
  info: [
    'Physical Dark moves deal 1.5×; Bug, Poison & Steel moves deal 1.3×; Fairy moves deal 0.5×!',
    'Beat Up, Pay Day, First Impression (gains Dark typing!), Ceaseless Edge, Night Slash, False Surrender, Cross Poison, Poison Jab, X-Scissor, Leaf Blade, Sacred Sword, Smart Strike, Drill Run/Peck & multi-sting/blade moves deal 1.5×!',
    'Smog & Poison Gas never miss.',
    'Transforms: Boomburst, Hyper Voice, Echoed Voice or Uproar alerts the police → City Field!',
  ],
  mods: [
    {types: ['Dark'], cats: ['Physical'], mult: 1.5, msg: 'Dirty fighting from the shadows!'},
    {types: ['Bug', 'Poison', 'Steel'], mult: 1.3},
    {types: ['Fairy'], mult: 0.5},
    {
      moves: ['Aerial Ace', 'Air Cutter', 'Air Slash', 'Aqua Cutter', 'Beat Up', 'Behemoth Blade',
        'Branch Poke', 'Ceaseless Edge', 'Cross Poison', 'Cut', 'Drill Peck', 'Drill Run',
        'False Surrender', 'Fell Stinger', 'First Impression', 'Fury Attack', 'Fury Cutter',
        'Glacial Lance', 'Horn Attack', 'Horn Leech', 'Infestation', 'Leaf Blade', 'Megahorn',
        'Needle Arm', 'Night Slash', 'Pay Day', 'Peck', 'Pin Missile', 'Pluck', 'Poison Jab',
        'Poison Sting', 'Psycho Cut', 'Razor Leaf', 'Razor Shell', 'Sacred Sword', 'Shadow Sneak',
        'Slash', 'Smart Strike', 'Smog', 'Solar Blade', 'Spectral Thief', 'Steamroller',
        'Stone Axe', 'Techno Blast', 'Twineedle', 'X-Scissor'],
      mult: 1.5,
    },
  ],
  typeAdd: [{moves: ['First Impression'], add: 'Dark'}],
  accuracy: {'Poison Gas': true, Smog: true},
  transforms: [
    {moves: ['Boomburst', 'Echoed Voice', 'Hyper Voice', 'Uproar'], to: 'city', msg: 'Cops! Everyone scatter into the City!'},
  ],
});

// 13. City Field
defineField({
  id: 'city',
  name: 'City Field',
  games: REJ,
  intro: 'The streets are busy...',
  mimicry: 'Normal',
  naturePower: 'Smog',
  secretPower: {chance: 30, status: 'par'},
  theme: {bg1: '#283340', bg2: '#121820', ground: '#384554', accent: '#f6b93b', fx: 'sparks'},
  info: [
    'Physical Normal moves deal 1.5×; Bug, Poison & Steel moves deal 1.3×; Fairy moves deal 0.7×!',
    'Beat Up, First Impression (gains Normal typing!), Pay Day, Make It Rain, Smog, Steamroller & Techno Blast deal 1.5×.',
    'Poison Gas & Smog never miss; Shift Gear, Autotomize & Work Up gain urban momentum (+1 Spe).',
    'Transforms: Thief, Covet or Knock Off darts into a Back Alley!',
  ],
  mods: [
    {types: ['Normal'], cats: ['Physical'], mult: 1.5, msg: 'Rush-hour momentum powered the strike!'},
    {types: ['Bug', 'Poison', 'Steel'], mult: 1.3},
    {types: ['Fairy'], mult: 0.7},
    {moves: ['Beat Up', 'First Impression', 'Pay Day', 'Make It Rain', 'Smog', 'Steamroller', 'Techno Blast'], mult: 1.5},
  ],
  typeAdd: [{moves: ['First Impression'], add: 'Normal'}],
  accuracy: {'Poison Gas': true, Smog: true},
  hooks: {
    onAfterMove(source, target, move) {
      if (['workup', 'shiftgear', 'autotomize'].includes(move.id)) this.boost({spe: 1}, source, source);
    },
  },
  transforms: [
    {moves: ['Covet', 'Thief', 'Knock Off'], to: 'backalley', msg: 'Ducking down into a shady Back Alley!'},
  ],
});
