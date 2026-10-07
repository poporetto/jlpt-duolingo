import type { Question } from './levels';

/**
 * Furigana, computed at build time.
 *
 * scripts/build-ruby.mjs runs every string the app renders with furigana
 * through a morphological analyser (kuromoji), with the whole sentence as
 * context, and ships the result beside each level's bank. The app used to guess
 * at runtime by matching the longest dictionary word left to right, which split
 * compounds (五時間 → 五時＋間) and could not tell 止めて (とめて) from 止めて
 * (やめて), because it never saw the sentence.
 *
 * Annotations are stored as an array aligned to the list of strings below, not
 * keyed by text, so no string is shipped twice. The build script and the loader
 * both call these collectors, so the two lists can never drift apart.
 */

/** [start, length, reading] — ruby over text.slice(start, start + length). */
export type RubySeg = [number, number, string];

const HAS_KANJI = /[一-鿿々]/;

/** Fixed interface strings rendered with furigana outside any question. */
export const UI_RUBY_STRINGS = ['まず 話を 聞いて ください。', '概要理解'];

/**
 * Every string FuriganaText renders for a question, in a fixed order. A
 * question's plain-string tokens are listed with their whole sentence so the
 * analyser can read each fragment in context.
 */
export function rubyStringsOf(q: Question): string[] {
  const out: string[] = [q.jpItemType, q.prompt, ...q.options, q.note, ...(q.optionNotes ?? [])];
  for (const line of q.narration ?? []) out.push(line.text);
  for (const tok of q.tokens ?? []) if (typeof tok === 'string') out.push(tok);
  for (const row of q.passage ?? []) for (const tok of row) if (typeof tok === 'string') out.push(tok);
  return out.filter((s) => s && HAS_KANJI.test(s));
}

/** The plain chunks StudyText hands to FuriganaText for a piece of lesson text. */
export function studyChunks(text: string): string[] {
  const out: string[] = [];
  const pattern = /［([^］]+)］|\{([^|}]+)\|([^}]+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text))) {
    out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(...studyChunks(m[1]));
    last = pattern.lastIndex;
  }
  out.push(text.slice(last));
  return out.filter((s) => s && HAS_KANJI.test(s));
}

/** Unique strings in first-seen order — the index the annotations align to. */
export function uniqueInOrder(strings: Iterable<string>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of strings) if (!seen.has(s)) { seen.add(s); out.push(s); }
  return out;
}

const registry = new Map<string, RubySeg[]>();

/** Encoded as "start,len,reading;…" per string; "" means no ruby. */
export function registerRuby(strings: string[], encoded: string[]) {
  strings.forEach((text, i) => {
    const code = encoded[i];
    if (code === undefined) return;
    registry.set(text, code ? code.split(';').map((part) => {
      const [s, l, r] = part.split(',');
      return [Number(s), Number(l), r] as RubySeg;
    }) : []);
  });
}

export function rubyFor(text: string): RubySeg[] | undefined {
  return registry.get(text);
}
