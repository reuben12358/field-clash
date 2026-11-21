'use strict';
const path = require('path');
const http = require('http');
const express = require('express');
const {WebSocketServer} = require('ws');
const {createHub, apiFields} = require('./hub');
const {fields} = require('./sim');

const PORT = Number(process.env.PORT) || 3000;
const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/api/fields', (req, res) => res.json(apiFields()));
app.get('/healthz', (req, res) => res.send('ok'));

const server = http.createServer(app);
const wss = new WebSocketServer({server, path: '/ws'});
const hub = createHub();

wss.on('connection', ws => {
  const client = hub.connect(msg => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
  });
  ws.on('message', raw => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    hub.receive(client, msg);
  });
  ws.on('close', () => hub.disconnect(client));
});

server.listen(PORT, () => {
  console.log(`Field Clash listening on http://localhost:${PORT} (${fields.FIELDS.size} fields loaded)`);
});
