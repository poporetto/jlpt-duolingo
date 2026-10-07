#!/usr/bin/env node
/**
 * Builds app/vocab-corpus.json — 文脈規定 items for nouns, な-adjectives and
 * adverbs that the sense-bound pool could not reach.
 *
 * build-vocab-bank.mjs inherits two restrictions that 文脈規定 does not need:
 *   - one reading per word. That matters for 漢字読み, where the reading is the
 *     answer; here the learner picks the word and the reading is never asked, so
 *     私, 人, 体 and 店 were excluded for no reason.
 *   - a sentence filed under the word's sense. Here any sentence containing the
 *     word works whatever sense it uses, because the answer is literally the word
 *     that stood in the blank. That reaches 海, 駅 and 鉛筆, which JMdict files
 *     no sentence under, and the katakana loanwords, which had no hiragana reading.
 *
 * Distractor rules are the same as the other pools, plus the corpus collocation
 * check. Appended as its own block.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { questionBank } from '../app/course-data.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, '.data-cache');
const LEVEL = { 1: 'N1', 2: 'N2', 3: 'N3', 4: 'N4', 5: 'N5' };
const KANJI_RE = /[一-鿿]/;
const KATA_RE = /[ァ-ヶー]/;
const LATIN = /[A-Za-zＡ-Ｚａ-ｚ０-９0-9]/;
const maxCarrier = { 5: 42, 4: 50, 3: 60, 2: 68, 1: 76 };
const USABLE = new Set(['n', 'adv', 'adv-to', 'adj-na', 'adj-no', 'n-adv']);
const EXCLUDE = new Set(['int', 'exp', 'pn', 'pref', 'suf', 'ctr', 'aux', 'conj', 'prt', 'num', 'n-suf', 'n-pref', 'aux-v', 'aux-adj']);

const vocab = JSON.parse(await readFile(path.join(cache, 'vocab.json'), 'utf8'));
const kanji = JSON.parse(await readFile(path.join(cache, 'kanji.json'), 'utf8'));
const levelOf = new Map(Object.entries(kanji).filter(([, d]) => d.jlpt_new).map(([c, d]) => [c, d.jlpt_new]));
const carrierOk = (text, level) => text.length <= (maxCarrier[level] ?? 42)
  && !LATIN.test(text) && !text.includes('・')
  && [...text].every((ch) => !KANJI_RE.test(ch) || !levelOf.has(ch) || levelOf.get(ch) >= level - 2);
process.stdout.write('reading jmdict-examples (123 MB)…\n');
const { words } = JSON.parse(await readFile(path.join(cache, 'jmdict-examples-eng-3.6.2.json'), 'utf8'));

// POS and glosses for every surface, standard spellings only.
const info = new Map();
for (const entry of words) {
  const surfaces = [
    ...(entry.kanji ?? []).filter((k) => !(k.tags ?? []).some((t) => ['iK', 'oK', 'rK', 'sK'].includes(t))).map((k) => k.text),
    ...(entry.kanji?.length ? [] : (entry.kana ?? []).map((k) => k.text)),
  ];
  for (const word of surfaces) {
    if (!vocab[word]) continue;
    const rec = info.get(word) ?? { pos: new Set(), gloss: [] };
    for (const sense of entry.sense ?? []) {
      for (const p of sense.partOfSpeech ?? []) rec.pos.add(p);
      for (const g of sense.gloss ?? []) if (g.text && rec.gloss.length < 6 && !rec.gloss.includes(g.text)) rec.gloss.push(g.text);
    }
    info.set(word, rec);
  }
}

const corpus = [];
{
  const seen = new Set();
  for (const entry of words) for (const sense of entry.sense ?? []) for (const ex of sense.examples ?? []) {
    for (const s of ex.sentences ?? []) if (s.lang === 'jpn' && !seen.has(s.text)) { seen.add(s.text); corpus.push(s.text); }
  }
}
const corpusText = corpus.join('\n');
const byChar = new Map();
for (const t of corpus) for (const ch of new Set(t)) { if (!byChar.has(ch)) byChar.set(ch, []); byChar.get(ch).push(t); }
const sentencesWith = (word) => {
  let best = null;
  for (const ch of new Set(word)) { const list = byChar.get(ch) ?? []; if (!best || list.length < best.length) best = list; }
  return (best ?? []).filter((t) => t.includes(word));
};

/** The word must stand alone: no character of its own script touching either end. */
function standsAlone(sentence, at, word) {
  const before = sentence[at - 1] ?? '';
  const after = sentence[at + word.length] ?? '';
  const script = (ch) => (KANJI_RE.test(ch) || ch === '々' ? 'k' : KATA_RE.test(ch) ? 'K' : /[ぁ-ん]/.test(ch) ? 'h' : '');
  const first = script(word[0]);
  const last = script(word[word.length - 1]);
  if (first === 'h' || last === 'h') return false;   // hiragana edges hide inside other words
  return script(before) !== first && script(after) !== last;
}

const STOP = new Set(['a','an','the','of','to','in','on','for','with','and','or','be','is','are','as','at','by','from','that','this','it','one','something','someone','esp','etc','not','no','such','person','thing','which','who','up','off','out','into','over','about','also','place','time','way','kind']);
const glossWords = (g) => new Set(g.join(' ').toLowerCase().replace(/\([^)]*\)/g, ' ').split(/[^a-z']+/).filter((w) => w.length > 2 && !STOP.has(w)));
function mix(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
}
const fitsSlot = (cand, before) => {
  const left = before.slice(-2);
  return left.length === 2 && corpusText.includes(left + cand);
};

// What each level already tests in any form.
const tested = {};
for (const lv of Object.values(LEVEL)) {
  tested[lv] = new Set();
  for (const q of questionBank[lv]) {
    tested[lv].add(q.options[q.answer ?? 0]);
    for (const t of q.tokens ?? []) if (typeof t === 'object') tested[lv].add(t.kanji);
  }
}
for (const [lv, list] of Object.entries(JSON.parse(await readFile(path.join(root, 'app', 'vocab-inflected.json'), 'utf8')))) {
  for (const e of list) tested[lv].add(e.word);
}

const OPEN_SLOT = /^(の(値段|色|名前|大きさ|形|写真)|(を|が|は|も|に)(買|好き|嫌い|欲し|見|持|使|探|売|作|食べ|飲|もら|あげ|くれ|貸|借|来|行|入|ある|あり|いる|い[また]|なる|なり|した|する|です|だ[。、]|でした))/;
// Katakana evaluative adjectives fit almost any な-adjective slot.
const GENERIC_ADJ = new Set(['ロマンチック', 'エレガント', 'ベスト', 'スマート', 'ハンサム', 'モダン', 'ユニーク', 'ハード', 'シンプル', 'ゴージャス', 'クール', 'ナイス', 'ベター', 'ラッキー', 'フレッシュ', 'ソフト']);
const NAME_LIKE = new Set(['ビル', 'マーク', 'ベル', 'ホール', 'ローズ', 'ジャック', 'ボブ', 'キャンディー', 'ルビー', 'ドン', 'アート', 'ジム', 'バス']);
const pool = [];
for (const [word, entries] of Object.entries(vocab)) {
  const rec = info.get(word);
  if (!rec || [...rec.pos].some((p) => EXCLUDE.has(p))) continue;
  const pos = [...rec.pos].find((p) => USABLE.has(p));
  if (!pos || !rec.gloss.length) continue;
  if (/[一二三四五六七八九十百千万]/.test(word) && /[日人つ回本枚月年]/.test(word)) continue;   // counters
  const level = Math.max(...entries.map((e) => e.level));
  // Loanwords that Tatoeba mostly uses as English given names (ビル is usually Bill).
  if (NAME_LIKE.has(word)) continue;
  const temporal = rec.pos.has('n-t') || rec.pos.has('n-adv') || /^(毎|時々|いつも|たまに)/.test(word);
  pool.push({ word, level, pos, temporal, gloss: rec.gloss, words: glossWords(rec.gloss) });
}
const byPos = new Map();
for (const e of pool) { const key = `${e.pos}`; if (!byPos.has(key)) byPos.set(key, []); byPos.get(key).push(e); }

const out = { N5: [], N4: [], N3: [], N2: [], N1: [] };
const used = new Map();
const usedSentence = { N5: new Set(), N4: new Set(), N3: new Set(), N2: new Set(), N1: new Set() };
const stats = {};
for (const entry of pool.sort((a, b) => a.word.localeCompare(b.word, 'ja'))) {
  const lv = LEVEL[entry.level];
  stats[lv] ??= { candidates: 0, noCarrier: 0, noDistractors: 0, built: 0 };
  if (tested[lv].has(entry.word)) continue;
  stats[lv].candidates += 1;
  let hit = null;
  for (const s of sentencesWith(entry.word)) {
    if (usedSentence[lv].has(s) || !carrierOk(s, entry.level)) continue;
    const at = s.indexOf(entry.word);
    if (!standsAlone(s, at, entry.word)) continue;
    const contextLen = (s.slice(0, at) + s.slice(at + entry.word.length)).replace(/[。、！？「」\s]/g, '').length;
    if (contextLen < 8) continue;
    // A blank that opens the sentence is a subject or topic slot, which takes
    // almost any noun of the right kind: 「（言葉）が出てこなかった」 also takes
    // 留学生. Require some context in front of it.
    if (s.slice(0, at).replace(/[「『\s]/g, '').length < 2) continue;
    // Nor may it be the object of a verb that takes almost anything: 「新しい
    // （ステレオ）を買った」 also takes スーツケース, 「あの（ベース）が好き」 anything.
    if (OPEN_SLOT.test(s.slice(at + entry.word.length))) continue;
    if (!hit || s.length < hit.sentence.length) hit = { sentence: s, at };
  }
  if (!hit) { stats[lv].noCarrier += 1; continue; }
  const before = hit.sentence.slice(0, hit.at);
  const ranked = (byPos.get(entry.pos) ?? [])
    .filter((o) => o.word !== entry.word && Math.abs(o.level - entry.level) <= 1
      && !hit.sentence.includes(o.word) && !o.word.includes(entry.word) && !entry.word.includes(o.word)
      && ![...o.words].some((w) => entry.words.has(w))
      && !o.temporal   // 時々 vs 毎月: time and frequency words swap freely
      && !GENERIC_ADJ.has(o.word)
      && KATA_RE.test(o.word[0]) === KATA_RE.test(entry.word[0]))   // loanword options look alike
    .map((o) => ({ o, k: mix(`${entry.word}\u0000${o.word}`) + (o.level === entry.level ? 0 : 2 ** 32) }))
    .sort((a, b) => a.k - b.k).map(({ o }) => o);
  const picked = [];
  for (const o of ranked) {
    if (picked.length === 3) break;
    if ((used.get(`${lv}:${o.word}`) ?? 0) >= 6) continue;
    if (fitsSlot(o.word, before)) continue;   // checked lazily: it scans the corpus
    picked.push(o);
  }
  if (picked.length < 3) { stats[lv].noDistractors += 1; continue; }
  for (const p of picked) used.set(`${lv}:${p.word}`, (used.get(`${lv}:${p.word}`) ?? 0) + 1);
  usedSentence[lv].add(hit.sentence);
  out[lv].push({
    word: entry.word, sentence: hit.sentence, gloss: entry.gloss.slice(0, 3),
    distractors: picked.map((p) => ({ word: p.word, gloss: p.gloss[0] })),
  });
  stats[lv].built += 1;
}
await writeFile(path.join(root, 'app', 'vocab-corpus.json'), JSON.stringify(out));
console.table(stats);
