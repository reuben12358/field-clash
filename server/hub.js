'use strict';
/**
 * Transport-agnostic message hub. The Node server (server/index.js) wires it to
 * WebSockets; the static GitHub Pages build runs the exact same hub inside the
 * host player's browser and wires it to WebRTC (PeerJS) data channels.
 */
const {Room, Game, rooms} = require('./game');
const {fields} = require('./sim');
const {randomInt, randomHex} = require('./rand');

function cleanName(name) {
  const n = String(name || '').replace(/[^\p{L}\p{N} _.\-'!?]/gu, '').trim().slice(0, 18);
  return n || `Trainer${randomInt(1000, 9999)}`;
}

function apiFields() {
  return [...fields.FIELDS.keys()].map(id => fields.publicInfo(id));
}

function createHub() {
  /** token -> client (so reconnects re-bind to the same seat) */
  const clientsByToken = new Map();

  function connect(sendFn) {
    return {
      token: null,
      name: 'Trainer',
      room: null,
      send(msg) {
        try {
          sendFn(msg);
        } catch (e) {
          console.error('send failed', e);
        }
      },
    };
  }

  function disconnect(client) {
    if (client.room) client.room.leave(client);
    if (clientsByToken.get(client.token) === client) clientsByToken.delete(client.token);
  }

  function receive(client, msg) {
    if (!msg || typeof msg !== 'object') return;
    try {
      handle(client, msg);
    } catch (e) {
      console.error('handler error', e);
      client.send({t: 'error', msg: 'Server error: ' + e.message});
    }
  }

  function handle(client, msg) {
    if (msg.t === 'hello') {
      client.token = typeof msg.token === 'string' && /^[a-f0-9]{32}$/.test(msg.token) ? msg.token : randomHex(16);
      client.name = cleanName(msg.name);
      const old = clientsByToken.get(client.token);
      clientsByToken.set(client.token, client);
      client.send({t: 'welcome', token: client.token, name: client.name});
      // Reconnect to an in-progress room
      let room = old?.room;
      if (!room && msg.room) room = rooms.get(String(msg.room).toUpperCase());
      if (room && room.seatOf(client) >= 0) {
        if (old && old !== client) old.room = null;
        room.join(client);
        room.broadcastRoom();
        if (room.game) room.game.resync(client);
      }
      return;
    }
    if (!client.token) return;
    const room = client.room;
    switch (msg.t) {
    case 'setName':
      client.name = cleanName(msg.name);
      if (room) {
        const s = room.seats[room.seatOf(client)];
        if (s) s.name = client.name;
        room.broadcastRoom();
      }
      client.send({t: 'welcome', token: client.token, name: client.name});
      break;
    case 'create': {
      if (room) room.leave(client);
      const mode = ['ai', 'pvp', 'ffa'].includes(msg.mode) ? msg.mode : 'ai';
      const r = new Room(mode, client, {
        difficulty: msg.difficulty,
        fillAI: msg.fillAI,
      });
      if (msg.fieldFilter && ['all', 'Reborn', 'Rejuvenation', 'Desolation'].includes(msg.fieldFilter)) {
        r.fieldFilter = msg.fieldFilter;
        r.rollField();
      }
      if (msg.field && (msg.field === 'random' || fields.FIELDS.has(msg.field))) {
        r.fieldChoice = msg.field;
        r.rollField();
      }
      if (msg.quickStart && (mode === 'ai' || (mode === 'ffa' && msg.fillAI))) {
        r.startGame();
      } else {
        r.broadcastRoom();
      }
      break;
    }
    case 'join': {
      const r = rooms.get(String(msg.code || '').toUpperCase().trim());
      if (!r) {
        client.send({t: 'error', msg: 'Room not found.'});
        return;
      }
      if (room && room !== r) room.leave(client);
      r.join(client);
      r.broadcastRoom();
      if (r.game) r.game.resync(client);
      break;
    }
    case 'leave':
      if (room) room.leave(client);
      client.send({t: 'left'});
      break;
    case 'chat': {
      if (!room) return;
      const text = String(msg.text || '').slice(0, 300).trim();
      if (!text) return;
      room.pushChat({from: client.name, text});
      break;
    }
    case 'reroll':
    case 'setField':
    case 'setDifficulty':
    case 'setOpenSheets':
    case 'addAI':
    case 'kick':
    case 'start':
      if (room) room.handleLobby(client, msg);
      break;
    case 'choose':
      if (room?.game) room.game.choose(client, msg);
      break;
    case 'forfeit':
      if (room?.game) room.game.forfeit(client);
      break;
    case 'rematch':
      if (room && room.status === 'ended' && room.isHost(client)) room.backToLobby();
      break;
    case 'resync':
      if (room?.game) room.game.resync(client);
      else if (room) client.send({t: 'room', room: room.roomView(client)});
      break;
    }
  }

  return {connect, receive, disconnect, rooms, apiFields};
}

module.exports = {createHub, apiFields, internals: {Room, Game, rooms}};
