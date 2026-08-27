import type { Level, Question, QuestionType } from './course-data';
import { assemblyDetails, grammarChoiceNotes, usageChoices, type AssemblyTemplate } from './question-quality.ts';

type Spec = { itemType: string; jp: string; type: QuestionType };
type Word = { word: string; reading: string; meaning: string; paraphrase: string; sentence: string };

const specs: Spec[] = [
  ['Kanji reading', '漢字読み', 'KANJI'],
  ['Contextual vocabulary', '文脈規定', 'VOCABULARY'], ['Paraphrase', '言い換え類義', 'VOCABULARY'], ['Usage', '用法', 'VOCABULARY'],
  ['Grammar form', '文の文法1（文法形式の判断）', 'GRAMMAR'], ['Sentence assembly', '文の文法2（文の組み立て）', 'GRAMMAR'], ['Text grammar', '文章の文法', 'GRAMMAR'],
  ['Short passage', '内容理解（短文）', 'READING'], ['Mid-size passage', '内容理解（中文）', 'READING'], ['Long passage', '内容理解（長文）', 'READING'], ['Integrated reading', '統合理解', 'READING'], ['Thematic reading', '主張理解（長文）', 'READING'], ['Information retrieval', '情報検索', 'READING'],
  ['Task comprehension', '課題理解', 'LISTENING'], ['Point comprehension', 'ポイント理解', 'LISTENING'], ['Summary comprehension', '概要理解', 'LISTENING'], ['Quick response', '即時応答', 'LISTENING'], ['Integrated listening', '統合理解', 'LISTENING'],
].map(([itemType, jp, type]) => ({ itemType, jp, type: type as QuestionType }));

const words: Word[] = [
  ['払拭', 'ふっしょく', 'dispelling', '好ましくない考えや状態をすっかり取り除くこと', '新制度への不安を払拭するには丁寧な説明が欠かせない。'],
  ['顕著', 'けんちょ', 'remarkable', '違いがはっきり現れている様子', '地域によって回答の傾向に顕著な差が見られた。'],
  ['踏襲', 'とうしゅう', 'following precedent', '以前からの方法や方針をそのまま受け継ぐこと', '従来の方式を踏襲するだけでは課題を解決できない。'],
  ['脆弱', 'ぜいじゃく', 'fragile or vulnerable', '外からの影響に弱く壊れやすい様子', '災害時には通信網の脆弱さが明らかになった。'],
  ['示唆', 'しさ', 'suggestion or implication', '直接言わずに重要な可能性を示すこと', 'この結果は従来の前提を見直す必要性を示唆している。'],
  ['乖離', 'かいり', 'divergence', '本来近いはずの二つが離れていること', '制度の理念と実際の運用には乖離がある。'],
  ['擁護', 'ようご', 'defense or advocacy', '立場や権利を守って支持すること', '委員は少数派の意見を擁護する発言をした。'],
  ['懸念', 'けねん', 'concern', '悪い結果になるのではないかと心配すること', '拙速な導入が混乱を招くとの懸念が示された。'],
  ['模索', 'もさく', 'exploration', '手探りでよりよい方法を探し求めること', '各社は環境負荷を抑える生産方法を模索している。'],
  ['包括', 'ほうかつ', 'inclusion or comprehensiveness', '複数の要素を広く一つに含むこと', '新しい指針は安全と利便性を包括的に扱っている。'],
  ['阻害', 'そがい', 'obstruction', '物事の進行を妨げること', '複雑な手続きが新規参入を阻害している。'],
  ['是正', 'ぜせい', 'correction', '悪い点や不公平を正しく改めること', '地域間の格差を是正する施策が求められる。'],
  ['精査', 'せいさ', 'close examination', '細部まで念入りに調べること', '公表前にデータの妥当性を精査する必要がある。'],
  ['暫定', 'ざんてい', 'provisional', '正式に決まるまで一時的に定めること', '委員会は暫定的な運用基準を発表した。'],
  ['誘発', 'ゆうはつ', 'triggering', 'あることが別の現象を引き起こすこと', '刺激の強い表現は不要な対立を誘発しかねない。'],
  ['逸脱', 'いつだつ', 'deviation', '定められた範囲や本筋から外れること', '議論が本来の目的から逸脱してしまった。'],
].map(([word, reading, meaning, paraphrase, sentence]) => ({ word, reading, meaning, paraphrase, sentence }));

const grammar = [
  ['～を皮切りに', '東京公演（　）、全国十都市で上演される。', 'を皮切りに', ['を限りに', 'をもって', 'をよそに'], 'uses one event as the starting point for a series'],
  ['～んがため', '目標を達成せ（　）、彼は休日も研究を続けた。', 'んがため', ['んばかりに', 'んとして', 'んものを'], 'expresses a strong purpose in formal language'],
  ['～に足る', 'この報告書は十分に信頼する（　）内容だ。', 'に足る', ['に堪えない', 'に即した', 'に及ばない'], 'means worthy of or sufficient to'],
  ['～と相まって', '技術の進歩（　）、需要は急速に拡大した。', 'と相まって', ['とあって', 'ときたら', 'としたところで'], 'means together with another factor'],
  ['～を余儀なくされる', '大雪のため、計画の変更（　）。', 'を余儀なくされた', ['を禁じ得なかった', 'に堪えなかった', 'に至らなかった'], 'means being compelled by circumstances'],
  ['～までもない', '結果は明らかで、改めて説明する（　）。', 'までもない', ['べくもない', 'にもほどがある', 'きらいがある'], 'means there is no need to go so far as to'],
  ['～ずにはおかない', 'その演説は聴衆を感動させ（　）。', 'ずにはおかない', ['ずにはすまない', 'ないではない', 'ないものでもない'], 'means something inevitably causes a reaction'],
  ['～ならでは', '熟練した職人（　）の細かな工夫が見られる。', 'ならでは', ['なりに', 'ながらに', 'ばかりに'], 'means distinctive or possible only for'],
  ['～をものともせず', '選手は激しい雨（　）走り続けた。', 'をものともせず', ['をよそに', 'を限りに', 'をおいて'], 'means undaunted by an obstacle'],
  ['～にかたくない', '突然の知らせに驚いたことは想像（　）。', 'にかたくない', ['にたえない', 'にあたらない', 'に及ばない'], 'means easy to imagine'],
  ['～そばから', '新しい単語を覚えた（　）忘れてしまう。', 'そばから', ['ところを', 'なりに', 'あげくに'], 'means as soon as one thing happens, another follows'],
  ['～を禁じ得ない', '被災地の映像に同情（　）。', 'を禁じ得ない', ['を余儀なくする', 'に堪えない', 'に足りない'], 'means unable to suppress an emotion'],
  ['～に即して', '現場の実情（　）判断すべきだ。', 'に即して', ['にひきかえ', 'に先んじて', 'にかこつけて'], 'means in accordance with actual conditions'],
  ['～ともなく', '窓の外を見る（　）眺めていた。', 'ともなく', ['ものなら', 'ばかりに', 'どころで'], 'means doing something without a clear intention'],
  ['～が早いか', 'ベルが鳴る（　）、学生たちは教室を飛び出した。', 'が早いか', ['かたがた', 'かたわら', 'ところを'], 'means as soon as'],
  ['～べく', '事態を改善す（　）、新たな委員会が設置された。', 'べく', ['まじく', 'ごとく', 'らしく'], 'is a formal purpose expression'],
  ['～をものともせず', '激しい雨（　）、救助活動は続けられた。', 'をものともせず', ['をよそに', 'を限りに', 'をおいて'], 'means undaunted by a hardship'],
  ['～をよそに', '住民の反対（　）、工事は進められた。', 'をよそに', ['をものともせず', 'をこめて', 'をめぐって'], 'means disregarding what others feel or say'],
  ['～を余儀なくされる', '資金不足で計画は中止（　）。', 'を余儀なくされた', ['を禁じ得ない', 'にたえない', 'を余儀なくする'], 'means forced into an unwanted outcome'],
  ['～を禁じ得ない', 'その光景には驚き（　）。', 'を禁じ得ない', ['にたえない', 'に及ばない', 'を余儀なくされる'], 'means unable to suppress a feeling'],
  ['～にかたくない', '彼の心情は察する（　）。', 'にかたくない', ['にたえない', 'に及ばない', 'にあたらない'], 'means easy to imagine'],
  ['～にあたらない', '彼の合格は驚く（　）。', 'にあたらない', ['にかたくない', 'にたえない', 'に及ばない'], 'means there is no need to react that way'],
  ['～に及ばない', 'わざわざお越しになる（　）。', 'には及ばない', ['にあたらない', 'にたえない', 'にかたくない'], 'means there is no need to go that far'],
  ['～にたえない', 'その報道は見る（　）。', 'にたえない', ['にあたらない', 'に及ばない', 'にかたくない'], 'means too painful or poor to bear'],
  ['～ずにはいられない', 'この作品には感動せ（　）。', 'ずにはいられない', ['ざるを得ない', 'ずにはすまない', 'てはならない'], 'means unable to stop oneself feeling or acting'],
  ['～ずにはすまない', '迷惑をかけた以上、謝ら（　）。', 'ずにはすまない', ['ずにはいられない', 'ないではない', 'てはかなわない'], 'means social pressure makes it unavoidable'],
  ['～てやまない', 'ご活躍を願っ（　）。', 'てやまない', ['てはばからない', 'てかなわない', 'てならない'], 'expresses a wish held without end'],
  ['～てならない', '結果が気になっ（　）。', 'てならない', ['てやまない', 'てはばからない', 'てかまわない'], 'means a feeling is overwhelming'],
  ['～きらいがある', '彼は物事を悲観的に考える（　）。', 'きらいがある', ['おそれがある', 'しまつだ', 'ずくめだ'], 'points out an undesirable tendency'],
  ['～しまつだ', '注意しても直らず、最後は遅刻する（　）。', 'しまつだ', ['きらいがある', 'ずくめだ', 'までだ'], 'marks a bad end state after a bad process'],
  ['～ずくめ', '今年はいいこと（　）だった。', 'ずくめ', ['まみれ', 'だらけ', 'がち'], 'means entirely filled with one quality'],
  ['～まみれ', '子どもは泥（　）で帰ってきた。', 'まみれ', ['ずくめ', 'がち', 'ぎみ'], 'means covered in something unpleasant'],
  ['～がち', '最近、疲れ（　）だ。', 'がち', ['ぎみ', 'ずくめ', 'まみれ'], 'means tending to be that way'],
  ['～ぎみ', '少し風邪（　）です。', 'ぎみ', ['がち', 'まみれ', 'ずくめ'], 'means slightly showing a sign of something'],
  ['～あっての', 'お客様（　）商売だ。', 'あっての', ['ならではの', 'ゆえの', 'なりの'], 'means it only exists because of that'],
  ['～ならでは', 'この店（　）の味だ。', 'ならでは', ['あっての', 'ゆえの', 'ながらの'], 'means uniquely characteristic of'],
  ['～ゆえに', '若さ（　）の失敗もある。', 'ゆえ', ['あって', 'ながら', 'なり'], 'is a formal "because of"'],
  ['～ながらに', '彼は生まれ（　）の才能を持つ。', 'ながら', ['ゆえ', 'あって', 'なり'], 'means while remaining in that state'],
  ['～いかんによらず', '理由の（　）、遅刻は認められない。', 'いかんによらず', ['いかんでは', 'ならではで', 'あってこそ'], 'means regardless of'],
  ['～をおいて', 'この仕事は彼（　）ほかにできる人はいない。', 'をおいて', ['をもって', 'を限りに', 'をよそに'], 'means apart from, no one else'],
  ['～をもって', '本日（　）、受付を終了します。', 'をもって', ['をおいて', 'をよそに', 'を皮切りに'], 'formally marks a boundary or means'],
  ['～を限りに', '今月（　）、営業を終了する。', 'を限りに', ['を皮切りに', 'をもって', 'をおいて'], 'means ending as of that point'],
  ['～たりとも', '一日（　）忘れたことはない。', 'たりとも', ['なりとも', 'すらも', 'だに'], 'means not even one, with a negative'],
  ['～すら', '専門家で（　）解けない問題だ。', 'すら', ['こそ', 'だに', 'なり'], 'is a formal "even"'],
  ['～だに', '想像する（　）恐ろしい。', 'だに', ['すら', 'こそ', 'なり'], 'means even merely doing that'],
  ['～ともなると', '責任者（　）、責任も増える。', 'ともなると', ['ともあろう', 'とばかりに', 'とあって'], 'means once you reach that position'],
  ['～とあって', '連休（　）、道路は混雑している。', 'とあって', ['ともなると', 'とばかりに', 'といえども'], 'gives a special circumstance as the reason'],
  ['～といえども', '専門家（　）、間違えることはある。', 'といえども', ['とあって', 'ともなると', 'とばかりに'], 'is a formal "even though"'],
  ['～はおろか', '漢字（　）、ひらがなも読めない。', 'はおろか', ['ばかりか', 'どころか', 'のみならず'], 'means "let alone", with a stronger case following'],
  ['～もさることながら', '価格（　）、品質も重要だ。', 'もさることながら', ['はおろか', 'にもまして', 'ならまだしも'], 'concedes one point and adds a bigger one'],
  ['～にもまして', '去年（　）、今年は忙しい。', 'にもまして', ['もさることながら', 'はおろか', 'ならまだしも'], 'means even more than'],
  ['～ならまだしも', '一度（　）、三度も遅刻するとは。', 'ならまだしも', ['にもまして', 'はおろか', 'とはいえ'], 'means if it were only that, it would be tolerable'],
  ['～べく', '真相を確かめる（　）、調査を始めた。', 'べく', ['べからず', 'べきで', 'ものを'], 'is a formal purpose marker'],
  ['～べからず', 'ここにごみを捨てる（　）。', 'べからず', ['べく', 'までもない', 'ものを'], 'is a formal written prohibition'],
  ['～までもない', 'わざわざ説明する（　）。', 'までもない', ['にあたらない', 'べからず', 'ものを'], 'means it is not even worth doing'],
  ['～までだ', '断られたら、あきらめる（　）。', 'までだ', ['ものを', 'ばかりだ', 'しまつだ'], 'means that is simply all one will do'],
  ['～ものを', '早く言ってくれれば助けられた（　）。', 'ものを', ['までだ', 'ばかりに', 'ながらも'], 'expresses regret about what could have been'],
  ['～ばかりに', '一言言った（　）、けんかになった。', 'ばかりに', ['ものを', 'までに', 'ゆえに'], 'blames one small cause for a bad result'],
  ['～こととて', '慣れぬ（　）、失礼いたしました。', 'こととて', ['ものを', 'ゆえに', 'ながらも'], 'is a formal apologetic reason'],
  ['～とはいえ', '春（　）、まだ肌寒い。', 'とはいえ', ['とあって', 'ともなると', 'といえども'], 'concedes a fact before qualifying it'],
  ['～かたわら', '教師の（　）、小説を書いている。', 'かたわら', ['かたがた', 'がてら', 'そばから'], 'means alongside a main occupation'],
  ['～そばから', '片づける（　）、また散らかる。', 'そばから', ['かたわら', 'がてら', 'なり'], 'means as soon as, and repeatedly'],
  ['～や否や', '席に着く（　）、話し始めた。', 'や否や', ['そばから', 'なり', 'かたわら'], 'means the instant something happened'],
] as const;

const people = ['高橋氏', '森氏', '佐藤教授', '木村委員', '山本記者', '伊藤研究員', '中村氏', '小林氏'];
const settings = ['研究会', '政策委員会', '大学', '市民フォーラム', '企業説明会', '国際会議', '編集会議', '公開討論会'];
const badge = (type: QuestionType) => type === 'KANJI' ? '漢字' : type === 'VOCABULARY' ? '語彙' : type === 'GRAMMAR' ? '文法' : type === 'READING' ? '読解' : '聴解';
const pick4 = (index: number, field: 'word' | 'reading' | 'paraphrase') => [0, 1, 2, 3].map((offset) => words[(index + offset * 5) % words.length][field]);
const slug = (value: string) => value.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

const assemblies: AssemblyTemplate[] = [
  { sentence: '＿＿＿ ＿★＿ ＿＿＿ ＿＿＿ と言える。', options: ['見直す', 'これまでの前提を', 'に足る', 'ものだ'], order: ['これまでの前提を', '見直す', 'に足る', 'ものだ'], clue: '見直すに足る forms “worthy of reconsidering”.' },
  { sentence: '資料を読む限り、＿＿＿ ＿★＿ ＿＿＿ ＿＿＿。', options: ['十分な根拠に', 'その主張は', '基づいている', 'とは言い難い'], order: ['その主張は', '十分な根拠に', '基づいている', 'とは言い難い'], clue: '根拠に基づく is the fixed collocation, followed by a quoted judgement.' },
  { sentence: '現時点では、＿＿＿ ＿★＿ ＿＿＿ ＿＿＿。', options: ['検証する', '制度の効果を', 'に足る', 'データがない'], order: ['制度の効果を', '検証する', 'に足る', 'データがない'], clue: 'Verb + に足る modifies the following noun.' },
  { sentence: '説明会での＿＿＿ ＿★＿ ＿＿＿ ＿＿＿。', options: ['をよそに', '住民の反対', '工事が', '進められた'], order: ['住民の反対', 'をよそに', '工事が', '進められた'], clue: 'をよそに attaches to the concern being disregarded.' },
  { sentence: '例年どおりなら、＿＿＿ ＿★＿ ＿＿＿ ＿＿＿。', options: ['公表される', '結果が', 'が早いか', '問い合わせが相次いだ'], order: ['結果が', '公表される', 'が早いか', '問い合わせが相次いだ'], clue: 'Dictionary form + が早いか marks an immediate sequence.' },
  { sentence: 'この分野では、＿＿＿ ＿★＿ ＿＿＿ ＿＿＿。', options: ['ですら', '専門家', '判断を誤る', 'ことがある'], order: ['専門家', 'ですら', '判断を誤る', 'ことがある'], clue: 'ですら follows the exceptional example being highlighted.' },
  { sentence: '机上の議論ではなく、＿＿＿ ＿★＿ ＿＿＿ ＿＿＿。', options: ['即して', '現場の実情に', '対応を', '改めるべきだ'], order: ['現場の実情に', '即して', '対応を', '改めるべきだ'], clue: 'に即して is a fixed formal expression meaning “in accordance with”.' },
  { sentence: '住民の＿＿＿ ＿★＿ ＿＿＿ ＿＿＿。', options: ['支援あっての', '改革は', 'ものだと', '忘れてはならない'], order: ['改革は', '支援あっての', 'ものだと', '忘れてはならない'], clue: 'XあってのY states that Y depends on X.' },
];

function language(spec: Spec, index: number): Question | null {
  const word = words[index % words.length];
  const pattern = grammar[index % grammar.length];
  const person = people[index % people.length];
  const context = settings[(index * 3) % settings.length];
  const common = { type: spec.type, badge: badge(spec.type), itemType: spec.itemType, jpItemType: spec.jp } as const;
  if (spec.itemType === 'Kanji reading') return { ...common, prompt: '＿＿の言葉の読み方として最もよいものを一つ選びなさい。', tokens: [`${person}は${context}で従来の前提を`, { kanji: word.word, reading: word.reading, target: true }, 'する必要があると述べた。'], options: pick4(index, 'reading'), answer: 0, note: `${word.word} is read ${word.reading}; it means ${word.meaning}.` };
  if (spec.itemType === 'Contextual vocabulary') return { ...common, prompt: '（　）に入れるのに最もよいものを一つ選びなさい。', tokens: [word.sentence.replace(word.word, '（　　）')], options: pick4(index, 'word'), answer: 0, note: `${word.word}（${word.reading}） means ${word.meaning}.` };
  if (spec.itemType === 'Paraphrase') return { ...common, prompt: '＿＿の言葉と意味が最も近いものを一つ選びなさい。', tokens: [word.sentence], options: pick4(index, 'paraphrase'), answer: 0, note: `${word.word}（${word.reading}）means ${word.meaning}. In Japanese it can be restated as ${word.paraphrase}.` };
  if (spec.itemType === 'Usage') return { ...common, prompt: `「${word.word}」の使い方として最もよいものを一つ選びなさい。`, ...usageChoices(words, index) };
  if (spec.itemType === 'Grammar form') return { ...common, prompt: '（　）に入れるのに最もよいものを一つ選びなさい。', tokens: [pattern[1]], options: [pattern[2], ...pattern[3]], optionNotes: grammarChoiceNotes(pattern[0], pattern[2], pattern[3], pattern[4]), answer: 0, note: `${pattern[0]} ${pattern[4]}.` };
  if (spec.itemType === 'Sentence assembly') { const item = assemblies[index % assemblies.length]; return { ...common, prompt: '★に入るものはどれか。文全体を組み立てて選びなさい。', tokens: [index >= assemblies.length ? `${context}では、${item.sentence}` : item.sentence], ...assemblyDetails(item) }; }
  if (spec.itemType === 'Text grammar') return { ...common, prompt: '文章の（　）に入れるのに最もよいものを一つ選びなさい。', passage: [['新しい評価制度は、成果を明確に示せる点では有用だ。'], ['（　　）、数字に表れにくい支援や協力まで価値が低いと判断されるおそれがある。'], ['制度を運用する側には、測定できない貢献にも目を向ける姿勢が求められる。']], options: ['とはいえ', 'したがって', 'それどころか', 'ひいては'], answer: 0, note: 'とはいえ concedes the preceding merit before adding an important limitation.' };
  return null;
}

function reading(spec: Spec, index: number): Question {
  const person = people[index % people.length];
  const context = settings[(index * 3) % settings.length];
  const tag = `N1資料${index + 1}`;
  const common = { type: spec.type, badge: badge(spec.type), itemType: spec.itemType, jpItemType: spec.jp } as const;
  if (spec.itemType === 'Information retrieval') return { ...common, prompt: `${person}が応募できる助成制度はどれか。`, passage: [[`${tag}　研究活動助成一覧`], ['A 若手調査：40歳未満、個人、上限30万円'], ['B 共同研究：3機関以上、期間2年、上限200万円'], ['C 地域実践：非営利団体、住民参加必須、上限80万円'], [`${person}は二つの大学と一つの企業で、二年間の共同調査を計画している。`]], options: ['B 共同研究', 'A 若手調査', 'C 地域実践', 'いずれにも応募できない'], answer: 0, note: 'Three participating institutions and a two-year project satisfy B’s two stated conditions.' };
  if (spec.itemType === 'Integrated reading') return { ...common, prompt: '二つの文章の立場の違いとして最も適切なものはどれか。', passage: [[`${tag}　文章A：匿名性は、立場の弱い人にも率直な発言を可能にする。その価値を一律に否定すべきではない。`], ['文章B：匿名の発言にも価値はあるが、影響が大きい情報ほど、発信者が検証可能な根拠を示す責任を負うべきだ。']], options: ['Aは匿名性の意義を重視し、Bは影響に応じた責任も求める', 'Aは匿名発言を禁止し、Bは無条件に認める', '両者とも発信者の身元公開を必須とする', '両者とも情報の影響を問題にしていない'], answer: 0, note: 'B qualifies the value recognized by A with a responsibility proportional to influence.' };
  if (spec.itemType === 'Thematic reading') return { ...common, prompt: '筆者の主張として最も適切なものはどれか。', passage: [[`${tag}　効率化は、同じ目的を少ない資源で達成する営みだ。しかし、測りやすい数字だけを目的そのものと取り違えると、短期的な成果の陰で信頼や学習の機会が失われる。何を効率化するかを問う前に、守るべき価値を合意しておかなければならない。`]], options: ['効率化の前提として維持すべき価値を明確にする必要がある', '測定できない価値は業務から除くべきだ', '短期的な成果は信頼より常に重要だ', '効率化では目的を検討する必要がない'], answer: 0, note: 'The final sentence states the thesis: agree on values that must be protected before optimizing.' };
  const long = spec.itemType === 'Long passage';
  const mid = spec.itemType === 'Mid-size passage';
  const passage = [[`${tag}　${context}では、議論の記録を要約して公開する試みが始まった。情報へのアクセスを広げる一方、要約には作成者の判断が避けられない。`], ['発言を短く整えるほど読みやすくなるが、ためらいや条件を削れば、発言者が断定したかのように見えることもある。'], ...(mid || long ? [['そこで担当者は、結論だけでなく、意見が分かれた点と判断の根拠も併記するようにした。']] : []), ...(long ? [['記録の目的は、完全な中立を装うことではない。どのような基準で情報を選んだかを示し、読者が要約の限界を検討できるようにすることにある。']] : [])];
  return { ...common, prompt: long ? '筆者によれば、記録を公開する際に最も重要なことは何か。' : mid ? '担当者が意見の相違と根拠も載せるのはなぜか。' : '要約について筆者が指摘している問題は何か。', passage, options: long ? ['情報を選んだ基準を示し、要約の限界を検討可能にすること', 'すべての発言を同じ長さにすること', '作成者の判断を完全になくすこと', '結論だけを短く公開すること'] : mid ? ['結論に至る過程も読者に伝えるため', '会議を長く見せるため', '発言者の数を減らすため', '担当者の意見を強調するため'] : ['短くする過程で発言のニュアンスが失われうること', '公開すると発言者が増えすぎること', '要約は原文より必ず長くなること', '記録には結論を書けないこと'], answer: 0, note: 'The answer tracks the author’s concern about selection, nuance and transparent editorial judgment.' };
}

function listening(spec: Spec, index: number): Question {
  const person = people[index % people.length];
  const context = settings[(index * 3) % settings.length];
  const audio = `n1-generated-${slug(spec.itemType)}-${index + 1}`;
  const numbered = (text: string) => `第${index + 1}問：${text}`;
  const common = { type: spec.type, badge: badge(spec.type), itemType: spec.itemType, jpItemType: spec.jp, audio } as const;
  if (spec.itemType === 'Quick response') return { ...common, prompt: numbered('聞いて、最もよい返事を選びなさい。'), narration: [{ speaker: 'a', text: `${person}の提案、実現できないこともないんじゃないですか。` }], options: ['条件を整理すれば、検討の余地はありそうですね。', 'ええ、実現したことはありません。', '提案しないわけではありません。', '条件はすでに実現しました。'], answer: 0, note: 'The double negative cautiously suggests feasibility, so a qualified agreement is natural.' };
  if (spec.itemType === 'Summary comprehension') return { ...common, prompt: numbered('話の主旨は何か。'), revealAfterAudio: true, narration: [{ speaker: 'narrator', text: `${context}で専門家が話しています。`, pauseAfter: 550 }, { speaker: 'a', text: '新しい制度の効果を短期間の数字だけで判断するのは早計です。利用者が仕組みに慣れ、運用側が改善を重ねる時間も必要です。評価時期と複数の指標をあらかじめ定め、継続的に検証すべきでしょう。' }], options: ['制度は時期と複数の指標を定めて継続評価すべきだ', '制度の効果は最初の数字だけで決めるべきだ', '利用者が慣れる前に制度を廃止すべきだ', '評価指標は一つに限定すべきだ'], answer: 0, note: 'The speaker rejects premature judgment and recommends planned, continuing evaluation.' };
  if (spec.itemType === 'Integrated listening') return { ...common, prompt: numbered('委員会はどの方針を採用することにしたか。'), narration: [{ speaker: 'narrator', text: `${context}で二人が公開講座について話しています。`, pauseAfter: 500 }, { speaker: 'a', text: '会場参加だけなら議論は深まりますが、遠方の方が参加できません。全面オンラインでは交流が弱くなります。', pauseAfter: 300 }, { speaker: 'b', text: '講演は配信し、少人数の討論だけ会場で行う案はどうでしょう。後日、オンラインの意見交換会も設けます。', pauseAfter: 300 }, { speaker: 'a', text: 'それならアクセスと対話の両方をある程度確保できますね。' }], options: ['講演を配信し、会場討論と後日のオンライン交流を組み合わせる', '全日程を会場参加だけにする', '討論を行わず講演だけ配信する', '全日程を同時双方向のオンラインだけにする'], answer: 0, note: 'They select the hybrid design that preserves both access and interaction.' };
  const point = spec.itemType === 'Point comprehension';
  return { ...common, prompt: numbered(point ? '最終的な提出期限はいつか。' : '男の人はこのあとまず何をするか。'), narration: [{ speaker: 'narrator', text: `${context}で${person}と担当者が話しています。`, pauseAfter: 450 }, { speaker: 'a', text: '報告書は当初十五日締め切りでしたが、資料の公開が遅れたため十八日になりました。', pauseAfter: 300 }, { speaker: 'b', text: 'では執筆者に知らせます。', pauseAfter: 250 }, { speaker: 'a', text: 'その前に、掲載する統計の最新版を担当部署に確認してください。' }], options: point ? ['十八日', '十五日', '十六日', '二十日'] : ['担当部署に統計の最新版を確認する', '執筆者に締め切りを知らせる', '報告書を公開する', '統計を削除する'], answer: 0, note: point ? 'The deadline changed from the 15th to the 18th.' : 'その前に marks the immediate task.' };
}

function make(spec: Spec, index: number): Question {
  return language(spec, index) ?? (spec.type === 'READING' ? reading(spec, index) : listening(spec, index));
}

export function expandAdvancedBank(level: Level, existing: Question[]) {
  if (level !== 'N1') return existing;
  const desired = 16;
  // Grammar specs run once per point so the whole list is reachable.
  const desiredFor = (spec: Spec) => (spec.itemType === 'Grammar form' ? Math.max(desired, grammar.length) : desired);
  const result = [...existing];
  for (const spec of specs) {
    const have = result.filter((question) => question.itemType === spec.itemType).length;
    for (let index = have; index < desiredFor(spec); index += 1) result.push(make(spec, index));
  }
  const target = specs.length * desired;
  if (result.length < target) throw new Error(`N1 bank expected at least ${target} questions, got ${result.length}`);
  return result;
}
