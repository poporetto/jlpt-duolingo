#!/usr/bin/env node
/**
 * Extracts, for every JLPT word, the Tatoeba sentences that are bound to one
 * specific JMdict sense and reading — plus that sense's part of speech and
 * glosses. Writes the intermediate .data-cache/vocab-carriers.json so the item
 * builder can iterate without re-parsing the 123 MB jmdict-examples dump.
 *
 * The sense/kana binding is the same discipline build-kanji-bank.mjs uses: a
 * spelling is not a reading, so an example may only be attributed to the word
 * when the sense admits exactly one reading. POS and glosses come along because
 * a 文脈規定 distractor that is a near-synonym of the answer makes two options
 * correct — the glosses are what let the builder rule those out.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, '.data-cache');

const vocab = JSON.parse(await readFile(path.join(cache, 'vocab.json'), 'utf8'));
process.stdout.write('reading jmdict-examples (123 MB)…\n');
const { words } = JSON.parse(await readFile(path.join(cache, 'jmdict-examples-eng-3.6.2.json'), 'utf8'));
process.stdout.write(`  ${words.length} JMdict entries\n`);

/** word -> { reading, level, pos[], gloss[], carriers[] } */
const out = Object.create(null);

for (const entry of words) {
  const surfaces = [
    ...(entry.kanji ?? []).map((k) => k.text),
    ...(entry.kana ?? []).map((k) => k.text),
  ].filter((t) => vocab[t]);
  if (!surfaces.length) continue;

  for (const sense of entry.sense ?? []) {
    const pos = sense.partOfSpeech ?? [];
    const gloss = (sense.gloss ?? []).map((g) => g.text).filter(Boolean);
    for (const word of new Set(surfaces)) {
      const applicable = (entry.kana ?? []).filter((kana) => {
        const toWord = !entry.kanji?.length || kana.appliesToKanji?.includes('*') || kana.appliesToKanji?.includes(word);
        const toSense = sense.appliesToKana?.includes('*') || sense.appliesToKana?.includes(kana.text);
        return toWord && toSense && /^[ぁ-ん]+$/.test(kana.text);
      });
      // A sense admitting two readings cannot prove which one a sentence uses.
      const readings = [...new Set(applicable.map((k) => k.text))];
      if (readings.length !== 1) continue;

      const rec = (out[word] ??= { reading: readings[0], pos: [], gloss: [], carriers: [] });
      if (rec.reading !== readings[0]) continue;   // conflicting readings ⇒ ambiguous word
      for (const p of pos) if (!rec.pos.includes(p)) rec.pos.push(p);
      for (const g of gloss) if (!rec.gloss.includes(g)) rec.gloss.push(g);
      for (const ex of sense.examples ?? []) {
        for (const s of ex.sentences ?? []) {
          if (s.lang !== 'jpn' || !s.text.includes(word)) continue;
          if (!rec.carriers.includes(s.text)) rec.carriers.push(s.text);
        }
      }
    }
  }
}

// attach the JLPT level, and drop words whose list entry is ambiguous
let kept = 0;
for (const [word, rec] of Object.entries(out)) {
  const entries = vocab[word] ?? [];
  if (entries.length !== 1 || entries[0].reading !== rec.reading) { delete out[word]; continue; }
  rec.level = entries[0].level;
  kept += 1;
}
await writeFile(path.join(cache, 'vocab-carriers.json'), JSON.stringify(out));
console.log(`wrote ${kept} words with a single unambiguous reading`);
