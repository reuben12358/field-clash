'use strict';
/**
 * Evaluates how well a Pokémon Champions set synergizes with (or suffers on) a
 * given Reborn / Rejuvenation / Desolation field effect, and builds difficulty-
 * balanced teams for VS AI battles:
 *
 *   - easy:   Player gets 6 "good" mons, AI gets 6 "bad" mons
 *   - normal: Roll k in {1, 2, 3}; both Player and AI get k "good", k "bad",
 *             and (6 - 2k) "neutral" mons
 *   - hard:   Player gets 6 "bad" mons, AI gets 6 "good" mons
 */
const {Dex, Teams, toID} = require('pokemon-showdown');
const fields = require('./engine');
const {FIELD_SEEDS} = require('./custom_dex');
const H = require('./helpers');
const {randomInt} = require('../rand');

fields.install();
const dex = Dex.mod('gen9');

const STRIKER_IDS = new Set(H.STRIKER_MOVES.map(toID));
const GROW_IDS = new Set(H.GROW_MOVES.map(toID));
const CHEER_IDS = new Set([
  'acrobatics', 'aerialace', 'beatup', 'blazekick', 'bodypress', 'bodyslam', 'bravebird',
  'brutalswing', 'bulletpunch', 'cometpunch', 'dizzypunch', 'doublehit', 'doubleedge',
  'firepunch', 'gigaimpact', 'headsmash', 'headbutt', 'heavyslam', 'icepunch', 'ironhead',
  'knockoff', 'megakick', 'megapunch', 'meteormash', 'playrough', 'punishment', 'shadowpunch',
  'skullbash', 'slam', 'spiritbreak', 'steelwing', 'strength', 'suckerpunch', 'thunderpunch',
  'tripleaxel', 'tropkick', 'zenheadbutt',
]);
const HYPE_IDS = new Set([
  'boomburst', 'bugbuzz', 'chatter', 'clangingscales', 'clangoroussoul', 'disarmingvoice',
  'dragondance', 'drumbeating', 'echoedvoice', 'featherdance', 'fierydance', 'firstimpression',
  'growl', 'howl', 'hypervoice', 'metalsound', 'nobleroar', 'overdrive', 'partingshot',
  'petaldance', 'quiverdance', 'relicsong', 'revelationdance', 'roar', 'rollout', 'round',
  'screech', 'sing', 'snarl', 'sparklingaria', 'supersonic', 'swagger', 'swordsdance', 'uproar',
  'workup', 'torchsong', 'alluringvoice', 'aquastep', 'victorydance',
]);
const KILLJOY_IDS = new Set(['babydolleyes', 'embargo', 'playnice', 'quash', 'slackoff', 'throatchop', 'tickle', 'yawn']);
const DANCE_SETUP_IDS = new Set(['dragondance', 'quiverdance', 'swordsdance', 'victorydance', 'featherdance', 'teeterdance']);
const STATUS_SPREAD_IDS = new Set([
  'thunderwave', 'willowisp', 'toxic', 'spore', 'sleeppowder', 'stunspore',
  'poisonpowder', 'glare', 'yawn', 'hypnosis', 'lovelykiss', 'sing', 'darkvoid', 'nuzzle',
]);

const ABSORB_TYPE = {
  levitate: 'Ground',
  eartheater: 'Ground',
  flashfire: 'Fire',
  wellbakedbody: 'Fire',
  waterabsorb: 'Water',
  stormdrain: 'Water',
  dryskin: 'Water',
  voltabsorb: 'Electric',
  lightningrod: 'Electric',
  motordrive: 'Electric',
  sapsipper: 'Grass',
};

const sharedGens = {};
function getGenerator(dexMode = 'champions') {
  const key = dexMode === 'natdex' ? 'natdex' : 'champions';
  if (!sharedGens[key]) {
    fields.install();
    const fmt = key === 'natdex'
      ? 'gen9randombattle@@@Adjust Level = 50'
      : 'gen9championsrandombattle@@@Adjust Level = 50';
    sharedGens[key] = Teams.getGenerator(fmt);
  }
  return sharedGens[key];
}

function typeEffMult(atkType, types) {
  if (!dex.getImmunity(atkType, types)) return 0;
  return Math.pow(2, dex.getEffectiveness(atkType, types));
}

function ruleMatchesStatic(rule, mv, grounded, abilityId) {
  if (!mv || !mv.exists) return false;
  if (rule.moves || rule.types || rule.cats || rule.flags || rule.abilities || rule.anyMove) {
    let ok = false;
    if (rule.anyMove) ok = true;
    if (rule.moves && rule.moves.has(mv.id)) ok = true;
    if (rule.types && rule.types.has(mv.type)) {
      let typeOk = !rule.cats || rule.cats.has(mv.category);
      if (typeOk && rule.flags) typeOk = rule.flags.some(fl => mv.flags?.[fl]);
      if (typeOk) ok = true;
    } else if (!rule.types && rule.cats && rule.cats.has(mv.category)) {
      if (!rule.flags || rule.flags.some(fl => mv.flags?.[fl])) ok = true;
    } else if (!rule.types && !rule.cats && rule.flags && rule.flags.some(fl => mv.flags?.[fl])) {
      ok = true;
    }
    if (rule.abilities && rule.abilities.has(abilityId) && !rule.moves && !rule.types && !rule.cats && !rule.flags) {
      ok = true;
    }
    if (!ok) return false;
  }
  if (rule.notMoves && rule.notMoves.has(mv.id)) return false;
  if (rule.noContact && mv.flags?.contact) return false;
  if (rule.contact && !mv.flags?.contact) return false;
  if (rule.damaging && mv.category === 'Status') return false;
  if (rule.grounded && !grounded) return false;
  if (rule.airborne && grounded) return false;
  return true;
}

function getFieldBoostedTypes(f) {
  if (!f) return [];
  const out = new Set();
  if (f.terrain === 'electricterrain') out.add('Electric');
  if (f.terrain === 'grassyterrain') out.add('Grass');
  if (f.terrain === 'mistyterrain') out.add('Fairy');
  if (f.terrain === 'psychicterrain') out.add('Psychic');
  for (const r of f.mods) {
    const m = typeof r.mult === 'number' ? r.mult : (f.id === 'shortcircuit' ? 1.22 : 1);
    if (m >= 1.15 && r.types && !r.cats) {
      for (const t of r.types) out.add(t);
    } else if (m >= 1.3 && r.types && r.cats) {
      for (const t of r.types) out.add(t);
    }
  }
  if (f.family === 'flowergarden') {
    out.add('Grass');
    out.add('Bug');
    out.add('Fire');
  } else if (f.family === 'darkness' || f.id === 'darkcrystalcavern') {
    out.add('Dark');
    out.add('Ghost');
  } else if (f.id === 'wasteland' || f.id === 'corrosive' || f.id === 'corrosivemist') {
    out.add('Poison');
  } else if (f.id === 'ashenbeach') {
    out.add('Ground');
    out.add('Fighting');
    out.add('Psychic');
  } else if (f.id === 'desert') {
    out.add('Ground');
  } else if (f.id === 'chess') {
    out.add('Psychic');
    out.add('Rock');
  } else if (f.id === 'mirror' || f.id === 'factory') {
    out.add('Steel');
    out.add('Electric');
  } else if (f.id === 'colosseum') {
    out.add('Steel');
    out.add('Fighting');
    out.add('Dark');
  } else if (f.id === 'bigtop' || f.family === 'concert') {
    out.add('Normal');
    out.add('Fighting');
  }
  return [...out];
}

/**
 * Compute field affinity score and tier ('good' | 'neutral' | 'bad') for a set.
 */
function scoreSetOnField(set, fieldId) {
  fields.install();
  const f = fields.FIELDS.get(fieldId);
  if (!f || fieldId === 'none') {
    return {score: 0, tier: 'neutral', reasons: []};
  }

  const baseSp = dex.species.get(set.species);
  const itemObj = dex.items.get(set.item);
  const megaName = itemObj?.megaStone?.[baseSp.name] || (set.speciesId && dex.species.get(set.speciesId).isMega ? dex.species.get(set.speciesId).name : null);
  const effSp = megaName ? dex.species.get(megaName) : baseSp;

  const types = effSp.types || baseSp.types || ['Normal'];
  const baseAbilId = toID(set.ability);
  const effAbilId = megaName ? toID(effSp.abilities['0'] || set.ability) : baseAbilId;
  const hasAbil = (...ids) => ids.includes(effAbilId) || ids.includes(baseAbilId);
  const itemId = toID(set.item);
  const grounded = !types.includes('Flying') && !hasAbil('levitate') && itemId !== 'airballoon';
  const moves = (set.moves || []).map(m => dex.moves.get(m)).filter(m => m.exists);
  const hasMove = (...ids) => moves.some(m => ids.includes(m.id));
  const slowRoomer = hasMove('trickroom', 'gyroball');

  let score = 0;
  const reasons = [];
  const addReason = (txt) => {
    if (reasons.length < 3 && !reasons.includes(txt)) reasons.push(txt);
  };

  // 1. Inverse Field has unique full-chart inversion rules
  if (f.id === 'inverse') {
    let netDef = 0;
    for (const atkT of fields.ALL_TYPES) {
      if (!dex.getImmunity(atkT, types)) netDef -= 1.3; // immunity becomes 2x weakness!
      else {
        const eff = dex.getEffectiveness(atkT, types);
        netDef += eff; // normal weakness (+1/+2) becomes resistance; normal resistance (-1/-2) becomes weakness!
      }
    }
    score += netDef * 0.55;
    if (netDef >= 3) addReason('Inverted type resistances');
    else if (netDef <= -3) addReason('Many inverted weaknesses');

    for (const mv of moves) {
      if (mv.category === 'Status') continue;
      if (mv.type === 'Normal') {
        score += types.includes('Normal') ? 2.2 : 1.3;
        addReason(`${mv.name} unresisted in Inverse`);
      } else if (['Ice', 'Bug', 'Grass', 'Rock'].includes(mv.type)) {
        score += 0.9;
      } else if (['Steel', 'Dragon', 'Ghost'].includes(mv.type)) {
        score -= 0.5;
      }
    }
    const tier = score >= 1.35 ? 'good' : score <= -1.15 ? 'bad' : 'neutral';
    return {score: Math.round(score * 100) / 100, tier, reasons};
  }

  // 2. Moves: fail checks, damage multipliers, accuracy boosts & special hooks
  for (const mv of moves) {
    const isStab = types.includes(mv.type);

    // Check if move fails outright
    let fails = f.fail.some(r => ruleMatchesStatic(r, mv, grounded, effAbilId));
    if (!fails && f.terrain === 'psychicterrain' && mv.priority > 0 && mv.category !== 'Status' &&
        !['self', 'allySide', 'allies'].includes(mv.target)) {
      fails = true;
    }
    if (fails) {
      score -= mv.category !== 'Status' ? (isStab ? 3.4 : 2.3) : 2.0;
      addReason(`${mv.name} blocked by field`);
      continue;
    }

    if (mv.category !== 'Status') {
      let mult = 1;
      if (f.terrain === 'electricterrain' && grounded && mv.type === 'Electric') mult *= 1.3;
      if (f.terrain === 'grassyterrain' && grounded && mv.type === 'Grass') mult *= 1.3;
      if (f.terrain === 'grassyterrain' && ['earthquake', 'bulldoze', 'magnitude'].includes(mv.id)) mult *= 0.5;
      if (f.terrain === 'mistyterrain' && mv.type === 'Dragon') mult *= 0.5;
      if (f.terrain === 'psychicterrain' && grounded && mv.type === 'Psychic') mult *= 1.3;

      for (const r of f.mods) {
        if (r.anyMove) continue; // e.g. Chess Queen slot-dependent
        if (!ruleMatchesStatic(r, mv, grounded, effAbilId)) continue;
        if (f.id === 'underwater' && r.cats && r.cats.has('Physical')) {
          if (mv.type !== 'Water' && !hasAbil('steelworker')) mult *= 0.5;
          continue;
        }
        if (typeof r.mult === 'number') {
          mult *= r.mult;
        } else if (f.id === 'bigtop' && STRIKER_IDS.has(mv.id)) {
          mult *= hasAbil('hugepower', 'purepower', 'guts', 'sheerforce') || hasMove('swordsdance', 'bulkup', 'dragondance') ? 2.0 : 1.55;
        } else if (f.id === 'shortcircuit' && mv.type === 'Electric') {
          mult *= 1.25;
        }
      }

      // Flower Garden Stage 1 quickly blooms to boost Grass/Bug/Fire
      if (f.id === 'flowergarden1') {
        if (mv.type === 'Bug') mult *= 1.35;
        else if (mv.type === 'Grass') mult *= 1.3;
      }

      if (mult >= 1.15) {
        const gain = Math.min(4.0, (mult - 1) * (isStab ? 3.8 : 2.4));
        score += gain;
        addReason(`${mv.name} boosted`);
      } else if (mult <= 0.9) {
        const loss = Math.min(4.4, (1 - mult) * (isStab ? 4.4 : 2.6));
        score -= loss;
        addReason(`${mv.name} weakened`);
      }

      // Glitch field strips Dark/Steel/Fairy move typing -> Normal
      if (f.id === 'glitch' && ['Dark', 'Steel', 'Fairy'].includes(mv.type)) {
        score -= isStab ? 2.1 : 1.0;
        addReason(`${mv.name} glitched to Normal`);
      }
      // Crowd field cheers & boos
      if (f.id === 'crowd') {
        if (mv.type === 'Fighting' || CHEER_IDS.has(mv.id)) {
          score += 1.3;
          addReason(`${mv.name} triggers Crowd Cheer`);
        } else if (mv.category === 'Special' && mv.type === 'Psychic') {
          score -= 2.8;
          addReason(`${mv.name} draws Crowd Boos`);
        }
      }
      // Blessed field Normal hits Ghost/Dark SE
      if (f.id === 'holy' && mv.type === 'Normal') {
        score += 1.2;
      }
      // Fairy Tale Steel hits Dragon SE
      if (f.id === 'fairytale' && mv.type === 'Steel') {
        score += 0.9;
      }
      // Mirror / Rocky miss crash penalty
      if ((f.id === 'mirror' || f.id === 'rocky') && mv.category === 'Physical' && mv.flags?.contact &&
          typeof mv.accuracy === 'number' && mv.accuracy < 95 && !hasAbil('magicguard', 'rockhead', 'noguard')) {
        score -= f.id === 'mirror' ? 1.4 : 0.9;
      }
    } else {
      // Status / Setup synergies
      if (f.terrain === 'mistyterrain' && STATUS_SPREAD_IDS.has(mv.id)) {
        score -= 1.6;
        addReason(`${mv.name} blocked on grounded foes`);
      }
      if (f.terrain === 'electricterrain' && (mv.id === 'rest' && grounded || ['spore', 'sleeppowder', 'yawn', 'hypnosis', 'sing', 'lovelykiss'].includes(mv.id))) {
        score -= mv.id === 'rest' ? 2.8 : 1.8;
        addReason(`${mv.name} blocked by Electric Terrain`);
      }
      if (f.id === 'chess' && (mv.id === 'calmmind' || mv.id === 'nastyplot')) {
        score += 1.5;
        addReason(`${mv.name} extra stat boost`);
      }
      if (f.id === 'dancefloor' && DANCE_SETUP_IDS.has(mv.id)) {
        score += 1.8;
        addReason(`${mv.name} +1 Speed groove`);
      }
      if (f.id === 'fairytale' && mv.id === 'swordsdance') score += 1.6;
      if (f.id === 'colosseum' && ['swordsdance', 'howl', 'noretreat'].includes(mv.id)) score += 1.5;
      if (f.id === 'factory' && ['shiftgear', 'irondefense'].includes(mv.id)) score += 1.5;
      if (f.id === 'city' && ['workup', 'shiftgear', 'autotomize'].includes(mv.id)) score += 1.5;
      if (f.id === 'rocky' && mv.id === 'rockpolish') score += 1.5;
      if (f.id === 'crowd' && ['bulkup', 'workup'].includes(mv.id)) score += 1.4;
      if (f.family === 'flowergarden' && GROW_IDS.has(mv.id)) score += 1.5;
    }

    if (f.family === 'concert') {
      if (HYPE_IDS.has(mv.id) || mv.flags?.sound) score += 1.2;
      if (KILLJOY_IDS.has(mv.id)) score -= 1.3;
    }

    if (mv.id in f.accuracy && typeof mv.accuracy === 'number' && mv.accuracy < 95) {
      score += 1.35;
      addReason(`${mv.name} accuracy boosted`);
    }
  }

  // 3. Field Stat Modifiers (Def / SpD / Spe / Atk)
  for (const r of f.defMods) {
    const typeOk = !r.types || [...r.types].some(t => types.includes(t));
    const abilOk = !r.abilities || [...r.abilities].some(a => hasAbil(a));
    if (!typeOk || !abilOk) continue;
    if (r.grounded && !grounded) continue;
    if (r.airborne && grounded) continue;
    if (!r.types && !r.abilities && !r.grounded && !r.airborne) continue;
    const weight = r.weather ? 1.6 : (r.stat === 'both' ? 4.4 : 2.6);
    if (r.mult > 1) {
      score += (r.mult - 1) * weight;
      addReason('Field defense boost');
    } else if (r.mult < 1) {
      score -= (1 - r.mult) * 4.0;
      addReason('Field defense penalty');
    }
  }

  for (const r of f.speMods) {
    if (r.abilities && [...r.abilities].some(a => hasAbil(a)) && r.mult > 1) {
      score += 3.6;
      addReason('2× Speed on field');
    }
  }
  if ((f.id === 'watersurface' || f.id === 'murkwatersurface') && grounded && !types.includes('Water') && !hasAbil('swiftswim', 'surgesurfer') && !slowRoomer) {
    score -= 1.6;
    addReason('0.75× Speed in water');
  }
  if (f.id === 'underwater' && !types.includes('Water') && !hasAbil('swiftswim', 'surgesurfer') && !slowRoomer) {
    score -= 2.4;
    addReason('0.5× Speed underwater');
  }
  if (f.id === 'newworld' && grounded && !slowRoomer) {
    score -= 1.2;
  }

  for (const r of f.atkMods) {
    if (r.abilities && [...r.abilities].some(a => hasAbil(a)) && r.mult > 1) {
      score += 2.5;
      addReason('Field Attack boost');
    }
  }

  // 4. Field Residual Hazards, Entry Effects & Ability Synergies
  if (hasAbil('mimicry') && f.mimicry) score += 2.2;

  switch (f.id) {
  case 'electric':
    if (hasAbil('motordrive', 'quarkdrive')) { score += 3.0; addReason('Electric Terrain ability boost'); }
    break;
  case 'grassy':
    if (hasAbil('sapsipper')) { score += 2.2; addReason('Sap Sipper heals each turn'); }
    break;
  case 'misty':
    if (hasAbil('dryskin')) { score += 2.4; addReason('Dry Skin heals in mist'); }
    break;
  case 'burning': {
    const immune = types.includes('Fire') || hasAbil('flamebody', 'flareboost', 'flashfire', 'wellbakedbody', 'heatproof', 'magmaarmor', 'waterbubble', 'waterveil', 'magicguard', 'thermalexchange');
    if (immune) {
      score += 1.8;
    } else if (grounded) {
      const eff = typeEffMult('Fire', types) * (hasAbil('fluffy', 'grasspelt', 'icebody', 'leafguard', 'dryskin') ? 2 : 1);
      if (eff > 0) {
        score -= 2.6 * eff;
        addReason('Burned by blazing ground');
      }
    }
    break;
  }
  case 'swamp':
    if (!grounded || hasAbil('clearbody', 'whitesmoke', 'fullmetalbody', 'goodasgold')) {
      score += 1.5;
      addReason('Avoids Swamp Speed drop');
    } else if (!slowRoomer) {
      score -= 1.9;
      addReason('Slowed each turn by Swamp');
    }
    break;
  case 'corrosive':
    if (types.includes('Poison') || types.includes('Steel') || hasAbil('immunity', 'poisonheal', 'toxicboost', 'magicguard', 'pastelveil')) {
      score += hasAbil('poisonheal') ? 3.2 : 1.6;
      addReason('Immune to corrosive acid');
    } else if (grounded) {
      const eff = typeEffMult('Poison', types);
      if (eff > 0) {
        score -= 2.0 * eff;
        addReason('Damaged by corrosive entry');
      }
    }
    break;
  case 'corrosivemist':
    if (types.includes('Poison') || types.includes('Steel') || hasAbil('poisonheal', 'guts', 'toxicboost', 'magicguard', 'immunity', 'pastelveil', 'purifyingsalt')) {
      score += hasAbil('poisonheal', 'guts', 'toxicboost') ? 3.2 : 1.8;
      addReason('Resists toxic mist');
    } else {
      score -= 2.2;
      addReason('Poisoned by toxic mist');
    }
    break;
  case 'desert':
    if (hasAbil('dryskin')) { score -= 3.2; addReason('Dry Skin hurt by arid heat'); }
    break;
  case 'icy':
  case 'snowymountain':
  case 'frozendimensional':
    if (hasAbil('icebody')) { score += 2.0; addReason('Ice Body heals each turn'); }
    break;
  case 'forest':
    if (hasAbil('sapsipper')) { score += 2.0; addReason('Sap Sipper heals in forest'); }
    break;
  case 'shortcircuit':
    if (hasAbil('voltabsorb')) { score += 2.2; addReason('Volt Absorb heals each turn'); }
    break;
  case 'wasteland':
    if (grounded && hasAbil('poisonheal')) { score += 3.0; addReason('Poison Heal active'); }
    break;
  case 'watersurface':
    if (hasAbil('dryskin', 'waterabsorb', 'hydration')) { score += 2.2; addReason('Healed by water surface'); }
    break;
  case 'underwater':
    if (hasAbil('dryskin', 'waterabsorb')) {
      score += 2.5;
      addReason('Heals underwater');
    } else if (!types.includes('Water') && !hasAbil('swiftswim', 'magicguard', 'waterveil', 'waterbubble')) {
      const eff = typeEffMult('Water', types);
      if (eff > 1) {
        score -= 3.0 * eff;
        addReason('Takes underwater pressure damage');
      }
    }
    break;
  case 'murkwatersurface':
    if (types.includes('Poison') || types.includes('Steel')) {
      score += types.includes('Water') ? 3.0 : 1.8;
      addReason('Immune to murkwater');
    } else if (grounded && !hasAbil('immunity', 'magicguard', 'poisonheal', 'toxicboost')) {
      const eff = typeEffMult('Poison', types);
      if (eff > 0) {
        score -= 2.3 * eff;
        addReason('Damaged by tainted water');
      }
    }
    break;
  case 'corruptedcave':
    if (types.includes('Poison') || types.includes('Steel') || hasAbil('immunity', 'poisonheal', 'magicguard')) {
      score += 1.7;
    } else if (grounded) {
      score -= 1.8;
      addReason('Takes corruption chip');
    }
    break;
  case 'cave':
  case 'deepearth':
    if (!grounded && dex.getEffectiveness('Ground', types) > 0) {
      score -= 2.4;
      addReason('Grounded by field — weak to Ground');
    }
    break;
  case 'glitch':
    if (types.includes('Psychic')) score += 1.6;
    if (baseSp.baseStats.spd - baseSp.baseStats.spa >= 25 && moves.some(m => m.category !== 'Status' && H.GEN1_SPECIAL_TYPES.has(m.type))) {
      score += 1.5;
      addReason('Unified Gen 1 Special stat boost');
    }
    break;
  case 'holy':
    if (types.includes('Ghost') || types.includes('Dark')) {
      score -= 1.9;
      addReason('Vulnerable to sacred Normal moves');
    }
    break;
  case 'fairytale':
    if (hasAbil('battlearmor', 'shellarmor', 'magicguard', 'magicbounce')) score += 1.8;
    if (types.includes('Dragon') && !types.includes('Steel')) score -= 1.0;
    break;
  case 'sky':
    if (hasAbil('levitate', 'bigpecks', 'galewings')) { score += 2.4; addReason('Sky Field ability boost'); }
    break;
  case 'cloud':
    if (hasAbil('cloudnine', 'forecast', 'overcoat')) { score += 2.2; addReason('Cloud Field defense boost'); }
    break;
  case 'crowd':
    if (hasAbil('ironfist')) score += 1.8;
    break;
  case 'dimensional':
    if (hasAbil('rattled')) score += 1.8;
    break;
  default:
    break;
  }

  if (f.family === 'flowergarden' && hasAbil('drizzle', 'drought', 'flowergift', 'flowerveil', 'chlorophyll')) {
    score += 2.2;
    addReason('Blooms / thrives in Flower Garden');
  }
  if (f.family === 'darkness' && (hasAbil('rattled', 'pickpocket') || (f.stage === 3 && (types.includes('Dark') || types.includes('Ghost'))))) {
    score += 2.0;
  }

  // 5. Defensive Matchup vs Field's Amplified Attack Types
  const boostedTypes = getFieldBoostedTypes(f);
  for (const atkT of boostedTypes) {
    if (ABSORB_TYPE[effAbilId] === atkT || ABSORB_TYPE[baseAbilId] === atkT) {
      score += 1.6;
      addReason(`Absorbs ${atkT} attacks`);
      continue;
    }
    if (!dex.getImmunity(atkT, types)) {
      if (!((f.id === 'cave' || f.id === 'deepearth') && atkT === 'Ground')) {
        score += 1.1;
      }
      continue;
    }
    let eff = dex.getEffectiveness(atkT, types);
    if (hasAbil('thickfat') && (atkT === 'Fire' || atkT === 'Ice')) eff -= 1;
    if (hasAbil('heatproof', 'waterbubble') && atkT === 'Fire') eff -= 1;
    if (hasAbil('purifyingsalt') && atkT === 'Ghost') eff -= 1;
    if (eff >= 2) {
      score -= 2.8;
      addReason(`4× weak to field-boosted ${atkT}`);
    } else if (eff === 1) {
      score -= 1.45;
      addReason(`Weak to field-boosted ${atkT}`);
    } else if (eff <= -1) {
      score += 0.35;
    }
  }

  // 6. Field Seed synergy
  if (FIELD_SEEDS[f.id]?.seed && FIELD_SEEDS[f.id].seed === itemId) {
    score += 2.4;
    addReason(`Activates ${itemObj.name}`);
  }

  const tier = score >= 1.0 ? 'good' : score <= -1.0 ? 'bad' : 'neutral';
  return {score: Math.round(score * 100) / 100, tier, reasons};
}

// ---------------------------------------------------------------------------
// Fast Candidate Set Pools (Champions & National Dex) & Team Builder
// ---------------------------------------------------------------------------
const POOL_TARGET = 220;
const candidatePools = {
  champions: [],
  natdex: [],
};

function makeRandomSingleSet(dexMode = 'champions') {
  const gen = getGenerator(dexMode);
  const keys = Object.keys(gen.randomSets);
  const key = keys[randomInt(keys.length)];
  const sp = gen.dex.species.get(key);
  const set = gen.randomSet(sp, {});
  set.level = 50;
  return set;
}

function ensurePool(dexMode = 'champions') {
  const key = dexMode === 'natdex' ? 'natdex' : 'champions';
  const pool = candidatePools[key];
  while (pool.length < POOL_TARGET) {
    pool.push(makeRandomSingleSet(key));
  }
  return pool;
}

function isMegaSet(set) {
  const item = dex.items.get(set.item);
  return !!item?.megaStone;
}

function baseSpeciesOf(set) {
  return dex.species.get(set.species).baseSpecies || set.species;
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/**
 * Build a 6-Pokémon team matching `profile` on `fieldId`:
 *   - 'good':   6 field-benefitted Pokémon
 *   - 'bad':    6 field-disadvantaged Pokémon
 *   - {good, bad, neutral}: exact mix (used on Normal so both sides match!)
 */
function generateFieldTeam(fieldId, profile = 'random', avoidBaseSpecies = null, opts = {}) {
  const dexMode = opts.dexMode === 'natdex' ? 'natdex' : 'champions';
  const targetLevel = Math.max(1, Number(opts.level) || 50);

  if (profile === 'random' || !fieldId || fieldId === 'none') {
    const team = getGenerator(dexMode).randomTeam();
    for (const s of team) s.level = targetLevel;
    return team;
  }

  const candidatePool = ensurePool(dexMode);
  // Top up fresh variety each roll so repeated matches stay diverse
  for (let i = 0; i < 28; i++) {
    candidatePool[randomInt(candidatePool.length)] = makeRandomSingleSet(dexMode);
  }

  const scored = candidatePool.map((set, idx) => ({
    idx,
    set,
    ...scoreSetOnField(set, fieldId),
  }));

  // Sample extra candidates on narrow fields if strict good/bad base species are scarce
  const countDistinct = tierName => new Set(scored.filter(x => x.tier === tierName).map(x => baseSpeciesOf(x.set))).size;
  const needGood = profile === 'good' ? 8 : (Number(profile?.good) || 0) + 2;
  const needBad = profile === 'bad' ? 8 : (Number(profile?.bad) || 0) + 2;
  let extraDraws = 0;
  while (extraDraws < 90 && (countDistinct('good') < needGood || countDistinct('bad') < needBad)) {
    const extraSet = makeRandomSingleSet(dexMode);
    scored.push({idx: -1 - extraDraws, set: extraSet, ...scoreSetOnField(extraSet, fieldId)});
    extraDraws++;
  }

  const strictGood = shuffleInPlace(scored.filter(x => x.tier === 'good'));
  const strictBad = shuffleInPlace(scored.filter(x => x.tier === 'bad'));
  const strictNeutral = shuffleInPlace(scored.filter(x => x.tier === 'neutral'));

  const byScoreDesc = [...scored].sort((a, b) => b.score - a.score);
  const byScoreAsc = [...scored].sort((a, b) => a.score - b.score);
  const byAbsAsc = [...scored].sort((a, b) => Math.abs(a.score) - Math.abs(b.score));

  const goodPool = [...strictGood, ...byScoreDesc.filter(x => x.tier !== 'good').slice(0, 20)];
  const badPool = [...strictBad, ...byScoreAsc.filter(x => x.tier !== 'bad').slice(0, 20)];
  const neutralPool = [...strictNeutral, ...byAbsAsc.filter(x => x.tier !== 'neutral').slice(0, 20)];

  const quotas = profile === 'good'
    ? {good: 6, bad: 0, neutral: 0}
    : profile === 'bad'
      ? {good: 0, bad: 6, neutral: 0}
      : {
        good: Math.max(0, Number(profile.good) || 0),
        bad: Math.max(0, Number(profile.bad) || 0),
        neutral: Math.max(0, 6 - (Number(profile.good) || 0) - (Number(profile.bad) || 0)),
      };

  const team = [];
  const usedBase = new Set();
  const consumedIdx = new Set();
  let hasMega = false;

  const pickFrom = (pool, count, allowAvoidFallback = false) => {
    let added = 0;
    for (const pass of (allowAvoidFallback && avoidBaseSpecies ? [false, true] : [true])) {
      for (const entry of pool) {
        if (added >= count || team.length >= 6) break;
        if (consumedIdx.has(entry.idx)) continue;
        const base = baseSpeciesOf(entry.set);
        if (usedBase.has(base)) continue;
        if (!pass && avoidBaseSpecies?.has(base)) continue;
        const mega = isMegaSet(entry.set);
        if (mega && hasMega) continue;
        team.push({
          ...entry.set,
          moves: [...entry.set.moves],
          evs: {...entry.set.evs},
          ivs: {...entry.set.ivs},
          level: targetLevel,
        });
        usedBase.add(base);
        consumedIdx.add(entry.idx);
        if (mega) hasMega = true;
        added++;
      }
    }
  };

  pickFrom(goodPool, quotas.good, true);
  pickFrom(badPool, quotas.bad, true);
  pickFrom(neutralPool, quotas.neutral, true);

  // Fill any remaining slots if needed
  if (team.length < 6) {
    const fallback = profile === 'good' ? byScoreDesc : profile === 'bad' ? byScoreAsc : shuffleInPlace([...scored]);
    pickFrom(fallback, 6 - team.length, true);
  }

  // Replace consumed entries in the rolling pool so the next call has fresh sets
  for (const idx of consumedIdx) {
    if (idx >= 0) candidatePool[idx] = makeRandomSingleSet(dexMode);
  }

  shuffleInPlace(team);
  // Keep Illusion users (Zoroark) out of the last party slot
  const zoroIdx = team.findIndex((s, i) => i === team.length - 1 && baseSpeciesOf(s) === 'Zoroark');
  if (zoroIdx > 0) {
    const tmp = team[0];
    team[0] = team[zoroIdx];
    team[zoroIdx] = tmp;
  }

  return team;
}

/**
 * Generate matched Player + AI teams for a VS AI room given fieldId & difficulty.
 */
function generateAIMatchupTeams(fieldId, difficulty = 'normal', opts = {}) {
  if (difficulty === 'easy') {
    const playerTeam = generateFieldTeam(fieldId, 'good', null, opts);
    const used = new Set(playerTeam.map(baseSpeciesOf));
    const aiTeam = generateFieldTeam(fieldId, 'bad', used, opts);
    return {playerTeam, aiTeam, balanceCount: null};
  }
  if (difficulty === 'hard') {
    const aiTeam = generateFieldTeam(fieldId, 'good', null, opts);
    const used = new Set(aiTeam.map(baseSpeciesOf));
    const playerTeam = generateFieldTeam(fieldId, 'bad', used, opts);
    return {playerTeam, aiTeam, balanceCount: null};
  }
  // Normal: equal k in {1, 2, 3} good and k bad on both sides!
  const k = randomInt(1, 4); // 1, 2, or 3
  const spec = {good: k, bad: k, neutral: 6 - 2 * k};
  const playerTeam = generateFieldTeam(fieldId, spec, null, opts);
  const used = new Set(playerTeam.map(baseSpeciesOf));
  const aiTeam = generateFieldTeam(fieldId, spec, used, opts);
  return {playerTeam, aiTeam, balanceCount: k};
}

module.exports = {
  scoreSetOnField,
  generateFieldTeam,
  generateAIMatchupTeams,
  getGenerator,
};
