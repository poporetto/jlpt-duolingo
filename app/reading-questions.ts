import type { Level, Question } from './course-data';
import { readingPassages, textGrammar } from './reading-passages.ts';
import { pictureForText } from './scenes.ts';

/** Turns the authored passages into questions, attaching a scene illustration
 *  only where the passage names something the artwork actually depicts. */
function build(entry: (typeof readingPassages)[Level][number], type: 'READING' | 'GRAMMAR'): Question {
  const text = entry.passage.flat().map((t) => (typeof t === 'string' ? t : t.kanji)).join('');
  // 文章の文法 is a grammar item; it gets no illustration.
  const picture = type === 'READING' ? pictureForText(text) : {};
  return {
      type,
      badge: type === 'READING' ? '読解' : '文法',
      itemType: entry.itemType,
      jpItemType: entry.jp,
      prompt: entry.prompt,
      passage: entry.passage,
      options: entry.options,
      answer: 0,
      note: entry.note,
      ...picture,
  };
}

export function readingQuestions(level: Level): Question[] {
  return readingPassages[level].map((entry) => build(entry, 'READING'));
}

/** 文章の文法 — passage-shaped, but a grammar item. */
export function textGrammarQuestions(level: Level): Question[] {
  return textGrammar[level].map((entry) => build(entry, 'GRAMMAR'));
}
