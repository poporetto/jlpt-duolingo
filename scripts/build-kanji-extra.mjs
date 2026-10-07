#!/usr/bin/env node
/**
 * Builds app/kanji-extra.json — 漢字読み items for kanji the main pool misses.
 *
 *   node scripts/build-kanji-extra.mjs
 *
 * build-kanji-bank.mjs teaches each kanji through a word on the JLPT vocabulary
 * list. That works up to N2, but most N1 kanji only ever occur in words the list
 * does not carry, which left N1 at about half its 1,232 characters. This pool
 * reaches them through common JMdict words instead, with the same rules: every
 * carrier is a real Tatoeba sentence bound to one sense and one reading, and the
 * distractors come from the main builder's phonological near-miss generator.
 *
 * It is a separate pool, appended at the end of each level's bank, because the
 * main kanji pool is spliced mid-assembly and saved progress is keyed by index.
 * Re-running the main builder would shift every later item; this one does not.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { distractorsFor } from './build-kanji-bank.mjs';
import { questionBank, levels } from '../app/course-data.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, '.data-cache');
const KANJI_RE = /[一-鿿]/;
const LATIN = /[A-Za-zＡ-Ｚａ-ｚ]/;
const maxCarrier = { 5: 42, 4: 50, 3: 60, 2: 68, 1: 76 };

const kanji = JSON.parse(await readFile(path.join(cache, 'kanji.json'), 'utf8'));
const vocab = JSON.parse(await readFile(path.join(cache, 'vocab.json'), 'utf8'));
process.stdout.write('reading jmdict-examples (123 MB)…\n');
const { words } = JSON.parse(await readFile(path.join(cache, 'jmdict-examples-eng-3.6.2.json'), 'utf8'));

// JMdict flags readings that are misspellings (ik), outdated (ok), rare (rk) or
// kept only for search (sk) — ふいんき for 雰囲気. None is a second correct answer,
// so they must not disqualify a word as "having two readings". Spellings carry
// the same flags (iK/oK/rK/sK) and make poor teaching words.
const MARGINAL_KANA = new Set(['ik', 'ok', 'rk', 'sk']);
const MARGINAL_KANJI = new Set(['iK', 'oK', 'rK', 'sK', 'ateji']);
const realKana = (k) => /^[ぁ-ん]+$/.test(k.text) && !(k.tags ?? []).some((t) => MARGINAL_KANA.has(t));
const realKanji = (k) => !(k.tags ?? []).some((t) => MARGINAL_KANJI.has(t));

const levelOf = new Map();
for (const [ch, d] of Object.entries(kanji)) if (d.jlpt_new) levelOf.set(ch, d.jlpt_new);
const carrierOk = (text, level) => text.length <= (maxCarrier[level] ?? 42)
  && !LATIN.test(text) && !text.includes('・')
  && [...text].every((ch) => !KANJI_RE.test(ch) || !levelOf.has(ch) || levelOf.get(ch) >= level - 2);

// What each level already teaches, measured the way the coverage report does:
// any kanji that appears in a furigana token of that level's bank.
// Exclusions are per level: each level is its own bank, so a word taught at N3
// (冗談) may still teach its kanji at N1. What must not happen is the same word or
// carrier sentence appearing twice within one level, where one item spoils another.
const taught = {};
const usedWords = {};
const usedSentences = {};
for (const level of levels) {
  taught[level] = new Set();
  usedWords[level] = new Set();
  usedSentences[level] = new Set();
  for (const q of questionBank[level]) {
    const flat = (q.tokens ?? []).map((t) => (typeof t === 'string' ? t : t.kanji)).join('');
    if (flat) usedSentences[level].add(flat);
    for (const t of q.tokens ?? []) {
      if (typeof t !== 'object') continue;
      usedWords[level].add(t.kanji);
      for (const ch of t.kanji) if (KANJI_RE.test(ch)) taught[level].add(ch);
    }
  }
}
const mainBank = JSON.parse(await readFile(path.join(root, 'app', 'kanji-bank.json'), 'utf8'));
for (const [level, lv] of Object.entries(mainBank)) for (const e of [...lv.reading, ...lv.orthography]) usedSentences[level].add(e.sentence);

// Neighbour readings for distractors come from the JLPT list, as in the main build.
const byKanji = new Map();
for (const w of Object.keys(vocab)) {
  if (!KANJI_RE.test(w)) continue;
  for (const ch of w) { if (!byKanji.has(ch)) byKanji.set(ch, []); byKanji.get(ch).push(w); }
}

// Every common JMdict word, with one sense-bound reading and its own carriers.
const candidates = new Map();   // kanji -> [{word, reading, readings, carriers, common}]
for (const entry of words) {
  const allKana = (entry.kana ?? []).filter(realKana).map((k) => k.text);
  for (const k of entry.kanji ?? []) {
    const word = k.text;
    if (!KANJI_RE.test(word) || word.length > 4) continue;
    if (!k.common || !realKanji(k)) continue;   // rare spellings make poor teaching words
    const valid = new Set(allKana.filter((kana) => {
      const ka = (entry.kana ?? []).find((x) => x.text === kana);
      return ka.appliesToKanji?.includes('*') || ka.appliesToKanji?.includes(word);
    }));
    if (valid.size !== 1) continue;   // two readings ⇒ two right answers
    const reading = [...valid][0];
    const carriers = [];
    for (const sense of entry.sense ?? []) {
      if (!(sense.appliesToKanji?.includes('*') || sense.appliesToKanji?.includes(word))) continue;
      for (const ex of sense.examples ?? []) for (const s of ex.sentences ?? []) {
        if (s.lang === 'jpn' && s.text.includes(word)) carriers.push(s.text);
      }
    }
    if (!carriers.length) continue;
    for (const ch of new Set(word)) {
      if (!levelOf.has(ch)) continue;
      if (!candidates.has(ch)) candidates.set(ch, []);
      candidates.get(ch).push({ word, reading, readings: valid, carriers });
    }
  }
}

// Second source. JMdict attaches example sentences to only a small share of
// words — 松 and 熊 have none — but the dump carries the whole linked Tatoeba
// corpus. A sentence can stand in for a word it was not filed under only when
// the reading cannot be in doubt, so this is limited to surfaces with exactly one
// reading across every JMdict entry, and to sentences where the word stands
// alone: no kanji directly before or after it, which rules out 松 inside 浜松
// or 松竹, whose readings differ.
const surfaceReadings = new Map();
const isCommon = new Set();
for (const entry of words) {
  for (const k of entry.kanji ?? []) {
    if (k.common && realKanji(k)) isCommon.add(k.text);
    for (const kana of entry.kana ?? []) {
      if (!realKana(kana)) continue;
      if (!(kana.appliesToKanji?.includes('*') || kana.appliesToKanji?.includes(k.text))) continue;
      if (!surfaceReadings.has(k.text)) surfaceReadings.set(k.text, new Set());
      surfaceReadings.get(k.text).add(kana.text);
    }
  }
}
// Every reading JMdict lists for a spelling, marginal ones included. A marginal
// reading does not make a word ambiguous, but it is still no fit distractor.
const everyReading = new Map();
for (const entry of words) for (const k of entry.kanji ?? []) for (const kana of entry.kana ?? []) {
  if (!(kana.appliesToKanji?.includes('*') || kana.appliesToKanji?.includes(k.text))) continue;
  if (!everyReading.has(k.text)) everyReading.set(k.text, new Set());
  everyReading.get(k.text).add(kana.text);
}
const corpusByKanji = new Map();
{
  const seen = new Set();
  for (const entry of words) for (const sense of entry.sense ?? []) for (const ex of sense.examples ?? []) {
    for (const s of ex.sentences ?? []) {
      if (s.lang !== 'jpn' || seen.has(s.text)) continue;
      seen.add(s.text);
      for (const ch of new Set(s.text)) {
        if (!KANJI_RE.test(ch)) continue;
        if (!corpusByKanji.has(ch)) corpusByKanji.set(ch, []);
        corpusByKanji.get(ch).push(s.text);
      }
    }
  }
}
const standsAlone = (sentence, word) => {
  let at = sentence.indexOf(word);
  while (at !== -1) {
    const before = sentence[at - 1] ?? '';
    const after = sentence[at + word.length] ?? '';
    if (!KANJI_RE.test(before) && !KANJI_RE.test(after) && before !== '々' && after !== '々') return true;
    at = sentence.indexOf(word, at + 1);
  }
  return false;
};
for (const [word, readings] of surfaceReadings) {
  if (readings.size !== 1 || !isCommon.has(word) || word.length > 3) continue;
  const reading = [...readings][0];
  for (const ch of new Set(word)) {
    if (!levelOf.has(ch)) continue;
    const pool = (corpusByKanji.get(ch) ?? []).filter((t) => t.includes(word) && standsAlone(t, word));
    if (!pool.length) continue;
    if (!candidates.has(ch)) candidates.set(ch, []);
    if (candidates.get(ch).some((c) => c.word === word)) continue;
    candidates.get(ch).push({ word, reading, readings, carriers: pool, corpus: true });
  }
}

const out = { N5: [], N4: [], N3: [], N2: [], N1: [] };

const report = [];
for (const level of [5, 4, 3, 2, 1]) {
  const name = `N${level}`;
  const missing = [...levelOf].filter(([ch, l]) => l === level && !taught[name].has(ch)).map(([ch]) => ch);
  for (const ch of missing) {
    // Prefer short words whose other kanji are no harder than this level.
    const options = (candidates.get(ch) ?? [])
      .filter((c) => !usedWords[name].has(c.word) && [...c.word].every((x) => !KANJI_RE.test(x) || !levelOf.has(x) || levelOf.get(x) >= level))
      .sort((a, b) => Number(!!a.corpus) - Number(!!b.corpus) || a.word.length - b.word.length || b.carriers.length - a.carriers.length);
    for (const option of options) {
      const carrier = option.carriers.filter((t) => carrierOk(t, level) && !usedSentences[name].has(t)).sort((a, b) => a.length - b.length)[0];
      if (!carrier) continue;
      // Exclude every reading the spelling has in any JMdict entry, not just the
      // entry this item came from: 縁 is ふち here, but へり and ゆかり are also
      // readings of 縁, and へり would be right in the same sentence.
      const anyReading = new Set([...option.readings, ...(everyReading.get(option.word) ?? [])]);
      const distractors = distractorsFor(option.word, option.reading, anyReading, kanji, byKanji, vocab);
      if (distractors.length < 3) continue;
      usedWords[name].add(option.word);
      usedSentences[name].add(carrier);
      out[name].push({ word: option.word, reading: option.reading, distractors, sentence: carrier });
      for (const x of option.word) taught[name].add(x);
      break;
    }
  }
  const list = [...levelOf.values()].filter((l) => l === level).length;
  const now = [...levelOf].filter(([ch, l]) => l === level && taught[name].has(ch)).length;
  report.push({ level: name, missingBefore: missing.length, added: out[name].length, coverage: `${now}/${list} = ${Math.round((now / list) * 100)}%` });
}
await writeFile(path.join(root, 'app', 'kanji-extra.json'), `${JSON.stringify(out)}\n`);
console.table(report);
