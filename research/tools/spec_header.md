# Field Effects Research Spec — Pokémon Reborn E19 / Rejuvenation 13 / Desolation Ep6

Research-only spec for a Pokémon Showdown mod. No implementation code. Generated from the actual game scripts (parsed), plus the in-game Field Manual text, plus hand-written engine notes. Machine-friendly transition table: [field_transforms.md](field_transforms.md).

## 0. Sources & confidence

| Game | Version used | Source files | Notes |
|---|---|---|---|
| Reborn | E19 patch 19.17 (official `rebornremote/patch.zip`) | `Scripts/PBFieldEffects.rb` (data), `PBFieldNotes.rb` (in-game Field Manual), `PBStuff.rb` (move lists), `PokeBattle_Field.rb`, `PokeBattle_Battle.rb` | Highest confidence. 19.5 deltas (if any) not verified. |
| Rejuvenation | v13.x vanilla scripts (`fieldtxt.rb`, `Field.rb`, `Battle_Field.rb`, `Battle*.rb`) via GitHub mirror (initial commit, pre-mod) | + v11 in-game manual text (older) | Data high confidence; Rejuv v13 ships no manual text, so hardcoded effects come from code reading (see `rejuv_hardcoded.md`) and v11 manual (marked; may be outdated). |
| Desolation | Ep6 official patch (`rebornremote/Desolation6/patch.zip`) | `fieldtxt.rb`, `FieldNoteCompiler.rb` (in-game manual), `Field.rb`, `Battle_Field.rb` | High confidence. Wiki: 28 fields actually used in Ep6 maps; all defined fields listed here. |

Raw files: `research/raw/` (reborn_patch, deso_patch, rejuv/vanilla, rejuv_re1_manual.txt). Parsed JSON: `reborn_fields.json`, `rejuv_fields.json`, `deso_fields.json`. Full un-diffed per-game digests: `digest_reborn.md`, `digest_rejuv.md`, `digest_deso.md`.

## 1. How to read entries

- Heading: `` `id` — Display name(s) [games] ``. Ids are canonical/shared across games (lowercase). Staged fields use suffixes: `flowergarden1..5`, `concertvenue1..4`, `darkness1..3`.
- **Reborn E19 block** = full data + *Manual/hardcoded* bullets (in-game manual lines, dedup'd against the data; ▲ boost, ▼ nerf, `+` = "plus"/adds, `[3+]` = stage requirement).
- **Rejuvenation / Desolation blocks** for shared fields = **only differences vs Reborn E19 data** ("(identical data)" if none). Hardcoded behaviour assumed same as Reborn unless noted. Fields unique to a game get full data.
- Data line legend:
  - `Type xN: T` — all moves of type T deal ×N (subject to `Type-boost conditions`, raw engine code: `attacker.isAirborne?` etc.).
  - `Moves xN` — move-specific multiplier; **`FAIL`** = move fails/disabled (multiplier 0).
  - `Accuracy N` — move base accuracy becomes N (`never-miss` = 0/always hits).
  - `Gain X type: moves` — Reborn "type addition": move also deals type X (dual-type damage calc like Flying Press).
  - `All A moves gain X type` (Rejuv/Deso `typeAddOns`) — every move of type A gains type X.
  - `Status moves modified` — listed status moves have a boosted/changed effect (details in manual bullets).
  - `Seed: <seed> → stats [...]; effect E=V` — what the field's seed does when the holder enters (stat boosts + effect, e.g. `MultiTurnAttack=FIRESPIN` traps user in Fire Spin, `Ingrain=true`).
  - `CHANGE → \`id\`: moves (cond)` — field transformation (see §3).
  - `Move effect \`code\`` / `Change effect \`code\`` — Ruby snippet run when move used (counters etc.).
  - `Overlay` (Rejuv/Deso terrains) — reduced effect set used when this terrain is laid temporarily ON TOP of another field (e.g. Grassy Terrain move used on Forest).
  - Nature Power / Secret Power anim / Camouflage (Mimicry) type per field are on line 2. Secret Power's secondary effect is in the manual bullets.

## 2. Engine-level mechanics (Reborn E19 code; Rejuv/Deso share the same framework unless noted)

**Field stack / backup**
- Field state is a *layer stack*: `layer[0]` = map's base field (or Water Surface when surfing, Murkwater on puddles; can be forced by a game variable). `backup` = layer below the top.
- `setField(new)` (permanent change) pops current top and pushes new. `setField(new, temp)` (temporary: terrain moves, Mist, Ion Deluge, Topsy-Turvy, Gravity, sun-based) pushes on top and records `overlay` index; when `duration` expires, `endTempField` pops back to the previous field. `breakField` (FIELDCHANGE → 0 / `none`) pops the top: returns to the field underneath, else **no field** (or the map-graphic-derived base field).
- Temporary fields can become permanent when a `permanent_condition` triggers (e.g. Grassy Terrain growth), and can end early via `duration_condition` (e.g. Crystal Cavern from sun lasts as long as the sun: `suncheck` sets field duration = weather duration; New World→Starlight "for as long as Gravity lasts").
- Field changes reset field counters/pledge/conversion state; Flower Garden's stage counter is preserved across a temp overlay.
- **Durations** (from manual "Created by" lines): Electric/Grassy/Misty/Psychic Terrain moves & Surge abilities = 5 turns (Terrain Extender presumably 8); Mist, Ion Deluge, Plasma Fists, Bloom Doom (outside Forest/Flower Garden), Topsy-Turvy (Inverse) = 3 turns. **Everstone** held by the user prevents creating these temporary fields.
- `canChangeFE?`: Underwater and New World cannot be changed by generic field-setting effects (terrain moves etc.); they change only via their own listed moves.
- Weather: Underwater and New World remove/forbid all weather (`noWeather`, "You're too deep to notice the weather!" / "The weather disappeared into space!").
- After a data-driven field change, `noWeather` is evaluated (only matters for Underwater/New World) and the field's seed check reruns (`seedCheck` – Pokémon holding the newly relevant seed consume it).
- **Pledges**: combining two different Pledges in one turn: Water+Grass → Swamp, Fire+Water → Rainbow, Grass+Fire → Burning (permanent, `setField(...,true)` in code = temporary flag; manual just says "Created by").
- **Ignite check** (`ignitecheck`): ignite-type changes only happen if no Water Sport is active and weather ≠ rain. `PBFields::IGNITEMOVES` = Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate, Inferno Overdrive. `QUAKEMOVES` = Earthquake, Bulldoze, Magnitude, Fissure, Tectonic Rage.

**Special field-collapse functions (hardcoded)**
- *Corrosive Mist combustion* (`mistExplosion`): on Corrosive Mist, any IGNITEMOVE or Self-Destruct/Explosion → "The toxic mist combusted!" — every battler takes damage = full max HP (KO) unless: semi-invulnerable/protected (INVULEFFECTS e.g. Protect), mid two-turn move (Dig/Dive/Fly…), Sky Drop, side has Wide Guard, ability Flash Fire; Endure/Sturdy leave 1 HP. Blocked entirely if any battler has **Damp**. Field then changes per data (Reborn: → `none`/backup; Rejuv: see table).
- *Cave collapse* (`caveCollapse`): on Cave, first QUAKEMOVE → "Bits of rock fell from the crumbling ceiling!" (counter=1); second → "The quake collapsed the ceiling!": every battler takes max-HP damage (KO) with exceptions: INVULEFFECTS/two-turn/Sky Drop/Wide Guard, Bulletproof or Rock Head immune; Endure/Sturdy survive at 1; Shell Armor/Battle Armor take ½; Prism Armor/Solid Rock take ⅓. Field remains Cave.
- *Mirror shatter* (`mirrorShatter`): on Mirror Arena, QUAKEMOVES or Boomburst/Hyper Voice/Self-Destruct/Explosion → "The mirror arena shattered!" each battler loses ½ max HP (immune: protect/two-turn/Sky Drop/Wide Guard, Shell Armor, Battle Armor); field breaks.
- *Misty → Corrosive Mist*: counter +1 per Clear Smog/Smog/Poison Gas ("Poison spread through the mist!"), Acid Downpour sets counter=2; at 2 → Corrosive Mist ("The mist was corroded!").
- *Water Surface → Murkwater*: Sludge Wave +1 ("Poison spread through the water!"), Acid Downpour immediate; at 2 → Murkwater ("The water was polluted!").
- *Dragon's Den → Cave*: Muddy Water/Surf/Sparkling Aria counter: 1 "The lava began to harden!", 2 → Cave "The lava solidified!".
- *Flower Garden*: stage counter 0–4 = Stage 1–5. `growField` (+1 stage, max 5, "X grew the garden!") from GROWMOVES / data list; Cut / X-Scissor −1 stage ("The garden was cut down a bit!"); at Stage ≥3 IGNITEMOVES (no rain/Water Sport) → Burning ("The garden caught fire!"); Acid Downpour resets to Stage 1. Synthetic Seed grows 1 stage.
- *Short-Circuit/Crystal Cavern rolls*: Crystal Cavern Rock/Dragon(? see entry) "crystal colour" roll and Short-Circuit Electric damage roll cycle through fixed sequences (`PBStuff::CCROLLS`, `SHORTCIRCUITROLLS`) – deterministic cycling, not random.
- *New World type roll* (Mimicry-like) picks a random type for some abilities.

**Hardcoded end-of-turn damage formulas** (eff = type-effectiveness product where neutral = 4, i.e. ×1 → 1/8 HP)
- Burning: grounded, non-Fire, not Aqua Ring, not Flare Boost/Magma Armor/Flame Body/Flash Fire/Water Veil/Magic Guard/Heatproof/Water Bubble, not underground/underwater (Dig/Dive): `maxHP × eff(Fire)/32` (1/8 neutral, 1/4 weak, 1/2 4×weak; resisted 1/16…), ×2 for Leaf Guard/Ice Body/Fluffy/Grass Pelt; min 1. Also Flash Fire activates at EOT.
- Underwater: non-Water, not Swift Swim/Magic Guard, and only if Water is super-effective on it: `maxHP × eff(Water)/32` (×2 for Flame Body/Magma Armor).
- Murkwater Surface: not Steel/Poison, not Poison Heal/Magic Guard/Wonder Guard/Toxic Boost/Immunity: grounded `maxHP × eff(Poison)/32`; while Diving `maxHP × eff(Poison)/8`; ×2 for Flame Body/Magma Armor/Dry Skin/Water Absorb.
- Corrosive Mist: poisons every Pokémon that can be poisoned each EOT; Poison Heal heals 1/8. Corrosive / Wasteland: grounded Poison Heal heals 1/8; Corrosive: Grass Pelt takes 1/8.
- Forest: Sap Sipper heals 1/16. Short-Circuit: Volt Absorb heals 1/16. Water Surface (grounded) / Underwater: Water Absorb, Dry Skin heal 1/16.

**Hardcoded defense multipliers** (`fieldDefenseBoost`)
- Misty: Fairy targets ×1.5 Sp.Def vs special. Dark Crystal Cavern: Dark/Ghost targets ×1.5 Def & SpD; Prism Armor ×1.33. Rainbow & Crystal Cavern: Prism Armor ×1.33. Dragon's Den: Dragon targets ×1.3. New World: airborne targets ×0.9. Snowy Mountain & Icy: Ice types ×1.5 Def vs physical in hail. Desert: Ground types ×1.5 SpD vs special.

**Seeds** (held items consumed on entry/field change when the matching seed is set for the current field; every field defines exactly one seed): Electric Seed, Grassy Seed, Misty Seed, Psychic Seed (vanilla terrain seeds), plus Reborn's **Elemental, Magical, Synthetic, Telluric** seeds. Each entry's `Seed:` line lists boosted stats + extra effect; manual "Activates X Seed…" bullet gives the human description.

## 3. Field transformations — summary
See [field_transforms.md](field_transforms.md) for the full table (data-driven + hardcoded). Rule of thumb for the mod: on successful move use, check (a) hardcoded collapse/counter functions, then (b) field table `CHANGE` entries with their condition; `none` → pop to backup/no field.

## 4. Coverage

| Game | Fields (distinct ids) | Unique to game |
|---|---|---|
| Reborn E19 | 37 (ids 1–37; INDOORA/B/C, CITY, CITYNEW are empty placeholders) | — (all base set) |
| Rejuvenation 13 | 49 ids (+ Flower Garden 5 stages, Concert Venue 4 stages) | volcanictop, dimensional, frozendimensional, haunted, corruptedcave, bewitchedwoods, sky, colosseum, infernal, concertvenue, deepearth, backalley, city. Renames: Burning→**Volcanic Field**, Ashen Beach→**Beach**, Holy→**Blessed Field**; no Super-Heated (Volcanic Top occupies its slot). |
| Desolation Ep6 | 37 ids defined (+ FG 5 stages, Darkness 3 stages); 28 used in maps | cloud, crowd, darkness, dancefloor. Absent: Dark Crystal Cavern, Big Top, Mirror, New World. |

---
# 5. Field entries
