#!/usr/bin/env node
/**
 * Builds app/kanji-tables.json — the kanji study tables (漢字表).
 *
 *   node scripts/build-kanji-tables.mjs
 *
 * For every kanji on a level's list: stroke count and meanings (KANJIDIC), the
 * readings that real vocabulary actually uses, and example words with their
 * reading and English. Committed, like the other generated pools, because it
 * needs the JMdict cache that CI does not have.
 *
 * KANJIDIC lists every reading a kanji has ever had — 済 has ten kun readings —
 * so the table shows only readings found in JLPT vocabulary. To know which
 * reading a word uses for which kanji, each word is segmented kanji by kanji
 * against KANJIDIC's readings, allowing the regular sound changes (voicing as
 * in 本棚 ほんだな, gemination as in 学校 がっこう). Words that do not segment
 * cleanly are left out of the counts rather than guessed at.
 *
 * Only KANJIDIC's own fields are used; the WaniKani fields in the same source
 * file are WaniKani's content and are ignored.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { questionBank } from '../app/course-data.ts';
import { COUNTERS, readCounted } from './counters.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, '.data-cache');
const LEVELS = { N2: 2 };          // levels with study material
const PER_TABLE = 20;

const kanji = JSON.parse(await readFile(path.join(cache, 'kanji.json'), 'utf8'));
const vocab = JSON.parse(await readFile(path.join(cache, 'vocab.json'), 'utf8'));
process.stdout.write('reading jmdict-examples (123 MB)…\n');
const { words } = JSON.parse(await readFile(path.join(cache, 'jmdict-examples-eng-3.6.2.json'), 'utf8'));

const KANJI = /[一-鿿々]/;
const VOICE = { か: 'が', き: 'ぎ', く: 'ぐ', け: 'げ', こ: 'ご', さ: 'ざ', し: 'じ', す: 'ず', せ: 'ぜ', そ: 'ぞ', た: 'だ', ち: 'ぢ', つ: 'づ', て: 'で', と: 'ど', は: 'ば', ひ: 'び', ふ: 'ぶ', へ: 'べ', ほ: 'ぼ' };
const HANDAKU = { は: 'ぱ', ひ: 'ぴ', ふ: 'ぷ', へ: 'ぺ', ほ: 'ぽ' };

/** A kanji's readings as [display, base kana][]; on readings are hiragana in the data. */
function readingsOf(ch) {
  const d = kanji[ch];
  if (!d) return [];
  const on = (d.readings_on ?? []).map((r) => r.replace(/[-.]/g, '')).filter(Boolean).map((r) => ({ type: 'on', base: r, display: r }));
  const kun = (d.readings_kun ?? []).map((r) => r.replace(/^-|-$/g, '')).filter(Boolean).map((r) => {
    const [stem, oku = ''] = r.split('.');
    return { type: 'kun', base: stem, okurigana: oku, display: oku ? `${stem}(${oku})` : stem };
  });
  return [...on, ...kun];
}

/** Surface forms a reading may take inside a word. */
function variants(base) {
  const out = new Set([base]);
  const first = base[0];
  if (VOICE[first]) out.add(VOICE[first] + base.slice(1));
  if (HANDAKU[first]) out.add(HANDAKU[first] + base.slice(1));
  const last = base.slice(-1);
  if ('つくちき'.includes(last) && base.length > 1) out.add(base.slice(0, -1) + 'っ');
  for (const v of [...out]) if ('つくちき'.includes(v.slice(-1)) && v.length > 1) out.add(v.slice(0, -1) + 'っ');
  return [...out];
}

/**
 * Split a word's reading across its characters. Returns, per character, the
 * index of the KANJIDIC reading used (null for kana) and the kana it takes, or
 * null if the word does not segment cleanly.
 */
function segment(word, reading) {
  const chars = [...word];
  const memo = new Map();
  const go = (i, pos) => {
    if (i === chars.length) return pos === reading.length ? [] : null;
    const key = `${i}:${pos}`;
    if (memo.has(key)) return memo.get(key);
    let result = null;
    const ch = chars[i];
    if (!KANJI.test(ch)) {
      const k = ch.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
      if (reading.startsWith(k, pos)) { const rest = go(i + 1, pos + k.length); if (rest) result = [{ ri: null, kana: k }, ...rest]; }
    } else {
      const rs = ch === '々' && i > 0 ? readingsOf(chars[i - 1]) : readingsOf(ch);
      outer: for (const [ri, r] of rs.entries()) {
        for (const v of variants(r.base)) {
          if (!reading.startsWith(v, pos)) continue;
          const rest = go(i + 1, pos + v.length);
          if (rest) { result = [{ ri, kana: v }, ...rest]; break outer; }
        }
      }
    }
    memo.set(key, result);
    return result;
  };
  return go(0, 0);
}

const toKatakana = (s) => s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));

/** [start, length, reading] per kanji — the format app/ruby.ts uses. */
function rubyOf(word, seg) {
  const out = [];
  let at = 0;
  [...word].forEach((ch, i) => {
    if (seg[i].ri !== null) out.push([at, ch.length, seg[i].kana]);
    at += ch.length;
  });
  return out;
}

// English gloss for each word (first sense), from JMdict.
const gloss = new Map();
for (const entry of words) {
  const g = entry.sense?.[0]?.gloss?.map((x) => x.text).slice(0, 2).join('; ');
  if (!g) continue;
  for (const k of entry.kanji ?? []) if (!gloss.has(k.text)) gloss.set(k.text, g);
}

// Kana readings JMdict marks common, per kanji spelling.
const commonKana = new Map();
for (const entry of words) for (const k of entry.kanji ?? []) {
  for (const kana of entry.kana ?? []) {
    if (!kana.common || !(kana.appliesToKanji?.includes('*') || kana.appliesToKanji?.includes(k.text))) continue;
    if (!commonKana.has(k.text)) commonKana.set(k.text, new Set());
    commonKana.get(k.text).add(kana.text);
  }
}

const out = {};
const report = [];
for (const [name, lv] of Object.entries(LEVELS)) {
  // Words the level's bank actually tests, which make the best examples.
  const tested = new Set();
  for (const q of questionBank[name]) {
    if (q.type !== 'KANJI' && q.itemType !== 'Contextual vocabulary') continue;
    const target = (q.tokens ?? []).find((t) => typeof t === 'object' && t.target);
    if (target) tested.add(target.kanji);
    tested.add(q.options[q.answer ?? 0]);
  }
  // Candidate words, best first: JLPT vocabulary at this level or easier (every
  // listed reading — segmentation decides which one fits), then harder JLPT
  // words, then common JMdict words, which fill in counters (冊, 匹) and the
  // single-kanji words the list leaves out (玉, 仏).
  const candidates = [];
  const have = new Set();
  for (const [w, es] of Object.entries(vocab)) {
    if (!KANJI.test(w)) continue;
    // The JLPT list gives every reading a word has (傾く かたむく and かたぶく).
    // Keep the ones JMdict marks common for this spelling, or the first listed
    // if none is, so a variant reading never surfaces as one to learn.
    const common = commonKana.get(w);
    const keep = es.filter((e) => common?.has(e.reading));
    for (const e of keep.length ? keep : es.slice(0, 1)) {
      have.add(`${w}|${e.reading}`);
      candidates.push({ word: w, reading: e.reading, rank: e.level >= lv ? e.level : e.level - 5, tested: tested.has(w) });
    }
  }
  for (const entry of words) for (const k of entry.kanji ?? []) {
    if (!k.common || k.text.length > 4 || !KANJI.test(k.text)) continue;
    for (const kana of entry.kana ?? []) {
      if (!kana.common || !(kana.appliesToKanji?.includes('*') || kana.appliesToKanji?.includes(k.text))) continue;
      if (have.has(`${k.text}|${kana.text}`)) continue;
      have.add(`${k.text}|${kana.text}`);
      candidates.push({ word: k.text, reading: kana.text, rank: -10, tested: tested.has(k.text) });
    }
  }

  // Counters: JMdict rarely marks 一軒 common, so the counter reading (けん)
  // would otherwise be missed. The counter rules give the reading, and counter
  // use is JLPT material, so it counts as attested like a listed word.
  for (const counter of COUNTERS) {
    const word = `一${counter}`;
    const reading = readCounted('一', counter);
    if (!KANJI.test(counter) || !reading) continue;
    const listed = candidates.find((c) => c.word === word && c.reading === reading);
    if (listed) listed.rank = Math.max(listed.rank, -6);
    else candidates.push({ word, reading, rank: -6, tested: tested.has(word) });
  }

  const list = Object.entries(kanji)
    .filter(([, d]) => d.jlpt_new === lv)
    .sort((a, b) => (a[1].freq ?? 9999) - (b[1].freq ?? 9999))
    .map(([ch]) => ch);

  const entries = [];
  for (const ch of list) {
    const rs = readingsOf(ch);
    const uses = rs.map(() => []);
    for (const c of candidates) {
      if (!c.word.includes(ch)) continue;
      const seg = segment(c.word, c.reading);
      if (!seg) continue;
      [...c.word].forEach((x, i) => { if (x === ch && seg[i].ri !== null) uses[seg[i].ri].push({ ...c, seg }); });
    }
    // A reading is shown if real words use it; readings attested only by
    // obscure words are dropped, so 済 shows さい and す(む), not ten readings.
    const used = rs.map((r, i) => ({ ...r, words: uses[i], jlpt: uses[i].filter((w) => w.rank > -10).length }))
      .filter((r) => r.jlpt > 0 || (r.words.length > 0 && !uses.some((u) => u.some((w) => w.rank > -10))));
    used.sort((a, b) => b.jlpt - a.jlpt || b.words.length - a.words.length);
    // Examples: tested words first, then easier and shorter, covering as many
    // different readings as possible.
    const chosen = [];
    const seen = new Set();
    // A lone kanji read with its on-reading (傾 けい, 仏 ふつ "France") is rarely
    // a word a learner meets, so it is a last resort.
    const lone = (w, r) => (w.word.length === 1 && r.type === 'on' ? 1 : 0);
    const pool = used.map((r) => [...r.words].sort((a, b) => lone(a, r) - lone(b, r) || Number(b.tested) - Number(a.tested) || b.rank - a.rank || a.word.length - b.word.length));
    for (let round = 0; chosen.length < 3 && round < 3; round++) {
      for (const words of pool) {
        const pick = words.find((w) => !seen.has(w.word));
        if (pick && chosen.length < 3) { seen.add(pick.word); chosen.push(pick); }
      }
    }
    // Meanings: KANJIDIC's order is not by usefulness (経 leads with "Sutra"),
    // so meanings that also appear in the examples' glosses go first.
    const exampleText = chosen.map((c) => (gloss.get(c.word) ?? '').toLowerCase()).join(' ');
    const meanings = (kanji[ch].meanings ?? []).map((m) => m.toLowerCase().replace('10**12', 'trillion').replace('10**8', 'hundred million').replace('10**4', 'ten thousand'))
      .map((m, i) => ({ m, score: m.split(/[^a-z]+/).some((w) => w.length > 2 && exampleText.includes(w)) ? -1 : i }))
      .sort((a, b) => a.score - b.score).map((x) => x.m).slice(0, 3);
    entries.push({
      ch,
      strokes: kanji[ch].strokes,
      meanings,
      // On readings in katakana, the way dictionaries and textbooks print them.
      on: used.filter((r) => r.type === 'on').map((r) => toKatakana(r.display)),
      kun: used.filter((r) => r.type === 'kun').map((r) => r.display),
      // Ruby per kanji from the segmentation, so 傾く gets かたむ over 傾 and
      // nothing over the okurigana.
      examples: chosen.map((c) => ({ word: c.word, reading: c.reading, gloss: gloss.get(c.word) ?? '', ruby: rubyOf(c.word, c.seg) })),
    });
  }
  // Tables of about PER_TABLE, split evenly.
  const count = Math.ceil(entries.length / PER_TABLE);
  const base = Math.floor(entries.length / count);
  const extra = entries.length % count;
  let cursor = 0;
  out[name] = Array.from({ length: count }, (_, i) => {
    const size = base + (i < extra ? 1 : 0);
    const table = { id: `${name.toLowerCase()}-kanji-${i + 1}`, kanji: entries.slice(cursor, cursor + size) };
    cursor += size;
    return table;
  });
  report.push({
    level: name, kanji: entries.length, tables: count,
    withExamples: entries.filter((e) => e.examples.length).length,
    noReadings: entries.filter((e) => !e.on.length && !e.kun.length).map((e) => e.ch).join(''),
  });
}
await writeFile(path.join(root, 'app', 'kanji-tables.json'), JSON.stringify(out));
console.table(report);
