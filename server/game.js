'use strict';
const {randomInt} = require('./rand');
const {randomTeam, createBattle, describeSet, fields, Dex} = require('./sim');
const ai = require('./ai');

const TURN_TIME_MS = 150 * 1000;
const AI_NAMES = ['Ace Trainer Julia', 'Gym Leader Corey', 'Elite Shelly', 'Champion Ame', 'Ace Trainer Florinia',
  'Gym Leader Titania', 'Aya', 'Gym Leader Serra', 'Gym Leader Noel', 'Gym Leader Radomus', 'Gym Leader Luna',
  'Gym Leader Samson', 'Gym Leader Charlotte', 'Gym Leader Terra', 'Gym Leader Ciel', 'Gym Leader Adrienn',
  'Gym Leader Saphira', 'Elite Lin', 'Gym Leader Valarie', 'Gym Leader Amaria', 'Rejuv Leader Aster', 'Madame X',
  'Rejuv Leader Venam', 'Rejuv Leader Keta', 'Rejuv Leader Narcissa', 'Rejuv Leader Crawli', 'Desolation Leader Selene'];

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
function pickAIName(used) {
  const pool = AI_NAMES.filter(n => !used.includes(n));
  return pool[randomInt(pool.length)] || 'AI Trainer';
}

class Room {
  constructor(mode, host, opts = {}) {
    this.code = makeCode();
    this.mode = mode; // 'ai' | 'pvp' | 'ffa'
    this.seatCount = mode === 'ffa' ? 4 : 2;
    this.difficulty = opts.difficulty || 'normal';
    this.fieldFilter = 'all';
    this.fieldChoice = 'random'; // 'random' or field id
    this.fieldId = null;
    this.openSheets = true;
    this.status = 'lobby';
    this.seats = Array.from({length: this.seatCount}, () => null);
    this.spectators = new Set();
    this.chat = [];
    this.game = null;
    this.hostToken = host.token;
    this.seats[0] = {token: host.token, name: host.name, isAI: false, client: host, team: randomTeam()};
    host.room = this;
    if (mode === 'ai') this.seats[1] = this.makeAISeat();
    if (mode === 'ffa' && opts.fillAI) for (let i = 1; i < 4; i++) this.seats[i] = this.makeAISeat();
    this.rollField();
    rooms.set(this.code, this);
    this.lastActivity = Date.now();
  }
  makeAISeat() {
    const used = this.seats.filter(Boolean).map(s => s.name);
    return {token: null, name: pickAIName(used), isAI: true, client: null, team: randomTeam()};
  }
  rollField() {
    this.fieldId = this.fieldChoice === 'random' ? fields.randomFieldId(this.fieldFilter) : this.fieldChoice;
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
        this.seats[idx] = {token: client.token, name: client.name, isAI: false, client, team: randomTeam()};
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
      // nobody connected; clean up later
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
    return {
      code: this.code,
      mode: this.mode,
      status: this.status,
      you,
      isHost: this.isHost(client),
      difficulty: this.difficulty,
      fieldChoice: this.fieldChoice,
      fieldFilter: this.fieldFilter,
      field: fields.publicInfo(this.fieldId),
      fieldList: fields.listFields(),
      openSheets: this.openSheets,
      winner: this.game?.winner ?? null,
      chat: this.chat.slice(-50),
      seats: this.seats.map((s, i) => s && {
        name: s.name,
        isAI: s.isAI,
        connected: s.isAI || !!s.client,
        isHost: s.token === this.hostToken,
        team: s.team.map(set => {
          const d = describeSet(set);
          return (i === you || this.openSheets || this.status === 'ended')
            ? d
            : {species: d.species, spriteid: d.spriteid, types: d.types, level: d.level};
        }),
      }),
    };
  }
  broadcastRoom() {
    for (const c of this.clients()) c.send({t: 'room', room: this.roomView(c)});
  }

  // Host lobby controls
  handleLobby(client, msg) {
    if (this.status === 'battle') return;
    const host = this.isHost(client);
    const mySeat = this.seatOf(client);
    switch (msg.t) {
    case 'reroll': {
      if (msg.what === 'field') {
        if (!host) return;
        this.rollField();
      } else if (msg.what === 'teams') {
        if (!host) return;
        for (const s of this.seats) if (s) s.team = randomTeam();
      } else if (msg.what === 'myteam') {
        if (mySeat < 0) return;
        this.seats[mySeat].team = randomTeam();
        this.system(`${this.seats[mySeat].name} rerolled their team.`);
      }
      break;
    }
    case 'setField':
      if (!host) return;
      if (msg.id !== 'random' && !fields.FIELDS.has(msg.id)) return;
      this.fieldChoice = msg.id;
      if (msg.filter) this.fieldFilter = msg.filter;
      this.rollField();
      break;
    case 'setDifficulty':
      if (!host || !['easy', 'normal', 'hard'].includes(msg.value)) return;
      this.difficulty = msg.value;
      break;
    case 'setOpenSheets':
      if (!host) return;
      this.openSheets = !!msg.value;
      break;
    case 'addAI':
      if (!host || this.mode === 'ai') return;
      if (this.seats[msg.seat] === null) this.seats[msg.seat] = this.makeAISeat();
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
          for (let i = 0; i < 4; i++) if (!this.seats[i]) this.seats[i] = this.makeAISeat();
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
      for (const s of this.seats) if (s) s.team = randomTeam();
      this.rollField();
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
    for (const s of this.seats) if (s) s.team = randomTeam();
    // drop disconnected humans
    for (let i = 0; i < this.seats.length; i++) {
      const s = this.seats[i];
      if (s && !s.isAI && !s.client) this.seats[i] = null;
    }
    this.rollField();
    this.broadcastRoom();
  }
}

class Game {
  constructor(room) {
    this.room = room;
    this.ended = false;
    this.winner = null;
    this.logs = []; // full public+secret history: [{lines}] raw
    this.history = []; // raw lines with split info
    this.pendingRequests = {};
    this.deadline = null;
    this.timer = null;
    this.battle = createBattle(room.mode === 'ffa' ? 'ffa' : 'singles', {
      send: (type, data) => this.onSend(type, data),
    });
    this.battle.rfieldInitial = room.fieldId;
  }
  begin() {
    const b = this.battle;
    this.room.seats.forEach((s, i) => {
      b.setPlayer(`p${i + 1}`, {name: s.name, team: s.team.map(set => ({...set}))});
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
    // Send updates to everyone, then let AIs act.
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
        choice = ai.choose(this.battle, side, req, this.room.difficulty);
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
    const hpPct = p.hp <= 0 ? 0 : Math.max(1, Math.round(100 * p.hp / p.maxhp));
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
      boosts: Object.fromEntries(Object.entries(p.boosts).filter(([, v]) => v)),
      volatiles: Object.keys(p.volatiles).map(id => VOLATILE_NAMES[id]).filter(Boolean),
    };
    if (own || this.room.openSheets) {
      v.item = p.item ? Dex.mod('champions').items.get(p.item).name : 'None';
      v.ability = Dex.mod('champions').abilities.get(p.ability).name;
      v.moves = p.moveSlots.map(m => {
        const mv = Dex.mod('champions').moves.get(m.id);
        return {name: mv.name, type: mv.type, pp: m.pp, maxpp: m.maxpp};
      });
    }
    if (own) {
      v.hp = p.hp;
      v.maxhp = p.maxhp;
      v.stats = p.storedStats;
    }
    return v;
  }

  stateFor(seat) {
    const b = this.battle;
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
      weather: b.field.weather ? {id: b.field.weather, name: Dex.mod('champions').conditions.get(b.field.weather).name, turns: b.field.weatherState.duration ?? null} : null,
      terrain: b.field.terrain ? {id: b.field.terrain, name: Dex.mod('champions').conditions.get(b.field.terrain).name, turns: b.field.terrainState.duration ?? null} : null,
      pseudo: Object.keys(b.field.pseudoWeather).filter(id => id !== 'rebornfield').map(id => Dex.mod('champions').conditions.get(id).name),
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
          const name = Dex.mod('champions').conditions.get(id).name;
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
    if (req.active && me) {
      for (const m of req.active[0].moves) {
        const mv = Dex.mod('champions').moves.get(m.id);
        m.name = mv.name;
        m.type = mv.type;
        m.category = mv.category;
        m.basePower = mv.basePower;
        m.accuracy = mv.accuracy;
        m.priority = mv.priority;
        m.desc = mv.shortDesc || mv.desc;
        m.moveTarget = mv.target;
        try {
          m.field = fields.describeMoveOnField(this.battle, me, m.id);
        } catch {
          m.field = {};
        }
      }
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
