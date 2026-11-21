
## [1] ELECTRICT — Electric Terrain
### data
- Intro: The field is hyper-charged!
- Nature Power: Thunderbolt | Secret Power anim: Shock Wave | Camouflage/Mimicry: Electric
- Type x1.5: Electric
- Type-boost conditions: Electric: `!attacker.isAirborne?`
- Moves x2.0: Magnet Bomb
- Moves x1.5: Explosion, Hurricane, Muddy Water, Self-Destruct, Smack Down, Surf, Thousand Arrows
- Gain Electric type: Explosion, Hurricane, Hydro Vortex, Muddy Water, Self-Destruct, Smack Down, Surf, Thousand Arrows
- Status moves modified (see notes): Charge, Eerie Impulse, Magnet Rise
- CHANGE → NONE(base field): Mud Sport, Tectonic Rage
- Change msgs: "The hyper-charged terrain shorted out!"
- Seed: Elementalseed → stats [SPEED +1]; effect Charge=2; msg "{1} began charging power!"
### manual
- "The field is hyper-charged!"
- Grounded Pokémon → cannot sleep
- Created by ... Electric Surge, Electric Terrain (5 turns), Stoked Sparksurfer, Ion Deluge (3 turns), Plasma Fists (3 turns), when the attacker does not hold an Everstone.
- Electric-type attacks ▲ x1.5 when when attacker is grounded.
- Certain attacks +type Electric-type ... Explosion, Hurricane, Hydro Vortex, Muddy Water, Self-Destruct, Smack Down, Surf, Thousand Arrows
- Focus Punch will always fail
- Certain stat moves effect ▲ ... Charge, Eerie Impulse
- Magnet Rise lasts 8 turns
- Certain attacks ▲ x1.5 ... Explosion, Hurricane, Muddy Water, Self-Destruct, Smack Down, Surf, Thousand Arrows
- Certain attacks ▲ x2 ... Magnet Bomb
- Activates Surge Surfer
- Activates Motor Drive each turn.
- Disables Comatose
- Slow Start timer → x2 per turn
- Galvanize power boost → x1.5
- Wild Charge → no recoil
- Destroyed by these moves ... Mud Sport, Tectonic Rage
- Nature Power → Thunderbolt
- Camouflage → Electric-type
- Secret Power → paralysis
- Activates Elemental Seed... Boosts Speed and applies Charge to the user.

## [2] GRASSYT — Grassy Terrain
### data
- Intro: The field is in full bloom.
- Nature Power: Energy Ball | Secret Power anim: Seed Bomb | Camouflage/Mimicry: Grass
- Type x1.5: Fire, Grass
- Type-boost conditions: Grass: `!attacker.isAirborne?`; Fire: `!opponent.isAirborne?`
- Moves x1.5: Fairy Wind, Silver Wind
- Moves x0.5: Bulldoze, Earthquake, Magnitude, Muddy Water, Surf
- Accuracy 80: Grass Whistle
- Status moves modified (see notes): Coil, Floral Healing, Grass Whistle, Growth
- CHANGE → BURNINGF: Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot (cond: `ignitecheck`)
- CHANGE → CORROSIVEF: Acid Downpour, Sludge Wave
- Change msgs: "The grassy terrain caught fire!" | "The grassy terrain was corroded!"
- Seed: Elementalseed → stats [DEFENSE +1]; effect Ingrain=True; msg "{1} planted its roots!"
### manual
- "The field is in full bloom."
- Pokémon +type 1/16 HP when when grounded
- Created by ... Grassy Surge, Grassy Terrain (5 turns), Bloom Doom when not in Forest or Flower Garden fields (3 turns)
- Grass-type attacks ▲ x1.5 when when attacker is grounded.
- Fire-type attacks ▲ x1.5 when when target is grounded.
- Activates Grass Pelt
- Certain attacks ▲ x1.5 ... Fairy Wind, Silver Wind
- Certain attacks ▼ x0.5 ... Bulldoze, Earthquake, Magnitude, Muddy Water, Surf
- Grass Whistle's Accuracy → 80
- Certain stat moves' effect ▲ ... Coil, Growth
- Nature's Madness damage → 75 % HP
- Floral Healing heals 100 % Max HP
- Becomes Burning Field when when Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot is used in the absence of Rain or Water Sport.
- Becomes Corrosive Field when when Acid Downpour, Sludge Wave is used.
- Nature Power → Energy Ball
- Camouflage → Grass-type
- Secret Power → sleep
- Activates Elemental Seed... Boosts Defense and applies Ingrain to the user.

## [3] MISTYT — Misty Terrain
### data
- Intro: Mist settles on the field.
- Nature Power: Mist Ball | Secret Power anim: Mist Ball | Camouflage/Mimicry: Fairy
- Type x0.5: Dragon
- Moves x1.5: Aura Sphere, Dazzling Gleam, Doom Desire, Fairy Wind, Icy Wind, Magical Leaf, Mist Ball, Moonblast, Moongeist Beam, Mystical Fire, Silver Wind, Steam Eruption
- Moves x0.5: Dark Pulse, Night Daze, Shadow Ball
- Status moves modified (see notes): Aromatic Mist, Cosmic Power, Sweet Scent
- CHANGE → NONE(base field): Defog, Gust, Hurricane, Razor Wind, Sonic Skystrike, Tailwind, Twister, Whirlwind
- Change msgs: "The mist was blown away!"
- Seed: Elementalseed → stats [SPDEF +1]; effect Wish=2; msg "A wish was made for {1}!"
### manual
- "Mist settles on the field."
- Grounded Pokémon immune to status
- Created by ... Misty Surge, Misty Terrain (5 turns), Mist (3 turns), when the attacker does not hold an Everstone.
- Dragon-type attacks ▼ x0.5
- Fairy-type Pokémon's Sp.Def ▲ x1.5
- Activates Marvel Scale
- Dry Skin slowly restores HP
- Pixilate power boost → x1.5
- Certain attacks ▲ x1.5 ... Aura Sphere, Dazzling Gleam, Doom Desire, Fairy Wind, Icy Wind, Magical Leaf, Mist Ball, Moonblast, Moongeist Beam, Mystical Fire, Silver Wind, Steam Eruption
- Certain attacks ▼ x0.5 ... Dark Pulse, Night Daze, Shadow Ball
- Soul Heart also boosts Sp.Def
- Certain stat moves' effect ▲ ... Aromatic Mist, Cosmic Power
- Sweet Scent lowers Def & Sp.Def
- Wish recovery → 75 % HP
- Aqua Ring recovery → 1/8 HP
- Destroyed by these moves ... Defog, Gust, Hurricane, Razor Wind, Sonic Skystrike, Tailwind, Twister, Whirlwind
- Becomes Corrosive Mist when when Acid Downpour is used, or when one of these moves is used twice: Clear Smog, Poison Gas, Smog
- Prevents use of these moves ... Explosion, Mind Blown, Self-Destruct
- Activates Water Compaction when when Pokémon is sent out.
- Nature Power → Mist Ball
- Camouflage → Fairy-type
- Secret Power → lowers Sp.Atk
- Activates Elemental Seed... Boosts Sp.Def and applies Wish to the user.

## [4] DARKCRYSTALC — Dark Crystal Cavern
### data
- Intro: Darkness is gathering...
- Nature Power: Dark Pulse | Secret Power anim: Dark Pulse | Camouflage/Mimicry: Dark
- Moves x2.0: Black Hole, Prismatic Laser
- Moves x1.5: Aurora Beam, Dark Pulse, Dazzling Gleam, Diamond Storm, Doom Desire, Flash Cannon, Luster Purge, M. M. Maelstrom, Mirror Shot, Moongeist Beam, Night Daze, Night Slash, Photon Geyser, Power Gem, Shadow Ball, Shadow Bone, Shadow Claw, Shadow Force, Shadow Punch, Shadow Sneak, Signal Beam, Techno Blast
- Moves x0.5: Burning Light
- Accuracy 100: Dark Void
- Status moves modified (see notes): Dark Void, Flash, Moonlight
- CHANGE → CAVE: Bulldoze, Earthquake, Fissure, Magnitude, Tectonic Rage
- CHANGE → CRYSTALC: Sunny Day (cond: `suncheck`)
- Change msgs: "The dark crystals were shattered!" | "The sun lit up the crystal cavern!"
- Seed: Magicalseed → stats [SPDEF +1]; effect MagicCoat=True; msg "{1} shrouded itself with Magic Coat!"
### manual
- "Darkness is gathering..."
- Certain attacks ▲ x2 ... Black Hole, Prismatic Laser
- Certain attacks ▲ x1.5 ... Aurora Beam, Dark Pulse, Dazzling Gleam, Diamond Storm, Doom Desire, Flash Cannon, Luster Purge, M. M. Maelstrom, Mirror Shot, Moongeist Beam, Night Daze, Night Slash, Photon Geyser, Power Gem, Shadow Ball, Shadow Bone, Shadow Claw, Shadow Force, Shadow Punch, Shadow Sneak, Signal Beam, Techno Blast
- Certain attacks ▼ x0.5 ... Burning Light
- Dark-type Pokémon's defenses ▲ x1.5
- Ghost-type Pokémon's defenses ▲ x1.5
- Certain stat moves' effect ▲ ... Flash
- Dark Void's Accuracy → 100
- Moonlight recovery → 75 % HP
- Synthesis/Morning Sun → 25 % HP
- Prevents these moves ... Solar Beam, Solar Blade
- Becomes Crystal Cavern when when the weather is Sunny, for as long as the sun lasts.
- Becomes a Cave when when Bulldoze, Earthquake, Fissure, Magnitude, Tectonic Rage is used.
- Enables Aurora Veil
- Prism Armor lowers damage x0.75
- Shadow Shield reduces damage Shadow Shield reduces damage of super effective hits by 0.75
- Nature Power → Dark Pulse
- Camouflage → Dark-type
- Secret Power → lowers Accuracy
- Activates Magical Seed... Boosts Sp.Def and applies Magic Coat to the user.

## [5] CHESSB — Chess Board
### data
- Intro: Opening variation set.
- Nature Power: Ancient Power | Secret Power anim: Feint | Camouflage/Mimicry: Psychic
- Moves x1.5: Ancient Power, Continent Crush, Fake Out, Feint, Feint Attack, First Impression, Psychic, Secret Power, Shadow Sneak, Shatter Psyche, Smart Strike, Strength, Sucker Punch
- Gain Rock type: Ancient Power, Continent Crush, Psychic, Secret Power, Shatter Psyche, Strength
- Status moves modified (see notes): Calm Mind, Nasty Plot, Trick Room
- CHANGE → NONE(base field): Stomp Tantrum, Tectonic Rage
- Change msgs: "The board was destroyed!"
- Seed: Syntheticseed → stats [SPATK +1]; effect MagicCoat=True; msg "{1} shrouded itself with Magic Coat!"
### manual
- "Opening variation set."
- Pokémon are assigned as Pieces based on specific criteria. A Pokémon can only be one Piece.
- Pawn - Sent out first turn of battle Overrides all other roles except Queen.
- Rook - Highest stat is Def or Sp.Def
- Bishop - Highest stat is Atk or Sp.Atk
- Knight - Highest stat is Speed
- Queen - Final slot in party Overrides all roles. One per team.
- King - Holds King's Rock or lowest HP Overrides Knight, Bishop and Rook. One per team.
- Pieces gain the following effects:
- Pawn - +type Focus Sash's effect
- Rook - Def and Sp.Def ▲
- Bishop - Attack and Sp.Atk ▲
- Knight - Deals 3x damage to Queens and ...and deals 1.25x damage when using a move in double battle that targets both opponents.
- Queen - Def, Sp.Def, and damage ▲
- King - All attacks +type 1 Priority
- Certain moves → Chess Attacks Ancient Power, Continent Crush, Psychic, Secret Power, Shatter Psyche, Strength
- Chess Attacks ▲ x1.5
- Chess Attacks +type Rock-type
- Chess Attacks ▲ x2 when when the target has Oblivious, Simple, Unaware, Klutz, or is confused.
- Chess Attacks ▼ x0.5 when when the target has Adaptability, Synchronize, Anticipation or Telepathy.
- Trick Room lasts 8 turns ...
- Queenly Majesty damage ▲ x1.5
- Certain attacks ▲ x1.5 ... Ancient Power, Continent Crush, Fake Out, Feint, Feint Attack, First Impression, Psychic, Secret Power, Shadow Sneak, Shatter Psyche, Smart Strike, Strength, Sucker Punch
- Certain stat moves' effect ▲ ... Calm Mind, Nasty Plot
- Certain attacks +type protection ... King's Shield additionally protects from non-damaging moves.
- King's Shield +type lowers Sp.Atk
- Destroyed by these moves ... Stomp Tantrum, Tectonic Rage
- Nature Power → Ancient Power
- Camouflage → Psychic-type
- Secret Power → lowers Defense
- Activates Synthetic Seed... Boosts Sp.Atk and applies Magic Coat to the user.

## [6] BIGTOPA — Big Top Arena
### data
- Intro: Now presenting...!
- Nature Power: Acrobatics | Secret Power anim: Dynamic Punch | Camouflage/Mimicry: Normal
- Moves x2.0: Pay Day
- Moves x1.5: Acrobatics, Fiery Dance, Fire Lash, First Impression, Fly, Petal Dance, Power Whip, Revelation Dance, Vine Whip
- Accuracy 100: Sing
- Status moves modified (see notes): Belly Drum, Dragon Dance, Encore, Feather Dance, Quiver Dance, Rain Dance, Sing, Spotlight, Swords Dance
- Seed: Syntheticseed → stats [ATTACK +1]; effect HelpingHand=True; msg "{1} accepts the crowd's help!"
### manual
- "Now presenting...!"
- Certain moves → Striker Moves All physical Fighting moves, Blaze Kick, Body Slam, Bounce, Brutal Swing, Bulldoze, Crabhammer, Dragon Hammer, Dragon Rush, Dual Chop, Earthquake, Giga Impact, Heat Crash, Heavy Slam, High Horsepower, Ice Hammer, Icicle Crash, Iron Tail, Magnitude, Meteor Mash, Pound, Sky Drop, Slam, Smack Down, Stomp, Stomp Tantrum, Strength, Wood Hammer
- Striker Moves → random damage Damage rolls set multipliers between x0.5 and x3
- Striker Moves roll high when when the attacker has one of these abilities: Sheer Force, Guts, Huge Power, Pure Power
- Striker Moves roll base on Atk stat A boosted Attack stat increases the chance of high rolls. Lowered Attack decreases the chance of high rolls, regardless of ability.
- Acrobatics → always full damage
- Sound-based moves ▲ x1.5
- Pay Day BP ▲ x2 and payout ▲
- Certain attacks ▲ x1.5 ... Acrobatics, Fiery Dance, Fire Lash, First Impression, Fly, Petal Dance, Power Whip, Revelation Dance, Vine Whip
- Encore lasts 6 turns
- Certain stat moves' effect ▲ ... Dragon Dance, Quiver Dance, Swords Dance, Feather Dance
- Sing's Accuracy → 100
- Rain Dance lasts 8 turns
- Belly Drum boosts Def/Sp.Def
- Spotlight boosts Atk/Sp.Atk of both the target and user.
- Dancer boosts Speed and Sp.Atk when a Dance move is used on its own turn.
- Nature Power → Acrobatics
- Camouflage → Normal-type
- Secret Power → lowers Sp.Def
- Activates Synthetic Seed... Boosts Attack and applies Helping Hand to the user.

## [7] BURNINGF — Burning Field
### data
- Intro: The field is ablaze!
- Nature Power: Flamethrower | Secret Power anim: Flamethrower | Camouflage/Mimicry: Fire
- Type x1.5: Fire
- Type x0.5: Grass, Ice
- Type-boost conditions: Fire: `!attacker.isAirborne?`; Grass: `!opponent.isAirborne?`
- Moves x2.0: Smack Down, Thousand Arrows
- Moves x1.5: Clear Smog, Smog
- Accuracy 100: Will-O-Wisp
- Gain Fire type: Clear Smog, Smack Down, Smog, Thousand Arrows
- Status moves modified (see notes): Smokescreen, Will-O-Wisp
- CHANGE → NONE(base field): Continent Crush, Defog, Gust, Hurricane, Hydro Vortex, Muddy Water, Ocean Operetta, Razor Wind, Sand Tomb, Sludge Wave, Sonic Skystrike, Sparkling Aria, Surf, Tailwind, Twister, Water Pledge, Water Sport, Water Spout, Whirlwind
- Change msgs: "The grime snuffed out the flame!" | "The wind snuffed out the flame!" | "The water snuffed out the flame!" | "The sand snuffed out the flame!"
- Seed: Elementalseed → stats [ATTACK +1, SPATK +1, SPEED +1]; effect MultiTurnAttack=FIRESPIN; msg "{1} was trapped in the vortex!"
### manual
- "The field is ablaze!"
- End of turn Fire-type damage when when grounded and not Fire type.
- Immunity to field damage when when one of these abilities is active: Flame Body, Flare Boost, Flash Fire, Heatproof, Magma Armor, Water Bubble, Water Veil.
- Field damage ▲ when when one of these abilities is active: Fluffy, Grass Pelt, Ice Body, Leaf Guard
- Created by Grass +type Fire Pledge
- Fire-type attacks ▲ x1.5 when when attacker is grounded.
- Grass-type attacks ▼ x0.5 when when target is grounded.
- Ice-type attacks ▼ x0.5
- Destroyed by these moves ... Continent Crush, Defog, Gust, Hurricane, Hydro Vortex, Muddy Water, Ocean Operetta, Razor Wind, Sand Tomb, Sludge Wave, Sonic Skystrike, Sparkling Aria, Surf, Tailwind, Twister, Water Pledge, Water Sport, Water Spout, Whirlwind
- Destroyed by Sand and Rain
- Activates certain abilities ... Blaze, Flare Boost, Flash Fire
- Will-O-Wisp's Accuracy → 100
- Pokémon cannot be frozen
- Smokescreen effect ▲
- Fire Spin damage → 1/6 HP
- Certain attacks +type Fire-type ... Clear Smog, Smack Down, Smog, Thousand Arrows
- Certain attacks ▲ x1.5 ... Clear Smog, Smog
- Certain attacks ▲ x2 ... Smack Down, Thousand Arrows
- Restores Fire-type after Burn Up
- Nature Power → Flamethrower
- Camouflage → Fire-type
- Secret Power → burn
- Activates Elemental Seed... Boosts Attack, Special Attack and Speed, but applies Fire Spin to the user.

## [8] SWAMPF — Swamp Field
### data
- Intro: The field is swamped.
- Nature Power: Muddy Water | Secret Power anim: Muddy Water | Camouflage/Mimicry: Water
- Type x1.5: Poison
- Type-boost conditions: Poison: `!opponent.isAirborne?`
- Moves x1.5: Brine, Gunk Shot, Hydro Vortex, Mud Bomb, Mud Shot, Mud-Slap, Muddy Water, Sludge Wave, Smack Down, Surf, Thousand Arrows
- Moves x0.25: Bulldoze, Earthquake, Magnitude
- Accuracy 100: Sleep Powder
- Gain Water type: Smack Down, Thousand Arrows
- Status moves modified (see notes): Aqua Ring, Sleep Powder
- Seed: Telluricseed → stats [DEFENSE +1, SPDEF +1]; effect Ingrain=True; msg "{1} planted its roots!"
### manual
- "The field is swamped."
- Pokémon's Speed ▼ each turn.
- Pokémon immune to slow when when airborne.
- Created by Water +type Grass Pledge
- Ingrain damages user unless unless user has Poison or Steel type.
- Dry Skin slowly restores HP
- Aqua Ring recovery → 1/8 HP
- Poison-type attacks ▲ x1.5 when when target is grounded.
- Certain attacks ▲ x1.5 ... Brine, Gunk Shot, Hydro Vortex, Mud Bomb, Mud Shot, Mud-Slap, Muddy Water, Sludge Wave, Smack Down, Surf, Thousand Arrows
- Certain attacks ▼ x0.25 ... Bulldoze, Earthquake, Magnitude
- Certain attacks +type Water-type ... Smack Down, Thousand Arrows
- Prevents use of these moves ... Explosion, Mind Blown, Self-Destruct
- Sleep Powder's Accuracy → 100
- sleep Pokémon damaged each turn
- Gooey effect ▲ x2
- Activates Water Compaction each turn.
- Strength Sap recovery ▲ 30 %
- Nature Power → Muddy Water
- Camouflage → Water-type
- Secret Power → lowers Speed
- Activates Telluric Seed... Boosts Defense and Sp.Def and applies Ingrain to the user.

## [9] RAINBOWF — Rainbow Field
### data
- Intro: What does it mean?
- Nature Power: Aurora Beam | Secret Power anim: Aurora Beam | Camouflage/Mimicry: Dragon
- Type x1.5: Normal
- Type-boost conditions: Normal: `self.pbIsSpecial?(type)`
- Moves x1.5: Aurora Beam, Dazzling Gleam, Dragon Pulse, Fire Pledge, Fleur Cannon, Grass Pledge, Heart Stamp, Hidden Power, Judgment, Mist Ball, Moonblast, Mystical Fire, Ocean Operetta, Prismatic Laser, Relic Song, Sacred Fire, Secret Power, Silver Wind, Solar Beam, Solar Blade, Sparkling Aria, Tri Attack, Twinkle Tackle, Water Pledge, Weather Ball, Zen Headbutt
- Moves x0.5: Dark Pulse, NE. Nightmare, Night Daze, Shadow Ball
- Status moves modified (see notes): Cosmic Power, Meditate, Wish
- CHANGE → NONE(base field): Burning Light
- Change msgs: "The rainbow was consumed!"
- Seed: Magicalseed → stats [SPATK +1]; effect Wish=2; msg "A wish was made for {1}!"
### manual
- "What does it mean?"
- Secondary effect chance ▲ x2
- Created by Fire +type Water Pledge
- Created by Sun +type Rain
- Cloud Nine slowly boosts stats
- Activates Marvel Scale
- Wonder Skin always activates
- Special Normal-type attacks ▲ x1.5
- Special Normal-type attacks +type ???-type Special Normal attacks gain a random type.
- Certain attacks ▲ x1.5 ... Aurora Beam, Dazzling Gleam, Dragon Pulse, Fire Pledge, Fleur Cannon, Grass Pledge, Heart Stamp, Hidden Power, Judgment, Mist Ball, Moonblast, Mystical Fire, Ocean Operetta, Prismatic Laser, Relic Song, Sacred Fire, Secret Power, Silver Wind, Solar Beam, Solar Blade, Sparkling Aria, Tri Attack, Twinkle Tackle, Water Pledge, Weather Ball, Zen Headbutt
- Certain attacks ▼ x0.5 ... Dark Pulse, NE. Nightmare, Night Daze, Shadow Ball
- Certain stat moves' effect ▲ ... Cosmic Power, Meditate
- Certain attacks → no charge turn Solar Beam, Solar Blade
- Wish recovery → 75 % HP
- Nightmare and Bad Dreams fail
- sleep Pokémon recover each turn
- Sonic Boom damage → 140
- Destroyed when when Sand or Hail are in effect, or Light That Burns The Sky is used.
- Enables Aurora Veil
- Soul Heart also boosts Sp.Def
- Prism Armor lowers damage x0.75
- Nature Power → Aurora Beam
- Camouflage → Dragon-type
- Secret Power → random status
- Activates Magical Seed... Boosts Sp.Atk and applies Wish to the user.

## [10] CORROSIVEF — Corrosive Field
### data
- Intro: The field is corrupted!
- Nature Power: Acid Spray | Secret Power anim: Acid | Camouflage/Mimicry: Poison
- Moves x2.0: Acid, Acid Spray, Grass Knot
- Moves x1.5: Mud Bomb, Mud Shot, Mud-Slap, Muddy Water, Smack Down, Thousand Arrows, Whirlpool
- Accuracy 100: Poison Powder, Sleep Powder, Stun Spore, Toxic
- Gain Poison type: Mud Bomb, Mud Shot, Mud-Slap, Muddy Water, Smack Down, Thousand Arrows, Whirlpool
- All Grass moves gain Poison type
- Status moves modified (see notes): Acid Armor, Poison Powder, Sleep Powder, Stun Spore, Toxic
- CHANGE → GRASSYT: Seed Flare
- Change msgs: "The polluted field was purified!"
- Seed: Telluricseed → stats []; effect BanefulBunker=True; msg "The Telluric Seed shielded {1} against damage!"
### manual
- "The field is corrupted!"
- Deals Poison-type hazard damage when when grounded.
- No hazard damage when when Poison or Steel type, or one of these abilities is active: Immunity, Poison Heal, Toxic Boost, Wonder Guard
- Ingrain damages user unless unless Poison or Steel type.
- Grass Pelt damages user unless ...unless Poison or Steel type.
- Activates certain abilities when when grounded, activates Poison Heal and Toxic Boost.
- Grass-type attacks +type Poison-type
- Certain attacks +type Poison-type ... Mud Bomb, Mud Shot, Mud-Slap, Muddy Water, Smack Down, Thousand Arrows, Whirlpool
- Certain attacks ▲ x1.5 ... Mud Bomb, Mud Shot, Mud-Slap, Muddy Water, Smack Down, Thousand Arrows, Whirlpool
- Certain attacks ▲ x2 ... Acid, Acid Spray, Grass Knot
- Certain stat moves' effect ▲ ... Acid Armor
- Activates Venom Drench
- Activates Venoshock
- Certain moves' Accuracy → 100 Poison Powder, Sleep Powder, Stun Spore, Toxic
- sleep Pokémon damaged unless unless Poison or Steel Type, or has Wonder Guard.
- Toxic Spikes can't be absorbed
- Becomes Grassy Terrain when when Seed Flare is used.
- Activates Merciless
- Corrosion damage ▲ x1.5
- Floral Healing +type poison(status)
- Nature Power → Acid Spray
- Camouflage → Poison-type
- Secret Power → poison(status)
- Activates Telluric Seed ... Applies Baneful Bunker to the user.

## [11] CORROSIVEMISTF — Corrosive Mist Field
### data
- Intro: Corrosive mist settles on the field!
- Nature Power: Venoshock | Secret Power anim: Acid Spray | Camouflage/Mimicry: Poison
- Type x1.5: Fire
- Moves x1.5: Acid Spray, Bubble, Bubble Beam, Clear Smog, Smog, Sparkling Aria
- Accuracy 100: Toxic
- Gain Poison type: Bubble, Bubble Beam, Energy Ball, Sparkling Aria
- Status moves modified (see notes): Acid Armor
- CHANGE → NONE(base field): Defog, Eruption, Explosion, Fire Pledge, Flame Burst, Gust, Heat Wave, Hurricane, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Razor Wind, Searing Shot, Seed Flare, Self-Destruct, Sonic Skystrike, Tailwind, Twister, Whirlwind
- CHANGE → CORROSIVEF: Gravity
- Change msgs: "The mist was blown away!" | "The polluted mist was purified!" | "The toxic mist collected on the ground!"
- Seed: Elementalseed → stats [ATTACK +1, SPATK +1]; effect 0=0; msg "{1} was badly poisoned!"
### manual
- "Corrosive mist settles on the field!"
- All Pokémon get poison(status) each turn
- Aqua Ring damages user unless unless Poison or Steel type.
- Dry Skin damages user unless unless Poison or Steel type.
- Certain attacks +type Poison-type ... All special Flying moves, Bubble, Bubble Beam, Energy Ball, Sparkling Aria
- Certain attacks ▲ x1.5 ... Acid Spray, Bubble, Bubble Beam, Clear Smog, Smog, Sparkling Aria
- Certain stat moves' effect ▲ ... Acid Armor
- Activates Venom Drench
- Activates Venoshock
- Toxic's Accuracy → 100
- Aftermath damage → 50 % HP
- Fire-type attacks ▲ x1.5
- Activates Merciless
- Corrosion damage ▲ x1.5
- Floral Healing +type poison(status)
- Activates Water Compaction each turn.
- Destroyed by these moves ... Defog, Eruption, Explosion, Fire Pledge, Flame Burst, Gust, Heat Wave, Hurricane, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Razor Wind, Searing Shot, Seed Flare, Self-Destruct, Sonic Skystrike, Tailwind, Twister, Whirlwind
- All Pokémon faint when unless they have Flash Fire, when one of these moves is used in the absence of Damp: ?(PBFields::IGNITEMOVES + [PBMoves::SELFDESTRUCT, PBMoves::EXPLOSION]).map {|id| PBMoves.getName(id)}.sort.join(", ")?
- Becomes Corrosive Field when when Gravity is used.
- Becomes Misty Terrain when when Seed Flare is used.
- Nature Power → Venoshock
- Camouflage → Poison-type
- Secret Power → poison(status)
- Activates Elemental Seed ... Boosts Attack and Sp.Atk and badly poisons the user.

## [12] DESERTF — Desert Field
### data
- Intro: The field is rife with sand.
- Nature Power: Sand Tomb | Secret Power anim: Sand Tomb | Camouflage/Mimicry: Ground
- Type x0.5: Electric, Water
- Type-boost conditions: Water: `!attacker.isAirborne?`; Electric: `!opponent.isAirborne?`
- Moves x1.5: Burn Up, Dig, Heat Wave, Needle Arm, Pin Missile, S. Sunraze Smash, Sand Tomb, Solar Beam, Solar Blade, Thousand Waves
- Status moves modified (see notes): Sand Attack, Sandstorm, Shore Up, Sunny Day
- Seed: Telluricseed → stats [DEFENSE +1, SPDEF +1, SPEED +1]; effect MultiTurnAttack=SANDTOMB; msg "{1} was trapped by Sand Tomb!"
### manual
- "The field is rife with sand."
- Ground-type Pokémon's Sp.Def ▲ x1.5
- Activates certain abilities ... Sand Force, Sand Rush, Sand Veil
- Sun and Sand last 8 turns
- Certain attacks ▲ x1.5 ... Burn Up, Dig, Heat Wave, Needle Arm, Pin Missile, S. Sunraze Smash, Sand Tomb, Solar Beam, Solar Blade, Thousand Waves
- Sand Attack's effect ▲
- Dry Skin damages user
- Sand Tomb damage → 1/6 HP per turn
- Water-type attacks ▼ x0.5 when when attacker is grounded.
- Electric-type attacks ▼ x0.5 when when target is grounded.
- Shore Up heals 100 % Max HP
- Nature Power → Sand Tomb
- Camouflage → Ground-type
- Secret Power → lowers Accuracy
- Activates Telluric Seed ... Boosts Defense, Sp.Def, and Speed but applies Sand Tomb to the user.

## [13] ICYF — Icy Field
### data
- Intro: The field is covered in ice.
- Nature Power: Ice Beam | Secret Power anim: Ice Shard | Camouflage/Mimicry: Ice
- Type x1.5: Ice
- Type x0.5: Fire
- Moves x0.5: Scald, Steam Eruption
- All Rock moves gain Ice type
- Status moves modified (see notes): Acid Armor
- CHANGE → WATERS: Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot
- Change msgs: "The ice melted away!"
- Seed: Elementalseed → stats [SPEED +2]; effect 0=0; msg "{1} was hurt by icy Spikes!"
### manual
- "The field is covered in ice."
- Certain moves boost speed when when attacker is grounded, these moves boost Speed: All attacking physical contact priority moves, Defense Curl, Feint, Lunge, Rollout, Steamroller
- Ice-type attacks ▲ x1.5
- Fire-type attacks ▼ x0.5
- Certain attacks ▼ x0.5 ... Scald, Steam Eruption
- Rock-type attacks +type Ice-type
- Ice-type Pokémon's Defense ▲ x1.5 when when Hail is up
- burn damage ▼ x0.5
- Becomes Water Surface when when Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot is used, or if Water Surface is already under the ice and Bulldoze, Earthquake, Fissure, Magnitude, Tectonic Rage is used. Also turns into Water Surface if Scald or Steam Eruption is used twice.
- Creates a layer of spikes when when one of these moves is used and Water Surface isn't beneath the ice: Bulldoze, Earthquake, Fissure, Magnitude, Tectonic Rage.
- Hail lasts 8 turns
- Activates certain abilities ... Ice Body, Snow Cloak, Slush Rush
- Refrigerate power boost → x1.5
- Enables Aurora Veil
- Liquid Voice → Ice-type
- Nature Power → Ice Beam
- Camouflage → Ice-type
- Secret Power → freeze
- Activates Elemental Seed ... Boosts Speed two stages, but damages the user with Spikes.

## [14] ROCKYF — Rocky Field
### data
- Intro: The field is littered with rocks.
- Nature Power: Rock Smash | Secret Power anim: Rock Throw | Camouflage/Mimicry: Rock
- Type x1.5: Rock
- Moves x2.0: Rock Smash
- Moves x1.5: Accelerock, Bulldoze, Earthquake, Magnitude, Rock Climb, Strength
- Gain Rock type: Bulldoze, Earthquake, Magnitude, Rock Climb, Strength
- Status moves modified (see notes): Rock Polish
- Seed: Telluricseed → stats [DEFENSE +1]; effect 0=0; msg "{1} was hurt by Stealth Rocks!"
### manual
- "The field is littered with rocks."
- Pokémon can dodge when when Defense is increased or Substitute is up, attacks that can be blocked by Bulletproof can be dodged behind rocks.
- Missed contact moves recoil unless user has Rock Head.
- Stealth Rock damage ▲ x2
- Flinched Pokémon take recoil unless target has Steadfast or Sturdy.
- Prevents flinches when when Defense is increased.
- Certain attacks +type Rock-type ... Bulldoze, Earthquake, Magnitude, Rock Climb, Strength
- Certain attacks ▲ x1.5 ... Accelerock, Bulldoze, Earthquake, Magnitude, Rock Climb, Strength
- Rock-type attacks ▲ x1.5
- Rock Smash ▲ x2
- Rock Polish's effect ▲
- Long Reach accuracy ▼ x0.9
- Nature Power → Rock Smash
- Camouflage → Rock-type
- Secret Power → Flinches
- Activates Telluric Seed ... Boosts Defense, but damages the user with Stealth Rocks.

## [15] FORESTF — Forest Field
### data
- Intro: The field is abound with trees.
- Nature Power: Wood Hammer | Secret Power anim: Wood Hammer | Camouflage/Mimicry: Grass
- Type x1.5: Bug, Grass
- Type-boost conditions: Bug: `self.pbIsSpecial?(type)`
- Moves x1.5: Attack Order, Cut, Electroweb
- Moves x0.5: Muddy Water, Surf
- Status moves modified (see notes): Defend Order, Forest's Curse, Growth, Heal Order, Nature Madness, Sticky Web, Strength Sap
- CHANGE → BURNINGF: Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot (cond: `ignitecheck`)
- Change msgs: "The forest caught fire!"
- Seed: Telluricseed → stats []; effect SpikyShield=True; msg "The Telluric Seed shielded {1} against damage!"
### manual
- "The field is abound with trees."
- Effect Spore chance ▲ x2
- Activates certain abilities ... Grass Pelt, Leaf Guard, Overgrow, Swarm
- Grass-type attacks ▲ x1.5
- Special Bug-type attacks ▲ x1.5
- Certain attacks ▲ x1.5 ... Attack Order, Cut, Electroweb
- Cut → x2 vs Grass-type
- Certain attacks ▼ x0.5 ... Muddy Water, Surf
- Sap Sipper slowly restores HP
- Ingrain recovery ▲ x2
- Certain stat moves' effect ▲ ... Defend Order, Growth
- Heal Order recovery → 66 %
- Sticky Web effect ▲ x2
- Long Reach accuracy ▼ x0.9
- Strength Sap recovery → 66 %
- Nature's Madness damage → 75 %
- Forest's Curse +type Curse effect
- Becomes a Burning Field when when Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot is used in the absence of Rain or Water Sport
- Nature Power → Wood Hammer
- Camouflage → Grass-type
- Secret Power → sleep
- Activates Telluric Seed ... Applies Spiky Shield to the user.

## [16] SUPERHEATEDF — Super-Heated Field
### data
- Intro: The field is super-heated!
- Nature Power: Heat Wave | Secret Power anim: Flame Burst | Camouflage/Mimicry: Fire
- Type x1.1: Fire
- Type x0.9: Water
- Type x0.5: Ice
- Moves x1.667: Scald, Steam Eruption
- Moves x0.625: Hydro Vortex, Muddy Water, Ocean Operetta, Sparkling Aria, Surf, Water Pledge, Water Spout
- CHANGE → BURNINGF: Eruption, Explosion, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot, Self-Destruct (cond: `ignitecheck`)
- CHANGE → NONE(base field): Blizzard, Glaciate, Subzero Slammer
- Change msgs: "The field combusted!" | "The field cooled off!"
- Seed: Telluricseed → stats [DEFENSE +1]; effect ShellTrap=True; msg "{1} primed a trap!"
### manual
- "The field is super-heated!"
- Fire-type attacks ▲ x1.1
- Ice-type attacks ▼ x0.5
- Water-type attacks ▼ x0.9
- Certain attacks ▼ x0.5 ... Hydro Vortex, Muddy Water, Ocean Operetta, Sparkling Aria, Surf, Water Pledge, Water Spout
- Certain moves generate steam ... Hydro Vortex, Muddy Water, Oceanic Operetta, Sparkling Aria, Surf, Water Pledge, Water Sport, and Water Spout generate steam, lowering all active Pokémon's Accuracy.
- Certain attacks ▲ x1.5 ... Scald, Steam Eruption
- Becomes Burning Field when when Eruption, Explosion, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot, Self-Destruct is used in the absence of Rain or Water Sport.
- Destroyed by these moves ... Blizzard, Glaciate, Subzero Slammer
- Hail is terminated
- Attacks fatigue after 1 turn ... Applies to Outrage, Petal Dance, and Thrash
- Nature Power → Heat Wave
- Camouflage → Fire-type
- Secret Power → burn
- Activates Telluric Seed ... Boosts Defense and applies Shell Trap to the user.

## [17] FACTORYF — Factory Field
### data
- Intro: Machines whir in the background.
- Nature Power: Gear Grind | Secret Power anim: Magnet Bomb | Camouflage/Mimicry: Steel
- Type x1.5: Electric
- Moves x2.0: Flash Cannon, Gear Grind, Gyro Ball, Magnet Bomb
- Moves x1.5: Steamroller, Techno Blast
- Status moves modified (see notes): Autotomize, Gear Up, Iron Defense, Magnet Rise, Metal Sound, Shift Gear
- CHANGE → SHORTCIRCUITF: Bulldoze, Burning Light, Earthquake, Explosion, Fissure, Magnitude, Self-Destruct, Tectonic Rage
- Change msgs: "The field was broken!" | "All the light was consumed!"
- Seed: Syntheticseed → stats [SPATK +1]; effect LaserFocus=1; msg "{1} is focused!"
### manual
- "Machines whir in the background."
- Electric-type attacks ▲ x1.2
- Motor Drive boost ▲ x2
- Download boost ▲ x2
- Technician applies up to BP 80
- Certain attacks ▲ x1.5 ... Steamroller, Techno Blast
- Certain attacks ▲ x2 ... Flash Cannon, Gear Grind, Gyro Ball, Magnet Bomb
- Certain stat moves' effect ▲ ... Autotomize, Iron Defense, Metal Sound, Shift Gear
- Magnet Rise lasts 8 turns
- Becomes Short-Circuit when when Bulldoze, Burning Light, Earthquake, Explosion, Fissure, Magnitude, Self-Destruct, Tectonic Rage is used. Discharge additionally can alternate between the Short-Circuit and Factory Fields for each instance of damage in Double Battles.
- Gear Up boosts user and ▲ x2
- Galvanize power boost → x1.5
- Steelworker power boost → x2
- Nature Power → Gear Grind
- Camouflage → Steel-type
- Secret Power → lowers Attack
- Activates Synthetic Seed ... Boosts Sp.Atk and applies Laser Focus to the user.

## [18] SHORTCIRCUITF — Short-Circuit Field
### data
- Intro: Bzzt!
- Nature Power: Discharge | Secret Power anim: Electro Ball | Camouflage/Mimicry: Electric
- Moves x1.5: Dazzling Gleam, Flash Cannon, Gear Grind, Gyro Ball, Hydro Vortex, Magnet Bomb, Muddy Water, Surf
- Moves x1.3: Dark Pulse, Night Daze, Night Slash, Shadow Ball, Shadow Bone, Shadow Claw, Shadow Force, Shadow Punch, Shadow Sneak
- Moves x0.5: Burning Light
- Accuracy 80: Zap Cannon
- Gain Electric type: Flash Cannon, Gear Grind, Gyro Ball, Magnet Bomb, Muddy Water, Surf
- Status moves modified (see notes): Flash, Magnet Rise, Metal Sound
- CHANGE → FACTORYF: Charge Beam, Gigavolt Havoc, Ion Deluge, Parabolic Charge, Wild Charge
- Change msgs: "SYSTEM ONLINE."
- Seed: Syntheticseed → stats [SPDEF +1]; effect MagnetRise=5; msg "{1} levitated with electromagnetism!"
### manual
- "Bzzt!"
- Static chance ▲ x2
- Volt Absorb slowly restores HP
- Activates Plus and Minus
- Electric-type attacks → sequential damage Damage rolls set multipliers between x0.5 and x2 on a specific pattern
- Certain attacks ▲ x1.3 ... Dark Pulse, Night Daze, Night Slash, Shadow Ball, Shadow Bone, Shadow Claw, Shadow Force, Shadow Punch, Shadow Sneak
- Certain attacks ▲ x1.5 ... Dazzling Gleam, Flash Cannon, Gear Grind, Gyro Ball, Hydro Vortex, Magnet Bomb, Muddy Water, Surf
- Certain attacks ▼ x0.5 ... Burning Light
- Certain attacks +type Electric-type ... Flash Cannon, Gear Grind, Gyro Ball, Magnet Bomb, Muddy Water, Surf
- Becomes Factory Field when when Charge Beam, Gigavolt Havoc, Ion Deluge, Parabolic Charge, Wild Charge is used. Discharge additionally can alternate between the Short-Circuit and Factory Fields for each instance of damage in Double Battles.
- Certain stat moves' effect ▲ ... Flash, Metal Sound
- Zap Cannon's Accuracy → 80
- Magnet Rise lasts for 8 turns
- Activates Surge Surfer
- Galvanize power boost → x2
- Steelworker +type Electric-type
- Nature Power → Discharge
- Camouflage → Electric-type
- Secret Power → paralysis
- Activates Synthetic Seed ... Boosts Sp.Def and applies Magnet Rise to the user.

## [19] WASTELAND — Wasteland
### data
- Intro: The waste is watching...
- Nature Power: Gunk Shot | Secret Power anim: Gunk Shot | Camouflage/Mimicry: Poison
- Moves x2.0: Spit Up
- Moves x1.5: Mud Bomb, Mud Shot, Mud-Slap, Power Whip, Vine Whip
- Moves x1.2: Gunk Shot, Octazooka, Sludge, Sludge Bomb, Sludge Wave
- Moves x0.25: Bulldoze, Earthquake, Magnitude
- Gain Poison type: Mud Bomb, Mud Shot, Mud-Slap
- Status moves modified (see notes): Swallow
- Seed: Telluricseed → stats [ATTACK +1, SPATK +1]; effect 0=0; msg ""
### manual
- "The waste is watching..."
- Entry hazards are consumed ... Consumed hazards return at the end of the turn, returning a special effect to the side they were on: \n Stealth Rocks deal type-scaling Rock damage double the normal effect to Pokémon. \n Spikes deal 33% max HP to grounded Pokémon. \n Toxic Spikes deal 12.5% max HP to grounded non-Poison/Steel types, and inflicts Poison. \n Sticky Web severely lowers Pokémon's Speed.
- Certain attacks ▲ x1.2 ... Gunk Shot, Octazooka, Sludge, Sludge Bomb, Sludge Wave
- Certain attacks ▲ x1.5 ... Mud Bomb, Mud Shot, Mud-Slap, Power Whip, Vine Whip
- Certain attacks ▼ x0.25 ... Bulldoze, Earthquake, Magnitude
- Certain attacks +type Poison-type ... Mud Bomb, Mud Shot, Mud-Slap
- Certain moves +type random status ... Acid Downpour, Gunk Shot, Octazooka, Sludge, Sludge Bomb, Sludge Wave inflict a random status unless target has Poison or Steel type, or one of these abilities: Immunity, Poison Heal, Toxic Boost
- Certain abilities' chance ▲ x2 Effect Spore, Poison Point, Stench
- Liquid Ooze damage ▲ x2
- Activates certain abilities ... Poison Heal, Toxic Boost, Merciless
- Gooey effect +type poison(status)
- Activates Venom Drench and Venoshock
- Spit Up ▲ x2
- Swallow ▲ x2 +type cure when max stack
- Leech Seed effect ▲ x2
- Corrosion attacks +type all stats
- Nature Power → Gunk Shot
- Camouflage → Poison-type
- Secret Power → all stats
- Activates Telluric Seed ... Boosts Attack and Sp.Atk and lays Stealth Rocks on both sides of the battle.

## [20] ASHENB — Ashen Beach
### data
- Intro: Ash and sand line the field.
- Nature Power: Meditate | Secret Power anim: Mud Shot | Camouflage/Mimicry: Ground
- Moves x2.0: Mud Bomb, Mud Shot, Mud-Slap, Sand Tomb
- Moves x1.5: Clang. Soulblaze, Hidden Power, Land's Wrath, Muddy Water, Strength, Surf, Thousand Waves
- Moves x1.3: Aura Sphere, Focus Blast, Stored Power, Zen Headbutt
- Moves x1.2: Psychic
- Accuracy 90: Focus Blast
- Gain Psychic type: Strength
- Status moves modified (see notes): Calm Mind, Focus Energy, Kinesis, Meditate, Sand Attack, Sandstorm, Shore Up
- Seed: Telluricseed → stats []; effect FocusEnergy=3; msg "{1}'s Telluric Seed is getting it pumped!"
### manual
- "Ash and sand line the field."
- Certain attacks stir up ash ... All Special Flying attacks, Fire Spin, Leaf Tornado, Razor Wind, Twister, and Whirlpool stir up ash, lowering all active Pokémon's Accuracy.
- Fighting-type Pokémon or Pokémon with with Inner Focus can't get confused.
- Accuracy/Evasion ignored when when the target does not have Unnerve, and one of these abilities is active: Own Tempo, Pure Power, Sand Veil, Steadfast
- Activates certain abilities ... Sand Force, Sand Rush, Sand Veil
- Zen Mode always active
- Certain stat moves' effect ▲ ... Calm Mind, Kinesis, Meditate, Sand Attack
- Sand lasts 8 turns
- Psych-Up +type cures status
- Focus Energy's effect ▲
- Certain attacks ▲ x2 ... Mud Bomb, Mud Shot, Mud-Slap, Sand Tomb
- Certain attacks ▲ x1.5 ... Clang. Soulblaze, Hidden Power, Land's Wrath, Muddy Water, Strength, Surf, Thousand Waves
- Certain attacks ▲ x1.3 ... Aura Sphere, Focus Blast, Stored Power, Zen Headbutt
- Psychic ▲ x1.2
- Strength → Fighting-type/Psychic-type damage
- Sand Tomb +type lowers Accuracy
- Water Compaction boosts Sp.Def
- Focus Blasts's Accuracy → 90
- Shore Up recovery → 75 % HP
- Shell Bell recovery → 25 % damage dealt
- Nature Power → Meditate
- Camouflage → Ground-type
- Secret Power → lowers Accuracy
- Activates Telluric Seed ... Applies Focus Energy to the user.

## [21] WATERS — Water Surface
### data
- Intro: The water's surface is calm.
- Nature Power: Whirlpool | Secret Power anim: Aqua Jet | Camouflage/Mimicry: Water
- Type x1.5: Electric, Water
- Type x0.5: Fire
- Type-boost conditions: Fire: `!opponent.isAirborne?`; Electric: `!opponent.isAirborne?`
- Moves x1.5: Dive, Hydro Vortex, Muddy Water, Surf, Whirlpool
- Status moves modified (see notes): Aqua Ring, Splash
- CHANGE → UNDERWATER: Dive, Gravity
- CHANGE → ICYF: Blizzard, Glaciate, Subzero Slammer
- Change msgs: "The battle sank into the depths!" | "The battle was pulled underwater!" | "The water froze over!"
- Seed: Elementalseed → stats [SPDEF +1]; effect AquaRing=True; msg "{1} surrounded itself with a veil of water!"
### manual
- "The water's surface is calm."
- Speed ▼ x0.75 unless Water-type or unless Water type, airborne, or the abilities Surge Surfer or Swift Swim are active.
- Prevents Ground-type attacks
- Spikes/Toxic Spikes terminated
- Dive lasts 1 turn
- Water Veil +type cures status
- Activates certain abilities ... Hydration, Schooling, Surge Surfer, Swift Swim, Torrent, and Water Compaction each turn.
- Splash +type lowers Accuracy
- Aqua Ring recovery → 1/8 HP
- Certain abilities restore HP ... Dry Skin, Water Absorb
- Shore Up activates Water Compaction
- Whirlpool damage → 1/6 HP
- Whirlpool +type confuses target
- Water-type attacks ▲ x1.5
- Electric-type attacks ▲ x1.5 when when target is grounded.
- Fire-type attacks ▼ x0.5 when when target is grounded.
- Certain attacks ▲ x1.5 ... Dive, Hydro Vortex, Muddy Water, Surf, Whirlpool
- Becomes Underwater when when Dive, Gravity is used.
- Becomes Icy Field when when Blizzard, Glaciate, Subzero Slammer is used.
- Becomes Murkwater when when Acid Downpour is used, or Sludge Wave is used twice.
- Nature Power → Whirlpool
- Camouflage → Water-type
- Secret Power → lowers Speed
- Activates Elemental Seed ... Boosts Sp.Def and applies Aqua Ring to the user.

## [22] UNDERWATER — Underwater
### data
- Intro: Blub blub...
- Nature Power: Water Pulse | Secret Power anim: Aqua Tail | Camouflage/Mimicry: Water
- Type x2.0: Electric
- Type x1.5: Water
- Moves x2.0: Anchor Shot
- Moves x1.5: Water Pulse
- All Ground moves gain Water type
- Status moves modified (see notes): Aqua Ring
- CHANGE → WATERS: Bounce, Dive, Fly, Sky Drop
- Change msgs: "The battle resurfaced!"
- Seed: Elementalseed → stats [SPEED +1]; effect 0=0; msg "{1} transformed into the Water type!"
### manual
- "Blub blub..."
- Speed ▼ x0.5 unless Water-type or unless Water type or Swift Swim is active.
- Prevents Fire-type attacks
- Prevents generated Fields
- All weather is terminated
- Water-type attacks →x1 vs Water-type types
- Physical damage ▼ x0.5 unless unless attack is Water type or user has Steelworker.
- End of turn Water-type damage when when Pokémon is weak to Water.
- Immunity to field damage when when the abilities Magic Guard or Swift Swim are active.
- Field damage ▲(bad) when when the abilities Magma Armor or Flame Body are active.
- Dive lasts 1 turn
- Water Veil +type cures status
- Activates certain abilities ... Hydration, Schooling, Surge Surfer, Swift Swim, Torrent, and Water Compaction each turn.
- Aqua Ring recovery → 1/8 HP
- Certain abilities restore HP ... Dry Skin, Water Absorb
- Whirlpool damage → 1/6 HP
- Whirlpool +type confuses target
- Ground-type attacks +type Water-type damage
- Water-type attacks ▲ x1.5
- Electric-type attacks ▲ x2
- Electric-type attacks ▲ never miss
- Certain attacks ▲ x1.5 ... Water Pulse
- Certain attacks ▲ x2 ... Anchor Shot
- Becomes Water Surface when when Bounce, Dive, Fly, Sky Drop is used.
- Becomes Murkwater when when Acid Downpour is used, or Sludge Wave is used twice, KOing all non-Poison or Steel type Pokémon.
- Nature Power → Water Pulse
- Camouflage → Water-type
- Secret Power → lowers Attack
- Activates Elemental Seed ... Boosts Speed and applies Soak to the user.

## [23] CAVE — Cave
### data
- Intro: The cave echoes dully...
- Nature Power: Rock Tomb | Secret Power anim: Rock Wrecker | Camouflage/Mimicry: Rock
- Type x1.5: Rock
- Type x0.5: Flying
- Type-boost conditions: Flying: `!self.isContactMove?`
- Moves x1.5: Rock Tomb
- Status moves modified (see notes): Stealth Rock
- CHANGE → CRYSTALC: Diamond Storm, Power Gem
- CHANGE → CAVE: Bulldoze, Continent Crush, Earthquake, Fissure, Magnitude, Tectonic Rage
- Change msgs: "The cave was littered with crystals!"
- Seed: Telluricseed → stats [DEFENSE +2]; effect 0=0; msg "{1} was hurt by Stealth Rocks!"
### manual
- "The cave echoes dully..."
- Ground-type attacks hit Flying-type/Levitate
- All Pokémon faint when when Bulldoze, Continent Crush, Earthquake, Fissure, Magnitude, Tectonic Rage is used twice. Pokémon using Endure, or having Sturdy may survive with 1 HP from full health. Pokémon with Battle Armor and Shell Armor take 50% damage. Pokémon with Prism Armor or Solid Rock take 33% damage. Pokémon behind protect moves including Wide Guard, or having Bulletproof or Rock Head are immune to the damage.
- Fly and Bounce last 1 turn
- Prevents Sky Drop
- Stealth Rock damage ▲ x2
- Rock-type attacks ▲ x1.5
- Flying-type attacks ▼ x0.5 when when non-contact.
- Sound-based moves ▲ x1.5
- Rock Tomb ▲ x1.5
- Becomes Crystal Cavern when when Diamond Storm, Power Gem is used.
- Nature Power → Rock Tomb
- Camouflage → Rock-type
- Secret Power → Flinches
- Activates Telluric Seed ... Boosts Defense by two stages and damages the user with Stealth Rocks.

## [24] GLITCHF — Glitch Field
### data
- Intro: 1n!taliz3 .b//////attl3
- Nature Power: Metronome | Secret Power anim: Techno Blast | Camouflage/Mimicry: Qmarks
- Type x1.2: Psychic
- Accuracy 90: Blizzard
- Seed: Syntheticseed → stats [DEFENSE +1]; effect 0=0; msg "{1}.TYPE = (PBTypes::QMARKS)"
### manual
- "1n!taliz3 .b//////attl3"
- Type attacks → always Physical ... Normal, Fighting, Poison, Ground, Flying, Bug, Rock, Ghost.
- Type attacks → always Special ... Fire, Water, Grass, Electric, Ice, Psychic, Dragon.
- Special attacks calculate on ... Special Attacks, for both the attacker and defender, calculate off of the higher stat between Sp.Atk and Sp.Def.
- Dark-type, Steel-type, Fairy-type moves → Normal-type
- The type chart is altered ... Dragon always deals neutral damage. Bug now hits Poison types super-effectively. Ice now hits Fire types neutrally. Ghost now cannot hit Psychic types. Poison now hits Bug types super-effectively.
- Critical hit chance ▲ when ... Critical hit rate increases by one stage if attacker is faster than the target.
- Rage locks user into itself
- Recharge moves don't have recharge when the move knocks out a Pokémon
- Psychic-type attacks ▲ x1.2
- Blizzard's Accuracy → 90
- Metronome selects attacks selects attacks of 70 base power or higher only.
- Self-KO attacks halve Defense
- RKS System → ???-type
- Created when ... Created for 5 turns when Conversion and Conversion2 are used in succession.
- Nature Power → Metronome
- Camouflage → ???-type
- Secret Power → lowers Speed
- Activates Synthetic Seed ... Boosts Defense and makes user ??? type.

## [25] CRYSTALC — Crystal Cavern
### data
- Intro: The cave is littered with crystals.
- Nature Power: Power Gem | Secret Power anim: Power Gem | Camouflage/Mimicry: Qmarks
- Type x1.5: Dragon, Rock
- Moves x1.5: Ancient Power, Diamond Storm, Judgment, Multi-Attack, Power Gem, Rock Climb, Rock Smash, Rock Tomb, Strength
- Moves x1.3: Aurora Beam, Dazzling Gleam, Doom Desire, Flash Cannon, Luster Purge, M. M. Maelstrom, Mirror Shot, Moongeist Beam, Photon Geyser, Signal Beam, Techno Blast
- Status moves modified (see notes): Rock Polish, Stealth Rock
- CHANGE → CAVE: Bulldoze, Earthquake, Fissure, Magnitude, Tectonic Rage
- CHANGE → DARKCRYSTALC: Burning Light, Dark Pulse, Dark Void, Night Daze
- Change msgs: "The crystals were broken up!" | "The crystals' light was warped by the darkness!" | "The crystals' light was consumed!"
- Seed: Magicalseed → stats [SPATK +1]; effect MagicCoat=True; msg "{1} shrouded itself with Magic Coat!"
### manual
- "The cave is littered with crystals."
- Rock-type attacks ▲ x1.5
- Certain attacks ▲ x1.5 Ancient Power, Diamond Storm, Judgment, Multi-Attack, Power Gem, Rock Climb, Rock Smash, Rock Tomb, Strength
- Certain attacks +type extra type Rock Type attacks, as well as Judgment, Multi-Attack, Rock Climb, and Strength gain a sequential typing between Fire, Water, Grass and Psychic in that repeating pattern.
- Dragon-type attacks ▲ x1.5
- Certain attacks ▲ x1.3 Aurora Beam, Dazzling Gleam, Doom Desire, Flash Cannon, Luster Purge, M. M. Maelstrom, Mirror Shot, Moongeist Beam, Photon Geyser, Signal Beam, Techno Blast
- Becomes Dark Crystal when when Burning Light, Dark Pulse, Dark Void, Night Daze is used.
- Becomes a Cave when when Bulldoze, Earthquake, Fissure, Magnitude, Tectonic Rage is used.
- Rock Polish +type boosts Atk/Sp.Atk
- Stealth Rock +type random damage Stealth Rock randomly applies either Fire, Water, Grass or Psychic type damage.
- Enables Aurora Veil
- Prism Armor lowers damage x0.75
- Nature Power → Power Gem
- Camouflage → random type ... Camouflage may choose one of Fire, Water, Grass or Psychic typings.
- Secret Power → random status ... Secret Power may choose a random status between Burn, Freeze, Sleep or Confusion.
- Activates Magical Seed ... Boosts Sp.Atk and applies Magic Coat to the user.

## [26] MURKWATERS — Murkwater Surface
### data
- Intro: The water is tainted...
- Nature Power: Sludge Wave | Secret Power anim: Sludge Bomb | Camouflage/Mimicry: Poison
- Type x1.5: Poison, Water
- Type x1.3: Electric
- Type-boost conditions: Electric: `!opponent.isAirborne?`
- Moves x1.5: Acid, Acid Spray, Brine, Mud Bomb, Mud Shot, Mud-Slap, Smack Down, Thousand Waves
- Gain Poison type: Mud Bomb, Mud Shot, Mud-Slap, Smack Down, Thousand Waves
- Gain Water type: Sludge Wave
- All Water moves gain Poison type
- Status moves modified (see notes): Acid Armor
- CHANGE → WATERS: Whirlpool
- CHANGE → ICYF: Blizzard, Glaciate, Subzero Slammer
- Change msgs: "The maelstrom flushed out the poison!" | "The toxic water froze over!"
- Seed: Elementalseed → stats [SPEED +1]; effect AquaRing=True; msg "{1} surrounded itself with a veil of water!"
### manual
- "The water is tainted..."
- Speed ▼ x0.75 unless Water-type or unless Water type, airborne, or the abilities Surge Surfer or Swift Swim are active.
- End of turn Poison-type damage when when grounded, and not Poison or Steel type.
- Immunity to field damage when when one of the following abilities is active: Immunity, Magic Guard, Poison Heal, Toxic Boost, Wonder Guard
- Field damage ▲(bad) when when Pokémon is underwater (x4) or has one of the following abilities (x2): Dry Skin, Flame Body, Magma Armor, Water Absorb
- Dry Skin restores HP when when grounded and Poison type.
- Water Absorb restores HP when when grounded and Poison type.
- Activates certain abilities when when grounded, activates Merciless, Poison Heal, Schooling, Surge Surfer, Swift Swim, Toxic Boost and Water Compaction each turn.
- Prevents Ground-type attacks
- Spikes/Toxic Spikes terminated
- Shore Up activates Water Compaction
- Water-type attacks ▲ x1.5
- Water-type attacks +type Poison-type
- Poison-type attacks ▲ x1.5
- Electric-type attacks ▲ x1.3 when when opponent is grounded.
- Sludge Wave +type Water-type
- Certain attacks → Water-type / Poison-type Mud Bomb, Mud Shot, Mud-Slap, Thousand Waves
- Certain attacks +type Poison-type ... Smack Down
- Certain attacks ▲ x1.5 ... Acid, Acid Spray, Brine, Mud Bomb, Mud Shot, Mud-Slap, Smack Down, Thousand Waves
- Gooey effect ▲ x2
- Stench chance ▲ x2
- Acid Armor's effect ▲ x2
- Activates Venoshock
- Activates Venom Drench
- Liquid Ooze ▲ x2
- Becomes Water Surface when when Whirlpool is used.
- Becomes Icy Field when when Blizzard, Glaciate, Subzero Slammer is used.
- Nature Power → Sludge Wave
- Camouflage → Poison-type
- Secret Power → poison(status)
- Activates Elemental Seed ... Boosts Speed and applies Aqua Ring, but poisons the user.

## [27] MOUNTAIN — Mountain
### data
- Intro: ['Adieu to disappointment and spleen,', 'What are men to rocks and mountains?']
- Nature Power: Rock Slide | Secret Power anim: Rock Blast | Camouflage/Mimicry: Rock
- Type x1.5: Flying, Rock
- Moves x1.5: Avalanche, Circle Throw, Eruption, Fairy Wind, Hyper Voice, Icy Wind, Ominous Wind, Razor Wind, Silver Wind, Storm Throw, Thunder, Twister, Vital Throw
- Status moves modified (see notes): Sunny Day, Tailwind
- CHANGE → SNOWYM: Blizzard, Glaciate, Subzero Slammer
- Change msgs: "The mountain was covered in snow!"
- Seed: Telluricseed → stats [ATTACK +2, ACCURACY -1]; effect 0=0; msg ""
### manual
- "Adieu to disappointment and spleen," What are men to rocks and mountains?
- Tailwind lasts 5 turns
- Tailwind +type Strong Winds
- Certain attacks ▲ x1.5 ... Avalanche, Circle Throw, Eruption, Fairy Wind, Hyper Voice, Icy Wind, Ominous Wind, Razor Wind, Silver Wind, Storm Throw, Thunder, Twister, Vital Throw
- Certain attacks +type ▲ x1.5 when when Strong Winds are active, further boosts all Special Flying attacks, as well as Fairy Wind, Gust, Icy Wind, Ominous Wind, Razor Wind, Silver Wind, Twister
- Sun lasts 8 turns
- Thunder never misses
- Becomes Snowy Mountain when when Blizzard, Glaciate, Subzero Slammer is used, or it has been hailing for 3 turns.
- Flying-type attacks ▲ x1.5
- Rock-type attacks ▲ x1.5
- Long Reach damage ▲ x1.5
- Activates Gale Wings when windy
- Aerilate power boost → x1.5
- Nature Power → Rock Slide
- Camouflage → Rock-type
- Secret Power → Flinches
- Activates Telluric Seed ... Boosts Attack by two stages, but lowers Accuracy.

## [28] SNOWYM — Snowy Mountain
### data
- Intro: The snow glows white on the mountain...
- Nature Power: Avalanche | Secret Power anim: Ice Ball | Camouflage/Mimicry: Ice
- Type x1.5: Flying, Ice, Rock
- Type x0.5: Fire
- Moves x2.0: Icy Wind
- Moves x1.5: Avalanche, Circle Throw, Fairy Wind, Glaciate, Hyper Voice, Ominous Wind, Powder Snow, Razor Wind, Silver Wind, Storm Throw, Twister, Vital Throw
- Moves x0.5: Scald, Steam Eruption
- All Rock moves gain Ice type
- Status moves modified (see notes): Hail, Sunny Day, Tailwind
- CHANGE → MOUNTAIN: Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot
- Change msgs: "The snow melted away!"
- Seed: Telluricseed → stats [SPATK +2, ACCURACY -1]; effect 0=0; msg ""
### manual
- "The snow glows white on the mountain"
- Tailwind lasts 5 turns
- Tailwind +type Strong Winds
- Rock-type attacks +type Ice-type
- Ice-type attacks ▲ x1.5
- Rock-type attacks ▲ x1.5
- Flying-type attacks ▲ x1.5
- Fire-type attacks ▼ x0.5
- Ice-type Pokémon's Defense ▲ x1.5 when when Hail is up
- Certain attacks ▲ x1.5 ... Avalanche, Circle Throw, Fairy Wind, Glaciate, Hyper Voice, Ominous Wind, Powder Snow, Razor Wind, Silver Wind, Storm Throw, Twister, Vital Throw
- Certain attacks +type ▲ x1.5 when when Strong Winds are active, further boosts all Special Flying attacks, as well as Fairy Wind, Gust, Icy Wind, Ominous Wind, Razor Wind, Silver Wind, Twister
- Certain attacks ▼ x0.5 ... Scald, Steam Eruption
- Sun and Hail last for 8 turns
- Thunder never misses
- Activates certain abilities ... Ice Body, Slush Rush, Snow Cloak
- Refrigerate power boost → x1.5
- Becomes a Mountain when when Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot is used
- Activates Gale Wings when windy
- Enables Aurora Veil
- Long Reach damage ▲ x1.5
- Aerilate power boost → x1.5
- Nature Power → Avalanche
- Camouflage → Ice-type
- Secret Power → freeze
- Activates Telluric Seed ... Boosts Sp.Atk by two stages, but lowers Accuracy.

## [29] HOLYF — Holy Field
### data
- Intro: Benedictus Sanctus Spiritus...
- Nature Power: Judgment | Secret Power anim: Dazzling Gleam | Camouflage/Mimicry: Normal
- Type x1.5: Fairy, Normal
- Type x1.2: Dragon, Psychic
- Type x0.5: Dark, Ghost
- Type-boost conditions: Fairy: `self.pbIsSpecial?(type)`; Normal: `self.pbIsSpecial?(type)`; Dark: `self.pbIsSpecial?(type)`
- Moves x1.5: Ancient Power, Extreme Speed, Judgment, Magical Leaf, Mystical Fire, Return, Sacred Fire, Sacred Sword
- Moves x1.3: Aeroblast, Crush Grip, Diamond Storm, Doom Desire, Dragon Ascent, Fleur Cannon, Gen. Supernova, Hyperspace Hole, Land's Wrath, Luster Purge, M. M. Maelstrom, Mist Ball, Moongeist Beam, Origin Pulse, Precipice Blades, Prismatic Laser, Psycho Boost, Psystrike, Relic Song, Roar of Time, S. Sunraze Smash, Secret Sword, Spacial Rend, Sunsteel Strike
- Status moves modified (see notes): Cosmic Power, Miracle Eye, Nature Madness, Wish
- CHANGE → NONE(base field): Burning Light
- Change msgs: "The holy light was consumed!"
- Seed: Magicalseed → stats [SPATK +1]; effect MagicCoat=True; msg "{1} shrouded itself with Magic Coat!"
### manual
- "Benedictus Sanctus Spiritus..."
- The type chart is altered ... Normal type attacks hit Ghost and Dark type Pokémon for super-effective damage.
- Ghost-type attacks ▼ x0.5
- Certain attacks ▼ x0.5 ... All special Dark type moves
- Special Fairy-type attacks ▲ x1.5
- Certain attacks ▲ x1.5 ... Ancient Power, Extreme Speed, Judgment, Magical Leaf, Mystical Fire, Return, Sacred Fire, Sacred Sword
- Certain attacks ▲ x1.3 ... Aeroblast, Crush Grip, Diamond Storm, Doom Desire, Dragon Ascent, Fleur Cannon, Gen. Supernova, Hyperspace Hole, Land's Wrath, Luster Purge, M. M. Maelstrom, Mist Ball, Moongeist Beam, Origin Pulse, Precipice Blades, Prismatic Laser, Psycho Boost, Psystrike, Relic Song, Roar of Time, S. Sunraze Smash, Secret Sword, Spacial Rend, Sunsteel Strike
- Psychic-type attacks ▲ x1.2
- Dragon-type attacks ▲ x1.2
- Special Normal-type attacks ▲ x1.5
- Justified effect ▲ x2
- Wish recovery → 75 % HP
- Prevents Cursed Body
- Lifts Curse each turn
- Allies avoid damage from . . ...allies avoid damage from their partner's moves
- Miracle Eye +type boost Sp.Atk
- Cosmic Power's effect ▲
- Nature's Madness damage → 75 % HP
- RKS System → Dark-type
- Destroyed by these moves ... Burning Light
- Nature Power → Judgment
- Camouflage → Normal-type
- Secret Power → lowers Sp.Atk
- Activates Magical Seed ... Boosts Sp.Atk and applies Magic Coat to the user.

## [30] MIRRORA — Mirror Arena
### data
- Intro: ['Mirror, mirror, on the field,', 'Who shall this fractured power wield?']
- Nature Power: Mirror Shot | Secret Power anim: Mirror Shot | Camouflage/Mimicry: Steel
- Moves x2.0: Mirror Shot
- Moves x1.5: Aurora Beam, Burning Light, Dazzling Gleam, Doom Desire, Flash Cannon, Luster Purge, Photon Geyser, Prismatic Laser, Signal Beam, Techno Blast
- Status moves modified (see notes): Aurora Veil, Double Team, Flash, Light Screen, Mirror Coat, Mirror Move, Reflect
- CHANGE → NONE(base field): Boomburst, Bulldoze, Earthquake, Explosion, Fissure, Hyper Voice, Magnitude, Self-Destruct, Tectonic Rage
- Seed: Syntheticseed → stats [EVASION +1]; effect MagicCoat=True; msg "{1} shrouded itself with Magic Coat!"
### manual
- "Mirror, Mirror on the field ... Who shalt this fractured power wield?
- Critical hit rate ▲ when ... The critical hit rate is increased by one stage for each of the attacker's Evasion/Accuracy buffs, and the target's Evasion/Accuracy de-buffs.
- Certain attacks reflect when ... Special, non-contact, single target attacks will always hit targets with raised evasion.
- Certain reflected attacks ▲ x2 ... Bubble Beam, Charge Beam, Fleur Cannon, Hyper Beam, Ice Beam, Origin Pulse, Moongeist Beam, Psybeam, Solar Beam, and Tri-Attack are boosted when hitting targets with raised evasion.
- Missing physical moves recoil ... Missing a physical contact attack causes 1/4 Max HP recoil damage. Also Evasion is lowered by one stage if it's raised.
- Certain abilities boost Evasion ... Color Change, Illusion, Magic Bounce, Sand Veil, Snow Cloak, and Tangled Feet boost Evasion when switched in.
- Certain items boost Evasion ... Bright Powder and Lax Incense boost Evasion when switched in.
- Certain attacks ▲ x1.5 and and never miss: Aurora Beam, Burning Light, Dazzling Gleam, Doom Desire, Flash Cannon, Luster Purge, Photon Geyser, Prismatic Laser, Signal Beam, Techno Blast
- Illuminate +type lowers Accuracy ... Illuminate lowers opponents' Accuracy on switch-in
- Certain abilities boost Accuracy ... Keen Eye, Compound Eyes raises Accuracy on switch-in. They additionally apply Laser Focus
- Certain items boost Accuracy ... Wide Lens, Zoom Lens raises Accuracy on switch-in. They additionally apply Laser Focus
- Magic Bounce +type Evasion ▲ when when an attack is successfully bounced.
- Screens last 8 turns
- Enables Aurora Veil
- Screens +type Evasion ▲
- Mirror Coat +type boosts stats ... Mirror Coat increases Evasion, Defense and Sp.Def on successful use.
- Mirror Move +type boosts stats ... Mirror Move increases Accuracy, Attack and Sp.Atk on successful use.
- Mirror Shot ▲ x2
- Mirror Shot effect chance → 100
- Certain stat moves' effect ▲ ... Double Team, Flash
- Terminated by these moves and and damages all active Pokémon for 1/2 their max HP: Boomburst, Bulldoze, Earthquake, Explosion, Fissure, Hyper Voice, Magnitude, Self-Destruct, Tectonic Rage.\nPokémon behind protect moves including Wide Guard, or having Shell Armor or Battle Armor are immune to the shatter damage.
- Nature Power → Mirror Shot
- Camouflage → Steel-type
- Secret Power → lowers Evasion
- Activates Synthetic Seed ... Boosts Evasion one stage and applies Magic Coat.

## [31] FAIRYTALEF — Fairy Tale Field
### data
- Intro: Once upon a time...
- Nature Power: Secret Sword | Secret Power anim: Slash | Camouflage/Mimicry: Fairy
- Type x2.0: Dragon
- Type x1.5: Fairy, Steel
- Moves x2.0: Draining Kiss
- Moves x1.5: Air Slash, Ancient Power, Fleur Cannon, Leaf Blade, M. M. Maelstrom, Magical Leaf, Moongeist Beam, Mystical Fire, Night Slash, Ocean Operetta, Psycho Cut, Relic Song, Smart Strike, Solar Blade, Sparkling Aria
- All Fire moves gain Dragon type
- Status moves modified (see notes): Acid Armor, Crafty Shield, Floral Healing, Flower Shield, Forest's Curse, Healing Wish, King's Shield, Miracle Eye, Noble Roar, Spiky Shield, Swords Dance, Wish
- Seed: Magicalseed → stats []; effect KingsShield=True; msg "The Magical Seed shielded {1} against damage!"
### manual
- "Once upon a time..."
- Fairy-type attacks ▲ x1.5
- Steel-type attacks ▲ x1.5
- Dragon-type attacks ▲ x2
- Steel-type attacks → x2 vs Dragon-type
- Fire-type attacks ▲ +type Dragon-type
- Certain abilities +type Defense ▲ ... Battle Armor, Power of Alchemy and Shell Armor boost Defense upon switching in.
- Certain abilities +type Sp.Def ▲ ... Magic Guard, Magic Bounce and Power of Alchemy boost Sp.Def upon switching in.
- Magician +type Sp.Atk ▲ when ... Magician boosts Sp.Atk upon switching in.
- Fairy Aura +type moves never miss
- Activates Marvel Scale
- Certain attacks → Steel-type Cut, Sacred Sword, Secret Sword, Slash
- Stance Change alters stats ... Pokémon with Stance Change boost and lower Attack and Defense one stage when switching between respective forms.
- Certain attacks ▲ x1.5 ... Air Slash, Ancient Power, Fleur Cannon, Leaf Blade, M. M. Maelstrom, Magical Leaf, Moongeist Beam, Mystical Fire, Night Slash, Ocean Operetta, Psycho Cut, Relic Song, Smart Strike, Solar Blade, Sparkling Aria
- Draining Kiss ▲ x2
- Certain attacks +type boost stats ... Crafty Shield and Flower Shield additionally boost the user's Defense and Sp.Def one stage.
- Certain attacks +type protection ... King's Shield additionally protects from non-damaging moves.
- King's Shield +type lowers Sp.Atk
- Certain stat moves' effect ▲ ... Acid Armor, Noble Roar, Swords Dance
- Certain attacks +type cure Sleep Draining Kiss, Sweet Kiss
- Wish recovery → 75 % HP
- Healing Wish +type boosts stats ... Healing Wish boosts recipient's Attack and Special Attack
- Miracle Eye +type boost Sp.Atk
- Forest's Curse +type Curse effect
- Floral Healing recovery → 100 %
- Queenly Majesty damage ▲ x1.5
- Soul Heart also boosts Sp.Def
- Nature Power → Secret Sword
- Camouflage → Fairy-type
- Secret Power → sleep
- Activates Magical Seed ... Applies King's Shield to the user.

## [32] DRAGONSD — Dragon's Den
### data
- Intro: If you wish to slay a dragon...
- Nature Power: Dragon Pulse | Secret Power anim: Dragon Pulse | Camouflage/Mimicry: Dragon
- Type x1.5: Dragon, Fire
- Type x0.5: Ice, Water
- Moves x2.0: Continent Crush, Dragon Ascent, Pay Day, Smack Down, Tectonic Rage, Thousand Arrows
- Moves x1.5: Lava Plume, Magma Storm, Mega Kick
- Gain Fire type: Continent Crush, Smack Down, Tectonic Rage, Thousand Arrows
- Status moves modified (see notes): Dragon Dance, Noble Roar
- CHANGE → CAVE: Glaciate, Hydro Vortex, Ocean Operetta, Subzero Slammer
- Change msgs: "The lava was frozen solid!" | "The lava solidified!"
- Seed: Elementalseed → stats [SPATK +1]; effect FlashFire=True; msg "{1} raised its Fire power!"
### manual
- "If you wish to slay a dragon..."
- Dragon-type attacks ▲ x1.5
- Fire-type attacks ▲ x1.5
- Water-type attacks ▼ x0.5
- Ice-type attacks ▼ x0.5
- Dragon-type Pokémon's defenses ▲ x1.3
- Activates Marvel Scale
- Multiscale +type protection Multiscale additionally annulls user's Dragon type's weaknesses at all times
- Shed Skin +type recovery and ... Shed Skin heals 25% on activation, and boosts Speed and Sp.Atk by one stage each while lowering Defense and Sp.Def one stage each. \nAlways activates.
- Certain attacks +type Fire-type ... Continent Crush, Smack Down, Tectonic Rage, Thousand Arrows
- Certain attacks ▲ x2 ... Continent Crush, Dragon Ascent, Pay Day, Smack Down, Tectonic Rage, Thousand Arrows
- Certain attacks ▲ x1.5 ... Lava Plume, Magma Storm, Mega Kick
- Magma Storm damage → 1/6 HP
- Magma Armor +type boosts stats ... Magma Armor boosts Defense and Sp.Def upon switching in.
- Magma Armor +type Fire-type immunity
- Certain stat moves' effect ▲ ... Dragon Dance, Noble Roar
- Becomes a Cave when when Glaciate, Hydro Vortex, Oceanic Operetta, or Subzero Slammer is used, or when Muddy Water, Sparkling Aria, or Surf is used twice.
- Nature Power → Dragon Pulse
- Camouflage → Dragon-type
- Secret Power → burn
- Activates Elemental Seed ... Boosts Sp.Atk and applies Flash Fire's power boost to the user.

## [33] FLOWERGARDENF — Flower Garden Field
### data
- Intro: Seeds line the field.
- Nature Power: Growth | Secret Power anim: Sweet Scent | Camouflage/Mimicry: Grass
- Status moves modified (see notes): Floral Healing, Flower Shield, Growth, Ingrain, Rain Dance, Rototiller, Sunny Day, Sweet Scent, Water Sport
- CHANGE → BURNINGF: Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot (cond: `ignitecheck && @battle.field.counter > 1`)
- Change msgs: "The garden caught fire!"
- Seed: Syntheticseed → stats [SPDEF +1]; effect Ingrain=True; msg "{1} planted its roots!"
### manual
- "Seeds line the field."
- Grows from Stage 1 to Stage 5
- Certain attacks grow 1 Stage ... Bloom Doom, Growth, Rain Dance, Rototiller, Sunny Day, Water Sport, Ingrain.\nAdditionally, these abilities grow the field one stage on switch-in: Drizzle, Drought, Flower Gift, Flower Veil
- Cut and X-Scissor reduces Stage by 1 [<c=ffb347>2+]
- Activates certain abilities ... Flower Gift, Swarm [<c=7CFC00>1+]
- Rototiller's effect ▲ [<c=7CFC00>1+]
- Rototiller +type boosts stats ... Rototiller additionally boosts user's Attack and Sp.Atk. [<c=7CFC00>1+]
- Growth's effect ▲ ... Increases (x2,x3) at Stages (1,3) [<c=7CFC00>1,<c=ec5800>3]
- Cut ▲ x1.5 [<c=ffb347>2+]
- Cut → x2 vs Grass-type [<c=ffb347>2+]
- Activates certain abilities ... Harvest, Leaf Guard [<c=ffb347>2+]
- Flower Shield +type boosts stats ... Flower Shield additionally boosts Sp.Def and the user's Defense and Sp.Def. [<c=ffb347>2+]
- Flower Veil +type reduces damage ... Flower Veil passively reduces damage x0.75 to its user and allied Grass types. [<c=ec5800>3+]
- Becomes a Burning Field when ... Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inf. Overdrive, Lava Plume, Mind Blown, Searing Shot is used in the absence of Rain or Water Sport. [<c=ec5800>3+]
- Sweet Scent +type lowers defenses [<c=ec5800>3+]
- Fire-type attacks ▲ x1.5 [<c=ec5800>3+]
- Flower Shield's effect ▲ [<c=ec5800>3+]
- Activates Chlorophyll [<c=ff2800>4+]
- Grass type's weaknesses are annulled [<c=ff2800>4+]
- Certain attacks hit all opposing Petal Blizzard, Petal Dance, and all Powder moves hit both opposing Pokémon at Stage 5. [<c=ff00ff>5]
- Grass-type attacks ▲ Grass type attacks increase in base power (x1.1,x1.3,x1.5,x2) at Stages (2,3,4,5). [<c=ffb347>2-<c=ff00ff>5]
- Bug-type attacks ▲ ... Bug type attacks increase in base power (x1.5,x2) at Stages (2,4). [<c=ffb347>2,<c=ff2800>4]
- Swarm effect ▲ ... Swarm increases Bug type attacks' power by (x1.8,x2) at Stages (3,5). [<c=ec5800>3,<c=ff00ff>5]
- Activates Overgrow when ... Overgrow activates at (66% HP, Any HP amount) at Stages (2,3). [<c=ffb347>2,<c=ec5800>3]
- Overgrow's effect ▲ ... Overgrow increases Grass type attacks' power by (x1.8,x2) at Stages (4,5). [<c=ff2800>4,<c=ff00ff>5]
- Sweet Scent's effect ▲ ... At Stage 3 and later, Sweet Scent additionally lowers Defense and Sp.Def. Sweet Scent's effect increases (x2,x3) at Stages (4,5). [<c=ff2800>4,<c=ff00ff>5]
- Ingrain's effect ▲ ... Ingrain's effect increases (x2,x4) at Stages (2,4). [<c=ffb347>2,<c=ff2800>4]
- Certain attacks ▲ ... Fleur Cannon, Petal Blizzard and Petal Dance increase (x1.2,x1.5) at Stages (3,4). [<c=ec5800>3,<c=ff2800>4]
- Infestation damage ▲ ... Infestation deals (1/6,1/4,1/3) Max HP Damage per turn at Stages (3,4,5). [<c=ec5800>3-<c=ff00ff>5]
- Floral Healing recovery → 100 % [<c=ec5800>3+]
- Acid Downpour resets to Stage 1
- Nature Power → Growth [<c=7CFC00>1-<c=ff2800>4]
- Nature Power → Petal Blizzard [<c=ff00ff>5]
- Camouflage → Grass-type
- Secret Power → lowers stats ... Secret Power may lower Evasion. At Stage 3 and later additionally lowers Defense and Sp.Def. At Stage 5 this effect increases x2. [<c=7CFC00>1 <c=ec5800>3 <c=ff00ff>5]
- Activates Synthetic Seed ... Boosts Sp.Def and applies Ingrain to the user, makes the field grow 1 stage.

## [34] STARLIGHTA — Starlight Arena
### data
- Intro: Starlight fills the battlefield.
- Nature Power: Moonblast | Secret Power anim: Swift | Camouflage/Mimicry: Dark
- Type x1.5: Dark, Psychic
- Type x1.3: Fairy
- Moves x4.0: Doom Desire
- Moves x2.0: Black Hole, Comet Punch, Draco Meteor, Hyperspace Hole, HyperspaceFury, M. M. Maelstrom, Meteor Mash, Moongeist Beam, S. Sunraze Smash, Spacial Rend, Sunsteel Strike, Swift
- Moves x1.5: Aurora Beam, Dazzling Gleam, Flash Cannon, Luster Purge, Mirror Shot, Moonblast, Photon Geyser, Signal Beam, Solar Beam, Techno Blast
- Gain Fire type: Doom Desire
- All Dark moves gain Fairy type
- Status moves modified (see notes): Cosmic Power, Flash, Healing Wish, Lunar Dance, Moonlight, Wish
- CHANGE → NONE(base field): Burning Light
- Change msgs: "The cosmic light was consumed!"
- Seed: Magicalseed → stats [SPATK +1]; effect Wish=2; msg "A wish was made for {1}!"
### manual
- "Starlight fills the battlefield."
- Destroyed when when Light That Burns The Sky is used.
- Weather stops boosts when weather is up, the field power boosts to moves and types isn't applied
- Psychic-type attacks ▲ x1.5
- Fairy-type attacks ▲ x1.3
- Dark-type attacks ▲ x1.5
- Dark-type attacks +type Fairy-type
- Victory Star +type boosts damage
- Geomancy → no charge turn
- Activates Marvel Scale
- Illuminate +type boosts stats ... Illuminate boosts Sp.Atk upon switching in.
- Certain attacks ▲ x1.5 ... Aurora Beam, Dazzling Gleam, Flash Cannon, Luster Purge, Mirror Shot, Moonblast, Photon Geyser, Signal Beam, Solar Beam, Techno Blast
- Certain attacks ▲ x2 ... Black Hole, Comet Punch, Draco Meteor, Hyperspace Hole, HyperspaceFury, M. M. Maelstrom, Meteor Mash, Moongeist Beam, S. Sunraze Smash, Spacial Rend, Sunsteel Strike, Swift
- Doom Desire ▲ x4 and +type Fire-type
- Certain attacks → Fairy-type ... Solar Beam, Solar Blade
- Certain stat moves' effect ▲ ... Cosmic Power, Flash
- Wish recovery → 75 % HP
- Certain attacks +type boost stats Healing Wish and Lunar Dance boost recipient's Attack and Special Attack
- Moonlight recovery → 75 % HP
- Enables Aurora Veil
- Shadow Shield reduces damage Shadow Shield reduces damage of super effective hits by 0.75
- Nature Power → Moonblast
- Camouflage → Dark-type
- Secret Power → lowers Sp.Def
- Activates Magical Seed ... Boosts Sp.Atk and applies Wish to the user.

## [35] NEWW — New World
### data
- Intro: ['From darkness, from stardust,', 'From memories of eons past and visions yet to come...']
- Nature Power: Spacial Rend | Secret Power anim: Roar of Time | Camouflage/Mimicry: Qmarks
- Type x1.5: Dark
- Moves x4.0: Doom Desire
- Moves x2.0: Ancient Power, Black Hole, Comet Punch, Draco Meteor, Future Sight, Hyperspace Hole, HyperspaceFury, Meteor Mash, Moonblast, Spacial Rend, Swift, Vacuum Wave
- Moves x1.5: 7-Star Strike, Aeroblast, Aurora Beam, Blue Flare, Bolt Strike, Continent Crush, Core Enforcer, Crush Grip, Dazzling Gleam, Diamond Storm, Dragon Ascent, Earth Power, Eruption, Flash Cannon, Fleur Cannon, Freeze Shock, Fusion Bolt, Fusion Flare, Gen. Supernova, Ice Burn, Judgment, Land's Wrath, Luster Purge, M. M. Maelstrom, Magma Storm, Mind Blown, Mirror Shot, Mist Ball, Moongeist Beam, Multi-Attack, Oblivion Wing, Origin Pulse, Photon Geyser, Plasma Fists, Power Gem, Precipice Blades, Prismatic Laser, Psycho Boost, Psystrike, Relic Song, Roar of Time, S. Sunraze Smash, Sacred Fire, Sacred Sword, Searing Shot, Secret Sword, Seed Flare, Shadow Force, Signal Beam, Spectral Thief, Steam Eruption, Sunsteel Strike, Techno Blast, Thousand Arrows, Thousand Waves, V-create
- Moves x0.25: Bulldoze, Earthquake, Magnitude
- Accuracy 85: Dark Void
- Gain Fire type: Doom Desire
- Status moves modified (see notes): Cosmic Power, Dark Void, Flash, Heart Swap, Magic Room, Moonlight, Nature Madness, Trick Room, Wonder Room
- CHANGE → STARLIGHTA: Geomancy, Gravity
- Change msgs: "The world's matter reformed!" | "The world was regenerated!"
- Seed: Magicalseed → stats [ATTACK +1, DEFENSE +1, SPEED +1, SPATK +1, SPDEF +1]; effect HyperBeam=1; msg "{1} must recharge!"
### manual
- "From darkness, from stardust ... From darkness, from stardust, from memories of eons past and visions yet to come...
- Certain abilities change type ... Multitype and RKS System randomly select a new type each turn.
- Speed ▼ x0.75 when grounded
- Airborne Pokémon defenses ▼ x0.9
- Prevents all generated weather
- Prevents generated Fields
- Dark-type attacks ▲ x1.5
- Certain attacks ▲ x1.5 ... 7-Star Strike, Aeroblast, Aurora Beam, Blue Flare, Bolt Strike, Continent Crush, Core Enforcer, Crush Grip, Dazzling Gleam, Diamond Storm, Dragon Ascent, Earth Power, Eruption, Flash Cannon, Fleur Cannon, Freeze Shock, Fusion Bolt, Fusion Flare, Gen. Supernova, Ice Burn, Judgment, Land's Wrath, Luster Purge, M. M. Maelstrom, Magma Storm, Mind Blown, Mirror Shot, Mist Ball, Moongeist Beam, Multi-Attack, Oblivion Wing, Origin Pulse, Photon Geyser, Plasma Fists, Power Gem, Precipice Blades, Prismatic Laser, Psycho Boost, Psystrike, Relic Song, Roar of Time, S. Sunraze Smash, Sacred Fire, Sacred Sword, Searing Shot, Secret Sword, Seed Flare, Shadow Force, Signal Beam, Spectral Thief, Steam Eruption, Sunsteel Strike, Techno Blast, Thousand Arrows, Thousand Waves, V-create
- Certain attacks ▲ x2 ... Ancient Power, Black Hole, Comet Punch, Draco Meteor, Future Sight, Hyperspace Hole, HyperspaceFury, Meteor Mash, Moonblast, Spacial Rend, Swift, Vacuum Wave
- Certain attacks ▼ x0.25 ... Bulldoze, Earthquake, Magnitude
- Fissure fails
- Doom Desire ▲ x4 and +type Fire-type
- Heart Swap +type Pain Split effect
- Victory Star damage ▲ x1.5
- Dark Void's Accuracy → 85
- Lunar Dance +type boosts all stats
- Certain moves last 8 turns ... Trick Room, Magic Room, Wonder Room
- Certain stat moves' effect ▲ ... Cosmic Power, Flash
- Moonlight recovery → 75 % HP
- Becomes a Starlight Arena when when Geomancy is used, or when Gravity is used for as long as Gravity lasts.
- Nature's Madness damage → 75 % HP
- Shadow Shield reduces damage Shadow Shield reduces damage of super effective hits by 0.75
- Nature Power → Spacial Rend
- Camouflage → random type
- Secret Power → lowers all stats
- Activates Magical Seed ... Boosts all stats, but makes the user recharge.

## [36] INVERSEF — Inverse Field
### data
- Intro: !trats elttaB
- Nature Power: Trick Room | Secret Power anim: Confusion | Camouflage/Mimicry: Normal
- Seed: Magicalseed → stats [ATTACK +1, DEFENSE +1, SPEED +1, SPATK +1, SPDEF +1]; effect HyperBeam=1; msg "{1} must recharge!"
### manual
- "!trats elttaB"
- The type chart is inverted
- Created by Topsy Turvy when Created (3 turns) when the attacker does not hold an Everstone.
- Nature Power → Trick Room
- Camouflage → Normal-type
- Secret Power → may confuse
- Activates Magical Seed ... Boosts all stats, but makes the user recharge.

## [37] PSYCHICT — Psychic Terrain
### data
- Intro: The field became mysterious!
- Nature Power: Psychic | Secret Power anim: Psychic | Camouflage/Mimicry: Psychic
- Type x1.5: Psychic
- Type-boost conditions: Electric: `!attacker.isAirborne?`
- Moves x1.5: Aura Sphere, Hex, Magical Leaf, Mind Blown, Moonblast, Mystical Fire
- Accuracy 90: Hypnosis
- Status moves modified (see notes): Calm Mind, Cosmic Power, Gravity, Hypnosis, Kinesis, Magic Room, Meditate, Nasty Plot, Telekinesis, Trick Room, Wonder Room
- Seed: Magicalseed → stats [SPATK +2]; effect 0=0; msg "{1} became confused!"
### manual
- "The field became mysterious!"
- Priority attacks fail when when used on grounded targets.
- Created when when one of these effects is activated: Psychic Surge, Psychic Terrain, Genesis Supernova (5 turns)
- Psychic-type attacks ▲ x1.5 when when attacker is grounded.
- Certain attacks ▲ x1.5 ... Aura Sphere, Hex, Magical Leaf, Mind Blown, Moonblast, Mystical Fire
- Pure Power boost → Sp.Atk
- Anticipation boosts Sp.Atk
- Telepathy boosts Speed x2
- Certain stat moves' effect ▲ ... Calm Mind, Cosmic Power, Kinesis, Meditate, Nasty Plot
- Certain attacks +type boost Sp.Atk ... Mind Reader, Miracle Eye, Psych Up boost Sp.Atk two stages
- Hypnosis accuracy → 90
- Kinesis +type ▲ Attack/Sp.Atk
- Telekinesis +type ▼ drops opponents' Defense/Sp.Def by two stages
- Certain moves' effect → 8 turns Gravity, Magic Room, Trick Room, Wonder Room
- Shattered Psyche +type confuses
- Nature Power → Psychic
- Camouflage → Psychic-type
- Secret Power → may confuse
- Activates Magical Seed ... Boosts Sp.Atk by two stages, but confuses the user.

## [38] INDOORA — None
### data
- Nature Power: Tri Attack | Secret Power anim: Tri Attack | Camouflage/Mimicry: Normal

## [39] INDOORB — None
### data
- Nature Power: Tri Attack | Secret Power anim: Tri Attack | Camouflage/Mimicry: Normal

## [40] INDOORC — None
### data
- Nature Power: Tri Attack | Secret Power anim: Tri Attack | Camouflage/Mimicry: Normal

## [41] CITY — None
### data
- Nature Power: Tri Attack | Secret Power anim: Tri Attack | Camouflage/Mimicry: Normal

## [42] CITYNEW — None
### data
- Nature Power: Tri Attack | Secret Power anim: Tri Attack | Camouflage/Mimicry: Normal
