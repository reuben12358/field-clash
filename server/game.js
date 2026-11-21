'use strict';
const {randomInt} = require('./rand');
const {
  randomTeam,
  createBattle,
  parseTeamPaste,
  exportTeamPaste,
  describeSet,
  publicMoveEffectiveness,
  scoreSetOnField,
  generateFieldTeam,
  generateAIMatchupTeams,
  fields,
} = require('./sim');
const ai = require('./ai');
const bosses = require('./bosses');

const TURN_TIME_MS = 150 * 1000;

const rooms = new Map();
const VOLATILE_NAMES = {
  substitute: 'Substitute', confusion: 'Confused', leechseed: 'Leech Seed', taunt: 'Taunt', encore: 'Encore',
  torment: 'Torment', disable: 'Disable', yawn: 'Drowsy', perishsong: 'Perish', curse: 'Cursed', aquaring: 'Aqua Ring',
  ingrain: 'Ingrain', magnetrise: 'Magnet Rise', partiallytrapped: 'Trapped', focusenergy: 'Pumped', protect: 'Protected',
  stockpile: 'Stockpile', charge: 'Charged', telekinesis: 'Telekinesis', smackdown: 'Grounded', saltcure: 'Salt Cure',
  embargo: 'Embargo', healblock: 'Heal Block', attract: 'Infatuated', nightmare: 'Nightmare', roost: 'Roosting',
  dynamax: 'Dynamax', flashfire: 'Flash Fire', slowstart: 'Slow Start', protosynthesis: 'Protosynthesis', quarkdrive: 'Quark Drive',
  glaiverush: 'Glaive Rush', destinybond: 'Destiny Bond', laserfocus: 'Laser Focus', tarshot: 'Tar Shot', octolock: 'Octolock',
  mustrecharge: 'Recharging', twoturnmove: 'Charging', lockedmove: 'Rampaging', choicelock: 'Choice-locked',
};

function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = '';
    for (let i = 0; i < 5; i++) code += alphabet[randomInt(alphabet.length)];
  } while (rooms.has(code));
  return code;
}

class Room {
  constructor(mode, host, opts = {}) {
    this.code = makeCode();
    this.mode = mode; // 'ai' | 'pvp' | 'ffa'
    this.seatCount = mode === 'ffa' ? 4 : 2;
    this.difficulty = ['easy', 'normal', 'hard'].includes(opts.difficulty) ? opts.difficulty : 'normal';
    this.dexMode = opts.dexMode === 'natdex' ? 'natdex' : 'champions';
    this.levelMode = opts.levelMode === 'canonical' ? 'canonical' : 'lv50';
    this.fieldFilter = ['all', 'Reborn', 'Rejuvenation', 'Desolation'].includes(opts.fieldFilter) ? opts.fieldFilter : 'all';
    this.fieldChoice = opts.field && (opts.field === 'random' || fields.FIELDS.has(opts.field)) ? opts.field : 'random';
    const initBoss = mode === 'ai' && opts.bossId ? bosses.getBoss(opts.bossId) : null;
    this.bossId = initBoss ? initBoss.id : null;
    this.normalBalance = 2;
    this.fieldId = null;
    // Hide opponent items & moves vs AI (and by default in AI-filled FFA)
    this.openSheets = mode === 'pvp';
    this.status = 'lobby';
    this.seats = Array.from({length: this.seatCount}, () => null);
    this.spectators = new Set();
    this.chat = [];
    this.game = null;
    this.hostToken = host.token;

    let initialCustomTeam = null;
    if (opts.customTeamPaste) {
      const parsed = parseTeamPaste(opts.customTeamPaste);
      if (parsed.ok) initialCustomTeam = parsed.team;
    }

    this.rollField();

    this.seats[0] = {token: host.token, name: host.name, isAI: false, client: host, team: [], customTeam: initialCustomTeam};
    host.room = this;
    if (mode === 'ai') this.seats[1] = this.makeAISeat(false);
    if (mode === 'ffa' && opts.fillAI) for (let i = 1; i < 4; i++) this.seats[i] = this.makeAISeat(true);

    this.syncTeamsToField();

    rooms.set(this.code, this);
    this.lastActivity = Date.now();
  }

  effectiveDexMode() {
    if (this.bossId || this.dexMode === 'natdex') return 'natdex';
    if (this.seats.some(s => s?.customTeam)) return 'natdex';
    return 'champions';
  }

  targetPlayerLevel() {
    if (this.bossId && this.levelMode === 'canonical') {
      const b = bosses.getBoss(this.bossId);
      return b ? b.cap : 50;
    }
    return 50;
  }

  scaleCustomTeam(customTeam) {
    const capLevel = this.targetPlayerLevel();
    const isCanonical = this.bossId && this.levelMode === 'canonical';
    return customTeam.map(p => ({
      ...p,
      level: isCanonical ? (p.explicitLevel ? p.level : capLevel) : 50,
    }));
  }

  makeAISeat(withRandomTeam = true) {
    const used = this.seats.filter(Boolean).map(s => s.name);
    const boss = this.bossId ? bosses.getBoss(this.bossId) : null;
    const name = boss ? boss.name : bosses.pickAIName(used, this.fieldId);
    const team = withRandomTeam ? randomTeam({dexMode: this.effectiveDexMode(), level: 50}) : [];
    return {token: null, name, isAI: true, client: null, team, customTeam: null};
  }

  rollField() {
    if (this.bossId) {
      const boss = bosses.getBoss(this.bossId);
      if (boss) {
        this.fieldChoice = boss.fieldId;
        this.fieldId = boss.fieldId;
        return;
      }
    }
    this.fieldId = this.fieldChoice === 'random' ? fields.randomFieldId(this.fieldFilter) : this.fieldChoice;
  }

  syncTeamsToField({refreshAIName = false} = {}) {
    const effDex = this.effectiveDexMode();
    const pLevel = this.targetPlayerLevel();

    if (this.mode === 'ai') {
      const boss = this.bossId ? bosses.getBoss(this.bossId) : null;
      if (boss) {
        this.fieldId = boss.fieldId;
        this.fieldChoice = boss.fieldId;
        if (this.seats[1]) {
          this.seats[1].name = boss.name;
          this.seats[1].team = bosses.buildBossTeam(boss.id, {levelMode: this.levelMode});
        }
        if (this.seats[0]) {
          if (this.seats[0].customTeam) {
            this.seats[0].team = this.scaleCustomTeam(this.seats[0].customTeam);
          } else {
            this.seats[0].team = this.difficulty === 'easy'
              ? generateFieldTeam(this.fieldId, 'good', {dexMode: effDex, level: pLevel})
              : this.difficulty === 'hard'
                ? generateFieldTeam(this.fieldId, 'bad', {dexMode: effDex, level: pLevel})
                : randomTeam({dexMode: effDex, level: pLevel});
          }
        }
        this.normalBalance = null;
        return;
      }

      if (refreshAIName && this.seats[1]?.isAI) {
        const used = [this.seats[0]?.name].filter(Boolean);
        this.seats[1].name = bosses.pickAIName(used, this.fieldId);
      }
      const {playerTeam, aiTeam, balanceCount} = generateAIMatchupTeams(this.fieldId, this.difficulty, {dexMode: effDex, level: 50});
      this.normalBalance = balanceCount;
      if (this.seats[0]) {
        this.seats[0].team = this.seats[0].customTeam ? this.scaleCustomTeam(this.seats[0].customTeam) : playerTeam;
      }
      if (this.seats[1]) this.seats[1].team = aiTeam;
      return;
    }

    for (const s of this.seats) {
      if (!s) continue;
      if (s.customTeam) s.team = this.scaleCustomTeam(s.customTeam);
      else if (!s.team || !s.team.length) s.team = randomTeam({dexMode: effDex, level: 50});
    }
  }

  rerollSinglePlayerTeam(seatIdx) {
    const s = this.seats[seatIdx];
    if (!s) return;
    s.customTeam = null;
    const effDex = this.effectiveDexMode();
    const pLevel = this.targetPlayerLevel();
    if (this.mode === 'ai' && seatIdx === 0) {
      if (this.difficulty === 'easy') {
        s.team = generateFieldTeam(this.fieldId, 'good', {dexMode: effDex, level: pLevel});
      } else if (this.difficulty === 'hard') {
        s.team = generateFieldTeam(this.fieldId, 'bad', {dexMode: effDex, level: pLevel});
      } else if (this.bossId) {
        s.team = randomTeam({dexMode: effDex, level: pLevel});
      } else {
        const k = this.normalBalance || 2;
        s.team = generateFieldTeam(this.fieldId, {good: k, bad: k, neutral: 6 - 2 * k}, {dexMode: effDex, level: pLevel});
      }
      return;
    }
    s.team = randomTeam({dexMode: effDex, level: 50});
  }

  clients() {
    const out = [];
    for (const s of this.seats) if (s?.client) out.push(s.client);
    for (const c of this.spectators) out.push(c);
    return out;
  }
  seatOf(client) {
    return this.seats.findIndex(s => s && !s.isAI && s.token === client.token);
  }
  isHost(client) { return client.token === this.hostToken; }

  join(client) {
    const existing = this.seatOf(client);
    if (existing >= 0) {
      this.seats[existing].client = client;
      client.room = this;
      return existing;
    }
    if (this.status === 'lobby') {
      const idx = this.seats.findIndex(s => !s);
      if (idx >= 0) {
        this.seats[idx] = {token: client.token, name: client.name, isAI: false, client, team: randomTeam({dexMode: this.effectiveDexMode()}), customTeam: null};
        client.room = this;
        this.system(`${client.name} joined the room.`);
        return idx;
      }
    }
    this.spectators.add(client);
    client.room = this;
    this.system(`${client.name} is spectating.`);
    return -1;
  }
  leave(client) {
    this.spectators.delete(client);
    const idx = this.seatOf(client);
    if (idx >= 0) {
      if (this.status === 'lobby') {
        this.system(`${this.seats[idx].name} left.`);
        this.seats[idx] = null;
        if (this.isHost(client)) {
          const next = this.seats.find(s => s && !s.isAI);
          if (next) this.hostToken = next.token;
        }
      } else {
        this.seats[idx].client = null;
        if (this.game && !this.game.ended) this.system(`${this.seats[idx].name} disconnected.`);
      }
    }
    client.room = null;
    if (!this.seats.some(s => s && !s.isAI && s.client) && !this.spectators.size) {
      this.lastActivity = Date.now();
    }
    this.broadcastRoom();
  }
  system(text) {
    this.pushChat({from: null, text});
  }
  pushChat(msg) {
    this.chat.push(msg);
    if (this.chat.length > 100) this.chat.shift();
    for (const c of this.clients()) c.send({t: 'chat', msg});
  }

  roomView(client) {
    const you = this.seatOf(client);
    const showOpponentSheets = this.mode !== 'ai' && this.openSheets;
    const bossObj = this.bossId ? bosses.getBoss(this.bossId) : null;
    return {
      code: this.code,
      mode: this.mode,
      status: this.status,
      you,
      isHost: this.isHost(client),
      difficulty: this.difficulty,
      dexMode: this.dexMode,
      effectiveDexMode: this.effectiveDexMode(),
      levelMode: this.levelMode,
      bossId: this.bossId,
      boss: bossObj ? {
        id: bossObj.id,
        game: bossObj.game,
        category: bossObj.category,
        name: bossObj.name,
        displayName: bossObj.displayName,
        section: bossObj.section,
        fieldId: bossObj.fieldId,
        fieldName: bossObj.fieldName,
        cap: bossObj.cap,
        ace: bossObj.ace,
        subtitle: bossObj.subtitle,
      } : null,
      normalBalance: this.normalBalance,
      fieldChoice: this.fieldChoice,
      fieldFilter: this.fieldFilter,
      field: fields.publicInfo(this.fieldId),
      fieldList: fields.listFields(),
      openSheets: showOpponentSheets,
      winner: this.game?.winner ?? null,
      chat: this.chat.slice(-50),
      seats: this.seats.map((s, i) => s && {
        name: s.name,
        isAI: s.isAI,
        connected: s.isAI || !!s.client,
        isHost: s.token === this.hostToken,
        hasCustomTeam: !!s.customTeam,
        team: s.team.map(set => {
          const d = describeSet(set, this.fieldId);
          return (i === you || showOpponentSheets)
            ? d
            : {species: d.species, spriteid: d.spriteid, types: d.types, level: d.level};
        }),
      }),
    };
  }
  broadcastRoom() {
    for (const c of this.clients()) c.send({t: 'room', room: this.roomView(c)});
  }

  // Host & player lobby controls
  handleLobby(client, msg) {
    if (this.status === 'battle') return;
    const host = this.isHost(client);
    const mySeat = this.seatOf(client);
    switch (msg.t) {
    case 'reroll': {
      if (msg.what === 'field') {
        if (!host) return;
        if (this.bossId) {
          this.bossId = null;
          this.fieldChoice = 'random';
        }
        this.rollField();
        if (this.mode === 'ai') this.syncTeamsToField({refreshAIName: true});
      } else if (msg.what === 'teams') {
        if (!host) return;
        if (this.mode === 'ai') {
          this.syncTeamsToField();
        } else {
          const effDex = this.effectiveDexMode();
          for (const s of this.seats) if (s && !s.customTeam) s.team = randomTeam({dexMode: effDex});
        }
      } else if (msg.what === 'myteam') {
        if (mySeat < 0) return;
        this.rerollSinglePlayerTeam(mySeat);
        this.system(`${this.seats[mySeat].name} rerolled their team.`);
      }
      break;
    }
    case 'setField':
      if (!host) return;
      if (msg.id !== 'random' && !fields.FIELDS.has(msg.id)) return;
      this.bossId = null;
      this.fieldChoice = msg.id;
      if (msg.filter) this.fieldFilter = msg.filter;
      this.rollField();
      if (this.mode === 'ai') this.syncTeamsToField({refreshAIName: true});
      break;
    case 'setDifficulty':
      if (!host || !['easy', 'normal', 'hard'].includes(msg.value)) return;
      this.difficulty = msg.value;
      if (this.mode === 'ai') this.syncTeamsToField();
      break;
    case 'setDexMode':
      if (!host || !['champions', 'natdex'].includes(msg.value)) return;
      this.dexMode = msg.value;
      if (this.mode === 'ai') {
        this.syncTeamsToField();
      } else {
        const effDex = this.effectiveDexMode();
        for (const s of this.seats) if (s && !s.customTeam) s.team = randomTeam({dexMode: effDex});
      }
      break;
    case 'setLevelMode':
      if (!host || !['lv50', 'canonical'].includes(msg.value)) return;
      this.levelMode = msg.value;
      if (this.mode === 'ai') this.syncTeamsToField();
      break;
    case 'setBoss': {
      if (!host || this.mode !== 'ai') return;
      if (!msg.bossId || msg.bossId === 'none') {
        this.bossId = null;
        this.fieldChoice = 'random';
        this.rollField();
        this.syncTeamsToField({refreshAIName: true});
      } else {
        const b = bosses.getBoss(msg.bossId);
        if (b) {
          this.bossId = b.id;
          if (msg.levelMode && ['lv50', 'canonical'].includes(msg.levelMode)) {
            this.levelMode = msg.levelMode;
          }
          this.rollField();
          this.syncTeamsToField();
        }
      }
      break;
    }
    case 'setCustomTeam': {
      if (mySeat < 0) return;
      const seat = this.seats[mySeat];
      if (!msg.paste || !String(msg.paste).trim()) {
        seat.customTeam = null;
        this.rerollSinglePlayerTeam(mySeat);
        client.send({t: 'teamSaved', custom: false, count: seat.team.length});
      } else {
        const res = parseTeamPaste(msg.paste);
        if (!res.ok) {
          client.send({t: 'error', msg: res.error});
          return;
        }
        seat.customTeam = res.team;
        seat.team = this.scaleCustomTeam(res.team);
        client.send({t: 'teamSaved', custom: true, count: res.team.length});
        this.system(`${seat.name} loaded a custom team (${res.team.length} Pokémon).`);
      }
      break;
    }
    case 'exportTeam': {
      if (mySeat < 0) return;
      client.send({t: 'teamExport', paste: exportTeamPaste(this.seats[mySeat].team)});
      return;
    }
    case 'setOpenSheets':
      if (!host || this.mode === 'ai') return;
      this.openSheets = !!msg.value;
      break;
    case 'addAI':
      if (!host || this.mode === 'ai') return;
      if (this.seats[msg.seat] === null) this.seats[msg.seat] = this.makeAISeat(true);
      break;
    case 'kick': {
      if (!host) return;
      const s = this.seats[msg.seat];
      if (!s || s.token === this.hostToken) return;
      if (s.client) {
        s.client.send({t: 'kicked'});
        s.client.room = null;
      }
      this.seats[msg.seat] = null;
      break;
    }
    case 'start': {
      if (!host) return;
      if (this.seats.some(s => !s)) {
        if (this.mode === 'ffa') {
          for (let i = 0; i < 4; i++) if (!this.seats[i]) this.seats[i] = this.makeAISeat(true);
        } else {
          client.send({t: 'error', msg: 'Waiting for an opponent to join.'});
          return;
        }
      }
      this.startGame();
      return;
    }
    }
    this.broadcastRoom();
  }

  startGame() {
    if (this.status === 'ended') {
      this.rollField();
      if (this.mode === 'ai') {
        this.syncTeamsToField({refreshAIName: !this.bossId});
      } else {
        const effDex = this.effectiveDexMode();
        for (const s of this.seats) {
          if (!s) continue;
          s.team = s.customTeam ? this.scaleCustomTeam(s.customTeam) : randomTeam({dexMode: effDex});
        }
      }
    }
    this.status = 'battle';
    this.game = new Game(this);
    this.broadcastRoom();
    this.game.begin();
  }

  backToLobby() {
    if (this.game) this.game.destroy();
    this.game = null;
    this.status = 'lobby';
    // drop disconnected humans
    for (let i = 0; i < this.seats.length; i++) {
      const s = this.seats[i];
      if (s && !s.isAI && !s.client) this.seats[i] = null;
    }
    this.rollField();
    if (this.mode === 'ai') {
      this.syncTeamsToField({refreshAIName: !this.bossId});
    } else {
      const effDex = this.effectiveDexMode();
      for (const s of this.seats) {
        if (!s) continue;
        s.team = s.customTeam ? this.scaleCustomTeam(s.customTeam) : randomTeam({dexMode: effDex});
      }
    }
    this.broadcastRoom();
  }
}

class Game {
  constructor(room) {
    this.room = room;
    this.ended = false;
    this.winner = null;
    this.logs = [];
    this.history = [];
    this.pendingRequests = {};
    this.deadline = null;
    this.timer = null;
    this.dexMode = room.effectiveDexMode();
    this.levelMode = room.bossId ? room.levelMode : 'lv50';
    this.battle = createBattle(room.mode === 'ffa' ? 'ffa' : 'singles', {
      dexMode: this.dexMode,
      levelMode: this.levelMode,
      send: (type, data) => this.onSend(type, data),
    });
    this.battle.rfieldInitial = room.fieldId;
  }
  begin() {
    const b = this.battle;
    const force50 = this.levelMode !== 'canonical';
    this.room.seats.forEach((s, i) => {
      b.setPlayer(`p${i + 1}`, {
        name: s.name,
        team: s.team.map(set => ({...set, level: force50 ? 50 : (set.level || 50)})),
      });
    });
    this.flush();
  }
  destroy() {
    clearTimeout(this.timer);
    this.ended = true;
    try { this.battle.destroy(); } catch {}
  }

  onSend(type, data) {
    if (type === 'update') {
      const lines = Array.isArray(data) ? data : String(data).split('\n');
      this.history.push(...lines);
      this.pendingLines = (this.pendingLines || []).concat(lines);
    } else if (type === 'sideupdate') {
      const nl = data.indexOf('\n');
      const sid = data.slice(0, nl);
      const line = data.slice(nl + 1);
      if (line.startsWith('|request|')) {
        this.pendingRequests[sid] = JSON.parse(line.slice(9));
      } else if (line.startsWith('|error|')) {
        const seat = Number(sid.slice(1)) - 1;
        this.room.seats[seat]?.client?.send({t: 'error', msg: line.slice(7)});
      }
    } else if (type === 'end') {
      this.ended = true;
    }
  }

  /** Filter |split| lines for a viewer (seat index, or -1 for spectators). */
  static viewLines(lines, seat) {
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('|split|')) {
        const sid = line.slice(7);
        const secret = lines[i + 1];
        const pub = lines[i + 2];
        out.push(seat >= 0 && sid === `p${seat + 1}` ? secret : pub);
        i += 2;
        continue;
      }
      out.push(line);
    }
    return out;
  }

  flush() {
    this.battle.sendUpdates?.();
    const lines = this.pendingLines || [];
    this.pendingLines = [];
    const b = this.battle;
    if (b.ended && !this.winner) {
      this.ended = true;
      this.winner = b.winner || 'Nobody';
      this.room.status = 'ended';
      clearTimeout(this.timer);
    }
    this.armTimer();
    for (const client of this.room.clients()) this.sendTo(client, lines);
    if (this.ended) {
      this.room.broadcastRoom();
      return;
    }
    setTimeout(() => this.runAI(), 250);
  }

  sideNeedsChoice(side) {
    return side.requestState && !side.isChoiceDone() && !side.activeRequest?.wait;
  }

  runAI() {
    if (this.ended) return;
    let acted = false;
    this.room.seats.forEach((s, i) => {
      if (!s.isAI) return;
      const side = this.battle.sides[i];
      if (!side || !this.sideNeedsChoice(side)) return;
      const req = side.activeRequest;
      let choice;
      try {
        // Preloaded Boss Challenges play with smart ('hard') AI decision-making
        const aiDiff = this.room.bossId ? 'hard' : this.room.difficulty;
        choice = ai.choose(this.battle, side, req, aiDiff);
      } catch (e) {
        console.error('AI error', e);
        choice = 'default';
      }
      if (!this.battle.choose(side.id, choice)) this.battle.choose(side.id, 'default');
      acted = true;
    });
    if (acted) this.flushIfProgress();
  }

  flushIfProgress() {
    this.flush();
  }

  armTimer() {
    clearTimeout(this.timer);
    if (this.ended) return;
    const waitingHumans = this.room.seats.some((s, i) => !s.isAI && this.sideNeedsChoice(this.battle.sides[i]));
    if (!waitingHumans) {
      this.deadline = null;
      return;
    }
    this.deadline = Date.now() + TURN_TIME_MS;
    this.timer = setTimeout(() => {
      this.room.seats.forEach((s, i) => {
        const side = this.battle.sides[i];
        if (!s.isAI && this.sideNeedsChoice(side)) {
          this.room.system(`${s.name} ran out of time; a move was chosen automatically.`);
          this.battle.choose(side.id, 'default');
        }
      });
      this.flush();
    }, TURN_TIME_MS);
  }

  choose(client, msg) {
    if (this.ended) return;
    const seat = this.room.seatOf(client);
    if (seat < 0) return;
    const side = this.battle.sides[seat];
    const c = msg.choice || {};
    if (c.kind === 'undo') {
      if (side.requestState && side.isChoiceDone()) {
        this.battle.undoChoice?.(side.id);
        this.sendTo(client, []);
      }
      return;
    }
    if (!this.sideNeedsChoice(side)) return;
    let choice;
    if (c.kind === 'move') {
      choice = `move ${Number(c.index) + 1}`;
      if (this.battle.gameType === 'freeforall' && c.target !== undefined && c.target !== null) {
        const targetSide = this.battle.sides[Number(c.target)];
        const me = side.active[0];
        if (targetSide?.active[0] && me) choice += ` ${me.getLocOf(targetSide.active[0])}`;
      }
      if (c.mega) choice += ' mega';
      else if (c.zmove) choice += ' zmove';
    } else if (c.kind === 'switch') {
      choice = `switch ${Number(c.index) + 1}`;
    } else {
      return;
    }
    if (!this.battle.choose(side.id, choice)) {
      if (side.choice?.error) client.send({t: 'error', msg: side.choice.error});
      this.sendTo(client, []);
      return;
    }
    this.flush();
  }

  forfeit(client) {
    if (this.ended) return;
    const seat = this.room.seatOf(client);
    if (seat < 0) return;
    const side = this.battle.sides[seat];
    if (!side.pokemonLeft) return;
    this.battle.add('-message', `${side.name} forfeited.`);
    this.battle.lose(side);
    this.battle.sendUpdates?.();
    this.flush();
  }

  // ---------------------------------------------------------------------
  // Views
  // ---------------------------------------------------------------------
  pokeView(p, own) {
    const d = this.battle.dex;
    const hpPct = p.hp <= 0 ? 0 : Math.max(1, Math.round(100 * p.hp / p.maxhp));
    const showSheets = own || (this.room.mode !== 'ai' && this.room.openSheets);
    const v = {
      name: p.name,
      species: p.species.name,
      spriteid: p.species.spriteid,
      level: p.level,
      gender: p.gender,
      shiny: !!p.set.shiny,
      hpPct,
      status: p.status || '',
      fainted: !!p.fainted || p.hp <= 0,
      active: p.isActive,
      types: p.getTypes(),
      boosts: Object.fromEntries(Object.entries(p.boosts).filter(([, val]) => val)),
      volatiles: Object.keys(p.volatiles).map(id => VOLATILE_NAMES[id]).filter(Boolean),
    };
    if (showSheets) {
      v.item = p.item ? (d.items.get(p.item).name || p.item) : 'None';
      v.ability = d.abilities.get(p.ability).name || p.ability;
      v.moves = p.moveSlots.map(m => {
        const mv = d.moves.get(m.id);
        return {name: mv.name || m.move, type: mv.type || 'Normal', pp: m.pp, maxpp: m.maxpp};
      });
    }
    if (own) {
      v.hp = p.hp;
      v.maxhp = p.maxhp;
      v.stats = p.storedStats;
      const curField = fields.getState(this.battle).current;
      const aff = scoreSetOnField(p.set, curField);
      v.fieldTier = aff.tier;
      v.fieldReasons = aff.reasons;
    }
    return v;
  }

  stateFor(seat) {
    const b = this.battle;
    const d = b.dex;
    const st = fields.getState(b);
    return {
      turn: b.turn,
      gameType: b.gameType,
      field: {
        ...fields.publicInfo(st.current),
        base: st.base,
        overlay: !!st.overlay,
        overlayBase: st.overlay ? fields.publicInfo(st.overlay.prev).name : null,
      },
      weather: b.field.weather ? {id: b.field.weather, name: d.conditions.get(b.field.weather).name, turns: b.field.weatherState.duration ?? null} : null,
      terrain: b.field.terrain ? {id: b.field.terrain, name: d.conditions.get(b.field.terrain).name, turns: b.field.terrainState.duration ?? null} : null,
      pseudo: Object.keys(b.field.pseudoWeather).filter(id => id !== 'rebornfield').map(id => d.conditions.get(id).name),
      deadline: this.deadline,
      ended: this.ended,
      winner: this.winner,
      sides: b.sides.map((side, i) => ({
        seat: i,
        sid: side.id,
        name: side.name,
        isAI: this.room.seats[i].isAI,
        isYou: i === seat,
        pokemonLeft: side.pokemonLeft,
        conditions: Object.entries(side.sideConditions).map(([id, s]) => {
          const name = d.conditions.get(id).name;
          return s.layers > 1 ? `${name} ×${s.layers}` : name;
        }),
        active: side.active[0] ? this.pokeView(side.active[0], i === seat) : null,
        team: side.pokemon.map(p => this.pokeView(p, i === seat)),
        choiceDone: !this.sideNeedsChoice(side),
      })),
    };
  }

  requestFor(seat) {
    if (seat < 0) return null;
    const side = this.battle.sides[seat];
    if (!this.sideNeedsChoice(side)) return null;
    const req = JSON.parse(JSON.stringify(side.activeRequest));
    const me = side.active[0];
    const d = this.battle.dex;
    if (req.active && me) {
      const oppSides = this.battle.sides.filter((_, i) => i !== seat);
      const canZ = req.active[0].canZMove || null;
      req.active[0].moves.forEach((m, idx) => {
        const mv = d.moves.get(m.id);
        m.name = mv.name || m.move;
        m.type = mv.type || 'Normal';
        m.category = mv.category || 'Physical';
        m.basePower = mv.basePower || 0;
        m.accuracy = mv.accuracy;
        m.priority = mv.priority || 0;
        m.desc = mv.shortDesc || mv.desc || '';
        m.moveTarget = mv.target || 'normal';
        if (canZ && canZ[idx]) {
          const zObj = canZ[idx];
          const zmv = d.moves.get(zObj.move);
          m.zMove = {
            name: zmv.name || zObj.move,
            type: zmv.type || m.type,
            basePower: zObj.basePower || zmv.basePower || 160,
            target: zObj.target || 'normal',
          };
        }
        try {
          m.field = fields.describeMoveOnField(this.battle, me, m.id);
        } catch {
          m.field = {};
        }
        try {
          if (oppSides.length === 1 && oppSides[0].active[0]) {
            m.eff = publicMoveEffectiveness(this.battle, me, oppSides[0].active[0], m.id);
          } else if (oppSides.length > 1) {
            m.effBySeat = {};
            this.battle.sides.forEach((s, oIdx) => {
              if (oIdx !== seat && s.active[0] && !s.active[0].fainted) {
                m.effBySeat[oIdx] = publicMoveEffectiveness(this.battle, me, s.active[0], m.id);
              }
            });
          }
        } catch {
          // ignore effectiveness preview errors
        }
      });
    }
    return req;
  }

  sendTo(client, lines) {
    const seat = this.room.seatOf(client);
    client.send({
      t: 'battle',
      log: Game.viewLines(lines, seat),
      state: this.stateFor(seat),
      request: this.requestFor(seat),
      you: seat,
    });
  }

  /** Full resync (reconnect). */
  resync(client) {
    const seat = this.room.seatOf(client);
    client.send({
      t: 'battle',
      reset: true,
      log: Game.viewLines(this.history, seat),
      state: this.stateFor(seat),
      request: this.requestFor(seat),
      you: seat,
    });
  }
}

// Clean up idle rooms
const roomSweeper = setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    const anyone = room.clients().length > 0;
    if (!anyone && now - room.lastActivity > 30 * 60 * 1000) {
      room.game?.destroy();
      rooms.delete(code);
    }
  }
}, 60 * 1000);
if (typeof roomSweeper?.unref === 'function') roomSweeper.unref();

module.exports = {Room, Game, rooms};
