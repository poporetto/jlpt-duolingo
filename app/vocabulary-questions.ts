import type { Level, Question } from './course-data';
import { usageItems, paraphraseItems } from './vocabulary-items.ts';

/** 用法 shows four sentences and asks which one uses the word correctly, so the
 *  options *are* the sentences and there is no separate carrier. */
export function usageQuestions(level: Level): Question[] {
  return usageItems[level].map((entry) => ({
    type: 'VOCABULARY', badge: '語彙', itemType: 'Usage', jpItemType: '用法',
    prompt: `「${entry.word}」の使い方として最もよいものを選んでください。`,
    options: [entry.correct, ...entry.wrong],
    answer: 0,
    note: entry.note,
  }));
}

/** 言い換え類義 underlines a word and asks for something that could replace it
 *  in that sentence — a substitute, not a definition. */
export function paraphraseQuestions(level: Level): Question[] {
  return paraphraseItems[level].map((entry) => ({
    type: 'VOCABULARY', badge: '語彙', itemType: 'Paraphrase', jpItemType: '言い換え類義',
    prompt: '＿＿の言葉に意味が最も近いものを選んでください。',
    tokens: entry.sentence,
    options: [entry.answer, ...entry.distractors],
    answer: 0,
    note: entry.note,
  }));
}
