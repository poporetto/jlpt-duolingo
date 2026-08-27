import type { Script } from './listening-scripts.ts';

/** Only these 大問 show an illustration on the real 問題用紙. 発話表現 *is* a picture
 *  plus "what do you say?"; 課題理解 and ポイント理解 carry one for many items.
 *  概要理解, 即時応答 and 統合理解 are printed with no picture at all. */
export const PICTURE_TYPES = new Set(['発話表現', '課題理解', 'ポイント理解']);


/** Scene lookup, most specific first — the first match wins, so narrow patterns
 *  (電車の中) must precede broad ones (駅). Alt text describes the drawing, not
 *  the Japanese scene, because it is read aloud to screen-reader users. */
const SCENES: [RegExp, string, string][] = [
  [/コピー機|プリンター|印刷|コピーして/, '/irasutoya-copier.webp', 'A woman operating an office photocopier'],
  [/電車の　?中|混んだ　?電車|つり革|車内/, '/irasutoya-train.webp', 'Two passengers sitting side by side on a train'],
  [/引っ越/, '/irasutoya-moving.webp', 'A removal truck marked “moving house”'],
  [/合格/, '/irasutoya-congrats.webp', 'Two students cheering in front of an exam results board'],
  [/空港|飛行機/, '/irasutoya-airport.webp', 'An airport terminal with an aeroplane on the apron'],
  [/図書館/, '/irasutoya-library.webp', 'Two people reading at a table in a library'],
  [/病院|風邪|かぜ|医者/, '/irasutoya-hospital.webp', 'A receptionist standing at a hospital front desk'],
  [/郵便局|銀行/, '/irasutoya-post-office.webp', 'A Japanese post office building with a postbox outside'],
  [/農園|収穫|台風/, '/irasutoya-farm.webp', 'Two farmers holding armfuls of harvested rice'],
  [/レストラン|注文した|食事|料理/, '/irasutoya-restaurant.webp', 'A family restaurant seen from the street'],
  [/公園|花見|屋外|運動会/, '/irasutoya-park.webp', 'A public park with a slide and climbing frame'],
  [/道に　?迷|道が　?わかりません|えきへの　?みち|道を/, '/irasutoya-directions.webp', 'A police officer pointing the way for an elderly passer-by'],
  [/荷物|にもつ/, '/irasutoya-luggage.webp', 'A woman struggling to carry a heavy cardboard box'],
  [/電話|でんわ/, '/irasutoya-phone.webp', 'A businesswoman speaking on a mobile phone'],
  [/教室|授業|研究室|講義|大学|学校|がっこう|先生/, '/irasutoya-classroom.webp', 'Two students studying at their desks in a classroom'],
  [/友だち|ともだち|同僚|先輩/, '/irasutoya-friends.webp', 'Two women standing and talking to each other'],
];

export function pictureFor(script: Script) {
  const text = script.narration.map((line) => line.text).join('');
  for (const [pattern, src, alt] of SCENES) {
    if (pattern.test(text)) return { image: src, imageAlt: alt };
  }
  // Fall back to the broad setting the script was authored with.
  return script.image ? { image: script.image, imageAlt: script.imageAlt } : {};
}


/** Same lookup for text items, which carry their scene in the passage or sentence
 *  rather than in a narration. Returns nothing when no scene is recognisable —
 *  a wrong picture is worse than none. */
export function pictureForText(text: string) {
  for (const [pattern, src, alt] of SCENES) {
    if (pattern.test(text)) return { image: src, imageAlt: alt };
  }
  return {};
}
