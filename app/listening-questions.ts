import type { Level, Question } from './course-data';
import { listeningScripts } from './listening-scripts.ts';
import { extraListeningScripts } from './listening-extra-scripts.ts';
import { extraListeningScripts2 } from './listening-extra-scripts-2.ts';
import { scriptId } from './script-id.ts';
import { pictureFor, PICTURE_TYPES } from './scenes.ts';

/**
 * Turns the authored scripts into questions. The audio filename is derived from
 * the narration itself (see script-id.ts), so a rewritten script can never keep
 * playing the clip that belonged to the old one.
 */

export function listeningQuestions(level: Level): Question[] {
  return listeningScripts[level].map((script) => ({
    type: 'LISTENING',
    badge: '聴解',
    itemType: script.itemType,
    jpItemType: script.jp,
    prompt: script.prompt,
    audio: scriptId(level.toLowerCase(), script.narration),
    narration: script.narration,
    options: script.options,
    answer: 0,
    note: script.note,
    // 概要理解 withholds its question until the audio has played.
    ...(script.jp === '概要理解' ? { revealAfterAudio: true } : {}),
    ...(PICTURE_TYPES.has(script.jp) ? pictureFor(script) : {}),
  }));
}

/**
 * The scripts added after the original 234. They are appended at the end of the
 * bank rather than merged into listeningQuestions(), because the main listening
 * pool is spliced mid-assembly and growing it there would shift the index of
 * every later item — which is what saved progress is keyed by.
 */
export function extraListeningQuestions(level: Level): Question[] {
  return extraListeningScripts[level].map((script) => ({
    type: 'LISTENING',
    badge: '聴解',
    itemType: script.itemType,
    jpItemType: script.jp,
    prompt: script.prompt,
    audio: scriptId(level.toLowerCase(), script.narration),
    narration: script.narration,
    options: script.options,
    answer: 0,
    note: script.note,
    ...(script.jp === '概要理解' ? { revealAfterAudio: true } : {}),
    ...(PICTURE_TYPES.has(script.jp) ? pictureFor(script) : {}),
  }));
}

/** The second authored batch, appended as its own block (see listening-extra-scripts-2.ts). */
export function extraListeningQuestions2(level: Level): Question[] {
  return extraListeningScripts2[level].map((script) => ({
    type: 'LISTENING',
    badge: '聴解',
    itemType: script.itemType,
    jpItemType: script.jp,
    prompt: script.prompt,
    audio: scriptId(level.toLowerCase(), script.narration),
    narration: script.narration,
    options: script.options,
    answer: 0,
    note: script.note,
    ...(script.jp === '概要理解' ? { revealAfterAudio: true } : {}),
  }));
}
