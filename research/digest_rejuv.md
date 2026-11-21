
## ELECTERRAIN — Electric Terrain
### data
- Intro: The field is hyper-charged!
- Nature Power: Thunderbolt | Secret Power anim: Shock Wave | Camouflage/Mimicry: Electric
- Type x1.5: Electric
- Type-boost conditions: Electric: `!attacker.isAirborne?`
- Moves x2.0: Magnet Bomb
- Moves x1.5: Explosion, Hurricane, Muddy Water, Self-Destruct, Smack Down, Surf, Thousand Arrows, Windboltstorm
- Gain Electric type: Explosion, Hurricane, Hydro Vortex, Muddy Water, Self-Destruct, Smack Down, Surf, Thousand Arrows
- Status moves modified (see notes): Charge, Eerie Impulse, Electrify, Magnet Rise, Spikes
- CHANGE → INDOOR: Mud Sport, Tectonic Rage
- Change msgs: "The hyper-charged terrain shorted out!"
- Seed: Elementalseed → stats [SPEED +1]; effect Charge=2; msg "{1} began charging power!"

## GRASSY — Grassy Terrain
### data
- Intro: The field is in full bloom.
- Nature Power: Energy Ball | Secret Power anim: Seed Bomb | Camouflage/Mimicry: Grass
- Type x1.5: Fire, Grass
- Type-boost conditions: Grass: `!attacker.isAirborne?`; Fire: `!opponent.isAirborne?`
- Moves x1.5: Fairy Wind, Grass Knot, Gust, Icy Wind, Ominous Wind, Razor Wind, Silver Wind, Twister
- Moves x0.5: Bulldoze, Earthquake, Magnitude, Muddy Water, Surf
- Accuracy 80: Grass Whistle
- Move effect `@battle.field.counter += 1`: Surf
- Move effect `@battle.field.counter += 2`: Muddy Water
- Status moves modified (see notes): Coil, Cotton Spore, Floral Healing, Grass Whistle, Growth, Ingrain, Leech Seed, Synthesis, Worry Seed
- CHANGE → CORROSIVE: Acid Downpour, Sludge Wave
- CHANGE → SWAMP: Muddy Water, Surf (cond: `@battle.field.counter > 2`)
- Change msgs: "The grassy terrain was corroded!" | "The grassy terrain became marshy!"
- Seed: Elementalseed → stats [DEFENSE +1]; effect Ingrain=True; msg "{1} planted its roots!"

## MISTY — Misty Terrain
### data
- Intro: Mist settles on the field.
- Nature Power: Mist Ball | Secret Power anim: Mist Ball | Camouflage/Mimicry: Fairy
- Type x1.5: Fairy
- Type x0.5: Dragon
- Moves x1.5: Aura Sphere, Clear Smog, Doom Desire, Icy Wind, Magical Leaf, Mist Ball, Moongeist Beam, Mystical Fire, Silver Wind, Smog, Springtide Storm, Steam Eruption, Strange Steam
- Moves x0.5: Dark Pulse, Night Daze, Shadow Ball
- FAIL: Explosion, Mind Blown, Self-Destruct
- Accuracy 100: Sweet Kiss
- Move effect `@battle.field.counter += 1`: Clear Smog, Poison Gas, Smog
- Move effect `@battle.field.counter = 2`: Acid Downpour
- Status moves modified (see notes): Aqua Ring, Aromatic Mist, Cosmic Power, Sweet Scent, Wish
- CHANGE → INDOOR: Defog, Gust, Hurricane, Razor Wind, Sonic Skystrike, Tailwind, Twister, Whirlwind
- CHANGE → CORROSIVEMIST: Acid Downpour, Clear Smog, Poison Gas, Smog (cond: `@battle.field.counter > 1`)
- Change msgs: "The mist was blown away!" | "The mist was corroded!"
- Seed: Elementalseed → stats [SPDEF +1]; effect Wish=2; msg "A wish was made for {1}!"

## DARKCRYSTALCAVERN — Dark Crystal Cavern
### data
- Intro: Darkness is gathering...
- Nature Power: Dark Pulse | Secret Power anim: Dark Pulse | Camouflage/Mimicry: Dark
- Moves x2.0: Prismatic Laser
- Moves x1.5: Aurora Beam, Black Hole, Dark Pulse, Dazzling Gleam, Diamond Storm, Doom Desire, Flash Cannon, Luster Purge, M. M. Maelstrom, Mirror Beam, Mirror Shot, Moongeist Beam, Night Daze, Night Slash, Photon Geyser, Power Gem, Shadow Ball, Shadow Bone, Shadow Claw, Shadow Force, Shadow Punch, Shadow Sneak, Signal Beam, Techno Blast
- Moves x0.5: Burning Light
- Accuracy 100: Dark Void
- Status moves modified (see notes): Aurora Veil, Dark Void, Flash, Moonlight
- CHANGE → CAVE: Bulldoze, Earthquake, Fissure, Magnitude, Tectonic Rage (cond: `@battle.field.counter > 1`)
- CHANGE → CRYSTALCAVERN: Sunny Day (cond: `suncheck`)
- Change msgs: "The dark crystals were shattered!" | "The sun lit up the crystal cavern!"
- Seed: Magicalseed → stats [SPDEF +1]; effect MagicCoat=True; msg "{1} shrouded itself with Magic Coat!"

## CHESS — Chess Board
### data
- Intro: Opening variation set.
- Nature Power: Ancient Power | Secret Power anim: Feint | Camouflage/Mimicry: Psychic
- Moves x2.0: Barrage
- Moves x1.5: Ancient Power, Continent Crush, Fake Out, Feint, Feint Attack, First Impression, Psychic, Secret Power, Shadow Sneak, Shatter Psyche, Smart Strike, Strength, Sucker Punch
- Gain Rock type: Ancient Power, Barrage, Psychic, Secret Power, Shatter Psyche, Strength
- Status moves modified (see notes): Calm Mind, King's Shield, Nasty Plot, No Retreat, Obstruct, Trick Room
- Seed: Syntheticseed → stats [SPATK +1]; effect MagicCoat=True; msg "{1} shrouded itself with Magic Coat!"

## BIGTOP — Big Top Arena
### data
- Intro: Now presenting...!
- Nature Power: Acrobatics | Secret Power anim: Dynamic Punch | Camouflage/Mimicry: Fighting
- Moves x2.0: Pay Day
- Moves x1.5: Acrobatics, Drum Beating, Fiery Dance, Fire Lash, First Impression, Fly, Petal Dance, Power Whip, Revelation Dance, Vine Whip
- Accuracy 100: Sing
- Status moves modified (see notes): Aquabatics, Belly Drum, Clangorous Soul, Dragon Dance, Encore, Feather Dance, Quiver Dance, Rain Dance, Sing, Spotlight, Swords Dance
- Seed: Syntheticseed → stats [ATTACK +1]; effect HelpingHand=True; msg "{1} accepts the crowd's help!"

## VOLCANIC — Volcanic Field
### data
- Intro: The field is molten!
- Nature Power: Flamethrower | Secret Power anim: Flamethrower | Camouflage/Mimicry: Fire
- Type x1.5: Fire
- Type x0.5: Grass, Ice
- Type-boost conditions: Fire: `!attacker.isAirborne?`; Grass: `!opponent.isAirborne?`
- Moves x2.0: Clear Smog, Smog
- Moves x1.5: Infernal Parade, Rock Slide, Smack Down, Thousand Arrows
- FAIL: Hail
- Accuracy 100: Will-O-Wisp
- Gain Fire type: Clear Smog, Rock Slide, Smack Down, Smog, Thousand Arrows
- Status moves modified (see notes): Smokescreen, Will-O-Wisp
- CHANGE → CAVE: Continent Crush, Defog, Gust, Hurricane, Hydro Vortex, Muddy Water, Ocean Operetta, Razor Wind, Sand Tomb, Sludge Wave, Sonic Skystrike, Sparkling Aria, Surf, Tailwind, Twister, Water Pledge, Water Sport, Water Spout, Whirlwind
- Change msgs: "The grime snuffed out the flame!" | "The wind snuffed out the flame!" | "The water snuffed out the flame!" | "The sand snuffed out the flame!"
- Seed: Elementalseed → stats [ATTACK +1, SPATK +1, SPEED +1]; effect MultiTurnAttack=FIRESPIN; msg "{1} was trapped in the vortex!"

## SWAMP — Swamp Field
### data
- Intro: The field is swamped.
- Nature Power: Muddy Water | Secret Power anim: Muddy Water | Camouflage/Mimicry: Water
- Type x1.3: Bug, Grass, Water
- Type x0.8: Fire
- Moves x1.5: Brine, Gunk Shot, Hydro Vortex, Mud Barrage, Mud Bomb, Mud Shot, Mud-Slap, Muddy Water, Savage Spin-Out, Sludge Wave, Smack Down, Thousand Arrows
- Moves x0.25: Bulldoze, Earthquake, Magnitude
- FAIL: Explosion, Mind Blown, Self-Destruct
- Accuracy 100: Poison Powder, Sleep Powder, Stun Spore
- Gain Water type: Smack Down, Thousand Arrows
- Status moves modified (see notes): Aqua Ring, Leech Seed, Poison Powder, Sleep Powder, Spider Web, Strength Sap, String Shot, Stun Spore
- Seed: Telluricseed → stats [DEFENSE +1]; effect None=None; msg "{1}'s body became clear!"

## RAINBOW — Rainbow Field
### data
- Intro: What does it mean?
- Nature Power: Aurora Beam | Secret Power anim: Aurora Beam | Camouflage/Mimicry: Dragon
- Type x1.5: Normal
- Type-boost conditions: Normal: `self.pbIsSpecial?(type)`
- Moves x1.5: Aurora Beam, Dazzling Gleam, Dragon Pulse, Fire Pledge, Fleur Cannon, Grass Pledge, Heart Stamp, Hidden Power, Judgment, Mirror Beam, Mist Ball, Moonblast, Mystical Fire, Ocean Operetta, Prismatic Laser, Relic Song, Sacred Fire, Secret Power, Silver Wind, Solar Beam, Solar Blade, Sparkling Aria, Tri Attack, Twinkle Tackle, Water Pledge, Weather Ball, Zen Headbutt
- Moves x0.5: Dark Pulse, NE. Nightmare, Night Daze, Shadow Ball
- FAIL: Nightmare
- Status moves modified (see notes): Aurora Veil, Cosmic Power, Life Dew, Meditate, Wish
- CHANGE → INDOOR: Burning Light
- Change msgs: "The rainbow was consumed!"
- Seed: Magicalseed → stats [SPATK +1]; effect Wish=2; msg "A wish was made for {1}!"

## CORROSIVE — Corrosive Field
### data
- Intro: The field is corrupted!
- Nature Power: Acid Spray | Secret Power anim: Acid | Camouflage/Mimicry: Poison
- Moves x2.0: Acid, Acid Spray, Grass Knot, Snap Trap
- Moves x1.5: Apple Acid, Mud Bomb, Mud Shot, Mud-Slap, Muddy Water, Smack Down, Thousand Arrows, Whirlpool
- Accuracy 100: Poison Powder, Sleep Powder, Stun Spore, Toxic
- Gain Poison type: Apple Acid, Mud Bomb, Mud Shot, Mud-Slap, Muddy Water, Smack Down, Thousand Arrows, Whirlpool
- All Grass moves gain Poison type
- Status moves modified (see notes): Acid Armor, Poison Powder, Sleep Powder, Stun Spore, Toxic, Venom Drench
- CHANGE → GRASSY: Purify, Seed Flare
- Change msgs: "The polluted field was purified!"
- Seed: Telluricseed → stats []; effect Protect=BanefulBunker; msg "The Telluric Seed shielded {1} against damage!"

## CORROSIVEMIST — Corrosive Mist Field
### data
- Intro: Corrosive mist settles on the field!
- Nature Power: Venoshock | Secret Power anim: Acid Spray | Camouflage/Mimicry: Poison
- Type x1.5: Fire
- Moves x1.5: Acid Spray, Bubble, Bubble Beam, Clear Smog, Smog, Sparkling Aria
- Accuracy 100: Toxic
- Gain Poison type: Apple Acid, Bubble, Bubble Beam, Energy Ball, Sparkling Aria
- Status moves modified (see notes): Acid Armor, Smokescreen, Toxic, Venom Drench
- CHANGE → INDOOR: Defog, Eruption, Explosion, Fire Pledge, Flame Burst, Gust, Heat Wave, Hurricane, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Razor Wind, Searing Shot, Self-Destruct, Sonic Skystrike, Tailwind, Twister, Whirlwind
- CHANGE → MISTY: Seed Flare
- CHANGE → CORROSIVE: Gravity
- Change msgs: "The mist was blown away!" | "The polluted mist was purified!" | "The toxic mist collected on the ground!"
- Change effect `@battle.mistExplosion`: Eruption, Explosion, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot, Self-Destruct
- Seed: Elementalseed → stats [ATTACK +1, SPATK +1]; effect 0=0; msg "{1} was badly poisoned!"

## DESERT — Desert Field
### data
- Intro: The field is rife with sand.
- Nature Power: Sand Tomb | Secret Power anim: Sand Tomb | Camouflage/Mimicry: Ground
- Type x0.5: Electric, Water
- Type-boost conditions: Water: `!attacker.isAirborne? && self.move!=:SCALD && self.move!=:STEAMERUPTION`; Electric: `!opponent.isAirborne?`
- Moves x1.5: Bone Club, Bone Rush, Bonemerang, Burn Up, Dig, Heat Wave, Needle Arm, Pin Missile, S. Sunraze Smash, Sand Tomb, Sandsear Storm, Scald, Scorching Sands, Shadow Bone, Solar Beam, Solar Blade, Steam Eruption, Thousand Waves
- FAIL: Aqua Ring, Life Dew, Soak
- Status moves modified (see notes): Arenite Wall, Sand Attack, Sandstorm, Shore Up, Sunny Day
- Seed: Telluricseed → stats [DEFENSE +1, SPDEF +1, SPEED +1]; effect MultiTurnAttack=SANDTOMB; msg "{1} was trapped by Sand Tomb!"

## ICY — Icy Field
### data
- Intro: The field is covered in ice.
- Nature Power: Ice Beam | Secret Power anim: Ice Shard | Camouflage/Mimicry: Ice
- Type x1.5: Ice
- Type x0.5: Fire
- Moves x1.5: Bitter Malice
- Moves x0.5: Scald, Steam Eruption
- All Rock moves gain Ice type
- Move effect `@battle.iceSpikes`: Bulldoze, Earthquake, Fissure, Magnitude, Tectonic Rage
- Move effect `@battle.field.counter += 1`: Scald
- Move effect `@battle.field.counter = 2`: Steam Eruption
- Status moves modified (see notes): Aurora Veil, Hail
- CHANGE → INDOOR: Bulldoze, Dive, Earthquake, Fissure, Magnitude, Tectonic Rage (cond: `[:WATERSURFACE,:MURKWATERSURFACE].include?(@battle.field.backup) && (self.move!=:DIVE || @battle.field.counter == 3)`)
- CHANGE → CAVE: Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Magma Drift, Mind Blown, Raging Fury, Searing Shot
- CHANGE → WATERSURFACE: Scald, Steam Eruption (cond: `@battle.field.counter > 1`)
- Change msgs: "The ice was broken from underneath!" | "The quake broke up the ice and revealed the water beneath!" | "The ice melted away!" | "The hot water melted the ice!"
- Seed: Elementalseed → stats [SPEED +2]; effect 0=0; msg "{1} was hurt by icy Spikes!"

## ROCKY — Rocky Field
### data
- Intro: The field is littered with rocks.
- Nature Power: Rock Smash | Secret Power anim: Rock Throw | Camouflage/Mimicry: Rock
- Type x1.5: Rock
- Moves x2.0: Rock Smash
- Moves x1.5: Accelerock, Bulldoze, Earthquake, Magnitude, Rock Climb, Strength
- Gain Rock type: Bulldoze, Earthquake, Magnitude, Rock Climb, Strength
- Status moves modified (see notes): Arenite Wall, Rock Polish, Sandstorm, Stealth Rock
- Seed: Telluricseed → stats [DEFENSE +1, SPDEF +1]; effect 0=0; msg "{1} was hurt by Stealth Rocks!"

## FOREST — Forest Field
### data
- Intro: The field is abound with trees.
- Nature Power: Wood Hammer | Secret Power anim: Wood Hammer | Camouflage/Mimicry: Bug
- Type x1.5: Bug, Grass
- Type-boost conditions: Bug: `self.pbIsSpecial?(type)`
- Moves x2.0: Cut
- Moves x1.5: Air Cutter, Air Slash, Attack Order, Breaking Swipe, Electroweb, Fury Cutter, Gale Strike, Grav Apple, Psycho Cut, Slash
- Moves x0.5: Muddy Water, Surf
- Gain Grass type: Air Cutter, Air Slash, Breaking Swipe, Cut, Fury Cutter, Gale Strike, Psycho Cut, Slash
- Move effect `@battle.field.counter += 1`: Surf
- Move effect `@battle.field.counter += 2`: Muddy Water
- Status moves modified (see notes): Defend Order, Forest's Curse, Growth, Heal Order, Nature Madness, Sticky Web, Strength Sap
- CHANGE → SWAMP: Muddy Water, Surf (cond: `@battle.field.counter > 2`)
- Change msgs: "The forest became marshy!"
- Seed: Telluricseed → stats []; effect Protect=SpikyShield; msg "The Telluric Seed shielded {1} against damage!"

## VOLCANICTOP — Volcanic Top
### data
- Intro: The mountain top is super-heated!
- Nature Power: Eruption | Secret Power anim: Flame Burst | Camouflage/Mimicry: Fire
- Type x1.3: Flying
- Type x1.2: Fire
- Type x0.9: Water
- Type x0.5: Ice
- Type-boost conditions: Water: `self.move!=:SCALD && self.move!=:STEAMERUPTION`
- Moves x1.5: Clear Smog, Gust, Icy Wind, Infernal Parade, Ominous Wind, Precipice Blades, Razor Wind, Scald, Silver Wind, Smog, Steam Eruption, Thunder, Twister
- Moves x1.3: Eruption, Heat Wave, Lava Plume, Magma Drift, Magma Storm
- Moves x0.625: Hydro Pump, Hydro Vortex, Muddy Water, Ocean Operetta, Sparkling Aria, Surf, Water Pledge, Water Spout
- FAIL: Hail
- Accuracy never-miss: Thunder
- Gain Fire type: Clear Smog, Dig, Dive, Egg Bomb, Explosion, Gust, Icy Wind, Magnet Bomb, Ominous Wind, Precipice Blades, Razor Wind, Seismic Toss, Self-Destruct, Silver Wind, Smog, Twister
- All Rock moves gain Fire type
- Move effect `@battle.fieldAccuracyDrop`: Hydro Pump, Hydro Vortex, Muddy Water, Ocean Operetta, Sparkling Aria, Surf, Water Pledge, Water Sport, Water Spout
- Move effect `@battle.eruptionChecker`: Bulldoze, Earth Power, Earthquake, Eruption, Fever Pitch, Lava Plume, Magma Drift, Magnitude, Precipice Blades
- Status moves modified (see notes): Poison Gas, Smokescreen, Stealtrock, Tailwind
- CHANGE → SKY: Bounce, Fly
- CHANGE → MOUNTAIN: Blizzard, Glaciate, Subzero Slammer
- Change msgs: "The battle was taken to the skies!" | "The field cooled off!"
- Seed: Telluricseed → stats [DEFENSE +1]; effect ShellTrap=True; msg "{1} primed a trap!"

## FACTORY — Factory Field
### data
- Intro: Machines whir in the background.
- Nature Power: Gear Grind | Secret Power anim: Magnet Bomb | Camouflage/Mimicry: Steel
- Type x1.2: Electric
- Moves x2.0: Double Iron Bash, Flash Cannon, Gear Grind, Gyro Ball, Magnet Bomb
- Moves x1.5: Steamroller, Super U.M.D. Move, Techno Blast
- Status moves modified (see notes): Autotomize, Gear Up, Iron Defense, Magnet Rise, Metal Sound, Shift Gear
- CHANGE → SHORTCIRCUIT: Aura Wheel, Bulldoze, Burning Light, Earthquake, Explosion, Fissure, Gigavolt Havoc, Ion Deluge, Magnitude, Self-Destruct, Super U.M.D. Move, Tectonic Rage (cond: `!(self.move==:ULTRAMEGADEATH && self.pbIsSpecial?(@type))`)
- Change msgs: "The field was broken!" | "All the light was consumed!" | "The field shorted out!"
- Seed: Syntheticseed → stats [SPATK +1]; effect LaserFocus=1; msg "{1} is focused!"

## SHORTCIRCUIT — Short-Circuit Field
### data
- Intro: Bzzt!
- Nature Power: Discharge | Secret Power anim: Electro Ball | Camouflage/Mimicry: Electric
- Moves x1.667: Steel Beam
- Moves x1.5: Dazzling Gleam, Flash Cannon, Gear Grind, Gyro Ball, Hydro Vortex, Magnet Bomb, Muddy Water, Super U.M.D. Move, Surf
- Moves x1.3: Dark Pulse, Night Daze, Night Slash, Phantom Force, Shadow Ball, Shadow Bone, Shadow Claw, Shadow Force, Shadow Punch, Shadow Sneak
- Moves x0.5: Burning Light
- Accuracy 80: Zap Cannon
- Gain Electric type: Flash Cannon, Gear Grind, Gyro Ball, Magnet Bomb, Muddy Water, Steel Beam, Surf
- Status moves modified (see notes): Flash, Magnet Rise, Metal Sound
- CHANGE → FACTORY: Aura Wheel, Charge Beam, Gigavolt Havoc, Ion Deluge, Parabolic Charge, Super U.M.D. Move, Wild Charge (cond: `!(self.move==:ULTRAMEGADEATH && self.pbIsPhysical?(@type))`)
- Change msgs: "SYSTEM ONLINE."
- Seed: Syntheticseed → stats [SPDEF +1]; effect MagnetRise=5; msg "{1} levitated with electromagnetism!"

## WASTELAND — Wasteland
### data
- Intro: The waste is watching...
- Nature Power: Gunk Shot | Secret Power anim: Gunk Shot | Camouflage/Mimicry: Poison
- Moves x2.0: Spit Up
- Moves x1.5: Mud Bomb, Mud Shot, Mud-Slap, Power Whip, Vine Whip
- Moves x1.2: Gunk Shot, Octazooka, Sludge, Sludge Bomb, Sludge Wave
- Moves x0.25: Bulldoze, Earthquake, Magnitude
- Gain Poison type: Mud Bomb, Mud Shot, Mud-Slap
- Status moves modified (see notes): Spikes, Stealth Rock, Sticky Web, Swallow, Toxic Spikes
- Seed: Telluricseed → stats [ATTACK +1, SPATK +1]; effect 0=0; msg ""

## ASHENBEACH — Beach
### data
- Intro: Focus and relax to the sound of crashing waves...
- Nature Power: Meditate | Secret Power anim: Mud Shot | Camouflage/Mimicry: Ground
- Type-boost conditions: Flying: `self.pbIsSpecial?(type)`
- Moves x2.0: Mud Bomb, Mud Shot, Mud-Slap, Sand Tomb
- Moves x1.5: Brine, Clang. Soulblaze, Crabhammer, Hidden Power, Land's Wrath, Muddy Water, Razor Shell, Sandsear Storm, Scorching Sands, Shell Side Arm, Shell Trap, Smelling Salts, Strength, Surf, Thousand Waves, Wave Crash
- Moves x1.3: Aura Sphere, Focus Blast, Focus Punch, Stored Power, Zen Headbutt
- Moves x1.2: Psychic
- Accuracy 90: Focus Blast
- Gain Psychic type: Strength
- Move effect `@battle.fieldAccuracyDrop`: Fire Spin, Leaf Tornado, Razor Wind, Twister, Whirlpool
- Type effect FLYING: `@battle.fieldAccuracyDrop`
- Status moves modified (see notes): Arenite Wall, Calm Mind, Focus Energy, Kinesis, Meditate, Psych Up, Sand Attack, Sandstorm, Shore Up
- Seed: Telluricseed → stats []; effect FocusEnergy=3; msg "{1}'s Telluric Seed is getting it pumped!"

## WATERSURFACE — Water Surface
### data
- Intro: The water's surface is calm.
- Nature Power: Whirlpool | Secret Power anim: Aqua Jet | Camouflage/Mimicry: Water
- Type x1.5: Electric, Water
- Type x0.5: Fire
- Type x0: Ground
- Type-boost conditions: Fire: `!opponent.isAirborne?`; Electric: `!opponent.isAirborne?`
- Moves x1.2: Dive, Hydro Vortex, Muddy Water, Octazooka, Origin Pulse, Sludge Wave, Surf, Whirlpool
- FAIL: Spikes, Toxic Spikes
- Move effect `@battle.field.counter += 1`: Sludge Wave
- Move effect `@battle.field.counter = 2`: Acid Downpour
- Status moves modified (see notes): Aqua Ring, Life Dew, Splash, Take Heart
- CHANGE → UNDERWATER: Anchor Shot, Dive, Grav Apple, Gravity
- CHANGE → ICY: Blizzard, Glaciate, Subzero Slammer
- CHANGE → MURKWATERSURFACE: Acid Downpour, Sludge Wave (cond: `@battle.field.counter > 1`)
- Change msgs: "The battle sank into the depths!" | "The battle was pulled underwater!" | "The water froze over!" | "The water was polluted!"
- Seed: Elementalseed → stats [SPDEF +1]; effect AquaRing=True; msg "{1} surrounded itself with a veil of water!"

## UNDERWATER — Underwater
### data
- Intro: Blub blub...
- Nature Power: Water Pulse | Secret Power anim: Aqua Tail | Camouflage/Mimicry: Water
- Type x2.0: Electric
- Type x1.5: Water
- Type x0: Fire
- Moves x2.0: Acid Downpour, Anchor Shot, Dragon Darts, Sludge Wave
- Moves x1.5: Water Pulse
- FAIL: Hail, Rain Dance, Sandstorm, Shadow Sky, Sunny Day, Tar Shot
- Gain Water type: Dragon Darts, Grav Apple
- All Ground moves gain Water type
- Move effect `@battle.field.counter += 1`: Sludge Wave
- Move effect `@battle.field.counter = 2`: Acid Downpour
- Status moves modified (see notes): Aqua Ring, Take Heart
- CHANGE → WATERSURFACE: Bounce, Dive, Fly, Sky Drop
- CHANGE → MURKWATERSURFACE: Acid Downpour, Sludge Wave (cond: `@battle.field.counter > 1`)
- Change msgs: "The battle resurfaced!" | "The grime sank beneath the battlers!"
- Change effect `@battle.waterPollution`: Acid Downpour, Sludge Wave
- Seed: Elementalseed → stats [SPEED +1]; effect 0=0; msg "{1} transformed into the Water type!"

## CAVE — Cave
### data
- Intro: The cave echoes dully...
- Nature Power: Rock Tomb | Secret Power anim: Rock Wrecker | Camouflage/Mimicry: Rock
- Type x1.5: Rock
- Type x0.5: Flying
- Type-boost conditions: Flying: `!self.contactMove?`
- Moves x1.5: Rock Tomb
- FAIL: Sky Drop
- Move effect `@battle.caveCollapse`: Bulldoze, Continent Crush, Earthquake, Fissure, Magnitude, Tectonic Rage
- Move effect `@battle.field.counter2 += 1`: Dragon Pulse
- Move effect `@battle.field.counter2 = 2`: Dev. Drake, Draco Meteor
- Move effect `@battle.field.counter3 += 1`: Eruption, Fever Pitch, Fusion Flare, Heat Wave, Lava Plume, Magma Drift, Overheat
- Move effect `@battle.field.counter4 += 1`: Gravity
- Status moves modified (see notes): Stealth Rock
- CHANGE → CRYSTALCAVERN: Diamond Storm, Power Gem
- CHANGE → ICY: Blizzard, Subzero Slammer
- CHANGE → CORRUPTED: Acid Downpour, Sludge Wave
- CHANGE → VOLCANIC: Eruption, Fever Pitch, Fusion Flare, Heat Wave, Lava Plume, Magma Drift, Overheat (cond: `@battle.field.counter3 > 1`)
- CHANGE → DRAGONSDEN: Dev. Drake, Draco Meteor, Dragon Pulse (cond: `@battle.field.counter2 > 1`)
- CHANGE → DEEPEARTH: Gravity (cond: `@battle.field.counter4 > 1`)
- Change msgs: "The cave was littered with crystals!" | "The cavern froze over!" | "The cave was corrupted!" | "The flame ignited the cave!" | "The draconic energy mutated the field!" | "The battle was pulled deeper into the earth!"
- Seed: Telluricseed → stats [DEFENSE +2]; effect 0=0; msg "{1} was hurt by Stealth Rocks!"

## GLITCH — Glitch Field
### data
- Intro: 1n!taliz3 .b//////attl3
- Nature Power: Metronome | Secret Power anim: Techno Blast | Camouflage/Mimicry: Qmarks
- Type x1.2: Psychic
- FAIL: Roar, Whirlwind
- Accuracy 90: Blizzard
- Status moves modified (see notes): Metronome
- Seed: Syntheticseed → stats [DEFENSE +1]; effect 0=0; msg "{1}.TYPE = (:QMARKS)"

## CRYSTALCAVERN — Crystal Cavern
### data
- Intro: The cave is littered with crystals.
- Nature Power: Power Gem | Secret Power anim: Power Gem | Camouflage/Mimicry: Dragon
- Type x1.5: Dragon, Rock
- Moves x1.5: Ancient Power, Diamond Storm, Judgment, Luster Purge, Multi-Attack, Power Gem, Prismatic Laser, Rock Climb, Rock Smash, Rock Tomb, Strength
- Moves x1.3: Aurora Beam, Dazzling Gleam, Doom Desire, Flash Cannon, M. M. Maelstrom, Mirror Beam, Mirror Shot, Moongeist Beam, Photon Geyser, Signal Beam, Techno Blast
- Move effect `@battle.field.counter += 1`: Bulldoze, Earthquake, Fissure, Magnitude
- Move effect `@battle.field.counter = 2`: Tectonic Rage
- Status moves modified (see notes): Aurora Veil, Rock Polish, Stealth Rock
- CHANGE → CAVE: Bulldoze, Earthquake, Fissure, Magnitude, Tectonic Rage (cond: `@battle.field.counter > 1`)
- CHANGE → DARKCRYSTALCAVERN: Burning Light, Dark Pulse, Dark Void, Night Daze
- Change msgs: "The crystals were broken up!" | "The crystals' light was warped by the darkness!" | "The crystals' light was consumed!"
- Seed: Magicalseed → stats [SPATK +1]; effect MagicCoat=True; msg "{1} shrouded itself with Magic Coat!"

## MURKWATERSURFACE — Murkwater Surface
### data
- Intro: The water is tainted...
- Nature Power: Sludge Wave | Secret Power anim: Sludge Bomb | Camouflage/Mimicry: Poison
- Type x1.5: Poison, Water
- Type x1.3: Electric
- Type x0: Ground
- Type-boost conditions: Electric: `!opponent.isAirborne?`
- Moves x1.5: Acid, Acid Spray, Apple Acid, Brine, Mud Barrage, Mud Bomb, Mud Shot, Mud-Slap, Smack Down, Thousand Waves
- FAIL: Spikes, Toxic Spikes
- Gain Poison type: Apple Acid, Mud Barrage, Mud Bomb, Mud Shot, Mud-Slap, Smack Down, Thousand Waves
- Gain Water type: Sludge Wave
- All Water moves gain Poison type
- Status moves modified (see notes): Acid Armor, Tar Shot, Venom Drench
- CHANGE → WATERSURFACE: Purify, Whirlpool
- CHANGE → ICY: Blizzard, Glaciate, Subzero Slammer
- Change msgs: "The maelstrom flushed out the poison!" | "The attack cleared the waters!" | "The toxic water froze over!"
- Seed: Elementalseed → stats [SPEED +1]; effect AquaRing=True; msg "{1} surrounded itself with a veil of water!"

## MOUNTAIN — Mountain
### data
- Intro: High up!
- Nature Power: Rock Slide | Secret Power anim: Rock Blast | Camouflage/Mimicry: Rock
- Type x1.5: Flying, Rock
- Moves x1.5: Avalanche, Circle Throw, Eruption, Fairy Wind, Hyper Voice, Icy Wind, Mountain Gale, Ominous Wind, Razor Wind, Silver Wind, Storm Throw, Thunder, Twister, Vital Throw
- Accuracy never-miss: Thunder
- Status moves modified (see notes): Sunny Day, Tailwind
- CHANGE → SNOWYMOUNTAIN: Blizzard, Glaciate, Mountain Gale, Subzero Slammer
- CHANGE → SKY: Bounce, Fly
- CHANGE → VOLCANICTOP: Eruption, Inf. Overdrive, Lava Plume, Magma Drift
- Change msgs: "The mountain was covered in snow!" | "The battle was taken to the skies!" | "The mountain erupted!"
- Seed: Telluricseed → stats [ATTACK +2, ACCURACY -1]; effect 0=0; msg ""

## SNOWYMOUNTAIN — Snowy Mountain
### data
- Intro: The snow glows white on the mountain...
- Nature Power: Avalanche | Secret Power anim: Ice Ball | Camouflage/Mimicry: Ice
- Type x1.5: Flying, Ice, Rock
- Type x0.5: Fire
- Moves x2.0: Icy Wind
- Moves x1.5: Avalanche, Bitter Malice, Circle Throw, Fairy Wind, Glaciate, Hyper Voice, Mountain Gale, Ominous Wind, Powder Snow, Razor Wind, Silver Wind, Storm Throw, Twister, Vital Throw
- Moves x0.5: Scald, Steam Eruption
- Accuracy never-miss: Thunder
- All Rock moves gain Ice type
- Status moves modified (see notes): Hail, Sunny Day, Tailwind
- CHANGE → MOUNTAIN: Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Raging Fury, Searing Shot
- CHANGE → VOLCANICTOP: Eruption, Magma Drift
- CHANGE → SKY: Bounce, Fly
- Change msgs: "The snow melted away!" | "The mountain erupted!" | "The battle was taken to the skies!"
- Seed: Telluricseed → stats [SPATK +2, ACCURACY -1]; effect 0=0; msg ""

## HOLY — Blessed Field
### data
- Intro: The field is blessed!
- Nature Power: Judgment | Secret Power anim: Dazzling Gleam | Camouflage/Mimicry: Normal
- Type x1.5: Fairy, Normal
- Type x1.2: Dragon, Psychic
- Type x0.5: Dark, Ghost
- Type-boost conditions: Fairy: `self.pbIsSpecial?(type)`; Normal: `self.pbIsSpecial?(type)`; Dark: `self.pbIsSpecial?(type)`
- Moves x1.5: Ancient Power, Extreme Speed, Judgment, Magical Leaf, Mystical Fire, Return, Sacred Fire, Sacred Sword
- Moves x1.3: Aeroblast, Behemoth Bash, Behemoth Blade, Crush Grip, Diamond Storm, Doom Desire, Dragon Ascent, Dynamax Cannon, Eternabeam, Fleur Cannon, Gen. Supernova, Hyperspace Hole, Land's Wrath, Luster Purge, M. M. Maelstrom, Mist Ball, Moongeist Beam, Multipulse, Origin Pulse, Precipice Blades, Prismatic Laser, Psycho Boost, Psystrike, Relic Song, Roar of Time, S. Sunraze Smash, Secret Sword, Spacial Rend, Sunsteel Strike
- Status moves modified (see notes): Cosmic Power, Life Dew, Miracle Eye, Nature Madness, Wish
- CHANGE → INDOOR: Burning Light
- CHANGE → HAUNTED: Curse, Ominous Wind, Phantom Force, Shadow Force, Spectral Scream, Trick-or-Treat
- Change msgs: "Evil spirits gathered!" | "The holy light was consumed!"
- Seed: Magicalseed → stats [SPATK +1]; effect MagicCoat=True; msg "{1} shrouded itself with Magic Coat!"

## MIRROR — Mirror Arena
### data
- Intro: Mirror, mirror, on the field, / Who shall this fractured power wield?
- Nature Power: Mirror Shot | Secret Power anim: Mirror Shot | Camouflage/Mimicry: Steel
- Moves x2.0: Mirror Shot
- Moves x1.5: Aurora Beam, Burning Light, Dazzling Gleam, Doom Desire, Flash Cannon, Luster Purge, Photon Geyser, Prismatic Laser, Signal Beam, Techno Blast
- Accuracy never-miss: Aurora Beam, Burning Light, Dazzling Gleam, Doom Desire, Flash Cannon, Luster Purge, Mirror Shot, Photon Geyser, Prismatic Laser, Signal Beam, Techno Blast
- Status moves modified (see notes): Aurora Veil, Double Team, Flash, Light Screen, Mirror Coat, Mirror Move, Reflect
- CHANGE → INDOOR: Boomburst, Bulldoze, Earthquake, Explosion, Fissure, Hyper Voice, Magnitude, Self-Destruct, Tectonic Rage
- Change msgs: "The mirror arena shattered!"
- Change effect `@battle.mirrorShatter`: Boomburst, Bulldoze, Earthquake, Explosion, Fissure, Hyper Voice, Magnitude, Self-Destruct, Tectonic Rage
- Seed: Syntheticseed → stats [EVASION +1]; effect MagicCoat=True; msg "{1} shrouded itself with Magic Coat!"

## FAIRYTALE — Fairy Tale Field
### data
- Intro: Once upon a time...
- Nature Power: Secret Sword | Secret Power anim: Slash | Camouflage/Mimicry: Fairy
- Type x2.0: Dragon
- Type x1.5: Fairy, Steel
- Moves x2.0: Draining Kiss, Mist Ball
- Moves x1.5: Air Slash, Ancient Power, Aqua Cutter, Behemoth Bash, Behemoth Blade, Ceaseless Edge, Fleur Cannon, Leaf Blade, M. M. Maelstrom, Magical Leaf, Moongeist Beam, Mystical Fire, Night Slash, Ocean Operetta, Psycho Cut, Razor Shell, Relic Song, Smart Strike, Solar Blade, Sparkling Aria, Stone Axe
- All Fire moves gain Dragon type
- Status moves modified (see notes): Acid Armor, Crafty Shield, Floral Healing, Flower Shield, Forest's Curse, Healing Wish, King's Shield, Miracle Eye, Noble Roar, Swords Dance, Wish
- Seed: Magicalseed → stats []; effect Protect=KingsShield; msg "The Magical Seed shielded {1} against damage!"

## DRAGONSDEN — Dragon's Den
### data
- Intro: If you wish to slay a dragon...
- Nature Power: Dragon Pulse | Secret Power anim: Dragon Pulse | Camouflage/Mimicry: Dragon
- Type x1.5: Dragon, Fire
- Type x1.3: Rock
- Type x0.5: Ice, Water
- Moves x2.0: Dragon Ascent, Luster Purge, Mist Ball, Pay Day, Smack Down, Thousand Arrows
- Moves x1.5: Diamond Storm, Earth Power, Lava Plume, Magma Drift, Magma Storm, Matrix Shot, Mega Kick, Power Gem, Rock Climb, Shell Trap, Stomp Tantrum, Strength
- FAIL: Electric Terrain, Grassy Terrain, Hail, Mist, Misty Terrain, Psychic Terrain
- Accuracy 100: Dragon Rush
- Gain Fire type: Earthquake, Rock Climb, Smack Down, Strength, Thousand Arrows
- Status moves modified (see notes): Coil, Dragon Dance, Noble Roar, Stealth Rock
- CHANGE → CAVE: Glaciate, Hydro Vortex, Ocean Operetta, Subzero Slammer (cond: `@battle.field.counter > 1`)
- CHANGE → FAIRYTALE: Mist Ball
- Change msgs: "The lava was frozen solid!" | "The lava solidified!" | "The mist-ical energy altered the surroundings!"
- Seed: Elementalseed → stats [SPATK +1]; effect FlashFire=True; msg "{1} raised its Fire power!"

## FLOWERGARDEN1 — Flower Garden
### data
- Intro: Seeds line the field.
- Nature Power: Growth | Secret Power anim: Sweet Scent | Camouflage/Mimicry: Grass
- Status moves modified (see notes): Floral Healing, Flower Shield, Growth, Ingrain, Rain Dance, Rototiller, Sunny Day, Sweet Scent, Water Sport
- CHANGE → FLOWERGARDEN2: Bloom Doom, Flower Shield, Grassy Terrain, Growth, Ingrain, Rain Dance, Rototiller, Sunny Day, Water Sport
- Change msgs: "The garden grew a little!"
- Seed: Syntheticseed → stats [SPDEF +1]; effect Ingrain=True; msg "{1} planted its roots!"

## FLOWERGARDEN2 — Flower Garden
### data
- Intro: Seeds line the field.
- Nature Power: Growth | Secret Power anim: Petal Blizzard | Camouflage/Mimicry: Grass
- Type x1.1: Grass
- Moves x1.5: Cut
- Status moves modified (see notes): Floral Healing, Flower Shield, Growth, Ingrain, Rain Dance, Rototiller, Sunny Day, Sweet Scent, Water Sport
- CHANGE → FLOWERGARDEN3: Bloom Doom, Flower Shield, Grassy Terrain, Growth, Ingrain, Rain Dance, Rototiller, Sunny Day, Water Sport
- CHANGE → FLOWERGARDEN1: Acid Downpour, Cut, X-Scissor
- Change msgs: "The garden was cut down a bit!" | "The garden grew a little!" | "The acid melted the bloom!"
- Seed: Syntheticseed → stats [SPDEF +1]; effect Ingrain=True; msg "{1} planted its roots!"

## FLOWERGARDEN3 — Flower Garden
### data
- Intro: Seeds line the field.
- Nature Power: Growth | Secret Power anim: Petal Blizzard | Camouflage/Mimicry: Grass
- Type x1.5: Bug, Fire
- Type x1.3: Grass
- Moves x1.5: Cut
- Moves x1.2: Fleur Cannon, Petal Blizzard, Petal Dance
- Accuracy 85: Poison Powder, Sleep Powder, Stun Spore
- Status moves modified (see notes): Floral Healing, Flower Shield, Growth, Ingrain, Rain Dance, Rototiller, Sunny Day, Sweet Scent, Water Sport
- CHANGE → FLOWERGARDEN4: Bloom Doom, Flower Shield, Grassy Terrain, Growth, Ingrain, Rain Dance, Rototiller, Sunny Day, Water Sport
- CHANGE → FLOWERGARDEN2: Cut, X-Scissor
- CHANGE → FLOWERGARDEN1: Acid Downpour, Eruption, Fire Pledge, Flame Burst, Heat Wave, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot
- Change msgs: "The garden caught fire!" | "The garden was cut down a bit!" | "The garden grew a little!" | "The acid melted the bloom!"
- Seed: Syntheticseed → stats [SPDEF +1]; effect Ingrain=True; msg "{1} planted its roots!"

## FLOWERGARDEN4 — Flower Garden
### data
- Intro: Seeds line the field.
- Nature Power: Growth | Secret Power anim: Petal Blizzard | Camouflage/Mimicry: Grass
- Type x2.0: Bug
- Type x1.5: Fire, Grass
- Moves x1.5: Cut, Fleur Cannon, Petal Blizzard, Petal Dance
- Accuracy 85: Poison Powder, Sleep Powder, Stun Spore
- Status moves modified (see notes): Floral Healing, Flower Shield, Growth, Ingrain, Rain Dance, Rototiller, Sunny Day, Sweet Scent, Water Sport
- CHANGE → FLOWERGARDEN5: Bloom Doom, Flower Shield, Grassy Terrain, Growth, Ingrain, Rain Dance, Rototiller, Sunny Day, Water Sport
- CHANGE → FLOWERGARDEN3: Cut, X-Scissor
- CHANGE → FLOWERGARDEN1: Acid Downpour
- CHANGE → FLOWERGARDEN2: Eruption, Fire Pledge, Flame Burst, Heat Wave, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot
- Change msgs: "The garden caught fire!" | "The garden was cut down a bit!" | "The garden grew a little!" | "The acid melted the bloom!"
- Seed: Syntheticseed → stats [SPDEF +1]; effect Ingrain=True; msg "{1} planted its roots!"

## FLOWERGARDEN5 — Flower Garden
### data
- Intro: Seeds line the field.
- Nature Power: Petal Blizzard | Secret Power anim: Petal Dance | Camouflage/Mimicry: Grass
- Type x2.0: Bug, Grass
- Type x1.5: Fire
- Moves x1.5: Cut, Fleur Cannon, Petal Blizzard, Petal Dance
- Accuracy 85: Poison Powder, Sleep Powder, Stun Spore
- Status moves modified (see notes): Floral Healing, Flower Shield, Growth, Ingrain, Rain Dance, Rototiller, Sunny Day, Sweet Scent, Water Sport
- CHANGE → FLOWERGARDEN4: Cut, X-Scissor
- CHANGE → FLOWERGARDEN1: Acid Downpour
- CHANGE → FLOWERGARDEN3: Eruption, Fire Pledge, Flame Burst, Heat Wave, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot
- Change msgs: "The garden caught fire!" | "The garden was cut down a bit!" | "The acid melted the bloom!"
- Seed: Syntheticseed → stats [SPDEF +1]; effect Ingrain=True; msg "{1} planted its roots!"

## STARLIGHT — Starlight Arena
### data
- Intro: Starlight fills the battlefield.
- Nature Power: Moonblast | Secret Power anim: Swift | Camouflage/Mimicry: Dark
- Type x1.5: Dark, Psychic
- Type x1.3: Fairy
- Moves x4.0: Doom Desire
- Moves x2.0: Black Hole, Burning Light, Comet Punch, Draco Meteor, Hyperspace Hole, HyperspaceFury, M. M. Maelstrom, Meteor Assault, Meteor Mash, Moongeist Beam, S. Sunraze Smash, Spacial Rend, Sunsteel Strike, Swift
- Moves x1.5: Aurora Beam, Dazzling Gleam, Flash Cannon, Luster Purge, Mirror Beam, Mirror Shot, Moonblast, Night Daze, Night Slash, Photon Geyser, Prismatic Laser, Signal Beam, Solar Beam, Techno Blast
- Gain Fire type: Doom Desire
- Gain Fairy type: Solar Beam, Solar Blade
- All Dark moves gain Fairy type
- Status moves modified (see notes): Aurora Veil, Cosmic Power, Flash, Healing Wish, Lunar Blessing, Lunar Dance, Magic Room, Moonlight, Trick Room, Wish, Wonder Room
- CHANGE → INDOOR: Burning Light
- Change msgs: "The cosmic light was consumed!"
- Seed: Magicalseed → stats [SPATK +1]; effect Wish=2; msg "A wish was made for {1}!"

## NEWWORLD — New World
### data
- Intro: From darkness, from stardust, / From memories of eons past and visions yet to come...
- Nature Power: Spacial Rend | Secret Power anim: Roar of Time | Camouflage/Mimicry: Dark
- Type x1.5: Dark
- Moves x4.0: Doom Desire
- Moves x2.0: Ancient Power, Black Hole, Burning Light, Comet Punch, Draco Meteor, Future Sight, Hyperspace Hole, HyperspaceFury, Meteor Mash, Moonblast, Spacial Rend, Swift, Vacuum Wave
- Moves x1.5: 7-Star Strike, Aeroblast, Aurora Beam, Blue Flare, Bolt Strike, Continent Crush, Core Enforcer, Crush Grip, Dazzling Gleam, Diamond Storm, Dragon Ascent, Earth Power, Eruption, Flash Cannon, Fleur Cannon, Freeze Shock, Fusion Bolt, Fusion Flare, Gen. Supernova, Ice Burn, Judgment, Land's Wrath, Luster Purge, M. M. Maelstrom, Magma Storm, Mind Blown, Mirror Beam, Mirror Shot, Mist Ball, Moongeist Beam, Multi-Attack, Oblivion Wing, Origin Pulse, Photon Geyser, Plasma Fists, Power Gem, Precipice Blades, Prismatic Laser, Psycho Boost, Psystrike, Relic Song, Roar of Time, S. Sunraze Smash, Sacred Fire, Sacred Sword, Searing Shot, Secret Sword, Seed Flare, Shadow Force, Signal Beam, Spectral Thief, Steam Eruption, Sunsteel Strike, Techno Blast, Thousand Arrows, Thousand Waves, V-create
- Moves x0.25: Bulldoze, Earthquake, Magnitude
- FAIL: Electric Terrain, Fissure, Grassy Terrain, Hail, Mist, Misty Terrain, Psychic Terrain, Rain Dance, Sandstorm, Shadow Sky, Sunny Day
- Accuracy 100: Dark Void
- Gain Fire type: Doom Desire
- Status moves modified (see notes): Cosmic Power, Dark Void, Flash, Heart Swap, Lunar Blessing, Magic Room, Moonlight, Nature Madness, Trick Room, Wonder Room
- CHANGE → STARLIGHT: Geomancy, Gravity
- Change msgs: "The world's matter reformed!" | "The world was regenerated!"
- Seed: Magicalseed → stats [ATTACK +1, DEFENSE +1, SPEED +1, SPATK +1, SPDEF +1]; effect HyperBeam=1; msg "{1} must recharge!"

## INVERSE — Inverse Field
### data
- Intro: !trats elttaB
- Nature Power: Trick Room | Secret Power anim: Confusion | Camouflage/Mimicry: Normal
- Seed: Magicalseed → stats []; effect HyperBeam=1; msg "{1} was normalized!"

## PSYTERRAIN — Psychic Terrain
### data
- Intro: The field became mysterious!
- Nature Power: Psychic | Secret Power anim: Psychic | Camouflage/Mimicry: Psychic
- Type x1.5: Psychic
- Type-boost conditions: Psychic: `!attacker.isAirborne?`
- Moves x1.5: Aura Sphere, Focus Blast, Hex, Hidden Power, Magical Leaf, Mind Blown, Moonblast, Mystical Fire, Secret Power
- Accuracy 90: Hypnosis
- Status moves modified (see notes): Calm Mind, Cosmic Power, Gravity, Hypnosis, Kinesis, Magic Room, Meditate, Mind Reader, Miracle Eye, Nasty Plot, Psych Up, Telekinesis, Trick Room, Wonder Room
- Seed: Magicalseed → stats [SPATK +2]; effect 0=0; msg "{1} became confused!"

## DIMENSIONAL — Dimensional Field
### data
- Intro: Darkness Radiates.
- Nature Power: Dark Pulse | Secret Power anim: Dark Pulse | Camouflage/Mimicry: Dark
- Type x1.5: Dark, Shadow
- Type x1.2: Ghost
- Type x0.5: Fairy
- Moves x1.5: Dynamax Cannon, Eternabeam, Fireywrath, Freezing Glare, Hyperspace Hole, HyperspaceFury, Lash Out, Outrage, Raging Fury, Roar of Time, Shadow Force, Spacial Rend, Stomp Tantrum, Thrash
- Moves x1.2: Dark Pulse, Night Daze
- FAIL: Hail, Lucky Chant, Rain Dance, Sandstorm, Sunny Day, Teatime
- Accuracy never-miss: Dark Pulse, Dark Void, Night Daze
- Move effect `@battle.field.counter += 1`: Blizzard, Cold Truth, Sheer Cold
- Move effect `@battle.field.counter = 2`: Freeze Shock, Glaciate, Ice Burn
- Status moves modified (see notes): Dark Void, Embargo, Heal Block, Obstruct, Quash
- CHANGE → FROZENDIMENSION: Blizzard, Cold Truth, Freeze Shock, Glaciate, Ice Burn, Sheer Cold (cond: `@battle.field.counter > 1`)
- CHANGE → INFERNAL: Precipice Blades
- CHANGE → INDOOR: Purify, Seed Flare
- Change msgs: "The dimension froze up!" | "The field went up in flames!" | "The dimension was purified!"
- Seed: Magicalseed → stats [DEFENSE +1]; effect None=None; msg ""

## FROZENDIMENSION — Frozen Dimensional Field
### data
- Intro: Hate and anger radiates.
- Nature Power: Ice Beam | Secret Power anim: Ice Beam | Camouflage/Mimicry: Ice
- Type x1.5: Dark
- Type x1.2: Ice
- Moves x1.5: Fiery Wrath, Freezing Glare, Lash Out, Outrage, Rage, Raging Fury, Roar of Time, Stomp Tantrum, Thrash
- Moves x1.2: Dark Pulse, Hydro Pump, Hyperspace Hole, HyperspaceFury, Muddy Water, Night Slash, Surf, Water Pulse
- FAIL: Court Change, Electric Terrain, Grassy Terrain, Gravity, Magic Room, Misty Terrain, Psychic Terrain, Teatime, Trick Room, Wonder Room
- Accuracy 100: Dark Void
- Gain Ice type: Dark Pulse, Hydro Pump, Muddy Water, Night Slash, Surf, Water Pulse
- Status moves modified (see notes): Aurora Veil, Dark Void, Parting Shot
- CHANGE → DIMENSIONAL: Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Raging Fury, Searing Shot
- CHANGE → ICY: Purify
- Change msgs: "The dimension thawed away!" | "The dimension was purified!"
- Seed: Elementalseed → stats [SPEED +2]; effect Torment=True; msg "{1} is subjected to torment!"

## HAUNTED — Haunted Field
### data
- Intro: The field is haunted!
- Nature Power: Phantom Force | Secret Power anim: Shadow Claw | Camouflage/Mimicry: Ghost
- Type x1.5: Ghost
- Moves x1.5: Astonish, Bone Club, Bone Rush, Bonemerang, Fire Spin, Flame Burst, Flame Charge, Inferno
- Moves x1.2: Shadow Bone
- Accuracy 90: Hypnosis, Will-O-Wisp
- Gain Ghost type: Fire Spin, Flame Burst, Flame Charge, Inferno
- Status moves modified (see notes): Curse, Destiny Bond, Hypnosis, Magic Powder, Mean Look, Nightmare, Scary Face, Spite, Will-O-Wisp
- CHANGE → HOLY: Judgement, Origin Pulse, Purify, Sacred Fire
- CHANGE → INDOOR: Dazzling Gleam, Flash
- Change msgs: "The evil spirits have been exorcised!" | "The evil spirits have been forced back!"
- Seed: Magicalseed → stats [SPDEF +1, DEFENSE +1]; effect nil=None; msg ""

## CORRUPTED — Corrupted Cave
### data
- Intro: Corruption seeps from every crevice!
- Nature Power: Gunk Shot | Secret Power anim: Poison Jab | Camouflage/Mimicry: Poison
- Type x1.5: Poison
- Type x1.2: Grass, Rock
- Type x0.5: Fairy, Flying
- Type-boost conditions: Flying: `!self.contactMove?`
- Moves x1.5: Apple Acid, Seed Flare
- Gain Poison type: Diamond Storm, Rock Slide, Rock Tomb, Smack Down, Stone Edge
- Gain Rock type: Gunk Shot, Sludge Wave
- Status moves modified (see notes): Curse, Destiny Bond, Hypnosis, Magic Powder, Mean Look, Nightmare, Scary Face, Spite, Will-O-Wisp
- CHANGE → CAVE: Purify, Seed Flare, Solar Beam, Solar Blade
- CHANGE → VOLCANIC: Blast Burn, Eruption, Heat Wave, Inf. Overdrive, Lava Plume
- Change msgs: "The cave was purified!"
- Change effect `@battle.mistExplosion`: Blast Burn, Eruption, Heat Wave, Inf. Overdrive, Lava Plume
- Seed: Syntheticseed → stats [DEFENSE +2]; effect None=None; msg ""

## BEWITCHED — Bewitched Woods
### data
- Intro: Everlasting glow and glamour!
- Nature Power: Dazzling Gleam | Secret Power anim: Needle Arm | Camouflage/Mimicry: Fairy
- Type x1.5: Fairy, Grass
- Type x1.3: Dark
- Moves x1.5: Hex, Mystical Fire, Spirit Break
- Moves x1.4: Aurora Beam, Bubble Beam, Charge Beam, Flash Cannon, Hyper Beam, Ice Beam, Magical Leaf, Mirror Beam, Psybeam, Signal Beam
- Moves x1.2: Dark Pulse, Moonblast, Night Daze
- Accuracy 85: Grass Whistle, Poison Powder, Sleep Powder, Stun Spore
- Status moves modified (see notes): Forest's Curse, Grass Whistle, Magic Powder, Moonlight, Poison Powder, Sleep Powder, Strength Sap, Stun Spore
- CHANGE → FOREST: Purify
- Change msgs: "The evil spirits have been exorcised!"
- Seed: Magicalseed → stats [SPDEF +1]; effect Ingrain=True; msg "{1} planted its roots."

## SKY — Sky Field
### data
- Intro: The sky is filled with clouds. 
- Nature Power: Sky Attack | Secret Power anim: Wing Attack | Camouflage/Mimicry: Flying
- Type x1.5: Flying
- Moves x1.5: Aeroblast, Bleakwind Storm, Dive, Dragon Ascent, Dragon Darts, Esper Wing, Fairy Wind, Flying Press, Grav Apple, Icy Wind, Ominous Wind, Razor Wind, Silver Wind, Sky Uppercut, Steel Wing, Thunder, Thunder Shock, Thunderbolt, Twister
- Moves x1.3: Sandsear Storm, Springtide Storm, Windboltstorm
- FAIL: Bulldoze, Dig, Earthquake, Magnitude, Rototiller, Spikes, Sticky Web, Toxic Spikes
- Accuracy never-miss: Hurricane, Thunder
- Gain Flying type: Dive, Twister
- Status moves modified (see notes): Hail, Mirror Move, Rain Dance, Sandstorm, Sunny Day, Tailwind
- CHANGE → MOUNTAIN: Grav Apple, Gravity, Ingrain, Smack Down, Thousand Arrows
- Change msgs: "The battle has been brought down to the mountains!"
- Seed: Elementalseed → stats [DEFENSE +1, SPDEF +1]; effect 0=0; msg ""

## COLOSSEUM — Colosseum
### data
- Intro: All eyes are on the combatants!
- Nature Power: Beat Up | Secret Power anim: Power-Up Punch | Camouflage/Mimicry: Steel
- Moves x2.0: Beat Up, Fell Stinger, Pay Day, Pursuit, Reversal
- Moves x1.5: Bone Club, Bone Rush, Bonemerang, Brutal Swing, Bullet Punch, Clanging Scales, Electroweb, First Impression, Leaf Blade, Meteor Assault, Meteor Mash, Night Slash, Payback, Psycho Cut, Punishment, Sacred Sword, Secret Sword, Smack Down, Smart Strike, Steamroller, Submission, Vine Whip
- Moves x1.2: Anchor Shot, Crabhammer, Dragon Hammer, Drill Peck, Drill Run, Fire Lash, Ice Hammer, Icicle Spear, Power Whip, Shadow Bone, Spirit Shackle, Storm Throw, Sucker Punch, Throat Chop, Wood Hammer
- FAIL: Baton Pass, Encore, Whirlwind
- Status moves modified (see notes): Flatter, Howl, King's Shield, No Retreat, Roar, Swagger, Swords Dance
- Seed: Syntheticseed → stats [ATTACK +2]; effect Taunt=4; msg "{1} feels taunted!"

## INFERNAL — Infernal Field
### data
- Intro: The souls of the damned burn on.
- Nature Power: Punishment | Secret Power anim: Inferno | Camouflage/Mimicry: Fire
- Type x1.5: Dark, Fire
- Type x0.5: Fairy, Water
- Type-boost conditions: Fairy: `@move != :SPIRITBREAK`
- Moves x2.0: Dream Eater, Punishment, Smog
- Moves x1.5: Blast Burn, Eartpower, Inf. Overdrive, Infernal Parade, Inferno, Precipice Blades, Raging Fury
- FAIL: Hail, Rain Dance
- Accuracy never-miss: Dark Void, Inferno, Will-O-Wisp
- Gain Dark type: Aura Sphere, Frustration, Spirit Break
- All Ground, Rock, Steel moves gain Fire type
- Status moves modified (see notes): Dark Void, Nightmare, Stealth Rock, Torment, Will-O-Wisp
- CHANGE → DIMENSIONAL: Glaciate
- CHANGE → VOLCANICTOP: Judgement, Origin Pulse, Purify
- Change msgs: "The hellish landscape was doused of its fire!" | "The hellish landscape was purified!"
- Seed: Elementalseed → stats [ATTACK +1, SPATK +1]; effect None=None; msg "{1} can't escape now!"

## CONCERT1 — Concert Venue
### data
- Intro: Let's get HYPED!
- Nature Power: Hyper Voice | Secret Power anim: Boomburst | Camouflage/Mimicry: Normal
- Moves x1.5: Acid, Acid Spray, Circle Throw, Dragon Tail, Drum Beating, Fake Out, First Impression, Frustration, Outrage, Rage, Rollout, Stomp Tantrum, Thrash
- Accuracy 100: Sing
- Status moves modified (see notes): Acid Armor, Clangorous Soul, Encore, Growl, Howl, Metal Sound, Parting Shot, Roar, Screech, Sing, Work Up
- CHANGE → CONCERT2: Aquabatics, Boomburst, Bug Buzz, Chatter, Clang. Soulblaze, Clanging Scales, Clangorous Soul, Disarming Voice, Dragon Dance, Drum Beating, Echoed Voice, Feather Dance, Fever Pitch, Fiery Dance, First Impression, Growl, Howl, Hyper Voice, Metal Sound, Noble Roar, Overdrive, Parting Shot, Petal Dance, Quiver Dance, Relic Song, Revelation Dance, Roar, Rollout, Round, Screech, Shadow Panic, Sing, Snarl, Sparkling Aria, Spectral Scream, Supersonic, Swagger, Swords Dance, Uproar, Work Up
- CHANGE → CONCERT3: Focus Energy, Follow Me, Laser Focus, Lucky Chant, Spotlight
- CHANGE → CONCERT4: Explosion, Self-Destruct
- Change msgs: "The stunning dance makes the audience go wild!" | "The song is getting the audience hyped!" | "The crowd is getting hyped!" | "The audience's full attention is on the stage!" | "The audience cheers for the explosive finish!!"
- Change effect `@battle.concertNoise`: Explosion, Focus Energy, Follow Me, Laser Focus, Lucky Chant, Self-Destruct, Spotlight
- Seed: Syntheticseed → stats [SPATK +1]; effect HelpingHand=True; msg "{1} accepts the crowd's help!"

## CONCERT2 — Concert Venue
### data
- Intro: Let's get HYPED!
- Nature Power: Hyper Voice | Secret Power anim: Boomburst | Camouflage/Mimicry: Normal
- Moves x1.5: Acid, Acid Spray, Circle Throw, Dragon Tail, Drum Beating, Fake Out, First Impression, Frustration, Outrage, Rage, Rollout, Stomp Tantrum, Thrash
- Accuracy 100: Sing
- Status moves modified (see notes): Acid Armor, Clangorous Soul, Encore, Growl, Howl, Metal Sound, Parting Shot, Roar, Screech, Sing, Work Up
- CHANGE → CONCERT1: Baby-Doll Eyes, Cold Truth, Embargo, Play Nice, Quash, Sheer Cold, Slack Off, Throat Chop, Tickle, Yawn (cond: `!attacker.missAcc || (basemove.move != :SHEERCOLD && basemove.move != :COLDTRUTH)`)
- CHANGE → CONCERT3: Aquabatics, Boomburst, Bug Buzz, Chatter, Clang. Soulblaze, Clanging Scales, Clangorous Soul, Disarming Voice, Dragon Dance, Drum Beating, Echoed Voice, Feather Dance, Fever Pitch, Fiery Dance, First Impression, Growl, Howl, Hyper Voice, Metal Sound, Noble Roar, Overdrive, Parting Shot, Petal Dance, Quiver Dance, Relic Song, Revelation Dance, Roar, Rollout, Round, Screech, Shadow Panic, Sing, Snarl, Sparkling Aria, Spectral Scream, Supersonic, Swagger, Swords Dance, Uproar, Work Up
- CHANGE → CONCERT4: Explosion, Focus Energy, Follow Me, Laser Focus, Lucky Chant, Self-Destruct, Spotlight
- Change msgs: "The freezing cold drives the audience away..." | "'Bitter cold AND preaching? I am out of here!'" | "The leadsingers voice fails..." | "The bar is closed and the crowd does NOT like it..." | "The crowd is booing, they want action!" | "The audience is not a fan of this friendly touchy-feely stuff..." | "The stunning dance makes the audience go wild!" | "The song is getting the audience hyped!" | "The crowd is getting hyped!" | "The audience's full attention is on the stage!" | "The audience cheers for the explosive finish!!"
- Change effect `@battle.concertNoise`: Aquabatics, Boomburst, Bug Buzz, Chatter, Clang. Soulblaze, Clanging Scales, Clangorous Soul, Disarming Voice, Dragon Dance, Drum Beating, Echoed Voice, Explosion, Feather Dance, Fever Pitch, Fiery Dance, First Impression, Focus Energy, Follow Me, Growl, Howl, Hyper Voice, Laser Focus, Lucky Chant, Metal Sound, Noble Roar, Overdrive, Parting Shot, Petal Dance, Quiver Dance, Relic Song, Revelation Dance, Roar, Rollout, Round, Screech, Self-Destruct, Shadow Panic, Sing, Snarl, Sparkling Aria, Spectral Scream, Spotlight, Supersonic, Swagger, Swords Dance, Uproar, Work Up
- Seed: Syntheticseed → stats [SPATK +1]; effect HelpingHand=True; msg "{1} accepts the crowd's help!"

## CONCERT3 — Concert Venue
### data
- Intro: Let's get HYPED!
- Nature Power: Hyper Voice | Secret Power anim: Boomburst | Camouflage/Mimicry: Normal
- Moves x1.5: Acid, Acid Spray, Circle Throw, Dragon Tail, Drum Beating, Fake Out, First Impression, Rollout
- Accuracy 100: Sing
- Status moves modified (see notes): Acid Armor, Clangorous Soul, Encore, Growl, Howl, Metal Sound, Parting Shot, Roar, Screech, Sing, Work Up
- CHANGE → CONCERT1: Cold Truth, Sheer Cold (cond: `!attacker.missAcc`)
- CHANGE → CONCERT2: Baby-Doll Eyes, Embargo, Play Nice, Quash, Slack Off, Throat Chop, Tickle, Yawn
- CHANGE → CONCERT4: Aquabatics, Boomburst, Bug Buzz, Chatter, Clang. Soulblaze, Clanging Scales, Clangorous Soul, Disarming Voice, Dragon Dance, Drum Beating, Echoed Voice, Explosion, Feather Dance, Fever Pitch, Fiery Dance, First Impression, Focus Energy, Follow Me, Growl, Howl, Hyper Voice, Laser Focus, Lucky Chant, Metal Sound, Noble Roar, Overdrive, Parting Shot, Petal Dance, Quiver Dance, Relic Song, Revelation Dance, Roar, Rollout, Round, Screech, Self-Destruct, Shadow Panic, Sing, Snarl, Sparkling Aria, Spectral Scream, Spotlight, Supersonic, Swagger, Swords Dance, Uproar, Work Up
- Change msgs: "The freezing cold drives the audience away..." | "'Bitter cold AND preaching? I am out of here!'" | "The leadsingers voice fails..." | "The bar is closed and the crowd does NOT like it..." | "The crowd is booing, they want action!" | "The audience is not a fan of this friendly touchy-feely stuff..." | "The stunning dance makes the audience go wild!" | "The song is getting the audience hyped!" | "The crowd is getting hyped!" | "The audience's full attention is on the stage!" | "The audience cheers for the explosive finish!!"
- Change effect `@battle.concertNoise`: Aquabatics, Boomburst, Bug Buzz, Chatter, Clang. Soulblaze, Clanging Scales, Clangorous Soul, Disarming Voice, Dragon Dance, Drum Beating, Echoed Voice, Explosion, Feather Dance, Fever Pitch, Fiery Dance, First Impression, Focus Energy, Follow Me, Growl, Howl, Hyper Voice, Laser Focus, Lucky Chant, Metal Sound, Noble Roar, Overdrive, Parting Shot, Petal Dance, Quiver Dance, Relic Song, Revelation Dance, Roar, Rollout, Round, Screech, Self-Destruct, Shadow Panic, Sing, Snarl, Sparkling Aria, Spectral Scream, Spotlight, Supersonic, Swagger, Swords Dance, Uproar, Work Up
- Seed: Syntheticseed → stats [SPATK +1]; effect HelpingHand=True; msg "{1} accepts the crowd's help!"

## CONCERT4 — Concert Venue
### data
- Intro: Let's get HYPED!
- Nature Power: Hyper Voice | Secret Power anim: Boomburst | Camouflage/Mimicry: Normal
- Moves x1.5: Acid, Acid Spray, Circle Throw, Dragon Tail, Drum Beating, Fake Out, First Impression, Rollout
- Accuracy 100: Sing
- Status moves modified (see notes): Acid Armor, Clangorous Soul, Encore, Growl, Howl, Metal Sound, Parting Shot, Roar, Screech, Sing, Work Up
- CHANGE → CONCERT1: Cold Truth, Sheer Cold (cond: `!attacker.missAcc`)
- CHANGE → CONCERT3: Baby-Doll Eyes, Embargo, Play Nice, Quash, Slack Off, Throat Chop, Tickle, Yawn
- Change msgs: "The freezing cold drives the audience away..." | "'Bitter cold AND preaching? I am out of here!'" | "The leadsingers voice fails..." | "The bar is closed and the crowd does NOT like it..." | "The crowd is booing, they want action!" | "The audience is not a fan of this friendly touchy-feely stuff..."
- Seed: Syntheticseed → stats [SPATK +1]; effect HelpingHand=True; msg "{1} accepts the crowd's help!"

## DEEPEARTH — Deep Earth
### data
- Intro: The core is pulling you in...
- Nature Power: Gravity | Secret Power anim: Heavy Slam | Camouflage/Mimicry: Ground
- Type x1.5: Ground
- Type x1.3: Psychic, Rock
- Type-boost conditions: Ground: `!opponent.hasType?(:GROUND)`
- Moves x2.0: Core Enforcer, Crush Grip, Land's Wrath, Magnet Bomb, Precipice Blades, Smack Down, Tectonic Rage
- Moves x1.5: Ancient Power, Body Press, Body Slam, Circle Throw, Crabhammer, Dragon Rush, Fling, Grass Knot, Grav Apple, Hammer Arm, Heat Crash, Heavy Slam, Ice Hammer, Icicle Crash, Low Kick, Spacial Rend, Steamroller, Stomp, Storm Throw, Submission, Thousand Arrows, Thousand Waves, Vital Throw
- Status moves modified (see notes): Autotomize, Eerie Impulse, Geomancy, Gravity, Magnet Rise, Magnetflux, Psywave, Rototiller, Seismic Toss, Topsy-Turvy
- Seed: Telluricseed → stats [DEFENSE +1]; effect None=None; msg "{1}'s weight increased!"

## BACKALLEY — Backalley
### data
- Intro: Shifty eyes are all around...
- Nature Power: Beat Up | Secret Power anim: Smog | Camouflage/Mimicry: Steel
- Type x1.5: Dark
- Type x1.3: Bug, Poison, Steel
- Type x0.5: Fairy
- Type-boost conditions: Dark: `self.pbIsPhysical?(@type)`
- Moves x1.5: Aerial Ace, Air Cutter, Air Slash, Aqua Cutter, Beat Up, Behemoth Blade, Branch Poke, Ceaseless Edge, Cross Poison, Cut, Drill Peck, Drill Run, False Surrender, Fell Stinger, First Impression, Fury Attack, Fury Cutter, Gilded Arrow, Gilded Helix, Glacial Lance, Hexing Slash, Horn Attack, Horn Leech, Infestation, Leaf Blade, Megahorn, Needle Arm, Night Slash, Pay Day, Peck, Pin Missile, Pluck, Poison Jab, Poison Sting, Psycho Cut, Quicksilver Spear, Razor Leaf, Razor Shell, Sacred Sword, Shadow Sneak, Slash, Slash and Burn, Smart Strike, Smog, Solar Blade, Spectral Thief, Steamroller, Stone Axe, Techno Blast, Twineedle, X-Scissor
- Accuracy never-miss: Poison Gas, Smog
- Gain Dark type: First Impression
- Status moves modified (see notes): Corrosive Gas, Fake Tears, Nasty Plot, Parting Shot, Poison Gas, Smog, Smokescreen, Snatch, Switcheroo, Trick
- CHANGE → CITY: Boomburst, Echoed Voice, Hyper Voice, Uproar
- Change msgs: "Cops! Everyone scatter!"
- Seed: Syntheticseed → stats [ATTACK +1, ACCURACY +1]; effect 0=0; msg ""

## CITY — City
### data
- Intro: The streets are busy...
- Nature Power: Smog | Secret Power anim: Smog | Camouflage/Mimicry: Normal
- Type x1.5: Normal
- Type x1.3: Bug, Poison, Steel
- Type x0.7: Fairy
- Type-boost conditions: Normal: `self.pbIsPhysical?(@type)`
- Moves x1.5: Beat Up, First Impression, Pay Day, Smog, Steamroller, Techno Blast
- Accuracy never-miss: Poison Gas, Smog
- Gain Normal type: First Impression
- Status moves modified (see notes): Autotomize, Corrosive Gas, Poison Gas, Recycle, Shift Gear, Smog, Smokescreen, Work Up
- CHANGE → BACKALLEY: Covet, Pursuit, Thief
- Change msgs: "The criminal ran into a backalley!"
- Seed: Syntheticseed → stats [ATTACK +1, ACCURACY +1]; effect 0=0; msg ""
