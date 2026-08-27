#!/usr/bin/env node
/**
 * Content gate for the question bank.  node scripts/audit-bank.mjs
 *
 * Exits non-zero on any finding, so it can run before an audio render or a
 * deploy. Every check here exists because the bank actually failed it once.
 */
import { existsSync, readdirSync } from 'node:fs';
import { questionBank, levels } from '../app/course-data.ts';

/** jlpt.jp 試験科目と問題の構成 — which 大問 appear at which level. */
const OFFICIAL = {
  '漢字読み': 'N1N2N3N4N5', '表記': 'N2N3N4N5', '語形成': 'N2', '文脈規定': 'N1N2N3N4N5',
  '言い換え類義': 'N1N2N3N4N5', '用法': 'N1N2N3N4',
  '文の文法1（文法形式の判断）': 'N1N2N3N4N5', '文の文法2（文の組み立て）': 'N1N2N3N4N5', '文章の文法': 'N1N2N3N4N5',
  '内容理解（短文）': 'N1N2N3N4N5', '内容理解（中文）': 'N1N2N3N4N5', '内容理解（長文）': 'N1N3',
  '統合理解': 'N1N2', '主張理解（長文）': 'N1N2', '情報検索': 'N1N2N3N4N5',
  '課題理解': 'N1N2N3N4N5', 'ポイント理解': 'N1N2N3N4N5', '概要理解': 'N1N2N3',
  '発話表現': 'N3N4N5', '即時応答': 'N1N2N3N4N5',
};
/** いらすとや allows 20 distinct images before a commercial design needs a licence. */
const IMAGE_BUDGET = 20;
/** Below this, an item type is one question wearing different clothes. */
const MIN_DISTINCT_ANSWER_RATIO = 0.1;

const clips = new Set(readdirSync('public/audio').filter((f) => f.endsWith('.m4a')).map((f) => f.replace(/\.m4a$/, '')));
const findings = [];
const seen = new Map();
const present = {};
const images = new Set();
const scripts = new Set();
let listening = 0;

for (const level of levels) {
  const byType = {};
  for (const [i, q] of questionBank[level].entries()) {
    const id = `${level}#${i} ${q.jpItemType}`;
    (present[q.jpItemType] ??= new Set()).add(level);
    (byType[q.jpItemType] ??= { n: 0, answers: new Set() });
    byType[q.jpItemType].n += 1;
    byType[q.jpItemType].answers.add(q.options[q.answer]);

    if (new Set(q.options).size !== q.options.length) findings.push([id, 'duplicate options']);
    if (q.answer < 0 || q.answer >= q.options.length) findings.push([id, 'answer out of range']);
    if (!q.note || q.note.length < 20) findings.push([id, 'missing or thin note']);
    if (/^第\d+問/.test(q.prompt)) findings.push([id, 'template artifact in prompt']);
    if (/[Ѐ-ӿ가-힯]/.test(JSON.stringify(q))) findings.push([id, 'non-Japanese script in content']);
    if (q.image) {
      images.add(q.image);
      if (!existsSync(`public${q.image}`)) findings.push([id, `image file missing: ${q.image}`]);
      if (!q.imageAlt) findings.push([id, 'image without alt text']);
    }
    if (q.type === 'LISTENING') {
      listening += 1;
      if (!q.narration?.length) findings.push([id, 'listening item with no narration']);
      else scripts.add(q.narration.map((l) => l.text).join('|'));
      if (!q.audio) findings.push([id, 'listening item with no audio id']);
      else if (!clips.has(q.audio)) findings.push([id, `audio clip missing: ${q.audio}`]);
      if (q.jpItemType === '概要理解' && !q.revealAfterAudio) findings.push([id, '概要理解 must set revealAfterAudio']);
    }
    const key = [level, JSON.stringify(q.tokens), JSON.stringify(q.passage), JSON.stringify(q.narration), q.prompt, q.options.join(',')].join('|');
    if (seen.has(key)) findings.push([id, `identical to ${seen.get(key)}`]); else seen.set(key, id);
  }
  for (const [jp, t] of Object.entries(byType)) {
    if (t.n >= 8 && t.answers.size / t.n < MIN_DISTINCT_ANSWER_RATIO) {
      findings.push([`${level} ${jp}`, `${t.n} items share only ${t.answers.size} distinct answer(s) — inflation, not breadth`]);
    }
  }
}

// A 大問 rendered under two English labels splits its items across units, and a
// unit whose label matches nothing shows "0 QUESTIONS" with no other symptom.
// Keyed by section as well as name: 統合理解 is genuinely two different 大問,
// one in 読解 and one in 聴解, and each has its own label.
const labels = new Map();
for (const level of levels) {
  for (const q of questionBank[level]) {
    const key = `${q.type}/${q.jpItemType}`;
    if (!labels.has(key)) labels.set(key, new Set());
    labels.get(key).add(q.itemType);
  }
}
for (const [key, set] of labels) {
  if (set.size > 1) findings.push([key, `two English labels in use: ${[...set].join(' / ')}`]);
}

for (const [type, at] of Object.entries(OFFICIAL)) {
  for (const level of levels) {
    const should = at.includes(level);
    const does = present[type]?.has(level) ?? false;
    if (should && !does) findings.push([`${level} ${type}`, 'required 大問 is missing']);
    if (!should && does) findings.push([`${level} ${type}`, 'not on the real exam at this level']);
  }
}
if (images.size > IMAGE_BUDGET) findings.push(['images', `${images.size} distinct images exceeds the ${IMAGE_BUDGET} いらすとや budget`]);
if (scripts.size !== listening) findings.push(['listening', `${listening} items but only ${scripts.size} distinct scripts`]);

const total = levels.reduce((a, l) => a + questionBank[l].length, 0);
console.log(`items ${total} (${seen.size} unique) | listening ${listening} with ${scripts.size} scripts | images ${images.size}/${IMAGE_BUDGET}`);
if (!findings.length) { console.log('audit: clean'); process.exit(0); }
const grouped = new Map();
for (const [where, what] of findings) {
  if (!grouped.has(what)) grouped.set(what, []);
  grouped.get(what).push(where);
}
console.log(`\n${findings.length} finding(s):`);
for (const [what, where] of [...grouped].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${String(where.length).padStart(4)}×  ${what}`);
  console.log(`        e.g. ${where.slice(0, 3).join(', ')}`);
}
process.exit(1);
