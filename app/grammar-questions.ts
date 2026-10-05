import type { Level, Question } from './levels';
import { grammarInventory, type GrammarPoint } from './grammar-inventory.ts';

/**
 * 文法形式の判断 items for the inventory points no hand-authored item covers.
 *
 * In this 大問 the other three options are themselves grammar points, so the
 * failure mode is a distractor that also fits the blank. Distractors are drawn
 * from a different semantic category than the answer — the same job
 * gloss-disjointness does for 文脈規定 — and never from a point that already
 * appears in the carrier.
 */
const norm = (point: string) => point.replace(/^[～〜]/, '');
/** What the learner actually sees as an option. */
const formOf = (g: GrammarPoint) => g.form ?? g.point;

/** FNV-1a, so the shuffle is identical on every build. */
function mix(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

/** The points an existing item already tests, so the pool does not duplicate them. */
export function coveredPoints(bank: Question[]): Set<string> {
  const covered = new Set<string>();
  for (const q of bank) if (q.itemType === 'Grammar form') covered.add(norm(q.options[q.answer ?? 0]));
  return covered;
}

export function grammarQuestions(level: Level, alreadyTested: Set<string>): Question[] {
  const inventory = grammarInventory[level] ?? [];
  const isCovered = (g: GrammarPoint) => [g.point, ...(g.aliases ?? [])].some((a) => alreadyTested.has(norm(a)));
  const todo = inventory.filter((g) => g.carrier && !isCovered(g));

  // No point may be an option in more than this many items, so a handful of
  // forms cannot become every item's distractors.
  const USAGE_CAP = 5;
  const used = new Map<string, number>();
  const items: Question[] = [];

  for (const entry of todo) {
    const candidates = inventory
      .filter((o) => o.category !== entry.category
        && o.point !== entry.point
        && formOf(o) !== formOf(entry)
        && !entry.carrier!.includes(norm(formOf(o)))
        && !norm(o.point).includes(norm(entry.point))
        && !norm(entry.point).includes(norm(o.point)))
      .map((o) => ({ o, k: mix(`${entry.point}\u0000${o.point}`) }))
      .sort((a, b) => a.k - b.k)
      .map(({ o }) => o);

    const picked: GrammarPoint[] = [];
    const takenForms = new Set([formOf(entry)]);
    for (const cand of candidates) {
      if (picked.length === 3) break;
      if ((used.get(cand.point) ?? 0) >= USAGE_CAP) continue;
      if (picked.some((p) => p.category === cand.category)) continue;  // three distinct wrong readings
      if (takenForms.has(formOf(cand))) continue;   // two labels can render identically
      takenForms.add(formOf(cand));
      picked.push(cand);
    }
    if (picked.length < 3) continue;
    for (const p of picked) used.set(p.point, (used.get(p.point) ?? 0) + 1);

    const at = entry.carrier!.indexOf('＿');
    const tokens: string[] = [];
    if (at > 0) tokens.push(entry.carrier!.slice(0, at));
    tokens.push('（　　）');
    const tail = entry.carrier!.slice(at + 1);
    if (tail) tokens.push(tail);

    items.push({
      type: 'GRAMMAR', badge: '文法', itemType: 'Grammar form', jpItemType: '文の文法1（文法形式の判断）',
      prompt: '（　）に 入れるのに 最も よい ものを えらんで ください。',
      tokens,
      options: [formOf(entry), ...picked.map(formOf)],
      answer: 0,
      note: `${formOf(entry)} = ${entry.meaning}. ${entry.note ?? `It is what this sentence needs, and the other three express a different relation entirely.`}`,
      optionNotes: [
        `Correct: ${formOf(entry)} = ${entry.meaning}.`,
        ...picked.map((p) => `${formOf(p)} = ${p.meaning}. It is a real ${level} pattern, but it expresses ${p.category}, not ${entry.category}, so it does not fit this sentence.`),
      ],
    });
  }
  return items;
}
