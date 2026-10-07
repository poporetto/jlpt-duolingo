import type { Level, Question } from './course-data';
import { usageItems, paraphraseItems } from './vocabulary-items.ts';
import vocabBank from './vocab-bank.json' with { type: 'json' };
import vocabInflected from './vocab-inflected.json' with { type: 'json' };
import vocabCorpus from './vocab-corpus.json' with { type: 'json' };

type ContextEntry = {
  word: string; reading: string; sentence: string;
  gloss: string[]; distractors: { word: string; gloss: string }[];
};

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

/** 文脈規定 blanks a word out of a real sentence and asks which of four fits.
 *  Built from app/vocab-bank.json (see scripts/build-vocab-bank.mjs): every
 *  carrier is a Tatoeba sentence bound to one JMdict sense and reading, and the
 *  three distractors share the answer's part of speech and level while sharing
 *  none of its glosses, so they are grammatical in the slot but not synonyms. */
/** Each level already has its own 文脈規定 wording — kana at N5, 最も from N3 up.
 *  Generated items reuse it rather than adding a variant, which also avoids the
 *  furigana map pasting ruby across a kanji 選んで that the kana form never hits. */
const CONTEXT_PROMPT: Record<Level, string> = {
  N5: '（　）に いれるのに いちばん いい ものを えらんで ください。',
  N4: '（　）に 入れるのに いちばん いい ものを えらんで ください。',
  N3: '（　）に 入れるのに 最も よい ものを えらんで ください。',
  N2: '（　）に 入れるのに 最も よい ものを えらんで ください。',
  N1: '（　）に 入れるのに 最も よい ものを えらんで ください。',
};

export function contextualVocabularyQuestions(level: Level): Question[] {
  const entries = (vocabBank as Record<string, ContextEntry[]>)[level] ?? [];
  return entries.map((entry) => {
    const at = entry.sentence.indexOf(entry.word);
    const tokens: (string | { kanji: string; reading: string })[] = [];
    if (at > 0) tokens.push(entry.sentence.slice(0, at));
    tokens.push('（　　）');
    const tail = entry.sentence.slice(at + entry.word.length);
    if (tail) tokens.push(tail);
    return {
      type: 'VOCABULARY' as const, badge: '語彙', itemType: 'Contextual vocabulary', jpItemType: '文脈規定',
      prompt: CONTEXT_PROMPT[level],
      tokens,
      options: [entry.word, ...entry.distractors.map((d) => d.word)],
      answer: 0,
      note: `${entry.word}（${entry.reading}）= ${entry.gloss.join('; ')}. The sentence is a real example tied to this word, so the blank takes ${entry.word} and nothing else here.`,
      optionNotes: [
        `Correct: ${entry.word}（${entry.reading}）= ${entry.gloss.join('; ')}.`,
        ...entry.distractors.map((d) => `${d.word} = ${d.gloss}. It is the same part of speech and level, so it fits the slot grammatically, but its meaning does not fit this sentence.`),
      ],
    };
  });
}

type InflectedEntry = {
  word: string; reading: string; form: string; before: string; after: string;
  gloss: string[]; distractors: { word: string; form: string; gloss: string }[];
};

/** 文脈規定 whose answer is a verb or い-adjective. The blank is cut around the
 *  inflected form the sentence uses and every option is conjugated into that
 *  same form, as the real paper does (see scripts/build-vocab-inflected.mjs). */
export function inflectedVocabularyQuestions(level: Level): Question[] {
  const entries = (vocabInflected as Record<string, InflectedEntry[]>)[level] ?? [];
  return entries.map((entry) => ({
    type: 'VOCABULARY' as const, badge: '語彙', itemType: 'Contextual vocabulary', jpItemType: '文脈規定',
    prompt: CONTEXT_PROMPT[level],
    tokens: [entry.before, '（　　）', entry.after].filter(Boolean),
    options: [entry.form, ...entry.distractors.map((d) => d.form)],
    answer: 0,
    note: `${entry.form} is ${entry.word}（${entry.reading}）= ${entry.gloss.join('; ')}. All four options are in the same form, so only the meaning decides it.`,
    optionNotes: [
      `Correct: ${entry.form}, from ${entry.word}（${entry.reading}）= ${entry.gloss.join('; ')}.`,
      ...entry.distractors.map((d) => `${d.form}, from ${d.word} = ${d.gloss}. Same form and word class, but the meaning does not fit this sentence.`),
    ],
  }));
}

type CorpusEntry = { word: string; sentence: string; gloss: string[]; distractors: { word: string; gloss: string }[] };

/** 文脈規定 for nouns, な-adjectives and adverbs drawn from the whole Tatoeba
 *  corpus rather than JMdict's sense-filed examples (scripts/build-vocab-corpus.mjs).
 *  The answer is the word that stood in the blank, so the item is correct whatever
 *  sense the sentence uses. */
export function corpusVocabularyQuestions(level: Level): Question[] {
  const entries = (vocabCorpus as Record<string, CorpusEntry[]>)[level] ?? [];
  return entries.map((entry) => {
    const at = entry.sentence.indexOf(entry.word);
    return {
      type: 'VOCABULARY' as const, badge: '語彙', itemType: 'Contextual vocabulary', jpItemType: '文脈規定',
      prompt: CONTEXT_PROMPT[level],
      tokens: [entry.sentence.slice(0, at), '（　　）', entry.sentence.slice(at + entry.word.length)].filter(Boolean),
      options: [entry.word, ...entry.distractors.map((d) => d.word)],
      answer: 0,
      note: `${entry.word} = ${entry.gloss.join('; ')}. It is the word this real sentence uses.`,
      optionNotes: [
        `Correct: ${entry.word} = ${entry.gloss.join('; ')}.`,
        ...entry.distractors.map((d) => `${d.word} = ${d.gloss}. Same word class and level, but it does not fit this sentence.`),
      ],
    };
  });
}
