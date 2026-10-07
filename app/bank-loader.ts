import type { Level, Question } from './levels';
import sizes from './banks/sizes.json' with { type: 'json' };
import { registerRuby, rubyStringsOf, uniqueInOrder, UI_RUBY_STRINGS } from './ruby';

/**
 * Loads one level's question bank on demand.
 *
 * The banks are precomputed by scripts/build-level-banks.mjs and imported
 * dynamically so the bundler emits one chunk per level: a learner studying N2
 * never downloads N1's pool. Each chunk is cached after its first load, so
 * switching back to a level is instant.
 *
 * The level's furigana (scripts/build-ruby.mjs) arrives with it, as an array
 * aligned to the strings collected below — the same collector the build used.
 */
const cache = new Map<Level, Question[]>();

export const bankSizes = sizes as Record<Level, number>;

export async function loadBank(level: Level): Promise<Question[]> {
  const cached = cache.get(level);
  if (cached) return cached;
  const [mod, ruby] = await Promise.all([import(`./banks/${level}.json`), import(`./banks/${level}.ruby.json`)]);
  const bank = (mod.default ?? mod) as Question[];
  registerRuby(uniqueInOrder([...UI_RUBY_STRINGS, ...bank.flatMap(rubyStringsOf)]), (ruby.default ?? ruby) as string[]);
  cache.set(level, bank);
  return bank;
}
