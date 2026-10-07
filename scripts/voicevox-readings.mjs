/**
 * Pronunciation overrides applied to the *synthesis* text only.
 *
 * The displayed transcript and the hashed script id keep the original kanji —
 * these rewrites exist solely because VOICEVOX's dictionary picks the wrong
 * reading for a handful of surfaces, and in 聴解 a misread word is often the
 * answer itself. Each entry was found by diffing `/audio_query`'s `kana` for
 * every narration line against the reading the script intends.
 *
 * `requires` is asserted after the rewrite: if a future engine version changes
 * its dictionary, the render fails loudly instead of shipping a wrong reading.
 */
const S = '[　 ]*'; // scripts use full-width spaces as a visual aid, so patterns must span them

export const readings = [
  {
    // 方 is かた ("those who…") here, not ほう ("direction"). Only the person
    // sense is listed; 方法・両方・やり方・夕方 all already read correctly.
    pattern: new RegExp(`(お持ちの|自転車の|会員の|動かない)${S}方`, 'g'),
    replace: (_m, prefix) => `${prefix}かた`,
    requires: 'カタ',
    why: '方 → かた (person), misread as ホオ',
  },
  {
    pattern: new RegExp(`三人${S}一組`, 'g'),
    replace: () => '三人ひとくみ',
    requires: 'ヒトクミ',
    why: '一組 → ひとくみ, misread as イックミ',
  },
  {
    // 「十時四十分着」: 着 as an arrival-time suffix comes out as ぎ. The times
    // are the tested content in that ポイント理解 item.
    pattern: new RegExp(`分${S}着`, 'g'),
    replace: () => '分ちゃく',
    requires: 'チャク',
    why: '〜分着 → ぷんちゃく, misread as ぷんぎ',
  },
  {
    // 異音 is split into い + おと. It is the subject of an N1 task item, so the
    // whole dialogue is about a word the learner would not recognise spoken.
    pattern: /異音/g,
    replace: () => 'いおん',
    requires: 'イオン',
    why: '異音 → いおん, misread as いおと',
  },
  {
    // 何とか is なんとか; the engine reads なにとか.
    pattern: /何とか/g,
    replace: () => 'なんとか',
    requires: 'ナントカ',
    why: '何とか → なんとか, misread as なにとか',
  },
  {
    // 何で before a verb of coming or going asks the means (なにで). The engine
    // reads なんで, which means "why" — and the options are bus, bike, train.
    pattern: new RegExp(`何で(?=${S}(?:会社|学校|ここ|駅|うち|家)?${S}[にへ]?${S}(?:来|行|帰|通|き|い))`, 'g'),
    replace: () => 'なにで',
    requires: 'ナニデ',
    why: '何で (means) → なにで, misread as なんで (why)',
  },
  {
    // 市 here is いち (a market), not し (a city).
    pattern: /古本市/g,
    replace: () => '古本いち',
    requires: 'イチ',
    why: '古本市 → ふるほんいち, misread as ふるほんし',
  },
];

/** Rewrite one line for synthesis. Returns the text plus the kana each rewrite must produce. */
export function pronounce(text) {
  let out = text;
  const expect = [];
  for (const r of readings) {
    if (!r.pattern.test(out)) continue;
    out = out.replace(r.pattern, r.replace);
    expect.push({ requires: r.requires, why: r.why });
  }
  return { text: out, expect };
}
