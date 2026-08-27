#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

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
};

const result = Object.fromEntries(
  [...scored.entries(), ...Object.entries(overrides).map(([word, reading]) => [word, { reading, score: 99 }])]
    .map(([word, value]) => [word, value.reading])
    .sort(([a], [b]) => b.length - a.length || a.localeCompare(b, 'ja')),
);

fs.writeFileSync(outputPath, `${JSON.stringify(result)}\n`);
console.log(`${path.relative(root, outputPath)}: ${Object.keys(result).length} readings`);
