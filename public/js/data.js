export const TYPE_COLORS = {
  Normal: '#9a9a7a', Fire: '#ee6a2c', Water: '#4f86f0', Electric: '#e8bf1e', Grass: '#5fb83c', Ice: '#6ccfd0',
  Fighting: '#c0302a', Poison: '#9a3f9e', Ground: '#d6b55c', Flying: '#9483ee', Psychic: '#f5507e', Bug: '#9ab01e',
  Rock: '#b49c3a', Ghost: '#6a5494', Dragon: '#6a3cf5', Dark: '#6a5446', Steel: '#a8a8c8', Fairy: '#e687b5',
  Stellar: '#40b5a5', '???': '#68a090',
};
export const STATUS_NAMES = {brn: 'burned', par: 'paralyzed', slp: 'asleep', frz: 'frozen', psn: 'poisoned', tox: 'badly poisoned'};
export const STAT_NAMES = {atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed', accuracy: 'accuracy', evasion: 'evasiveness'};
export const STAT_SHORT = {atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe', accuracy: 'Acc', evasion: 'Eva'};

export function toID(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/** species name -> showdown sprite id (cache filled from server data) */
export const spriteIds = new Map();
const SPECIAL_BASES = ['Ho-Oh', 'Porygon-Z', 'Jangmo-o', 'Hakamo-o', 'Kommo-o', 'Chi-Yu', 'Chien-Pao', 'Ting-Lu', 'Wo-Chien', 'Type: Null', 'Mr. Mime', 'Mime Jr.', 'Mr. Rime', 'Tapu Koko', 'Tapu Lele', 'Tapu Bulu', 'Tapu Fini'];
export function spriteIdFor(species) {
  if (spriteIds.has(species)) return spriteIds.get(species);
  if (species === 'Solrock Fusion') return 'solrock';
  if (species === 'Lunatone Fusion') return 'lunatone';
  for (const b of SPECIAL_BASES) {
    if (species.startsWith(b)) {
      const rest = species.slice(b.length).replace(/^-/, '');
      return toID(b) + (rest ? '-' + toID(rest) : '');
    }
  }
  const i = species.indexOf('-');
  if (i < 0) return toID(species);
  return toID(species.slice(0, i)) + '-' + toID(species.slice(i + 1));
}
export function rememberSprite(species, id) {
  if (species && id) spriteIds.set(species, id);
}

const CDN = 'https://play.pokemonshowdown.com/sprites';
export function spriteUrls(species, {back = false, shiny = false} = {}) {
  const id = spriteIdFor(species);
  const baseId = id.split('-')[0];
  const s = shiny ? '-shiny' : '';
  const urls = [
    `${CDN}/ani${back ? '-back' : ''}${s}/${id}.gif`,
    `${CDN}/gen5${back ? '-back' : ''}${s}/${id}.png`,
  ];
  if (baseId && baseId !== id) {
    urls.push(`${CDN}/ani${back ? '-back' : ''}${s}/${baseId}.gif`);
    urls.push(`${CDN}/gen5${back ? '-back' : ''}${s}/${baseId}.png`);
  }
  urls.push(`${CDN}/gen5${back ? '-back' : ''}/${baseId}.png`);
  urls.push(`${CDN}/dex/${baseId}.png`);
  return urls;
}
export function iconUrl(species) {
  return spriteUrls(species)[1];
}
/** Attach fallbacks to an <img>. */
export function setSprite(img, species, opts) {
  const urls = spriteUrls(species, opts);
  let i = 0;
  img.onerror = () => {
    i++;
    if (i < urls.length) img.src = urls[i];
    else img.onerror = null;
  };
  img.src = urls[0];
  img.alt = species;
}
export function staticSprite(img, species, opts) {
  const urls = spriteUrls(species, opts).slice(1);
  let i = 0;
  img.onerror = () => {
    i++;
    if (i < urls.length) img.src = urls[i];
    else img.onerror = null;
  };
  img.src = urls[0];
  img.alt = species;
}
export function typeBadge(type) {
  return `<span class="type" style="background:${TYPE_COLORS[type] || '#777'}">${type}</span>`;
}
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
}
