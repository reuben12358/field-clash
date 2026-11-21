/**
 * Atmospheric Battlefield Canvas Renderer (#arena-fx)
 * Renders live weather & Reborn/Rejuvenation/Desolation field-specific visual effects
 * strictly inside the battle arena stage.
 */
export class ArenaFX {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mode = '';
    this.accent = '#f5a623';
    this.weather = '';
    this.particles = [];
    this.bursts = [];
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

  burst(color = this.accent, count = 22) {
    if (!this.w || !this.h) this.resize();
    const cx = this.w * 0.5;
    const cy = this.h * 0.48;
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
      const spd = 70 + Math.random() * 170;
      this.bursts.push({
        x: cx + (Math.random() - 0.5) * 80,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: 2 + Math.random() * 3.5,
        life: 0.55 + Math.random() * 0.35,
        maxLife: 0.9,
        color,
      });
    }
  }

  seedParticles() {
    this.particles = [];
    if (!this.w || !this.h || !this.mode) return;
    const counts = {
      sparks: 28,
      spores: 30,
      mist: 14,
      rings: 8,
      crystals: 22,
      motes: 26,
      confetti: 30,
      embers: 34,
      bubbles: 24,
      prism: 20,
      acid: 22,
      sand: 42,
      snow: 40,
      dust: 26,
      leaves: 22,
      ripples: 9,
      glitch: 14,
      wind: 20,
      stars: 44,
      wisp: 18,
    };
    const n = counts[this.mode] || 20;
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
            embers: '#ff7a3d',
            sparks: '#ffd43b',
            spores: '#8ce99a',
            snow: '#f1f5f9',
            sand: '#e3b873',
            wisp: '#74c0fc',
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

    // 3. Impact / Transformation Bursts
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.life -= dt;
      if (b.life <= 0) {
        this.bursts.splice(i, 1);
        continue;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vx *= 0.94;
      b.vy *= 0.94;
      ctx.save();
      ctx.globalAlpha = Math.max(0, b.life / b.maxLife);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
