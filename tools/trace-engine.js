'use strict';
/**
 * Trace which modules + Node builtins the game engine actually loads while
 * running representative workloads (random teams, singles + FFA AI battles).
 * Output: build/engine-manifest.json used by build-web.js.
 */
const Module = require('module');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const loaded = new Set();
const builtins = new Set();
const readdirs = new Set();

const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (Module.isBuiltin(request)) builtins.add(request.replace(/^node:/, ''));
  return origLoad.apply(this, arguments);
};
const origReaddir = fs.readdirSync;
fs.readdirSync = function (p, ...rest) {
  readdirs.add(path.resolve(String(p)));
  return origReaddir.call(this, p, ...rest);
};

async function main() {
  const {Room, rooms} = require('../server/hub').internals;
  const {randomTeam, parseTeamPaste, exportTeamPaste, fields} = require('../server/sim');
  for (let i = 0; i < 25; i++) randomTeam();
  for (let i = 0; i < 25; i++) randomTeam({dexMode: 'natdex'});
  const samplePaste = exportTeamPaste(randomTeam({dexMode: 'natdex'}));
  parseTeamPaste(samplePaste);

  const runGame = (mode, fieldId, extraOpts = {}) => new Promise(resolve => {
    const host = {token: 'x'.repeat(32), name: 'Tracer', room: null, send() {}};
    const room = new Room(mode, host, {fillAI: true, ...extraOpts});
    if (mode !== 'ai') for (let i = 1; i < room.seatCount; i++) room.seats[i] = room.makeAISeat();
    room.seats[0].isAI = true;
    room.seats[0].token = null;
    if (!extraOpts.bossId) {
      room.fieldChoice = fieldId;
      room.rollField();
    }
    room.startGame();
    const timer = setInterval(() => {
      if (room.game.ended) {
        clearInterval(timer);
        rooms.delete(room.code);
        resolve();
      }
    }, 20);
  });

  const ids = [...fields.FIELDS.keys()];
  const jobs = [];
  for (let i = 0; i < ids.length; i += 3) jobs.push(runGame('ai', ids[i]));
  jobs.push(runGame('ai', 'chess', {bossId: 'radomus', levelMode: 'lv50'}));
  jobs.push(runGame('ai', 'newworld', {bossId: 'lin', levelMode: 'canonical', customTeamPaste: samplePaste}));
  jobs.push(runGame('ffa', ids[0], {dexMode: 'natdex'}));
  for (let i = 0; i < 3; i++) jobs.push(runGame('ffa', ids[(i * 7) % ids.length]));
  await Promise.all(jobs);

  for (const key of Object.keys(require.cache)) loaded.add(key);
  const files = [...loaded]
    .filter(f => f.startsWith(ROOT) && !f.includes(`${path.sep}tools${path.sep}`))
    .map(f => path.relative(ROOT, f).split(path.sep).join('/'))
    .filter(f => !/node_modules\/(express|ws|body-parser|router|send|serve-static)\//.test(f))
    .filter(f => !f.startsWith('server/index.js'))
    .sort();
  const manifest = {
    files,
    builtins: [...builtins].sort(),
    readdirs: [...readdirs].map(d => path.relative(ROOT, d).split(path.sep).join('/')).sort(),
  };
  fs.mkdirSync(path.join(ROOT, 'build'), {recursive: true});
  fs.writeFileSync(path.join(ROOT, 'build', 'engine-manifest.json'), JSON.stringify(manifest, null, 2));
  let bytes = 0;
  for (const f of files) bytes += fs.statSync(path.join(ROOT, f)).size;
  console.log(`traced ${files.length} files (${(bytes / 1e6).toFixed(2)} MB), builtins: ${manifest.builtins.join(', ')}`);
  console.log('readdirs:', manifest.readdirs.join(', '));
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
