import type { Level, Question } from './levels';
import sizes from './banks/sizes.json' with { type: 'json' };

/**
 * Loads one level's question bank on demand.
 *
 * The banks are precomputed by scripts/build-level-banks.mjs and imported
 * dynamically so the bundler emits one chunk per level: a learner studying N2
 * never downloads N1's pool. Each chunk is cached after its first load, so
 * switching back to a level is instant.
 */
const cache = new Map<Level, Question[]>();

export const bankSizes = sizes as Record<Level, number>;

export async function loadBank(level: Level): Promise<Question[]> {
  const cached = cache.get(level);
  if (cached) return cached;
  const mod = await import(`./banks/${level}.json`);
  const bank = (mod.default ?? mod) as Question[];
  cache.set(level, bank);
  return bank;
}
