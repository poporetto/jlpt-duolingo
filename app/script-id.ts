import type { NarrationLine } from './course-data';

/**
 * Audio filenames are derived from the script, never from the item's position.
 *
 * With positional ids (`n3-generated-point-comprehension-5`) rewriting a script
 * leaves the old clip in place under the same name, so the learner hears one
 * thing and reads another — silently, and with nothing in the build to catch it.
 * Hashing the narration means a changed script asks for a filename that does not
 * exist yet, the generator renders it, and its orphan pass deletes the stale one.
 */
export function scriptId(prefix: string, narration: NarrationLine[]) {
  const text = narration.map((line) => `${line.speaker}:${line.text}:${line.pauseAfter ?? 0}`).join('|');
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `${prefix}-${hash.toString(36).padStart(7, '0')}`;
}
