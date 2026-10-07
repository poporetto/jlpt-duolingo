/**
 * Common verb and い-adjective opposites and slot-mates.
 *
 * An antonym shares no gloss word with its pair, so gloss-disjointness lets it
 * through — and in 「試合は何時に（始まります）か」 終わります fits just as well.
 * JMdict records antonyms for only a handful of senses, so the common pairs are
 * listed here. Any two words on one line may never be options together.
 */
export const OPPOSITES = `
始まる 終わる 終る 始める 終える 済む
開く 閉まる 閉める 開ける 閉じる
押す 引く 閉める
行く 来る 帰る 戻る 出かける
入る 出る 出す 入れる
上がる 下がる 上げる 下げる 降りる 乗る 登る
増える 減る 増やす 減らす
貸す 借りる 買う 売る 返す
教える 習う 学ぶ 教わる
勝つ 負ける
起きる 寝る 眠る
着る 脱ぐ 履く
付ける 消す 点ける 消える
立つ 座る 立てる
生まれる 死ぬ 生きる
覚える 忘れる 思い出す
遅れる 間に合う 急ぐ
勝つ 負ける
答える 聞く 尋ねる 質問する
集める 集まる 配る
始まる 遅れる 済む
晴れる 曇る 降る 止む
暑い 寒い 涼しい 暖かい 温かい
熱い 冷たい 温い
高い 安い 低い
大きい 小さい
長い 短い
広い 狭い
重い 軽い
多い 少ない
早い 速い 遅い
新しい 古い 若い
明るい 暗い
強い 弱い
近い 遠い
太い 細い
厚い 薄い
易しい 難しい 優しい
良い 悪い いい
嬉しい 悲しい 寂しい 楽しい
面白い つまらない
忙しい 暇
美しい 汚い 綺麗
甘い 辛い 苦い 酸っぱい
深い 浅い
硬い 柔らかい 固い
正しい 間違う
珍しい 普通
痛い 痒い
似る 似通う 食い違う 異なる 違う
黒い 白い 赤い 青い 黄色い 茶色い
`.trim().split('\n').map((line) => line.trim().split(/\s+/));

const partners = new Map();
for (const group of OPPOSITES) for (const a of group) for (const b of group) {
  if (a === b) continue;
  if (!partners.has(a)) partners.set(a, new Set());
  partners.get(a).add(b);
}
export const opposed = (a, b) => partners.get(a)?.has(b) ?? false;

/**
 * Words compatible with almost any slot of their class. 「（苦い）経験を味わった」
 * also takes 凄い; 「（珍しい）種類の魚」 also takes 美しい; 「ぶっ続けで（働いた）」
 * also takes 歩いた. They remain fine answers, but are never used as distractors.
 */
export const GENERIC = new Set(`
美しい 凄い すごい 素晴らしい 面白い 楽しい 良い 悪い いい ひどい 酷い 珍しい 新しい 古い
大きい 小さい 嬉しい 悲しい 怖い 恐ろしい 難しい 易しい 優しい 激しい 厳しい 強い 弱い
多い 少ない 早い 遅い 長い 短い 高い 安い 正しい 寂しい 楽しい 可愛い 懐かしい
歩く 走る 待つ 遊ぶ 休む 働く 見る 行く 来る 使う 持つ 言う 思う 考える 話す 読む 書く 聞く
する なる ある いる 出る 入る 帰る 始める 続ける 変わる 変える 見つける 探す
`.trim().split(/\s+/));
