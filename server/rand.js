'use strict';
/**
 * Environment-neutral randomness helpers (Web Crypto is available both in
 * modern browsers and in Node >= 19 as globalThis.crypto), so the game logic
 * can run unchanged on the Node server or fully in the browser.
 */
function randomInt(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  const range = max - min;
  if (range <= 0) return min;
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return min + (buf[0] % range);
}

function randomHex(bytes) {
  const buf = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(buf);
  return [...buf].map(b => b.toString(16).padStart(2, '0')).join('');
}

module.exports = {randomInt, randomHex};
