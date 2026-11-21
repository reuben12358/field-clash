/**
 * Lightweight zero-asset Web Audio battle SFX synthesizer.
 * Respects browser autoplay rules and persists mute state in localStorage.
 */
class BattleSFX {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('fc_sfx') !== '0';
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('fc_sfx', this.enabled ? '1' : '0');
    if (this.enabled) this.play('click');
    return this.enabled;
  }

  _ensure() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  _tone(freqStart, freqEnd, dur, type = 'sine', vol = 0.08, delay = 0) {
    const ctx = this._ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(24, freqStart), t0);
    if (freqEnd && freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(24, freqEnd), t0 + dur);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + Math.min(0.015, dur * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.01);
  }

  _noise(dur, vol = 0.07, filterFreq = 900, delay = 0) {
    const ctx = this._ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.setValueAtTime(filterFreq, t0);
    filt.Q.setValueAtTime(1.2, t0);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt);
    filt.connect(gain);
    gain.connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + dur + 0.01);
  }

  play(kind) {
    if (!this.enabled) return;
    switch (kind) {
    case 'click':
      this._tone(520, 680, 0.05, 'triangle', 0.04);
      break;
    case 'switch':
      this._tone(300, 740, 0.14, 'sine', 0.06);
      this._tone(620, 920, 0.1, 'triangle', 0.04, 0.05);
      break;
    case 'beam':
      this._tone(640, 320, 0.26, 'sawtooth', 0.045);
      this._tone(960, 480, 0.26, 'sine', 0.05, 0.02);
      break;
    case 'lightning':
      this._noise(0.18, 0.065, 2400);
      this._tone(1250, 220, 0.18, 'sawtooth', 0.05);
      break;
    case 'slash':
      this._noise(0.11, 0.07, 3200);
      this._tone(900, 260, 0.11, 'triangle', 0.055);
      break;
    case 'punch':
    case 'strike':
    case 'bite':
      this._noise(0.12, 0.08, 480);
      this._tone(190, 58, 0.13, 'triangle', 0.085);
      break;
    case 'quake':
    case 'meteor':
    case 'explosion':
      this._noise(0.28, 0.09, 260);
      this._tone(130, 42, 0.28, 'sawtooth', 0.07);
      break;
    case 'wave':
    case 'storm':
      this._noise(0.25, 0.055, 1100);
      this._tone(360, 540, 0.22, 'sine', 0.045);
      break;
    case 'sound':
      this._tone(440, 660, 0.14, 'triangle', 0.055);
      this._tone(554, 880, 0.16, 'sine', 0.05, 0.06);
      break;
    case 'projectile':
    case 'barrage':
    case 'drain':
      this._tone(480, 760, 0.12, 'sine', 0.055);
      this._tone(760, 340, 0.12, 'triangle', 0.045, 0.08);
      break;
    case 'shield':
      this._tone(520, 1040, 0.16, 'sine', 0.055);
      break;
    case 'hit':
      this._noise(0.09, 0.075, 650);
      this._tone(160, 65, 0.1, 'square', 0.05);
      break;
    case 'se':
      this._tone(523, 784, 0.1, 'triangle', 0.07);
      this._tone(784, 1046, 0.14, 'triangle', 0.07, 0.07);
      break;
    case 'crit':
      this._tone(660, 1320, 0.16, 'sawtooth', 0.06);
      break;
    case 'boost':
      this._tone(392, 587, 0.11, 'triangle', 0.055);
      this._tone(587, 784, 0.13, 'triangle', 0.055, 0.08);
      break;
    case 'unboost':
      this._tone(520, 310, 0.16, 'triangle', 0.05);
      break;
    case 'heal':
      this._tone(523, 659, 0.12, 'sine', 0.055);
      this._tone(659, 880, 0.16, 'sine', 0.055, 0.09);
      break;
    case 'faint':
      this._tone(340, 95, 0.34, 'sawtooth', 0.055);
      break;
    case 'mega':
      this._tone(392, 784, 0.18, 'triangle', 0.065);
      this._tone(587, 1174, 0.24, 'sine', 0.065, 0.1);
      break;
    case 'field':
      this._tone(330, 495, 0.18, 'sine', 0.055);
      this._tone(495, 660, 0.22, 'triangle', 0.05, 0.1);
      break;
    default:
      this._tone(420, 520, 0.09, 'sine', 0.04);
      break;
    }
  }
}

export const sfx = new BattleSFX();
