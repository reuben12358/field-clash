'use strict';
/**
 * Pokemon Reborn fields (Part B: #21 Ashen Beach through #37 Inverse Field,
 * including all 5 stages of Flower Garden).
 */
const {defineField, setField} = require('./engine');
const H = require('./helpers');

const ALL3 = ['Reborn', 'Rejuvenation', 'Desolation'];
const REB_REJ = ['Reborn', 'Rejuvenation'];

// 21. Ashen Beach
defineField({
  id: 'ashenbeach',
  name: 'Ashen Beach',
  games: ALL3,
  intro: 'Ash and sand line the field.',
  mimicry: 'Ground',
  naturePower: 'Meditate',
  secretPower: {chance: 30, boosts: {accuracy: -1}},
  theme: {bg1: '#3a3734', bg2: '#1a1918', ground: '#524d47', accent: '#d4b483', fx: 'sand'},
  info: [
    'Mud Bomb, Mud Shot, Mud-Slap & Sand Tomb deal 2× damage!',
    'Surf, Muddy Water, Land\'s Wrath, Thousand Waves & Strength (gains Psychic type!) deal 1.5×.',
    'Aura Sphere, Focus Blast (90% accuracy!), Stored Power & Zen Headbutt deal 1.3×; Psychic deals 1.2×.',
    'Special Flying moves, Twister, Fire Spin, Leaf Tornado & Whirlpool stir up ash, dropping all active Pokémon\'s Accuracy!',
    'Fighting types cannot be confused; activates Sand Rush & Sand Force.',
  ],
  mods: [
    {moves: ['Mud Bomb', 'Mud Shot', 'Mud-Slap', 'Sand Tomb', 'Scorching Sands'], mult: 2, msg: 'Ash and sand amplified the attack!'},
    {moves: ['Land\'s Wrath', 'Muddy Water', 'Strength', 'Surf', 'Thousand Waves', 'Wave Crash'], mult: 1.5},
    {moves: ['Aura Sphere', 'Focus Blast', 'Stored Power', 'Zen Headbutt'], mult: 1.3, msg: 'Inner focus empowered the strike!'},
    {moves: ['Psychic', 'Psyshock'], mult: 1.2},
  ],
  typeAdd: [{moves: ['Strength'], add: 'Psychic'}],
  accuracy: {'Focus Blast': 90},
  speMods: [{abilities: ['Sand Rush'], mult: 2}],
  atkMods: [{abilities: ['Sand Force'], stat: 'both', mult: 1.3}],
  hooks: {
    onAfterMove(source, target, move) {
      if ((move.type === 'Flying' && move.category === 'Special') ||
          ['firespin', 'leaftornado', 'razorwind', 'twister', 'whirlpool'].includes(move.id)) {
        H.fieldAccuracyDrop('Ash swirled across the beach, obscuring vision!').call(this, source, target, move);
      }
    },
  },
});

// 22. Water Surface
defineField({
  id: 'watersurface',
  name: 'Water Surface',
  games: ALL3,
  intro: "The water's surface is calm.",
  mimicry: 'Water',
  naturePower: 'Whirlpool',
  secretPower: {chance: 30, boosts: {spe: -1}},
  theme: {bg1: '#153a54', bg2: '#0b1e2e', ground: '#1d4f73', accent: '#4fc3f7', fx: 'ripples'},
  info: [
    'Water-type moves and Electric moves vs grounded foes deal 1.5× damage; Fire moves vs grounded foes deal 0.5×.',
    'Surf, Muddy Water, Dive & Whirlpool deal an additional 1.5×! Ground-type moves fail; Spikes/Toxic Spikes sink away.',
    'Non-Water grounded Pokémon have 0.75× Speed; Swift Swim & Surge Surfer double Speed; Dry Skin & Water Absorb heal 1/16 HP.',
    'Transforms: Dive / Gravity / Anchor Shot → Underwater; Blizzard / Glaciate → Icy Field; Sludge Wave (2×) → Murkwater Surface.',
  ],
  mods: [
    {types: ['Water'], mult: 1.5, msg: 'The water surface boosted the wave!'},
    {types: ['Electric'], targetGrounded: true, mult: 1.5, msg: 'Electricity coursed across the water!'},
    {types: ['Fire'], targetGrounded: true, mult: 0.5, msg: 'The water dampened the flames...'},
    {moves: ['Dive', 'Muddy Water', 'Surf', 'Whirlpool', 'Wave Crash'], mult: 1.5},
  ],
  fail: [{types: ['Ground'], notMoves: ['Sand Attack', 'Thousand Arrows'], msg: 'There is no solid ground on the water surface!'}],
  speMods: [
    {abilities: ['Swift Swim', 'Surge Surfer'], mult: 2},
    {
      grounded: true,
      mult: 0.75,
      cond({pokemon}) {
        return !pokemon.hasType('Water') && !pokemon.hasAbility(['swiftswim', 'surgesurfer']);
      },
    },
  ],
  onStart(battle) {
    for (const side of battle.sides) {
      side.removeSideCondition('spikes');
      side.removeSideCondition('toxicspikes');
    }
  },
  residual(pokemon) {
    if (pokemon.hasAbility(['dryskin', 'waterabsorb']) && pokemon.hp < pokemon.maxhp) {
      this.heal(Math.max(1, Math.floor(pokemon.maxhp / 16)), pokemon);
    }
    if (pokemon.hasAbility('hydration') && pokemon.status) pokemon.cureStatus();
  },
  counters: [
    {moves: ['Sludge Wave'], add: 1, threshold: 2, to: 'murkwatersurface', progressMsg: 'Poison spread through the water!', msg: 'The water was polluted into Murkwater!'},
  ],
  transforms: [
    {moves: ['Dive', 'Gravity', 'Anchor Shot', 'Grav Apple'], to: 'underwater', msg: 'The battle sank into the depths!'},
    {moves: H.FREEZE_FIELD_MOVES, to: 'icy', msg: 'The water froze over!'},
  ],
});

// 23. Underwater
defineField({
  id: 'underwater',
  name: 'Underwater',
  games: ALL3,
  blockTerrain: true,
  blockTerrainMsg: 'Terrains cannot form deep underwater!',
  intro: 'Blub blub...',
  mimicry: 'Water',
  naturePower: 'Water Pulse',
  secretPower: {chance: 30, boosts: {atk: -1}},
  theme: {bg1: '#0c2740', bg2: '#05121f', ground: '#103554', accent: '#29b6f6', fx: 'bubbles'},
  info: [
    'Electric moves deal 2× damage and never miss! Water moves deal 1.5×; Anchor Shot deals 2×; Water Pulse deals 1.5×.',
    'Fire-type moves fail completely; non-Water physical attacks are halved (0.5×) by water pressure; all Ground moves gain Water typing.',
    'Non-Water Pokémon have 0.5× Speed (Swift Swim doubles Speed!) and take drowning damage if weak to Water.',
    'Transforms: Dive, Fly, Bounce or Sky Drop resurfaces to Water Surface; Sludge Wave (2×) pollutes the depths into Murkwater!',
  ],
  mods: [
    {types: ['Electric'], mult: 2, msg: 'High-conductivity water supercharged the jolt!'},
    {types: ['Water'], mult: 1.5},
    {moves: ['Anchor Shot'], mult: 2},
    {moves: ['Water Pulse'], mult: 1.5},
    {
      cats: ['Physical'],
      cond({source, move}) {
        return move.type !== 'Water' && !source?.hasAbility('steelworker');
      },
      mult: 0.5,
    },
  ],
  typeAdd: [{types: ['Ground'], damaging: true, add: 'Water'}],
  fail: [{types: ['Fire'], msg: 'The attack was doused underwater!'}],
  speMods: [
    {abilities: ['Swift Swim', 'Surge Surfer'], mult: 2},
    {
      mult: 0.5,
      cond({pokemon}) {
        return !pokemon.hasType('Water') && !pokemon.hasAbility(['swiftswim', 'surgesurfer']);
      },
    },
  ],
  onStart(battle) {
    if (battle.field.weather) battle.field.clearWeather();
  },
  hooks: {
    onModifyMove(move) {
      if (move.type === 'Electric') move.accuracy = true;
    },
  },
  residual(pokemon) {
    if (pokemon.hasAbility(['dryskin', 'waterabsorb']) && pokemon.hp < pokemon.maxhp) {
      this.heal(Math.max(1, Math.floor(pokemon.maxhp / 16)), pokemon);
      return;
    }
    if (pokemon.hasType('Water') || pokemon.hasAbility(['swiftswim', 'magicguard', 'wonderguard', 'waterveil', 'waterbubble'])) return;
    const eff = H.typeEffMult(this, 'Water', pokemon);
    if (eff > 1) {
      let dmg = Math.floor(pokemon.maxhp * eff / 8);
      if (pokemon.hasAbility(['flamebody', 'magmaarmor'])) dmg *= 2;
      this.damage(Math.max(1, dmg), pokemon);
    }
  },
  counters: [
    {
      moves: ['Sludge Wave'],
      add: 1,
      threshold: 2,
      before: H.waterPollution,
      to: 'murkwatersurface',
      progressMsg: 'Toxic sludge clouded the depths!',
      msg: 'The polluted depths forced everyone to the Murkwater Surface!',
    },
  ],
  transforms: [
    {moves: ['Dive', 'Bounce', 'Fly', 'Sky Drop'], to: 'watersurface', msg: 'The battle resurfaced!'},
  ],
});

// 24. Cave
defineField({
  id: 'cave',
  name: 'Cave',
  games: ALL3,
  intro: 'The cave echoes dully...',
  mimicry: 'Rock',
  naturePower: 'Rock Tomb',
  secretPower: {chance: 30, volatileStatus: 'flinch'},
  theme: {bg1: '#2e2924', bg2: '#141210', ground: '#3d362f', accent: '#b89f7a', fx: 'dust'},
  info: [
    'Rock-type moves and Sound-based moves deal 1.5× damage; Rock Tomb deals an extra 1.5×; non-contact Flying moves deal 0.5×.',
    'Low ceiling: Ground-type moves can hit airborne / Flying / Levitate Pokémon!',
    'WATCH OUT: Using Earthquake, Bulldoze, Magnitude or Fissure TWICE collapses the cave ceiling for massive damage!',
    'Transforms: Power Gem / Diamond Storm → Crystal Cavern; Draco Meteor / Dragon Pulse (2×) → Dragon\'s Den; Sludge Wave (2×) → Corrupted Cave; Eruption / Lava Plume (2×) → Burning Field; Gravity (2×) → Deep Earth.',
  ],
  mods: [
    {types: ['Rock'], mult: 1.5, msg: 'The cavern strengthened the rock attack!'},
    {flags: 'sound', damaging: true, mult: 1.5, msg: 'Echo-o-o!'},
    {moves: ['Rock Tomb'], mult: 1.5},
    {types: ['Flying'], noContact: true, mult: 0.5, msg: 'The low cave ceiling cramped the attack...'},
  ],
  hooks: {
    onModifyMove(move) {
      if (move.type === 'Ground') move.ignoreImmunity = {'Ground': true};
    },
  },
  counters: [
    {
      key: 'counter',
      moves: H.QUAKE_MOVES,
      add: 1,
      threshold: 2,
      progressMsg: 'Bits of rock fell from the crumbling ceiling!',
      onTrigger: H.caveCollapse,
      label: 'Earthquake / Bulldoze / Magnitude (2× collapses ceiling!)',
    },
    {key: 'counter2', moves: ['Dragon Pulse'], add: 1, threshold: 2, to: 'dragonsden', progressMsg: 'Draconic energy echoed through the cavern!', msg: 'The cavern became a Dragon\'s Den!'},
    {key: 'counter3', moves: ['Lava Plume', 'Eruption', 'Heat Wave'], add: 1, threshold: 2, to: 'burning', progressMsg: 'Magma seeped through the cavern floor!', msg: 'The cavern erupted into flames!'},
    {key: 'counter4', moves: ['Gravity'], add: 1, threshold: 2, to: 'deepearth', progressMsg: 'Gravity pulled deeper toward the core!', msg: 'Pulled down into Deep Earth!'},
  ],
  transforms: [
    {moves: ['Power Gem', 'Diamond Storm'], to: 'crystalcavern', msg: 'The cave glittered with crystals!'},
    {moves: ['Draco Meteor'], to: 'dragonsden', msg: 'Draconic meteors hollowed out a Dragon\'s Den!'},
    {moves: ['Gunk Shot', 'Sludge Wave'], to: 'corruptedcave', msg: 'Corruption seeped into the cavern walls!'},
  ],
});

// 25. Glitch Field
defineField({
  id: 'glitch',
  name: 'Glitch Field',
  games: ALL3,
  intro: '1n!taliz3 .b//////attl3',
  mimicry: 'Normal',
  naturePower: 'Metronome',
  secretPower: {chance: 30, boosts: {spe: -1}},
  theme: {bg1: '#182b29', bg2: '#0b1214', ground: '#1f3834', accent: '#35e0a1', fx: 'glitch'},
  info: [
    'GEN 1 GLITCH MECHANICS: Move category is determined by type (Fire/Water/Grass/Electric/Ice/Psychic/Dragon are Special; others Physical)!',
    'Dark-, Steel- & Fairy-type moves glitch back into Normal-type! Psychic attacks deal 1.2× damage; Blizzard has 90% accuracy.',
    'Special moves use MAX(Sp. Atk, Sp. Def) as the unified "Special" stat! Faster attackers gain +1 crit stage!',
    'Gen 1 type bugs: Ghost fails vs Psychic; Bug & Poison hit each other super-effectively; Ice hits Fire neutrally!',
  ],
  mods: [{types: ['Psychic'], mult: 1.2, msg: '0P_PSYCH1C.exe!'}],
  typeChange: [{types: ['Dark', 'Steel', 'Fairy'], damaging: true, to: 'Normal'}],
  accuracy: {Blizzard: 90},
  hooks: {
    onModifyMove(move, pokemon, target) {
      if (move.category === 'Status') return;
      move.category = H.GEN1_SPECIAL_TYPES.has(move.type) ? 'Special' : 'Physical';
      if (target && pokemon.getStat('spe') > target.getStat('spe')) {
        move.critRatio = (move.critRatio || 1) + 1;
      }
      if (move.type === 'Ghost' && target?.hasType('Psychic')) {
        move.accuracy = 0;
        this.add('-message', 'GL1TCH: Ghost has no effect on Psychic!');
      }
    },
    onModifySpA(spa, pokemon) {
      const spd = pokemon.storedStats.spd;
      if (spd > pokemon.storedStats.spa) return Math.floor(spa * spd / Math.max(1, pokemon.storedStats.spa));
    },
    onEffectiveness(typeMod, target, type, move) {
      if (move.type === 'Bug' && type === 'Poison') return 1;
      if (move.type === 'Poison' && type === 'Bug') return 1;
      if (move.type === 'Ice' && type === 'Fire') return 0;
      if (move.type === 'Dragon' && type === 'Dragon') return 0;
      return typeMod;
    },
  },
});

// 26. Crystal Cavern
const CC_TYPES = ['Fire', 'Water', 'Grass', 'Psychic'];
defineField({
  id: 'crystalcavern',
  name: 'Crystal Cavern',
  games: ALL3,
  intro: 'The cave is littered with crystals.',
  mimicry: 'Rock',
  naturePower: 'Power Gem',
  secretPower: {chance: 40, status: 'par'},
  theme: {bg1: '#23384d', bg2: '#101a26', ground: '#2d4963', accent: '#56ccf2', fx: 'crystals'},
  info: [
    'Rock- and Dragon-type attacks deal 1.5× damage!',
    'Rock attacks, Judgment, Multi-Attack, Rock Climb & Strength cycle through bonus Fire → Water → Grass → Psychic crystal typing!',
    'Power Gem, Ancient Power, Diamond Storm, Rock Slide/Tomb/Smash deal an extra 1.5×; light beams deal 1.3×; Prism Armor reduces damage.',
    'Transforms: Dark Pulse, Night Daze or Dark Void → Dark Crystal Cavern; Quake moves (2×) → Cave.',
  ],
  mods: [
    {types: ['Rock', 'Dragon'], mult: 1.5, msg: 'The crystals resonated with the attack!'},
    {moves: ['Ancient Power', 'Diamond Storm', 'Judgment', 'Multi-Attack', 'Power Gem', 'Rock Climb', 'Rock Smash', 'Rock Tomb', 'Strength'], mult: 1.5},
    {moves: H.BLINDING_MOVES, mult: 1.3, msg: 'Light refracted off the crystals!'},
  ],
  typeAdd: [
    {
      types: ['Rock'],
      damaging: true,
      add({battle}) {
        const st = battle.rfield;
        const t = CC_TYPES[st.rollIdx % CC_TYPES.length];
        st.rollIdx++;
        return t;
      },
    },
  ],
  defMods: [{abilities: ['Prism Armor'], stat: 'both', mult: 1.33}],
  counters: [
    {moves: H.QUAKE_MOVES, add: 1, threshold: 2, to: 'cave', progressMsg: 'The crystals cracked from the tremor!', msg: 'The crystals shattered! Back to a Cave!'},
  ],
  transforms: [
    {moves: ['Dark Pulse', 'Dark Void', 'Night Daze', 'Fiery Wrath'], to: 'darkcrystalcavern', msg: "The crystals' light was warped by darkness!"},
  ],
});

// 27. Murkwater Surface
defineField({
  id: 'murkwatersurface',
  name: 'Murkwater Surface',
  games: ALL3,
  intro: 'The water is tainted...',
  mimicry: 'Poison',
  naturePower: 'Sludge Wave',
  secretPower: {chance: 40, status: 'psn'},
  theme: {bg1: '#2b3326', bg2: '#121711', ground: '#394530', accent: '#8bc34a', fx: 'acid'},
  info: [
    'Water- and Poison-type attacks deal 1.5× damage; ALL Water attacks gain Poison typing; Sludge Wave gains Water typing!',
    'Electric attacks against grounded targets deal 1.3×; Acid, Acid Spray, Brine, Mud Bomb/Shot/Slap & Smack Down deal 1.5×.',
    'Grounded non-Poison/Steel Pokémon take toxic water damage each turn (1/8 base) and have 0.75× Speed; Ground moves fail.',
    'Transforms: Whirlpool or Purify flushes into clean Water Surface; Blizzard / Glaciate freezes into Icy Field.',
  ],
  mods: [
    {types: ['Poison', 'Water'], mult: 1.5, msg: 'The tainted water strengthened the attack!'},
    {types: ['Electric'], targetGrounded: true, mult: 1.3},
    {moves: ['Acid', 'Acid Spray', 'Brine', 'Mud Bomb', 'Mud Shot', 'Mud-Slap', 'Smack Down', 'Thousand Waves'], mult: 1.5},
  ],
  typeAdd: [
    {types: ['Water'], damaging: true, add: 'Poison'},
    {moves: ['Sludge Wave'], add: 'Water'},
    {moves: ['Mud Bomb', 'Mud Shot', 'Mud-Slap', 'Smack Down', 'Thousand Waves'], add: 'Poison'},
  ],
  fail: [{types: ['Ground'], notMoves: ['Sand Attack', 'Thousand Arrows'], msg: 'There is no solid ground on the murkwater!'}],
  speMods: [
    {abilities: ['Swift Swim', 'Surge Surfer'], mult: 2},
    {
      grounded: true,
      mult: 0.75,
      cond({pokemon}) {
        return !pokemon.hasType('Water') && !pokemon.hasAbility(['swiftswim', 'surgesurfer']);
      },
    },
  ],
  residual(pokemon) {
    if (!pokemon.isGrounded()) return;
    if (pokemon.hasType(['Poison', 'Steel'])) {
      if (pokemon.hasAbility(['dryskin', 'waterabsorb']) && pokemon.hp < pokemon.maxhp) {
        this.heal(Math.max(1, Math.floor(pokemon.maxhp / 16)), pokemon);
      }
      return;
    }
    if (pokemon.hasAbility(['immunity', 'magicguard', 'poisonheal', 'toxicboost', 'wonderguard'])) return;
    const eff = H.typeEffMult(this, 'Poison', pokemon);
    if (eff <= 0) return;
    let dmg = Math.floor(pokemon.maxhp * eff / 8);
    if (pokemon.hasAbility(['dryskin', 'flamebody', 'magmaarmor', 'waterabsorb'])) dmg *= 2;
    this.damage(Math.max(1, dmg), pokemon);
  },
  transforms: [
    {moves: ['Whirlpool', 'Purify'], to: 'watersurface', msg: 'The maelstrom flushed out the poison!'},
    {moves: H.FREEZE_FIELD_MOVES, to: 'icy', msg: 'The toxic water froze over!'},
  ],
});

// 28. Mountain
defineField({
  id: 'mountain',
  name: 'Mountain',
  games: ALL3,
  intro: 'Adieu to disappointment and spleen — what are men to rocks and mountains?',
  mimicry: 'Rock',
  naturePower: 'Rock Slide',
  secretPower: {chance: 30, volatileStatus: 'flinch'},
  theme: {bg1: '#35404d', bg2: '#181e26', ground: '#4b5563', accent: '#9bb1c9', fx: 'wind'},
  info: [
    'Flying- and Rock-type attacks deal 1.5× damage!',
    'Wind moves, Hyper Voice, Eruption, Avalanche, Thunder (never misses!) & Throw moves deal 1.5×.',
    'Transforms: Blizzard / Glaciate (or 3 turns of Hail/Snow) → Snowy Mountain; Bounce / Fly → Sky Field; Eruption / Lava Plume → Volcanic Top.',
  ],
  mods: [
    {types: ['Flying', 'Rock'], mult: 1.5, msg: 'Mountain winds amplified the attack!'},
    {
      moves: ['Avalanche', 'Circle Throw', 'Eruption', 'Fairy Wind', 'Hyper Voice', 'Icy Wind',
        'Ominous Wind', 'Razor Wind', 'Silver Wind', 'Storm Throw', 'Thunder', 'Twister', 'Vital Throw'],
      mult: 1.5,
    },
  ],
  accuracy: {Thunder: true},
  fieldResidual() {
    if (H.isHailing(this)) {
      this.rfield.weatherTurns = (this.rfield.weatherTurns || 0) + 1;
      if (this.rfield.weatherTurns >= 3) {
        setField(this, 'snowymountain', {msg: 'The blizzard blanketed the mountain in snow!'});
      }
    } else {
      this.rfield.weatherTurns = 0;
    }
  },
  transforms: [
    {moves: H.FREEZE_FIELD_MOVES, to: 'snowymountain', msg: 'The mountain was covered in snow!'},
    {moves: ['Fly', 'Bounce'], to: 'sky', msg: 'The battle soared high into the Sky!'},
    {moves: ['Eruption', 'Lava Plume'], to: 'volcanictop', msg: 'Volcanic heat erupted across the peak!'},
  ],
});

// 29. Snowy Mountain
defineField({
  id: 'snowymountain',
  name: 'Snowy Mountain',
  games: ALL3,
  intro: 'The snow glows white on the mountain...',
  mimicry: 'Ice',
  naturePower: 'Avalanche',
  secretPower: {chance: 20, status: 'frz'},
  theme: {bg1: '#2b4356', bg2: '#14212b', ground: '#3e5c73', accent: '#a8dcf0', fx: 'snow'},
  info: [
    'Flying-, Ice- and Rock-type attacks all deal 1.5× damage, and ALL Rock moves gain Ice typing!',
    'Fire moves & Scald / Steam Eruption deal 0.5×; Icy Wind deals 2×; Wind/Throw moves, Avalanche, Glaciate & Hyper Voice deal 1.5×.',
    'Thunder never misses; activates Slush Rush (2× Speed) & Ice Body; Ice types gain 1.5× Defense in Snow/Hail.',
    'Transforms: Heat Wave / Eruption / Lava Plume melts the snow → Mountain; Fly / Bounce → Sky Field.',
  ],
  mods: [
    {types: ['Flying', 'Ice', 'Rock'], mult: 1.5, msg: 'The alpine gale boosted the attack!'},
    {types: ['Fire'], mult: 0.5, msg: 'The freezing gale weakened the flames...'},
    {moves: ['Icy Wind'], mult: 2},
    {
      moves: ['Avalanche', 'Circle Throw', 'Fairy Wind', 'Glaciate', 'Hyper Voice', 'Ominous Wind',
        'Powder Snow', 'Razor Wind', 'Silver Wind', 'Storm Throw', 'Twister', 'Vital Throw'],
      mult: 1.5,
    },
    {moves: ['Scald', 'Steam Eruption'], mult: 0.5},
  ],
  typeAdd: [{types: ['Rock'], damaging: true, add: 'Ice'}],
  accuracy: {Thunder: true},
  defMods: [{types: ['Ice'], stat: 'def', weather: ['hail', 'snow', 'snowscape'], mult: 1.5}],
  speMods: [{abilities: ['Slush Rush'], mult: 2}],
  residual(pokemon) {
    if (pokemon.hasAbility('icebody') && pokemon.hp < pokemon.maxhp) {
      this.heal(Math.max(1, Math.floor(pokemon.maxhp / 16)), pokemon);
    }
  },
  transforms: [
    {moves: H.IGNITE_MOVES, to: 'mountain', msg: 'The snow melted away!'},
    {moves: ['Fly', 'Bounce'], to: 'sky', msg: 'The battle ascended into the Sky!'},
  ],
});

// 30. Holy / Blessed Field
defineField({
  id: 'holy',
  name: 'Blessed Field',
  games: ALL3,
  intro: 'Benedictus Sanctus Spiritus...',
  mimicry: 'Normal',
  naturePower: 'Judgment',
  secretPower: {chance: 30, boosts: {spa: -1}},
  theme: {bg1: '#443b24', bg2: '#1f1b10', ground: '#5c5030', accent: '#f2cb6c', fx: 'motes'},
  info: [
    'SACRED TYPE LAW: Normal-type moves hit Ghost- and Dark-type Pokémon for super-effective damage!',
    'Special Fairy & Special Normal moves deal 1.5×; Psychic & Dragon deal 1.2×; Ghost & Special Dark deal 0.5×.',
    'Judgment, Extreme Speed, Sacred Fire, Sacred Sword, Mystical Fire, Magical Leaf & Ancient Power deal 1.5×; legendary signature moves deal 1.3×.',
    'Curses are lifted at the end of each turn.',
    'Transforms: Curse, Phantom Force, Shadow Force or Ominous Wind corrupts into Haunted Field!',
  ],
  mods: [
    {types: ['Fairy', 'Normal'], cats: ['Special'], mult: 1.5, msg: 'Sacred light amplified the attack!'},
    {types: ['Psychic', 'Dragon'], mult: 1.2},
    {types: ['Ghost'], mult: 0.5, msg: 'The holy aura repelled the spirits...'},
    {types: ['Dark'], cats: ['Special'], mult: 0.5},
    {moves: ['Ancient Power', 'Extreme Speed', 'Judgment', 'Magical Leaf', 'Mystical Fire', 'Sacred Fire', 'Sacred Sword'], mult: 1.5},
    {
      moves: ['Aeroblast', 'Diamond Storm', 'Doom Desire', 'Dragon Ascent', 'Fleur Cannon', 'Hyperspace Hole',
        'Land\'s Wrath', 'Luster Purge', 'Mist Ball', 'Moongeist Beam', 'Origin Pulse', 'Precipice Blades',
        'Prismatic Laser', 'Psycho Boost', 'Psystrike', 'Relic Song', 'Roar of Time', 'Secret Sword', 'Spacial Rend', 'Sunsteel Strike'],
      mult: 1.3,
    },
  ],
  hooks: {
    onModifyMove(move) {
      if (move.type === 'Normal') move.ignoreImmunity = {'Normal': true};
    },
    onEffectiveness(typeMod, target, type, move) {
      if (move.type === 'Normal' && (type === 'Ghost' || type === 'Dark')) return 1;
      return typeMod;
    },
  },
  residual(pokemon) {
    if (pokemon.volatiles.curse) pokemon.removeVolatile('curse');
  },
  transforms: [
    {moves: ['Curse', 'Phantom Force', 'Shadow Force', 'Ominous Wind', 'Trick-or-Treat'], to: 'haunted', msg: 'Evil spirits overtook the sanctuary!'},
  ],
});

// 31. Mirror Arena
defineField({
  id: 'mirror',
  name: 'Mirror Arena',
  games: REB_REJ,
  intro: 'Mirror, mirror, on the field — who shall this fractured power wield?',
  mimicry: 'Steel',
  naturePower: 'Mirror Shot',
  secretPower: {chance: 30, boosts: {evasion: -1}},
  theme: {bg1: '#283845', bg2: '#121a21', ground: '#384e5e', accent: '#9be2f5', fx: 'prism'},
  info: [
    'Mirror Shot deals 2× damage with 100% accuracy-drop chance! Beam & light moves deal 1.5× and never miss!',
    'Reflected beams (Ice Beam, Hyper Beam, Solar Beam, Bubble Beam, Charge Beam, Psybeam, Tri Attack) deal 2× against foes with raised Evasion.',
    'Missing a physical contact move deals 1/4 max HP crash recoil as the attacker slams into a mirror!',
    'Transforms: Earthquake, Bulldoze, Magnitude, Boomburst, Hyper Voice, Explosion or Self-Destruct SHATTERS the arena (dealing 50% max HP shard damage to unprotected Pokémon)!',
  ],
  mods: [
    {moves: ['Mirror Shot'], mult: 2, msg: 'Reflected from every angle!'},
    {moves: H.BLINDING_MOVES, mult: 1.5, msg: 'Blinding reflections amplified the beam!'},
    {
      moves: H.MIRROR_BEAMS,
      cond({target}) {
        return target && (target.boosts.evasion || 0) > 0;
      },
      mult: 2,
    },
  ],
  accuracy: {
    'Aurora Beam': true, 'Dazzling Gleam': true, 'Doom Desire': true, 'Flash Cannon': true,
    'Luster Purge': true, 'Photon Geyser': true, 'Prismatic Laser': true, 'Signal Beam': true, 'Techno Blast': true,
  },
  hooks: {
    onMoveFail(target, source, move) {
      if (source && move?.category === 'Physical' && move.flags?.contact && !source.hasAbility('magicguard')) {
        this.add('-message', `${source.name} crashed into a mirror!`);
        this.damage(Math.max(1, Math.floor(source.maxhp / 4)), source);
      }
    },
  },
  transforms: [
    {
      moves: [...H.QUAKE_MOVES, 'Boomburst', 'Hyper Voice', 'Explosion', 'Self-Destruct'],
      before: H.mirrorShatter,
      to: 'backup',
    },
  ],
});

// 32. Fairy Tale Field
defineField({
  id: 'fairytale',
  name: 'Fairy Tale Field',
  games: ALL3,
  intro: 'Once upon a time...',
  mimicry: 'Fairy',
  naturePower: 'Secret Sword',
  secretPower: {chance: 30, status: 'slp'},
  theme: {bg1: '#3b2638', bg2: '#1a121c', ground: '#4f334a', accent: '#f29bc2', fx: 'motes'},
  info: [
    'Dragon-type attacks deal 2× damage; Fairy- and Steel-type attacks deal 1.5× damage!',
    'SLAY THE DRAGON: Steel-type moves hit Dragon-type Pokémon for super-effective damage! All Fire moves gain Dragon typing!',
    'Cut, Slash, Sacred Sword & Secret Sword become Steel-type! Draining Kiss deals 2×; blade & mystical moves deal 1.5×.',
    'Battle Armor & Shell Armor grant +1 Defense on switch-in; Swords Dance grants +3 Attack!',
  ],
  mods: [
    {types: ['Dragon'], mult: 2, msg: 'The dragon roared with mythical fury!'},
    {types: ['Fairy', 'Steel'], mult: 1.5, msg: 'Chivalry and magic strengthened the strike!'},
    {moves: ['Draining Kiss'], mult: 2},
    {
      moves: ['Air Slash', 'Ancient Power', 'Fleur Cannon', 'Leaf Blade', 'Magical Leaf', 'Moongeist Beam',
        'Mystical Fire', 'Night Slash', 'Psycho Cut', 'Relic Song', 'Smart Strike', 'Solar Blade', 'Sparkling Aria', 'Ceaseless Edge', 'Aqua Cutter', 'Bitter Blade'],
      mult: 1.5,
    },
  ],
  typeAdd: [{types: ['Fire'], damaging: true, add: 'Dragon'}],
  typeChange: [{moves: ['Cut', 'Slash', 'Sacred Sword', 'Secret Sword'], to: 'Steel'}],
  defMods: [{abilities: ['Marvel Scale'], stat: 'def', mult: 1.5}],
  onSwitchIn(pokemon) {
    if (pokemon.hasAbility(['battlearmor', 'shellarmor'])) this.boost({def: 1}, pokemon, pokemon);
    if (pokemon.hasAbility(['magicguard', 'magicbounce'])) this.boost({spd: 1}, pokemon, pokemon);
  },
  hooks: {
    onEffectiveness(typeMod, target, type, move) {
      if (move.type === 'Steel' && type === 'Dragon') return 1;
      return typeMod;
    },
    onAfterMove(source, target, move) {
      if (move.id === 'swordsdance') this.boost({atk: 1}, source, source);
    },
  },
});

// 33. Dragon's Den
defineField({
  id: 'dragonsden',
  name: "Dragon's Den",
  games: ALL3,
  intro: 'If you wish to slay a dragon...',
  mimicry: 'Dragon',
  naturePower: 'Dragon Pulse',
  secretPower: {chance: 30, status: 'brn'},
  theme: {bg1: '#471a1c', bg2: '#1f0b0d', ground: '#5e2324', accent: '#eb5757', fx: 'embers'},
  info: [
    'Dragon- and Fire-type attacks deal 1.5× damage; Ice- and Water-type attacks deal 0.5×!',
    'Dragon-type Pokémon gain 1.3× Defense and Sp. Def!',
    'Dragon Ascent, Pay Day, Smack Down & Thousand Arrows deal 2× (Smack Down & Thousand Arrows gain Fire typing!); Lava Plume, Magma Storm & Mega Kick deal 1.5×.',
    'Transforms: Glaciate immediately cools into Cave; Surf / Muddy Water / Sparkling Aria (2×) hardens lava into Cave; Mist / Misty Terrain → Fairy Tale Field.',
  ],
  mods: [
    {types: ['Dragon', 'Fire'], mult: 1.5, msg: 'Draconic heat fueled the attack!'},
    {types: ['Ice', 'Water'], mult: 0.5, msg: 'The searing den weakened the attack...'},
    {moves: ['Dragon Ascent', 'Pay Day', 'Smack Down', 'Thousand Arrows'], mult: 2},
    {moves: ['Lava Plume', 'Magma Storm', 'Mega Kick'], mult: 1.5},
  ],
  typeAdd: [{moves: ['Smack Down', 'Thousand Arrows'], add: 'Fire'}],
  defMods: [
    {types: ['Dragon'], stat: 'both', mult: 1.3},
    {abilities: ['Marvel Scale'], stat: 'def', mult: 1.5},
  ],
  counters: [
    {moves: ['Surf', 'Muddy Water', 'Sparkling Aria'], add: 1, threshold: 2, to: 'cave', progressMsg: 'The lava began to harden!', msg: 'The lava solidified into a Cave!'},
  ],
  transforms: [
    {moves: ['Glaciate'], to: 'cave', msg: 'The lava was frozen solid into a Cave!'},
    {moves: ['Mist'], to: 'fairytale', msg: 'Enchanted mist turned the den into a Fairy Tale!'},
  ],
});

// 34. Flower Garden (Stages 1–5)
const GARDEN_STAGES = [
  {stage: 1, grass: 1, bug: 1, fire: 1, np: 'Growth', intro: 'Seeds line the field. (Stage 1/5)'},
  {stage: 2, grass: 1.1, bug: 1.5, fire: 1, np: 'Growth', intro: 'Sprouts bud across the garden! (Stage 2/5)'},
  {stage: 3, grass: 1.3, bug: 1.5, fire: 1.5, np: 'Growth', intro: 'Blossoms open across the field! (Stage 3/5)'},
  {stage: 4, grass: 1.5, bug: 2.0, fire: 1.5, np: 'Growth', intro: 'Vibrant flowers blanket the garden! (Stage 4/5)'},
  {stage: 5, grass: 2.0, bug: 2.0, fire: 1.5, np: 'Petal Blizzard', intro: 'The Flower Garden is in glorious full bloom! (Stage 5/5)'},
];
for (const g of GARDEN_STAGES) {
  const s = g.stage;
  const mods = [];
  if (g.grass > 1) mods.push({types: ['Grass'], mult: g.grass, msg: 'The blooming garden powered up the attack!'});
  if (g.bug > 1) mods.push({types: ['Bug'], mult: g.bug, msg: 'Pollinators swarmed from the flowers!'});
  if (g.fire > 1) mods.push({types: ['Fire'], mult: g.fire, msg: 'The dry petals caught flame!'});
  if (s >= 2) mods.push({moves: ['Cut'], mult: 1.5});
  if (s >= 3) mods.push({moves: ['Fleur Cannon', 'Petal Blizzard', 'Petal Dance'], mult: s >= 4 ? 1.5 : 1.2});

  const transforms = [];
  if (s < 5) {
    transforms.push({moves: H.GROW_MOVES, to: `flowergarden${s + 1}`, msg: 'The garden grew to the next stage!'});
  }
  if (s > 1) {
    transforms.push({moves: ['Cut', 'X-Scissor', 'Aqua Cutter', 'Solar Blade'], to: `flowergarden${s - 1}`, msg: 'The garden was cut down a stage!'});
  }
  if (s >= 3) {
    transforms.push({moves: H.IGNITE_MOVES, cond: H.igniteCheck, to: 'burning', msg: 'The lush garden caught fire!'});
  }

  defineField({
    id: `flowergarden${s}`,
    family: 'flowergarden',
    stage: s,
    random: s === 1,
    name: `Flower Garden (Stage ${s})`,
    games: ALL3,
    intro: g.intro,
    mimicry: 'Grass',
    naturePower: g.np,
    secretPower: {chance: 30, boosts: s >= 3 ? {def: -1, spd: -1} : {evasion: -1}},
    theme: {bg1: s >= 4 ? '#3d2235' : '#1f3b26', bg2: '#111c14', ground: s >= 4 ? '#522e46' : '#2b5233', accent: s >= 4 ? '#f28b9f' : '#7ed957', fx: 'leaves'},
    info: [
      `Stage ${s}/5 — Grass moves: ${g.grass}×, Bug moves: ${g.bug}×${s >= 3 ? `, Fire moves: ${g.fire}×` : ''}.`,
      'Grows +1 stage on Growth, Rain Dance, Sunny Day, Rototiller, Ingrain, Floral Healing, Grassy Glide, or Drizzle/Drought/Flower Veil switch-in!',
      'Cut, X-Scissor, Aqua Cutter & Solar Blade trim −1 stage; at Stage 3+ flame spread moves ignite into Burning Field!',
      s >= 4 ? 'Stage 4+: Chlorophyll is active (2× Speed) and Grass weaknesses are neutralized!' : 'Reach Stage 4+ to activate Chlorophyll (2× Speed) and neutralize Grass weaknesses!',
    ],
    mods,
    accuracy: s >= 3 ? {'Sleep Powder': 85, 'Poison Powder': 85, 'Stun Spore': 85} : {},
    speMods: s >= 4 ? [{abilities: ['Chlorophyll'], mult: 2}] : [],
    onSwitchIn(pokemon) {
      if (s < 5 && pokemon.hasAbility(['drizzle', 'drought', 'flowergift', 'flowerveil'])) {
        setField(this, `flowergarden${s + 1}`, {msg: `${pokemon.name}'s aura made the garden bloom!`});
      }
    },
    hooks: s >= 4 ? {
      onEffectiveness(typeMod, target, type) {
        if (type === 'Grass' && typeMod > 0) return 0;
        return typeMod;
      },
    } : {},
    transforms,
  });
}

// 35. Starlight Arena
defineField({
  id: 'starlight',
  name: 'Starlight Arena',
  games: ALL3,
  intro: 'Starlight fills the battlefield.',
  mimicry: 'Dark',
  naturePower: 'Moonblast',
  secretPower: {chance: 30, boosts: {spd: -1}},
  theme: {bg1: '#16203b', bg2: '#090d1a', ground: '#1f2d52', accent: '#ffd166', fx: 'stars'},
  info: [
    'Under clear skies (no weather), Dark & Psychic moves deal 1.5× and Fairy moves deal 1.3×!',
    'ALL Dark-type attacks gain Fairy typing! Solar Beam & Solar Blade become Fairy-type!',
    'Doom Desire deals 4× damage and gains Fire typing! Draco Meteor, Comet Punch, Meteor Mash, Swift, Moongeist Beam, Spacial Rend, Sunsteel Strike & Hyperspace moves deal 2×!',
    'Moonblast, Dazzling Gleam, Flash Cannon, Photon Geyser & light beams deal 1.5×; Geomancy needs no charge turn.',
  ],
  mods: [
    {types: ['Dark', 'Psychic'], cond: ({battle}) => !battle.field.effectiveWeather(), mult: 1.5, msg: 'Starlight empowered the attack!'},
    {types: ['Fairy'], cond: ({battle}) => !battle.field.effectiveWeather(), mult: 1.3},
    {moves: ['Doom Desire'], cond: ({battle}) => !battle.field.effectiveWeather(), mult: 4, msg: 'A falling star struck the battlefield!'},
    {
      moves: ['Comet Punch', 'Draco Meteor', 'Hyperspace Fury', 'Hyperspace Hole', 'Meteor Assault',
        'Meteor Mash', 'Moongeist Beam', 'Spacial Rend', 'Sunsteel Strike', 'Swift', 'Meteor Beam'],
      cond: ({battle}) => !battle.field.effectiveWeather(),
      mult: 2,
      msg: 'Cosmic power surged!',
    },
    {
      moves: ['Aurora Beam', 'Dazzling Gleam', 'Flash Cannon', 'Luster Purge', 'Mirror Shot', 'Moonblast',
        'Photon Geyser', 'Prismatic Laser', 'Signal Beam', 'Solar Beam', 'Techno Blast'],
      cond: ({battle}) => !battle.field.effectiveWeather(),
      mult: 1.5,
    },
  ],
  typeAdd: [
    {types: ['Dark'], damaging: true, add: 'Fairy'},
    {moves: ['Doom Desire'], add: 'Fire'},
  ],
  typeChange: [{moves: ['Solar Beam', 'Solar Blade'], to: 'Fairy'}],
  defMods: [{abilities: ['Marvel Scale'], stat: 'def', mult: 1.5}],
});

// 36. New World
defineField({
  id: 'newworld',
  name: 'New World',
  games: REB_REJ,
  blockTerrain: true,
  blockTerrainMsg: 'The void of the New World swallowed the terrain!',
  intro: 'From darkness, from stardust, from memories of eons past and visions yet to come...',
  mimicry: 'Dark',
  naturePower: 'Spacial Rend',
  secretPower: {chance: 30, boosts: {atk: -1, def: -1, spa: -1, spd: -1, spe: -1}},
  theme: {bg1: '#1d1829', bg2: '#09070f', ground: '#2a2238', accent: '#e0a96d', fx: 'stars'},
  info: [
    'Dark-type moves deal 1.5× damage; Doom Desire deals 4× (gains Fire); Draco Meteor, Future Sight, Moonblast, Spacial Rend, Swift, Vacuum Wave, Meteor Mash & Ancient Power deal 2×!',
    'Dozens of cosmic & legendary signature moves deal 1.5×; Earthquake, Bulldoze & Magnitude deal 0.25×; Fissure & weather/terrain moves fail.',
    'Grounded Pokémon have 0.75× Speed; airborne Pokémon have 0.9× defenses; Dark Void has 85% accuracy.',
    'Transforms: Geomancy or Gravity reforms matter into Starlight Arena!',
  ],
  mods: [
    {types: ['Dark'], mult: 1.5, msg: 'The void amplified the attack!'},
    {moves: ['Doom Desire'], mult: 4},
    {
      moves: ['Ancient Power', 'Comet Punch', 'Draco Meteor', 'Future Sight', 'Hyperspace Fury',
        'Hyperspace Hole', 'Meteor Mash', 'Moonblast', 'Spacial Rend', 'Swift', 'Vacuum Wave'],
      mult: 2,
    },
    {
      moves: ['Aeroblast', 'Aurora Beam', 'Blue Flare', 'Bolt Strike', 'Core Enforcer', 'Crush Grip',
        'Dazzling Gleam', 'Diamond Storm', 'Dragon Ascent', 'Earth Power', 'Eruption', 'Flash Cannon',
        'Fleur Cannon', 'Freeze Shock', 'Fusion Bolt', 'Fusion Flare', 'Ice Burn', 'Judgment', 'Land\'s Wrath',
        'Luster Purge', 'Magma Storm', 'Mind Blown', 'Mirror Shot', 'Mist Ball', 'Moongeist Beam',
        'Multi-Attack', 'Oblivion Wing', 'Origin Pulse', 'Photon Geyser', 'Plasma Fists', 'Power Gem',
        'Precipice Blades', 'Prismatic Laser', 'Psycho Boost', 'Psystrike', 'Relic Song', 'Roar of Time',
        'Sacred Fire', 'Sacred Sword', 'Searing Shot', 'Secret Sword', 'Seed Flare', 'Shadow Force',
        'Signal Beam', 'Spectral Thief', 'Steam Eruption', 'Sunsteel Strike', 'Techno Blast',
        'Thousand Arrows', 'Thousand Waves', 'V-create'],
      mult: 1.5,
    },
    {moves: ['Bulldoze', 'Earthquake', 'Magnitude'], mult: 0.25},
  ],
  typeAdd: [{moves: ['Doom Desire'], add: 'Fire'}],
  fail: [{
    moves: ['Fissure', 'Rain Dance', 'Sunny Day', 'Sandstorm', 'Hail', 'Snowscape', 'Electric Terrain', 'Grassy Terrain', 'Misty Terrain', 'Psychic Terrain'],
    msg: 'The unstable void swallowed the effect!',
  }],
  accuracy: {'Dark Void': 85},
  defMods: [{airborne: true, stat: 'both', mult: 0.9}],
  speMods: [{grounded: true, mult: 0.75}],
  transforms: [
    {moves: ['Geomancy', 'Gravity'], to: 'starlight', msg: "The world's matter reformed into a Starlight Arena!"},
  ],
});

// 37. Inverse Field
defineField({
  id: 'inverse',
  name: 'Inverse Field',
  games: ALL3,
  intro: '!trats elttaB',
  mimicry: 'Normal',
  naturePower: 'Trick Room',
  secretPower: {chance: 30, volatileStatus: 'confusion'},
  theme: {bg1: '#2e1f27', bg2: '#121c24', ground: '#382a30', accent: '#f4845f', fx: 'rings'},
  info: [
    'ALL TYPE EFFECTIVENESS IS INVERTED! Resistances & immunities become 2× super-effective, and weaknesses become 0.5× resisted!',
    'Nature Power becomes Trick Room; Secret Power may confuse.',
  ],
  hooks: {
    onModifyMove(move) {
      if (move.category !== 'Status') {
        move.ignoreImmunity = {};
        for (const t of ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy']) {
          move.ignoreImmunity[t] = true;
        }
        // Ground still respects Flying/Levitate unless target is grounded, or in pure Inverse Ground hits Flying for 2x!
        move.ignoreImmunity.Ground = true;
      }
    },
    onEffectiveness(typeMod, target, type, move) {
      if (move && !this.dex.getImmunity(move.type, type)) return 1;
      return -typeMod;
    },
  },
});
