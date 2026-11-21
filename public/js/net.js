/**
 * Connection layer.
 *
 * - Server mode (Node + WebSockets): talks to server/index.js over /ws.
 * - Static mode (GitHub Pages, window.FC_STATIC): runs the game hub (Showdown sim,
 *   field engine, AI) inside this browser tab via engine.js. Online rooms become
 *   peer-to-peer over WebRTC (PeerJS): the room host's tab runs the battle and
 *   guests connect directly to it using the room code.
 */
const PEER_PREFIX = 'fieldclash-v1-';
const JOIN_TIMEOUT_MS = 12000;

export const IS_STATIC = !!window.FC_STATIC;

function waitFor(check, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function poll() {
      const v = check();
      if (v) return resolve(v);
      if (Date.now() - start > timeoutMs) return reject(new Error('timeout'));
      setTimeout(poll, 30);
    })();
  });
}

export class Connection {
  /**
   * @param {(msg: object) => void} onMessage
   * @param {(status: {online: boolean, mode: string}) => void} onStatus
   * @param {() => object} makeHello  returns the hello payload {t:'hello', token, name, room}
   */
  constructor(onMessage, onStatus, makeHello) {
    this.onMessage = onMessage;
    this.onStatus = onStatus;
    this.makeHello = makeHello;
    this.ready = false;
    this.outbox = [];
  }

  start() {
    if (IS_STATIC) this._startStatic();
    else this._startSocket();
  }

  async apiFields() {
    if (IS_STATIC) {
      await waitFor(() => window.FCEngine);
      return window.FCEngine.require('./server/hub.js').apiFields();
    }
    const res = await fetch('api/fields');
    return res.json();
  }

  async apiBosses() {
    if (IS_STATIC) {
      await waitFor(() => window.FCEngine);
      return window.FCEngine.require('./server/hub.js').apiBosses();
    }
    const res = await fetch('api/bosses');
    return res.json();
  }

  send(msg) {
    if (IS_STATIC) this._sendStatic(msg);
    else this._sendSocket(msg);
  }

  // -------------------------------------------------------------------------
  // Server mode
  // -------------------------------------------------------------------------
  _startSocket() {
    this.reconnectDelay = 600;
    const open = () => {
      const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const base = location.pathname.replace(/[^/]*$/, '');
      const ws = new WebSocket(`${proto}//${location.host}${base}ws`);
      this.ws = ws;
      ws.addEventListener('open', () => {
        this.reconnectDelay = 600;
        this.ready = true;
        ws.send(JSON.stringify(this.makeHello()));
        while (this.outbox.length) ws.send(JSON.stringify(this.outbox.shift()));
        this.onStatus({online: true, mode: 'server'});
      });
      ws.addEventListener('message', ev => {
        try {
          this.onMessage(JSON.parse(ev.data));
        } catch (e) {
          console.error(e);
        }
      });
      ws.addEventListener('close', () => {
        this.ready = false;
        this.onStatus({online: false, mode: 'server'});
        setTimeout(open, this.reconnectDelay);
        this.reconnectDelay = Math.min(5000, Math.round(this.reconnectDelay * 1.5));
      });
    };
    open();
  }

  _sendSocket(msg) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.ready) this.ws.send(JSON.stringify(msg));
    else this.outbox.push(msg);
  }

  // -------------------------------------------------------------------------
  // Static mode: local hub + PeerJS
  // -------------------------------------------------------------------------
  async _startStatic() {
    this.mode = 'local';
    this.deliverQueue = [];
    this.hostPeers = new Map(); // room code -> Peer (rooms this tab hosts)
    this.remote = null; // {code, peer, conn, closing}
    try {
      await waitFor(() => window.FCEngine, 30000);
    } catch {
      this.onMessage({t: 'error', msg: 'The battle engine failed to load. Please refresh the page.'});
      return;
    }
    const engine = window.FCEngine.require('./server/hub.js');
    this.hub = engine.createHub();
    this.localClient = this.hub.connect(msg => this._deliver(msg));
    this.ready = true;
    const hello = this.makeHello();
    const urlRoom = hello.room;
    delete hello.room;
    this.hub.receive(this.localClient, hello);
    this.onStatus({online: true, mode: 'local'});
    const queued = this.outbox.splice(0);
    for (const m of queued) this._sendStatic(m);
    if (urlRoom) this._sendStatic({t: 'join', code: urlRoom});
    setInterval(() => this._sweepHostPeers(), 15000);
  }

  _deliver(msg) {
    // Deliver asynchronously (in order) to avoid re-entrancy into the hub.
    this.deliverQueue.push(msg);
    if (this.deliverScheduled) return;
    this.deliverScheduled = true;
    setTimeout(() => {
      this.deliverScheduled = false;
      const batch = this.deliverQueue.splice(0);
      for (const m of batch) {
        try {
          this.onMessage(m);
        } catch (e) {
          console.error(e);
        }
      }
    }, 0);
  }

  _sendStatic(msg) {
    if (!this.ready) {
      this.outbox.push(msg);
      return;
    }
    if (this.mode === 'remote' && this.remote) {
      if (msg.t === 'create' || (msg.t === 'join' && String(msg.code).toUpperCase() !== this.remote.code)) {
        this._leaveRemote(false);
        this._sendStatic(msg);
        return;
      }
      if (msg.t === 'hello') return;
      if (this.remote.conn?.open) this.remote.conn.send(msg);
      if (msg.t === 'leave') this._leaveRemote(true);
      return;
    }

    if (msg.t === 'join') {
      const code = String(msg.code || '').toUpperCase().trim();
      if (!this.hub.rooms.has(code)) {
        this._joinRemote(code);
        return;
      }
    }
    if (msg.t === 'setName' || msg.t === 'hello') {
      // keep the local identity in sync
    }
    this.hub.receive(this.localClient, msg);
    const room = this.localClient.room;
    if (room && room.mode !== 'ai') this._ensureHosting(room.code);
  }

  _peerAvailable() {
    if (typeof window.Peer === 'function') return true;
    this._deliver({t: 'error', msg: 'Online play needs the PeerJS library, which could not be loaded. Check your connection or ad-blocker.'});
    return false;
  }

  _ensureHosting(code) {
    if (this.hostPeers.has(code) || !this._peerAvailable()) return;
    const peer = new window.Peer(PEER_PREFIX + code, {debug: 0});
    this.hostPeers.set(code, peer);
    peer.on('connection', conn => {
      let client = null;
      conn.on('open', () => {
        client = this.hub.connect(m => {
          if (conn.open) conn.send(m);
        });
      });
      conn.on('data', data => {
        if (client) this.hub.receive(client, data);
      });
      const drop = () => {
        if (client) this.hub.disconnect(client);
        client = null;
      };
      conn.on('close', drop);
      conn.on('error', drop);
    });
    peer.on('disconnected', () => {
      if (!peer.destroyed) peer.reconnect();
    });
    peer.on('error', err => {
      if (err.type === 'unavailable-id') {
        this._deliver({t: 'error', msg: `Room code ${code} is already in use online. Leave and create a new room.`});
      } else if (['network', 'server-error', 'socket-error', 'socket-closed'].includes(err.type)) {
        this._deliver({t: 'error', msg: 'Lost contact with the matchmaking server; friends may not be able to join until it reconnects.'});
      }
    });
  }

  _sweepHostPeers() {
    for (const [code, peer] of this.hostPeers) {
      if (!this.hub.rooms.has(code)) {
        peer.destroy();
        this.hostPeers.delete(code);
      }
    }
  }

  _joinRemote(code) {
    if (!code || !this._peerAvailable()) return;
    // Leave any local room first
    if (this.localClient.room) this.hub.receive(this.localClient, {t: 'leave'});
    const peer = new window.Peer({debug: 0});
    const remote = {code, peer, conn: null, closing: false, opened: false};
    this.remote = remote;
    const fail = text => {
      if (remote.closing) return;
      remote.closing = true;
      try {
        peer.destroy();
      } catch {}
      if (this.remote === remote) {
        this.remote = null;
        this.mode = 'local';
      }
      this._deliver({t: 'error', msg: text});
      this._deliver({t: 'left'});
    };
    const timer = setTimeout(() => {
      if (!remote.opened) fail(`Couldn't reach room ${code}. Check the code, and make sure the host still has Field Clash open.`);
    }, JOIN_TIMEOUT_MS);

    peer.on('open', () => {
      const conn = peer.connect(PEER_PREFIX + code, {reliable: true});
      remote.conn = conn;
      conn.on('open', () => {
        remote.opened = true;
        clearTimeout(timer);
        this.mode = 'remote';
        const hello = this.makeHello();
        hello.room = code;
        conn.send(hello);
        conn.send({t: 'join', code});
      });
      conn.on('data', data => {
        if (this.remote === remote && !remote.closing) this._deliver(data);
      });
      conn.on('close', () => {
        if (!remote.closing) fail(`Connection to room ${code} was lost (the host may have closed their tab).`);
      });
      conn.on('error', () => {
        if (!remote.closing) fail(`Connection to room ${code} failed.`);
      });
    });
    peer.on('error', err => {
      clearTimeout(timer);
      if (err.type === 'peer-unavailable') fail(`Room ${code} wasn't found. Check the code, and make sure the host still has Field Clash open.`);
      else fail(`Couldn't connect to room ${code} (${err.type || 'network error'}).`);
    });
  }

  _leaveRemote(notify) {
    const remote = this.remote;
    if (!remote) return;
    remote.closing = true;
    this.remote = null;
    this.mode = 'local';
    setTimeout(() => {
      try {
        remote.conn?.close();
        remote.peer.destroy();
      } catch {}
    }, 150);
    if (notify) this._deliver({t: 'left'});
  }
}
