'use strict';
/**
 * Static build for GitHub Pages.
 *
 * Produces ./site with:
 *   - the regular front-end (public/) using relative asset paths
 *   - engine.js: a self-contained CommonJS module map of the game server
 *     (Pokémon Showdown sim + Champions data + field engine + AI + hub),
 *     so the whole game runs in the browser with no backend.
 *
 * Online rooms in the static build are peer-to-peer (PeerJS / WebRTC): the
 * room host's browser runs the battle and guests connect directly to it.
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'site');
const VROOT = '/app';
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'engine-manifest.json'), 'utf8'));

function rmrf(p) {
  fs.rmSync(p, {recursive: true, force: true});
}
function copyDir(src, dst) {
  fs.mkdirSync(dst, {recursive: true});
  for (const entry of fs.readdirSync(src, {withFileTypes: true})) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// ---------------------------------------------------------------------------
// 1. Module map
// ---------------------------------------------------------------------------
const files = [...new Set([...manifest.files, 'server/hub.js', 'server/rand.js'])].sort();
const dirListings = {};
for (const rel of manifest.readdirs) {
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs)) dirListings[`${VROOT}/${rel}`] = fs.readdirSync(abs);
}

// package.json "main" entries for bare-specifier resolution
const pkgMains = {};
for (const rel of files) {
  const m = /^(.*node_modules\/(?:@[^/]+\/)?[^/]+)\//.exec(rel);
  if (!m || pkgMains[`${VROOT}/${m[1]}`]) continue;
  const pj = JSON.parse(fs.readFileSync(path.join(ROOT, m[1], 'package.json'), 'utf8'));
  let main = pj.main || 'index.js';
  if (!/\.(c?js|json)$/.test(main)) {
    main = fs.existsSync(path.join(ROOT, m[1], main + '.js')) ? main + '.js' : path.posix.join(main, 'index.js');
  }
  pkgMains[`${VROOT}/${m[1]}`] = path.posix.normalize(`${VROOT}/${m[1]}/${main}`);
}

let moduleSrc = '';
let rawBytes = 0;
for (const rel of files) {
  const abs = path.join(ROOT, rel);
  let code = fs.readFileSync(abs, 'utf8');
  rawBytes += code.length;
  if (rel.endsWith('.json')) {
    code = `module.exports = ${JSON.stringify(JSON.parse(code))};`;
  } else {
    code = code.replace(/^#!.*\n/, '');
    code = esbuild.transformSync(code, {loader: 'js', minify: true, target: 'es2020', legalComments: 'none'}).code;
  }
  moduleSrc += `M[${JSON.stringify(`${VROOT}/${rel}`)}]=function(module,exports,require,__filename,__dirname){${code}\n};\n`;
}

const runtime = `
var R=${JSON.stringify(VROOT)},D=${JSON.stringify(dirListings)},P=${JSON.stringify(pkgMains)},C={};
var G=typeof globalThis!=='undefined'?globalThis:window;
if(!G.global)G.global=G;
if(!G.process)G.process={env:{},argv:[],version:'v20.0.0',versions:{node:'20.0.0'},platform:'browser',cwd:function(){return R},
  nextTick:function(f){var a=[].slice.call(arguments,1);queueMicrotask(function(){f.apply(null,a)})},on:function(){},once:function(){},emit:function(){},
  hrtime:function(p){var t=performance.now(),s=Math.floor(t/1e3),n=Math.floor((t%1e3)*1e6);if(p){s-=p[0];n-=p[1];if(n<0){s--;n+=1e9}}return[s,n]},
  memoryUsage:function(){return{heapUsed:0,rss:0}},exit:function(){}};
function norm(p){var out=[];p.split('/').forEach(function(s){if(!s||s==='.')return;if(s==='..')out.pop();else out.push(s)});return '/'+out.join('/')}
var pathShim={sep:'/',delimiter:':',
  normalize:norm,isAbsolute:function(p){return p.charAt(0)==='/'},
  join:function(){return norm([].slice.call(arguments).join('/'))},
  resolve:function(){var p='';for(var i=arguments.length-1;i>=0;i--){p=arguments[i]+(p?'/'+p:'');if(arguments[i].charAt(0)==='/')break}if(p.charAt(0)!=='/')p=R+'/'+p;return norm(p)},
  dirname:function(p){var n=norm(p);return n.slice(0,n.lastIndexOf('/'))||'/'},
  basename:function(p,e){var b=p.split('/').pop();if(e&&b.slice(-e.length)===e)b=b.slice(0,-e.length);return b},
  extname:function(p){var b=p.split('/').pop(),i=b.lastIndexOf('.');return i>0?b.slice(i):''},
  relative:function(a,b){a=norm(a).split('/').filter(Boolean);b=norm(b).split('/').filter(Boolean);while(a.length&&b.length&&a[0]===b[0]){a.shift();b.shift()}return a.map(function(){return'..'}).concat(b).join('/')}};
pathShim.posix=pathShim;
function enoent(p){var e=new Error('ENOENT: no such file or directory, '+p);e.code='ENOENT';return e}
function isDir(p){return Object.prototype.hasOwnProperty.call(D,p)}
var fsShim={
  readdirSync:function(p){p=pathShim.resolve(p);if(isDir(p))return D[p].slice();throw enoent(p)},
  existsSync:function(p){p=pathShim.resolve(p);return isDir(p)||!!M[p]||!!M[p+'.js']},
  statSync:function(p){p=pathShim.resolve(p);if(!isDir(p)&&!M[p])throw enoent(p);return{isDirectory:function(){return isDir(p)},isFile:function(){return!isDir(p)},mtimeMs:0,size:0}},
  readFileSync:function(p){throw enoent(p)},writeFileSync:function(){},mkdirSync:function(){},
  watch:function(){return{close:function(){}}},watchFile:function(){},unwatchFile:function(){},
  promises:{readFile:function(p){return Promise.reject(enoent(p))}}};
var cryptoShim={randomBytes:function(n){var b=new Uint8Array(n);G.crypto.getRandomValues(b);b.toString=function(enc){return Array.prototype.map.call(this,function(x){return(x<16?'0':'')+x.toString(16)}).join('')};return b},
  randomInt:function(a,b){if(b===undefined){b=a;a=0}var u=new Uint32Array(1);G.crypto.getRandomValues(u);return a+u[0]%(b-a)}};
function deq(a,b){if(a===b||(a!==a&&b!==b))return true;if(typeof a!=='object'||typeof b!=='object'||!a||!b)return false;if(Object.getPrototypeOf(a)!==Object.getPrototypeOf(b))return false;if(Array.isArray(a)){if(a.length!==b.length)return false;for(var i=0;i<a.length;i++)if(!deq(a[i],b[i]))return false;return true}var ka=Object.keys(a),kb=Object.keys(b);if(ka.length!==kb.length)return false;for(var j=0;j<ka.length;j++){if(!Object.prototype.hasOwnProperty.call(b,ka[j])||!deq(a[ka[j]],b[ka[j]]))return false}return true}
var B={fs:fsShim,path:pathShim,crypto:cryptoShim,events:{EventEmitter:function(){}},os:{EOL:'\\n',cpus:function(){return[]}},util:{inspect:function(x){try{return JSON.stringify(x)}catch(e){return String(x)}},isDeepStrictEqual:deq},child_process:{},cluster:{},net:{},http:{},https:{},zlib:{},url:{},stream:{},tty:{isatty:function(){return false}},worker_threads:{},v8:{},readline:{},assert:function(c,m){if(!c)throw new Error(m||'Assertion failed')}};
function notFound(r){var e=new Error("Cannot find module '"+r+"'");e.code='MODULE_NOT_FOUND';return e}
${JSON.stringify(manifest.builtins)}.forEach(function(n){if(!B[n])B[n]={}});
function tryFile(p){if(M[p])return p;if(M[p+'.js'])return p+'.js';if(M[p+'.json'])return p+'.json';if(M[p+'/index.js'])return p+'/index.js';if(P[p])return P[p];return null}
function resolve(dir,req){
  var r=req.replace(/^node:/,'');
  if(Object.prototype.hasOwnProperty.call(B,r))return'builtin:'+r;
  var f;
  if(r.charAt(0)==='/'||r.slice(0,2)==='./'||r.slice(0,3)==='../'||r==='.'||r==='..'){
    f=tryFile(r.charAt(0)==='/'?norm(r):norm(dir+'/'+r));
  }else{
    var d=dir;
    for(;;){f=tryFile(norm(d+'/node_modules/'+r));if(f||d==='/'||d==='')break;d=d.slice(0,d.lastIndexOf('/'))||'/'}
  }
  if(!f)throw notFound(req);
  return f;
}
function load(dir,req){
  var id=resolve(dir,req);
  if(id.slice(0,8)==='builtin:')return B[id.slice(8)];
  if(C[id])return C[id].exports;
  var module={id:id,filename:id,exports:{},loaded:false};
  C[id]=module;
  var mdir=id.slice(0,id.lastIndexOf('/'));
  var req2=function(r){return load(mdir,r)};
  req2.resolve=function(r){return resolve(mdir,r)};
  req2.cache=C;
  try{M[id].call(module.exports,module,module.exports,req2,id,mdir)}catch(e){delete C[id];throw e}
  module.loaded=true;
  return module.exports;
}
G.FCEngine={require:function(r){return load(R,r)},version:${JSON.stringify(new Date().toISOString())}};
`;

const engineJs = `/* Field Clash engine bundle — Pokémon Showdown (MIT) + Field Clash field engine. Generated by tools/build-web.js */\n(function(){"use strict";var M={};\n${moduleSrc}${runtime}})();\n`;

// ---------------------------------------------------------------------------
// 2. Site output
// ---------------------------------------------------------------------------
rmrf(OUT);
copyDir(path.join(ROOT, 'public'), OUT);
fs.writeFileSync(path.join(OUT, 'engine.js'), engineJs);

let html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
html = html
  .replace('href="/css/style.css"', 'href="css/style.css"')
  .replace('src="/js/app.js"', 'src="js/app.js"')
  .replace(
    '<script type="module" src="js/app.js"></script>',
    [
      '<script>window.FC_STATIC = true;</script>',
      '<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js" defer></script>',
      '<script src="engine.js" defer></script>',
      '<script type="module" src="js/app.js"></script>',
    ].join('\n  ')
  );
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
fs.copyFileSync(path.join(OUT, 'index.html'), path.join(OUT, '404.html'));

console.log(`site/ built: ${files.length} engine modules, ${(rawBytes / 1e6).toFixed(2)} MB source -> engine.js ${(engineJs.length / 1e6).toFixed(2)} MB`);
