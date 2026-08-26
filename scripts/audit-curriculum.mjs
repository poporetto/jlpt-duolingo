#!/usr/bin/env node
import { questionBank } from '../app/course-data.ts';

const expected = { N5: 336, N4: 300, N3: 272, N2: 304, N1: 288 };
let failed = false;

for (const [level, questions] of Object.entries(questionBank)) {
  const groups = new Map();
  const fingerprints = new Map();
  questions.forEach((question, index) => {
    const group = groups.get(question.itemType) ?? [];
    group.push(index);
    groups.set(question.itemType, group);
    const fingerprint = JSON.stringify({ itemType: question.itemType, prompt: question.prompt, tokens: question.tokens, passage: question.passage, narration: question.narration, options: question.options });
    const prior = fingerprints.get(fingerprint);
    if (prior !== undefined) {
      console.error(`${level}: duplicate question content at ${prior + 1} and ${index + 1}`);
      failed = true;
    }
    fingerprints.set(fingerprint, index);
    if (question.options.length !== 4 || question.answer < 0 || question.answer > 3) {
      console.error(`${level} question ${index + 1}: expected four options and a valid answer`);
      failed = true;
    }
    if (question.type === 'LISTENING' && (!question.audio || !question.narration?.length)) {
      console.error(`${level} question ${index + 1}: listening item lacks authored audio metadata`);
      failed = true;
    }
  });
  if (questions.length !== expected[level]) {
    console.error(`${level}: expected ${expected[level]} questions at this production phase, found ${questions.length}`);
    failed = true;
  }
  const undersized = [...groups].filter(([, indices]) => indices.length < 8);
  if (undersized.length) {
    console.error(`${level}: undersized official families: ${undersized.map(([name, indices]) => `${name} (${indices.length})`).join(', ')}`);
    failed = true;
  }
  console.log(`${level}: ${questions.length} questions across ${groups.size} official families; ${fingerprints.size} unique fingerprints`);
}

if (failed) process.exit(1);
