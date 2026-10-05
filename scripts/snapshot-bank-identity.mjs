#!/usr/bin/env node
/**
 * Freezes the identity of every question at its current index.
 *
 * Saved progress — mastery scores, the missed list, daily-seen counts — is keyed
 * by the question's position in its level's bank. Inserting an item anywhere but
 * the end therefore silently re-points every later index at a different question,
 * and every existing profile (and every save file exported from the profile menu)
 * starts crediting the wrong items. New content must be appended, never spliced
 * into the middle.
 *
 * Run this only to re-baseline deliberately, and say so in the commit message.
 */
import { writeFileSync } from 'node:fs';
import { questionBank, levels } from '../app/course-data.ts';
import { identityOf } from './bank-identity.mjs';

const snapshot = Object.fromEntries(
  levels.map((level) => [level, questionBank[level].map(identityOf)]),
);
writeFileSync('scripts/bank-identity.json', JSON.stringify(snapshot));
console.log(levels.map((l) => `${l} ${snapshot[l].length}`).join(' | '));
