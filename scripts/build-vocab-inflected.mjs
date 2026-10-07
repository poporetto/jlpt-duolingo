#!/usr/bin/env node
/**
 * Builds app/vocab-inflected.json — 文脈規定 items whose answer is a verb or an
 * い-adjective.
 *
 * build-vocab-bank.mjs takes only words whose dictionary shape can sit in a blank
 * unchanged (nouns, adverbs, な-adjectives), because a distractor left in the
 * wrong form gives the answer away. That excluded most of the beginner lists,
 * where verbs and い-adjectives are a large share. Here the blank is cut around
 * the inflected form the sentence actually uses, and every distractor is
 * conjugated into that same form — what the real paper does (達した／届いた／
 * 及ぼした).
 *
 * Same rules as the other pools: real Tatoeba carriers bound to one JMdict sense
 * and one reading; distractors share the answer's level, word class and, for
 * verbs, transitivity, and share none of its glosses. Kept in its own file and
 * appended as its own block so the existing 文脈規定 items do not change.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { forms, CONJUGABLE } from './conjugate.mjs';
import { opposed, GENERIC } from './opposites.mjs';
import { questionBank } from '../app/course-data.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, '.data-cache');
const LEVEL = { 1: 'N1', 2: 'N2', 3: 'N3', 4: 'N4', 5: 'N5' };
const KANJI_RE = /[一-鿿]/;
const LATIN = /[A-Za-zＡ-Ｚａ-ｚ]/;
const maxCarrier = { 5: 42, 4: 50, 3: 60, 2: 68, 1: 76 };

const vocab = JSON.parse(await readFile(path.join(cache, 'vocab.json'), 'utf8'));
const kanji = JSON.parse(await readFile(path.join(cache, 'kanji.json'), 'utf8'));
const levelOf = new Map(Object.entries(kanji).filter(([, d]) => d.jlpt_new).map(([c, d]) => [c, d.jlpt_new]));
const carrierOk = (text, level) => text.length <= (maxCarrier[level] ?? 42)
  && !LATIN.test(text) && !text.includes('・')
  && [...text].every((ch) => !KANJI_RE.test(ch) || !levelOf.has(ch) || levelOf.get(ch) >= level - 2);
process.stdout.write('reading jmdict-examples (123 MB)…\n');
const { words } = JSON.parse(await readFile(path.join(cache, 'jmdict-examples-eng-3.6.2.json'), 'utf8'));

const STOP = new Set(['a','an','the','of','to','in','on','for','with','and','or','be','is','are','as','at','by','from','that','this','it','one','something','someone','esp','etc','not','no','such','person','thing','which','who','up','off','out','into','over','about','also','get','make','do','have','take','become']);
const glossWords = (g) => new Set(g.join(' ').toLowerCase().replace(/\([^)]*\)/g, ' ').split(/[^a-z']+/).filter((w) => w.length > 2 && !STOP.has(w)));

/** word -> { reading, level, cls, trans, gloss[], carriers[] } — one sense, one reading. */
const recs = new Map();
for (const entry of words) {
  for (const k of entry.kanji ?? []) {
    const word = k.text;
    if (!KANJI_RE.test(word[0])) continue;   // a kana-initial verb can hide inside another word
    // Only the standard, common spelling: the vocabulary list also carries forms
    // like 落る and 物体ない, which read as typos when shown as options.
    if (!k.common || (k.tags ?? []).some((t) => ['iK', 'oK', 'rK', 'sK', 'ateji'].includes(t))) continue;
    // ～ない expressions (違いない, 仕方ない) are tagged adj-i but are set phrases.
    if (word.endsWith('ない')) continue;
    const listed = vocab[word];
    if (!listed || listed.length !== 1) continue;
    for (const sense of entry.sense ?? []) {
      if (!(sense.appliesToKanji?.includes('*') || sense.appliesToKanji?.includes(word))) continue;
      const kana = (entry.kana ?? []).filter((x) => /^[ぁ-ん]+$/.test(x.text)
        && (x.appliesToKanji?.includes('*') || x.appliesToKanji?.includes(word))
        && (sense.appliesToKana?.includes('*') || sense.appliesToKana?.includes(x.text)));
      const readings = [...new Set(kana.map((x) => x.text))];
      if (readings.length !== 1 || readings[0] !== listed[0].reading) continue;
      const cls = (sense.partOfSpeech ?? []).find((p) => CONJUGABLE.has(p));
      if (!cls || !forms(word, cls)) continue;
      const trans = (sense.partOfSpeech ?? []).includes('vt') ? 'vt' : (sense.partOfSpeech ?? []).includes('vi') ? 'vi' : '';
      const rec = recs.get(word) ?? { word, reading: readings[0], level: listed[0].level, cls, trans, gloss: [], carriers: [], antonyms: new Set() };
      for (const a of sense.antonym ?? []) if (a[0]) rec.antonyms.add(a[0]);
      if (rec.cls !== cls) continue;
      for (const g of sense.gloss ?? []) if (g.text && !rec.gloss.includes(g.text)) rec.gloss.push(g.text);
      for (const ex of sense.examples ?? []) for (const s of ex.sentences ?? []) {
        if (s.lang === 'jpn' && !rec.carriers.includes(s.text)) rec.carriers.push(s.text);
      }
      recs.set(word, rec);
    }
  }
}

// Every Japanese sentence in the dump, for collocation checks.
const corpus = [];
{
  const seen = new Set();
  for (const entry of words) for (const sense of entry.sense ?? []) for (const ex of sense.examples ?? []) {
    for (const s of ex.sentences ?? []) if (s.lang === 'jpn' && !seen.has(s.text)) { seen.add(s.text); corpus.push(s.text); }
  }
}
const corpusText = corpus.join('\n');
// sentences by bigram, so the right-hand check looks only where it could match
const byBigram = new Map();
for (const t of corpus) for (let i = 0; i + 2 <= t.length; i += 1) {
  const g = t.slice(i, i + 2);
  if (!byBigram.has(g)) byBigram.set(g, []);
  const list = byBigram.get(g);
  if (list[list.length - 1] !== t) list.push(t);
}

/**
 * Does the corpus already show `candidate` in this slot? If a real sentence has
 * the two characters before the blank followed by the candidate's stem — 「時に終」
 * for 「何時に（　）か」 — the candidate demonstrably fits there and cannot be a
 * distractor. Only ever removes options, so a thin corpus costs coverage, not
 * correctness.
 */
function fitsSlot(candidate, before, after) {
  const stem = candidate.slice(0, -1);
  const left = before.slice(-2);
  if (left.length === 2 && corpusText.includes(left + stem)) return true;
  // and the other side: the candidate's own form followed by what follows the blank
  const right = after.replace(/^[。、！？]+/, '').slice(0, 2);
  if (right.length === 2) {
    for (const t of byBigram.get(right) ?? []) {
      const at = t.indexOf(stem);
      if (at !== -1 && t.indexOf(right, at + stem.length) - (at + stem.length) <= 4 && t.indexOf(right, at + stem.length) !== -1) return true;
    }
  }
  return false;
}

/** Find the longest form of `word` in the sentence that is not glued to a kanji in front. */
function locate(sentence, word, cls) {
  const all = Object.entries(forms(word, cls)).sort((a, b) => b[1].length - a[1].length);
  for (const [name, form] of all) {
    let at = sentence.indexOf(form);
    while (at !== -1) {
      const next = sentence[at + form.length] ?? '';
      // 出し＋たくない is not the past form 出した followed by くない: a past-tense
      // match running on into an adjectival ending is a たい form, and every
      // distractor conjugated "the same way" would be ungrammatical.
      const after2 = sentence.slice(at + form.length, at + form.length + 2);
      // か alone is the question particle (始まりましたか); only かっ is たかった.
      const runsOn = /^(ta|masuPast|naiPast|past)$/.test(name) && (/^[いくけさ]/.test(next) || after2 === 'かっ');
      if (!KANJI_RE.test(sentence[at - 1] ?? '') && !runsOn) return { name, form, at };
      at = sentence.indexOf(form, at + 1);
    }
  }
  return null;
}

// Words each level already tests, so the pool adds breadth rather than repeats.
const tested = {};
for (const lv of Object.values(LEVEL)) {
  tested[lv] = new Set();
  for (const q of questionBank[lv]) {
    tested[lv].add(q.options[q.answer ?? 0]);
    for (const t of q.tokens ?? []) if (typeof t === 'object') tested[lv].add(t.kanji);
  }
}

function mix(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
}

const family = (r) => (r.cls === 'adj-i' ? 'adj' : `verb:${r.trans}`);
const pool = [...recs.values()].map((r) => ({ ...r, words: glossWords(r.gloss) }));
const out = { N5: [], N4: [], N3: [], N2: [], N1: [] };
const used = new Map();
const USAGE_CAP = 6;
const stats = {};

for (const r of pool.sort((a, b) => a.word.localeCompare(b.word, 'ja'))) {
  const lv = LEVEL[r.level];
  stats[lv] ??= { candidates: 0, noCarrier: 0, noDistractors: 0, built: 0 };
  if (tested[lv].has(r.word)) continue;
  stats[lv].candidates += 1;
  let hit = null;
  // A carrier needs enough around the blank to decide it: 「１０分前に（　）。」
  // admits almost any verb.
  const context = (t, loc) => (t.slice(0, loc.at) + t.slice(loc.at + loc.form.length)).replace(/[。、！？「」\s]/g, '').length;
  for (const s of r.carriers.filter((t) => carrierOk(t, r.level)).sort((a, b) => a.length - b.length)) {
    const loc = locate(s, r.word, r.cls);
    if (loc && context(s, loc) >= 9) { hit = { sentence: s, ...loc }; break; }
  }
  if (!hit) { stats[lv].noCarrier += 1; continue; }
  const ranked = pool
    .filter((o) => o.word !== r.word && family(o) === family(r) && Math.abs(o.level - r.level) <= 1
      && ![...o.words].some((w) => r.words.has(w))
      && !hit.sentence.includes(o.word.slice(0, -1))
      && !GENERIC.has(o.word) && !opposed(r.word, o.word) && !r.antonyms.has(o.word) && !o.antonyms.has(r.word)
      && !fitsSlot(o.word, hit.sentence.slice(0, hit.at), hit.sentence.slice(hit.at + hit.form.length))
      && forms(o.word, o.cls)?.[hit.name])
    .map((o) => ({ o, k: mix(`${r.word}\u0000${o.word}`) + (o.level === r.level ? 0 : 2 ** 32) }))
    .sort((a, b) => a.k - b.k)
    .map(({ o }) => o);
  const picked = [];
  const seenForms = new Set([hit.form]);
  for (const o of ranked) {
    if (picked.length === 3) break;
    const f = forms(o.word, o.cls)[hit.name];
    if (seenForms.has(f) || (used.get(`${lv}:${o.word}`) ?? 0) >= USAGE_CAP) continue;
    seenForms.add(f);
    picked.push({ word: o.word, form: f, gloss: o.gloss[0] ?? '' });
  }
  if (picked.length < 3) { stats[lv].noDistractors += 1; continue; }
  for (const p of picked) used.set(`${lv}:${p.word}`, (used.get(`${lv}:${p.word}`) ?? 0) + 1);
  out[lv].push({
    word: r.word, reading: r.reading, form: hit.form,
    before: hit.sentence.slice(0, hit.at), after: hit.sentence.slice(hit.at + hit.form.length),
    gloss: r.gloss.slice(0, 3), distractors: picked,
  });
  stats[lv].built += 1;
}

await writeFile(path.join(root, 'app', 'vocab-inflected.json'), JSON.stringify(out));
console.table(stats);
