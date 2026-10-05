/**
 * The light half of the course model: types, the level list and level copy.
 *
 * It lives apart from course-data.ts so the UI can import these without pulling
 * in the question banks. course-data.ts builds every level's bank at module
 * scope, so importing one symbol from it drags in the kanji, vocabulary,
 * listening and reading pools — several megabytes that the client should load
 * one level at a time, not all five on first paint.
 */
export type Level = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';

/** A run of Japanese text. `target: true` marks the underlined item under test —
 *  furigana is always suppressed there so a kanji-reading question can't spoil itself. */
export type Token = string | { kanji: string; reading: string; target?: boolean };

export type Speaker = 'narrator' | 'man' | 'woman';

/** Listening audio is authored as ordered lines, never one blob: speaker labels
 *  must never be spoken, and the pauses are what make it sound like exam audio. */
export type NarrationLine = { speaker: Speaker; text: string; pauseAfter?: number };

export type QuestionType = 'GRAMMAR' | 'KANJI' | 'VOCABULARY' | 'LISTENING' | 'READING';

export type Question = {
  type: QuestionType;
  badge: string;
  /** English label for the official 大問 */
  itemType: string;
  /** The official 大問 name, per jlpt.jp 試験科目と問題の構成 */
  jpItemType: string;
  prompt: string;
  tokens?: Token[];
  /** Reading passage, one token row per line — so furigana works here too. */
  passage?: Token[][];
  /** 概要理解 gives no question before the audio; hold it back until played. */
  revealAfterAudio?: boolean;
  narration?: NarrationLine[];
  /** Basename of a pre-rendered clip in public/audio (no extension). */
  audio?: string;
  options: string[];
  /** Optional explanation for every authored option. It is shuffled together
   * with the option so feedback always stays attached to the right choice. */
  optionNotes?: string[];
  answer: number;
  note: string;
  image?: string;
  imageAlt?: string;
};

export const levels: Level[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const levelDetails: Record<Level, { title: string; subtitle: string; accent: string; lesson: string; grammar: string; kanji: string }> = {
  N5: { title: 'First foundations', subtitle: 'Everyday words and simple sentences', accent: '#55a47d', lesson: 'Everyday essentials', grammar: 'Particles & polite forms', kanji: '日 ・ 月 ・ 人' },
  N4: { title: 'Daily confidence', subtitle: 'Practical Japanese for familiar situations', accent: '#4c91a9', lesson: 'Plans and routines', grammar: '～ながら・～やすい', kanji: '予 ・ 定 ・ 遅' },
  N3: { title: 'Bridge to fluency', subtitle: 'Natural conversation and connected ideas', accent: '#7666a7', lesson: 'Work and arrangements', grammar: '～とおりに', kanji: '確 ・ 認 ・ 変' },
  N2: { title: 'Real-world fluency', subtitle: 'Nuanced language for news, work and society', accent: '#d66a4c', lesson: 'Contrast and consequence', grammar: '～にもかかわらず', kanji: '報 ・ 政 ・ 経' },
  N1: { title: 'Advanced mastery', subtitle: 'Abstract, formal and highly nuanced Japanese', accent: '#a34d4d', lesson: 'Analysis and inference', grammar: '～を皮切りに', kanji: '払 ・ 拭 ・ 顕' },
};
