import {STATUS_NAMES, STAT_NAMES, esc} from './data.js';

/**
 * Converts Showdown protocol lines into readable HTML log entries and describes
 * visual events for the animation layer.
 */
export class LogFormatter {
  constructor() {
    this.you = -1; // seat index of the viewer
    this.sideNames = {}; // p1 -> trainer name
    this.ffa = false;
  }
  sideOf(ident) {
    return ident ? ident.slice(0, 2) : '';
  }
  monName(ident) {
    if (!ident) return '';
    const idx = ident.indexOf(': ');
    return idx >= 0 ? ident.slice(idx + 2) : ident;
  }
  /** "the opposing Garchomp" / "Garchomp" / "Ame's Garchomp" */
  pk(ident, cap = false) {
    const sid = this.sideOf(ident);
    const name = esc(this.monName(ident));
    const mine = this.you >= 0 && sid === `p${this.you + 1}`;
    let out;
    if (mine) out = name;
    else if (this.ffa || this.you < 0) out = `${esc(this.sideNames[sid] || sid)}'s ${name}`;
    else out = `the opposing ${name}`;
    return cap ? out.charAt(0).toUpperCase() + out.slice(1) : out;
  }
  effectName(s) {
    if (!s) return '';
    return s.replace(/^\[from\]\s*/, '').replace(/^(move|ability|item):\s*/, '');
  }
  kw(args) {
    const kw = {};
    for (const a of args) {
      const m = /^\[(\w+)\]\s*(.*)$/.exec(a);
      if (m) kw[m[1]] = m[2] || true;
    }
    return kw;
  }

  /**
   * @returns {{html?: string, cls?: string, ev?: object}}
   */
  format(line) {
    if (!line || line[0] !== '|') return {};
    const parts = line.slice(1).split('|');
    const cmd = parts[0];
    const args = parts.slice(1);
    const kw = this.kw(args);
    const from = kw.from ? this.effectName(kw.from) : '';
    const of = kw.of ? this.pk(kw.of) : '';
    switch (cmd) {
    case 'player':
      if (args[1]) this.sideNames[args[0]] = args[1];
      return {};
    case 'gametype':
      this.ffa = args[0] === 'freeforall';
      return {};
    case 'turn':
      return {html: `Turn ${args[0]}`, cls: 'turn', ev: {type: 'turn', turn: Number(args[0])}};
    case 'start':
      return {html: 'Battle started!', cls: 'minor'};
    case 'switch': case 'drag': case 'replace': {
      const [ident, details, hp] = args;
      const sid = this.sideOf(ident);
      const trainer = esc(this.sideNames[sid] || sid);
      const mine = this.you >= 0 && sid === `p${this.you + 1}`;
      let html;
      if (cmd === 'drag') html = `${this.pk(ident, true)} was dragged out!`;
      else if (mine) html = `Go! <b>${esc(this.monName(ident))}</b>!`;
      else html = `${trainer} sent out <b>${esc(this.monName(ident))}</b>!`;
      return {html, ev: {type: 'switch', ident, details, hp, sid}};
    }
    case 'detailschange': case '-formechange':
      return {ev: {type: 'forme', ident: args[0], details: args[1]}};
    case 'move': {
      const [ident, move, target] = args;
      let html = `<span class="mv">${this.pk(ident, true)} used <b>${esc(move)}</b>!</span>`;
      if (kw.from && !/lockedmove/i.test(kw.from)) html = `<span class="mv">${this.pk(ident, true)} used <b>${esc(move)}</b>! <span class="minor">(${esc(from)})</span></span>`;
      return {html, ev: {type: 'move', ident, move, target, miss: !!kw.miss, still: !!kw.still}};
    }
    case 'cant': {
      const [ident, reason, move] = args;
      const r = this.effectName(reason);
      const msgs = {
        slp: 'is fast asleep.', frz: 'is frozen solid!', par: 'is paralyzed! It can\'t move!', flinch: 'flinched and couldn\'t move!',
        recharge: 'must recharge!', Taunt: `can't use ${esc(move)} after the taunt!`, 'Focus Punch': 'lost its focus and couldn\'t move!',
        Disable: `can't use ${esc(move)} — it's disabled!`, nopp: `has no PP left for ${esc(move)}!`, Truant: 'is loafing around!',
        'Heal Block': `can't use ${esc(move)} because of Heal Block!`, Imprison: `can't use the sealed ${esc(move)}!`,
      };
      return {html: `${this.pk(ident, true)} ${msgs[r] || `couldn't move (${esc(r)}).`}`, ev: {type: 'cant', ident}};
    }
    case 'faint':
      return {html: `${this.pk(args[0], true)} fainted!`, cls: 'eff', ev: {type: 'faint', ident: args[0]}};
    case '-damage': {
      const [ident, hp] = args;
      let html = '';
      if (from) {
        const fromMsgs = {
          brn: 'was hurt by its burn!', psn: 'was hurt by poison!', tox: 'was hurt by poison!', Recoil: 'was damaged by the recoil!',
          'Life Orb': 'lost some of its HP!', 'Stealth Rock': 'Pointed stones dug into', Spikes: 'was hurt by the spikes!',
          sandstorm: 'is buffeted by the sandstorm!', Sandstorm: 'is buffeted by the sandstorm!', hail: 'is buffeted by the hail!',
          'Leech Seed': 'had its health sapped by Leech Seed!', confusion: 'hurt itself in its confusion!', 'Rocky Helmet': 'was hurt by the Rocky Helmet!',
          'Rough Skin': 'was hurt!', 'Iron Barbs': 'was hurt!', Curse: 'is afflicted by the curse!', Nightmare: 'is locked in a nightmare!',
          'Salt Cure': 'is being salt cured!', 'Black Sludge': 'was hurt by the Black Sludge!', 'Sticky Barb': 'was hurt by the Sticky Barb!',
        };
        const m = fromMsgs[from];
        if (from === 'Stealth Rock') html = `Pointed stones dug into ${this.pk(ident)}!`;
        else if (m) html = `${this.pk(ident, true)} ${m}`;
        else html = `${this.pk(ident, true)} was hurt by ${esc(from)}${of ? ` (${of})` : ''}!`;
      }
      return {html, cls: 'minor', ev: {type: 'damage', ident, hp, from: !!from}};
    }
    case '-heal': {
      const [ident, hp] = args;
      let html = '';
      if (from) {
        if (from === 'Leftovers') html = `${this.pk(ident, true)} restored a little HP using its Leftovers!`;
        else if (from === 'drain') html = `${of || 'The target'} had its energy drained!`;
        else html = `${this.pk(ident, true)} restored HP using ${esc(from)}!`;
      } else html = `${this.pk(ident, true)} had its HP restored.`;
      return {html, cls: 'minor', ev: {type: 'heal', ident, hp}};
    }
    case '-sethp':
      return {ev: {type: 'damage', ident: args[0], hp: args[1], silent: true}};
    case '-status': {
      const [ident, st] = args;
      const verbs = {brn: 'was burned!', par: 'is paralyzed! It may be unable to move!', slp: 'fell asleep!', frz: 'was frozen solid!', psn: 'was poisoned!', tox: 'was badly poisoned!'};
      let html = `${this.pk(ident, true)} ${verbs[st] || 'got a status condition.'}`;
      if (from && from !== 'Rest') html += ` <span class="minor">(${esc(from)})</span>`;
      if (from === 'Rest') html = `${this.pk(ident, true)} slept and became healthy!`;
      return {html, ev: {type: 'status', ident, status: st}};
    }
    case '-curestatus': {
      const [ident, st] = args;
      const msgs = {slp: 'woke up!', frz: 'thawed out!', par: 'was cured of paralysis.', brn: 'healed its burn!', psn: 'was cured of its poisoning.', tox: 'was cured of its poisoning.'};
      return {html: `${this.pk(ident, true)} ${msgs[st] || 'was cured.'}`, ev: {type: 'status', ident, status: ''}};
    }
    case '-cureteam':
      return {html: `${this.pk(args[0], true)}'s team was cured of status problems!`};
    case '-boost': case '-unboost': {
      const [ident, stat, amt] = args;
      const n = Number(amt);
      const word = cmd === '-boost'
        ? (n >= 3 ? 'rose drastically' : n === 2 ? 'rose sharply' : n === 0 ? "won't go any higher" : 'rose')
        : (n >= 3 ? 'severely fell' : n === 2 ? 'harshly fell' : n === 0 ? "won't go any lower" : 'fell');
      let html = `${this.pk(ident, true)}'s ${STAT_NAMES[stat] || stat} ${word}!`;
      if (from) html += ` <span class="minor">(${esc(from)})</span>`;
      return {html, ev: {type: cmd === '-boost' ? 'boost' : 'unboost', ident}};
    }
    case '-setboost':
      return {html: `${this.pk(args[0], true)} maximized its ${STAT_NAMES[args[1]] || args[1]}!`, ev: {type: 'boost', ident: args[0]}};
    case '-clearboost': case '-clearallboost':
      return {html: cmd === '-clearallboost' ? 'All stat changes were eliminated!' : `${this.pk(args[0], true)}'s stat changes were removed!`};
    case '-clearnegativeboost':
      return {html: `${this.pk(args[0], true)}'s lowered stats returned to normal!`};
    case '-invertboost':
      return {html: `${this.pk(args[0], true)}'s stat changes were inverted!`};
    case '-weather': {
      const w = args[0];
      if (kw.upkeep) return {};
      const names = {RainDance: 'It started to rain!', SunnyDay: 'The sunlight turned harsh!', Sandstorm: 'A sandstorm kicked up!', Hail: 'It started to hail!', Snowscape: 'It started to snow!', Snow: 'It started to snow!', DesolateLand: 'The sunlight turned extremely harsh!', PrimordialSea: 'A heavy rain began to fall!', DeltaStream: 'Mysterious strong winds are protecting Flying-type Pokémon!', none: 'The weather cleared up.'};
      let html = names[w] || `The weather became ${esc(w)}.`;
      if (from) html += ` <span class="minor">(${esc(from)}${of ? ` — ${of}` : ''})</span>`;
      return {html, ev: {type: 'weather', weather: w}};
    }
    case '-fieldstart': {
      const c = this.effectName(args[0]);
      if (c === 'Reborn Field') return {};
      const msgs = {'Electric Terrain': 'An electric current ran across the battlefield!', 'Grassy Terrain': 'Grass grew to cover the battlefield!', 'Misty Terrain': 'Mist swirled around the battlefield!', 'Psychic Terrain': 'The battlefield got weird!', 'Trick Room': 'The dimensions were twisted!', 'Gravity': 'Gravity intensified!', 'Magic Room': 'It created a bizarre area in which held items lose their effects!', 'Wonder Room': 'It created a bizarre area in which Defense and Sp. Def stats are swapped!'};
      return {html: msgs[c] || `${esc(c)} started!`, ev: {type: 'fieldcond'}};
    }
    case '-fieldend': {
      const c = this.effectName(args[0]);
      if (c === 'Reborn Field') return {};
      return {html: `${esc(c)} ended.`, cls: 'minor', ev: {type: 'fieldcond'}};
    }
    case '-sidestart': {
      const side = args[0].slice(0, 2);
      const c = this.effectName(args[1]);
      const owner = this.you >= 0 && side === `p${this.you + 1}` ? 'your team' : `${esc(this.sideNames[side] || side)}'s team`;
      const msgs = {'Stealth Rock': `Pointed stones float in the air around ${owner}!`, Spikes: `Spikes were scattered at the feet of ${owner}!`, 'Toxic Spikes': `Poison spikes were scattered at the feet of ${owner}!`, 'Sticky Web': `A sticky web spreads out beneath ${owner}!`, Reflect: `Reflect made ${owner} stronger against physical moves!`, 'Light Screen': `Light Screen made ${owner} stronger against special moves!`, 'Aurora Veil': `Aurora Veil made ${owner} stronger against physical and special moves!`, Tailwind: `The Tailwind blew from behind ${owner}!`, Safeguard: `${owner} cloaked itself in a mystical veil!`};
      return {html: msgs[c] || `${esc(c)} started on ${owner}!`, ev: {type: 'sidecond'}};
    }
    case '-sideend': {
      const side = args[0].slice(0, 2);
      const c = this.effectName(args[1]);
      const owner = this.you >= 0 && side === `p${this.you + 1}` ? 'your team' : `${esc(this.sideNames[side] || side)}'s team`;
      return {html: `${esc(c)} wore off for ${owner}.`, cls: 'minor', ev: {type: 'sidecond'}};
    }
    case '-crit':
      return {html: 'A critical hit!', cls: 'eff', ev: {type: 'crit', ident: args[0]}};
    case '-supereffective':
      return {html: "It's super effective!", cls: 'eff', ev: {type: 'se', ident: args[0]}};
    case '-resisted':
      return {html: "It's not very effective…", cls: 'minor', ev: {type: 'resisted', ident: args[0]}};
    case '-immune':
      return {html: `It doesn't affect ${this.pk(args[0])}…${from ? ` <span class="minor">(${esc(from)})</span>` : ''}`, ev: {type: 'immune', ident: args[0]}};
    case '-miss':
      return {html: args[1] ? `${this.pk(args[1], true)} avoided the attack!` : `${this.pk(args[0], true)}'s attack missed!`};
    case '-fail':
      return {html: 'But it failed!', cls: 'minor'};
    case '-notarget':
      return {html: 'But there was no target…', cls: 'minor'};
    case '-block':
      return {html: `${this.pk(args[0], true)} was protected by ${esc(this.effectName(args[1]))}!`};
    case '-ohko':
      return {html: "It's a one-hit KO!", cls: 'eff'};
    case '-hitcount':
      return {html: `The Pokémon was hit ${args[1]} time${args[1] === '1' ? '' : 's'}!`};
    case '-item': {
      const [ident, item] = args;
      if (from === 'Frisk' || /frisk/i.test(kw.from || '')) return {html: `${of || 'Someone'} frisked ${this.pk(ident)} and found its ${esc(item)}!`};
      if (/Trick|Switcheroo/.test(from)) return {html: `${this.pk(ident, true)} obtained ${esc(item)}.`};
      return {html: `${this.pk(ident, true)}'s ${esc(item)} was revealed.`, cls: 'minor'};
    }
    case '-enditem': {
      const [ident, item] = args;
      if (kw.eat) return {html: `${this.pk(ident, true)} ate its ${esc(item)}!`};
      if (/Knock Off/.test(from)) return {html: `${of || 'The attacker'} knocked off ${this.pk(ident)}'s ${esc(item)}!`};
      if (item === 'Air Balloon') return {html: `${this.pk(ident, true)}'s Air Balloon popped!`};
      if (item === 'Focus Sash') return {html: `${this.pk(ident, true)} hung on using its Focus Sash!`};
      return {html: `${this.pk(ident, true)}'s ${esc(item)} was used up.`, cls: 'minor'};
    }
    case '-ability': {
      const [ident, ability] = args;
      const a = esc(this.effectName(ability));
      if (ability === 'Intimidate' || from === 'Intimidate') return {html: `<b>[${this.pk(ident, true)}'s Intimidate]</b>`, ev: {type: 'ability', ident}};
      return {html: `<b>[${this.pk(ident, true)}'s ${a}]</b>${kw.from && args[2] && !args[2].startsWith('[') ? ' ' + esc(args[2]) : ''}`, ev: {type: 'ability', ident}};
    }
    case '-endability':
      return {html: `${this.pk(args[0], true)}'s ability was suppressed!`, cls: 'minor'};
    case '-transform':
      return {html: `${this.pk(args[0], true)} transformed into ${esc(this.monName(args[1]))}!`};
    case '-mega':
      return {html: `${this.pk(args[0], true)} has Mega Evolved into Mega ${esc(args[1])}!`, cls: 'eff', ev: {type: 'mega', ident: args[0]}};
    case '-zpower':
      return {html: `${this.pk(args[0], true)} surrounded itself with its Z-Power!`, cls: 'eff', ev: {type: 'zpower', ident: args[0]}};
    case '-zbroken':
      return {html: `${this.pk(args[0], true)} couldn't fully protect itself and got hurt!`, cls: 'minor'};
    case '-terastallize':
      return {html: `${this.pk(args[0], true)} terastallized into the ${esc(args[1])} type!`, cls: 'eff', ev: {type: 'mega', ident: args[0]}};
    case '-start': {
      const [ident, eff] = args;
      const e = this.effectName(eff);
      const msgs = {
        confusion: 'became confused!', Substitute: 'put in a substitute!', 'Leech Seed': 'was seeded!', Taunt: 'fell for the taunt!',
        Encore: 'must do an encore!', perish3: 'will faint in three turns!', perish2: 'will faint in two turns!', perish1: 'will faint in one turn!', perish0: '',
        typechange: `transformed into the ${esc(args[2])} type!`, Yawn: 'grew drowsy!', 'Focus Energy': 'is getting pumped!', Disable: `'s ${esc(args[2])} was disabled!`,
        'Magnet Rise': 'levitated with electromagnetism!', Curse: 'was cursed!', Attract: 'fell in love!', 'Aqua Ring': 'surrounded itself with a veil of water!',
        Ingrain: 'planted its roots!', Torment: 'was subjected to torment!', 'Salt Cure': 'is being salt cured!', 'Heal Block': 'was prevented from healing!',
        Charge: 'began charging power!', Stockpile: `stockpiled ${esc(args[2])}!`, 'Smack Down': 'fell straight down!', 'Flash Fire': "'s Fire-type moves are being powered up!",
        protosynthesis: 'is boosted by Protosynthesis!', quarkdrive: 'is boosted by Quark Drive!', 'Destiny Bond': 'is hoping to take its attacker down with it!',
      };
      const m = msgs[e] ?? msgs[eff];
      if (m === '') return {};
      const html = m ? `${this.pk(ident, true)}${m.startsWith("'") ? '' : ' '}${m}` : `${this.pk(ident, true)}: ${esc(e)} started.`;
      return {html, cls: m ? '' : 'minor', ev: {type: 'start', ident, effect: e}};
    }
    case '-end': {
      const [ident, eff] = args;
      const e = this.effectName(eff);
      const msgs = {confusion: 'snapped out of its confusion!', Substitute: "'s substitute faded!", Taunt: 'shook off the taunt!', Encore: "'s encore ended!", Disable: 'is no longer disabled!', Yawn: '', 'Leech Seed': 'was freed from Leech Seed!'};
      const m = msgs[e];
      if (m === '') return {};
      return {html: m ? `${this.pk(ident, true)}${m.startsWith("'") ? '' : ' '}${m}` : `${this.pk(ident, true)}'s ${esc(e)} ended.`, cls: 'minor', ev: {type: 'end', ident, effect: e}};
    }
    case '-activate': {
      const [ident, eff] = args;
      const e = this.effectName(eff);
      const msgs = {Protect: 'protected itself!', 'Detect': 'protected itself!', confusion: 'is confused!', Substitute: "'s substitute took the damage!", 'Destiny Bond': 'took its attacker down with it!', 'Focus Sash': 'hung on using its Focus Sash!', Sturdy: 'endured the hit!', Endure: 'endured the hit!', 'Quick Claw': 'can act faster than normal, thanks to its Quick Claw!', attract: 'is in love!', 'Mummy': "'s ability became Mummy!", trapped: 'can no longer escape!'};
      if (!ident) return {html: `${esc(e)} activated.`, cls: 'minor'};
      const m = msgs[e];
      return {html: m ? `${this.pk(ident, true)}${m.startsWith("'") ? '' : ' '}${m}` : `${this.pk(ident, true)}: ${esc(e)}!`, cls: m ? '' : 'minor', ev: {type: 'activate', ident, effect: e}};
    }
    case '-singleturn': case '-singlemove': {
      const [ident, eff] = args;
      const e = this.effectName(eff);
      const msgs = {Protect: 'protected itself!', Detect: 'protected itself!', 'Max Guard': 'protected itself!', Endure: 'braced itself!', Roost: 'landed on the ground!', 'Focus Punch': 'is tightening its focus!', 'Helping Hand': 'is ready to help!', 'Magic Coat': 'shrouded itself with Magic Coat!', 'Destiny Bond': 'is hoping to take its attacker down with it!', Snatch: 'waits for a target to make a move!', 'King\'s Shield': 'protected itself!', 'Spiky Shield': 'protected itself!', 'Baneful Bunker': 'protected itself!', 'Silk Trap': 'protected itself!', 'Burning Bulwark': 'protected itself!', 'Follow Me': 'became the center of attention!', 'Rage Powder': 'became the center of attention!'};
      return {html: `${this.pk(ident, true)} ${msgs[e] || esc(e) + '!'}`};
    }
    case '-prepare':
      return {html: `${this.pk(args[0], true)} is preparing ${esc(args[1])}!`};
    case '-mustrecharge':
      return {};
    case '-message':
      return {html: esc(args[0]), cls: 'fieldmsg', ev: {type: 'message', text: args[0]}};
    case '-hint':
      return {html: `(${esc(args[0])})`, cls: 'minor'};
    case 'rfield':
      return {ev: {type: 'rfield', id: args[0], overlay: args[1] === 'overlay'}};
    case 'win':
      return {html: `🏆 ${esc(args[0])} won the battle!`, cls: 'win', ev: {type: 'win', name: args[0]}};
    case 'tie':
      return {html: 'The battle ended in a tie!', cls: 'win', ev: {type: 'win', name: null}};
    case 'raw':
      return {html: args.join('|'), cls: 'minor'};
    case '-center': case '-combine': case '-waiting': case 'upkeep': case 't:': case '': case 'gen': case 'tier': case 'rule':
    case 'teamsize': case 'clearpoke': case 'poke': case 'teampreview': case 'debug': case 'seed': case 'request': case 'inactive': case 'inactiveoff': case 'title': case 'j': case 'J': case 'l': case 'L': case 'chat': case 'c': case 'timestamp': case 'split':
      return {};
    case 'error':
      return {html: esc(args.join('|')), cls: 'minor'};
    default:
      return {};
    }
  }
}

export function parseHP(hpStr) {
  if (!hpStr) return null;
  const [hpPart, status] = hpStr.split(' ');
  if (hpPart === '0' || hpStr.endsWith('fnt')) return {pct: 0, status: '', fainted: true};
  const [cur, max] = hpPart.split('/').map(Number);
  if (!max) return null;
  return {pct: Math.max(cur > 0 ? 1 : 0, Math.round(100 * cur / max)), cur, max, status: status || ''};
}

export {STATUS_NAMES};
