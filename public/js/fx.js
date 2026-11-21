/**
 * Dual-Layer Battlefield Renderer:
 *   1. ArenaScene (#arena-scene, behind Pokémon sprites):
 *      Draws bespoke illustrated environments & perspective battle pads for all 63 fields.
 *   2. ArenaFX (#arena-fx, above Pokémon sprites):
 *      Draws ambient field particles, weather, full directional Move Animations,
 *      impact bursts, and floating combat popups.
 */
import {TYPE_COLORS} from './data.js';

function hexToRgba(hex, alpha = 1) {
  const h = String(hex || '#f5a623').replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const num = parseInt(full, 16) || 0xf5a623;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// Deterministic pseudo-random helper for stable scenery details
function hash01(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ============================================================================
// 1. SCENIC BATTLEFIELD BACKDROP RENDERER (#arena-scene)
// ============================================================================
export class ArenaScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.fieldId = 'none';
    this.theme = {};
    this.isFFA = false;
    this.running = false;
    this.raf = 0;
    this.w = 0;
    this.h = 0;
    window.addEventListener('resize', () => this.resize());
  }

  start() {
    if (this.running || !this.ctx) return;
    this.running = true;
    this.resize();
    const tick = now => {
      if (!this.running) return;
      this.draw(now / 1000);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  resize() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, Math.floor(rect.width));
    this.h = Math.max(1, Math.floor(rect.height));
    this.canvas.width = Math.floor(this.w * dpr);
    this.canvas.height = Math.floor(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setField(fieldId, theme = {}, isFFA = false) {
    this.fieldId = fieldId || 'none';
    this.theme = theme || {};
    this.isFFA = !!isFFA;
  }

  draw(t) {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;
    if (!ctx || !w || !h) return;

    const id = this.fieldId;
    const bg1 = this.theme.bg1 || '#1e2736';
    const bg2 = this.theme.bg2 || '#0f141d';
    const ground = this.theme.ground || '#222d3f';
    const accent = this.theme.accent || '#f5a623';
    const horizon = h * 0.48;

    // Sky / backdrop gradient
    const skyG = ctx.createLinearGradient(0, 0, 0, h);
    skyG.addColorStop(0, bg1);
    skyG.addColorStop(0.55, bg2);
    skyG.addColorStop(1, bg2);
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, w, h);

    // Ambient horizon glow
    const glow = ctx.createRadialGradient(w * 0.5, horizon, 10, w * 0.5, horizon, w * 0.62);
    glow.addColorStop(0, hexToRgba(accent, 0.24));
    glow.addColorStop(1, hexToRgba(accent, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Base ground plane
    const grdG = ctx.createLinearGradient(0, horizon, 0, h);
    grdG.addColorStop(0, ground);
    grdG.addColorStop(1, bg2);
    ctx.fillStyle = grdG;
    ctx.beginPath();
    ctx.moveTo(0, horizon + 12);
    ctx.quadraticCurveTo(w * 0.5, horizon - 18, w, horizon + 12);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Field-specific illustrated scenery
    ctx.save();
    this._drawFieldScenery(ctx, w, h, horizon, t, id, accent, ground);
    ctx.restore();

    // Battle platforms under active Pokémon slots
    this._drawBattlePads(ctx, w, h, t, id, accent);

    // Subtle edge vignette so HUD & sprites pop cleanly
    const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.34, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(5,8,14,0.42)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }

  _drawBattlePads(ctx, w, h, t, id, accent) {
    const pads = this.isFFA
      ? [
        {x: w * 0.14, y: h * 0.84, rx: 64, ry: 18},
        {x: w * 0.14, y: h * 0.36, rx: 56, ry: 15},
        {x: w * 0.86, y: h * 0.36, rx: 56, ry: 15},
        {x: w * 0.86, y: h * 0.84, rx: 60, ry: 17},
      ]
      : [
        {x: w * 0.16, y: h * 0.84, rx: 82, ry: 22},
        {x: w * 0.84, y: h * 0.39, rx: 70, ry: 18},
      ];

    const pulse = 0.75 + 0.25 * Math.sin(t * 2.4);
    for (const pad of pads) {
      ctx.save();
      const g = ctx.createRadialGradient(pad.x, pad.y, 4, pad.x, pad.y, pad.rx * 1.15);
      g.addColorStop(0, hexToRgba(accent, 0.26 * pulse));
      g.addColorStop(0.7, hexToRgba(accent, 0.1));
      g.addColorStop(1, hexToRgba(accent, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(pad.x, pad.y, pad.rx * 1.15, pad.ry * 1.25, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = hexToRgba(accent, 0.45 * pulse);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(pad.x, pad.y, pad.rx, pad.ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = hexToRgba('#ffffff', 0.14);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(pad.x, pad.y, pad.rx * 0.72, pad.ry * 0.72, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawMountains(ctx, w, horizon, color, peakH = 95, count = 7, snowCap = false) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, horizon + 12);
    for (let i = 0; i <= count; i++) {
      const x = (w * i) / count;
      const py = i % 2 === 0 ? horizon - peakH * (0.55 + 0.45 * hash01(i + 3)) : horizon - peakH * 0.22;
      ctx.lineTo(x, py);
    }
    ctx.lineTo(w, horizon + 12);
    ctx.closePath();
    ctx.fill();

    if (snowCap) {
      ctx.fillStyle = 'rgba(235, 246, 255, 0.72)';
      for (let i = 0; i <= count; i += 2) {
        const x = (w * i) / count;
        const py = horizon - peakH * (0.55 + 0.45 * hash01(i + 3));
        ctx.beginPath();
        ctx.moveTo(x, py);
        ctx.lineTo(x - 24, py + 26);
        ctx.lineTo(x - 6, py + 20);
        ctx.lineTo(x + 8, py + 25);
        ctx.lineTo(x + 24, py + 26);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  _drawPerspectiveGrid(ctx, w, h, horizon, strokeStyle, cols = 12, rows = 7) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 1.1;
    const vanishY = horizon - 30;
    for (let i = -cols; i <= cols; i++) {
      const topX = w * 0.5 + i * (w * 0.045);
      const botX = w * 0.5 + i * (w * 0.16);
      ctx.beginPath();
      ctx.moveTo(topX, horizon);
      ctx.lineTo(botX, h);
      ctx.stroke();
    }
    for (let r = 1; r <= rows; r++) {
      const frac = Math.pow(r / rows, 1.65);
      const y = horizon + (h - horizon) * frac;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    void vanishY;
  }

  _drawCrystalCluster(ctx, cx, baseY, scale, color1, color2) {
    const shards = [
      {dx: -18, w: 16, h: 58, tilt: -0.22},
      {dx: 0, w: 22, h: 86, tilt: 0.04},
      {dx: 17, w: 15, h: 52, tilt: 0.25},
    ];
    for (const s of shards) {
      ctx.save();
      ctx.translate(cx + s.dx * scale, baseY);
      ctx.rotate(s.tilt);
      const g = ctx.createLinearGradient(0, -s.h * scale, 0, 0);
      g.addColorStop(0, color1);
      g.addColorStop(1, color2);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-s.w * 0.5 * scale, 0);
      ctx.lineTo(-s.w * 0.32 * scale, -s.h * 0.72 * scale);
      ctx.lineTo(0, -s.h * scale);
      ctx.lineTo(s.w * 0.36 * scale, -s.h * 0.68 * scale);
      ctx.lineTo(s.w * 0.5 * scale, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.38)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawTrees(ctx, w, horizon, trunkColor, canopyColor, count = 11) {
    for (let i = 0; i < count; i++) {
      const x = (w * (i + 0.35)) / count;
      const th = 58 + hash01(i * 7) * 52;
      const baseY = horizon + 10 + (i % 2) * 8;
      ctx.fillStyle = trunkColor;
      ctx.fillRect(x - 5, baseY - th * 0.55, 10, th * 0.55);
      ctx.fillStyle = canopyColor;
      ctx.beginPath();
      ctx.arc(x, baseY - th * 0.62, 26 + hash01(i * 3) * 14, 0, Math.PI * 2);
      ctx.arc(x - 16, baseY - th * 0.48, 19, 0, Math.PI * 2);
      ctx.arc(x + 16, baseY - th * 0.48, 19, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawCavernArch(ctx, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, h * 0.28);
    for (let i = 12; i >= 0; i--) {
      const x = (w * i) / 12;
      const jag = i % 2 === 0 ? h * 0.08 + hash01(i) * 32 : h * 0.17 + hash01(i + 9) * 38;
      ctx.lineTo(x, jag);
    }
    ctx.closePath();
    ctx.fill();
  }

  _drawFieldScenery(ctx, w, h, horizon, t, id, accent, ground) {
    // 1. CHESS BOARD
    if (id === 'chess') {
      const rows = 7;
      const cols = 10;
      for (let r = 0; r < rows; r++) {
        const f0 = Math.pow(r / rows, 1.55);
        const f1 = Math.pow((r + 1) / rows, 1.55);
        const y0 = horizon + (h - horizon) * f0;
        const y1 = horizon + (h - horizon) * f1;
        const span0 = w * (0.58 + f0 * 0.75);
        const span1 = w * (0.58 + f1 * 0.75);
        for (let c = 0; c < cols; c++) {
          const x0a = w * 0.5 - span0 * 0.5 + (span0 * c) / cols;
          const x0b = w * 0.5 - span0 * 0.5 + (span0 * (c + 1)) / cols;
          const x1a = w * 0.5 - span1 * 0.5 + (span1 * c) / cols;
          const x1b = w * 0.5 - span1 * 0.5 + (span1 * (c + 1)) / cols;
          ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(232, 221, 196, 0.22)' : 'rgba(18, 21, 29, 0.58)';
          ctx.beginPath();
          ctx.moveTo(x0a, y0);
          ctx.lineTo(x0b, y0);
          ctx.lineTo(x1b, y1);
          ctx.lineTo(x1a, y1);
          ctx.closePath();
          ctx.fill();
        }
      }
      // Silhouette chess pieces along horizon
      const pieces = [0.22, 0.34, 0.46, 0.54, 0.66, 0.78];
      pieces.forEach((px, idx) => {
        const x = w * px;
        const ph = idx === 2 || idx === 3 ? 62 : 44;
        ctx.fillStyle = 'rgba(216, 178, 92, 0.22)';
        ctx.beginPath();
        ctx.ellipse(x, horizon, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 7, horizon - ph, 14, ph);
        ctx.beginPath();
        ctx.arc(x, horizon - ph - 6, idx === 2 ? 11 : 8, 0, Math.PI * 2);
        ctx.fill();
      });
      return;
    }

    // 2. ELECTRIC / SHORT-CIRCUIT / FACTORY
    if (id === 'electric' || id === 'shortcircuit' || id === 'factory') {
      this._drawPerspectiveGrid(ctx, w, h, horizon, hexToRgba(accent, id === 'shortcircuit' ? (Math.sin(t * 17) > 0 ? 0.32 : 0.08) : 0.22));
      if (id === 'factory' || id === 'shortcircuit') {
        // Rotating industrial gears
        const gears = [{x: w * 0.2, y: horizon - 38, r: 44, dir: 1}, {x: w * 0.31, y: horizon - 14, r: 28, dir: -1.4}, {x: w * 0.8, y: horizon - 34, r: 42, dir: -1}];
        for (const gr of gears) {
          ctx.save();
          ctx.translate(gr.x, gr.y);
          ctx.rotate(t * 0.45 * gr.dir);
          ctx.strokeStyle = hexToRgba(accent, 0.24);
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.arc(0, 0, gr.r, 0, Math.PI * 2);
          ctx.stroke();
          for (let k = 0; k < 8; k++) {
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = hexToRgba(accent, 0.24);
            ctx.fillRect(-5, -gr.r - 9, 10, 10);
          }
          ctx.restore();
        }
      } else {
        // Transmission pylons + sky lightning flash
        for (const px of [0.18, 0.5, 0.82]) {
          const x = w * px;
          ctx.strokeStyle = hexToRgba(accent, 0.28);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - 16, horizon + 4);
          ctx.lineTo(x, horizon - 72);
          ctx.lineTo(x + 16, horizon + 4);
          ctx.moveTo(x - 22, horizon - 48);
          ctx.lineTo(x + 22, horizon - 48);
          ctx.moveTo(x - 16, horizon - 28);
          ctx.lineTo(x + 16, horizon - 28);
          ctx.stroke();
        }
        if (Math.sin(t * 3.7) > 0.92) {
          ctx.strokeStyle = 'rgba(255, 243, 160, 0.85)';
          ctx.lineWidth = 2.4;
          let lx = w * (0.3 + 0.4 * hash01(Math.floor(t * 4)));
          let ly = 0;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          for (let s = 0; s < 6; s++) {
            lx += (hash01(s + Math.floor(t * 8)) - 0.5) * 44;
            ly += horizon / 6;
            ctx.lineTo(lx, ly);
          }
          ctx.stroke();
        }
      }
      return;
    }

    // 3. GRASSY / FOREST / BEWITCHED WOODS / FLOWER GARDEN 1..5
    if (id === 'grassy' || id === 'forest' || id === 'bewitchedwoods' || id.startsWith('flowergarden')) {
      if (id === 'forest' || id === 'bewitchedwoods') {
        this._drawTrees(
          ctx,
          w,
          horizon,
          id === 'bewitchedwoods' ? 'rgba(24,18,34,0.75)' : 'rgba(32,24,16,0.65)',
          id === 'bewitchedwoods' ? 'rgba(42,98,92,0.52)' : 'rgba(38,96,48,0.55)',
          12
        );
        // Sunbeams / glamour rays
        for (let i = 0; i < 4; i++) {
          const rx = w * (0.18 + i * 0.22);
          const rg = ctx.createLinearGradient(rx, 0, rx + 60, h * 0.8);
          rg.addColorStop(0, hexToRgba(accent, 0.16));
          rg.addColorStop(1, hexToRgba(accent, 0));
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.moveTo(rx - 22, 0);
          ctx.lineTo(rx + 24, 0);
          ctx.lineTo(rx + 110, h * 0.85);
          ctx.lineTo(rx + 30, h * 0.85);
          ctx.closePath();
          ctx.fill();
        }
      }
      // Swaying grass blades across the meadow
      const stage = id.startsWith('flowergarden') ? Number(id.slice(-1)) || 1 : 3;
      const bladeCount = id.startsWith('flowergarden') ? 28 + stage * 18 : 68;
      ctx.strokeStyle = hexToRgba(id === 'bewitchedwoods' ? '#56e39f' : '#6ee778', 0.34);
      ctx.lineWidth = 1.6;
      for (let i = 0; i < bladeCount; i++) {
        const gx = hash01(i * 3.1) * w;
        const gy = horizon + 12 + hash01(i * 7.3) * (h - horizon - 18);
        const sway = Math.sin(t * 2.2 + i) * 5;
        const bh = 10 + hash01(i * 5.7) * 12;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.quadraticCurveTo(gx + sway * 0.5, gy - bh * 0.6, gx + sway, gy - bh);
        ctx.stroke();

        // Blossoms on Grassy or Flower Garden Stage 2+
        const flowerDensity = id.startsWith('flowergarden') ? (stage - 1) * 0.24 : (id === 'grassy' ? 0.22 : 0);
        if (flowerDensity > 0 && hash01(i * 11.9) < flowerDensity) {
          const palette = ['#ff8fab', '#ffd166', '#a8dadc', '#f8f9fa', '#c77dff'];
          ctx.fillStyle = palette[i % palette.length];
          ctx.beginPath();
          ctx.arc(gx + sway, gy - bh - 2, stage >= 4 ? 4.2 : 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return;
    }

    // 4. CRYSTAL CAVERN & DARK CRYSTAL CAVERN
    if (id === 'crystalcavern' || id === 'darkcrystalcavern') {
      this._drawCavernArch(ctx, w, h, 'rgba(8, 10, 20, 0.72)');
      const dark = id === 'darkcrystalcavern';
      const clusters = [
        {x: w * 0.08, y: horizon + 36, s: 1.15, c1: dark ? '#748ffc' : '#56ccf2', c2: dark ? '#1e2a5e' : '#1b4965'},
        {x: w * 0.26, y: horizon + 8, s: 0.8, c1: dark ? '#9775fa' : '#ff8fab', c2: dark ? '#2b1e54' : '#591d36'},
        {x: w * 0.52, y: horizon - 2, s: 0.72, c1: dark ? '#4dabf7' : '#69db7c', c2: dark ? '#183252' : '#1b4332'},
        {x: w * 0.74, y: horizon + 10, s: 0.85, c1: dark ? '#748ffc' : '#ffd166', c2: dark ? '#1f2854' : '#5c4312'},
        {x: w * 0.92, y: horizon + 42, s: 1.2, c1: dark ? '#5c7cfa' : '#66d9e8', c2: dark ? '#19224a' : '#154c59'},
      ];
      for (const cl of clusters) {
        this._drawCrystalCluster(ctx, cl.x, cl.y, cl.s, cl.c1, cl.c2);
      }
      return;
    }

    // 5. BURNING / VOLCANIC TOP / SUPER-HEATED / INFERNAL / DRAGON'S DEN
    if (['burning', 'volcanictop', 'superheated', 'infernal', 'dragonsden'].includes(id)) {
      this._drawMountains(ctx, w, horizon + 6, 'rgba(22, 8, 6, 0.78)', id === 'volcanictop' ? 115 : 85, 6);
      if (id === 'infernal') {
        // Blood eclipse in sky
        ctx.fillStyle = 'rgba(255, 62, 62, 0.35)';
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.2, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#140404';
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.2, 34, 0, Math.PI * 2);
        ctx.fill();
      }
      // Animated horizon flames / lava glow
      for (let i = 0; i < 36; i++) {
        const fx = (w * i) / 35;
        const fh = (id === 'burning' ? 38 : 22) + Math.sin(t * 5.5 + i * 1.3) * 14 + hash01(i) * 18;
        const fg = ctx.createLinearGradient(fx, horizon - fh, fx, horizon + 14);
        fg.addColorStop(0, 'rgba(255, 210, 70, 0)');
        fg.addColorStop(0.45, 'rgba(255, 120, 32, 0.48)');
        fg.addColorStop(1, 'rgba(190, 28, 12, 0.7)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.ellipse(fx, horizon + 4, 22, fh, 0, Math.PI, 0);
        ctx.fill();
      }
      // Glowing magma fissures in the ground
      ctx.strokeStyle = 'rgba(255, 118, 38, 0.48)';
      ctx.lineWidth = 2.2;
      for (let k = 0; k < 5; k++) {
        let mx = w * (0.15 + k * 0.18);
        let my = horizon + 18;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        for (let s = 0; s < 4; s++) {
          mx += (hash01(k * 9 + s) - 0.5) * 56;
          my += (h - horizon) * 0.22;
          ctx.lineTo(mx, my);
        }
        ctx.stroke();
      }
      return;
    }

    // 6. WATER SURFACE / UNDERWATER / MURKWATER SURFACE / SWAMP / CORROSIVE / WASTELAND
    if (['watersurface', 'underwater', 'murkwatersurface', 'swamp', 'corrosive', 'corrosivemist', 'wasteland'].includes(id)) {
      if (id === 'underwater') {
        // Deep-sea caustic sun rays from above + swaying kelp
        for (let i = 0; i < 5; i++) {
          const rx = w * (0.12 + i * 0.19) + Math.sin(t * 0.6 + i) * 18;
          const rg = ctx.createLinearGradient(rx, 0, rx + 40, h);
          rg.addColorStop(0, 'rgba(110, 220, 255, 0.22)');
          rg.addColorStop(1, 'rgba(110, 220, 255, 0)');
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.moveTo(rx - 18, 0);
          ctx.lineTo(rx + 26, 0);
          ctx.lineTo(rx + 85, h);
          ctx.lineTo(rx - 5, h);
          ctx.closePath();
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(26, 120, 108, 0.55)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        for (let k = 0; k < 10; k++) {
          const kx = w * (0.05 + k * 0.1);
          const kh = 70 + hash01(k) * 75;
          ctx.beginPath();
          ctx.moveTo(kx, h);
          ctx.quadraticCurveTo(kx + Math.sin(t * 1.8 + k) * 18, h - kh * 0.5, kx + Math.sin(t * 1.8 + k + 1) * 22, h - kh);
          ctx.stroke();
        }
        return;
      }

      const waveColor = id === 'watersurface'
        ? 'rgba(120, 214, 255, 0.24)'
        : id === 'swamp'
          ? 'rgba(122, 184, 92, 0.22)'
          : 'rgba(168, 230, 58, 0.28)';
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 1.8;
      for (let r = 0; r < 9; r++) {
        const wy = horizon + 16 + ((r + 0.5) * (h - horizon - 20)) / 9;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 24) {
          const y = wy + Math.sin(x * 0.025 + t * 2.1 + r * 1.4) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      if (id === 'swamp' || id === 'wasteland' || id === 'corrosive') {
        this._drawMountains(ctx, w, horizon + 8, 'rgba(16, 22, 16, 0.6)', 54, 9);
      }
      return;
    }

    // 7. ICY / SNOWY MOUNTAIN / MOUNTAIN / ROCKY / CAVE / CORRUPTED CAVE / DEEP EARTH / DESERT / ASHEN BEACH
    if (['icy', 'snowymountain', 'mountain', 'rocky', 'cave', 'corruptedcave', 'deepearth', 'desert', 'ashenbeach'].includes(id)) {
      if (id === 'cave' || id === 'corruptedcave' || id === 'deepearth') {
        this._drawCavernArch(ctx, w, h, 'rgba(12, 10, 10, 0.76)');
        if (id === 'corruptedcave') {
          this._drawCrystalCluster(ctx, w * 0.12, horizon + 24, 0.9, '#a8d838', '#2d3b14');
          this._drawCrystalCluster(ctx, w * 0.88, horizon + 28, 0.95, '#a8d838', '#2d3b14');
        }
      } else if (id === 'desert' || id === 'ashenbeach') {
        // Sun/moon + rolling sand dunes
        ctx.fillStyle = id === 'desert' ? 'rgba(255, 206, 105, 0.38)' : 'rgba(215, 205, 190, 0.22)';
        ctx.beginPath();
        ctx.arc(w * 0.76, h * 0.22, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = id === 'desert' ? 'rgba(138, 98, 42, 0.55)' : 'rgba(72, 68, 64, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, horizon + 14);
        ctx.quadraticCurveTo(w * 0.28, horizon - 34, w * 0.56, horizon + 6);
        ctx.quadraticCurveTo(w * 0.8, horizon - 28, w, horizon + 10);
        ctx.lineTo(w, horizon + 30);
        ctx.lineTo(0, horizon + 30);
        ctx.closePath();
        ctx.fill();
      } else {
        this._drawMountains(ctx, w, horizon + 10, 'rgba(20, 32, 46, 0.65)', 105, 7, id === 'snowymountain' || id === 'icy');
      }

      if (id === 'icy') {
        // Specular glacier ice sheen streaks + cracks
        ctx.fillStyle = 'rgba(190, 240, 255, 0.11)';
        for (let i = 0; i < 5; i++) {
          const sx = w * (0.1 + i * 0.22);
          ctx.beginPath();
          ctx.moveTo(sx, horizon);
          ctx.lineTo(sx + 48, horizon);
          ctx.lineTo(sx - 55, h);
          ctx.lineTo(sx - 105, h);
          ctx.closePath();
          ctx.fill();
        }
      }
      return;
    }

    // 8. RAINBOW / MISTY / FAIRY TALE / HOLY / MIRROR
    if (['rainbow', 'misty', 'fairytale', 'holy', 'mirror'].includes(id)) {
      if (id === 'rainbow') {
        const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
        colors.forEach((c, idx) => {
          ctx.strokeStyle = hexToRgba(c, 0.28);
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(w * 0.5, horizon + 80, Math.min(w, h * 1.4) * 0.58 - idx * 11, Math.PI * 1.08, Math.PI * 1.92);
          ctx.stroke();
        });
      } else if (id === 'mirror') {
        // Tall reflective mirror panels along the back wall
        for (let i = 0; i < 7; i++) {
          const mx = w * (0.08 + i * 0.135);
          const mw = w * 0.1;
          const mg = ctx.createLinearGradient(mx, horizon - 110, mx + mw, horizon + 10);
          mg.addColorStop(0, 'rgba(190, 240, 255, 0.28)');
          mg.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
          mg.addColorStop(1, 'rgba(130, 210, 245, 0.24)');
          ctx.fillStyle = mg;
          ctx.fillRect(mx, horizon - 105, mw, 112);
          ctx.strokeStyle = 'rgba(200, 245, 255, 0.42)';
          ctx.lineWidth = 1.4;
          ctx.strokeRect(mx, horizon - 105, mw, 112);
        }
      } else if (id === 'holy') {
        // Cathedral rose halo & golden god-rays
        for (let i = -3; i <= 3; i++) {
          const rg = ctx.createLinearGradient(w * 0.5, 0, w * 0.5 + i * 110, h);
          rg.addColorStop(0, 'rgba(255, 223, 128, 0.22)');
          rg.addColorStop(1, 'rgba(255, 223, 128, 0)');
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.moveTo(w * 0.5 - 14, 0);
          ctx.lineTo(w * 0.5 + 14, 0);
          ctx.lineTo(w * 0.5 + i * 130 + 48, h);
          ctx.lineTo(w * 0.5 + i * 130 - 48, h);
          ctx.closePath();
          ctx.fill();
        }
      } else if (id === 'fairytale') {
        // Distant storybook castle spires
        const cx = w * 0.5;
        ctx.fillStyle = 'rgba(34, 20, 36, 0.65)';
        ctx.fillRect(cx - 48, horizon - 58, 96, 64);
        for (const dx of [-42, 0, 42]) {
          const th = dx === 0 ? 96 : 74;
          ctx.fillRect(cx + dx - 11, horizon - th, 22, th + 6);
          ctx.beginPath();
          ctx.moveTo(cx + dx - 15, horizon - th);
          ctx.lineTo(cx + dx, horizon - th - 26);
          ctx.lineTo(cx + dx + 15, horizon - th);
          ctx.closePath();
          ctx.fill();
        }
      }
      return;
    }

    // 9. STARLIGHT / NEW WORLD / DIMENSIONAL / FROZEN DIMENSIONAL / DARKNESS 1..3 / HAUNTED / PSYCHIC / INVERSE
    if (['starlight', 'newworld', 'dimensional', 'frozendimensional', 'haunted', 'psychic', 'inverse'].includes(id) || id.startsWith('darkness')) {
      if (id === 'starlight' || id === 'newworld') {
        // Nebula ribbon + constellation lines
        const neb = ctx.createLinearGradient(0, h * 0.08, w, h * 0.42);
        neb.addColorStop(0, 'rgba(90, 120, 255, 0)');
        neb.addColorStop(0.5, hexToRgba(accent, 0.22));
        neb.addColorStop(1, 'rgba(220, 130, 255, 0)');
        ctx.fillStyle = neb;
        ctx.fillRect(0, 0, w, horizon);

        ctx.strokeStyle = 'rgba(255, 232, 165, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const sx = w * (0.2 + i * 0.12);
          const sy = h * (0.14 + (i % 2) * 0.11);
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
          ctx.fillStyle = '#fff5d6';
          ctx.fillRect(sx - 2, sy - 2, 4, 4);
        }
        ctx.stroke();
      } else if (id === 'haunted') {
        // Full moon + crooked graveyard silhouettes
        ctx.fillStyle = 'rgba(225, 240, 255, 0.26)';
        ctx.beginPath();
        ctx.arc(w * 0.78, h * 0.2, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(14, 12, 22, 0.78)';
        for (let i = 0; i < 8; i++) {
          const tx = w * (0.08 + i * 0.12);
          ctx.save();
          ctx.translate(tx, horizon + 8);
          ctx.rotate((hash01(i) - 0.5) * 0.22);
          ctx.fillRect(-9, -26, 18, 28);
          ctx.beginPath();
          ctx.arc(0, -26, 9, Math.PI, 0);
          ctx.fill();
          ctx.restore();
        }
      } else {
        // Rotating arcane / dimensional rings
        ctx.save();
        ctx.translate(w * 0.5, horizon - 10);
        for (let r = 1; r <= 3; r++) {
          ctx.strokeStyle = hexToRgba(accent, 0.28 - r * 0.06);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, r * 42 + Math.sin(t * 2 + r) * 4, t * (r % 2 ? 0.6 : -0.6), t * (r % 2 ? 0.6 : -0.6) + Math.PI * 1.45);
          ctx.stroke();
        }
        ctx.restore();
      }
      return;
    }

    // 10. GLITCH FIELD
    if (id === 'glitch') {
      this._drawPerspectiveGrid(ctx, w, h, horizon, 'rgba(53, 224, 161, 0.34)', 14, 8);
      // CRT horizontal scanlines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1.5);
      return;
    }

    // 11. BIG TOP / CONCERT 1..4 / DANCE FLOOR / COLOSSEUM / CROWD / CITY / BACK ALLEY / SKY / CLOUD
    if (id === 'bigtop') {
      // Striped circus tent roof + spotlights
      const stripes = 14;
      for (let i = 0; i < stripes; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(190, 38, 38, 0.34)' : 'rgba(245, 190, 66, 0.22)';
        ctx.beginPath();
        ctx.moveTo(w * 0.5, -20);
        ctx.lineTo((w * i) / stripes, horizon);
        ctx.lineTo((w * (i + 1)) / stripes, horizon);
        ctx.closePath();
        ctx.fill();
      }
      return;
    }

    if (id.startsWith('concert') || id === 'dancefloor') {
      const stage = id.startsWith('concert') ? Number(id.slice(-1)) || 1 : 3;
      // Animated equalizer bars along horizon
      const bars = 28;
      const bw = (w * 0.76) / bars;
      for (let i = 0; i < bars; i++) {
        const amp = (0.25 + 0.75 * Math.abs(Math.sin(t * (3 + stage) + i * 0.55))) * (22 + stage * 18);
        ctx.fillStyle = `hsla(${(i * 14 + t * 60) % 360}, 82%, 62%, 0.42)`;
        ctx.fillRect(w * 0.12 + i * bw, horizon - amp, bw * 0.72, amp);
      }
      if (id === 'dancefloor') {
        this._drawPerspectiveGrid(ctx, w, h, horizon, 'rgba(46, 196, 182, 0.32)', 10, 6);
      }
      return;
    }

    if (id === 'city' || id === 'backalley') {
      // City skyline with lit windows
      for (let i = 0; i < 14; i++) {
        const bx = (w * i) / 14;
        const bw = w / 14 - 4;
        const bh = 42 + hash01(i * 4.1) * 86;
        ctx.fillStyle = 'rgba(14, 18, 26, 0.82)';
        ctx.fillRect(bx, horizon - bh, bw, bh + 6);
        ctx.fillStyle = 'rgba(246, 195, 88, 0.42)';
        for (let wy = horizon - bh + 8; wy < horizon - 6; wy += 12) {
          for (let wx = bx + 6; wx < bx + bw - 8; wx += 10) {
            if (hash01(wx + wy) > 0.38) ctx.fillRect(wx, wy, 5, 6);
          }
        }
      }
      return;
    }

    if (id === 'sky' || id === 'cloud') {
      // Billowy cloud banks across the horizon & floor
      for (let i = 0; i < 11; i++) {
        const cx = ((w * i) / 10 + t * 12) % (w + 120) - 60;
        const cy = horizon + (i % 3) * 26;
        ctx.fillStyle = 'rgba(235, 246, 255, 0.22)';
        ctx.beginPath();
        ctx.arc(cx, cy, 42, 0, Math.PI * 2);
        ctx.arc(cx + 32, cy + 6, 32, 0, Math.PI * 2);
        ctx.arc(cx - 32, cy + 8, 30, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    if (id === 'colosseum' || id === 'crowd') {
      // Stadium / Colosseum arches along back wall
      ctx.fillStyle = 'rgba(28, 20, 14, 0.72)';
      ctx.fillRect(0, horizon - 68, w, 72);
      const arches = 12;
      for (let i = 0; i < arches; i++) {
        const ax = (w * (i + 0.5)) / arches;
        ctx.fillStyle = 'rgba(10, 8, 6, 0.65)';
        ctx.beginPath();
        ctx.arc(ax, horizon - 20, 14, Math.PI, 0);
        ctx.lineTo(ax + 14, horizon + 2);
        ctx.lineTo(ax - 14, horizon + 2);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

// ============================================================================
// 2. FOREGROUND FX + DIRECTIONAL MOVE ANIMATIONS (#arena-fx)
// ============================================================================
export class ArenaFX {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mode = '';
    this.accent = '#f5a623';
    this.weather = '';
    this.particles = [];
    this.bursts = [];
    this.moveAnims = [];
    this.popups = [];
    this.running = false;
    this.raf = 0;
    this.lastT = 0;
    this.w = 0;
    this.h = 0;

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.resize();
    this.lastT = performance.now();
    const tick = now => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.lastT) / 1000);
      this.lastT = now;
      this.draw(dt, now / 1000);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, Math.floor(rect.width));
    this.h = Math.max(1, Math.floor(rect.height));
    this.canvas.width = Math.floor(this.w * dpr);
    this.canvas.height = Math.floor(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.seedParticles();
  }

  setField(fxMode, accentColor) {
    const next = fxMode || '';
    this.accent = accentColor || '#f5a623';
    if (this.mode !== next) {
      this.mode = next;
      this.seedParticles();
    }
  }

  setWeather(weatherId) {
    const id = String(weatherId || '').toLowerCase().replace(/[^a-z]/g, '');
    this.weather = id === 'none' ? '' : id;
  }

  burstAt(x, y, color = this.accent, count = 20, speed = 150) {
    if (!this.w || !this.h) this.resize();
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const spd = speed * (0.45 + Math.random() * 0.85);
      this.bursts.push({
        x: x + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 18,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: 2.2 + Math.random() * 3.8,
        life: 0.42 + Math.random() * 0.28,
        maxLife: 0.7,
        color,
      });
    }
  }

  burst(color = this.accent, count = 22) {
    if (!this.w || !this.h) this.resize();
    this.burstAt(this.w * 0.5, this.h * 0.48, color, count, 165);
  }

  popup(x, y, text, color = '#ffffff') {
    if (!text) return;
    this.popups.push({
      x,
      y,
      text,
      color,
      age: 0,
      dur: 0.95,
    });
  }

  /**
   * Launch an animated move effect from `from` ({x, y}) toward `to` ({x, y}).
   */
  playMove({from, to, style = 'strike', type = 'Normal', miss = false, duration = 0.44}) {
    if (!this.w || !this.h) this.resize();
    const color = TYPE_COLORS[type] || this.accent || '#f5a623';
    const fx = from || {x: this.w * 0.22, y: this.h * 0.72};
    const tx = to || {x: this.w * 0.78, y: this.h * 0.32};
    const dur = Math.max(0.14, duration);
    this.moveAnims.push({
      from: fx,
      to: tx,
      style,
      color,
      miss: !!miss,
      age: 0,
      dur,
      impacted: false,
      seed: Math.random() * 100,
    });
  }

  seedParticles() {
    this.particles = [];
    if (!this.w || !this.h || !this.mode) return;
    const counts = {
      sparks: 26, spores: 28, mist: 12, rings: 8, crystals: 20, motes: 24,
      confetti: 28, embers: 32, bubbles: 22, prism: 18, acid: 20, sand: 38,
      snow: 36, dust: 24, leaves: 20, ripples: 8, glitch: 12, wind: 18,
      stars: 38, wisp: 16,
    };
    const n = counts[this.mode] || 18;
    for (let i = 0; i < n; i++) {
      this.particles.push(this.makeParticle(true));
    }
  }

  makeParticle(randomPos = false) {
    const w = this.w || 800;
    const h = this.h || 440;
    const p = {
      x: Math.random() * w,
      y: randomPos ? Math.random() * h : h + 10,
      r: 2 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 18,
      vy: -14 - Math.random() * 24,
      alpha: 0.25 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      hue: Math.floor(Math.random() * 360),
    };

    switch (this.mode) {
    case 'snow':
      p.y = randomPos ? Math.random() * h : -10;
      p.vx = 10 + Math.random() * 22;
      p.vy = 28 + Math.random() * 38;
      p.r = 1.8 + Math.random() * 2.8;
      break;
    case 'sand':
      p.x = randomPos ? Math.random() * w : -15;
      p.y = Math.random() * h;
      p.vx = 140 + Math.random() * 120;
      p.vy = 12 + (Math.random() - 0.5) * 24;
      p.r = 1.2 + Math.random() * 1.8;
      break;
    case 'wind':
      p.x = randomPos ? Math.random() * w : -40;
      p.y = Math.random() * h;
      p.vx = 160 + Math.random() * 130;
      p.vy = -8 + Math.random() * 16;
      p.len = 28 + Math.random() * 45;
      break;
    case 'leaves':
      p.x = randomPos ? Math.random() * w : -15;
      p.y = randomPos ? Math.random() * h : -10;
      p.vx = 35 + Math.random() * 40;
      p.vy = 22 + Math.random() * 28;
      p.r = 3.5 + Math.random() * 3;
      break;
    case 'confetti':
      p.y = randomPos ? Math.random() * h : -10;
      p.vx = (Math.random() - 0.5) * 32;
      p.vy = 26 + Math.random() * 34;
      p.r = 3 + Math.random() * 3;
      break;
    case 'mist':
      p.y = h * (0.45 + Math.random() * 0.5);
      p.vx = 8 + Math.random() * 14;
      p.vy = 0;
      p.r = 48 + Math.random() * 65;
      p.alpha = 0.05 + Math.random() * 0.07;
      break;
    case 'rings':
    case 'ripples':
      p.x = w * (0.15 + Math.random() * 0.7);
      p.y = h * (0.55 + Math.random() * 0.35);
      p.r = randomPos ? Math.random() * 55 : 4;
      p.maxR = 45 + Math.random() * 45;
      p.vx = 0;
      p.vy = 0;
      break;
    case 'stars':
      p.y = Math.random() * h * 0.72;
      p.vx = 0;
      p.vy = 0;
      p.r = 1 + Math.random() * 2.2;
      break;
    case 'glitch':
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      p.w = 24 + Math.random() * 90;
      p.h = 2 + Math.random() * 5;
      p.life = 0.1 + Math.random() * 0.35;
      break;
    case 'sparks':
      p.vy = -25 - Math.random() * 55;
      p.vx = (Math.random() - 0.5) * 50;
      p.r = 1.5 + Math.random() * 2.2;
      break;
    case 'embers':
      p.vy = -28 - Math.random() * 46;
      p.vx = (Math.random() - 0.5) * 28;
      p.r = 1.8 + Math.random() * 2.8;
      break;
    case 'bubbles':
    case 'acid':
      p.y = randomPos ? Math.random() * h : h + 8;
      p.vy = -16 - Math.random() * 26;
      p.r = 3 + Math.random() * 5.5;
      break;
    default:
      break;
    }
    return p;
  }

  _drawMoveAnim(ctx, m, t) {
    const p = Math.min(1, m.age / m.dur);
    const {from, to, color, style} = m;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const ang = Math.atan2(dy, dx);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Self / Aura effects
    if (style === 'shield') {
      const r = 44 + Math.sin(p * Math.PI) * 14;
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.85;
      ctx.strokeStyle = '#74c0fc';
      ctx.fillStyle = 'rgba(116, 192, 252, 0.18)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI * 2 * k) / 6 - Math.PI / 2;
        const px = from.x + Math.cos(a) * r;
        const py = from.y + Math.sin(a) * r * 0.88;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (style === 'boost' || style === 'heal') {
      const isHeal = style === 'heal';
      const c = isHeal ? '#51cf66' : '#fcc419';
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.9;
      for (let i = 0; i < 6; i++) {
        const ox = from.x + Math.cos(i * 1.05 + p * 4) * 34;
        const oy = from.y + 26 - p * 68 - (i % 3) * 10;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(ox, oy, isHeal ? 4.5 : 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(from.x, from.y + 18 - p * 36, 42 * (1 - p * 0.25), 14, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (style === 'beam') {
      const reach = Math.min(1, p * 2.2);
      const fade = p > 0.65 ? (1 - p) / 0.35 : 1;
      const ex = from.x + dx * reach;
      const ey = from.y + dy * reach;

      ctx.globalAlpha = fade;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = color;
      ctx.lineWidth = 18 * fade;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6 * fade;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(from.x, from.y, 12 * fade, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'lightning') {
      const fade = Math.sin(p * Math.PI);
      ctx.globalAlpha = fade;
      ctx.shadowColor = '#ffd43b';
      ctx.shadowBlur = 16;
      for (let bolt = 0; bolt < 2; bolt++) {
        ctx.strokeStyle = bolt === 0 ? color : '#ffffff';
        ctx.lineWidth = bolt === 0 ? 6 : 2.4;
        ctx.beginPath();
        const startX = Math.hypot(dx, dy) < 25 ? to.x + (Math.random() - 0.5) * 24 : from.x;
        const startY = Math.hypot(dx, dy) < 25 ? 0 : from.y;
        ctx.moveTo(startX, startY);
        const segs = 8;
        for (let s = 1; s < segs; s++) {
          const f = s / segs;
          const jx = (Math.random() - 0.5) * 32;
          const jy = (Math.random() - 0.5) * 24;
          ctx.lineTo(startX + (to.x - startX) * f + jx, startY + (to.y - startY) * f + jy);
        }
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    } else if (style === 'slash') {
      const sp = Math.min(1, Math.max(0, (p - 0.15) / 0.7));
      if (sp > 0) {
        ctx.globalAlpha = Math.sin(sp * Math.PI);
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
        for (const tilt of [-0.68, 0.68]) {
          ctx.save();
          ctx.translate(to.x, to.y);
          ctx.rotate(tilt);
          ctx.strokeStyle = color;
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(-48, 0);
          ctx.quadraticCurveTo(0, -14, -48 + 96 * sp, 0);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
        }
      }
    } else if (style === 'bite') {
      const close = Math.sin(p * Math.PI);
      const gap = 36 * (1 - close * 0.82);
      ctx.globalAlpha = Math.min(1, close * 1.3);
      ctx.fillStyle = color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      for (const dir of [-1, 1]) {
        for (let f = -2; f <= 2; f++) {
          const fx = to.x + f * 12;
          const fy = to.y + dir * (gap + 14);
          ctx.beginPath();
          ctx.moveTo(fx - 6, fy);
          ctx.lineTo(fx + 6, fy);
          ctx.lineTo(fx, fy - dir * 18);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    } else if (style === 'punch') {
      const hitP = Math.sin(p * Math.PI);
      ctx.globalAlpha = hitP;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(to.x, to.y, 14 + p * 48, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8 + m.seed;
        ctx.strokeStyle = i % 2 === 0 ? '#ffffff' : color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(to.x + Math.cos(a) * (10 + p * 18), to.y + Math.sin(a) * (10 + p * 18));
        ctx.lineTo(to.x + Math.cos(a) * (26 + p * 44), to.y + Math.sin(a) * (26 + p * 44));
        ctx.stroke();
      }
    } else if (style === 'barrage' || style === 'hazard') {
      const count = style === 'hazard' ? 3 : 4;
      for (let i = 0; i < count; i++) {
        const lp = Math.min(1, Math.max(0, (p * 1.35) - i * 0.11));
        if (lp <= 0 || lp >= 1) continue;
        const arc = Math.sin(lp * Math.PI) * (style === 'hazard' ? -45 : (i - 1.5) * 16);
        const cx = from.x + dx * lp;
        const cy = from.y + dy * lp + arc;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, style === 'hazard' ? 6 : 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (style === 'meteor') {
      for (let i = 0; i < 3; i++) {
        const lp = Math.min(1, Math.max(0, p * 1.25 - i * 0.1));
        if (lp <= 0) continue;
        const sx = to.x - 110 + (i - 1) * 28;
        const sy = -30;
        const cx = sx + (to.x + (i - 1) * 18 - sx) * lp;
        const cy = sy + (to.y - sy) * lp;
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = hexToRgba(color, 0.55);
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(cx - 22, cy - 28);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (style === 'wave' || style === 'storm') {
      const cx = from.x + dx * p;
      const cy = from.y + dy * p;
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.9;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.strokeStyle = color;
      for (let k = -1; k <= 1; k++) {
        ctx.lineWidth = k === 0 ? 7 : 4;
        ctx.beginPath();
        if (style === 'storm') {
          ctx.ellipse(cx + k * 14, cy - 18 + k * 12, 28 + Math.abs(k) * 12, 11, t * 4, 0, Math.PI * 2);
        } else {
          ctx.arc(cx, cy, 36 + k * 12, ang - 0.85, ang + 0.85);
        }
        ctx.stroke();
      }
    } else if (style === 'quake') {
      ctx.globalAlpha = Math.sin(p * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      const steps = 6;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y + 24);
      for (let s = 1; s <= steps; s++) {
        const f = (s / steps) * p;
        const qx = from.x + dx * f + (s % 2 === 0 ? 14 : -14);
        const qy = from.y + 24 + dy * f;
        ctx.lineTo(qx, qy);
      }
      ctx.stroke();
      // Erupting rock spikes at target
      if (p > 0.35) {
        const sp = Math.sin(((p - 0.35) / 0.65) * Math.PI);
        ctx.fillStyle = color;
        for (const ox of [-22, 0, 22]) {
          const sh = (ox === 0 ? 46 : 32) * sp;
          ctx.beginPath();
          ctx.moveTo(to.x + ox - 10, to.y + 24);
          ctx.lineTo(to.x + ox, to.y + 24 - sh);
          ctx.lineTo(to.x + ox + 10, to.y + 24);
          ctx.closePath();
          ctx.fill();
        }
      }
    } else if (style === 'sound') {
      for (let i = 0; i < 3; i++) {
        const rp = Math.min(1, Math.max(0, p * 1.3 - i * 0.14));
        if (rp <= 0) continue;
        const cx = from.x + dx * rp;
        const cy = from.y + dy * rp;
        ctx.globalAlpha = (1 - rp * 0.65) * 0.9;
        ctx.strokeStyle = i % 2 === 0 ? color : '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 14 + rp * 28, 22 + rp * 34, ang, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (style === 'drain') {
      if (p < 0.45) {
        const hp = p / 0.45;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(from.x + dx * hp, from.y + dy * hp, 11, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const dp = (p - 0.45) / 0.55;
        for (let i = 0; i < 5; i++) {
          const lp = Math.min(1, Math.max(0, dp * 1.35 - i * 0.08));
          const ox = to.x - dx * lp + Math.sin(lp * Math.PI * 2 + i) * 14;
          const oy = to.y - dy * lp - Math.sin(lp * Math.PI) * 22;
          ctx.fillStyle = i % 2 === 0 ? '#69db7c' : color;
          ctx.beginPath();
          ctx.arc(ox, oy, 5.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (style === 'explosion') {
      const r = p * 135;
      ctx.globalAlpha = 1 - p;
      const g = ctx.createRadialGradient(from.x, from.y, 4, from.x, from.y, Math.max(8, r));
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.4, color);
      g.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(from.x, from.y, r, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'status') {
      const targetPt = Math.hypot(dx, dy) < 20 ? from : to;
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.9;
      for (let i = 0; i < 5; i++) {
        const a = t * 4 + (Math.PI * 2 * i) / 5;
        const rx = targetPt.x + Math.cos(a) * (34 * (1 - p * 0.35));
        const ry = targetPt.y + Math.sin(a) * 18 - p * 14;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(rx, ry, 6.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // 'projectile' or 'strike'
      const cx = from.x + dx * p;
      const cy = from.y + dy * p - (style === 'projectile' ? Math.sin(p * Math.PI) * 24 : 0);
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      // Comet tail
      const tailGrad = ctx.createLinearGradient(cx - Math.cos(ang) * 48, cy - Math.sin(ang) * 48, cx, cy);
      tailGrad.addColorStop(0, hexToRgba(color, 0));
      tailGrad.addColorStop(1, hexToRgba(color, 0.85));
      ctx.strokeStyle = tailGrad;
      ctx.lineWidth = style === 'projectile' ? 14 : 10;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(ang) * 44, cy - Math.sin(ang) * 44);
      ctx.lineTo(cx, cy);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, style === 'projectile' ? 12 : 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, style === 'projectile' ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Trigger target impact burst near completion for offensive moves
    if (!m.impacted && p >= 0.78 && !['shield', 'boost', 'heal'].includes(style)) {
      m.impacted = true;
      if (m.miss) {
        this.popup(to.x, to.y - 24, 'MISS', '#ced4da');
      } else {
        this.burstAt(to.x, to.y, color, 20, 175);
      }
    }

    ctx.restore();
  }

  draw(dt, t) {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);

    // 1. Field Ambient Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.save();

      if (this.mode === 'rings' || this.mode === 'ripples') {
        p.r += dt * 22;
        if (p.r > p.maxR) {
          this.particles[i] = this.makeParticle(false);
          ctx.restore();
          continue;
        }
        const ratio = 1 - p.r / p.maxR;
        ctx.strokeStyle = this.accent;
        ctx.globalAlpha = ratio * 0.35;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r, p.r * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (this.mode === 'stars') {
        const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 2.6 + p.phase));
        ctx.fillStyle = '#f8f6ee';
        ctx.globalAlpha = tw * 0.75;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.mode === 'glitch') {
        p.life -= dt;
        if (p.life <= 0) {
          this.particles[i] = this.makeParticle(true);
          ctx.restore();
          continue;
        }
        ctx.fillStyle = i % 2 === 0 ? this.accent : '#38d9a9';
        ctx.globalAlpha = 0.24;
        ctx.fillRect(p.x, p.y, p.w, p.h);
      } else if (this.mode === 'wind') {
        p.x += p.vx * dt;
        p.y += p.vy * dt + Math.sin(t * 2 + p.phase) * 0.3;
        if (p.x > w + 50) this.particles[i] = this.makeParticle(false);
        ctx.strokeStyle = 'rgba(240, 246, 252, 0.22)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.len, p.y + 3);
        ctx.stroke();
      } else if (this.mode === 'mist') {
        p.x += p.vx * dt;
        if (p.x - p.r > w) p.x = -p.r;
        const g = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, p.r);
        g.addColorStop(0, 'rgba(225, 236, 245, 0.14)');
        g.addColorStop(1, 'rgba(225, 236, 245, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        p.x += (p.vx + Math.sin(t * 1.8 + p.phase) * 10) * dt;
        p.y += p.vy * dt;

        if (p.y < -20 || p.y > h + 20 || p.x < -30 || p.x > w + 30) {
          this.particles[i] = this.makeParticle(false);
          ctx.restore();
          continue;
        }

        ctx.globalAlpha = p.alpha;
        if (this.mode === 'bubbles' || this.mode === 'acid') {
          ctx.strokeStyle = this.mode === 'acid' ? '#8ce95a' : '#74c0fc';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.stroke();
        } else if (this.mode === 'crystals' || this.mode === 'prism') {
          ctx.fillStyle = this.mode === 'prism' ? `hsl(${(p.hue + t * 40) % 360}, 80%, 72%)` : this.accent;
          ctx.translate(p.x, p.y);
          ctx.rotate(t + p.phase);
          ctx.beginPath();
          ctx.moveTo(0, -p.r * 1.4);
          ctx.lineTo(p.r, 0);
          ctx.lineTo(0, p.r * 1.4);
          ctx.lineTo(-p.r, 0);
          ctx.closePath();
          ctx.fill();
        } else if (this.mode === 'confetti') {
          const palette = ['#f5a623', '#26c48e', '#ea5b3d', '#4dabf7'];
          ctx.fillStyle = palette[i % palette.length];
          ctx.translate(p.x, p.y);
          ctx.rotate(t * 2.5 + p.phase);
          ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
        } else if (this.mode === 'leaves') {
          ctx.fillStyle = i % 2 === 0 ? '#74b816' : '#f59f00';
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.sin(t * 2 + p.phase) * 0.8);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r * 1.2, p.r * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const colors = {
            embers: '#ff7a3d', sparks: '#ffd43b', spores: '#8ce99a',
            snow: '#f1f5f9', sand: '#e3b873', wisp: '#74c0fc',
          };
          ctx.fillStyle = colors[this.mode] || this.accent;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 2. Active Weather Overlay
    if (this.weather) {
      ctx.save();
      if (this.weather.includes('rain') || this.weather.includes('primordial')) {
        ctx.strokeStyle = 'rgba(130, 195, 255, 0.36)';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 38; i++) {
          const rx = ((i * 97 + t * 290) % (w + 80)) - 40;
          const ry = ((i * 61 + t * 560) % (h + 60)) - 30;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 9, ry + 20);
          ctx.stroke();
        }
      } else if (this.weather.includes('sun') || this.weather.includes('desolate')) {
        const g = ctx.createRadialGradient(w * 0.82, -20, 10, w * 0.82, -20, w * 0.65);
        g.addColorStop(0, 'rgba(255, 196, 77, 0.24)');
        g.addColorStop(1, 'rgba(255, 196, 77, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      } else if (this.weather.includes('sand')) {
        ctx.fillStyle = 'rgba(218, 175, 105, 0.1)';
        ctx.fillRect(0, 0, w, h);
      } else if (this.weather.includes('hail') || this.weather.includes('snow')) {
        ctx.fillStyle = 'rgba(235, 246, 255, 0.55)';
        for (let i = 0; i < 28; i++) {
          const sx = (i * 83 + t * 45 + Math.sin(t + i) * 14) % w;
          const sy = (i * 53 + t * 115) % h;
          ctx.beginPath();
          ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 3. Directional Move Animations
    for (let i = this.moveAnims.length - 1; i >= 0; i--) {
      const m = this.moveAnims[i];
      m.age += dt;
      if (m.age >= m.dur) {
        this.moveAnims.splice(i, 1);
        continue;
      }
      this._drawMoveAnim(ctx, m, t);
    }

    // 4. Impact / Transformation Bursts
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.life -= dt;
      if (b.life <= 0) {
        this.bursts.splice(i, 1);
        continue;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vx *= 0.93;
      b.vy *= 0.93;
      ctx.save();
      ctx.globalAlpha = Math.max(0, b.life / b.maxLife);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Floating Combat Text Popups (-42%, CRIT!, SUPER EFFECTIVE!)
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.age += dt;
      if (pop.age >= pop.dur) {
        this.popups.splice(i, 1);
        continue;
      }
      const p = pop.age / pop.dur;
      ctx.save();
      ctx.globalAlpha = p < 0.7 ? 1 : (1 - p) / 0.3;
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillText(pop.text, pop.x + 1, pop.y - p * 30 + 1);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y - p * 30);
      ctx.restore();
    }
  }
}
