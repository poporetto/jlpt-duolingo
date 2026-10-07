#!/usr/bin/env node
/**
 * Writes app/banks/<Level>.ruby.json (and lessons-<Level>.ruby.json) — furigana
 * for every string the app renders, computed by scripts/ruby-annotate.mjs with
 * the sentence as context. See app/ruby.ts for the format.
 *
 * Run by scripts/build-level-banks.mjs; kuromoji is a dev dependency and its
 * dictionary never ships.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { questionBank, levels } from '../app/course-data.ts';
import { grammarLessons } from '../app/grammar-lessons.ts';
import { rubyStringsOf, studyChunks, uniqueInOrder, UI_RUBY_STRINGS } from '../app/ruby.ts';
import { existsSync } from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// CI has no JMdict cache. The annotations are committed, so a build without
// the cache keeps them; the audit fails if they no longer match the text.
if (!existsSync(path.join(root, '.data-cache/jmdict-examples-eng-3.6.2.json'))) {
  console.log('build-ruby: no JMdict cache — keeping the committed furigana annotations');
  process.exit(0);
}
const { annotate, encode, fragmentsInContext } = await import('./ruby-annotate.mjs');

for (const level of levels) {
  const strings = uniqueInOrder([...UI_RUBY_STRINGS, ...questionBank[level].flatMap(rubyStringsOf)]);
  const known = new Map();
  // Token fragments first, read inside their sentence.
  for (const q of questionBank[level]) {
    const rows = [...(q.tokens ? [q.tokens] : []), ...(q.passage ?? [])];
    for (const row of rows) {
      fragmentsInContext(row.map((t) => (typeof t === 'string' ? { text: t, plain: true } : { text: t.kanji, plain: false })), known);
    }
  }
  const encoded = strings.map((s) => encode(known.get(s) ?? annotate(s)));
  await writeFile(path.join(root, 'app', 'banks', `${level}.ruby.json`), JSON.stringify(encoded));
  console.log(`${level}: ${strings.length} strings annotated`);
}

// Lesson text: each example is read whole, markers removed, and its chunks get
// their slices; English explanations are read chunk by chunk.
for (const [level, units] of Object.entries(grammarLessons)) {
  const known = new Map();
  const all = [];
  for (const unit of units) for (const lesson of unit.points) {
    for (const field of [lesson.explanation, lesson.compare ?? '']) all.push(...studyChunks(field));
    for (const ex of lesson.examples) {
      const frags = [];
      const pattern = /［([^］]+)］|\{([^|}]+)\|([^}]+)\}/g;
      const walk = (text) => {
        let last = 0;
        let m;
        const re = new RegExp(pattern.source, 'g');
        while ((m = re.exec(text))) {
          frags.push({ text: text.slice(last, m.index), plain: true });
          if (m[1] !== undefined) walk(m[1]);
          else frags.push({ text: m[2], plain: false });
          last = re.lastIndex;
        }
        frags.push({ text: text.slice(last), plain: true });
      };
      walk(ex.jp);
      fragmentsInContext(frags, known);
      all.push(...studyChunks(ex.jp));
    }
  }
  const strings = uniqueInOrder(all);
  const encoded = strings.map((s) => encode(known.get(s) ?? annotate(s)));
  await writeFile(path.join(root, 'app', 'banks', `lessons-${level}.ruby.json`), JSON.stringify(encoded));
  console.log(`lessons ${level}: ${strings.length} strings annotated`);
}
