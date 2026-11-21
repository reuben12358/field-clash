'use strict';
/**
 * Major Boss & Story Fight Importer + Validator for Field Clash.
 *
 * Supports two sources:
 *   1. Compiled Reborn 19.5 / Rejuvenation 13.5-14 / Desolation Ep 1-6 walkthrough
 *      HTML tables + DesoCalc Ep 6 sets (default when pointed at --dir <scratchDir>).
 *   2. Raw Pokémon Essentials / RPG Maker XP PBS `trainers.txt` files
 *      (`node tools/import-bosses.js --pbs path/to/trainers.txt --game Reborn --field electric`).
 *
 * Every imported fight is normalized against Gen 9 National Dex + Reborn-verse Custom Dex
 * and live-tested in a real Showdown Battle (both Lv.50 and Canonical Story Level modes)
 * before writing `server/boss-data.json`.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {createBattle, randomTeam, fields, Dex, toID} = require('../server/sim');
const ai = require('../server/ai');

fields.install();
const dex = Dex.mod('gen9');

// Map walkthrough / PBS field names -> Field Clash fieldId
const FIELD_NAME_MAP = {
  'electric terrain': 'electric',
  'grassy terrain': 'grassy',
  'misty terrain': 'misty',
  'misty terrain atop fairy tale field': 'misty',
  'psychic terrain': 'psychic',
  'dark crystal cavern': 'darkcrystalcavern',
  'chess board': 'chess',
  'big top arena': 'bigtop',
  'burning field': 'burning',
  'volcanic field': 'burning',
  'swamp field': 'swamp',
  'rainbow field': 'rainbow',
  'rainbow field atop forest field': 'rainbow',
  'rainbow field atop no field': 'rainbow',
  'rainbow field atop rocky field': 'rainbow',
  'rainbow field upon crystal cavern field': 'rainbow',
  'corrosive field': 'corrosive',
  'corrosive mist field': 'corrosivemist',
  'corrosive mist field atop corrosive field': 'corrosivemist',
  'desert field': 'desert',
  'desert field / no field': 'desert',
  'icy field': 'icy',
  'rocky field': 'rocky',
  'forest field': 'forest',
  'super-heated field': 'superheated',
  'super-heated-field': 'superheated',
  'factory field': 'factory',
  'short-circuit field': 'shortcircuit',
  'wasteland': 'wasteland',
  'wasteland field': 'wasteland',
  'ashen beach': 'ashenbeach',
  'beach field': 'ashenbeach',
  'water surface': 'watersurface',
  'underwater': 'underwater',
  'underwater field': 'underwater',
  'cave': 'cave',
  'cave field': 'cave',
  'glitch field': 'glitch',
  'crystal cavern': 'crystalcavern',
  'crystal cavern field': 'crystalcavern',
  'murkwater surface': 'murkwatersurface',
  'murkwater field': 'murkwatersurface',
  'mountain': 'mountain',
  'mountain field': 'mountain',
  'snowy mountain': 'snowymountain',
  'holy field': 'holy',
  'blessed field': 'holy',
  'mirror arena': 'mirror',
  'fairy tale field': 'fairytale',
  'fairy tale arena': 'fairytale',
  'fairy tale arena or starlight arena': 'fairytale',
  "dragon's den": 'dragonsden',
  'flower garden': 'flowergarden2',
  'flower garden field': 'flowergarden2',
  'starlight arena': 'starlight',
  'new world': 'newworld',
  'deux finalis': 'newworld',
  'inverse field': 'inverse',
  'dimensional field': 'dimensional',
  'frozen dimensional field': 'frozendimensional',
  'haunted field': 'haunted',
  'haunted field atop forest field': 'haunted',
  'corrupted cave': 'corruptedcave',
  'corrupted field': 'corruptedcave',
  'bewitched woods': 'bewitchedwoods',
  'sky field': 'sky',
  'colosseum field': 'colosseum',
  'infernal field': 'infernal',
  'volcanic top': 'volcanictop',
  'volcanic top field': 'volcanictop',
  'deep earth field': 'deepearth',
  'back alley': 'backalley',
  'back alley field': 'backalley',
  'city field': 'city',
  'concert venue': 'concert2',
  'darkness field': 'darkness2',
  'cloud field': 'cloud',
  'crowd field': 'crowd',
  'dance floor': 'dancefloor',
  'no field': 'none',
  'random field': 'rainbow',
};

const ABILITY_ALIASES = {
  'q. majesty': 'Queenly Majesty',
  'w. compaction': 'Water Compaction',
  'p. construct': 'Power Construct',
  'w. spirit': 'Wandering Spirit',
  't. exchange': 'Thermal Exchange',
  'electromorph.': 'Electromorphosis',
  'well-baked': 'Well-Baked Body',
  'supr. overlord': 'Supreme Overlord',
  'sweet syrup': 'Supersweet Syrup',
  'psn puppeteer': 'Poison Puppeteer',
  'alchemy': 'Power of Alchemy',
  'rescucitation': 'Resuscitation',
};

const MOVE_ALIASES = {
  'stomp tantrum': 'Stomping Tantrum',
  'nature madness': "Nature's Madness",
  'multi-attack animation': 'Multi-Attack',
  'super u.m.d. move': 'Super UMD Move',
  'pyrokineses': 'Pyrokinesis',
  'ether tempest': 'Ethereal Tempest',
};

const ITEM_ALIASES = {
  'crabom. crest': 'Crabominable Crest',
  'a.ampharos crest': 'Ampharos Crest',
};

const FORM_SUFFIX_MAP = {
  'alolan form': 'Alola',
  'alola form': 'Alola',
  'galarian form': 'Galar',
  'galar form': 'Galar',
  'hisuian form': 'Hisui',
  'hisui form': 'Hisui',
  'paldean form': 'Paldea',
  'aevian form': 'Aevian',
  'pom-pom style': 'Pom-Pom',
  "pa'u style": "Pa'u",
  'sensu style': 'Sensu',
  'baile style': '',
  'midnight form': 'Midnight',
  'dusk form': 'Dusk',
  'midday form': '',
  'low key form': 'Low-Key',
  'amped form': '',
  'therian forme': 'Therian',
  'incarnate forme': '',
  'origin forme': 'Origin',
  'sky forme': 'Sky',
  'land forme': '',
  'wash rotom': 'Wash',
  'heat rotom': 'Heat',
  'frost rotom': 'Frost',
  'fan rotom': 'Fan',
  'mow rotom': 'Mow',
  'crowned sword': 'Crowned',
  'crowned shield': 'Crowned',
  'rapid strike style': 'Rapid-Strike',
  'single strike style': '',
  'ice rider': 'Ice',
  'shadow rider': 'Shadow',
  'school form': 'School',
  'solo form': '',
  '10% forme': '10%',
  'complete forme': 'Complete',
  'unbound': 'Unbound',
  'ash-greninja': 'Ash',
  'eternal flower': 'Eternal',
  'zen mode': 'Zen',
  'galarian zen mode': 'Galar-Zen',
  'sandy cloak': 'Sandy',
  'trash cloak': 'Trash',
  'plant cloak': '',
  'sunny form': 'Sunny',
  'rainy form': 'Rainy',
  'snowy form': 'Snowy',
  'attack forme': 'Attack',
  'defense forme': 'Defense',
  'speed forme': 'Speed',
  'white kyurem': 'White',
  'black kyurem': 'Black',
  'dusk mane': 'Dusk-Mane',
  'dawn wings': 'Dawn-Wings',
  'ultra necrozma': 'Ultra',
  'pirouette forme': 'Pirouette',
  'resolute form': 'Resolute',
  'female': 'F',
  'male': '',
  'blue-striped form': 'Blue-Striped',
  'white-striped form': 'White-Striped',
  'bloodmoon': 'Bloodmoon',
  'hearthflame mask': 'Hearthflame',
  'wellspring mask': 'Wellspring',
  'cornerstone mask': 'Cornerstone',
};

// Replace generic "Gym Leader <Name>" strings (e.g. Johto Glitch sidequest cameos) with canonical titles
const TITLE_OVERRIDES = {
  'Gym Leader Falkner': 'Zephyr Master Falkner',
  'Gym Leader Bugsy': 'Walking Bug Encyclopedia Bugsy',
  'Gym Leader Whitney': 'Incredibly Pretty Girl Whitney',
  'Gym Leader Morty': 'Mystic Seer Morty',
  'Gym Leader Chuck': 'Roaring Fist Chuck',
  'Gym Leader Jasmine': 'Steel-Clad Defense Girl Jasmine',
  'Gym Leader Pryce': 'Winter Trainer Pryce',
  'Gym Leader Clair': 'Blessed Dragon User Clair',
  'Gym Leader ALLEN': 'Unown Sovereign ALLEN',
  'Gym Leader Prince Allen': 'Crown Prince Allen',
  'Gym Leader Princess Alice': 'Crown Princess Alice',
  'Gym Leader Prince Allen & Gym Leader Princess Alice': 'Crown Prince Allen & Crown Princess Alice',
};

function decodeHtml(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&eacute;/g, 'é')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function resolveFieldId(rawField) {
  const key = String(rawField || 'No Field').trim().toLowerCase();
  if (FIELD_NAME_MAP[key]) return FIELD_NAME_MAP[key];
  for (const [fId, fDef] of fields.FIELDS.entries()) {
    if (fDef.name.toLowerCase() === key) return fId;
  }
  return 'none';
}

function resolveSpecies(rawName, formLine) {
  let clean = rawName
    .replace(/^(?:Boss|SOS|Shadow|Rift|Anomaly|PULSE)\s+/i, '')
    .replace(/\s*\((?:M|F)\)\s*$/i, '')
    .trim();
  if (clean === 'Flaafy') clean = 'Flaaffy';

  if (formLine) {
    const fl = formLine.trim().toLowerCase();
    if (FORM_SUFFIX_MAP[fl] !== undefined) {
      const suf = FORM_SUFFIX_MAP[fl];
      if (suf) {
        const cand = dex.species.get(`${clean}-${suf}`);
        if (cand.exists) return cand;
      }
    }
    // Check Aevian / Rift / Silvally / Arceus / Oricorio / Rotom forms
    if (fl.includes('aevian')) {
      const cand = dex.species.get(`${clean}-Aevian`);
      if (cand.exists) return cand;
    }
    const typeMatch = /^([a-z]+)\s*(?:type|memory|form|plate)$/i.exec(fl);
    if (typeMatch && (clean === 'Silvally' || clean === 'Arceus')) {
      const cand = dex.species.get(`${clean}-${typeMatch[1]}`);
      if (cand.exists) return cand;
    }
    const directCand = dex.species.get(`${clean}-${formLine.trim()}`);
    if (directCand.exists) return directCand;
  }

  const sp = dex.species.get(clean);
  if (sp.exists) return sp;
  // Strip trailing punctuation/numbers if any
  const fallback = dex.species.get(clean.replace(/[^a-zA-Z0-9 -]/g, ''));
  return fallback.exists ? fallback : null;
}

function resolveMove(rawMove) {
  let clean = rawMove
    .replace(/^-\s*/, '')
    .replace(/\s*\[.*?\]$/, '')
    .replace(/\s*\(.*?\)$/, '')
    .trim();
  if (!clean) return null;
  const lower = clean.toLowerCase();
  if (MOVE_ALIASES[lower]) clean = MOVE_ALIASES[lower];
  if (/^hidden power\s+([a-z]+)$/i.test(clean)) {
    const t = RegExp.$1;
    const hp = dex.moves.get(`Hidden Power ${t}`);
    if (hp.exists) return hp.name;
    return 'Hidden Power';
  }
  const mv = dex.moves.get(toID(clean));
  if (mv.exists) return mv.name;
  return null;
}

function resolveAbility(rawAbil, sp) {
  const first = String(rawAbil || '').split('/')[0].trim();
  const lower = first.toLowerCase();
  const mapped = ABILITY_ALIASES[lower] || first;
  const ab = dex.abilities.get(toID(mapped));
  if (ab.exists) return ab.name;
  return sp?.abilities?.['0'] || 'Pressure';
}

function resolveItem(rawItem, sp) {
  if (!rawItem) return '';
  const clean = rawItem.replace(/^@/, '').trim();
  const lower = clean.toLowerCase();
  const mapped = ITEM_ALIASES[lower] || clean;
  const it = dex.items.get(toID(mapped));
  if (it.exists) return it.name;
  // Handle Silvally Memory / Plate if needed
  return '';
}

function parseStatBlock(statText) {
  const lines = String(statText || '').split('\n').map(s => s.trim()).filter(Boolean);
  let nature = 'Serious';
  const evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
  const ivs = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31};

  const STAT_KEY = {hp: 'hp', atk: 'atk', def: 'def', spa: 'spa', spd: 'spd', spe: 'spe', at: 'atk', df: 'def', sa: 'spa', sd: 'spd', sp: 'spe'};

  for (const line of lines) {
    const natM = /^([A-Za-z]+)\s+Nature$/i.exec(line);
    if (natM && dex.natures.get(natM[1]).exists) {
      nature = dex.natures.get(natM[1]).name;
      continue;
    }
    if (line.startsWith('EVs:')) {
      const rest = line.slice(4).trim();
      const allM = /^All\s+(\d+)/i.exec(rest);
      if (allM) {
        const v = Math.min(252, Number(allM[1]));
        for (const k of Object.keys(evs)) evs[k] = v;
      } else {
        for (const part of rest.split(',')) {
          const pm = /(\d+)\s*([A-Za-z]+)/.exec(part.trim());
          if (pm && STAT_KEY[pm[2].toLowerCase()]) {
            evs[STAT_KEY[pm[2].toLowerCase()]] = Math.min(252, Number(pm[1]));
          }
        }
      }
    } else if (line.startsWith('IVs:')) {
      const rest = line.slice(4).trim();
      const allM = /^All\s+(\d+)/i.exec(rest);
      if (allM) {
        const v = Math.max(0, Math.min(31, Number(allM[1])));
        for (const k of Object.keys(ivs)) ivs[k] = v;
      } else {
        for (const part of rest.split(',')) {
          const pm = /(\d+)\s*([A-Za-z]+)/.exec(part.trim());
          if (pm && STAT_KEY[pm[2].toLowerCase()]) {
            ivs[STAT_KEY[pm[2].toLowerCase()]] = Math.max(0, Math.min(31, Number(pm[1])));
          }
        }
      }
    }
  }
  return {nature, evs, ivs};
}

// Categorize & filter Major Story Fights across Reborn, Rejuvenation, and Desolation
const MAJOR_RULES = {
  Reborn: [
    {re: /\b(Julia|Florinia|Shelly|Shade|Aya|Serra|Noel|Radomus|Luna|Samson|Charlotte|T3RR4|Terra|Ciel|Adrienn|Titania|Amaria|Hardy|Saphira)\b/i, cat: 'gym'},
    {re: /\b(Heather|Laura|Bennett|Elias|Parson El|Anna|Champion Lin|Meteor Champion Lin|Anomaly|Arceus|Mewtwo|Rayquaza|Giratina|Darkrai|Necrozma|Zekrom|Reshiram|Kyurem|Ho-Oh|Lugia|Dialga|Palkia|Xerneas|Yveltal|Zygarde|Solgaleo|Lunala)\b/i, cat: 'elite'},
    {re: /\b(Cain|Fern|Victoria|Cal|Taka)\b/i, cat: 'rival'},
    {re: /\b(Solaris|ZEL|Pulse|PULSE|Sirius|Sigmund|Blake|Aster|Eclipse|Lin|Connal|Orderly John)\b/i, cat: 'evil'},
    {re: /\b(Corey|Kiki|Ame|Gardevoir|adrienn|Eve|Lumi|Zero|Seacrest)\b/i, cat: 'boss'},
  ],
  Rejuvenation: [
    {re: /\b(Venam|Keta|Marianette|Narcissa|Valarie|Crawli|Angie|Amber|Erick|Flora|Florin|Puppet Master|Souta|Adam|Risa|Talon|Lavender|Damien|Alexandra|Saki|Texen|Allen|Alice|Falkner|Bugsy|Whitney|Morty|Chuck|Jasmine|Pryce|Clair)\b/i, cat: 'gym'},
    {re: /\b(Madame X|Madame Shogun|Karma|Vitus|Indriad|Celine|Nymiera|Variya|Rift|Regirock|Gyarados|Volcanion|Ferrothorn|Galvantula|Garbodor|Chandelure|Carnivine|Gardevoir)\b/i, cat: 'elite'},
    {re: /\b(Ren|Melia|Aelita|Nim|Lorna|Kanon|Rorim|Reina|Huey|Novae|Crescent|Erin)\b/i, cat: 'rival'},
    {re: /\b(Zetta|Madelis|Geara|Neved|Cassandra|Nastasia|Jenkel|Rory|Clear|Kieran|Eli and Sharon)\b/i, cat: 'evil'},
  ],
  Desolation: [
    {re: /\b(Connor|Aderyn|Tristan|Emily|Aurora|Rosetta|Garret|Aaron|Reeve|Ava)\b/i, cat: 'gym'},
    {re: /\b(Lilith|Waldenhall|Darkrai|Mesprit|Mespirit|Dracozolt|Soleil|Grand Rogue)\b/i, cat: 'elite'},
    {re: /\b(Scarlett|Hardy|Shiv|Celeste|Sena)\b/i, cat: 'rival'},
    {re: /\b(Nova|Baron|Amelia|Robertson|Clarke|Cedric|Memphis|Andrea|Kuiki|Mattias|Callisto)\b/i, cat: 'evil'},
  ],
};

const EXCLUDE_TRAINERS = /^(Meteor Grunt|Team Xen (?!Executive|Admin)|Xen Grunt|Xen Mage|Xen Analyst|Team Crescent Grunt|Villager|Elite Villager|Youngster|Lass|Street Rat|Doxy|Casanova|Picnicker|Camper|Hiker|Fisherman|Clerk|Tourist|Schoolgirl|Schoolboy|Arcade Star|Hotshot (?!Fern)|Black Fox (?!Ace Amelia|Boss Lilith|Scientist Waldenhall)|Servant (?!Angie)|Team Anti-Assist|Prison Guard|Trainer (?:Connor|Aderyn|Emily|Scarlett|Nova|Shiv|Amelia)$)/i;

function classifyTrainer(game, name, section, isBossTable, monCount) {
  if (EXCLUDE_TRAINERS.test(name)) return null;
  const rules = MAJOR_RULES[game] || [];
  for (const r of rules) {
    if (r.re.test(name)) {
      // Elevate late-game / postgame fights in Postgame / Elite sections
      if (/Postgame|Elite|Champion|Victory|Tier\s*[4-8]|New World|Deux Finalis/i.test(section) && r.cat !== 'elite') {
        return /Badge/i.test(section) ? 'gym' : r.cat;
      }
      return r.cat;
    }
  }
  if (isBossTable && monCount >= 1) return 'boss';
  if (/Badge/i.test(section) && monCount >= 5) return 'gym';
  return null;
}

function normalizeParty(mons) {
  const out = [];
  const seenExact = new Set();
  let hasMega = false;

  for (const m of mons) {
    if (!m || !m.species) continue;
    const sp = dex.species.get(m.species);
    if (!sp.exists) continue;

    // Convert pre-Mega entries (e.g. from DesoCalc) into base species + requiredItem
    let finalSpecies = sp.name;
    let finalItem = m.item || '';
    if (sp.isMega && sp.baseSpecies) {
      finalSpecies = sp.baseSpecies;
      if (!finalItem && sp.requiredItem) finalItem = sp.requiredItem;
    }

    const itemObj = dex.items.get(finalItem);
    const isMegaHolder = !!itemObj?.megaStone;
    if (isMegaHolder && hasMega) {
      // Secondary Mega holder in double/gauntlet tables keeps Life Orb so Mega Clause works cleanly
      finalItem = 'Life Orb';
    } else if (isMegaHolder) {
      hasMega = true;
    }

    const dedupKey = `${finalSpecies}|${m.level}`;
    if (seenExact.has(dedupKey) && mons.length > 6) continue;
    seenExact.add(dedupKey);

    const moves = (m.moves || []).filter(Boolean).slice(0, 4);
    if (!moves.length) moves.push('Tackle');

    out.push({
      s: finalSpecies,
      l: Math.max(1, Math.min(250, Number(m.level) || 50)),
      i: finalItem,
      a: m.ability || sp.abilities['0'] || 'Pressure',
      n: m.nature || 'Serious',
      m: moves,
      e: m.evs || {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0},
      v: m.ivs || {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31},
      ...(m.gender ? {g: m.gender} : {}),
    });
  }

  // If double battle or raid boss + SOS had > 6 mons, take lead 2 + top 4 highest-level aces (preserving order)
  let party = out;
  if (party.length > 6) {
    const indexed = party.map((p, idx) => ({p, idx}));
    const keep = new Set([0, 1]);
    indexed
      .slice(2)
      .sort((a, b) => b.p.l - a.p.l || b.idx - a.idx)
      .slice(0, 4)
      .forEach(x => keep.add(x.idx));
    party = indexed.filter(x => keep.has(x.idx)).map(x => x.p).slice(0, 6);
  }

  // Keep Zoroark out of final party slot
  const lastIdx = party.length - 1;
  if (lastIdx > 0 && dex.species.get(party[lastIdx].s).baseSpecies === 'Zoroark') {
    const tmp = party[0];
    party[0] = party[lastIdx];
    party[lastIdx] = tmp;
  }

  return party;
}

function compactSet(p) {
  const evVals = Object.values(p.e);
  const allSameEv = evVals.every(v => v === evVals[0]);
  const ivVals = Object.values(p.v);
  const allSameIv = ivVals.every(v => v === ivVals[0]);
  const c = {
    s: p.s,
    l: p.l,
    a: p.a,
    n: p.n,
    m: p.m,
  };
  if (p.i) c.i = p.i;
  if (p.g) c.g = p.g;
  if (allSameEv) {
    if (evVals[0] !== 0) c.e = evVals[0];
  } else {
    c.e = p.e;
  }
  if (allSameIv) {
    if (ivVals[0] !== 31) c.v = ivVals[0];
  } else {
    c.v = p.v;
  }
  return c;
}

function expandSet(c, forceLevel = null) {
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

function parseWalkthroughHtml(game, htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const re = /<(h[123])[^>]*>([\s\S]*?)<\/\1>|<div class="trainer_section">([\s\S]*?)<\/table>\s*<\/div>/g;
  let h1 = '', h2 = '', h3 = '';
  const results = [];
  let m;

  while ((m = re.exec(html)) !== null) {
    if (m[1]) {
      const txt = decodeHtml(m[2].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
      if (m[1] === 'h1') { h1 = txt; h2 = ''; h3 = ''; }
      else if (m[1] === 'h2') { h2 = txt; h3 = ''; }
      else if (m[1] === 'h3') { h3 = txt; }
      continue;
    }

    const tbl = m[3];
    const vsMatch = /<strong>(VS[^<]*)<\/strong>/.exec(tbl);
    if (!vsMatch) continue;
    const rawVs = decodeHtml(vsMatch[1]).replace(/\s+/g, ' ').trim();
    if (!rawVs.startsWith('VS:') && !rawVs.startsWith('VS Boss:')) continue;

    const isBossTable = rawVs.startsWith('VS Boss:');
    let trainerName = rawVs.replace(/^VS(?: Boss)?:\s*/, '').trim();
    if (TITLE_OVERRIDES[trainerName]) trainerName = TITLE_OVERRIDES[trainerName];
    trainerName = trainerName.replace(/\bGym Leader\s+/gi, 'Leader ');

    const fieldMatch = /<div>Field:\s*([^<]+)<\/div>/.exec(tbl);
    const rawField = fieldMatch ? decodeHtml(fieldMatch[1]).trim() : 'No Field';
    const fieldId = resolveFieldId(rawField);

    const rows = tbl.split('<tr>').slice(3);
    const rawMons = [];
    for (const row of rows) {
      const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(x =>
        decodeHtml(x[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).trim()
      );
      if (tds.length < 3) continue;
      const lines0 = tds[0].split('\n').map(s => s.trim()).filter(Boolean);
      const headM = /^(?:Boss |SOS |Shadow )?(.+?)(?:\s*\(([MF])\))?,\s*Lv\.\s*(\d+)/i.exec(lines0[0] || '');
      if (!headM) continue;
      const rawSpName = headM[1].trim();
      const gender = headM[2] || '';
      const level = Number(headM[3]) || 50;

      // Optional form line is line 1 if it doesn't start with @, Ability:, Typing:, Shields:, Appears:
      let formLine = '';
      if (lines0[1] && !/^(@|Ability:|Typing:|Shields:|Appears:|Immunities|On Entry|Shield Break)/i.test(lines0[1])) {
        formLine = lines0[1];
      }
      const sp = resolveSpecies(rawSpName, formLine);
      if (!sp) continue;

      const itemLine = lines0.find(l => l.startsWith('@'));
      const abilLine = lines0.find(l => l.startsWith('Ability:'));
      const item = resolveItem(itemLine, sp);
      const ability = resolveAbility(abilLine ? abilLine.slice(8) : '', sp);

      const moves = tds[1]
        .split('\n')
        .map(resolveMove)
        .filter(Boolean);
      const {nature, evs, ivs} = parseStatBlock(tds[2]);

      rawMons.push({
        species: sp.name,
        level,
        gender,
        item,
        ability,
        moves,
        nature,
        evs,
        ivs,
      });
    }

    if (!rawMons.length) continue;
    const section = h2 || h3 || h1 || 'Story';
    const cat = classifyTrainer(game, trainerName, `${h1} ${h2} ${h3}`, isBossTable, rawMons.length);
    if (!cat) continue;
    // Skip very tiny 1-2 mon early skirmishes unless it's Cain/Victoria/Fern starter rival or a Raid Boss
    if (rawMons.length < 3 && !isBossTable && !/Cain|Victoria|Fern|Ren|Shiv/i.test(trainerName)) continue;

    const party = normalizeParty(rawMons);
    if (!party.length) continue;

    results.push({
      game,
      name: trainerName,
      section: section.replace(/^Chapter\s+\d+:\s*/i, '').replace(/:\s*TODO$/i, '').trim(),
      category: cat,
      fieldId,
      cap: Math.max(...party.map(p => p.l)),
      team: party.map(compactSet),
    });
  }

  return results;
}

// Supplement Desolation Episode 6 major fights from DesoCalc sets
function parseDesolationEp6(desoSetsPath) {
  if (!fs.existsSync(desoSetsPath)) return [];
  const sandbox = {};
  vm.runInNewContext(fs.readFileSync(desoSetsPath, 'utf8'), sandbox);
  const byTrainer = new Map();
  for (const [spName, trainers] of Object.entries(sandbox.SETDEX_SV || {})) {
    for (const [tr, set] of Object.entries(trainers)) {
      if (!byTrainer.has(tr)) byTrainer.set(tr, []);
      byTrainer.get(tr).push({species: spName, ...set});
    }
  }

  const EP6_TARGETS = [
    {key: 'Grand Idol Rosetta', name: 'Grand Idol Rosetta', section: 'Starlight Badge (Ep. 6)', cat: 'gym', fieldId: 'starlight'},
    {key: 'Brawler Garret', name: 'Brawler Garret', section: 'Fist Badge (Ep. 6)', cat: 'gym', fieldId: 'colosseum'},
    {key: 'City Director Aaron [Doubles Battle]', name: 'City Director Aaron', section: 'Alloy Badge (Ep. 6)', cat: 'gym', fieldId: 'factory'},
    {key: 'East Icon Reeve', name: 'East Icon Reeve', section: 'Cellia East Nightclub (Ep. 6)', cat: 'gym', fieldId: 'dancefloor'},
    {key: 'Black Fox Boss Lilith 1', name: 'Black Fox Boss Lilith', section: 'Dreamscape Clash (Ep. 6)', cat: 'elite', fieldId: 'darkness2'},
    {key: 'Black Fox Scientist Waldenhall', name: 'Black Fox Scientist Waldenhall', section: 'Perfection Lab (Ep. 6)', cat: 'elite', fieldId: 'glitch'},
    {key: 'Team Crescent Head Baron 1', name: 'Team Crescent Head Baron', section: 'Mt. Vejyr Rematch (Ep. 6)', cat: 'evil', fieldId: 'volcanictop'},
    {key: 'Team Crescent Head Baron 2', name: 'Team Crescent Head Baron', section: 'Cellia Siege (Ep. 6)', cat: 'evil', fieldId: 'forest'},
    {key: 'Agent Cedric 2', name: 'Agent Cedric', section: 'Cellia Showdown (Ep. 6)', cat: 'evil', fieldId: 'wasteland'},
    {key: 'Fox Lieutenant Hardy 4', name: 'Fox Lieutenant Hardy', section: 'Episode 6 Rematch', cat: 'rival', fieldId: 'rocky'},
    {key: 'Black Fox Ace Amelia 3', name: 'Black Fox Ace Amelia', section: 'Episode 6 Showdown', cat: 'evil', fieldId: 'factory'},
    {key: 'Trainer Scarlett 3', name: 'Idol Scarlett', section: 'Episode 6 Rival Match', cat: 'rival', fieldId: 'rainbow'},
  ];

  const out = [];
  for (const t of EP6_TARGETS) {
    const rawList = byTrainer.get(t.key);
    if (!rawList) continue;
    const mapped = rawList.map(m => {
      const sp = resolveSpecies(m.species, '');
      if (!sp) return null;
      return {
        species: sp.name,
        level: m.level || 65,
        item: resolveItem(m.item, sp),
        ability: resolveAbility(m.ability, sp),
        nature: m.nature && dex.natures.get(m.nature).exists ? dex.natures.get(m.nature).name : 'Serious',
        moves: (m.moves || []).map(resolveMove).filter(Boolean),
        evs: {
          hp: m.evs?.hp || 0,
          atk: m.evs?.at || 0,
          def: m.evs?.df || 0,
          spa: m.evs?.sa || 0,
          spd: m.evs?.sd || 0,
          spe: m.evs?.sp || 0,
        },
        ivs: {
          hp: m.ivs?.hp ?? 31,
          atk: m.ivs?.at ?? 31,
          def: m.ivs?.df ?? 31,
          spa: m.ivs?.sa ?? 31,
          spd: m.ivs?.sd ?? 31,
          spe: m.ivs?.sp ?? 31,
        },
      };
    }).filter(Boolean);
    const party = normalizeParty(mapped);
    if (party.length) {
      out.push({
        game: 'Desolation',
        name: t.name,
        section: t.section,
        category: t.cat,
        fieldId: t.fieldId,
        cap: Math.max(...party.map(p => p.l)),
        team: party.map(compactSet),
      });
    }
  }
  return out;
}

// Optional raw Pokémon Essentials PBS `trainers.txt` parser
function parsePbsTrainersTxt(pbsPath, game = 'Reborn', defaultField = 'none') {
  const lines = fs.readFileSync(pbsPath, 'utf8').split(/\r?\n/);
  const blocks = [];
  let cur = [];
  for (const raw of lines) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    if (line === '#-------------------' || (line.startsWith('[') && line.endsWith(']'))) {
      if (cur.length) blocks.push(cur);
      cur = [line];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) blocks.push(cur);

  const out = [];
  for (const b of blocks) {
    // Support both Essentials v19+ [TYPE,Name,Version] and classic 3-line PBS format
    let titleAndName = '';
    const mons = [];
    if (b[0].startsWith('[')) {
      const inner = b[0].slice(1, -1).split(',').map(s => s.trim());
      titleAndName = `${inner[0]} ${inner[1] || ''}`.trim();
      let m = null;
      for (const l of b.slice(1)) {
        const kv = /^([A-Za-z]+)\s*=\s*(.+)$/.exec(l);
        if (!kv) continue;
        const [, k, v] = kv;
        if (k === 'Pokemon') {
          if (m) mons.push(m);
          const [spRaw, lvRaw] = v.split(',');
          const sp = resolveSpecies(spRaw.trim(), '');
          m = sp ? {species: sp.name, level: Number(lvRaw) || 50, moves: []} : null;
        } else if (m) {
          if (k === 'Item') m.item = resolveItem(v, dex.species.get(m.species));
          else if (k === 'Ability') m.ability = resolveAbility(v, dex.species.get(m.species));
          else if (k === 'Moves') m.moves = v.split(',').map(resolveMove).filter(Boolean);
          else if (k === 'Nature') m.nature = v.trim();
        }
      }
      if (m) mons.push(m);
    }
    if (titleAndName && mons.length >= 3) {
      const party = normalizeParty(mons);
      if (party.length) {
        out.push({
          game,
          name: titleAndName.replace(/\bGym Leader\s+/gi, 'Leader '),
          section: 'Imported PBS',
          category: 'boss',
          fieldId: defaultField,
          cap: Math.max(...party.map(p => p.l)),
          team: party.map(compactSet),
        });
      }
    }
  }
  return out;
}

function deduplicateAndCap(rawFights) {
  const seenSig = new Set();
  const deduped = [];

  for (const f of rawFights) {
    // Signature: game + name + fieldId + species/level list
    const sig = `${f.game}|${f.name}|${f.fieldId}|${f.team.map(p => `${p.s}:${p.l}:${(p.m || []).join(',')}`).join(';')}`;
    if (seenSig.has(sig)) continue;

    // Also collapse starter-variant duplicates of the exact same rival encounter at the same cap & section
    // (keep the first starter variant so Cain #1 isn't listed 3x in a row with Popplio vs Rowlet vs Litten!)
    const rivalSlotSig = `${f.game}|${f.name}|${f.section}|${f.fieldId}|${f.cap}|${f.team.length}`;
    if (seenSig.has(rivalSlotSig)) continue;

    seenSig.add(sig);
    seenSig.add(rivalSlotSig);
    deduped.push(f);
  }

  // Assign stable IDs & encounter numbers when a trainer appears multiple times
  const countsByName = new Map();
  for (const f of deduped) {
    const key = `${f.game}|${f.name}`;
    countsByName.set(key, (countsByName.get(key) || 0) + 1);
  }
  const idxByName = new Map();
  const usedIds = new Set();

  return deduped.map((f, globalIdx) => {
    const key = `${f.game}|${f.name}`;
    const total = countsByName.get(key) || 1;
    const cur = (idxByName.get(key) || 0) + 1;
    idxByName.set(key, cur);

    const baseSlug = `${f.game.slice(0, 3).toLowerCase()}_${toID(f.name)}${total > 1 ? `_${cur}` : ''}`;
    let id = baseSlug;
    let n = 2;
    while (usedIds.has(id)) id = `${baseSlug}_${n++}`;
    usedIds.add(id);

    const fieldName = f.fieldId === 'none' ? 'Plain Field' : (fields.FIELDS.get(f.fieldId)?.name || f.fieldId);
    const encTag = total > 1 ? ` #${cur}` : '';
    const subtitle = `${f.section} · ${fieldName} · Cap Lv.${f.cap}`;

    return {
      id,
      order: globalIdx + 1,
      game: f.game,
      category: f.category,
      name: f.name,
      displayName: `${f.name}${encTag}`,
      section: f.section,
      fieldId: f.fieldId,
      fieldName,
      cap: f.cap,
      ace: f.team[f.team.length - 1]?.s || f.team[0]?.s,
      subtitle,
      team: f.team,
    };
  });
}

function validateAllBosses(bosses) {
  const samplePlayerTeam = randomTeam({dexMode: 'natdex', level: 50});
  let validated = 0;

  for (const b of bosses) {
    if (/gym leader/i.test(b.name)) {
      throw new Error(`Forbidden "Gym Leader" title in boss: ${b.name}`);
    }
    for (const levelMode of ['lv50', 'canonical']) {
      let reqP1 = null;
      let reqP2 = null;
      const battle = createBattle('singles', {
        dexMode: 'natdex',
        levelMode,
        send(type, data) {
          if (type === 'sideupdate') {
            const nl = data.indexOf('\n');
            const sid = data.slice(0, nl);
            const line = data.slice(nl + 1);
            if (line.startsWith('|request|')) {
              const parsed = JSON.parse(line.slice(9));
              if (sid === 'p1') reqP1 = parsed;
              if (sid === 'p2') reqP2 = parsed;
            }
          }
        },
      });
      battle.rfieldInitial = b.fieldId;
      const pLvl = levelMode === 'canonical' ? b.cap : 50;
      const p1Team = samplePlayerTeam.map(s => ({...s, level: pLvl}));
      const p2Team = b.team.map(c => expandSet(c, levelMode === 'canonical' ? null : 50));

      battle.setPlayer('p1', {name: 'Validator', team: p1Team});
      battle.setPlayer('p2', {name: b.name, team: p2Team});
      battle.sendUpdates?.();

      if (reqP1 && !reqP1.wait) battle.choose('p1', 'default');
      if (reqP2 && !reqP2.wait) {
        const aiChoice = ai.choose(battle, battle.sides[1], reqP2, 'hard');
        if (!battle.choose('p2', aiChoice)) battle.choose('p2', 'default');
      }
      battle.destroy();
    }
    validated++;
  }
  return validated;
}

function main() {
  const args = process.argv.slice(2);
  const pbsIdx = args.indexOf('--pbs');
  let raw = [];

  if (pbsIdx >= 0 && args[pbsIdx + 1]) {
    const gameIdx = args.indexOf('--game');
    const fieldIdx = args.indexOf('--field');
    const game = gameIdx >= 0 ? args[gameIdx + 1] : 'Reborn';
    const field = fieldIdx >= 0 ? args[fieldIdx + 1] : 'none';
    raw = parsePbsTrainersTxt(args[pbsIdx + 1], game, field);
  } else {
    const dirIdx = args.indexOf('--dir');
    const dir = dirIdx >= 0 ? args[dirIdx + 1] : '';
    if (!dir) {
      console.error('Usage: node tools/import-bosses.js --dir <scratchDir> OR --pbs <trainers.txt>');
      process.exit(1);
    }
    const reb = parseWalkthroughHtml('Reborn', path.join(dir, 'reborn.html'));
    const rej = parseWalkthroughHtml('Rejuvenation', path.join(dir, 'rejuv.html'));
    const des = [
      ...parseWalkthroughHtml('Desolation', path.join(dir, 'deso.html')),
      ...parseDesolationEp6(path.join(dir, 'deso_sets.js')),
    ];
    raw = [...reb, ...rej, ...des];
  }

  const bosses = deduplicateAndCap(raw);
  const byGame = {};
  const byCat = {};
  for (const b of bosses) {
    byGame[b.game] = (byGame[b.game] || 0) + 1;
    byCat[b.category] = (byCat[b.category] || 0) + 1;
  }
  console.log(`Extracted ${bosses.length} unique major fights:`, byGame, byCat);

  const count = validateAllBosses(bosses);
  console.log(`Live Showdown Battle validated ${count}/${bosses.length} bosses (Lv.50 + Canonical Story modes)!`);

  const outPath = path.resolve(__dirname, '..', 'server', 'boss-data.json');
  const json = JSON.stringify(bosses);
  fs.writeFileSync(outPath, json);
  console.log(`Wrote ${outPath} (${(json.length / 1024).toFixed(1)} KB)`);
}

if (require.main === module) {
  main();
}

module.exports = {expandSet, compactSet, parsePbsTrainersTxt};
