import type { Level, Question } from './course-data';
import { listeningScripts } from './listening-scripts.ts';
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
