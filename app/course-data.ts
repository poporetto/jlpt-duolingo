export type Level = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
export type Token = string | { kanji: string; reading: string };

export type Question = {
  type: 'GRAMMAR' | 'KANJI' | 'VOCABULARY' | 'LISTENING';
  badge: string;
  itemType: string;
  prompt: string;
  tokens?: Token[];
  narration?: string;
  options: string[];
  answer: number;
  note: string;
  transcript?: string;
  image?: string;
  imageAlt?: string;
};

export const levels: Level[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const levelDetails: Record<Level, { title: string; subtitle: string; accent: string; lesson: string; grammar: string; kanji: string }> = {
  N5: { title: 'First foundations', subtitle: 'Everyday words and simple sentences', accent: '#55a47d', lesson: 'Everyday essentials', grammar: 'Particles & polite forms', kanji: '日 ・ 月 ・ 人' },
  N4: { title: 'Daily confidence', subtitle: 'Practical Japanese for familiar situations', accent: '#4c91a9', lesson: 'Plans and routines', grammar: '～ながら・～そうです', kanji: '予 ・ 定 ・ 遅' },
  N3: { title: 'Bridge to fluency', subtitle: 'Natural conversation and connected ideas', accent: '#7666a7', lesson: 'Work and arrangements', grammar: '～ことになっている', kanji: '確 ・ 認 ・ 変' },
  N2: { title: 'Real-world fluency', subtitle: 'Nuanced language for news, work and society', accent: '#d66a4c', lesson: 'Contrast and consequence', grammar: '～にもかかわらず', kanji: '報 ・ 政 ・ 経' },
  N1: { title: 'Advanced mastery', subtitle: 'Abstract, formal and highly nuanced Japanese', accent: '#a34d4d', lesson: 'Analysis and inference', grammar: '～を皮切りに', kanji: '払 ・ 拭 ・ 顕' },
};

export const questionBank: Record<Level, Question[]> = {
  N5: [
    { type: 'KANJI', badge: '漢字', itemType: 'Kanji reading', prompt: 'Choose the correct reading.', tokens: [{ kanji: '日曜日', reading: 'にちようび' }, 'に ともだちに あいます。'], options: ['にちようび', 'げつようび', 'どようび', 'かようび'], answer: 0, note: '日曜日（にちようび）means Sunday. This is a core N5 day-of-the-week reading.' },
    { type: 'VOCABULARY', badge: '語彙', itemType: 'Context vocabulary', prompt: 'Choose the best word for the blank.', tokens: ['みずが ＿＿ です。'], options: ['つめたい', 'くらい', 'おそい', 'せまい'], answer: 0, note: 'つめたい describes something cold to the touch, such as water.' },
    { type: 'GRAMMAR', badge: '文法', itemType: 'Sentence grammar', prompt: 'Choose the best particle.', tokens: ['きのう、', { kanji: '学校', reading: 'がっこう' }, '＿＿ ', { kanji: '行', reading: 'い' }, 'きました。'], options: ['に', 'で', 'を', 'が'], answer: 0, note: 'The destination of movement is marked with に: 学校に行きました.' },
    { type: 'LISTENING', badge: '聴解', itemType: 'Quick response', prompt: 'Listen and choose the most natural response.', narration: 'すみません。その赤いりんごを三つください。', options: ['はい、三つですね。', 'いいえ、りんごでした。', '三時に行きます。', '赤くありません。'], answer: 0, note: 'The shopkeeper confirms the quantity: “Three, right?”', transcript: 'すみません。その赤いりんごを三つください。', image: '/irasutoya-shopping.png', imageAlt: 'A family shopping at a supermarket' },
  ],
  N4: [
    { type: 'KANJI', badge: '漢字', itemType: 'Kanji reading', prompt: 'Choose the correct reading of the underlined word.', tokens: [{ kanji: '予定', reading: 'よてい' }, 'を かくにんします。'], options: ['よてい', 'よたい', 'ようてい', 'ようたい'], answer: 0, note: '予定（よてい）means a plan or schedule.' },
    { type: 'VOCABULARY', badge: '語彙', itemType: 'Context vocabulary', prompt: 'Choose the best expression for the blank.', tokens: ['いそげば、バスに ＿＿。'], options: ['間に合います', '乗り換えます', '通います', '迎えます'], answer: 0, note: '間に合う means “to be in time.” The conditional いそげば makes this a natural fit.' },
    { type: 'GRAMMAR', badge: '文法', itemType: 'Sentence grammar', prompt: 'Choose the best grammar for the blank.', tokens: ['わたしは ', { kanji: '音楽', reading: 'おんがく' }, 'を ', { kanji: '聞', reading: 'き' }, 'き＿＿、べんきょうします。'], options: ['ながら', 'まで', 'しか', 'ので'], answer: 0, note: 'Verb-stem + ながら expresses doing two actions at the same time.' },
    { type: 'LISTENING', badge: '聴解', itemType: 'Task-based comprehension', prompt: 'What will the woman buy first?', narration: 'スーパーで女の人と店員が話しています。女の人は、まず何を買いますか。女：すみません、牛乳はどこですか。店員：飲み物は奥です。でも、卵はもうすぐ売り切れますよ。女：そうですか。じゃあ、先にそちらへ行きます。', options: ['牛乳', '卵', 'パン', 'ジュース'], answer: 1, note: 'She changes her order after hearing that the eggs may sell out, so she will buy eggs first.', transcript: '牛乳を探していましたが、「卵はもうすぐ売り切れます」と聞き、「先にそちらへ行きます」と答えました。', image: '/irasutoya-shopping.png', imageAlt: 'A family holding a shopping basket in a supermarket' },
  ],
  N3: [
    { type: 'KANJI', badge: '漢字', itemType: 'Kanji reading', prompt: 'Choose the correct reading.', tokens: ['メールで ', { kanji: '確認', reading: 'かくにん' }, 'してください。'], options: ['かくにん', 'かくねん', 'こくにん', 'こくねん'], answer: 0, note: '確認（かくにん）means confirmation or checking.' },
    { type: 'VOCABULARY', badge: '語彙', itemType: 'Paraphrase', prompt: 'Choose the closest meaning of the highlighted expression.', tokens: ['うっかり ', { kanji: '約束', reading: 'やくそく' }, 'を ', { kanji: '忘', reading: 'わす' }, 'れてしまった。'], options: ['carelessly', 'deliberately', 'completely', 'fortunately'], answer: 0, note: 'うっかり describes doing something carelessly or without noticing.' },
    { type: 'GRAMMAR', badge: '文法', itemType: 'Sentence grammar', prompt: 'Choose the best grammar for the blank.', tokens: ['このビルでは、', { kanji: '夜', reading: 'よる' }, '10', { kanji: '時', reading: 'じ' }, 'にドアがしまる ＿＿。'], options: ['ことになっている', 'ことにしている', 'ようになっているか', 'ようにしてみる'], answer: 0, note: '～ことになっている describes a rule or arrangement already in place.' },
    { type: 'LISTENING', badge: '聴解', itemType: 'Quick response', prompt: 'Listen and choose the most natural response.', narration: '明日の会議、三時からに変わったそうですよ。', options: ['教えてくれて助かりました。', '三時まで会議でした。', '会議は変えませんでした。', '昨日なら大丈夫です。'], answer: 0, note: 'A natural response acknowledges useful new information: “Thanks, that helps.”', transcript: '明日の会議、三時からに変わったそうですよ。', image: '/irasutoya-meeting.png', imageAlt: 'Businesspeople having a meeting' },
  ],
  N2: [
    { type: 'KANJI', badge: '漢字', itemType: 'Kanji reading', prompt: 'Choose the correct reading.', tokens: [{ kanji: '経済', reading: 'けいざい' }, 'のニュースを読む。'], options: ['けいざい', 'きょうさい', 'けいさい', 'きょうざい'], answer: 0, note: '経済（けいざい）means economy. N2 kanji questions test common compounds in adult contexts.' },
    { type: 'VOCABULARY', badge: '語彙', itemType: 'Paraphrase', prompt: 'Choose the closest meaning of the highlighted expression.', tokens: ['この計画は ', { kanji: '大幅', reading: 'おおはば' }, 'に ', { kanji: '変更', reading: 'へんこう' }, 'された。'], options: ['slightly', 'secretly', 'significantly', 'suddenly'], answer: 2, note: '大幅に means significantly or by a large margin.' },
    { type: 'GRAMMAR', badge: '文法', itemType: 'Sentence grammar', prompt: 'Choose the best grammar for the blank.', tokens: [{ kanji: '雨', reading: 'あめ' }, 'が ', { kanji: '降', reading: 'ふ' }, 'っている ＿＿、', { kanji: '試合', reading: 'しあい' }, 'は ', { kanji: '予定通', reading: 'よていどお' }, 'り ', { kanji: '行', reading: 'おこな' }, 'われた。'], options: ['にもかかわらず', 'にしたがって', 'にかけて', 'に限って'], answer: 0, note: '～にもかかわらず means “despite” and marks a result contrary to expectation.' },
    { type: 'LISTENING', badge: '聴解', itemType: 'Point comprehension', prompt: 'Why does the station staff recommend another route?', narration: '駅員が利用客に案内しています。お客様、ただいま事故の影響で、この先の電車は到着まで三十分以上かかる見込みです。お急ぎでしたら、東口から地下鉄をご利用ください。振り替え乗車券はこちらでお渡しします。', options: ['The last train has already left.', 'The subway is cheaper today.', 'The delay is expected to exceed 30 minutes.', 'The east exit is temporarily closed.'], answer: 2, note: 'The key point is 三十分以上かかる見込み—an expected delay of more than 30 minutes.', transcript: '事故の影響で、この先の電車は到着まで三十分以上かかる見込みです。', image: '/irasutoya-station-staff.png', imageAlt: 'A station employee bowing apologetically' },
  ],
  N1: [
    { type: 'KANJI', badge: '漢字', itemType: 'Kanji reading', prompt: 'Choose the correct reading.', tokens: ['これまでの ', { kanji: '不安', reading: 'ふあん' }, 'を ', { kanji: '払拭', reading: 'ふっしょく' }, 'する。'], options: ['ふっしょく', 'ふっそく', 'はっしょく', 'はっそく'], answer: 0, note: '払拭（ふっしょく）means to wipe away or dispel, often used for doubts or concerns.' },
    { type: 'VOCABULARY', badge: '語彙', itemType: 'Context vocabulary', prompt: 'Choose the word that best fits the sentence.', tokens: ['データには ', { kanji: '顕著', reading: 'けんちょ' }, 'な ', { kanji: '差', reading: 'さ' }, 'が ＿＿。'], options: ['見られる', '見せられる', '見届ける', '見合わせる'], answer: 0, note: '顕著な差が見られる is a conventional formal collocation: “a marked difference can be observed.”' },
    { type: 'GRAMMAR', badge: '文法', itemType: 'Sentence grammar', prompt: 'Choose the best grammar for the blank.', tokens: ['東京公演 ＿＿、', { kanji: '全国', reading: 'ぜんこく' }, '十都市を ', { kanji: '回', reading: 'まわ' }, 'るツアーが ', { kanji: '始', reading: 'はじ' }, 'まる。'], options: ['を皮切りに', 'をものともせず', 'に即して', 'にひきかえ'], answer: 0, note: '～を皮切りに means “starting with,” followed by a series of similar events.' },
    { type: 'LISTENING', badge: '聴解', itemType: 'Summary comprehension', prompt: 'What is the speaker’s main conclusion?', narration: '気象予報士が地域イベントについて話しています。午前中は強い雨が残りますが、昼過ぎには弱まるでしょう。ただし、風は夕方まで強く、屋外に大型テントを設置するのは危険です。開始時刻を遅らせるだけでは十分とは言えません。来場者の安全を考えると、今回は屋内会場に切り替えるのが現実的です。', options: ['Cancel the event entirely.', 'Delay the event but keep it outdoors.', 'Move the event indoors for safety.', 'Use a larger outdoor tent.'], answer: 2, note: 'Although the rain will weaken, strong wind remains the decisive risk; the speaker concludes that moving indoors is realistic.', transcript: '雨は弱まりますが、風は夕方まで強いため、「屋内会場に切り替えるのが現実的」と結論づけています。', image: '/irasutoya-weather.png', imageAlt: 'A weather forecaster pointing to a forecast map' },
  ],
};
