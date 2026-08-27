#!/usr/bin/env node
import { questionBank } from '../app/course-data.ts';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const minimum = { N5: 300, N4: 300, N3: 300, N2: 300, N1: 288 };
let failed = false;

for (const [level, questions] of Object.entries(questionBank)) {
  const groups = new Map();
  const fingerprints = new Map();
  const audioIds = new Set();
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
    if (question.type === 'LISTENING' && question.audio) {
      if (audioIds.has(question.audio)) {
        console.error(`${level} question ${index + 1}: duplicate audio id ${question.audio}`);
        failed = true;
      }
      audioIds.add(question.audio);
      const audioPath = path.resolve('public', 'audio', `${question.audio}.m4a`);
      if (!existsSync(audioPath) || statSync(audioPath).size < 1000) {
        console.error(`${level} question ${index + 1}: recorded clip missing or empty: ${question.audio}.m4a`);
        failed = true;
      }
    }
  });
  if (questions.length < minimum[level]) {
    console.error(`${level}: expected at least ${minimum[level]} questions, found ${questions.length}`);
    failed = true;
  }
  const undersized = [...groups].filter(([, indices]) => indices.length < 8);
  if (undersized.length) {
    console.error(`${level}: undersized official families: ${undersized.map(([name, indices]) => `${name} (${indices.length})`).join(', ')}`);
    failed = true;
  }
  for (const [name, indices] of groups) {
    const stageCount = Math.ceil(indices.length / 10);
    const base = Math.floor(indices.length / stageCount);
    const remainder = indices.length % stageCount;
    const sizes = Array.from({ length: stageCount }, (_, part) => base + (part < remainder ? 1 : 0));
    if (sizes.some((size) => size < 8 || size > 10)) {
      console.error(`${level}: ${name} cannot be divided into 8–10-question stages (${sizes.join(', ')})`);
      failed = true;
    }
  }
  console.log(`${level}: ${questions.length} questions across ${groups.size} official families; ${fingerprints.size} unique fingerprints`);
}

if (failed) process.exit(1);
