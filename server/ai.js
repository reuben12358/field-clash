'use strict';
/**
 * Heuristic AI trainer. Reads the live Battle object directly (it is server-side),
 * estimates damage including field multipliers / added types, and picks a choice.
 */
const fields = require('./fields/engine');

const ABSORB = {
  levitate: 'Ground', eartheater: 'Ground',
  flashfire: 'Fire', wellbakedbody: 'Fire',
  waterabsorb: 'Water', stormdrain: 'Water', dryskin: 'Water',
  voltabsorb: 'Electric', lightningrod: 'Electric', motordrive: 'Electric',
  sapsipper: 'Grass',
};
const HAZARDS = new Set(['stealthrock', 'spikes', 'toxicspikes', 'stickyweb']);
const PROTECT = new Set(['protect', 'detect', 'kingsshield', 'spikyshield', 'banefulbunker', 'silktrap', 'burningbulwark', 'obstruct']);

function effectiveType(battle, attacker, target, move) {
  return fields.changedType(battle, attacker, target, move) || move.type;
}

function estimateDamage(battle, attacker, defender, moveId) {
  if (!defender || defender.fainted || !attacker) return 0;
  const move = battle.dex.getActiveMove(moveId);
  if (move.category === 'Status') return 0;
  const type = effectiveType(battle, attacker, defender, move);
  if (move.ohko) return defender.level > attacker.level ? 0 : 0.3;
  const fid = fields.getState(battle).current;
  const moveFieldInfo = fields.describeMoveOnField(battle, attacker, moveId);
  if (moveFieldInfo.fails) return 0;

  const groundHitsAir = fid === 'cave' || fid === 'deepearth' || fid === 'inverse';
  if (type === 'Ground' && !groundHitsAir && !defender.isGrounded()) return 0;
  const abil = defender.getAbility().id;
  if (ABSORB[abil] === type && !(type === 'Ground' && abil === 'levitate' && groundHitsAir) &&
      !attacker.hasAbility(['moldbreaker', 'teravolt', 'turboblaze'])) {
    return 0;
  }

  let eff = 0;
  const defTypes = defender.getTypes();
  if (fid === 'inverse') {
    for (const dt of defTypes) {
      eff += !battle.dex.getImmunity(type, dt) ? 1 : -battle.dex.getEffectiveness(type, dt);
    }
  } else {
    if (!battle.dex.getImmunity(type, defTypes)) {
      const holyBypass = fid === 'holy' && type === 'Normal' && defTypes.some(t => t === 'Ghost' || t === 'Dark');
      const groundBypass = type === 'Ground' && (defender.isGrounded() || groundHitsAir);
      if (!holyBypass && !groundBypass) return 0;
    }
    for (const dt of defTypes) {
      if (fid === 'holy' && type === 'Normal' && (dt === 'Ghost' || dt === 'Dark')) eff += 1;
      else if (fid === 'fairytale' && type === 'Steel' && dt === 'Dragon') eff += 1;
      else if (battle.dex.getImmunity(type, dt)) eff += battle.dex.getEffectiveness(type, dt);
    }
    for (const add of fields.addedTypes(battle, attacker, defender, move)) {
      eff += battle.dex.getEffectiveness(add, defTypes);
    }
  }
  const effMult = Math.pow(2, eff);
  if (abil === 'wonderguard' && effMult <= 1) return 0;

  let bp = move.basePower;
  if (!bp) {
    if (move.damage === 'level') return attacker.level / defender.maxhp;
    if (typeof move.damage === 'number') return move.damage / defender.maxhp;
    bp = 70; // variable power moves
  }
  if (move.multihit) bp *= Array.isArray(move.multihit) ? (move.multihit[0] + move.multihit[1]) / 2 : move.multihit;
  const physical = move.category === 'Physical';
  let atk = attacker.getStat(physical ? 'atk' : 'spa', false, true);
  if (attacker.hasAbility(['hugepower', 'purepower']) && physical) atk *= 2;
  if (move.id === 'bodypress') atk = attacker.getStat('def', false, true);
  if (move.id === 'foulplay') atk = defender.getStat('atk', false, true);
  const def = defender.getStat(physical || move.overrideDefensiveStat === 'def' ? 'def' : 'spd', false, true);
  const L = attacker.level;
  let dmg = ((2 * L / 5 + 2) * bp * atk / Math.max(1, def)) / 50 + 2;
  let stab = attacker.hasType(type) ? 1.5 : 1;
  if (stab > 1 && attacker.hasAbility('adaptability')) stab = 2;
  dmg *= stab * effMult;
  dmg *= fields.fieldDamageMultiplier(battle, attacker, defender, move);
  const weather = battle.field.effectiveWeather();
  if ((weather === 'sunnyday' || weather === 'desolateland') && type === 'Fire') dmg *= 1.5;
  if ((weather === 'sunnyday' || weather === 'desolateland') && type === 'Water') dmg *= 0.5;
  if ((weather === 'raindance' || weather === 'primordialsea') && type === 'Water') dmg *= 1.5;
  if ((weather === 'raindance' || weather === 'primordialsea') && type === 'Fire') dmg *= 0.5;
  if (physical && attacker.status === 'brn' && !attacker.hasAbility('guts')) dmg *= 0.5;
  if (attacker.item === 'lifeorb') dmg *= 1.3;
  if (attacker.item === 'choiceband' && physical) dmg *= 1.5;
  if (attacker.item === 'choicespecs' && !physical) dmg *= 1.5;
  dmg *= 0.925;
  const acc = move.accuracy === true ? 1 : (move.accuracy || 100) / 100;
  return (dmg / defender.maxhp) * acc;
}

function bestDamage(battle, attacker, defender) {
  let best = 0;
  for (const ms of attacker.moveSlots) best = Math.max(best, estimateDamage(battle, attacker, defender, ms.id));
  return best;
}

function speedOf(p) {
  return p.getStat('spe') * (p.status === 'par' ? 0.5 : 1);
}

function scoreStatus(battle, me, foe, move, foeThreat, ctx) {
  const hpFrac = me.hp / me.maxhp;
  if (PROTECT.has(move.id)) return me.volatiles.stall ? 0 : (ctx.ffa ? 22 : 8);
  if (move.heal || move.flags.heal || ['roost', 'recover', 'slackoff', 'softboiled', 'moonlight', 'morningsun', 'synthesis', 'shoreup', 'milkdrink', 'wish'].includes(move.id)) {
    return hpFrac < 0.45 ? 70 : hpFrac < 0.7 ? 25 : 0;
  }
  if (HAZARDS.has(move.id)) {
    const side = foe?.side;
    if (!side || side.sideConditions[move.id]) return 0;
    return side.pokemonLeft >= 3 ? 45 : 10;
  }
  if (move.id === 'defog' || move.id === 'rapidspin') {
    return Object.keys(me.side.sideConditions).some(c => HAZARDS.has(c)) ? 40 : 0;
  }
  const selfBoost = move.boosts && (move.target === 'self' || move.target === 'allySide' || move.target === 'adjacentAllyOrSelf') ? move.boosts : (move.self?.boosts);
  if (selfBoost && move.target === 'self') {
    const already = Object.values(me.boosts).reduce((a, b) => a + Math.max(0, b), 0);
    if (already >= 4) return 0;
    if (hpFrac > 0.6 && foeThreat < 0.45) return 55 - already * 10;
    return 8;
  }
  if (move.status && foe) {
    if (foe.status) return 0;
    if (!foe.runStatusImmunity(move.status)) return 0;
    if (move.status === 'tox' && (foe.hasType('Steel') || foe.hasType('Poison'))) return 0;
    if (move.status === 'brn' && foe.hasType('Fire')) return 0;
    if (move.status === 'par' && (foe.hasType('Electric') || (move.id === 'thunderwave' && foe.hasType('Ground')))) return 0;
    if (move.status === 'slp' && foe.side.pokemon.some(p => p.status === 'slp' && p.statusState.source && !p.statusState.source.isAlly?.(foe))) return 0;
    const acc = move.accuracy === true ? 1 : move.accuracy / 100;
    return (move.status === 'slp' ? 50 : 38) * acc;
  }
  if (move.volatileStatus === 'leechseed' && foe && !foe.hasType('Grass') && !foe.volatiles.leechseed) return 30;
  if (move.volatileStatus === 'substitute') return hpFrac > 0.5 && !me.volatiles.substitute ? 20 : 0;
  if (move.weather) return battle.field.weather === toWeatherId(move.weather) ? 0 : 22;
  if (move.terrain) return battle.field.terrain === move.terrain ? 0 : 22;
  if (move.sideCondition) return me.side.sideConditions[move.sideCondition] ? 0 : 30;
  if (move.pseudoWeather) return battle.field.pseudoWeather[move.pseudoWeather] ? 0 : 15;
  if (move.boosts && foe) return 15;
  return 10;
}
function toWeatherId(w) { return String(w).toLowerCase(); }

/**
 * @param {import('pokemon-showdown').Battle} battle
 * @param {any} side Showdown Side
 * @param {any} request request JSON
 * @param {'easy'|'normal'|'hard'} difficulty
 */
function choose(battle, side, request, difficulty = 'normal') {
  const noise = difficulty === 'easy' ? 0.6 : difficulty === 'hard' ? 0.08 : 0.2;
  const ffa = battle.gameType === 'freeforall';
  const foes = () => battle.sides.filter(s => s !== side && s.active[0] && !s.active[0].fainted).map(s => s.active[0]);

  if (request.teamPreview) return 'default';

  const benchChoices = () => side.pokemon
    .map((p, i) => ({p, i}))
    .filter(({p}) => !p.isActive && !p.fainted && p.hp > 0);

  const matchup = (p) => {
    let score = 0;
    for (const foe of foes()) {
      const mine = bestDamage(battle, p, foe);
      const theirs = bestDamage(battle, foe, p);
      score += mine - theirs * 0.85 + (speedOf(p) > speedOf(foe) ? 0.1 : 0);
    }
    return score * (p.hp / p.maxhp + 0.3);
  };

  if (request.forceSwitch) {
    const bench = benchChoices();
    if (!bench.length) return 'pass';
    if (difficulty === 'easy' && Math.random() < 0.5) return `switch ${bench[Math.floor(Math.random() * bench.length)].i + 1}`;
    bench.sort((a, b) => matchup(b.p) - matchup(a.p));
    return `switch ${bench[0].i + 1}`;
  }

  const active = request.active?.[0];
  const me = side.active[0];
  if (!active || !me) return 'default';

  const enabled = active.moves.map((m, i) => ({m, i})).filter(({m}) => !m.disabled && (m.pp === undefined || m.pp > 0));
  if (!enabled.length) return 'move 1';
  if (enabled.length === 1 && (enabled[0].m.id === 'struggle' || active.moves.length === 1)) return 'move 1';

  const foeList = foes();
  const threat = Math.max(0, ...foeList.map(f => bestDamage(battle, f, me)));
  let best = null;
  for (const {m, i} of enabled) {
    const move = battle.dex.moves.get(m.id);
    const needsTarget = ffa && ['normal', 'any', 'adjacentFoe'].includes(move.target);
    const targets = needsTarget ? foeList : [foeList.sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0]];
    for (const foe of targets) {
      let score;
      if (move.category === 'Status') {
        score = scoreStatus(battle, me, foe, move, threat, {ffa});
      } else {
        let dmg = foe ? estimateDamage(battle, me, foe, m.id) : 0.3;
        if (move.target === 'allAdjacentFoes' || move.target === 'allAdjacent') dmg *= ffa ? Math.max(1, foeList.length * 0.75) : 1;
        score = Math.min(dmg, 1.2) * 100;
        if (foe && dmg >= foe.hp / foe.maxhp) {
          score += 45;
          if (move.priority > 0 && speedOf(foe) > speedOf(me)) score += 35;
          if (ffa) score += 15; // securing KOs matters in FFA
        }
        if (move.self?.volatileStatus === 'mustrecharge') score *= 0.7;
        if (move.selfdestruct) score *= me.hp / me.maxhp < 0.3 ? 1 : 0.3;
        if (move.recoil || move.mindBlownRecoil) score *= 0.92;
        const info = fields.describeMoveOnField(battle, me, m.id);
        if (info.fails) score = 0;
      }
      score *= 1 + (Math.random() * 2 - 1) * noise;
      if (!best || score > best.score) best = {score, i, foe, move};
    }
  }

  // Consider switching out of a bad matchup
  if (!active.trapped && !active.maybeTrapped && difficulty !== 'easy') {
    const bench = benchChoices();
    if (bench.length && best && best.score < 30 && threat > 0.5) {
      const cur = matchup(me);
      bench.sort((a, b) => matchup(b.p) - matchup(a.p));
      if (matchup(bench[0].p) > cur + 0.35 && Math.random() < (difficulty === 'hard' ? 0.85 : 0.55)) {
        return `switch ${bench[0].i + 1}`;
      }
    }
  }

  if (!best) return 'default';
  let choice = `move ${best.i + 1}`;
  if (ffa && best.foe && ['normal', 'any', 'adjacentFoe'].includes(best.move.target)) {
    choice += ` ${me.getLocOf(best.foe)}`;
  }
  if (active.canMegaEvo) choice += ' mega';
  else if (active.canZMove?.[best.i] && (best.score >= 35 || difficulty === 'hard')) choice += ' zmove';
  return choice;
}

module.exports = {choose, estimateDamage};
