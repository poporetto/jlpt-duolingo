/**
 * Minimal Japanese conjugation for 文脈規定 options.
 *
 * Blanking an inflected verb or い-adjective out of a sentence only works if every
 * option is put into the same form — an option left in the dictionary form beside
 * a past-tense blank gives the answer away. The real paper does exactly this
 * (達した／届いた／及ぼした). Irregular classes are left out rather than guessed.
 */
const GODAN = {
  // class: [masu-stem ending, te, ta, nai-stem ending]
  'v5u': ['い', 'って', 'った', 'わ'],
  'v5k': ['き', 'いて', 'いた', 'か'],
  'v5k-s': ['き', 'って', 'った', 'か'],   // 行く
  'v5g': ['ぎ', 'いで', 'いだ', 'が'],
  'v5s': ['し', 'して', 'した', 'さ'],
  'v5t': ['ち', 'って', 'った', 'た'],
  'v5n': ['に', 'んで', 'んだ', 'な'],
  'v5b': ['び', 'んで', 'んだ', 'ば'],
  'v5m': ['み', 'んで', 'んだ', 'ま'],
  'v5r': ['り', 'って', 'った', 'ら'],
};

export const CONJUGABLE = new Set([...Object.keys(GODAN), 'v1', 'adj-i']);

/** Every form this builder will match, keyed by a stable name. */
export function forms(word, cls) {
  if (cls === 'adj-i') {
    if (!word.endsWith('い') || word === 'いい') return null;   // いい conjugates from よい
    const stem = word.slice(0, -1);
    return {
      dict: word, past: `${stem}かった`, neg: `${stem}くない`, negPast: `${stem}くなかった`,
      te: `${stem}くて`, adv: `${stem}く`,
    };
  }
  let masu, te, ta, nai;
  if (cls === 'v1') {
    if (!word.endsWith('る')) return null;
    const stem = word.slice(0, -1);
    masu = stem; te = `${stem}て`; ta = `${stem}た`; nai = stem;
  } else if (GODAN[cls]) {
    const [m, t, d, n] = GODAN[cls];
    const stem = word.slice(0, -1);
    masu = stem + m; te = stem + t; ta = stem + d; nai = stem + n;
  } else return null;
  return {
    dict: word, masu: `${masu}ます`, masuPast: `${masu}ました`, masuNeg: `${masu}ません`,
    te, ta, nai: `${nai}ない`, naiPast: `${nai}なかった`, teiru: `${te}いる`, teita: `${te}いた`,
  };
}
