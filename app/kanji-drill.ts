import type { Question } from './levels';

/**
 * The word a kanji question is about: the underlined word of a 漢字読み item, or
 * the correct spelling of a 表記 item. A kanji table drills every question whose
 * word uses one of its kanji. The app and the audit both match through this, so
 * the count on the practise button is the count the audit checked.
 */
export function kanjiDrillWord(q: Question): string {
  if (q.jpItemType === '漢字読み') {
    const target = (q.tokens ?? []).find((t) => typeof t === 'object' && t.target);
    return typeof target === 'object' ? target.kanji : '';
  }
  if (q.jpItemType === '表記') return q.options[q.answer ?? 0];
  return '';
}
