/**
 * The furigana annotator: kuromoji with the sentence as context, plus the
 * corrections below. Used by build-ruby.mjs; see app/ruby.ts for the format.
 *
 * Measured against the 2,628 readings the bank already carries explicitly
 * (sense-bound JMdict readings), kuromoji reads 97.8% of spans exactly; the old
 * runtime matcher managed 92.1%, losing most of the rest to split compounds.
 * The overrides below cover what kuromoji gets wrong that the app relies on.
 *
 */
import kuromoji from 'kuromoji';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCounted, COUNTERS } from './counters.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KANJI = /[一-鿿々]/;
const kata2hira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

/**
 * Words kuromoji (IPADIC) reads in a way the app should not show. Each was
 * found by comparing its output with the bank's sense-bound readings or with
 * the old matcher. Applied after analysis, over the whole matched span.
 */
const OVERRIDES = {
  日本: 'にほん',        // IPADIC prefers にっぽん
  四時: 'よじ',
  四時間: 'よじかん',
  何千: 'なんぜん',
  二十歳: 'はたち',
  万歳: 'ばんざい',
  一種: 'いっしゅ',
  一日中: 'いちにちじゅう',
  今日は: 'きょうは',
  後から: 'あとから',  // IPADIC reads 後 as ご here
  後で: 'あとで',
  その後で: 'そのあとで',
  // Single words IPADIC reads with a rarer reading. These only apply where the
  // analyser itself sees the word on its own (今 never fires inside 今日).
  今: 'いま',
  露: 'つゆ',
  語: 'ご',
  琴: 'こと',
  毛: 'け',
  来る: 'くる',
  日本人: 'にほんじん',
  入り口: 'いりぐち',
  入口: 'いりぐち',
  何なり: 'なんなり',
  帰す: 'かえす',
  丁目: 'ちょうめ',
  割る: 'わる',
  お手数: 'おてすう',
  右上: 'みぎうえ',
  左上: 'ひだりうえ',
  柵: 'さく',
};

/** Context patterns: the capture group gets the reading. */
const PATTERNS = [
  // 方 is かた ("those who…") after these, not ほう — the same contexts the audio
  // pronunciation overrides cover.
  [/(?:お持ちの|自転車の|会員の|動かない|初めての)(方)/g, 'かた'],
  // 着 straight after a clock time is arrival (十時着 ちゃく), not a garment.
  [/[分時](着)/g, 'ちゃく'],
  // 何 is なん before a copula, と or の (何ですか, 何の), なに before か/を/が/も/に.
  [/(何)(?=です|だ|でしょう|じゃ|と(?!も)|の)/g, 'なん'],
  [/(何)(?=か|を|が|も|に(?!ち))/g, 'なに'],
  // 行った/行って is いく unless it has an object: 調査を行った is おこなった.
  [/(?<!を)(行)(?=っ[たてちと])/g, 'い'],
  [/(?<=を)(行)(?=っ[たてちと])/g, 'おこな'],
  // 方 after a word for people is かた (the polite "person"), not ほう — except
  // before が/より, where it compares (女性の方が多い).
  [/(?:男性|女性|年配|高齢|担当|係|お客|外国|地元|一般|初心者|経験者|学生|大人|子ども|子供|お年寄り|若い)の(方)(?=は|に|へ|を|も|で|と|、)/g, 'かた'],
  // この種の is the "kind" reading しゅ.
  [/この(種)の/g, 'しゅ'],
  // した後、 is あと.
  [/た(後)(?=[、。にでは])/g, 'あと'],
  // 末 is すえ in 〜末に and した末に; 週末 and 年末 are their own words.
  [/[～〜た](末)/g, 'すえ'],
  [/の(末)(?=[に、])/g, 'すえ'],
  // Grammar citations in notes: 〜上は, 〜上で are うえ, not じょう.
  [/[～〜](上)/g, 'うえ'],
  // Whole-phrase readings the counter rules leave open.
  [/([1１一]日中)/g, 'いちにちじゅう'],
  [/(一文)も/g, 'いちもん'],
  // N5 spells weekdays half in kana (月よう日); the analyser has no entry for that.
  [/(月)よう日/g, 'げつ'], [/(火)よう日/g, 'か'], [/(水)よう日/g, 'すい'], [/(木)よう日/g, 'もく'],
  [/(金)よう日/g, 'きん'], [/(土)よう日/g, 'ど'], [/(日)よう日/g, 'にち'],
];

/** Text that carries its own reading in brackets — 伝（つた）えたい — keeps it. */
const INLINE_READING = /([\u4e00-\u9fff々]+)（([ぁ-ん]+)）/g;
const NUMBER = '([〇一二三四五六七八九十百千万]+|[0-9０-９]+|何)';
const COUNTED = new RegExp(`${NUMBER}(${COUNTERS.join('|')})`, 'g');

/**
 * JMdict as a check on every word. IPADIC sometimes reads a word with a name
 * reading (章 あきら, 正義 まさよし) or a historical spelling (預ける あづける),
 * none of which JMdict lists for that word. Word → [reading, isCommon][].
 */
const jm = new Map();
{
  const { readFileSync } = await import('node:fs');
  const { words } = JSON.parse(readFileSync(path.join(root, '.data-cache/jmdict-examples-eng-3.6.2.json'), 'utf8'));
  for (const entry of words) for (const k of entry.kanji ?? []) {
    if ((k.tags ?? []).some((t) => ['iK', 'oK', 'rK', 'sK'].includes(t))) continue;
    for (const kana of entry.kana ?? []) {
      if (!(kana.appliesToKanji?.includes('*') || kana.appliesToKanji?.includes(k.text))) continue;
      if ((kana.tags ?? []).some((t) => ['ik', 'ok', 'rk', 'sk'].includes(t))) continue;
      if (!jm.has(k.text)) jm.set(k.text, []);
      jm.get(k.text).push([kana.text, !!(k.common && kana.common)]);
    }
  }
}

/** The reading of each kanji run in a word, or null if it cannot be aligned. */
function kanjiRuns(word, reading) {
  const segs = align(word, reading, 0);
  if (segs.length === 1 && segs[0][1] === word.length && /[^\u4e00-\u9fff々]/.test(word)) return null;
  return segs.map((seg) => seg[2]);
}

/** Readings JMdict allows for this token, expressed per kanji run; null if unknown. */
function jmdictCheck(surface, base, reading) {
  const entries = jm.get(base) ?? jm.get(surface);
  if (!entries) return null;
  const word = jm.get(base) ? base : surface;
  const ours = kanjiRuns(surface, reading);
  if (!ours) return null;
  const allowed = entries.map(([r, common]) => ({ runs: kanjiRuns(word, r), common })).filter((c) => c.runs && c.runs.length === ours.length);
  if (!allowed.length || allowed.some((c) => c.runs.join('|') === ours.join('|'))) return null;
  const pick = (list) => { const keys = [...new Set(list.map((c) => c.runs.join('|')))]; return keys.length === 1 ? keys[0].split('|') : null; };
  return pick(allowed.filter((c) => c.common)) ?? pick(allowed);
}

const tokenizer = await new Promise((resolve, reject) =>
  kuromoji.builder({ dicPath: path.join(root, 'node_modules/kuromoji/dict') }).build((e, t) => (e ? reject(e) : resolve(t))));

/** Put the reading over the kanji only: 書きます/かきます → 書=か. */
function align(surface, reading, offset) {
  const runs = surface.match(/[一-鿿々]+|[^一-鿿々]+/g) ?? [];
  const pattern = runs.map((run) => (KANJI.test(run[0]) ? '(.+?)' : kata2hira(run).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('');
  const m = new RegExp(`^${pattern}$`).exec(reading);
  if (!m) return KANJI.test(surface) ? [[offset, surface.length, reading]] : [];
  const segs = [];
  let pos = offset;
  let group = 1;
  for (const run of runs) {
    if (KANJI.test(run[0])) segs.push([pos, run.length, m[group++]]);
    pos += run.length;
  }
  return segs;
}

/** Replace whatever covers [at, end) with new segments. */
function replaceSpan(segs, at, end, add) {
  for (let i = segs.length - 1; i >= 0; i--) if (segs[i][0] < end && segs[i][0] + segs[i][1] > at) segs.splice(i, 1);
  segs.push(...add);
}

/** Ruby segments for a whole text. */
export const corrected = [];

export function annotate(text) {
  const segs = [];
  const single = new Set();   // spans the analyser read as one word
  const starts = new Set([0]);
  const ends = new Set();
  let pos = 0;
  for (const t of tokenizer.tokenize(text)) {
    const surface = t.surface_form;
    if (KANJI.test(surface) && t.reading && t.reading !== '*') {
      const reading = kata2hira(t.reading);
      // Correct only where IPADIC is wrong in a known way, not wherever it
      // differs from JMdict's headword reading: conjugation (来ます き), rendaku
      // inside compounds (言葉遣い づかい) and single kanji split out of a word
      // (少 in 少ない) all differ legitimately.
      const base = t.basic_form && t.basic_form !== '*' ? t.basic_form : surface;
      const kanjiCount = (surface.match(/[\u4e00-\u9fff]/g) ?? []).length;
      const oldKana = /[づぢ]/.test(reading);
      const properNoun = t.pos_detail_1 === '固有名詞';
      // Words JMdict does list, under a spelling or tag this check filters out.
      const KEEP = new Set(['面皰', '吃驚', '聞き捨て', '香港', '多', '日当']);
      const eligible = !/^来/.test(base) && !KEEP.has(base) && !KEEP.has(surface) && (oldKana || kanjiCount >= 2 || properNoun);
      let fixed = eligible ? jmdictCheck(surface, base, reading) : null;
      // For old kana, accept only the modern spelling of the same word.
      if (fixed && oldKana && kanjiCount < 2 && !properNoun) {
        const ours = kanjiRuns(surface, reading);
        if (!ours || ours.map((r) => r.replace(/づ/g, 'ず').replace(/ぢ/g, 'じ')).join('|') !== fixed.join('|')) fixed = null;
      }
      if (fixed) {
        // Put JMdict's reading on each kanji run of the surface form.
        const runs = [];
        let p = pos;
        for (const run of surface.match(/[\u4e00-\u9fff々]+|[^\u4e00-\u9fff々]+/g) ?? []) { if (KANJI.test(run[0])) runs.push([p, run.length]); p += run.length; }
        if (runs.length === fixed.length) { runs.forEach(([a, l], i) => segs.push([a, l, fixed[i]])); corrected.push(`${surface}:${reading}→${fixed.join('')}`); }
        else segs.push(...align(surface, reading, pos));
      } else segs.push(...align(surface, reading, pos));
    }
    single.add(`${pos}:${pos + surface.length}`);
    pos += surface.length;
    starts.add(pos);
    ends.add(pos);
  }
  // Number + counter, read as a unit. Skipped where the analyser saw one word
  // (十分 as じゅうぶん, "enough"), since then it is not a count at all.
  for (const m of text.matchAll(COUNTED)) {
    const [whole, num, counter] = m;
    const at = m.index;
    if (at > 0 && /[〇一二三四五六七八九十百千万0-9０-９]/.test(text[at - 1])) continue;   // inside a longer number
    if (single.has(`${at}:${at + whole.length}`) && !/^[0-9０-９]/.test(num)) continue;
    // ...and only on the analyser's own boundaries: 一部分 is one word, not 一部＋分.
    if (!starts.has(at) || !ends.has(at + whole.length)) continue;
    // A day after a month is a date: 一月一日 is ついたち, not "one day".
    const isDate = counter === '日' && /月$/.test(text.slice(0, at));
    const reading = isDate && /^(一|1|１)$/.test(num) ? 'ついたち' : readCounted(num, counter);
    if (!reading) continue;
    // The reading goes over the whole span, digits included (３日 → みっか):
    // a sound-changed reading cannot be split cleanly between number and counter.
    replaceSpan(segs, at, at + whole.length, [[at, whole.length, reading]]);
  }
  for (const m of text.matchAll(INLINE_READING)) {
    replaceSpan(segs, m.index, m.index + m[1].length, [[m.index, m[1].length, m[2]]]);
  }
  for (const [re, reading] of PATTERNS) {
    for (const m of text.matchAll(re)) {
      const at = m.index + m[0].indexOf(m[1]);
      replaceSpan(segs, at, at + m[1].length, [[at, m[1].length, reading]]);
    }
  }
  for (const [word, reading] of Object.entries(OVERRIDES)) {
    let at = text.indexOf(word);
    while (at !== -1) {
      const end = at + word.length;
      // Only where the analyser itself put word boundaries: 後から must not
      // fire inside 午後から, nor 日本 inside 日本語.
      if (starts.has(at) && ends.has(end)) replaceSpan(segs, at, end, align(word, reading, at));
      at = text.indexOf(word, end);
    }
  }
  return segs.sort((a, b) => a[0] - b[0]);
}

export const encode = (segs) => segs.map(([s, l, r]) => `${s},${l},${r}`).join(';');

/** Annotate a sentence once, then hand each plain fragment its own slice. */
export function fragmentsInContext(fragments, into) {
  const whole = fragments.map((f) => f.text).join('');
  const segs = annotate(whole);
  let pos = 0;
  for (const f of fragments) {
    const end = pos + f.text.length;
    if (f.plain && KANJI.test(f.text) && !into.has(f.text)) {
      into.set(f.text, segs.filter(([s, l]) => s >= pos && s + l <= end).map(([s, l, r]) => [s - pos, l, r]));
    }
    pos = end;
  }
}

