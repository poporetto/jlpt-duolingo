import type { Question } from './course-data';

export type UsageWord = { word: string; reading: string; meaning: string; sentence: string };

/** Minimal-pair 用法 distractors. Altering one nearby marker keeps all four
 * sentences readable while testing the exact particle, attachment and word
 * class instead of offering surreal combinations that can be rejected on sight. */
const markerAlternatives: Record<string, string[]> = {
  できます: ['にします', 'であります', 'をなります'],
  になりました: ['をしました', 'でありました', 'がしました'],
  的に: ['を', 'で', 'が'], 的な: ['を', 'で', 'が'], です: ['をします', 'にあります', 'がします'],
  を: ['に', 'で', 'から'], に: ['を', 'で', 'から'], が: ['を', 'で', 'から'],
  は: ['を', 'に', 'で'], で: ['を', 'に', 'へ'], の: ['を', 'に', 'で'],
  と: ['を', 'に', 'が'], へ: ['を', 'に', 'で'], から: ['に', 'で', 'が'],
  まで: ['が', 'と', 'の'], な: ['の', 'で', 'を'], 的: ['な', 'を', 'で'],
};
const markers = Object.keys(markerAlternatives).sort((a, b) => b.length - a.length);
const wordSegmenter = new Intl.Segmenter('ja', { granularity: 'word' });

const locateMarker = (target: UsageWord) => {
  let at = target.sentence.indexOf(target.word);
  let surface = target.word;
  // Native verbs may be stored in dictionary form (見込む) but appear inflected
  // in the example (見込んで). Match their kanji stem when necessary.
  if (at < 0) {
    surface = [...target.word].slice(0, -1).join('');
    at = target.sentence.indexOf(surface);
  }
  if (at < 0) return null;
  const afterAt = at + surface.length;
  const after = target.sentence.slice(afterAt);
  const afterMarker = markers.find((marker) => after.startsWith(marker));
  if (afterMarker) return { at: afterAt, marker: afterMarker, relation: 'after' as const };
  const beforeText = target.sentence.slice(0, at).trimEnd();
  const beforeMarker = markers.find((marker) => beforeText.endsWith(marker));
  if (beforeMarker) return { at: beforeText.length - beforeMarker.length, marker: beforeMarker, relation: 'before' as const };
  const earlierParticles = [...wordSegmenter.segment(beforeText)].filter((segment) => markerAlternatives[segment.segment]);
  const earlier = earlierParticles.at(-1);
  if (earlier) return { at: earlier.index, marker: earlier.segment, relation: 'before' as const };
  return null;
};

export function usageChoices(words: UsageWord[], index: number) {
  const target = words[index % words.length];
  const located = locateMarker(target);
  if (!located) throw new Error(`Usage item needs an editable particle or attachment: ${target.word}`);
  const alternatives = markerAlternatives[located.marker];
  const distractors = alternatives.map((marker) => `${target.sentence.slice(0, located.at)}${marker}${target.sentence.slice(located.at + located.marker.length)}`);
  return {
    options: [target.sentence, ...distractors],
    answer: 0,
    optionNotes: [
      `Natural: ${target.word}（${target.reading}） means “${target.meaning}”, and its particle, verb and semantic role all fit this sentence.`,
      ...alternatives.map((marker) => `The marker ${marker} ${located.relation} ${target.word} assigns the wrong grammatical or semantic role here. This collocation requires ${located.marker}; changing it breaks the word’s attachment even though the rest of the sentence looks familiar.`),
    ],
    note: `${target.word} is not interchangeable with a vaguely related noun. Check the whole collocation—what takes the particle, which verb follows, and what kind of subject or object the word can describe.`,
  } satisfies Pick<Question, 'options' | 'optionNotes' | 'answer' | 'note'>;
}

export function grammarChoiceNotes(form: string, answer: string, distractors: readonly string[], explanation: string) {
  return [
    `Correct: ${answer} completes ${form}. ${explanation}`,
    ...distractors.map((choice) => `${choice} is a different construction. In this sentence it does not express the meaning, attachment or register required by ${form}.`),
  ];
}

export type AssemblyTemplate = { sentence: string; options: [string, string, string, string]; order: [string, string, string, string]; clue: string };

export function assemblyDetails(template: AssemblyTemplate) {
  const answer = template.options.indexOf(template.order[1]);
  return {
    options: template.options,
    answer,
    note: `Correct order: ${template.order.join('／')}. ${template.clue} Every option is used, but only ${template.order[1]} occupies the starred second slot.`,
    optionNotes: template.options.map((choice) => {
      const slot = template.order.indexOf(choice) + 1;
      return slot === 2
        ? `${choice} belongs in slot 2 (★); its attachment to the chunks on both sides completes the intended construction.`
        : `${choice} is required, but it belongs in slot ${slot}, not ★. Putting it second breaks the particle, modifier or fixed-expression connection.`;
    }),
  } satisfies Pick<Question, 'options' | 'answer' | 'optionNotes' | 'note'>;
}
