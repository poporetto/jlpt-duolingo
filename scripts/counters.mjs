/**
 * Readings for a number followed by a counter: 三十分 さんじゅっぷん, 一階
 * いっかい, 六本 ろっぽん, 二十日 はつか.
 *
 * A morphological analyser reads 三十分 one character at a time — さん・じゅう・
 * ふん — because the sound changes live in the combination, not in any one
 * token. They are regular enough to state as rules: the last spoken digit
 * decides whether the counter is voiced (さんぼん), turned to p (いっぽん) or
 * the digit is clipped (はっ, ろっ, じゅっ).
 */
const DIGIT = { 〇: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
const ONES = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];

/** Parse kanji or Arabic numerals; returns null for anything else. */
export function parseNumber(text) {
  if (/^[0-9０-９]+$/.test(text)) return Number(text.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)));
  if (!/^[〇一二三四五六七八九十百千万]+$/.test(text)) return null;
  let total = 0, section = 0, digit = 0;
  for (const ch of text) {
    if (ch in DIGIT) { digit = DIGIT[ch]; continue; }
    const unit = { 十: 10, 百: 100, 千: 1000, 万: 10000 }[ch];
    if (unit === 10000) { total += (section + digit) * 10000; section = 0; digit = 0; continue; }
    section += (digit || 1) * unit;
    digit = 0;
  }
  return total + section + digit;
}

/** Plain reading of a number, with the sound changes inside it (さんびゃく). */
export function readNumber(n) {
  if (n === 0) return 'ぜろ';
  let out = '';
  const man = Math.floor(n / 10000);
  if (man) { out += readNumber(man) + 'まん'; n %= 10000; }
  const sen = Math.floor(n / 1000), hyaku = Math.floor((n % 1000) / 100), juu = Math.floor((n % 100) / 10), one = n % 10;
  if (sen) out += ({ 1: 'せん', 3: 'さんぜん', 8: 'はっせん' })[sen] ?? ONES[sen] + 'せん';
  if (hyaku) out += ({ 1: 'ひゃく', 3: 'さんびゃく', 6: 'ろっぴゃく', 8: 'はっぴゃく' })[hyaku] ?? ONES[hyaku] + 'ひゃく';
  if (juu) out += (juu === 1 ? '' : ONES[juu]) + 'じゅう';
  if (one) out += ONES[one];
  return out;
}

/**
 * Counter rules. `base` is the plain reading; the other keys override by the
 * number's last spoken element: 1, 3, 4, 6, 7, 8, 9, 10 (any round ten), 100.
 */
const C = {
  分: { base: 'ふん', 1: 'いっぷん', 3: 'さんぷん', 4: 'よんぷん', 6: 'ろっぷん', 8: 'はっぷん', 10: 'じゅっぷん', 100: 'ひゃっぷん', q: 'なんぷん' },
  本: { base: 'ほん', 1: 'いっぽん', 3: 'さんぼん', 6: 'ろっぽん', 8: 'はっぽん', 10: 'じゅっぽん', 100: 'ひゃっぽん', q: 'なんぼん' },
  杯: { base: 'はい', 1: 'いっぱい', 3: 'さんばい', 6: 'ろっぱい', 8: 'はっぱい', 10: 'じゅっぱい', q: 'なんばい' },
  匹: { base: 'ひき', 1: 'いっぴき', 3: 'さんびき', 6: 'ろっぴき', 8: 'はっぴき', 10: 'じゅっぴき', q: 'なんびき' },
  泊: { base: 'はく', 1: 'いっぱく', 3: 'さんぱく', 4: 'よんぱく', 6: 'ろっぱく', 8: 'はっぱく', 10: 'じゅっぱく', q: 'なんぱく' },
  階: { base: 'かい', 1: 'いっかい', 3: 'さんがい', 6: 'ろっかい', 8: 'はっかい', 10: 'じゅっかい', q: 'なんがい' },
  回: { base: 'かい', 1: 'いっかい', 6: 'ろっかい', 8: 'はっかい', 10: 'じゅっかい', q: 'なんかい' },
  個: { base: 'こ', 1: 'いっこ', 6: 'ろっこ', 8: 'はっこ', 10: 'じゅっこ', q: 'なんこ' },
  冊: { base: 'さつ', 1: 'いっさつ', 8: 'はっさつ', 10: 'じゅっさつ', q: 'なんさつ' },
  歳: { base: 'さい', 1: 'いっさい', 8: 'はっさい', 10: 'じゅっさい', q: 'なんさい' },
  才: { base: 'さい', 1: 'いっさい', 8: 'はっさい', 10: 'じゅっさい', q: 'なんさい' },
  軒: { base: 'けん', 1: 'いっけん', 3: 'さんげん', 6: 'ろっけん', 8: 'はっけん', 10: 'じゅっけん', q: 'なんげん' },
  件: { base: 'けん', 1: 'いっけん', 6: 'ろっけん', 8: 'はっけん', 10: 'じゅっけん', q: 'なんけん' },
  点: { base: 'てん', 1: 'いってん', 8: 'はってん', 10: 'じゅってん', q: 'なんてん' },
  着: { base: 'ちゃく', 1: 'いっちゃく', 8: 'はっちゃく', 10: 'じゅっちゃく', q: 'なんちゃく' },
  曲: { base: 'きょく', 1: 'いっきょく', 6: 'ろっきょく', 8: 'はっきょく', 10: 'じゅっきょく', q: 'なんきょく' },
  頭: { base: 'とう', 1: 'いっとう', 8: 'はっとう', 10: 'じゅっとう', q: 'なんとう' },
  足: { base: 'そく', 1: 'いっそく', 3: 'さんぞく', 8: 'はっそく', 10: 'じゅっそく', q: 'なんぞく' },
  週間: { base: 'しゅうかん', 1: 'いっしゅうかん', 8: 'はっしゅうかん', 10: 'じゅっしゅうかん', q: 'なんしゅうかん' },
  時: { base: 'じ', 4: 'よじ', 7: 'しちじ', 9: 'くじ', q: 'なんじ' },
  時間: { base: 'じかん', 4: 'よじかん', 7: 'しちじかん', 9: 'くじかん', q: 'なんじかん' },
  人: { base: 'にん', 1: 'ひとり', 2: 'ふたり', 4: 'よにん', 7: 'しちにん', q: 'なんにん' },
  年: { base: 'ねん', 4: 'よねん', 7: 'しちねん', 9: 'きゅうねん', q: 'なんねん' },
  年間: { base: 'ねんかん', 4: 'よねんかん', 7: 'しちねんかん', q: 'なんねんかん' },
  円: { base: 'えん', 4: 'よえん', q: 'なんえん' },
  枚: { base: 'まい', q: 'なんまい' },
  台: { base: 'だい', q: 'なんだい' },
  度: { base: 'ど', q: 'なんど' },
  番: { base: 'ばん', q: 'なんばん' },
  号: { base: 'ごう', q: 'なんごう' },
  名: { base: 'めい', q: 'なんめい' },
  倍: { base: 'ばい', q: 'なんばい' },
  部: { base: 'ぶ', q: 'なんぶ' },
  秒: { base: 'びょう', q: 'なんびょう' },
  キロ: null,
};
const DAYS = { 1: 'ついたち', 2: 'ふつか', 3: 'みっか', 4: 'よっか', 5: 'いつか', 6: 'むいか', 7: 'なのか', 8: 'ようか', 9: 'ここのか', 10: 'とおか', 14: 'じゅうよっか', 20: 'はつか', 24: 'にじゅうよっか' };
const MONTHS = { 4: 'しがつ', 7: 'しちがつ', 9: 'くがつ' };

/** Spoken reading of the number without its last element, and that element's key. */
function split(n) {
  if (n % 100 === 0 && n % 1000 !== 0 && n < 1000) return { head: readNumber(n).replace(/ひゃく$|びゃく$|ぴゃく$/, ''), key: 100, tail: '' };
  if (n % 10 === 0 && n % 100 !== 0) return { head: readNumber(n).replace(/じゅう$/, ''), key: 10 };
  const one = n % 10;
  if (one === 0) return null;   // round hundreds/thousands: counter stays plain
  return { head: n - one ? readNumber(n - one) : '', key: one };
}

/** Reading of number + counter, or null if the combination is not covered. */
export function readCounted(numText, counter) {
  const isQ = numText === '何';
  const n = isQ ? null : parseNumber(numText);
  if (!isQ && n === null) return null;
  if (counter === '日' || counter === '日間') {
    if (isQ) return counter === '日' ? 'なんにち' : 'なんにちかん';
    // 一日 is ついたち as a date and いちにち as a span; the sentence decides, not the rule.
    if (n === 1) return null;
    const day = DAYS[n] ?? (n % 10 === 4 && n > 20 ? readNumber(n - 4) + 'よっか' : readNumber(n).replace(/なな$/, 'しち').replace(/きゅう$/, 'く') + 'にち');
    return counter === '日間' ? day + 'かん' : day;
  }
  if (counter === '月') {
    if (isQ) return 'なんがつ';
    if (n < 1 || n > 12) return null;
    return MONTHS[n] ?? readNumber(n) + 'がつ';
  }
  if (counter === 'か月' || counter === 'ヶ月' || counter === 'ヵ月') {
    if (isQ) return 'なんかげつ';
    const r = { 1: 'いっかげつ', 6: 'ろっかげつ', 8: 'はっかげつ', 10: 'じゅっかげつ' }[n];
    return r ?? readNumber(n) + 'かげつ';
  }
  const rule = C[counter];
  if (!rule) return null;
  if (isQ) return rule.q;
  // ひとり and ふたり are whole words, not a sound change: 十一人 is じゅういちにん.
  if (counter === '人' && n > 2 && n % 10 <= 2) return readNumber(n) + 'にん';
  const parts = split(n);
  if (!parts) return readNumber(n) + rule.base;
  // Round hundreds keep their own sound change (さんびゃく) unless the counter
  // clips them (ひゃっぷん).
  if (parts.key === 100) return rule[100] ? parts.head + rule[100] : readNumber(n) + rule.base;
  if (parts.key === 10) return parts.head + (rule[10] ?? 'じゅう' + rule.base);
  const special = rule[parts.key];
  if (special) return parts.head + special;
  return parts.head + ONES[parts.key] + rule.base;
}

/** Counters in matching order — longest first, so 時間 wins over 時. */
export const COUNTERS = ['週間', '時間', '年間', '日間', 'か月', 'ヶ月', 'ヵ月', ...Object.keys(C).filter((k) => C[k] && k.length === 1), '日', '月'];
