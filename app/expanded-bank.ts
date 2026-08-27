import type { Level, Question, QuestionType } from './course-data';
import { assemblyDetails, grammarChoiceNotes, usageChoices, type AssemblyTemplate } from './question-quality.ts';
import { expandIntermediateBank } from './intermediate-bank.ts';
import { expandAdvancedBank } from './advanced-bank.ts';

type Spec = { itemType: string; jp: string; type: QuestionType };
type Word = { word: string; reading: string; meaning: string; sentence: string; paraphrase: string };

const n5Specs: Spec[] = [
  { itemType: 'Kanji reading', jp: '漢字読み', type: 'KANJI' },
  { itemType: 'Orthography', jp: '表記', type: 'KANJI' },
  { itemType: 'Contextual vocabulary', jp: '文脈規定', type: 'VOCABULARY' },
  { itemType: 'Paraphrase', jp: '言い換え類義', type: 'VOCABULARY' },
  { itemType: 'Grammar form', jp: '文の文法1（文法形式の判断）', type: 'GRAMMAR' },
  { itemType: 'Sentence assembly', jp: '文の文法2（文の組み立て）', type: 'GRAMMAR' },
  { itemType: 'Text grammar', jp: '文章の文法', type: 'GRAMMAR' },
  { itemType: 'Short passage', jp: '内容理解（短文）', type: 'READING' },
  { itemType: 'Mid-size passage', jp: '内容理解（中文）', type: 'READING' },
  { itemType: 'Information retrieval', jp: '情報検索', type: 'READING' },
  { itemType: 'Task comprehension', jp: '課題理解', type: 'LISTENING' },
  { itemType: 'Point comprehension', jp: 'ポイント理解', type: 'LISTENING' },
  { itemType: 'Verbal expressions', jp: '発話表現', type: 'LISTENING' },
  { itemType: 'Quick response', jp: '即時応答', type: 'LISTENING' },
];

const n4Specs: Spec[] = [
  { itemType: 'Kanji reading', jp: '漢字読み', type: 'KANJI' },
  { itemType: 'Orthography', jp: '表記', type: 'KANJI' },
  { itemType: 'Contextual vocabulary', jp: '文脈規定', type: 'VOCABULARY' },
  { itemType: 'Paraphrase', jp: '言い換え類義', type: 'VOCABULARY' },
  { itemType: 'Usage', jp: '用法', type: 'VOCABULARY' },
  { itemType: 'Grammar form', jp: '文の文法1（文法形式の判断）', type: 'GRAMMAR' },
  { itemType: 'Sentence assembly', jp: '文の文法2（文の組み立て）', type: 'GRAMMAR' },
  { itemType: 'Text grammar', jp: '文章の文法', type: 'GRAMMAR' },
  { itemType: 'Short passage', jp: '内容理解（短文）', type: 'READING' },
  { itemType: 'Mid-size passage', jp: '内容理解（中文）', type: 'READING' },
  { itemType: 'Information retrieval', jp: '情報検索', type: 'READING' },
  { itemType: 'Task comprehension', jp: '課題理解', type: 'LISTENING' },
  { itemType: 'Point comprehension', jp: 'ポイント理解', type: 'LISTENING' },
  { itemType: 'Verbal expressions', jp: '発話表現', type: 'LISTENING' },
  { itemType: 'Quick response', jp: '即時応答', type: 'LISTENING' },
];

const n5Words: Word[] = [
  { word: '学校', reading: 'がっこう', meaning: 'school', sentence: 'まいあさ　八じに　学校へ　いきます。', paraphrase: 'べんきょうする　ところ' },
  { word: '先生', reading: 'せんせい', meaning: 'teacher', sentence: 'わからないので　先生に　ききました。', paraphrase: 'べんきょうを　おしえる　人' },
  { word: '時間', reading: 'じかん', meaning: 'time', sentence: '時間が　ありませんから、いそぎましょう。', paraphrase: 'とけいで　はかる　もの' },
  { word: '電車', reading: 'でんしゃ', meaning: 'train', sentence: '駅から　電車に　のります。', paraphrase: 'せんろを　はしる　のりもの' },
  { word: '家族', reading: 'かぞく', meaning: 'family', sentence: '日よう日に　家族と　こうえんへ　いきました。', paraphrase: 'いっしょに　すんでいる　人たち' },
  { word: '毎日', reading: 'まいにち', meaning: 'every day', sentence: '毎日　日本ごを　三十分　べんきょうします。', paraphrase: '一日も　やすまずに' },
  { word: '天気', reading: 'てんき', meaning: 'weather', sentence: 'きょうは　天気が　いいです。', paraphrase: 'はれや　雨の　ようす' },
  { word: '友達', reading: 'ともだち', meaning: 'friend', sentence: '友達と　いっしょに　ひるごはんを　たべます。', paraphrase: 'なかの　いい　人' },
  { word: '食事', reading: 'しょくじ', meaning: 'meal', sentence: '七じに　家族と　食事を　します。', paraphrase: 'ごはんを　たべること' },
  { word: '飲み物', reading: 'のみもの', meaning: 'drink', sentence: 'あついですから、つめたい　飲み物が　ほしいです。', paraphrase: 'みずや　おちゃなど' },
  { word: '買い物', reading: 'かいもの', meaning: 'shopping', sentence: 'スーパーで　買い物を　しました。', paraphrase: 'みせで　ものを　かうこと' },
  { word: '来週', reading: 'らいしゅう', meaning: 'next week', sentence: '来週　とうきょうへ　いきます。', paraphrase: 'つぎの　しゅう' },
  { word: '午前', reading: 'ごぜん', meaning: 'morning / a.m.', sentence: 'びょういんは　午前九じからです。', paraphrase: 'ひるの　十二じより　まえ' },
  { word: '午後', reading: 'ごご', meaning: 'afternoon / p.m.', sentence: '午後三じに　ともだちが　きます。', paraphrase: 'ひるの　十二じより　あと' },
  { word: '入口', reading: 'いりぐち', meaning: 'entrance', sentence: '入口で　きっぷを　みせてください。', paraphrase: '中へ　はいる　ところ' },
  { word: '出口', reading: 'でぐち', meaning: 'exit', sentence: '出口は　あの　ドアです。', paraphrase: 'そとへ　でる　ところ' },
  { word: '病院', reading: 'びょういん', meaning: 'hospital', sentence: 'かぜですから、病院へ　いきます。', paraphrase: 'びょうきの　人が　いく　ところ' },
  { word: '会社', reading: 'かいしゃ', meaning: 'company', sentence: '父は　会社で　はたらいています。', paraphrase: 'しごとを　する　ところ' },
  { word: '電話', reading: 'でんわ', meaning: 'telephone', sentence: 'あとで　母に　電話を　かけます。', paraphrase: 'とおくの　人と　はなす　もの' },
  { word: '手紙', reading: 'てがみ', meaning: 'letter', sentence: 'きのう　友達に　手紙を　かきました。', paraphrase: 'かいて　人に　おくる　もの' },
  { word: '写真', reading: 'しゃしん', meaning: 'photograph', sentence: 'こうえんで　写真を　とりました。', paraphrase: 'カメラで　とる　もの' },
  { word: '名前', reading: 'なまえ', meaning: 'name', sentence: 'ここに　名前を　かいてください。', paraphrase: '人を　よぶ　ことば' },
];

const n4Words: Word[] = [
  { word: '予定', reading: 'よてい', meaning: 'plan or schedule', sentence: '来週の　予定を　教えてください。', paraphrase: 'これから　することの　計画' },
  { word: '連絡', reading: 'れんらく', meaning: 'contact or message', sentence: 'おくれるときは　電話で　連絡してください。', paraphrase: '知らせること' },
  { word: '約束', reading: 'やくそく', meaning: 'promise or appointment', sentence: '友達と　会う　約束を　しました。', paraphrase: 'することを　決めて　まもること' },
  { word: '準備', reading: 'じゅんび', meaning: 'preparation', sentence: '旅行の　準備は　もう　できました。', paraphrase: '前もって　用意すること' },
  { word: '経験', reading: 'けいけん', meaning: 'experience', sentence: '日本で　働いた　経験が　あります。', paraphrase: 'じっさいに　したこと' },
  { word: '説明', reading: 'せつめい', meaning: 'explanation', sentence: '先生が　使い方を　説明しました。', paraphrase: 'わかるように　話すこと' },
  { word: '必要', reading: 'ひつよう', meaning: 'necessary', sentence: '申しこみには　写真が　必要です。', paraphrase: 'なくては　ならないこと' },
  { word: '会議', reading: 'かいぎ', meaning: 'meeting', sentence: '午後から　会社で　会議が　あります。', paraphrase: 'みんなで　話し合うこと' },
  { word: '受付', reading: 'うけつけ', meaning: 'reception desk', sentence: '受付で　名前を　書いてください。', paraphrase: 'はじめに　手続きを　するところ' },
  { word: '利用', reading: 'りよう', meaning: 'use', sentence: 'この　部屋は　だれでも　利用できます。', paraphrase: '役に立つように　使うこと' },
  { word: '故障', reading: 'こしょう', meaning: 'breakdown', sentence: 'エレベーターは　故障しています。', paraphrase: 'きかいが　こわれること' },
  { word: '確認', reading: 'かくにん', meaning: 'confirmation', sentence: '出かける前に　時間を　確認しました。', paraphrase: 'まちがいが　ないか　たしかめること' },
  { word: '変更', reading: 'へんこう', meaning: 'change', sentence: '会議の　時間が　変更になりました。', paraphrase: '決めたことを　かえること' },
  { word: '紹介', reading: 'しょうかい', meaning: 'introduction', sentence: '友達に　いい　店を　紹介しました。', paraphrase: '知らないものを　教えること' },
  { word: '注意', reading: 'ちゅうい', meaning: 'attention or caution', sentence: '車に　注意して　道を　わたってください。', paraphrase: 'あぶなくないように　気をつけること' },
  { word: '到着', reading: 'とうちゃく', meaning: 'arrival', sentence: '電車は　十時に　到着します。', paraphrase: '目的の　場所に　つくこと' },
  { word: '出発', reading: 'しゅっぱつ', meaning: 'departure', sentence: 'バスは　駅前から　出発します。', paraphrase: 'ある場所から　出ること' },
  { word: '相談', reading: 'そうだん', meaning: 'consultation', sentence: '先生に　進学のことを　相談しました。', paraphrase: '決める前に　人の　意見を　聞くこと' },
  { word: '参加', reading: 'さんか', meaning: 'participation', sentence: '来月の　大会に　参加します。', paraphrase: '集まりや　活動に　入ること' },
  { word: '案内', reading: 'あんない', meaning: 'guidance', sentence: '駅員が　出口まで　案内してくれました。', paraphrase: '場所や　方法を　教えること' },
];

const n5Grammar = [
  { sentence: 'わたし（　）学生です。', answer: 'は', distractors: ['を', 'に', 'で'], note: 'は marks the sentence topic.' },
  { sentence: 'パン（　）たべます。', answer: 'を', distractors: ['が', 'へ', 'と'], note: 'を marks the direct object.' },
  { sentence: '学校（　）いきます。', answer: 'へ', distractors: ['を', 'が', 'と'], note: 'へ marks a direction or destination.' },
  { sentence: '七じ（　）おきます。', answer: 'に', distractors: ['を', 'で', 'へ'], note: 'に marks a specific time.' },
  { sentence: 'バス（　）会社へ　いきます。', answer: 'で', distractors: ['を', 'が', 'へ'], note: 'で marks the means of transport.' },
  { sentence: '母（　）買い物を　しました。', answer: 'と', distractors: ['を', 'へ', 'が'], note: 'と marks the person accompanying the speaker.' },
  { sentence: 'つくえの　上（　）本が　あります。', answer: 'に', distractors: ['を', 'で', 'へ'], note: 'に marks where something exists.' },
  { sentence: 'きょうは　きのう（　）あついです。', answer: 'より', distractors: ['まで', 'しか', 'だけ'], note: 'より marks the comparison baseline.' },
  { sentence: 'ここで　写真を　とっ（　）いけません。', answer: 'ては', distractors: ['ても', 'たり', 'から'], note: '～てはいけません expresses prohibition.' },
  { sentence: '日本ごの　本を　読み（　）です。', answer: 'たい', distractors: ['ない', 'ます', 'でした'], note: 'Verb stem + たい expresses a desire.' },
  { sentence: 'これ（　）わたしの　かさです。', answer: 'は', distractors: ['を', 'に', 'へ'], note: 'は marks the topic being identified.' },
  { sentence: 'わたし（　）いぬが　すきです。', answer: 'も', distractors: ['を', 'へ', 'より'], note: 'も means "also" and replaces は here.' },
  { sentence: 'これは　だれ（　）かばんですか。', answer: 'の', distractors: ['を', 'に', 'で'], note: 'の links a possessor to what they own.' },
  { sentence: 'あした　いっしょに　いきません（　）。', answer: 'か', distractors: ['よ', 'ね', 'の'], note: '～ませんか is how you invite someone.' },
  { sentence: 'かばんの　なかに　ペン（　）ノートが　あります。', answer: 'や', distractors: ['を', 'に', 'は'], note: 'や lists examples, implying there is more.' },
  { sentence: 'くじ（　）５じまで　はたらきます。', answer: 'から', distractors: ['まで', 'より', 'ほど'], note: 'から marks a starting point in time.' },
  { sentence: 'えきから　いえ（　）あるきました。', answer: 'まで', distractors: ['から', 'より', 'だけ'], note: 'まで marks the end point of a movement.' },
  { sentence: 'そらに　とり（　）います。', answer: 'が', distractors: ['を', 'へ', 'の'], note: 'が introduces a subject that is new information.' },
  { sentence: 'この　みずは　つめたく（　）です。', answer: 'ない', distractors: ['ません', 'なかった', 'では'], note: 'い-adjectives drop い and take くない to become negative.' },
  { sentence: 'きのうの　えいがは　おもしろ（　）です。', answer: 'かった', distractors: ['くない', 'でした', 'だった'], note: 'い-adjectives take かった for the past, not でした.' },
  { sentence: 'この　へやは　しずか（　）ありません。', answer: 'では', distractors: ['くは', 'では　ない', 'じゃない'], note: 'な-adjectives negate with ではありません, not くありません.' },
  { sentence: 'たなかさんは　しんせつ（　）人です。', answer: 'な', distractors: ['の', 'で', 'に'], note: 'な-adjectives take な before a noun.' },
  { sentence: 'ちょっと　まって（　）。', answer: 'ください', distractors: ['あります', 'います', 'でしょう'], note: 'て-form + ください makes a polite request.' },
  { sentence: 'いま　ごはんを　たべ（　）います。', answer: 'て', distractors: ['た', 'ない', 'ます'], note: '～ています describes an action in progress.' },
  { sentence: 'ここで　しゃしんを　とっても　いい（　）。', answer: 'ですか', distractors: ['ません', 'ました', 'でしょう'], note: '～てもいいですか asks for permission.' },
  { sentence: 'つかれましたから、すこし　やすみ（　）。', answer: 'ましょう', distractors: ['ますか', 'ません', 'ました'], note: '～ましょう proposes doing something together.' },
  { sentence: 'あたまが　いたい（　）、はやく　かえります。', answer: 'ので', distractors: ['のに', 'でも', 'まで'], note: 'ので gives a reason for what follows.' },
  { sentence: 'たかいです（　）、かいません。', answer: 'から', distractors: ['ので', 'まで', 'より'], note: 'から after です states a reason.' },
  { sentence: 'この　みせは　やすいです（　）、おいしくないです。', answer: 'が', distractors: ['から', 'ので', 'まで'], note: 'が joins two clauses in contrast, like "but".' },
  { sentence: 'ひまな（　）、ほんを　よみます。', answer: 'とき', distractors: ['まえ', 'あと', 'ごろ'], note: '～とき means "when" and takes な after a な-adjective.' },
  { sentence: 'ねる（　）に、はを　みがきます。', answer: 'まえ', distractors: ['あと', 'とき', 'ころ'], note: '～まえに means "before doing" and takes the plain present.' },
  { sentence: 'しごとの　あと（　）、ジムへ　いきます。', answer: 'で', distractors: ['に', 'は', 'を'], note: '～あとで means "after doing" and attaches to a noun with の or to the past plain form.' },
  { sentence: 'つくえの　上に　ねこが　（　）。', answer: 'います', distractors: ['あります', 'です', 'します'], note: 'います is for animate things; あります is for inanimate ones.' },
  { sentence: 'へやに　テレビが　（　）。', answer: 'あります', distractors: ['います', 'です', 'なります'], note: 'あります is used for the existence of objects.' },
  { sentence: 'きょうは　あめが　ふる（　）。', answer: 'でしょう', distractors: ['ましょう', 'ください', 'ませんか'], note: '～でしょう expresses a prediction.' },
  { sentence: 'ごはんを　たべ（　）、テレビを　みました。', answer: 'て', distractors: ['た', 'ない', 'ながら'], note: 'The て-form links actions in sequence.' },
  { sentence: 'にちようびは　そうじを　し（　）、かいものを　したり　します。', answer: 'たり', distractors: ['ても', 'ては', 'ながら'], note: '～たり～たりする lists representative activities.' },
  { sentence: 'まだ　しゅくだいを　して（　）。', answer: 'いません', distractors: ['ありません', 'ました', 'います'], note: 'まだ～ていません means "not yet".' },
  { sentence: 'ひらがなは　（　）　おぼえました。', answer: 'もう', distractors: ['まだ', 'とても', 'あまり'], note: 'もう means "already"; its opposite in this pattern is まだ ("not yet"), which takes a negative verb.' },
  { sentence: 'この　ケーキは　５００えん（　）です。', answer: 'ぐらい', distractors: ['しか', 'だけ', 'ずつ'], note: 'ぐらい gives an approximate amount.' },
  { sentence: 'ひとり　１まい（　）とって　ください。', answer: 'ずつ', distractors: ['ぐらい', 'しか', 'まで'], note: 'ずつ means "each" when distributing.' },
  { sentence: 'おかねが　１００えん（　）ありません。', answer: 'しか', distractors: ['だけ', 'ぐらい', 'ずつ'], note: 'しか takes a negative verb and means "only".' },
  { sentence: 'にほんごが　すこし（　）。', answer: 'わかります', distractors: ['わかりません', 'します', 'あります'], note: 'The object of わかる is marked with が, not を.' },
  { sentence: 'この　じしょを　つかっても　（　）です。', answer: 'いい', distractors: ['だめ', 'ない', 'ほしい'], note: '～てもいいです grants permission.' },
  { sentence: 'ここに　くるまを　とめ（　）いけません。', answer: 'ては', distractors: ['ても', 'たら', 'ながら'], note: '～てはいけません states a prohibition.' },
  { sentence: 'きょうしつには　だれ（　）いません。', answer: 'も', distractors: ['か', 'が', 'は'], note: 'だれも with a negative means "nobody".' },
  { sentence: 'かばんの　なかに　なに（　）ありますか。', answer: 'か', distractors: ['も', 'を', 'が'], note: 'なにか means "something" in a yes/no question.' },
  { sentence: '（　）　ひとが　きましたか。', answer: 'だれ', distractors: ['なに', 'どこ', 'いつ'], note: 'だれ asks which person.' },
  { sentence: 'テストは　（　）ですか。', answer: 'いつ', distractors: ['どこ', 'だれ', 'どう'], note: 'いつ asks about time. Unlike English, it never takes a particle like に when it stands alone as the question word.' },
  { sentence: 'えきは　（　）ですか。', answer: 'どこ', distractors: ['いつ', 'だれ', 'なに'], note: 'どこ asks about location.' },
  { sentence: 'にほんの　りょうりは　（　）ですか。', answer: 'どう', distractors: ['どこ', 'だれ', 'いくつ'], note: 'どう asks for an impression.' },
  { sentence: 'この　りんごは　（　）ですか。', answer: 'いくら', distractors: ['いくつ', 'どう', 'どこ'], note: 'いくら asks a price or amount of money; いくつ counts things and 何個 counts small objects.' },
  { sentence: 'たまごを　（　）　かいましたか。', answer: 'いくつ', distractors: ['いくら', 'どう', 'いつ'], note: 'いくつ asks how many things there are, and also how old someone is (おいくつですか).' },
  { sentence: '（　）　がっこうを　やすみましたか。', answer: 'どうして', distractors: ['どこ', 'いくら', 'どちら'], note: 'どうして asks for a reason.' },
  { sentence: 'にほんへ　いった　こと（　）あります。', answer: 'が', distractors: ['を', 'に', 'は'], note: '～ことがある takes が and expresses experience.' },
  { sentence: 'あの　人は　やまださん（　）おもいます。', answer: 'だと', distractors: ['には', 'では', 'とは'], note: 'The quoted content of 思う is marked with と.' },
  { sentence: 'せんせいは　「あした　テストです」（　）いいました。', answer: 'と', distractors: ['を', 'が', 'に'], note: 'と marks reported or quoted speech.' },
  { sentence: 'あめが　ふって、さむく　（　）。', answer: 'なりました', distractors: ['しました', 'ありました', 'いました'], note: 'い-adjective + くなる describes a change of state.' },
  { sentence: 'へやを　きれい（　）しました。', answer: 'に', distractors: ['で', 'を', 'は'], note: 'な-adjective + にする means to make something that way.' },
  { sentence: 'あたらしい　じてんしゃが　（　）です。', answer: 'ほしい', distractors: ['たい', 'すき', 'いい'], note: 'ほしい expresses wanting a thing; ～たい wants an action.' },
];

const n4Grammar = [
  { sentence: '音楽を　聞き（　）勉強します。', answer: 'ながら', distractors: ['まで', 'しか', 'ごろ'], note: '～ながら means doing two actions at the same time.' },
  { sentence: 'この　ペンは　書き（　）です。', answer: 'やすい', distractors: ['たい', 'そう', 'すぎ'], note: 'Verb stem + やすい means easy to do.' },
  { sentence: '雨が　降り（　）ですから、かさを　持っていきます。', answer: 'そう', distractors: ['たい', 'ながら', 'まで'], note: 'Stem + そう expresses an appearance or prediction.' },
  { sentence: '日本へ　行く（　）、日本語を　勉強しています。', answer: 'ために', distractors: ['あとで', 'ながら', 'ばかり'], note: '～ために introduces a purpose.' },
  { sentence: '宿題を　し（　）から、遊びに　行きます。', answer: 'て', distractors: ['た', 'ない', 'ます'], note: '～てから means after doing something.' },
  { sentence: 'この　薬を　飲ま（　）ほうが　いいです。', answer: 'ない', distractors: ['なく', 'ないで', 'なかった'], note: 'Negative plain form + ほうがいい gives advice not to do something.' },
  { sentence: '先生は　もう　帰った（　）です。', answer: 'よう', distractors: ['だけ', 'まで', 'しか'], note: '～ようです expresses a conclusion based on evidence.' },
  { sentence: 'この　漢字は　前にも　習った（　）が　あります。', answer: 'こと', distractors: ['もの', 'ところ', 'ため'], note: 'Past form + ことがある expresses past experience.' },
  { sentence: '駅に　着いたら　電話する（　）しました。', answer: 'ことに', distractors: ['ようで', 'ためを', 'ものが'], note: '～ことにする means deciding to do something.' },
  { sentence: '窓が　開け（　）あります。', answer: 'て', distractors: ['に', 'を', 'で'], note: 'Transitive verb + てある describes a resulting prepared state.' },
  { sentence: 'この　道を　まっすぐ　行く（　）、駅が　あります。', answer: 'と', distractors: ['ので', 'でも', 'ほど'], note: '～と marks a predictable result.' },
  { sentence: '来月から　新しい　仕事を　始める（　）です。', answer: 'つもり', distractors: ['ばかり', 'ところ', 'はず'], note: '～つもりです expresses an intention.' },
  { sentence: '先生が　来る（　）、みんな　静かに　なった。', answer: 'と', distractors: ['ので', 'のに', 'ても'], note: '～と marks an automatic, predictable consequence.' },
  { sentence: '雨が　降っ（　）、試合は　中止です。', answer: 'たら', distractors: ['ては', 'ても', 'ながら'], note: '～たら sets up a condition for a specific case.' },
  { sentence: '安けれ（　）買います。', answer: 'ば', distractors: ['たら', 'なら', 'ても'], note: '～ば is the conditional built on the hypothetical form.' },
  { sentence: '日本へ　行く（　）、京都が　おすすめです。', answer: 'なら', distractors: ['たら', 'ば', 'と'], note: '～なら responds to a topic the other person raised.' },
  { sentence: '高くて（　）、これを　買います。', answer: 'も', distractors: ['は', 'から', 'ので'], note: '～ても means "even if".' },
  { sentence: '母に　へやを　そうじ（　）ました。', answer: 'させられ', distractors: ['され', 'させ', 'して'], note: 'The causative-passive says you were made to do something.' },
  { sentence: '弟に　ケーキを　食べ（　）ました。', answer: 'られ', distractors: ['させ', 'させられ', 'ることが'], note: 'The suffering passive: something was done to your disadvantage.' },
  { sentence: '先生は　学生に　本を　読ま（　）ました。', answer: 'せ', distractors: ['れ', 'られ', 'させられ'], note: 'The causative expresses making or letting someone act.' },
  { sentence: 'この　水は　飲む　こと（　）できます。', answer: 'が', distractors: ['を', 'に', 'は'], note: '～ことができる takes が and expresses ability.' },
  { sentence: '漢字が　読める（　）に　なりました。', answer: 'よう', distractors: ['こと', 'もの', 'ところ'], note: '～ようになる marks a change in ability or habit.' },
  { sentence: '毎日　運動する（　）に　しています。', answer: 'よう', distractors: ['こと', 'もの', 'ほう'], note: '～ようにしている is an effort you keep making.' },
  { sentence: 'ここに　名前を　書く（　）です。', answer: 'はず', distractors: ['つもり', 'まま', 'ばかり'], note: '～はずです expresses a confident expectation.' },
  { sentence: '田中さんは　来ない（　）です。', answer: 'かも　しれない', distractors: ['はず', 'つもり', 'そう'], note: '～かもしれない expresses possibility.' },
  { sentence: '電気を　つけた（　）　寝て　しまった。', answer: 'まま', distractors: ['ほど', 'ばかり', 'うち'], note: '～まま means leaving a state unchanged.' },
  { sentence: '今　駅に　着いた（　）です。', answer: 'ところ', distractors: ['ばかりで', 'まま', 'つもり'], note: '～たところ marks the moment just after an action.' },
  { sentence: '日本に　来た（　）で、まだ　慣れていません。', answer: 'ばかり', distractors: ['ところ', 'まま', 'うち'], note: '～たばかり means something happened only recently.' },
  { sentence: 'この　問題は　むずかし（　）。', answer: 'すぎます', distractors: ['やすい', 'にくい', 'そう'], note: '～すぎる means excessively.' },
  { sentence: 'この　くつは　歩き（　）です。', answer: 'にくい', distractors: ['やすい', 'たい', 'そう'], note: '～にくい means hard to do.' },
  { sentence: '会議は　もう　始まった（　）です。', answer: 'そう', distractors: ['よう', 'はず', 'まま'], note: 'Plain form + そうです reports hearsay.' },
  { sentence: '空が　暗い。雨が　降り（　）です。', answer: 'そう', distractors: ['よう', 'らしい', 'はず'], note: 'Stem + そうです describes what it looks like.' },
  { sentence: 'あの　店は　人気が　ある（　）です。', answer: 'らしい', distractors: ['そう', 'つもり', 'まま'], note: '～らしい reports what you have gathered.' },
  { sentence: '友だちに　辞書を　貸して（　）。', answer: 'あげました', distractors: ['くれました', 'もらいました', 'いただきました'], note: '～てあげる is doing something for someone else.' },
  { sentence: '友だちが　手伝って（　）。', answer: 'くれました', distractors: ['あげました', 'もらいました', 'やりました'], note: '～てくれる is someone doing something for you.' },
  { sentence: '先生に　手紙を　直して（　）。', answer: 'いただきました', distractors: ['くださいました', 'あげました', 'やりました'], note: '～ていただく is the humble form of ～てもらう.' },
  { sentence: '窓が　開け（　）あります。', answer: 'て', distractors: ['に', 'を', 'で'], note: 'Transitive + てある marks a state left ready on purpose.' },
  { sentence: '旅行の　前に　切符を　買って（　）ます。', answer: 'おき', distractors: ['あり', 'い', 'しまい'], note: '～ておく is doing something in advance.' },
  { sentence: '財布を　なくして（　）ました。', answer: 'しまい', distractors: ['おき', 'あり', 'い'], note: '～てしまう marks completion, often with regret.' },
  { sentence: '駅まで　走って（　）ます。', answer: 'いき', distractors: ['き', 'おき', 'しまい'], note: '～ていく describes movement away from the speaker.' },
  { sentence: '母に　しかられ（　）。', answer: 'ました', distractors: ['させました', 'あげました', 'くれました'], note: 'The passive is formed with れる／られる.' },
  { sentence: '日本語が　話せる　人を　さがして（　）ます。', answer: 'い', distractors: ['おき', 'あり', 'しまい'], note: '～ている describes an ongoing action.' },
  { sentence: 'つかれた（　）、今日は　早く　寝ます。', answer: 'ので', distractors: ['のに', 'ても', 'なら'], note: 'ので gives a neutral, factual reason.' },
  { sentence: '勉強した（　）、点が　悪かった。', answer: 'のに', distractors: ['ので', 'から', 'なら'], note: '～のに marks a result contrary to expectation.' },
  { sentence: '雨が　やむ（　）、待ちましょう。', answer: 'まで', distractors: ['までに', 'あいだ', 'ながら'], note: '～まで means "until" a state continues.' },
  { sentence: '５時（　）に　この　仕事を　終わらせます。', answer: 'まで', distractors: ['ながら', 'うち', 'あいだ'], note: '～までに marks a deadline.' },
  { sentence: '子どもが　寝ている（　）に　そうじを　します。', answer: 'あいだ', distractors: ['まで', 'ながら', 'ころ'], note: '～あいだに means during a period.' },
  { sentence: 'この　紙は　１０まい（　）あります。', answer: 'ぐらい', distractors: ['しか', 'だけ', 'ずつ'], note: 'ぐらい gives an approximate quantity.' },
  { sentence: '駅へ　行く　道を　教えて（　）ませんか。', answer: 'ください', distractors: ['もらい', 'あげ', 'いただき'], note: '～てくださいませんか is a polite request.' },
  { sentence: '先生が　教室に　（　）ました。', answer: 'いらっしゃい', distractors: ['まいり', 'おり', 'いたし'], note: 'いらっしゃる is the honorific form of 来る.' },
  { sentence: 'わたしが　ご案内（　）ます。', answer: 'いたし', distractors: ['なさい', 'られ', 'いらっしゃい'], note: 'お／ご + noun + いたす is humble.' },
  { sentence: '荷物を　お持ち（　）ましょうか。', answer: 'し', distractors: ['なり', 'られ', 'いたし'], note: 'お + stem + する humbly offers to do something.' },
  { sentence: '社長は　もう　お帰りに　（　）ました。', answer: 'なり', distractors: ['し', 'いたし', 'まいり'], note: 'お + stem + になる is the honorific pattern.' },
  { sentence: 'あしたは　晴れる（　）が　あります。', answer: 'こと', distractors: ['もの', 'ところ', 'はず'], note: '～ことがある describes something that sometimes happens.' },
  { sentence: '弟は　医者に　なりたい（　）です。', answer: 'そう', distractors: ['よう', 'はず', 'つもり'], note: 'たい + そうです reports another person\u2019s stated wish.' },
  { sentence: 'この　りょうりは　思った（　）　おいしい。', answer: 'より', distractors: ['ほど', 'だけ', 'ばかり'], note: '～より marks the standard being exceeded.' },
  { sentence: 'この　問題は　思った（　）　むずかしくない。', answer: 'ほど', distractors: ['より', 'だけ', 'まで'], note: '～ほど～ない compares against an expectation.' },
  { sentence: '説明を　聞い（　）、やっと　わかった。', answer: 'て', distractors: ['たら', 'ても', 'ては'], note: 'The て-form links a cause to its outcome.' },
  { sentence: '林さんは　来る（　）どうか　わかりません。', answer: 'か', distractors: ['が', 'を', 'に'], note: '～かどうか embeds a yes/no question.' },
  { sentence: 'どこで　買った（　）　教えて　ください。', answer: 'か', distractors: ['と', 'が', 'を'], note: 'An embedded wh-question keeps か at the end.' },
];

const names = ['田中さん', '山田さん', 'リーさん', 'マリアさん', '佐藤さん'];
const places = ['としょかん', 'スーパー', 'えき', 'こうえん', 'びょういん', 'ゆうびんきょく', '市役所'];
const days = ['月よう日', '火よう日', '水よう日', '木よう日', '金よう日', '土よう日', '日よう日'];

function readingOptions(index: number) {
  return [0, 1, 2, 3].map((offset) => n5Words[(index + offset * 5) % n5Words.length].reading);
}

function wordOptions(index: number) {
  return [0, 1, 2, 3].map((offset) => n5Words[(index + offset * 5) % n5Words.length].word);
}

function optionsFrom(words: Word[], index: number, field: 'word' | 'reading' | 'paraphrase') {
  return [0, 1, 2, 3].map((offset) => words[(index + offset * 5) % words.length][field]);
}

/** 文の組み立て drills the *starred slot*, so every item needs its own sentence and
 *  its own answer. The generated version rotated a place name through one frame,
 *  leaving 24 items with two answers between them. */
const n5Assembly: { sentence: string; options: [string, string, string, string]; order: string; note: string }[] = [
  { sentence: 'つくえの　＿＿＿　＿★＿　＿＿＿　＿＿＿　あります。', options: ['に', 'うえ', 'が', 'ほん'], order: 'つくえの　うえ　に　ほん　が　あります', note: 'Anchor 〜が あります at the end, then work backwards.' },
  { sentence: 'わたしは　＿＿＿　＿★＿　＿＿＿　＿＿＿　のみます。', options: ['を', 'まいあさ', 'コーヒー', 'いっぱい'], order: 'わたしは　まいあさ　コーヒー　を　いっぱい　のみます', note: 'The object marker を follows the noun it marks, which fixes the second slot.' },
  { sentence: 'きのう　＿＿＿　＿★＿　＿＿＿　＿＿＿　かきました。', options: ['に', 'ともだち', 'てがみ', 'を'], order: 'きのう　ともだち　に　てがみ　を　かきました', note: 'The person who receives takes に; the thing written takes を.' },
  { sentence: 'この　へやは　＿＿＿　＿★＿　＿＿＿　＿＿＿　です。', options: ['て', 'ひろく', 'あかるい', 'とても'], order: 'この　へやは　ひろく　て　とても　あかるい　です', note: 'Two adjectives join with the て-form of the first.' },
  { sentence: 'いもうとは　＿＿＿　＿★＿　＿＿＿　＿＿＿　います。', options: ['を', 'テレビ', 'みて', 'いま'], order: 'いもうとは　いま　テレビ　を　みて　います', note: '〜ています closes the sentence, so みて sits immediately before います.' },
  { sentence: 'あした　＿＿＿　＿★＿　＿＿＿　＿＿＿　いきます。', options: ['で', 'でんしゃ', 'かいしゃ', 'へ'], order: 'あした　でんしゃ　で　かいしゃ　へ　いきます', note: 'で marks the means, へ marks the direction.' },
  { sentence: 'この　みせの　＿＿＿　＿★＿　＿＿＿　＿＿＿　です。', options: ['は', 'パン', 'とても', 'おいしい'], order: 'この　みせの　パン　は　とても　おいしい　です', note: 'The topic marker は follows the noun phrase it marks.' },
  { sentence: 'にちようびに　＿＿＿　＿★＿　＿＿＿　＿＿＿　しました。', options: ['と', 'ともだち', 'かいもの', 'を'], order: 'にちようびに　ともだち　と　かいもの　を　しました', note: 'と marks the companion; を marks what was done.' },
];

const n4Assembly: AssemblyTemplate[] = [
  { sentence: 'この　カメラは＿＿＿　＿★＿　＿＿＿　＿＿＿　です。', options: ['でも', 'だれ', 'つかい', 'やすい'], order: ['だれ', 'でも', 'つかい', 'やすい'], clue: 'だれでも is one unit, and verb stem + やすい means easy to do.' },
  { sentence: 'わたしは＿＿＿　＿★＿　＿＿＿　＿＿＿。', options: ['日本へ', '来年', '留学する', 'つもりです'], order: ['来年', '日本へ', '留学する', 'つもりです'], clue: 'The destination takes へ, and the plain verb modifies つもり.' },
  { sentence: '出かける前の習慣ですが、＿＿＿　＿★＿　＿＿＿　＿＿＿　ください。', options: ['前に', '出かける', '窓を', '閉めて'], order: ['出かける', '前に', '窓を', '閉めて'], clue: 'Dictionary form + 前に means before doing something.' },
  { sentence: '練習を続けたら、＿＿＿　＿★＿　＿＿＿　＿＿＿　なりました。', options: ['ように', '日本語が', '話せる', '少し'], order: ['日本語が', '少し', '話せる', 'ように'], clue: 'Potential verb + ようになる describes a change in ability.' },
  { sentence: '約束の時間より早く着いたので、＿＿＿　＿★＿　＿＿＿　＿＿＿　いました。', options: ['待って', '駅で', '友達を', '一時間'], order: ['駅で', '一時間', '友達を', '待って'], clue: 'で marks the location, and を marks the person waited for.' },
  { sentence: '天気予報によると、＿＿＿　＿★＿　＿＿＿　＿＿＿　そうです。', options: ['降る', '午後から', '雨が', '天気予報では'], order: ['天気予報では', '午後から', '雨が', '降る'], clue: 'The information source comes first; plain form + そうです reports hearsay.' },
  { sentence: 'きのうの夜は、＿＿＿　＿★＿　＿＿＿　＿＿＿　しました。', options: ['ながら', '音楽を', '聞き', '勉強を'], order: ['音楽を', '聞き', 'ながら', '勉強を'], clue: 'Verb stem + ながら connects simultaneous actions.' },
  { sentence: '返事がまだ来ないので、＿＿＿　＿★＿　＿＿＿　＿＿＿　分かりません。', options: ['参加できる', '仕事なので', 'かどうか', 'まだ'], order: ['仕事なので', '参加できる', 'かどうか', 'まだ'], clue: 'Embedded yes/no questions use かどうか before 分かる.' },
  { sentence: 'すみませんが、＿＿＿　＿★＿　＿＿＿　＿＿＿　ください。', options: ['ないで', 'ここに', '荷物を', '置か'], order: ['ここに', '荷物を', '置か', 'ないで'], clue: 'The negative request is verb ない-form + でください.' },
  { sentence: '昨日は＿＿＿　＿★＿　＿＿＿　＿＿＿　帰りました。', options: ['ので', '雨が', '降ってきた', '急いで'], order: ['雨が', '降ってきた', 'ので', '急いで'], clue: 'The reason clause ends in ので before the resulting action.' },
];

function makeN5(spec: Spec, index: number): Question {
  const word = n5Words[index % n5Words.length];
  const grammar = n5Grammar[index % n5Grammar.length];
  const name = names[index % names.length];
  const place = places[index % places.length];
  const day = days[index % days.length];
  const badge = spec.type === 'KANJI' ? '漢字' : spec.type === 'VOCABULARY' ? '語彙' : spec.type === 'GRAMMAR' ? '文法' : spec.type === 'READING' ? '読解' : '聴解';
  const common = { type: spec.type, badge, itemType: spec.itemType, jpItemType: spec.jp } as const;

  if (spec.itemType === 'Kanji reading') return { ...common, prompt: '＿＿の ことばは ひらがなで どう かきますか。', tokens: [`${name}は　${day}に　`, { kanji: word.word, reading: word.reading, target: true }, `について　はなします。`], options: readingOptions(index), answer: 0, note: `${word.word} is read ${word.reading} and means ${word.meaning}.` };
  if (spec.itemType === 'Orthography') return { ...common, prompt: '＿＿の ことばは どう かきますか。', tokens: [`${day}に　`, { kanji: word.reading, reading: '', target: true }, `を　かんじで　かきます。`], options: wordOptions(index), answer: 0, note: `${word.reading} is written ${word.word}.` };
  if (spec.itemType === 'Contextual vocabulary') return { ...common, prompt: '（　）に いれるのに いちばん いい ものを えらんで ください。', tokens: [`${name}：`, word.sentence.replace(word.word, '（　　）')], options: wordOptions(index), answer: 0, note: `${word.word}（${word.reading}） means ${word.meaning}; it is the natural fit in this context.` };
  if (spec.itemType === 'Paraphrase') return { ...common, prompt: 'ぶんと だいたい おなじ いみの ものを えらんで ください。', tokens: [`${day}、`, word.sentence], options: optionsFrom(n5Words, index, 'paraphrase'), answer: 0, note: `${word.word}（${word.reading}）means ${word.meaning}. In Japanese it can be restated as ${word.paraphrase}.` };
  if (spec.itemType === 'Grammar form') return { ...common, prompt: '（　）に いれるのに いちばん いい ものを えらんで ください。', tokens: [grammar.sentence], options: [grammar.answer, ...grammar.distractors], answer: 0, note: grammar.note };
  if (spec.itemType === 'Sentence assembly') { const item = n5Assembly[index % n5Assembly.length]; return { ...common, prompt: '★ に はいる ものは どれですか。', tokens: [item.sentence], options: [...item.options], answer: 0, note: `Correct order: ${item.order}。 The ★ is the second blank. ${item.note}` }; }
  if (spec.itemType === 'Text grammar') return { ...common, prompt: 'ぶんしょうの（　）に いちばん いい ものを えらんで ください。', passage: [[`${name}は　日よう日に　${place}へ　いきました。`], ['（　　）、そこで　友達に　あいました。']], options: ['そして', 'でも', 'まだ', 'だけ'], answer: 0, note: 'そして connects two events in sequence.' };
  if (spec.type === 'READING') {
    const isInfo = spec.itemType === 'Information retrieval';
    const isMid = spec.itemType === 'Mid-size passage';
    const passage = isInfo
      ? [[`${name}さんへ　${place}の　${day}の　おしらせ`], ['月よう日：やすみ'], ['火よう日から　金よう日：九じ～六じ'], ['土よう日：九じ～三じ']]
      : [[`${name}へ`], [`${day}の　十じに　${place}の　入口で　あいましょう。`], ['雨の　ときは　えきの　中で　まってください。'], ...(isMid ? [['そのあと、いっしょに　ひるごはんを　たべましょう。']] : []), ['　　　　　　　　　　たなか']];
    return { ...common, prompt: isInfo ? '土よう日は　何じまでですか。' : `${name}は　雨の　とき　どこで　まちますか。`, passage, options: isInfo ? ['三じ', '六じ', '九じ', 'やすみ'] : ['えきの　中', `${place}の　入口`, 'たなかさんの　家', '学校'], answer: 0, note: isInfo ? 'The Saturday line says 九じ～三じ.' : 'The message changes the meeting place to inside the station when it rains.' };
  }
  const audio = `n5-generated-${spec.itemType.toLowerCase().replace(/[^a-z]+/g, '-')}-${index + 1}`;
  if (spec.itemType === 'Quick response') return { ...common, prompt: 'きいて、いちばん いい へんじを えらんで ください。', audio, narration: [{ speaker: 'a', text: `${name}、${place}は　どこですか。` }], options: ['あの　えきの　となりです。', 'はい、そうでした。', '三つ　ください。', 'きのう　いきます。'], answer: 0, note: 'A どこ question needs an answer giving a location.' };
  if (spec.itemType === 'Verbal expressions') return { ...common, prompt: 'えを みて、いちばん いい ことばを えらんで ください。', audio, narration: [{ speaker: 'narrator', text: `${day}に　${name}が　人に　${place}までの　みちを　ききます。なんと　いいますか。` }], options: [`すみません、${place}は　どこですか。`, `${place}へ　いきました。`, `${place}が　すきでした。`, `${place}で　ください。`], answer: 0, note: 'すみません plus a どこ question is the natural way to ask directions.' };
  const point = spec.itemType === 'Point comprehension';
  return { ...common, prompt: point ? 'おんなの人は　何じに　いきますか。' : 'おんなの人は　これから　何を　しますか。', audio, narration: [{ speaker: 'narrator', text: `${day}に　${name}と　おんなの人が　はなしています。`, pauseAfter: 350 }, { speaker: 'a', text: `${place}へ　十じに　いきますか。`, pauseAfter: 250 }, { speaker: 'b', text: 'いいえ、十じは　こんでいます。十一じに　してください。', pauseAfter: 250 }, { speaker: 'a', text: 'わかりました。その　まえに　ぎんこうへ　いきます。' }], options: point ? ['十一じ', '十じ', '九じ', '十二じ'] : ['ぎんこうへ　いきます', `${place}へ　いきます`, '家へ　かえります', '電話を　します'], answer: 0, note: point ? 'The man changes the time from ten to eleven.' : 'Before the later appointment, she says she will go to the bank.' };
}

function makeN4(spec: Spec, index: number): Question {
  const word = n4Words[index % n4Words.length];
  const grammar = n4Grammar[index % n4Grammar.length];
  const name = names[index % names.length];
  const n4Places = ['市民センター', '図書館', '駅前の店', '会社', '病院', '文化会館', 'スポーツセンター'];
  const place = n4Places[index % n4Places.length];
  const day = days[index % days.length];
  const badge = spec.type === 'KANJI' ? '漢字' : spec.type === 'VOCABULARY' ? '語彙' : spec.type === 'GRAMMAR' ? '文法' : spec.type === 'READING' ? '読解' : '聴解';
  const common = { type: spec.type, badge, itemType: spec.itemType, jpItemType: spec.jp } as const;
  const words = optionsFrom(n4Words, index, 'word');
  const readings = optionsFrom(n4Words, index, 'reading');

  if (spec.itemType === 'Kanji reading') return { ...common, prompt: '＿＿の ことばの 読み方として いちばん いい ものを えらんで ください。', tokens: [{ kanji: word.word, reading: word.reading, target: true }, 'について　話しました。'], options: readings, answer: 0, note: `${word.word} is read ${word.reading} and means ${word.meaning}.` };
  if (spec.itemType === 'Orthography') return { ...common, prompt: '＿＿の ことばは どう 書きますか。', tokens: [{ kanji: word.reading, reading: '', target: true }, 'を　もう一度　たしかめました。'], options: words, answer: 0, note: `${word.reading} is written ${word.word}.` };
  if (spec.itemType === 'Contextual vocabulary') return { ...common, prompt: '（　）に 入れるのに いちばん いい ものを えらんで ください。', tokens: [word.sentence.replace(word.word, '（　　）')], options: words, answer: 0, note: `${word.word}（${word.reading}） means ${word.meaning} and fits this context.` };
  if (spec.itemType === 'Paraphrase') return { ...common, prompt: '＿＿と だいたい 同じ 意味の ものを えらんで ください。', tokens: [word.sentence], options: optionsFrom(n4Words, index, 'paraphrase'), answer: 0, note: `${word.word}（${word.reading}）means ${word.meaning}. In Japanese it can be restated as ${word.paraphrase}.` };
  if (spec.itemType === 'Usage') return { ...common, prompt: `「${word.word}」の 使い方として いちばん いい ものを えらんで ください。`, ...usageChoices(n4Words, index) };
  if (spec.itemType === 'Grammar form') return { ...common, prompt: '（　）に 入れるのに いちばん いい ものを えらんで ください。', tokens: [`${name}は　${day}に　`, grammar.sentence], options: [grammar.answer, ...grammar.distractors], optionNotes: grammarChoiceNotes(`N4 grammar pattern`, grammar.answer, grammar.distractors, grammar.note), answer: 0, note: grammar.note };
  if (spec.itemType === 'Sentence assembly') { const item = n4Assembly[index % n4Assembly.length]; return { ...common, prompt: '★ に 入る ものは どれですか。', tokens: [index >= n4Assembly.length ? `${day}、${item.sentence}` : item.sentence], ...assemblyDetails(item) }; }
  if (spec.itemType === 'Text grammar') return { ...common, prompt: '文章の（　）に 入れるのに いちばん いい ものを えらんで ください。', passage: [[`${day}、${place}で　イベントが　あります。`], [`${name}も　参加したいです。（　　）、その日は　仕事があります。`], ['今、休めるかどうか　会社に　聞いています。']], options: ['しかし', 'それで', 'そして', 'たとえば'], answer: 0, note: 'しかし introduces the contrast between wanting to attend and having work.' };
  if (spec.type === 'READING') {
    const info = spec.itemType === 'Information retrieval';
    const mid = spec.itemType === 'Mid-size passage';
    const passage = info ? [[`${name}さんへ　${place}　${day}の　教室`], ['料理：火曜日　18:00　3,000円'], ['写真：木曜日　19:00　2,000円'], ['会話：土曜日　10:00　2,500円'], ['申しこみは　始まる日の　一週間前までです。']]
      : [[`${name}さんへ`], [`会議は　${day}の　三時から　${place}で　行います。`], ['資料は　木曜日までに　受付へ　出してください。'], ...(mid ? [['会議のあとで　来月の　予定も　相談します。予定表を　持ってきてください。']] : []), ['　　　　　　　　　　　　　　山田']];
    return { ...common, prompt: info ? '木曜日の 夜に 参加できる 教室は どれですか。' : `${name}さんは 木曜日までに 何を しますか。`, passage, options: info ? ['写真', '料理', '会話', '春の教室'] : ['資料を　受付へ　出します', '会議に　出ます', '予定表を　作ります', '山田さんに　電話します'], answer: 0, note: info ? 'The Thursday 19:00 class is 写真.' : 'The message explicitly says to submit the materials by Thursday.' };
  }
  const slug = spec.itemType.toLowerCase().replace(/[^a-z]+/g, '-');
  const audio = `n4-generated-${slug}-${index + 1}`;
  if (spec.itemType === 'Quick response') return { ...common, prompt: '聞いて、いちばん いい 返事を えらんで ください。', audio, narration: [{ speaker: 'a', text: `${name}さん、この　${place}の　荷物、持ちましょうか。` }], options: ['ありがとうございます。お願いします。', 'はい、持ちませんでした。', 'いいえ、荷物ではありません。', 'もう　着きましたか。'], answer: 0, note: 'An offer with ～ましょうか is naturally accepted with お願いします.' };
  if (spec.itemType === 'Verbal expressions') return { ...common, prompt: '絵の ような とき、何と 言いますか。', audio, narration: [{ speaker: 'narrator', text: `${day}、${place}で　${name}が　足を　ふまれました。相手が　あやまっています。何と　言いますか。` }], options: ['大丈夫です。', 'お大事に。', 'いただきます。', 'いってらっしゃい。'], answer: 0, note: '大丈夫です reassures someone after a minor accident.' };
  const point = spec.itemType === 'Point comprehension';
  return { ...common, prompt: point ? '会議は 何曜日に なりましたか。' : '男の人は このあと まず 何を しますか。', audio, narration: [{ speaker: 'narrator', text: `${place}で　${name}と　女の人が　話しています。`, pauseAfter: 450 }, { speaker: 'a', text: '木曜日の　会議ですが、先生の　予定で　金曜日に　変わりました。', pauseAfter: 300 }, { speaker: 'b', text: 'わかりました。では、みんなに　連絡します。', pauseAfter: 250 }, { speaker: 'a', text: 'その前に、部屋が　使えるか　受付に　確認してください。' }], options: point ? ['金曜日', '木曜日', '水曜日', '土曜日'] : ['受付に　確認します', 'みんなに　連絡します', '先生に　電話します', '会議を　始めます'], answer: 0, note: point ? 'The meeting changed from Thursday to Friday.' : 'その前に signals that checking with reception must happen first.' };
}

export function expandQuestionBank(level: Level, existing: Question[]) {
  if (level === 'N1') return expandAdvancedBank(level, existing);
  if (level === 'N3' || level === 'N2') return expandIntermediateBank(level, existing);
  if (level !== 'N5' && level !== 'N4') return existing;
  const specs = level === 'N5' ? n5Specs : n4Specs;
  const desired = level === 'N5' ? 24 : 20;
  const target = specs.length * desired;
  const result = [...existing];
  const grammarPoints = level === 'N5' ? n5Grammar : n4Grammar;
  // Grammar specs run once per grammar point; otherwise most of the list is never
  // reached and the extra points are dead data.
  const desiredFor = (spec: Spec) =>
    spec.itemType === 'Grammar form' ? Math.max(desired, grammarPoints.length)
      : spec.itemType === 'Sentence assembly' && level === 'N5' ? n5Assembly.length
      : desired;
  specs.forEach((spec) => {
    const have = result.filter((question) => question.itemType === spec.itemType).length;
    for (let index = have; index < desiredFor(spec); index += 1) result.push(level === 'N5' ? makeN5(spec, index) : makeN4(spec, index));
  });
  if (result.length < target) throw new Error(`${level} bank expected at least ${target} questions, got ${result.length}`);
  return result;
}
