#!/usr/bin/env node
/**
 * Precomputes each level's finished question bank into app/banks/<Level>.json.
 *
 * course-data.ts assembles every level at module scope, so any import of it pulls
 * all five banks — several megabytes of kanji, vocabulary, listening and reading
 * data — into the client's first paint. A learner studies one level, so the UI
 * loads one bank on demand instead (app/bank-loader.ts). This script is what
 * turns the assembled banks into those chunks; re-run it after any content change.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { questionBank, levels } from '../app/course-data.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'app', 'banks');
await mkdir(dir, { recursive: true });

const sizes = {};
for (const level of levels) {
  const bank = questionBank[level];
  sizes[level] = bank.length;
  await writeFile(path.join(dir, `${level}.json`), JSON.stringify(bank));
}
// The profile screen shows every level's progress, so it needs all five sizes
// without loading all five banks.
await writeFile(path.join(dir, 'sizes.json'), JSON.stringify(sizes));
console.log(levels.map((l) => `${l} ${sizes[l]}`).join(' | '));
