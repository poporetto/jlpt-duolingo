#!/usr/bin/env node
/**
 * Builds app/kanji-bank.json — the 漢字読み / 表記 item pool.
 *
 *   node scripts/build-kanji-bank.mjs
 *
 * Every carrier sentence is a real, human-written Tatoeba sentence pulled through
 * JMdict. Nothing here fabricates Japanese: that is the whole point, because
 * generated carrier sentences are what made the previous 表記 items worthless.
 *
 * Sources (all cached under .data-cache/, none committed):
 *   - KANJIDIC via davidluzgouveia/kanji-data — stroke/grade/freq + JLPT levels
 *   - JLPT N1–N5 word + kanji lists from Jonathan Waller's tanos.co.uk, via
 *     Bluskyo/JLPT_Vocabulary (MIT). No official list exists: 出題基準 has been
 *     非公開 since the 2010 revision, so this is the community reference.
 *   - JMdict + Tatoeba example sentences via scriptin/jmdict-simplified
 */
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, '.data-cache');

const JMDICT_TAG = '3.6.2+20260824122934';
const SOURCES = {
  'kanji.json': 'https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json',
  'vocab.json': 'https://raw.githubusercontent.com/Bluskyo/JLPT_Vocabulary/main/data/vocab/results/JLPT_vocab_ALL.json',
};

/* ---------- Japanese phonology ---------- */
const VOICE = { か:'が', き:'ぎ', く:'ぐ', け:'げ', こ:'ご', さ:'ざ', し:'じ', す:'ず', せ:'ぜ', そ:'ぞ', た:'だ', ち:'ぢ', つ:'づ', て:'で', と:'ど', は:'ば', ひ:'び', ふ:'ぶ', へ:'べ', ほ:'ぼ' };
const UNVOICE = Object.fromEntries(Object.entries(VOICE).map(([a, b]) => [b, a]));
const HANDAKU = { は:'ぱ', ひ:'ぴ', ふ:'ぷ', へ:'ぺ', ほ:'ぽ' };
const OROW = new Set(['お','こ','そ','と','の','ほ','も','よ','ろ','ご','ぞ','ど','ぼ','ぽ']);
const EROW = new Set(['え','け','せ','て','ね','へ','め','れ','げ','ぜ','で','べ','ぺ']);
const SMALL = new Set('ゃゅょ');
const YOUON_BASE = new Set('きしちにひみりぎじびぴ');
const GEMOK = new Set('かきくけこさしすせそたちつてとはひふへほぱぴぷぺぽ');
const KANJI_RE = /[一-鿿]/;

/** Reject anything Japanese phonotactics disallows — an impossible string is a giveaway. */
function legal(r) {
  // Hiragana only: a katakana option (シリング, from an ateji reading) is a
  // giveaway in a list of readings.
  if (!/^[ぁ-ん]+$/.test(r ?? '')) return false;
  if (SMALL.has(r[0]) || r[0] === 'っ' || r[0] === 'ん') return false;
  for (let i = 0; i < r.length; i += 1) {
    const prev = i ? r[i - 1] : '';
    if (SMALL.has(r[i]) && !YOUON_BASE.has(prev)) return false;
    // ゅう and ょう are everyday long vowels; ゃう is pre-1946 spelling only.
    if (r[i] === 'ゃ' && r[i + 1] === 'う') return false;
    if (SMALL.has(r[i]) && SMALL.has(r[i + 1])) return false;
    if (r[i] === 'っ' && (i === r.length - 1 || !GEMOK.has(r[i + 1]) || prev === 'っ')) return false;
  }
  return true;
}

const cleanReading = (r) => r.split('.')[0].replace(/-/g, '').trim();
const readingsOf = (entry, kind) => [...new Set((entry?.[`readings_${kind}`] ?? []).map(cleanReading))].filter(Boolean);

/** Swap one character's reading for another of its own — but never mix 音 and 訓
 *  inside a compound, which is not how Japanese words are read. */
function registerOf(word, correct, kanji) {
  for (const kind of ['on', 'kun']) {
    const per = [...word].map((ch) => readingsOf(kanji[ch], kind));
    if (!per.every((list) => list.length)) continue;
    let combos = [''];
    for (const list of per) combos = combos.flatMap((prefix) => list.map((r) => prefix + r));
    if (combos.includes(correct)) return kind;
  }
  return null;
}

function alternateReadings(word, correct, kanji) {
  for (const kind of ['on', 'kun']) {
    const per = [...word].map((ch) => readingsOf(kanji[ch], kind));
    if (!per.every((list) => list.length)) continue;
    let combos = [''];
    for (const list of per) combos = combos.flatMap((prefix) => list.map((r) => prefix + r));
    if (!combos.includes(correct)) continue;
    return combos
      .filter((c) => c !== correct && c.length > 1 && c.length <= correct.length + 2)
      .sort((a, b) => Math.abs(a.length - correct.length) - Math.abs(b.length - correct.length));
  }
  return [];
}

function voicingVariants(r, register) {
  const out = [];
  // Native (kun) words never begin with a rendaku'd or handakuten mora, so a
  // word-initial swap there is discarded on sight. On-yomi compounds are different:
  // 大 really is both たい and だい, so 大学 → たいがく is a genuine trap.
  for (let i = register === 'on' ? 0 : 1; i < r.length; i += 1) {
    for (const map of [VOICE, UNVOICE, HANDAKU]) {
      if (map[r[i]]) out.push(r.slice(0, i) + map[r[i]] + r.slice(i + 1));
    }
  }
  return out;
}

function lengthVariants(r) {
  const out = [];
  for (let i = 0; i < r.length; i += 1) {
    const next = r[i + 1] ?? '';
    if (SMALL.has(next) || next === 'ん') continue;
    if (OROW.has(r[i]) && next !== 'う') out.push(`${r.slice(0, i + 1)}う${r.slice(i + 1)}`);
    if (EROW.has(r[i]) && next !== 'い') out.push(`${r.slice(0, i + 1)}い${r.slice(i + 1)}`);
    if (r[i] === 'う' && i > 0 && OROW.has(r[i - 1]) && r.length > 2) out.push(r.slice(0, i) + r.slice(i + 1));
    if (r[i] === 'い' && i > 0 && EROW.has(r[i - 1]) && r.length > 2) out.push(r.slice(0, i) + r.slice(i + 1));
  }
  return out;
}

/** Three distractors, best class first. A distractor that is itself a valid reading
 *  of the word would make the item have two right answers, so those are excluded. */
/** っ before an unvoiced obstruent — 質素 しっそ vs しそ is a staple exam trap. */
function geminationVariants(r, register) {
  if (register !== 'on') return [];
  const out = [];
  for (let i = 1; i < r.length; i += 1) {
    if (GEMOK.has(r[i]) && r[i - 1] !== 'っ' && r[i - 1] !== 'ん') out.push(`${r.slice(0, i)}っ${r.slice(i)}`);
  }
  if (r.includes('っ')) out.push(r.replace('っ', ''));
  return out;
}

/** Swapping the small kana in a digraph: しょう vs しゅう vs しゃう. */
function youonVariants(r) {
  const out = [];
  for (let i = 0; i < r.length; i += 1) {
    if (!SMALL.has(r[i])) continue;
    for (const swap of SMALL) {
      if (swap !== r[i]) out.push(r.slice(0, i) + swap + r.slice(i + 1));
    }
  }
  return out;
}

/** Same consonant, different vowel — a standard 訓読み slip (たけ / たか / たき). */
function vowelVariants(r) {
  const ROWS = ['あいうえお', 'かきくけこ', 'がぎぐげご', 'さしすせそ', 'ざじずぜぞ', 'たちつてと', 'だぢづでど',
    'なにぬねの', 'はひふへほ', 'ばびぶべぼ', 'ぱぴぷぺぽ', 'まみむめも', 'らりるれろ'];
  const out = [];
  for (let i = 0; i < r.length; i += 1) {
    if (SMALL.has(r[i + 1])) continue;   // don't break a digraph
    const row = ROWS.find((set) => set.includes(r[i]));
    if (!row) continue;
    for (const swap of row) if (swap !== r[i]) out.push(r.slice(0, i) + swap + r.slice(i + 1));
  }
  return out;
}

/**
 * Last resort: the real reading of another word that shares a kanji with this
 * one. A learner who mixes up 経済 and 経営 would pick けいえい, so this is a true
 * near-miss — unlike an unrelated word of the same length, which is what the
 * generated bank used to do and which anyone discards on sight.
 */
function neighbourReadings(word, reading, byKanji, vocab) {
  const out = [];
  for (const ch of word) {
    for (const other of byKanji.get(ch) ?? []) {
      if (other === word) continue;
      const entries = vocab[other];
      if (entries.length !== 1) continue;
      const candidate = entries[0].reading;
      if (Math.abs(candidate.length - reading.length) <= 1) out.push(candidate);
    }
  }
  return out.sort((a, b) => Math.abs(a.length - reading.length) - Math.abs(b.length - reading.length));
}

function distractorsFor(word, reading, validReadings, kanji, byKanji, vocab) {
  const seen = new Set();
  const out = [];
  const register = registerOf(word, reading, kanji);
  const groups = [
    alternateReadings(word, reading, kanji),
    voicingVariants(reading, register),
    lengthVariants(reading),
    geminationVariants(reading, register),
    youonVariants(reading),
    vowelVariants(reading),
    neighbourReadings(word, reading, byKanji, vocab),
  ];
  for (const group of groups) {
    for (const v of group) {
      if (validReadings.has(v) || v === reading || seen.has(v) || !legal(v)) continue;
      seen.add(v);
      out.push(v);
      if (out.length >= 3) return out;
    }
  }
  return out;
}

async function download(name, url) {
  const file = path.join(cache, name);
  try { await stat(file); return file; } catch { /* not cached yet */ }
  process.stdout.write(`  fetching ${name}…\n`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  await pipeline(res.body, createWriteStream(file));
  return file;
}

async function jmdictExamples() {
  const json = path.join(cache, `jmdict-examples-eng-${JMDICT_TAG.split('+')[0]}.json`);
  try { await stat(json); return json; } catch { /* not extracted yet */ }
  const zip = await download('jmdict-examples.zip',
    `https://github.com/scriptin/jmdict-simplified/releases/download/${encodeURIComponent(JMDICT_TAG)}/jmdict-examples-eng-${JMDICT_TAG}.json.zip`);
  process.stdout.write('  extracting jmdict-examples…\n');
  await run('unzip', ['-o', '-q', zip, '-d', cache]);
  return json;
}

async function main() {
  await mkdir(cache, { recursive: true });
  const [kanjiFile, vocabFile] = await Promise.all(Object.entries(SOURCES).map(([n, u]) => download(n, u)));
  const examplesFile = await jmdictExamples();

  const kanji = JSON.parse(await readFile(kanjiFile, 'utf8'));
  const vocab = JSON.parse(await readFile(vocabFile, 'utf8'));
  process.stdout.write('  reading jmdict-examples (123 MB)…\n');
  const { words } = JSON.parse(await readFile(examplesFile, 'utf8'));

  const levelOf = new Map();
  for (const [ch, data] of Object.entries(kanji)) if (data.jlpt_new) levelOf.set(ch, data.jlpt_new);

  // Collect example sentences that contain the exact surface form. An inflected
  // hit ("見込んでいる" for 見込む) can't be underlined, so it is no use here.
  const byKanji = new Map();
  for (const w of Object.keys(vocab)) {
    if (!KANJI_RE.test(w)) continue;
    for (const ch of w) {
      if (!byKanji.has(ch)) byKanji.set(ch, []);
      byKanji.get(ch).push(w);
    }
  }

  const sentences = new Map();
  for (const entry of words) {
    const surfaces = (entry.kanji ?? []).map((k) => k.text).filter((t) => vocab[t]);
    if (!surfaces.length) continue;
    const found = [];
    for (const sense of entry.sense ?? []) {
      for (const ex of sense.examples ?? []) {
        for (const s of ex.sentences ?? []) if (s.lang === 'jpn') found.push(s.text);
      }
    }
    for (const w of surfaces) {
      for (const text of found) {
        if (!text.includes(w)) continue;
        if (!sentences.has(w)) sentences.set(w, []);
        sentences.get(w).push(text);
      }
    }
  }

  /** A carrier may not be harder than the item: reject sentences containing kanji
   *  more than one level above, or that run too long to read at a glance. */
  // Sentence length has to scale with the level. A single 42-character cap was
  // sized for N5 and then applied to N1 as well, where it was the *only* filter
  // still doing anything — the kanji-difficulty clause is vacuous at the top two
  // levels, since nothing sits above them.
  const maxCarrier = { 5: 42, 4: 50, 3: 64, 2: 80, 1: 96 };
  const carrierOk = (text, level) => text.length <= (maxCarrier[level] ?? 42) &&
    [...text].every((ch) => !KANJI_RE.test(ch) || !levelOf.has(ch) || levelOf.get(ch) >= level - 2);

  // Build every usable item once, keyed by the word.
  const items = [];
  for (const [word, entries] of Object.entries(vocab)) {
    if (!KANJI_RE.test(word) || entries.length !== 1) continue;   // multi-reading ⇒ two right answers
    const { reading, level } = entries[0];
    const distractors = distractorsFor(word, reading, new Set(entries.map((e) => e.reading)), kanji, byKanji, vocab);
    if (distractors.length < 3) continue;
    const carriers = (sentences.get(word) ?? []).sort((a, b) => a.length - b.length);
    if (!carriers.length) continue;
    items.push({ word, reading, distractors, carriers, wordLevel: level });
  }

  // An item belongs to the level of the kanji it teaches, not the level of the word:
  // most N5 kanji only ever appear inside words above N5, so filing by word level
  // leaves the easy kanji uncovered. For each kanji take the easiest word that
  // contains it (5 = N5 = easiest) and whose carrier sentence suits that level.
  const out = {};
  const stats = [];
  const used = new Set();
  const taughtBy = new Map();
  const byLevel = { 1: [], 2: [], 3: [], 4: [], 5: [] };

  for (const [ch, level] of levelOf) {
    const options = items
      .filter((it) => it.word.includes(ch))
      .sort((a, b) => b.wordLevel - a.wordLevel || a.word.length - b.word.length);
    for (const option of options) {
      const carrier = option.carriers.find((t) => carrierOk(t, level));
      if (!carrier) continue;
      // One word can teach several kanji at once (学校 covers both 学 and 校),
      // so record the coverage but only emit the item the first time.
      taughtBy.set(ch, option.word);
      if (!used.has(option.word)) {
        used.add(option.word);
        byLevel[level].push({ word: option.word, reading: option.reading, distractors: option.distractors, sentence: carrier });
      }
      break;
    }
  }

  // Top up each level towards one item per kanji on its own list.
  //
  // A flat cap here was wrong: it bound N2 (whose kanji are less well served by
  // the reference vocabulary, so coverage alone fell short of it) but not N3
  // (whose coverage already exceeded it). The result was N3 shipping more items
  // than N2 despite being the easier level. Scaling the target to the level's
  // own kanji count keeps the mastery totals ordered by how much there actually
  // is to learn, and is self-limiting because a level can only top up from words
  // that exist.
  const kanjiPerLevel = {};
  for (const level of levelOf.values()) kanjiPerLevel[level] = (kanjiPerLevel[level] ?? 0) + 1;
  for (const level of [5, 4, 3, 2, 1]) {
    const extras = items
      .filter((it) => it.wordLevel === level && !used.has(it.word))
      .map((it) => ({ it, carrier: it.carriers.find((t) => carrierOk(t, level)) }))
      .filter(({ carrier }) => carrier)
      .slice(0, Math.max(0, (kanjiPerLevel[level] ?? 0) - byLevel[level].length));
    for (const { it, carrier } of extras) {
      used.add(it.word);
      byLevel[level].push({ word: it.word, reading: it.reading, distractors: it.distractors, sentence: carrier });
    }
    const inList = [...levelOf.values()].filter((l) => l === level).length;
    const taught = [...taughtBy.keys()].filter((ch) => levelOf.get(ch) === level).length;
    out[`N${level}`] = byLevel[level].map(({ word, reading, distractors, sentence }) => ({ word, reading, distractors, sentence }));
    stats.push({ level: `N${level}`, items: byLevel[level].length, kanjiTaught: taught, inList, pct: `${Math.round((taught / inList) * 100)}%` });
  }

  // 表記 items: same reading, different spelling. Real exam distractors are true
  // homophones (こうえん → 公園/講演/公演), which the vocabulary list gives us directly.
  const byReading = new Map();
  for (const [word, entries] of Object.entries(vocab)) {
    if (!KANJI_RE.test(word)) continue;
    for (const e of entries) {
      if (!byReading.has(e.reading)) byReading.set(e.reading, []);
      byReading.get(e.reading).push(word);
    }
  }
  const sameLength = new Map();
  for (const [word, entries] of Object.entries(vocab)) {
    if (!KANJI_RE.test(word)) continue;
    const n = entries[0].reading.length;
    if (!sameLength.has(n)) sameLength.set(n, []);
    sameLength.get(n).push(word);
  }
  const orthography = {};
  for (const level of [5, 4, 3, 2]) {   // 表記 is N2–N5 only, per jlpt.jp
    const rows = [];
    for (const item of byLevel[level]) {
      const homophones = (byReading.get(item.reading) ?? []).filter((w) => w !== item.word);
      // Failing a true homophone, use real words that share a kanji and have a
      // reading of the same length — near-misses, never unrelated vocabulary.
      const nearMiss = sameLength.get(item.reading.length)?.filter((w) => w !== item.word
        && [...w].some((ch) => item.word.includes(ch))) ?? [];
      const pool = [...new Set([...homophones, ...nearMiss])];
      if (pool.length < 3) continue;
      rows.push({ word: item.word, reading: item.reading, distractors: pool.slice(0, 3), sentence: item.sentence });
    }
    orthography[`N${level}`] = rows;
  }
  const orthoTotal = Object.values(orthography).reduce((a, b) => a + b.length, 0);
  console.log(`表記 items with true homophone distractors: ${orthoTotal}`);
  for (const level of [5, 4, 3, 2, 1]) out[`N${level}`] = { reading: out[`N${level}`], orthography: orthography[`N${level}`] ?? [] };

  await writeFile(path.join(root, 'app', 'kanji-bank.json'), `${JSON.stringify(out)}\n`);
  const bytes = (await stat(path.join(root, 'app', 'kanji-bank.json'))).size;
  console.table(stats);
  console.log(`app/kanji-bank.json — ${Object.values(out).reduce((a, b) => a + b.reading.length + b.orthography.length, 0)} items, ${(bytes / 1024).toFixed(0)} KB`);
}

main().catch((error) => { console.error(error); process.exit(1); });
