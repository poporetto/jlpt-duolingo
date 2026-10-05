#!/usr/bin/env node
/**
 * Builds app/vocab-bank.json — the 文脈規定 item pool.
 *
 *   node scripts/build-vocab-carriers.mjs   # once, parses the 123 MB jmdict dump
 *   node scripts/build-vocab-bank.mjs
 *
 * 文脈規定 blanks a word out of a sentence and asks which of four fits. Every
 * carrier here is a real Tatoeba sentence bound to one specific JMdict sense and
 * reading (see build-vocab-carriers.mjs) — no Japanese is generated, which is the
 * same rule build-kanji-bank.mjs follows and the reason the previous templated
 * vocabulary items were worthless.
 *
 * The failure mode that matters is two correct answers: a distractor that also
 * fits the blank. Three filters guard against it — a distractor must share the
 * target's part of speech (so it is grammatical in the slot and not dismissible
 * on sight), must share no gloss word with the target (so it is not a synonym),
 * and must not already appear in the carrier.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, '.data-cache');
const LEVEL_NAME = { 1: 'N1', 2: 'N2', 3: 'N3', 4: 'N4', 5: 'N5' };

const carriers = JSON.parse(await readFile(path.join(cache, 'vocab-carriers.json'), 'utf8'));
const kanji = JSON.parse(await readFile(path.join(cache, 'kanji.json'), 'utf8'));
const levelOf = new Map(Object.entries(kanji).filter(([, d]) => d.jlpt_new).map(([c, d]) => [c, d.jlpt_new]));

/* ---------- carrier filters (same discipline as the kanji bank) ---------- */
const KANJI_RE = /[一-鿿]/;
const LATIN = /[A-Za-zＡ-Ｚａ-ｚ]/;
const maxCarrier = { 5: 42, 4: 50, 3: 60, 2: 68, 1: 76 };
const carrierOk = (text, level) =>
  text.length <= (maxCarrier[level] ?? 42) &&
  !LATIN.test(text) && !text.includes('・') &&
  [...text].every((ch) => !KANJI_RE.test(ch) || !levelOf.has(ch) || levelOf.get(ch) >= level - 2);

/* ---------- part of speech ---------- */
/* Only forms whose dictionary shape can stand in the blank unchanged. A verb or
   い-adjective would need inflecting to fit, and a distractor left in the wrong
   form gives the answer away. */
const USABLE_POS = new Set(['n', 'adv', 'adv-to', 'adj-na', 'adj-no', 'n-adv', 'vs']);
/* An interjection, set phrase or pronoun among four nouns is dismissible without
   reading the sentence, so such a word may never be an option — あら ("oh!") is
   tagged `n` for the fish-scraps sense and would otherwise qualify. */
const EXCLUDE_POS = new Set(['int', 'exp', 'pn', 'pref', 'suf', 'ctr', 'aux', 'conj', 'prt']);
const primaryPos = (rec) => (rec.pos.some((p) => EXCLUDE_POS.has(p)) ? undefined : rec.pos.find((p) => USABLE_POS.has(p)));

/* ---------- gloss comparison ---------- */
const STOP = new Set(['a','an','the','of','to','in','on','for','with','and','or','be','is','are','as','at','by','from','that','this','it','one','something','someone','esp','etc','e.g','i.e','not','no','such','person','thing','which','who','made','used','way','out','up','off','into','over','about','also','any','their','its','his','her']);
const glossWords = (rec) => new Set(
  rec.gloss.join(' ').toLowerCase().replace(/\([^)]*\)/g, ' ').split(/[^a-z']+/)
    .filter((w) => w.length > 2 && !STOP.has(w)),
);
const disjoint = (a, b) => ![...a].some((w) => b.has(w));

/* ---------- build ---------- */
const pool = [];
for (const [word, rec] of Object.entries(carriers)) {
  const pos = primaryPos(rec);
  if (!pos || !rec.level) continue;
  const usable = rec.carriers.filter((s) => carrierOk(s, rec.level)).sort((a, b) => a.length - b.length);
  if (!usable.length) continue;
  pool.push({ word, reading: rec.reading, level: rec.level, pos, gloss: rec.gloss, words: glossWords(rec), sentence: usable[0] });
}

const byPos = new Map();
for (const e of pool) {
  for (const lv of [e.level - 1, e.level, e.level + 1]) {
    const key = `${e.pos}\u0000${lv}`;
    if (!byPos.has(key)) byPos.set(key, []);
    byPos.get(key).push(e);
  }
}

/** FNV-1a, so the shuffle is deterministic across builds. */
function mix(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h;
}

const bank = { N5: [], N4: [], N3: [], N2: [], N1: [] };
/** No word may be an option in more than this many items in its level. */
const USAGE_CAP = 6;
const used = new Map();
let noDistractors = 0;
for (const entry of pool) {
  const candidates = (byPos.get(`${entry.pos}\u0000${entry.level}`) ?? [])
    .filter((o) => o.word !== entry.word
      && !entry.sentence.includes(o.word)
      && !o.word.includes(entry.word) && !entry.word.includes(o.word)
      && o.reading !== entry.reading
      && disjoint(entry.words, o.words));
  if (candidates.length < 3) { noDistractors += 1; continue; }
  // Shuffle per target word, not by fixed index. Picking candidates[0] and two
  // fixed offsets made one word the first distractor of 713 of 822 N2 items —
  // 822 items sharing three options is the template inflation this pool exists
  // to replace. A usage cap keeps any one word from dominating even so.
  const ranked = candidates
    .map((o) => ({ o, k: mix(`${entry.word}\u0000${o.word}`) }))
    .sort((a, b) => a.k - b.k)
    .map(({ o }) => o)
    // Options that look alike read like a real 問題用紙; a one-character option
    // beside a four-character one is a tell.
    .sort((a, b) => Math.abs(a.word.length - entry.word.length) - Math.abs(b.word.length - entry.word.length));
  const picked = [];
  for (const cand of ranked) {
    if (picked.length === 3) break;
    if ((used.get(cand.word) ?? 0) >= USAGE_CAP) continue;
    picked.push(cand);
  }
  if (picked.length < 3) { noDistractors += 1; continue; }
  for (const p of picked) used.set(p.word, (used.get(p.word) ?? 0) + 1);
  bank[LEVEL_NAME[entry.level]].push({
    word: entry.word,
    reading: entry.reading,
    sentence: entry.sentence,
    gloss: entry.gloss.slice(0, 3),
    distractors: picked.map((p) => ({ word: p.word, gloss: p.gloss[0] ?? '' })),
  });
}

for (const lv of Object.keys(bank)) bank[lv].sort((a, b) => a.word.localeCompare(b.word, 'ja'));
await writeFile(path.join(root, 'app', 'vocab-bank.json'), JSON.stringify(bank));
console.log('文脈規定 items built per level:');
for (const lv of ['N5', 'N4', 'N3', 'N2', 'N1']) console.log(`  ${lv}  ${bank[lv].length}`);
console.log(`(${pool.length} words had a usable carrier; ${noDistractors} dropped for lack of safe distractors)`);
