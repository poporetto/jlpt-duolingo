#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { forms } from './conjugate.mjs';

const root = process.cwd();
const dictionaryPath = path.join(root, '.data-cache/jmdict-examples-eng-3.6.2.json');
const appPath = path.join(root, 'app');
const outputPath = path.join(appPath, 'furigana-map.json');

if (!fs.existsSync(dictionaryPath)) {
  throw new Error(`JMdict cache not found: ${dictionaryPath}`);
}

const sourceFiles = fs.readdirSync(appPath)
  .filter((name) => /\.(?:ts|tsx|json)$/.test(name) && name !== 'furigana-map.json');
const source = sourceFiles.map((name) => fs.readFileSync(path.join(appPath, name), 'utf8')).join('\n');
const japaneseRuns = source.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々〆ヶー]+/gu) ?? [];
const candidates = new Set();

for (const run of japaneseRuns) {
  for (let start = 0; start < run.length; start += 1) {
    for (let length = 1; length <= Math.min(24, run.length - start); length += 1) {
      const text = run.slice(start, start + length);
      if (/\p{Script=Han}/u.test(text)) candidates.add(text);
    }
  }
}

const { words } = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));
const scored = new Map();

for (const entry of words) {
  for (const spelling of entry.kanji) {
    if (!candidates.has(spelling.text)) continue;
    const readings = entry.kana.filter((kana) =>
      kana.appliesToKanji.includes('*') || kana.appliesToKanji.includes(spelling.text));
    for (const reading of readings) {
      const score = (spelling.common ? 2 : 0) + (reading.common ? 1 : 0);
      const previous = scored.get(spelling.text);
      if (!previous || score > previous.score) scored.set(spelling.text, { reading: reading.text, score });
    }
  }
}

// Inflected forms. JMdict lists 飲む, not 飲んで or 飲み, so a conjugated verb in
// running text found no entry, and the matcher fell back to the bare kanji's
// on-reading — 飲んで came out as いん, 来ます as らい. Generate each verb's and
// い-adjective's common forms, conjugate the reading the same way, and keep the
// ones that actually occur in the app's text. Where two verbs share a spelling
// in some form (行った is both いった and おこなった) the form is ambiguous and is
// recorded only if a phrase override settles it.
const inflected = new Map();
const ambiguous = new Set();
// Tie-break between two verbs that share a form: the one the JLPT list teaches
// earlier is the everyday reading (開ける is あける at N5, ひらける much later).
const vocabList = JSON.parse(fs.readFileSync(path.join(root, '.data-cache/vocab.json'), 'utf8'));
const jlptRank = (spelling, reading) => {
  const hit = (vocabList[spelling] ?? []).find((e) => e.reading === reading);
  return hit ? hit.level : 0;   // 5 = N5 = earliest; 0 = not on the list
};
const addForm = (surface, reading, score, entryId, rank) => {
  if (!candidates.has(surface) || surface === reading) return;
  const prev = inflected.get(surface);
  if (prev && prev.reading !== reading) {
    // Within one entry JMdict lists the usual reading first (いう before ゆう).
    if (prev.entryId === entryId) return;
    if (rank !== prev.rank) { if (rank > prev.rank) inflected.set(surface, { reading, score, entryId, rank }); return; }
    if (score > prev.score) inflected.set(surface, { reading, score, entryId, rank });
    else if (score === prev.score) ambiguous.add(surface);
    return;
  }
  if (!prev || score > prev.score) inflected.set(surface, { reading, score, entryId, rank });
};
const CLASSES = ['v5u', 'v5k', 'v5k-s', 'v5g', 'v5s', 'v5t', 'v5n', 'v5b', 'v5m', 'v5r', 'v1', 'adj-i'];
for (const entry of words) {
  const pos = new Set(entry.sense.flatMap((sense) => sense.partOfSpeech));
  const cls = CLASSES.find((c) => pos.has(c));
  const irregularKuru = pos.has('vk');
  if (!cls && !irregularKuru) continue;
  for (const spelling of entry.kanji) {
    for (const kana of entry.kana) {
      if (!(kana.appliesToKanji.includes('*') || kana.appliesToKanji.includes(spelling.text))) continue;
      if ((kana.tags ?? []).some((t) => ['ik', 'ok', 'rk', 'sk'].includes(t))) continue;
      const score = (spelling.common ? 2 : 0) + (kana.common ? 1 : 0);
      if (irregularKuru) {
        // 来る: き in ます/た/て forms, こ before ない — no regular class covers it.
        if (!spelling.text.endsWith('る') || !kana.text.endsWith('くる')) continue;
        const k = spelling.text.slice(0, -1);
        const r = kana.text.slice(0, -2);
        for (const [tail, rt] of [['ます', 'きます'], ['ました', 'きました'], ['ません', 'きません'], ['て', 'きて'], ['た', 'きた'], ['ない', 'こない'], ['なかった', 'こなかった'], ['られる', 'こられる']]) {
          addForm(k + tail, r + rt, score, entry.id, jlptRank(spelling.text, kana.text));
        }
        continue;
      }
      const surf = forms(spelling.text, cls);
      const read = forms(kana.text, cls);
      if (!surf || !read) continue;
      // potential (学べる, 楽しめる), conditional (書けば) and volitional (行こう)
      if (cls !== 'adj-i') {
        const extra = (w) => {
          if (cls === 'v1') { const st = w.slice(0, -1); return [st + 'られる', st + 'れば', st + 'よう', st + 'られない', st + 'られた']; }
          const E = { う: 'え', く: 'け', ぐ: 'げ', す: 'せ', つ: 'て', ぬ: 'ね', ぶ: 'べ', む: 'め', る: 'れ' };
          const O = { う: 'お', く: 'こ', ぐ: 'ご', す: 'そ', つ: 'と', ぬ: 'の', ぶ: 'ぼ', む: 'も', る: 'ろ' };
          const st = w.slice(0, -1), last = w.slice(-1);
          if (!E[last]) return [];
          return [st + E[last] + 'る', st + E[last] + 'ば', st + O[last] + 'う', st + E[last] + 'ない', st + E[last] + 'た'];
        };
        const sx = extra(spelling.text), rx = extra(kana.text);
        sx.forEach((form, i) => { if (rx[i]) addForm(form, rx[i], score, entry.id, jlptRank(spelling.text, kana.text)); });
      }
      const rank = jlptRank(spelling.text, kana.text);
      for (const key of Object.keys(surf)) if (read[key]) addForm(surf[key], read[key], score, entry.id, rank);
      // the bare stems, which precede ながら, たい, に行く and ず
      if (cls !== 'adj-i' && surf.masu && read.masu) addForm(surf.masu.slice(0, -2), read.masu.slice(0, -2), score, entry.id, rank);
      if (cls !== 'adj-i' && surf.nai && read.nai) addForm(surf.nai.slice(0, -2), read.nai.slice(0, -2), score, entry.id, rank);
    }
  }
}
for (const surface of ambiguous) inflected.delete(surface);
for (const [surface, value] of inflected) {
  const base = scored.get(surface);
  // JMdict also has rare headwords spelled like a verb form (降って くだって, an
  // idiom); a form of a verb on the JLPT list is the reading text actually means.
  if (!base || (value.rank > 0 && base.score < 2)) scored.set(surface, value);
}
// A genuinely ambiguous form (止めて is とめて or やめて, both N4) gets an empty
// reading: FuriganaText then prints it bare. Without this the matcher falls back
// to the lone kanji, whose reading is usually an on-reading that is plainly wrong.
for (const surface of ambiguous) {
  const base = scored.get(surface);
  if (!base || base.score < 2) scored.set(surface, { reading: '', score: 0 });
}
console.log(`inflected forms added: ${inflected.size}; left out as ambiguous: ${ambiguous.size} (${[...ambiguous].slice(0, 12).join('、')})`);

// High-frequency JLPT instruction forms whose inflection is not itself a JMdict
// headword. These are deliberately phrase-level so the reading stays contextual.
const overrides = {
  '選んでください': 'えらんでください',
  '選んで': 'えらんで',
  '聞いてください': 'きいてください',
  '聞いて': 'きいて',
  '答えてください': 'こたえてください',
  '書いてください': 'かいてください',
  '読んでください': 'よんでください',
  '話を聞いてください': 'はなしをきいてください',
  '言葉': 'ことば',
  '読み方': 'よみかた',
  '書き方': 'かきかた',
  '最も': 'もっとも',
  '一番': 'いちばん',
  // A lone kanji is matched only when no longer word fits. JMdict's single-kanji
  // headwords give readings that are right inside compounds but wrong alone:
  // 人 as じん, 本 as もと, 前 as ぜん. These are the readings it has standing alone.
  '人': 'ひと',
  '本': 'ほん',
  '前': 'まえ',
  // ...and some have no safe default at all (大 だい/おお, 間 あいだ/ま/かん):
  // better bare than wrong.
  '大': '',
  '間': '',
  '為': '',
  '空': 'そら',
  // Headwords whose dictionary reading is not the one running text means:
  // 今日は is the greeting こんにちは in JMdict, 彼の the archaic あの.
  '今日は': 'きょうは',
  '彼の': 'かれの',
};

// Kana-row names (な行, か行) begin with a kana, so the matcher tries them at
// every な followed by 行 and turns 「ような行為」 into な行＋為. Never wanted.
for (const word of [...scored.keys()]) if (/^[ぁ-んァ-ン]行$/.test(word)) scored.delete(word);

const result = Object.fromEntries(
  [...scored.entries(), ...Object.entries(overrides).map(([word, reading]) => [word, { reading, score: 99 }])]
    .map(([word, value]) => [word, value.reading])
    .sort(([a], [b]) => b.length - a.length || a.localeCompare(b, 'ja')),
);

fs.writeFileSync(outputPath, `${JSON.stringify(result)}\n`);
console.log(`${path.relative(root, outputPath)}: ${Object.keys(result).length} readings`);
