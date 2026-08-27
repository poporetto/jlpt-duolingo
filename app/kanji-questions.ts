import type { Level, Question, Token } from './course-data';
import kanjiBank from './kanji-bank.json' with { type: 'json' };

/**
 * 漢字読み and 表記 items built from app/kanji-bank.json (see
 * scripts/build-kanji-bank.mjs). Every carrier sentence is a real, human-written
 * Tatoeba sentence — none of it is generated Japanese — and every distractor is
 * either an alternate reading of the same kanji, a rendaku/長音 variant, or a true
 * homophone, so no option is dismissible on sight.
 */
type Entry = { word: string; reading: string; distractors: string[]; sentence: string };
type LevelBank = { reading: Entry[]; orthography: Entry[] };

const bank = kanjiBank as Record<string, LevelBank>;

/** Split the carrier so the tested word can be underlined in place. */
function frame(sentence: string, word: string, shown: string, reading: string): Token[] {
  const at = sentence.indexOf(word);
  if (at === -1) return [sentence];
  const tokens: Token[] = [];
  if (at > 0) tokens.push(sentence.slice(0, at));
  tokens.push({ kanji: shown, reading, target: true });
  const tail = sentence.slice(at + word.length);
  if (tail) tokens.push(tail);
  return tokens;
}

export function kanjiQuestions(level: Level): Question[] {
  const source = bank[level];
  if (!source) return [];

  const reading: Question[] = source.reading.map((entry) => ({
    type: 'KANJI', badge: '漢字', itemType: 'Kanji reading', jpItemType: '漢字読み',
    prompt: '＿＿の言葉の読み方として最もよいものを選んでください。',
    tokens: frame(entry.sentence, entry.word, entry.word, entry.reading),
    options: [entry.reading, ...entry.distractors],
    optionNotes: [
      `Correct in this sentence: ${entry.word} is read ${entry.reading}. The carrier is tied to this exact JMdict reading and sense.`,
      ...entry.distractors.map((reading) => `${reading} is a sound-based near miss—an alternate kanji reading, voicing, vowel, long-vowel or gemination slip—but it is not the reading of ${entry.word} in this context.`),
    ],
    answer: 0,
    note: `${entry.word} is read ${entry.reading} in this verified dictionary example. Read the whole carrier before choosing: homographs are matched by both spelling and sense, never by spelling alone.`,
  }));

  // 表記 is not an N1 item type — jlpt.jp lists it for N2–N5 only.
  const orthography: Question[] = (level === 'N1' ? [] : source.orthography).map((entry) => ({
    type: 'KANJI', badge: '漢字', itemType: 'Orthography', jpItemType: '表記',
    prompt: '＿＿の言葉は漢字でどう書きますか。',
    // The reading is shown and the spelling is what's being chosen.
    tokens: frame(entry.sentence, entry.word, entry.reading, ''),
    options: [entry.word, ...entry.distractors],
    optionNotes: [
      `Correct: ${entry.reading} is written ${entry.word} in this sentence.`,
      ...entry.distractors.map((spelling) => `${spelling} is a real homophone or a shared-kanji near miss, but its meaning does not fit this carrier sentence.`),
    ],
    answer: 0,
    note: `${entry.reading} is written ${entry.word}. The distractors are real words that are either true homophones or share a kanji — 表記 tests whether you can match a spelling to a reading, not whether you recognise the word.`,
  }));

  return [...reading, ...orthography];
}
