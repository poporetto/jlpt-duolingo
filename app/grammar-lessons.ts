import type { Level } from './levels';

/**
 * Grammar study material — the "learn it first" half of the course, laid out
 * like a まとめ book: themed units, and for every point its form, how it
 * attaches, what it means, how it differs from its neighbours, and example
 * sentences with English.
 *
 * Every word here is original. The format is the familiar study-book format;
 * the units, their order, the explanations and the sentences are written for
 * this app.
 *
 * Conventions
 *  - `point` is the key into app/grammar-inventory.ts. Lessons never change the
 *    inventory: it drives the generated 文法形式 distractors, and any edit there
 *    would re-shape existing questions and shift saved progress.
 *  - In `jp`, ［…］ marks the grammar span. It drives both the highlight and the
 *    validator, which checks the span is `point`, an inventory alias, or one of
 *    the lesson's own `forms` (conjugated or written variants).
 *  - {漢字|かな} gives a word its reading inline, for the handful of words the
 *    furigana map would read wrongly in context (十分 as じっぷん, not じゅうぶん).
 *  - `connection` uses the notation in CONNECTION_LEGEND.
 *  - This file is loaded on demand when the study view opens, so it never
 *    weighs on first paint.
 */
export type Example = { jp: string; en: string };
export type GrammarLesson = {
  point: string;
  /** Accepted spellings of the marked span besides `point` and its aliases. */
  forms?: string[];
  connection: string;
  meaning: string;
  explanation: string;
  /** How it differs from the points it is most often confused with. */
  compare?: string;
  examples: Example[];
};
export type GrammarUnit = { id: string; jp: string; title: string; summary: string; points: GrammarLesson[] };

export const CONNECTION_LEGEND: [string, string][] = [
  ['V-dic', 'dictionary form — 行く, 食べる'],
  ['V-ます', 'ます-stem — 行き, 食べ'],
  ['V-て / V-た', 'て-form / た-form — 行って / 行った'],
  ['V-ない', 'ない-form without ない — 行か, 食べ'],
  ['plain', 'plain form of any word — 行く・行った・行かない'],
  ['N', 'noun'],
  ['い-adj', 'い-adjective — 高い'],
  ['な-adj', 'な-adjective stem — 静か'],
];

const N2: GrammarUnit[] = [
  {
    id: 'n2-change',
    jp: '変化の流れ',
    title: 'Change over time',
    summary: 'Ways to describe something that is changing — gradually, steadily, or across a span of time.',
    points: [
      {
        point: 'つつある',
        forms: ['つつあります'],
        connection: 'V-ます ＋ つつある',
        meaning: 'is in the process of ~; is gradually ~ing',
        explanation: 'Describes a change that is under way and still moving in one direction. It is formal and mostly written, and goes with verbs of change such as 増える, 回復する or 変わる — not with ordinary actions like 食べる.',
        compare: '～ている simply says something is going on; ～つつある stresses a change heading somewhere. Without ある, ～つつ means "while" or "although" — a different point.',
        examples: [
          { jp: '景気は少しずつ回復し［つつある］。', en: 'The economy is gradually recovering.' },
          { jp: 'この町の人口は減り［つつあります］。', en: 'The population of this town is declining.' },
        ],
      },
      {
        point: 'につれて',
        forms: ['につれ'],
        connection: 'V-dic / N ＋ につれて',
        meaning: 'as ~ (changes), ~ (also changes)',
        explanation: 'Links two changes in proportion: as the first one progresses, the second moves with it. Both halves must describe change, so it cannot introduce a single event, and the second half cannot be a request or the speaker\'s decision.',
        compare: '～に伴って is close but more formal, and can also follow a single event. ～にしたがって can mean the same, but also "in accordance with" a rule.',
        examples: [
          { jp: '年を取る［につれて］、朝早く目が覚めるようになった。', en: 'As I got older, I began waking up early.' },
          { jp: '山を登る［につれ］、空気が冷たくなってきた。', en: 'The higher we climbed, the colder the air became.' },
        ],
      },
      {
        point: 'に伴って',
        forms: ['に伴い', 'に伴う'],
        connection: 'N / V-dic ＋ こと ＋ に伴って',
        meaning: 'along with ~; as a result of ~',
        explanation: 'Something happens together with, or because of, a change or an event. It is formal and common in news and official notices, where the written に伴い is the usual form; before a noun it becomes に伴う.',
        compare: '～につれて is about two changes moving in proportion. ～に伴って can also attach to one event, such as a move or a merger.',
        examples: [
          { jp: '人口の増加［に伴って］、交通渋滞が深刻になった。', en: 'With the growth in population, traffic congestion has become serious.' },
          { jp: '本社の移転［に伴い］、電話番号が変わります。', en: 'Our telephone number will change with the relocation of the head office.' },
        ],
      },
      {
        point: '一方だ',
        forms: ['一方です'],
        connection: 'V-dic ＋ 一方だ',
        meaning: 'keeps ~ing; just keeps getting more ~',
        explanation: 'A change that continues in one direction without stopping. It is most often used for something unwelcome, and the verb is a verb of change such as 増える, 下がる or 悪化する.',
        compare: '～つつある describes a change under way, neutrally. ～一方だ says it keeps going — and usually that it is getting worse.',
        examples: [
          { jp: '円安が続き、物価は上がる［一方だ］。', en: 'The weak yen continues, and prices just keep rising.' },
          { jp: '練習をしないので、彼の成績は下がる［一方です］。', en: 'He does not practise, so his results keep falling.' },
        ],
      },
      {
        point: 'にわたって',
        forms: ['にわたり', 'にわたった', 'にわたる'],
        connection: 'N (a period or range) ＋ にわたって',
        meaning: 'over (the whole of); throughout',
        explanation: 'Stresses that something covers an entire span — a long time, a long distance or a wide area. The noun before it is the span itself: 三日間, 十年, 全国, 広い範囲.',
        compare: '～を通じて also means "throughout a period", but can also mean "by means of". ～にわたって is only about extent.',
        examples: [
          { jp: '会議は{三日間|みっかかん}［にわたって］行われた。', en: 'The conference was held over three days.' },
          { jp: '台風の被害は広い範囲［にわたった］。', en: 'The typhoon damage extended over a wide area.' },
        ],
      },
      {
        point: 'おきに',
        connection: 'number ＋ counter ＋ おきに',
        meaning: 'every ~ (at intervals); every other ~',
        explanation: 'Repetition at regular intervals. With time or distance it means "every": {十分|じっぷん}おきに is every ten minutes. With things counted one by one, it skips one each time: {一日|いちにち}おきに is every other day.',
        compare: '～ごとに has no gap: {一日|いちにち}ごとに is every single day, while {一日|いちにち}おきに is every second day.',
        examples: [
          { jp: 'このバスは{十分|じっぷん}［おきに］来ます。', en: 'This bus comes every ten minutes.' },
          { jp: 'この薬は{一日|いちにち}［おきに］飲んでください。', en: 'Please take this medicine every other day.' },
        ],
      },
    ],
  },
  {
    id: 'n2-moment',
    jp: '瞬間とタイミング',
    title: 'Moments and timing',
    summary: 'What happens the instant something occurs, while it is going on, or before and after it.',
    points: [
      {
        point: 'たとたん', forms: ['とたん', 'たとたんに'],
        connection: 'V-た ＋ とたん(に)',
        meaning: 'the moment ~; just as ~',
        explanation: 'Something unexpected happens immediately after an action. The second half is a surprise the speaker witnessed, so it cannot be the speaker\'s own plan or a request.',
        compare: '～次第 also means "as soon as", but introduces something you will deliberately do next. ～とたん reports a sudden, uncontrolled event.',
        examples: [
          { jp: '窓を開け［たとたん］、強い風が吹き込んできた。', en: 'The moment I opened the window, a strong wind blew in.' },
          { jp: '子どもは母親の顔を見［たとたんに］泣き出した。', en: 'The moment the child saw their mother\'s face, they burst into tears.' },
        ],
      },
      {
        point: '次第',
        connection: 'V-ます / N (する verbs) ＋ 次第',
        meaning: 'as soon as ~ (I will ~)',
        explanation: 'A polite way to promise the next step once something is done. The second half is a deliberate action, often a request or an offer, so it is common in business messages.',
        compare: 'Unlike ～とたん, it cannot describe the past or a surprise. 次第だ at the end of a sentence is a different point: "depends on".',
        examples: [
          { jp: '資料が届き［次第］、皆様にお送りします。', en: 'I will send it to everyone as soon as the documents arrive.' },
          { jp: '準備ができ［次第］、出発しましょう。', en: 'Let\'s leave as soon as we are ready.' },
        ],
      },
      {
        point: 'たところ',
        connection: 'V-た ＋ ところ',
        meaning: 'when I did ~, (I found that) ~',
        explanation: 'You did something, and it led to a discovery or a result. The second half is in the past and is something you learned or that happened, not something you decided.',
        compare: '～たら can express the same discovery, but ～たところ is more formal and only refers to one actual past event.',
        examples: [
          { jp: '店に電話で問い合わせ［たところ］、もう売り切れだと言われた。', en: 'When I called the shop to ask, I was told it was already sold out.' },
          { jp: '医者に相談し［たところ］、しばらく休むように勧められた。', en: 'When I consulted a doctor, I was advised to rest for a while.' },
        ],
      },
      {
        point: '最中に', forms: ['最中だ'],
        connection: 'V-ている / N＋の ＋ 最中に',
        meaning: 'right in the middle of ~',
        explanation: 'An interruption arrives at the busiest point of an activity. The second half is usually something unwelcome that broke in.',
        compare: '～間に simply means "during"; ～最中に stresses being in full swing when something cut in.',
        examples: [
          { jp: '試験の［最中に］、隣の人の携帯が鳴った。', en: 'Right in the middle of the exam, the phone of the person next to me rang.' },
          { jp: '料理をしている［最中に］停電になった。', en: 'The power went out just as I was in the middle of cooking.' },
        ],
      },
      {
        point: 'に際して', forms: ['に際し', 'に際しての'],
        connection: 'N / V-dic ＋ に際して',
        meaning: 'on the occasion of ~; when ~',
        explanation: 'A formal "at the time of", used for special, one-off occasions such as opening, leaving or applying. Common in speeches and official notices.',
        compare: '～に当たって is very close; ～に際して is slightly more formal and neutral, ～に当たって suggests readiness for something important.',
        examples: [
          { jp: '入学［に際して］、必要な書類をそろえてください。', en: 'Please prepare the necessary documents upon enrolment.' },
          { jp: '退職［に際し］、皆様に心からお礼を申し上げます。', en: 'On leaving the company, I thank you all from my heart.' },
        ],
      },
      {
        point: 'に先立って', forms: ['に先立ち', 'に先立つ'],
        connection: 'N / V-dic ＋ に先立って',
        meaning: 'prior to ~; ahead of ~',
        explanation: 'Something is done in preparation before a main event. Formal, and the event is usually a public one: a launch, a meeting, a ceremony.',
        compare: '～前に is plain "before"; ～に先立って adds that the earlier step is preparation for the event.',
        examples: [
          { jp: '新商品の発売［に先立って］、試食会が開かれた。', en: 'Ahead of the new product\'s launch, a tasting event was held.' },
          { jp: '工事の開始［に先立ち］、住民への説明会を行います。', en: 'Prior to the start of construction, we will hold a briefing for residents.' },
        ],
      },
      {
        point: '上で', forms: ['上での'],
        connection: 'V-た / N＋の ＋ 上で',
        meaning: 'after ~ (and on that basis)',
        explanation: 'Do the first thing properly, then act on the result. It stresses that the first step is a necessary basis: check, then decide.',
        compare: 'V-dic ＋ 上で means "in the process of / for the purpose of" — a different use. ～てから is just sequence.',
        examples: [
          { jp: '家族とよく話し合った［上で］、留学を決めた。', en: 'I decided to study abroad after talking it over carefully with my family.' },
          { jp: '内容を確認の［上で］、署名してください。', en: 'Please sign after checking the contents.' },
        ],
      },
    ],
  },
  {
    id: 'n2-outcome',
    jp: '結果とその後',
    title: 'How things turned out',
    summary: 'Results reached after effort or trouble, things left unfinished, and what has been true ever since.',
    points: [
      {
        point: 'あげく', forms: ['あげくに'],
        connection: 'V-た / N＋の ＋ あげく',
        meaning: 'after a lot of ~, in the end (sadly) ~',
        explanation: 'A long, tiring process ends badly or not as hoped. The tone is regretful or critical; the result is usually disappointing.',
        compare: '～末に is the same shape, but the result can be good or bad and the tone is neutral.',
        examples: [
          { jp: 'さんざん迷った［あげく］、何も買わずに帰った。', en: 'After agonising over it for ages, I went home without buying anything.' },
          { jp: '長い議論の［あげくに］、計画は中止になった。', en: 'After a long argument, the plan ended up being cancelled.' },
        ],
      },
      {
        point: '末に', forms: ['末'],
        connection: 'V-た / N＋の ＋ 末に',
        meaning: 'after ~, finally ~',
        explanation: 'A result reached only after considerable effort, thought or difficulty. Neutral in tone — the outcome may well be a success.',
        compare: '～あげく implies a bad or unwelcome result; ～末に does not.',
        examples: [
          { jp: '何度も実験を重ねた［末に］、ようやく成功した。', en: 'After repeating the experiment many times, they finally succeeded.' },
          { jp: '話し合いの［末］、二人は別れることにした。', en: 'After much discussion, the two of them decided to separate.' },
        ],
      },
      {
        point: 'て以来',
        connection: 'V-て ＋ 以来',
        meaning: 'ever since ~',
        explanation: 'A situation that started at a past point and has continued unchanged up to now. The second half describes an ongoing state, not a single event.',
        compare: '～てから is plain "after"; ～て以来 stresses that the change has lasted all the way to the present.',
        examples: [
          { jp: '日本に来［て以来］、毎日日本語で日記を書いている。', en: 'Ever since I came to Japan, I have written a diary in Japanese every day.' },
          { jp: 'あの事故があっ［て以来］、彼は車に乗らなくなった。', en: 'Ever since that accident, he has stopped riding in cars.' },
        ],
      },
      {
        point: 'かける', forms: ['かけの', 'かけた', 'かけて'],
        connection: 'V-ます ＋ かける / かけの N',
        meaning: 'half-~; started to ~ but not finished',
        explanation: 'An action begun and left incomplete, or something on the point of happening. 読みかけの本 is a book you have started reading.',
        compare: '～途中 says "partway through" as a noun; ～かける is attached to the verb and can also mean "about to" (死にかける).',
        examples: [
          { jp: '机の上に飲み［かけの］コーヒーが置いてある。', en: 'There is a half-drunk coffee on the desk.' },
          { jp: '何か言い［かけた］が、彼はそのまま黙ってしまった。', en: 'He started to say something, but then fell silent.' },
        ],
      },
      {
        point: 'につけ', forms: ['につけて'],
        connection: 'V-dic ＋ につけ',
        meaning: 'every time ~ (I feel ~)',
        explanation: 'Whenever you see or hear something, the same feeling or memory returns. It goes with verbs of perception (見る, 聞く) and the second half is a feeling.',
        compare: '～たびに also means "every time" but can describe any repeated event; ～につけ is about feelings triggered.',
        examples: [
          { jp: 'この写真を見る［につけ］、故郷の母を思い出す。', en: 'Every time I see this photograph, I think of my mother back home.' },
          { jp: '彼の活躍を聞く［につけて］、うれしくなる。', en: 'Whenever I hear about his success, it makes me happy.' },
        ],
      },
    ],
  },
  {
    id: 'n2-cause',
    jp: '原因と理由',
    title: 'Causes and reasons',
    summary: 'Ways to name a cause — to blame it, to explain it, or to show what it set off.',
    points: [
      {
        point: 'せいで', forms: ['せいだ', 'せいか'],
        connection: 'plain (N＋の, な-adj＋な) ＋ せいで',
        meaning: 'because of ~ (blaming)',
        explanation: 'Names the cause of something bad, with a sense of blame. せいか softens it to "perhaps because of".',
        compare: '～おかげで is the positive version, for a good result. ～ために is neutral.',
        examples: [
          { jp: '寝不足の［せいで］、仕事で何度もミスをした。', en: 'Because of a lack of sleep, I made mistakes at work again and again.' },
          { jp: '年の［せいか］、最近疲れやすい。', en: 'Perhaps because of my age, I get tired easily these days.' },
        ],
      },
      {
        point: 'だけに',
        connection: 'plain (N / な-adj without だ) ＋ だけに',
        meaning: 'precisely because ~ (so all the more ~)',
        explanation: 'Because of a known fact, the result is stronger than usual or exactly what you would expect. Often used for disappointment that is larger because hopes were high.',
        compare: '～だけあって praises a result as worthy of its cause; ～だけに can go either way and often signals "all the more".',
        examples: [
          { jp: '期待していた［だけに］、結果を聞いてがっかりした。', en: 'Precisely because I had high hopes, the result was all the more disappointing.' },
          { jp: '初めての海外旅行だった［だけに］、すべてが新鮮だった。', en: 'Since it was my first trip abroad, everything felt fresh.' },
        ],
      },
      {
        point: 'ことから',
        connection: 'plain (N＋である, な-adj＋な) ＋ ことから',
        meaning: 'from the fact that ~; because ~',
        explanation: 'Gives the evidence or origin behind a judgement or a name. Common when explaining why something is called what it is.',
        compare: '～から is a plain reason; ～ことから points to an observed fact that the conclusion is drawn from.',
        examples: [
          { jp: '道がぬれている［ことから］、夜中に雨が降ったとわかった。', en: 'From the fact that the road was wet, I could tell it had rained in the night.' },
          { jp: '形が星に似ている［ことから］、この花は星草と呼ばれている。', en: 'Because its shape resembles a star, this flower is called "star grass".' },
        ],
      },
      {
        point: 'ことだから',
        connection: 'N (a person) ＋ の ＋ ことだから',
        meaning: 'knowing ~ (as I do), ~',
        explanation: 'Your knowledge of someone\'s character lets you predict how they will behave. The noun is almost always a person you both know.',
        compare: '～だから just gives a reason; ～のことだから bases the guess on that person\'s known habits.',
        examples: [
          { jp: '時間に正確な田中さんの［ことだから］、もうすぐ来るだろう。', en: 'Knowing how punctual Tanaka is, he will be here soon.' },
          { jp: '優しい姉の［ことだから］、きっと手伝ってくれる。', en: 'My sister is kind, so she is sure to help.' },
        ],
      },
      {
        point: 'につき',
        connection: 'N ＋ につき',
        meaning: 'due to ~ (on notices)',
        explanation: 'A formal "because of", used on signs and announcements to explain a closure or a change. It also means "per" in prices — a different use.',
        compare: '～のため is the everyday equivalent; ～につき sounds like a posted notice.',
        examples: [
          { jp: '本日は定休日［につき］、お休みさせていただきます。', en: 'We are closed today, as it is our regular day off.' },
          { jp: '{改装中|かいそうちゅう}［につき］、二階は利用できません。', en: 'The second floor cannot be used, due to renovation.' },
        ],
      },
      {
        point: 'をきっかけに', forms: ['をきっかけとして', 'がきっかけで'],
        connection: 'N ＋ をきっかけに',
        meaning: 'triggered by ~; taking ~ as the start',
        explanation: 'An event becomes the starting point for a change in someone\'s life or habits. The event itself may be small.',
        compare: '～を契機に is the formal written equivalent.',
        examples: [
          { jp: '入院［をきっかけに］、たばこをやめた。', en: 'Being hospitalised was what got me to quit smoking.' },
          { jp: '留学生との出会い［がきっかけで］、中国語を学び始めた。', en: 'Meeting an exchange student was what started me learning Chinese.' },
        ],
      },
    ],
  },
  {
    id: 'n2-resolve',
    jp: '理由と決意',
    title: 'Reasons that oblige',
    summary: 'Because something is the case, a course of action follows — and a few ways of giving excuses or emphasis.',
    points: [
      {
        point: 'からには',
        connection: 'plain (N / な-adj＋である) ＋ からには',
        meaning: 'now that ~ / since ~ (I must ~)',
        explanation: 'Since a decision has been made or a situation exists, the speaker feels bound to see it through. The second half expresses resolve, duty or strong expectation.',
        compare: '～以上は and ～上は mean almost the same; ～上は is the most formal.',
        examples: [
          { jp: '引き受けた［からには］、最後まで責任を持ちます。', en: 'Now that I have taken it on, I will be responsible for it to the end.' },
          { jp: '試合に出る［からには］、優勝を目指したい。', en: 'Since we are entering the tournament, I want to aim for the title.' },
        ],
      },
      {
        point: '以上は', forms: ['以上'],
        connection: 'plain ＋ 以上(は)',
        meaning: 'since ~ / as long as ~ (it follows that ~)',
        explanation: 'Because a fact holds, a duty or conclusion follows. Often used for obligations that come with a role: 学生である以上.',
        compare: '～からには is more personal resolve; ～以上は often states what logically or morally follows.',
        examples: [
          { jp: '約束した［以上は］、守らなければならない。', en: 'Since you promised, you have to keep it.' },
          { jp: '会社員である［以上］、規則に従うべきだ。', en: 'As long as you are an employee, you should follow the rules.' },
        ],
      },
      {
        point: '上は',
        connection: 'V-dic / V-た ＋ 上は',
        meaning: 'now that ~ (formal)',
        explanation: 'The most formal of the "now that" family. A serious decision has been made, so a firm course follows.',
        compare: 'Same meaning as ～からには and ～以上は, but stiff and written.',
        examples: [
          { jp: 'こうなった［上は］、全力を尽くすしかない。', en: 'Now that it has come to this, there is nothing to do but give it everything.' },
          { jp: '会社を辞めると決めた［上は］、もう迷わない。', en: 'Now that I have decided to leave the company, I will not waver.' },
        ],
      },
      {
        point: 'からこそ',
        connection: 'plain ＋ からこそ',
        meaning: 'precisely because ~',
        explanation: 'Emphasises that this reason, and not another, is the real one — often a reason that might seem surprising.',
        compare: '～から gives a reason; ～からこそ insists it is THE reason, often reversing an expectation.',
        examples: [
          { jp: '大切な友達だ［からこそ］、本当のことを言ったのだ。', en: 'It was precisely because you are a dear friend that I told you the truth.' },
          { jp: '失敗した［からこそ］、学べたことがたくさんある。', en: 'There is a lot I learned precisely because I failed.' },
        ],
      },
      {
        point: 'ものだから', forms: ['もので', 'もんだから'],
        connection: 'plain (N / な-adj＋な) ＋ ものだから',
        meaning: 'because ~ (giving an excuse)',
        explanation: 'Explains a reason when apologising or justifying yourself. It sounds like "you see, the thing is…" and is conversational.',
        compare: '～から can sound blunt when apologising; ～ものだから softens it into an explanation.',
        examples: [
          { jp: '道が混んでいた［ものだから］、遅くなってすみません。', en: 'Sorry I\'m late — the roads were packed, you see.' },
          { jp: 'あまりに安かった［もので］、つい買ってしまった。', en: 'It was so cheap that I ended up buying it.' },
        ],
      },
      {
        point: 'あまり', forms: ['あまりに', 'のあまり'],
        connection: 'N＋の / V-dic ＋ あまり',
        meaning: 'out of so much ~; so ~ that',
        explanation: 'A feeling or state is so extreme that it causes an unusual result. The noun is usually an emotion: 心配, 喜び, 緊張.',
        compare: 'Do not confuse with the adverb あまり ("not very"). Here it follows a noun with の and means "excess".',
        examples: [
          { jp: '緊張の［あまり］、名前を間違えてしまった。', en: 'I was so nervous that I got my own name wrong.' },
          { jp: '合格したと聞いて、うれしさ［のあまり］泣いてしまった。', en: 'When I heard I had passed, I cried from sheer joy.' },
        ],
      },
    ],
  },
  {
    id: 'n2-although',
    jp: '逆接',
    title: 'Although and despite',
    summary: 'The result goes against what the first half would lead you to expect.',
    points: [
      {
        point: 'にもかかわらず',
        connection: 'plain (N / な-adj, with or without である) ＋ にもかかわらず',
        meaning: 'despite ~; even though ~',
        explanation: 'A formal "despite": the outcome contradicts what the situation suggests. Often carries surprise or criticism.',
        compare: '～のに is the everyday version and often carries the speaker\'s frustration; ～にもかかわらず is more objective and written.',
        examples: [
          { jp: '大雪［にもかかわらず］、多くの客が集まった。', en: 'Despite the heavy snow, many customers turned up.' },
          { jp: '何度も注意した［にもかかわらず］、彼はまた遅刻した。', en: 'Even though I warned him many times, he was late again.' },
        ],
      },
      {
        point: 'ものの',
        connection: 'plain (N＋である, な-adj＋な/である) ＋ ものの',
        meaning: 'although ~ (it did not go further)',
        explanation: 'Admits the first part is true, but the expected follow-through did not happen. Often: "I did start / I do know, but…".',
        compare: '～けれども is neutral; ～ものの suggests the first half did not lead anywhere.',
        examples: [
          { jp: '運動を始めた［ものの］、三日しか続かなかった。', en: 'Although I started exercising, I only kept it up for three days.' },
          { jp: '道は分かる［ものの］、自信がないので地図を持っていく。', en: 'I do know the way, but I am not confident, so I will take a map.' },
        ],
      },
      {
        point: 'ながらも', forms: ['ながら'],
        connection: 'V-ます / い-adj / な-adj / N ＋ ながらも',
        meaning: 'although ~; while ~',
        explanation: 'Two facts that seem to clash are true at the same time: small but comfortable, knowing yet unable. The subject is the same in both halves.',
        compare: 'Plain ～ながら usually means "while doing"; with states (知る, 狭い) it means "although", and ～ながらも makes that clear.',
        examples: [
          { jp: 'この店は小さい［ながらも］、いつも客でいっぱいだ。', en: 'Although this shop is small, it is always full of customers.' },
          { jp: '体に悪いと知り［ながら］、夜更かしをしてしまう。', en: 'Even though I know it is bad for me, I end up staying up late.' },
        ],
      },
      {
        point: 'つつ', forms: ['つつも'],
        connection: 'V-ます ＋ つつ(も)',
        meaning: 'although ~ / while ~ (written)',
        explanation: 'The written counterpart of ～ながら. With つつも it means "although"; plain つつ can also mean two actions at once.',
        compare: 'Do not confuse with ～つつある, which describes a change under way.',
        examples: [
          { jp: '早く寝ようと思い［つつも］、つい映画を見てしまった。', en: 'Although I meant to go to bed early, I ended up watching a film.' },
          { jp: '景色を楽しみ［つつ］、ゆっくり山道を歩いた。', en: 'I walked slowly along the mountain path, enjoying the view.' },
        ],
      },
      {
        point: 'くせに',
        connection: 'plain (N＋の, な-adj＋な) ＋ くせに',
        meaning: 'even though ~ (critical)',
        explanation: 'A "although" full of criticism or contempt: someone behaves in a way their situation should rule out. Used in speech, never about yourself in a neutral way.',
        compare: '～のに can also complain, but ～くせに is sharper and aims at a person.',
        examples: [
          { jp: '自分は何もしない［くせに］、人には文句ばかり言う。', en: 'He does nothing himself, yet he does nothing but complain about others.' },
          { jp: '子どもの［くせに］、生意気なことを言うな。', en: 'You are only a child — don\'t talk back like that.' },
        ],
      },
      {
        point: 'にしては',
        connection: 'plain (N / な-adj stem) ＋ にしては',
        meaning: 'for ~ ; considering ~',
        explanation: 'The result is different from what you would expect given the stated standard — better or worse than normal for it.',
        compare: '～わりに is close and works with degree words (年のわりに); ～にしては takes a specific fact as the standard.',
        examples: [
          { jp: '初めて作った［にしては］、よくできている。', en: 'For a first attempt, it is very well made.' },
          { jp: '十二月［にしては］、今日は暖かい。', en: 'It is warm today for December.' },
        ],
      },
      {
        point: 'わりに', forms: ['わりには'],
        connection: 'plain (N＋の, な-adj＋な) ＋ わりに',
        meaning: 'considering ~; for (its degree)',
        explanation: 'Measured against a degree — price, age, effort — the result is out of proportion. The standard is something with a scale.',
        compare: '～にしては uses a specific situation as the yardstick; ～わりに uses a degree or amount.',
        examples: [
          { jp: 'この料理は値段の［わりに］量が多い。', en: 'This dish is generous for its price.' },
          { jp: 'あまり勉強しなかった［わりには］、点数がよかった。', en: 'Considering I hardly studied, my score was good.' },
        ],
      },
    ],
  },
  {
    id: 'n2-contrast',
    jp: '対比',
    title: 'Contrast and reversal',
    summary: 'Two sides set against each other, expectations reversed, and assumptions corrected.',
    points: [
      {
        point: '一方で', forms: ['一方', '一方では'],
        connection: 'plain (N＋である, な-adj＋な/である) ＋ 一方(で)',
        meaning: 'while ~ / on the other hand ~',
        explanation: 'Places two aspects side by side for comparison. Neutral and common in reports: one trend here, another there.',
        compare: '～反面 contrasts two sides of the same thing, usually good and bad. ～一方で can compare different things.',
        examples: [
          { jp: '都市の人口が増える［一方で］、地方では減り続けている。', en: 'While city populations grow, rural areas keep shrinking.' },
          { jp: '彼は仕事に厳しい［一方］、部下の相談にはよく乗る。', en: 'He is strict about work, but he also listens to his staff\'s problems.' },
        ],
      },
      {
        point: '反面',
        connection: 'plain (N＋である, な-adj＋な/である) ＋ 反面',
        meaning: 'but on the other hand (the same thing) ~',
        explanation: 'One thing has two opposing sides — typically a merit and a drawback of the same thing.',
        compare: '～一方で can contrast two different subjects; ～反面 is about one subject\'s two faces.',
        examples: [
          { jp: '都会の生活は便利な［反面］、ストレスも多い。', en: 'City life is convenient, but it is also stressful.' },
          { jp: 'この薬はよく効く［反面］、副作用が強い。', en: 'This medicine works well, but it has strong side effects.' },
        ],
      },
      {
        point: 'に反して', forms: ['に反し', 'に反する'],
        connection: 'N ＋ に反して',
        meaning: 'contrary to ~',
        explanation: 'The result is the opposite of a prediction, expectation or wish. The noun is usually 予想, 期待 or 希望.',
        compare: 'With rules (規則に反する) it means "violate" — a different use of the same verb.',
        examples: [
          { jp: '予想［に反して］、試合は弱いチームが勝った。', en: 'Contrary to expectations, the weaker team won the match.' },
          { jp: '親の期待［に反し］、彼は大学に進まなかった。', en: 'Against his parents\' hopes, he did not go on to university.' },
        ],
      },
      {
        point: 'どころか',
        connection: 'plain (N / な-adj, without だ) ＋ どころか',
        meaning: 'far from ~; let alone ~',
        explanation: 'Denies the first idea strongly and replaces it with something opposite or more extreme.',
        compare: '～ばかりか adds something in the same direction; ～どころか overturns the first idea.',
        examples: [
          { jp: '雨はやむ［どころか］、ますます強くなってきた。', en: 'Far from stopping, the rain grew even heavier.' },
          { jp: '貯金［どころか］、毎月の生活費も足りない。', en: 'Never mind savings — I cannot even cover my monthly living costs.' },
        ],
      },
      {
        point: 'からといって',
        connection: 'plain ＋ からといって',
        meaning: 'just because ~ (it does not follow that ~)',
        explanation: 'Warns that a reason does not justify the conclusion people draw from it. The second half is usually negative: とは限らない, わけではない.',
        compare: 'Often paired with ～とは限らない or ～わけではない to complete the denial.',
        examples: [
          { jp: '高い［からといって］、品質がいいとは限らない。', en: 'Just because something is expensive does not mean it is good quality.' },
          { jp: '忙しい［からといって］、食事を抜くのはよくない。', en: 'Being busy is no reason to skip meals.' },
        ],
      },
      {
        point: 'というものではない', forms: ['というものでもない'],
        connection: 'plain ＋ というものではない',
        meaning: 'it is not (simply) the case that ~',
        explanation: 'Corrects an oversimplified belief: something widely assumed is not always true. Often follows a ～ば or ～ても clause.',
        compare: '～わけではない denies a specific inference; ～というものではない rejects a general rule of thumb.',
        examples: [
          { jp: '練習の時間が長ければいい［というものではない］。', en: 'It is not simply that the longer you practise, the better.' },
          { jp: '値段が安ければ売れる［というものでもない］。', en: 'Things do not sell just because they are cheap.' },
        ],
      },
      {
        point: 'くらいなら', forms: ['ぐらいなら'],
        connection: 'V-dic ＋ くらいなら',
        meaning: 'rather than ~ (I would sooner ~)',
        explanation: 'Rejects the first option as so undesirable that even the second, also unpleasant, is better.',
        compare: 'The second half often uses ～ほうがいい or ～ほうがましだ.',
        examples: [
          { jp: '途中でやめる［くらいなら］、最初から引き受けないほうがいい。', en: 'Rather than quit halfway, it is better not to take it on at all.' },
          { jp: 'あんな満員電車に乗る［ぐらいなら］、歩いて帰る。', en: 'I would rather walk home than ride a train that crowded.' },
        ],
      },
    ],
  },
  {
    id: 'n2-basis',
    jp: '基準と手段',
    title: 'Standards and means',
    summary: 'What an action is based on, what it follows, what it varies with or responds to, and how it is done.',
    points: [
      {
        point: 'によって', forms: ['により', 'による', 'によっては'],
        connection: 'N ＋ によって',
        meaning: 'depending on ~ / by (means of) ~ / due to ~',
        explanation: 'A versatile formal particle: it marks variation (人によって違う), the means or agent (法律によって定める), or a cause (事故により).',
        compare: 'によっては means "in some cases, depending on": 人によっては嫌がる.',
        examples: [
          { jp: '食べ物の好みは人［によって］違う。', en: 'Food preferences differ from person to person.' },
          { jp: '台風［により］、全ての便が欠航となった。', en: 'All flights were cancelled due to the typhoon.' },
        ],
      },
      {
        point: 'に従って', forms: ['に従い'],
        connection: 'N / V-dic ＋ に従って',
        meaning: 'following ~; in accordance with ~ / as ~',
        explanation: 'Doing something according to a rule, an instruction or a guide. With a verb of change it can also mean "as ~" like ～につれて.',
        compare: '～に沿って follows a plan or a line; ～に従って follows an order or a rule more strictly.',
        examples: [
          { jp: '係員の指示［に従って］、順番に避難してください。', en: 'Please evacuate in order, following the staff\'s instructions.' },
          { jp: '高く登る［に従い］、気温が下がっていく。', en: 'The higher you climb, the lower the temperature.' },
        ],
      },
      {
        point: 'にそって', forms: ['に沿って', 'に沿い', 'に沿った'],
        connection: 'N ＋ に沿って',
        meaning: 'along ~; in line with ~',
        explanation: 'Physically along something long (a river, a road), or in line with a plan, policy or wish.',
        compare: '～に基づいて means "based on" evidence; ～に沿って means keeping to a plan or line.',
        examples: [
          { jp: '川［に沿って］、桜の木が並んでいる。', en: 'Cherry trees line the river.' },
          { jp: 'お客様の希望［に沿った］プランを提案します。', en: 'We will propose a plan in line with your wishes.' },
        ],
      },
      {
        point: 'に基づいて', forms: ['に基づき', 'に基づく', 'に基づいた'],
        connection: 'N ＋ に基づいて',
        meaning: 'based on ~',
        explanation: 'Something is grounded in data, facts, a law or an experience. Common in reports and official writing.',
        compare: '～をもとに is close but means "using as material"; ～に基づいて stresses the grounds or authority.',
        examples: [
          { jp: '調査結果［に基づいて］、新しい計画を立てた。', en: 'We drew up a new plan based on the survey results.' },
          { jp: 'この映画は実話［に基づく］物語だ。', en: 'This film is a story based on real events.' },
        ],
      },
      {
        point: 'に応じて', forms: ['に応じ', 'に応じた'],
        connection: 'N ＋ に応じて',
        meaning: 'according to ~; in response to ~',
        explanation: 'Something changes to match a varying condition — ability, budget, demand — or responds to a request.',
        compare: '～によって simply says things differ; ～に応じて says they are adjusted to fit.',
        examples: [
          { jp: '経験［に応じて］、給料が決まります。', en: 'Salary is set according to experience.' },
          { jp: '体力［に応じた］運動を続けることが大切だ。', en: 'It is important to keep doing exercise suited to your fitness.' },
        ],
      },
      {
        point: 'を通じて', forms: ['を通じ', 'を通して'],
        connection: 'N ＋ を通じて',
        meaning: 'through ~ (a means) / throughout ~ (a period)',
        explanation: 'Either the channel by which something happens (a friend, the internet), or a whole period (一年を通じて).',
        compare: '～を通して is close and often interchangeable, but leans toward a deliberate means.',
        examples: [
          { jp: '友人［を通じて］、今の会社を紹介してもらった。', en: 'I was introduced to my current company through a friend.' },
          { jp: 'この地方は一年［を通じて］、気候が穏やかだ。', en: 'This region has a mild climate all year round.' },
        ],
      },
      {
        point: 'にこたえて', forms: ['に応えて', 'に応え', 'に応える'],
        connection: 'N ＋ にこたえて',
        meaning: 'in response to (a request or expectation)',
        explanation: 'Acting to meet someone\'s demand, hope or support: 要望, 期待, 声援.',
        compare: '～に応じて means "according to" a variable; ～にこたえて means responding to people\'s wishes.',
        examples: [
          { jp: 'ファンの声援［にこたえて］、選手は手を振った。', en: 'In response to the fans\' cheers, the player waved.' },
          { jp: '利用者の要望［に応え］、図書館の開館時間を延長した。', en: 'In response to users\' requests, the library extended its opening hours.' },
        ],
      },
    ],
  },
  {
    id: 'n2-manner',
    jp: '様子と態度',
    title: 'Manner and attitude',
    summary: 'How someone looks or behaves, and what they do or leave out while doing it.',
    points: [
      {
        point: 'かのようだ', forms: ['かのように', 'かのような'],
        connection: 'plain (N / な-adj＋である) ＋ かのようだ',
        meaning: 'as if ~ (though it is not so)',
        explanation: 'Describes something by comparing it to a situation that is not actually true. It is more literary than ～ようだ.',
        compare: '～ようだ can be a genuine guess; ～かのようだ marks the comparison as contrary to fact.',
        examples: [
          { jp: '彼は何も知らない［かのように］、平気な顔をしていた。', en: 'He kept a calm face, as if he knew nothing about it.' },
          { jp: '今日は春が来た［かのような］暖かさだ。', en: 'It is so warm today it is as if spring had come.' },
        ],
      },
      {
        point: 'げ', forms: ['げな', 'げに'],
        connection: 'い-adj stem / な-adj ＋ げ',
        meaning: '-looking; seeming ~',
        explanation: 'Turns a feeling into how someone appears from outside: 寂しげ, 楽しげ, 不安げ. It is used about other people, not yourself.',
        compare: '～そう is the everyday version; ～げ is more literary and limited to certain adjectives.',
        examples: [
          { jp: '少年は寂し［げな］目で窓の外を見ていた。', en: 'The boy was gazing out of the window with lonely eyes.' },
          { jp: '子どもたちは楽し［げに］歌っていた。', en: 'The children were singing happily.' },
        ],
      },
      {
        point: 'ことなく', forms: ['こともなく'],
        connection: 'V-dic ＋ ことなく',
        meaning: 'without ~',
        explanation: 'A formal "without doing": an action happened without something that might be expected. Common for perseverance — without resting, without giving up.',
        compare: '～ないで and ～ずに are the everyday versions.',
        examples: [
          { jp: '彼女は一日も休む［ことなく］、練習を続けた。', en: 'She kept practising without taking a single day off.' },
          { jp: '誰にも知られる［ことなく］、計画は進められた。', en: 'The plan went ahead without anyone finding out.' },
        ],
      },
      {
        point: 'もかまわず', forms: ['をかまわず'],
        connection: 'N ＋ もかまわず',
        meaning: 'without caring about ~; regardless of ~',
        explanation: 'Someone acts with no concern for something they normally should mind — other people\'s eyes, rain, the late hour.',
        compare: '～を問わず means "regardless" in a neutral, inclusive sense; ～もかまわず criticises indifference.',
        examples: [
          { jp: '彼は人目［もかまわず］、大声で泣き出した。', en: 'He burst into loud tears, not caring who saw.' },
          { jp: '子どもたちは服が汚れるの［もかまわず］、泥の中で遊んだ。', en: 'The children played in the mud without caring about getting their clothes dirty.' },
        ],
      },
      {
        point: 'をこめて', forms: ['を込めて', 'のこもった'],
        connection: 'N ＋ をこめて',
        meaning: 'with (a feeling) put into it',
        explanation: 'Pouring a feeling into an action or an object: 心をこめて, 感謝をこめて, 愛をこめて.',
        compare: 'A noun can also be described as 心のこもった — "heartfelt".',
        examples: [
          { jp: '感謝の気持ち［をこめて］、手紙を書いた。', en: 'I wrote a letter full of gratitude.' },
          { jp: '祖母が心［を込めて］作ったセーターだ。', en: 'This is a sweater my grandmother knitted with great care.' },
        ],
      },
      {
        point: 'ぬきで', forms: ['抜きで', '抜きに', 'ぬきに', '抜きの'],
        connection: 'N ＋ ぬきで',
        meaning: 'without ~; leaving out ~',
        explanation: 'Deliberately leaving something out that would normally be included — breakfast, formalities, a person.',
        compare: '～抜きには…ない means "cannot do without ~": 彼の協力抜きには成功しなかった.',
        examples: [
          { jp: '今日は堅い話［ぬきで］、楽しく飲みましょう。', en: 'Let\'s skip the serious talk today and just enjoy a drink.' },
          { jp: '朝ご飯［抜きで］働くのは体によくない。', en: 'Working without breakfast is bad for you.' },
        ],
      },
    ],
  },
  {
    id: 'n2-judge',
    jp: '推量と判断',
    title: 'Drawing conclusions',
    summary: 'How sure the speaker is: certain, logically led, flatly denying, reporting what was heard, or checking something half-remembered.',
    points: [
      {
        point: 'に違いない', forms: ['に違いありません'],
        connection: 'plain (N / な-adj, without だ) ＋ に違いない',
        meaning: 'must be ~; surely ~',
        explanation: 'A strong conviction based on the speaker\'s own reasoning or intuition. More written than ～はずだ.',
        compare: '～はずだ rests on logic or known facts; ～に違いない on the speaker\'s strong feeling.',
        examples: [
          { jp: '部屋の明かりがついているから、彼はもう帰っている［に違いない］。', en: 'The light is on in his room, so he must already be home.' },
          { jp: 'この絵を描いたのは有名な画家［に違いありません］。', en: 'This painting must have been done by a famous artist.' },
        ],
      },
      {
        point: 'に決まっている', forms: ['に決まってる'],
        connection: 'plain (N / な-adj, without だ) ＋ に決まっている',
        meaning: 'is bound to ~; is obviously ~',
        explanation: 'A confident, conversational assertion that something is self-evident. Can sound pushy.',
        compare: 'Stronger and more subjective than ～に違いない; mostly spoken.',
        examples: [
          { jp: 'そんなに急いだら、失敗する［に決まっている］。', en: 'If you rush like that, you are bound to fail.' },
          { jp: '一人で全部やるなんて無理［に決まってる］よ。', en: 'Doing it all alone is obviously impossible.' },
        ],
      },
      {
        point: 'わけだ', forms: ['わけです', 'わけか'],
        connection: 'plain (N＋の/である, な-adj＋な) ＋ わけだ',
        meaning: 'so that is why ~; no wonder ~; it follows that ~',
        explanation: 'States a conclusion that follows naturally from a fact, or expresses sudden understanding: "so that explains it".',
        compare: '～はずだ is an expectation before the fact; ～わけだ explains something you can now see.',
        examples: [
          { jp: '十年もアメリカにいたのか。英語が上手な［わけだ］。', en: 'He lived in America for ten years? No wonder his English is so good.' },
          { jp: '時給千円で{五時間|ごじかん}働いたから、五千円もらえる［わけです］。', en: 'You worked five hours at a thousand yen an hour, so you get five thousand yen.' },
        ],
      },
      {
        point: 'わけがない', forms: ['わけはない'],
        connection: 'plain (N＋の/である, な-adj＋な) ＋ わけがない',
        meaning: 'there is no way that ~',
        explanation: 'A strong, confident denial of a possibility, based on reasoning.',
        compare: '～はずがない is very close; ～わけがない is a little more emotional.',
        examples: [
          { jp: 'あんなに優しい彼が、そんなことを言う［わけがない］。', en: 'There is no way someone as kind as him would say that.' },
          { jp: '一週間で日本語がぺらぺらになる［わけはない］。', en: 'You can\'t possibly become fluent in Japanese in a week.' },
        ],
      },
      {
        point: 'まい', forms: ['まいと'],
        connection: 'V-dic ＋ まい (る-verbs: V-ない / V-dic)',
        meaning: 'will not ~ (resolve) / probably not ~',
        explanation: 'A written form with two uses: a firm resolve not to do something (二度と言うまい), or a guess that something will not happen.',
        compare: 'The resolve use matches ～ないつもりだ; the guess use matches ～ないだろう.',
        examples: [
          { jp: 'あんな恥ずかしい思いは二度とする［まい］と決めた。', en: 'I decided never again to go through anything so embarrassing.' },
          { jp: '母を心配させ［まいと］、病気のことは黙っていた。', en: 'Not wanting to worry my mother, I kept quiet about my illness.' },
        ],
      },
      {
        point: 'ということだ', forms: ['とのことだ', 'ということです'],
        connection: 'plain ＋ ということだ',
        meaning: 'I hear that ~ / that means ~',
        explanation: 'Reports something heard, often in a formal way, or restates a conclusion: "in other words".',
        compare: '～そうだ also reports hearsay but is more casual; とのことだ is the written form in letters.',
        examples: [
          { jp: '天気予報によると、明日は大雪になる［ということだ］。', en: 'According to the forecast, there will be heavy snow tomorrow.' },
          { jp: '返事がないのは、来ない［ということです］ね。', en: 'No reply means they are not coming, then.' },
        ],
      },
      {
        point: 'っけ',
        connection: 'plain (past) ＋ っけ',
        meaning: 'was it ~? (trying to remember)',
        explanation: 'Checks something the speaker has half forgotten, or recalls the past fondly. Casual and spoken.',
        compare: 'Polite speech uses ～でしたっけ or ～ましたっけ.',
        examples: [
          { jp: '次の会議は何時からだった［っけ］。', en: 'What time was the next meeting again?' },
          { jp: '子どものころ、よくここで遊んだ［っけ］。', en: 'We used to play here a lot when we were kids, didn\'t we.' },
        ],
      },
    ],
  },
  {
    id: 'n2-risk',
    jp: '可能性と評価',
    title: 'Risk and assessment',
    summary: 'Possibilities that might go wrong, and judgements of whether a result fits its cause.',
    points: [
      {
        point: '恐れがある', forms: ['おそれがある', '恐れもある', 'おそれもある'],
        connection: 'V-dic / N＋の ＋ 恐れがある',
        meaning: 'there is a risk that ~',
        explanation: 'Warns of a possible bad outcome. Formal and common in news, weather reports and notices.',
        compare: '～かねない is very close; ～恐れがある is more objective and used in official warnings.',
        examples: [
          { jp: 'この地域は大雨で川があふれる［恐れがある］。', en: 'There is a risk of the river flooding in this area with the heavy rain.' },
          { jp: '早めに手術しないと、病気が悪化する［おそれがある］。', en: 'Without early surgery, the illness may get worse.' },
        ],
      },
      {
        point: 'かねない',
        connection: 'V-ます ＋ かねない',
        meaning: 'could well ~; might (end up) ~',
        explanation: 'Something bad could happen as a result of a situation or a careless act. The verb is affirmative but the meaning is a warning.',
        compare: 'Do not confuse with ～かねる ("cannot"). ～かねない means "is capable of (something bad)".',
        examples: [
          { jp: '睡眠不足のまま運転すると、事故を起こし［かねない］。', en: 'Driving without enough sleep could well lead to an accident.' },
          { jp: 'あんな言い方をしたら、誤解され［かねない］よ。', en: 'If you put it like that, you might be misunderstood.' },
        ],
      },
      {
        point: 'だけあって', forms: ['だけのことはある', 'だけある'],
        connection: 'plain (N / な-adj, without だ) ＋ だけあって',
        meaning: 'as you would expect from ~',
        explanation: 'Praises a result as fully living up to its cause — the effort, the reputation, the price.',
        compare: '～だけに can carry a negative "all the more"; ～だけあって is consistently positive.',
        examples: [
          { jp: '十年も住んでいた［だけあって］、彼はこの町に詳しい。', en: 'As you\'d expect from someone who lived here ten years, he knows the town well.' },
          { jp: 'さすが一流のホテル［だけあって］、サービスが素晴らしい。', en: 'As you would expect of a top hotel, the service is excellent.' },
        ],
      },
      {
        point: 'から見ると', forms: ['から見れば', 'から見て', 'から見ても'],
        connection: 'N ＋ から見ると',
        meaning: 'judging from ~ / from the point of view of ~',
        explanation: 'States the basis or viewpoint from which a judgement is made.',
        compare: '～からすると is close; ～にとって expresses whose benefit or perspective, not the evidence.',
        examples: [
          { jp: '空の色［から見ると］、午後は晴れそうだ。', en: 'Judging from the colour of the sky, it looks like it will be fine this afternoon.' },
          { jp: '子ども［から見れば］、大人の悩みは分かりにくい。', en: 'From a child\'s point of view, adults\' worries are hard to understand.' },
        ],
      },
      {
        point: 'ても　仕方がない', forms: ['ても仕方がない', 'ても仕方ない', 'てもしかたがない', 'でも仕方がない'],
        connection: 'V-て ＋ も仕方がない',
        meaning: 'there is no point in ~ / it can\'t be helped if ~',
        explanation: 'Either doing something is useless, or a result is understandable and you cannot complain about it.',
        compare: '～てもしょうがない is the conversational version.',
        examples: [
          { jp: '済んだことを悔やん［でも仕方がない］。', en: 'There is no point regretting what is already done.' },
          { jp: 'あんな態度では、叱られ［ても仕方ない］。', en: 'With that attitude, you can\'t complain if you get told off.' },
        ],
      },
    ],
  },
  {
    id: 'n2-standpoint',
    jp: '立場と対象',
    title: 'Standpoint and target',
    summary: 'Whose point of view something is from, what it is aimed at, and where it takes place.',
    points: [
      {
        point: 'にとって', forms: ['にとっては', 'にとっての'],
        connection: 'N (a person or group) ＋ にとって',
        meaning: 'for ~; from the standpoint of ~',
        explanation: 'Introduces the person or group from whose position an evaluation is made. The second half is a judgement: 大切だ, 難しい, 必要だ.',
        compare: '～に対して marks the target of an action or attitude; ～にとって marks whose viewpoint is meant.',
        examples: [
          { jp: '私［にとって］、家族は何よりも大切だ。', en: 'For me, family matters more than anything.' },
          { jp: '日本人［にとっては］簡単でも、留学生には難しい言葉だ。', en: 'It may be easy for Japanese people, but it is a hard word for international students.' },
        ],
      },
      {
        point: 'にしたら', forms: ['にすれば', 'にしてみれば'],
        connection: 'N (a person) ＋ にしたら',
        meaning: 'from ~\'s point of view; if you were ~',
        explanation: 'Imagines how a particular person would feel, often someone other than the speaker.',
        compare: '～にとって states a general evaluation; ～にしたら puts yourself in that person\'s shoes.',
        examples: [
          { jp: '親［にしたら］、子どもの一人暮らしは心配だろう。', en: 'From a parent\'s point of view, a child living alone must be worrying.' },
          { jp: '店の人［にすれば］、急な予約の取り消しは困るはずだ。', en: 'For the restaurant, a sudden cancellation must be a real problem.' },
        ],
      },
      {
        point: 'に対して', forms: ['に対し', 'に対する'],
        connection: 'N ＋ に対して',
        meaning: 'towards ~; against ~ / in contrast to ~',
        explanation: 'Marks the target of an action, feeling or attitude. It can also contrast two things: 兄が明るいのに対して、弟は静かだ.',
        compare: '～について is "about (a topic)"; ～に対して is "aimed at" someone or something.',
        examples: [
          { jp: '客［に対して］、そんな失礼な言い方をしてはいけない。', en: 'You must not speak so rudely to a customer.' },
          { jp: '都会の人口が増えているの［に対し］、農村では減っている。', en: 'While city populations are increasing, those in farming villages are falling.' },
        ],
      },
      {
        point: 'において', forms: ['における', 'においては', 'においても'],
        connection: 'N ＋ において',
        meaning: 'in ~; at ~ (formal)',
        explanation: 'A formal equivalent of で for a place, time, field or situation. Common in written reports and speeches.',
        compare: 'Plain で is everyday; ～において sounds official. Before a noun it becomes ～における.',
        examples: [
          { jp: '卒業式は{大講堂|だいこうどう}［において］行われます。', en: 'The graduation ceremony will be held in the main hall.' },
          { jp: '現代社会［における］インターネットの役割は大きい。', en: 'The internet plays a large role in modern society.' },
        ],
      },
      {
        point: 'を中心に', forms: ['を中心として', 'を中心にして'],
        connection: 'N ＋ を中心に',
        meaning: 'centred on ~; mainly ~',
        explanation: 'Something spreads out from, or focuses on, a central point — a place, a person or a topic.',
        compare: '～をはじめ lists the leading example; ～を中心に describes a centre and what surrounds it.',
        examples: [
          { jp: '駅［を中心に］、商店街が広がっている。', en: 'A shopping area spreads out around the station.' },
          { jp: '今日の会議は来年の予算［を中心に］話し合います。', en: 'Today\'s meeting will focus mainly on next year\'s budget.' },
        ],
      },
      {
        point: 'をめぐって', forms: ['をめぐり', 'をめぐる'],
        connection: 'N ＋ をめぐって',
        meaning: 'concerning ~; over ~ (a dispute)',
        explanation: 'A topic around which opinions clash — debate, argument, conflict. The verb is usually 議論する, 対立する, 争う.',
        compare: '～について is neutral "about"; ～をめぐって implies several sides at odds.',
        examples: [
          { jp: '新しい空港の建設［をめぐって］、住民の意見が分かれている。', en: 'Residents are divided over the construction of a new airport.' },
          { jp: '遺産［をめぐる］争いが続いている。', en: 'A dispute over the inheritance is still going on.' },
        ],
      },
      {
        point: '向け', forms: ['向けの', '向けに'],
        connection: 'N ＋ 向け',
        meaning: 'aimed at ~; designed for ~',
        explanation: 'Made or intended for a particular audience or market.',
        compare: '～向き means "suitable for" (it happens to suit); ～向け means "intended for" (it was made for).',
        examples: [
          { jp: 'この辞書は外国人［向けに］作られている。', en: 'This dictionary was made for foreign learners.' },
          { jp: '高齢者［向けの］スマートフォンが人気だ。', en: 'Smartphones designed for elderly people are popular.' },
        ],
      },
    ],
  },
  {
    id: 'n2-topic',
    jp: '話題',
    title: 'Raising a topic',
    summary: 'Bringing something up, setting it aside, and stating what something truly is.',
    points: [
      {
        point: 'といえば', forms: ['と言えば', 'というと'],
        connection: 'N ＋ といえば',
        meaning: 'speaking of ~; when you think of ~',
        explanation: 'Picks up a topic just mentioned and adds what comes to mind, or names what something is best known for.',
        compare: '～というと is very close and also used to check what someone means.',
        examples: [
          { jp: '北海道［といえば］、やはりラーメンがおいしい。', en: 'When you think of Hokkaido, the ramen really is delicious.' },
          { jp: '「来週は試験だね。」「試験［と言えば］、範囲はもう分かった？」', en: '"There\'s an exam next week." "Speaking of the exam, do you know what it covers yet?"' },
        ],
      },
      {
        point: 'にかけては', forms: ['にかけても'],
        connection: 'N ＋ にかけては',
        meaning: 'when it comes to ~ (no one is better)',
        explanation: 'Introduces a skill or field in which someone excels. The second half is high praise.',
        compare: 'Do not confuse with ～から～にかけて ("from … through …").',
        examples: [
          { jp: '料理［にかけては］、姉にかなう人はいない。', en: 'When it comes to cooking, no one can match my sister.' },
          { jp: '足の速さ［にかけては］、クラスで一番だ。', en: 'When it comes to running fast, he is the best in the class.' },
        ],
      },
      {
        point: 'はともかく', forms: ['はともかくとして'],
        connection: 'N ＋ はともかく',
        meaning: 'leaving ~ aside; ~ aside',
        explanation: 'Sets one consideration aside as less important for now, to focus on another.',
        compare: '～はもちろん adds something obvious; ～はともかく puts it to one side.',
        examples: [
          { jp: '見た目［はともかく］、味はとてもいい。', en: 'Looks aside, it tastes very good.' },
          { jp: '結果［はともかくとして］、最後まで頑張ったことが大切だ。', en: 'Never mind the result — what matters is that you kept going to the end.' },
        ],
      },
      {
        point: 'というものだ',
        connection: 'plain ＋ というものだ',
        meaning: 'that is what ~ is (truly)',
        explanation: 'States the speaker\'s view of the true nature of something, often as a general truth or a mild reproach.',
        compare: '～というものではない is its negative counterpart, rejecting an oversimplified idea.',
        examples: [
          { jp: '困っている人を助けるのが、友達［というものだ］。', en: 'Helping someone in trouble is what a friend is for.' },
          { jp: '一度の失敗であきらめるのは、もったいない［というものだ］。', en: 'Giving up after one failure is simply a waste.' },
        ],
      },
      {
        point: 'ものだ', forms: ['ものです', 'ものだった'],
        connection: 'plain ＋ ものだ',
        meaning: 'one should ~ / it is natural that ~ / used to ~',
        explanation: 'Expresses a general truth or social expectation (人の話は最後まで聞くものだ), or with a past verb, nostalgia for what used to happen.',
        compare: '～べきだ is a direct duty; ～ものだ presents it as common sense.',
        examples: [
          { jp: '目上の人には敬語を使う［ものだ］。', en: 'You should use polite language with your superiors.' },
          { jp: '子どものころは、よくこの川で泳いだ［ものだ］。', en: 'When I was a child, I often used to swim in this river.' },
        ],
      },
    ],
  },
  {
    id: 'n2-addition',
    jp: '追加',
    title: 'Not only… but also',
    summary: 'Adding one thing on top of another, in the same direction.',
    points: [
      {
        point: 'うえに', forms: ['上に'],
        connection: 'plain (N＋の/である, な-adj＋な) ＋ うえに',
        meaning: 'on top of ~; besides ~',
        explanation: 'Adds a second point in the same direction — both good or both bad.',
        compare: '～だけでなく is the neutral everyday version.',
        examples: [
          { jp: 'この部屋は広い［うえに］、駅にも近い。', en: 'This room is spacious, and on top of that it is close to the station.' },
          { jp: '道に迷った［上に］、雨まで降ってきた。', en: 'I got lost, and on top of that it started to rain.' },
        ],
      },
      {
        point: 'ばかりか', forms: ['ばかりでなく'],
        connection: 'plain (N / な-adj＋な) ＋ ばかりか',
        meaning: 'not only ~ but even ~',
        explanation: 'The second point goes further than the first, often surprisingly. The tone is stronger than ～だけでなく.',
        compare: '～どころか reverses the first point; ～ばかりか keeps it and adds more.',
        examples: [
          { jp: '彼は謝らない［ばかりか］、逆に怒り出した。', en: 'Not only did he not apologise, he even got angry.' },
          { jp: 'この本は子ども［ばかりでなく］、大人にも人気がある。', en: 'This book is popular not only with children but with adults too.' },
        ],
      },
      {
        point: 'のみならず', forms: ['のみでなく'],
        connection: 'plain (N / な-adj, with である) ＋ のみならず',
        meaning: 'not only ~ (but also) ~',
        explanation: 'A formal, written "not only". The second half usually has も.',
        compare: 'Same meaning as ～だけでなく, but for formal writing and speeches.',
        examples: [
          { jp: 'この問題は日本［のみならず］、世界中で議論されている。', en: 'This issue is being debated not only in Japan but all over the world.' },
          { jp: '彼女は歌手である［のみならず］、作家としても活躍している。', en: 'She is not only a singer but also active as a writer.' },
        ],
      },
      {
        point: 'に限らず',
        connection: 'N ＋ に限らず',
        meaning: 'not limited to ~',
        explanation: 'Something applies more widely than just the named thing.',
        compare: '～に限って means "only in the case of" — the opposite direction.',
        examples: [
          { jp: 'この公園は子ども［に限らず］、大人も楽しめる。', en: 'This park is not just for children — adults can enjoy it too.' },
          { jp: '週末［に限らず］、平日もこの店は混んでいる。', en: 'This shop is crowded on weekdays too, not just weekends.' },
        ],
      },
      {
        point: 'とともに', forms: ['と共に'],
        connection: 'N / V-dic ＋ とともに',
        meaning: 'together with ~ / as ~ / at the same time as ~',
        explanation: 'Formal "together with" a person, or "at the same time as" or "along with" a change.',
        compare: 'For gradual change it is close to ～につれて; for people it means と一緒に.',
        examples: [
          { jp: '家族［とともに］、新しい年を迎えた。', en: 'I welcomed the New Year together with my family.' },
          { jp: '技術の進歩［と共に］、生活は便利になった。', en: 'Life has become more convenient along with advances in technology.' },
        ],
      },
    ],
  },
  {
    id: 'n2-including',
    jp: '例と範囲',
    title: 'Including and as a matter of course',
    summary: 'Naming the obvious first, giving a leading example, and doing something on the side.',
    points: [
      {
        point: 'はもとより',
        connection: 'N ＋ はもとより',
        meaning: 'not to mention ~; let alone ~',
        explanation: 'The first item is obviously included; the point is that the second one is too. Formal.',
        compare: '～はもちろん is the everyday version.',
        examples: [
          { jp: 'この祭りには、地元の人［はもとより］、外国からの観光客も多く訪れる。', en: 'This festival draws many tourists from abroad, not to mention the local people.' },
          { jp: '健康のためには、食事［はもとより］、睡眠も大切だ。', en: 'For your health, sleep matters too, not just diet.' },
        ],
      },
      {
        point: 'はもちろん', forms: ['はもちろんのこと'],
        connection: 'N ＋ はもちろん',
        meaning: 'of course ~, and also ~',
        explanation: 'The first item goes without saying; the second is added. Conversational and very common.',
        compare: 'Same meaning as ～はもとより, but less formal.',
        examples: [
          { jp: '彼は英語［はもちろん］、フランス語も話せる。', en: 'He speaks French, not to mention English.' },
          { jp: '平日［はもちろんのこと］、週末も働いている。', en: 'He works weekends too, never mind weekdays.' },
        ],
      },
      {
        point: 'をはじめ', forms: ['をはじめとして', 'をはじめとする'],
        connection: 'N ＋ をはじめ',
        meaning: 'starting with ~; including ~',
        explanation: 'Names the most representative or important member of a group before the rest.',
        compare: '～を中心に is about a centre; ～をはじめ is about the first, leading example.',
        examples: [
          { jp: '社長［をはじめ］、社員全員がパーティーに出席した。', en: 'Everyone in the company, starting with the president, attended the party.' },
          { jp: '京都には金閣寺［をはじめとする］有名な寺が多い。', en: 'Kyoto has many famous temples, the Kinkaku-ji first among them.' },
        ],
      },
      {
        point: 'ついでに',
        connection: 'V-dic / V-た / N＋の ＋ ついでに',
        meaning: 'while ~ (I also ~)',
        explanation: 'Taking the chance of doing one thing to do a second, extra thing at the same time.',
        compare: '～がてら is the literary N1 equivalent.',
        examples: [
          { jp: '郵便局に行った［ついでに］、銀行にも寄った。', en: 'While I was at the post office, I also dropped in at the bank.' },
          { jp: '散歩の［ついでに］、パンを買ってきてくれる？', en: 'While you are out for your walk, could you pick up some bread?' },
        ],
      },
    ],
  },
  {
    id: 'n2-feeling',
    jp: '感情の強さ',
    title: 'Strong feelings',
    summary: 'Feelings too strong to hold back, and exclamations of how much something mattered.',
    points: [
      {
        point: 'てたまらない', forms: ['でたまらない', 'てたまりません'],
        connection: 'V-て / い-adj＋くて / な-adj＋で ＋ たまらない',
        meaning: 'unbearably ~; dying to ~',
        explanation: 'A feeling or physical sensation so strong the speaker cannot stand it. Used about the speaker\'s own feelings.',
        compare: '～てならない is more about a feeling that wells up spontaneously; ～てたまらない stresses intensity.',
        examples: [
          { jp: '朝から何も食べていないので、おなかがすい［てたまらない］。', en: 'I have eaten nothing since morning, so I am starving.' },
          { jp: '合格の知らせを聞いて、うれしく［てたまらない］。', en: 'Hearing I passed, I am overjoyed.' },
        ],
      },
      {
        point: 'てならない', forms: ['でならない', 'てなりません'],
        connection: 'V-て / い-adj＋くて / な-adj＋で ＋ ならない',
        meaning: 'cannot help feeling ~',
        explanation: 'A feeling arises by itself and the speaker cannot suppress it — usually worry, regret or a hunch.',
        compare: 'Goes with verbs of feeling (気がする, 思える); ～てたまらない goes with sensations like hunger or heat too.',
        examples: [
          { jp: '一人で旅行している娘のことが心配［でならない］。', en: 'I can\'t stop worrying about my daughter, who is travelling alone.' },
          { jp: '何か大事なことを忘れている気がし［てならない］。', en: 'I can\'t shake the feeling that I have forgotten something important.' },
        ],
      },
      {
        point: 'ずにはいられない', forms: ['ずにはいられません', 'ずにはいられなかった'],
        connection: 'V-ない ＋ ずにはいられない (する → せずには)',
        meaning: 'cannot help ~ing',
        explanation: 'An action the speaker is driven to do despite themselves — laughing, crying, saying something.',
        compare: '～ないではいられない means the same and is a little more conversational.',
        examples: [
          { jp: 'あの映画の最後の場面は、泣か［ずにはいられない］。', en: 'You can\'t watch the last scene of that film without crying.' },
          { jp: '彼の話があまりに面白くて、笑わ［ずにはいられなかった］。', en: 'His story was so funny that I couldn\'t help laughing.' },
        ],
      },
      {
        point: 'ないではいられない', forms: ['ないではいられなかった'],
        connection: 'V-ない ＋ ないではいられない',
        meaning: 'cannot help ~ing',
        explanation: 'The same as ～ずにはいられない: an urge too strong to resist.',
        compare: 'A slightly softer, more spoken version of ～ずにはいられない.',
        examples: [
          { jp: '困っている人を見ると、声をかけ［ないではいられない］。', en: 'When I see someone in trouble, I can\'t help speaking to them.' },
          { jp: '事故のニュースを聞いて、家族に電話し［ないではいられなかった］。', en: 'When I heard about the accident, I had to phone my family.' },
        ],
      },
      {
        point: 'ことか', forms: ['ことでしょう'],
        connection: 'plain (な-adj＋な) ＋ ことか',
        meaning: 'how (very) ~!',
        explanation: 'An exclamation of how intensely something was felt. It usually goes with question words like どんなに, 何度.',
        compare: 'Not a question — it ends in か but expresses strong emotion.',
        examples: [
          { jp: 'あなたからの手紙を、どんなに待っていた［ことか］。', en: 'How I longed for your letter!' },
          { jp: '無事だと聞いて、どれほど安心した［ことでしょう］。', en: 'What a relief it was to hear you were safe!' },
        ],
      },
      {
        point: 'ことに',
        connection: 'V-た / い-adj / な-adj＋な ＋ ことに',
        meaning: 'to one\'s ~ (surprise, regret, joy)',
        explanation: 'Opens a sentence with the speaker\'s emotional reaction to what follows: 驚いたことに, 残念なことに, うれしいことに.',
        compare: 'The adjective before it must express a feeling; it frames the whole statement that follows.',
        examples: [
          { jp: '驚いた［ことに］、十年前の友達から電話があった。', en: 'To my surprise, I got a call from a friend I had not heard from in ten years.' },
          { jp: '残念な［ことに］、その店は先月閉まってしまった。', en: 'Sadly, that shop closed last month.' },
        ],
      },
    ],
  },
  {
    id: 'n2-emphasis',
    jp: '強調と程度',
    title: 'Emphasis and degree',
    summary: 'Even this much, nothing but this, never that — and how far something goes.',
    points: [
      {
        point: 'さえ', forms: ['でさえ'],
        connection: 'N ＋ (で)さえ',
        meaning: 'even ~',
        explanation: 'Picks out an extreme example to show how far something goes: even the easiest, even an expert.',
        compare: '～すら is the written equivalent. ～さえ～ば means "if only", a separate point.',
        examples: [
          { jp: '忙しくて、水を飲む時間［さえ］なかった。', en: 'I was so busy I did not even have time to drink some water.' },
          { jp: 'この問題は先生［でさえ］解けなかった。', en: 'Even the teacher could not solve this problem.' },
        ],
      },
      {
        point: 'にほかならない', forms: ['にほかなりません', 'に他ならない'],
        connection: 'N ＋ にほかならない',
        meaning: 'is nothing other than ~; is precisely ~',
        explanation: 'A strong, formal assertion that something is exactly this and nothing else — often naming a cause.',
        compare: '～にすぎない belittles ("merely"); ～にほかならない insists ("none other than").',
        examples: [
          { jp: '今回の成功は、チーム全員の協力の結果［にほかならない］。', en: 'This success is nothing other than the result of the whole team\'s cooperation.' },
          { jp: '親が厳しく言うのは、子どもを思う気持ちから［にほかなりません］。', en: 'Parents speak strictly precisely because they care about their children.' },
        ],
      },
      {
        point: 'ものか', forms: ['もんか', 'ものですか'],
        connection: 'plain (な-adj＋な) ＋ ものか',
        meaning: 'certainly not ~; as if I would ~',
        explanation: 'A strong, emotional refusal or denial, shaped like a rhetorical question. Conversational.',
        compare: '～わけがない is a reasoned denial; ～ものか is an emotional one.',
        examples: [
          { jp: 'あんなひどい店には、二度と行く［ものか］。', en: 'I will never go to that awful shop again.' },
          { jp: '「疲れた？」「疲れてなんかいる［もんか］。」', en: '"Are you tired?" "Me, tired? Not a chance."' },
        ],
      },
      {
        point: 'だらけ',
        connection: 'N ＋ だらけ',
        meaning: 'full of ~; covered in ~',
        explanation: 'Covered in or full of something, nearly always something unwelcome: 泥, 間違い, ごみ.',
        compare: '～まみれ is for a surface coated in liquid or dirt; ～だらけ can be any large amount, including mistakes.',
        examples: [
          { jp: 'この作文は間違い［だらけ］だ。', en: 'This essay is full of mistakes.' },
          { jp: '雨の中で遊んだので、子どもの靴は泥［だらけ］になった。', en: 'After playing in the rain, the child\'s shoes were covered in mud.' },
        ],
      },
      {
        point: 'ほど', forms: ['ほどだ', 'ほどの'],
        connection: 'plain (な-adj＋な) ＋ ほど',
        meaning: 'to the extent that ~; so ~ that',
        explanation: 'Describes a degree by an example of what it leads to: so tired I could fall asleep standing up.',
        compare: '～くらい is close and a little more casual. ～ば～ほど means "the more… the more", a separate pattern.',
        examples: [
          { jp: '立ったまま眠れる［ほど］疲れていた。', en: 'I was so tired I could have fallen asleep standing up.' },
          { jp: '声が出なくなる［ほど］大きな声で応援した。', en: 'We cheered so loudly that we lost our voices.' },
        ],
      },
      {
        point: 'やら',
        connection: 'N / V-dic ＋ やら ＋ N / V-dic ＋ やら',
        meaning: '~ and ~ and so on (a jumble of)',
        explanation: 'Lists a few things from among many, usually a hectic or confusing mix, and usually in pairs.',
        compare: '～とか～とか is a casual neutral list; ～やら～やら suggests being overwhelmed.',
        examples: [
          { jp: '引っ越しの準備［やら］仕事やらで、毎日忙しい。', en: 'What with getting ready to move and work, I am busy every day.' },
          { jp: '恥ずかしい［やら］悔しいやらで、何も言えなかった。', en: 'I was so embarrassed and frustrated that I could not say a thing.' },
        ],
      },
    ],
  },
  {
    id: 'n2-possible',
    jp: '可能と不可能',
    title: 'Can and cannot (1)',
    summary: 'Formal ways to say something is possible, impossible, hard to accept, or not something you can do.',
    points: [
      {
        point: '得る', forms: ['うる', 'える'],
        connection: 'V-ます ＋ 得る',
        meaning: 'can ~; it is possible that ~',
        explanation: 'A formal "can" or "may", read える or うる. Most often in あり得る ("it is possible") and 考え得る ("conceivable").',
        compare: '～られる is the ordinary potential form; ～得る sounds written and is about possibility more than ability.',
        examples: [
          { jp: 'そんな事故は、誰にでも起こり［得る］。', en: 'An accident like that could happen to anyone.' },
          { jp: '考え［うる］すべての方法を試してみた。', en: 'I tried every method I could think of.' },
        ],
      },
      {
        point: '得ない', forms: ['得なかった'],
        connection: 'V-ます ＋ 得ない',
        meaning: 'cannot ~; it is impossible that ~',
        explanation: 'The negative of ～得る, read えない. Most common in あり得ない ("impossible, unthinkable").',
        compare: 'Do not confuse with ～ざるを得ない ("have no choice but to"), which also contains 得ない.',
        examples: [
          { jp: '彼が約束を忘れるなんて、あり［得ない］。', en: 'It is unthinkable that he would forget a promise.' },
          { jp: 'その時の気持ちは、言葉では表し［得ない］。', en: 'How I felt at that moment cannot be put into words.' },
        ],
      },
      {
        point: 'がたい',
        connection: 'V-ます ＋ がたい',
        meaning: 'hard to ~ (emotionally)',
        explanation: 'Difficult to do because of feelings — to believe, to forgive, to accept — not because of physical difficulty.',
        compare: '～にくい is physical or practical difficulty (読みにくい字); ～がたい is about the heart.',
        examples: [
          { jp: 'あの優しい彼がうそをついたとは、信じ［がたい］。', en: 'It is hard to believe that someone as kind as him lied.' },
          { jp: '子どもを傷つけるような行為は許し［がたい］。', en: 'Acts that hurt children are hard to forgive.' },
        ],
      },
      {
        point: 'かねる', forms: ['かねます', 'かねません'],
        connection: 'V-ます ＋ かねる',
        meaning: 'cannot ~ (politely declining)',
        explanation: 'A polite way to say you are unable to do something, mainly in service and business situations: 分かりかねます, お答えしかねます.',
        compare: '～かねない looks similar but means "could well (do something bad)".',
        examples: [
          { jp: '申し訳ございませんが、その件についてはお答えし［かねます］。', en: 'I am very sorry, but I am unable to answer regarding that matter.' },
          { jp: 'このような条件では、お引き受けし［かねます］。', en: 'I am afraid I cannot accept under these conditions.' },
        ],
      },
    ],
  },
  {
    id: 'n2-possible-2',
    jp: '可能と不可能',
    title: 'Can and cannot (2)',
    summary: 'More ways to say something cannot be done — or that it was carried through to the end.',
    points: [
      {
        point: 'きれない', forms: ['切れない', 'きれません'],
        connection: 'V-ます ＋ きれない',
        meaning: 'cannot ~ completely; too many to ~',
        explanation: 'Unable to finish something because there is too much — too many to count, too much to eat.',
        compare: 'The positive ～きる means "do completely" (食べきる).',
        examples: [
          { jp: 'こんなにたくさんの料理は、二人では食べ［きれない］。', en: 'The two of us cannot possibly eat this much food.' },
          { jp: '夜空には数え［切れない］ほどの星が出ていた。', en: 'There were more stars in the night sky than anyone could count.' },
        ],
      },
      {
        point: 'っこない',
        connection: 'V-ます ＋ っこない',
        meaning: 'there is no way ~ (casual)',
        explanation: 'A casual, emphatic denial of possibility, used in conversation.',
        compare: '～わけがない means the same but is more neutral; ～っこない is spoken and familiar.',
        examples: [
          { jp: 'こんな難しい問題、子どもに解け［っこない］よ。', en: 'There\'s no way a child could solve a problem this hard.' },
          { jp: '一日で全部覚えられ［っこない］。', en: 'You can\'t possibly memorise all of it in one day.' },
        ],
      },
      {
        point: 'ようがない', forms: ['ようもない'],
        connection: 'V-ます ＋ ようがない',
        meaning: 'there is no way to ~',
        explanation: 'There is no method for doing something, because a means or information is missing.',
        compare: '～ことができない is a plain inability; ～ようがない stresses that no method exists.',
        examples: [
          { jp: '住所が分からないので、手紙の送り［ようがない］。', en: 'I do not know the address, so there is no way to send the letter.' },
          { jp: 'ここまで壊れていては、直し［ようがない］。', en: 'When it is this broken, there is no way to repair it.' },
        ],
      },
      {
        point: 'ぬく', forms: ['抜く', 'ぬいた', '抜いた'],
        connection: 'V-ます ＋ ぬく',
        meaning: 'do ~ through to the end',
        explanation: 'Carrying something through to completion despite difficulty: 走りぬく, やりぬく, 考えぬく.',
        compare: '～きる means simply "completely"; ～ぬく adds endurance against difficulty.',
        examples: [
          { jp: '足が痛かったが、マラソンを最後まで走り［ぬいた］。', en: 'My legs hurt, but I ran the marathon all the way to the end.' },
          { jp: 'これは何日も考え［抜いた］末の決断だ。', en: 'This decision came after days of thinking it through.' },
        ],
      },
    ],
  },
  {
    id: 'n2-limit',
    jp: '限定',
    title: 'Only and as far as',
    summary: 'Limiting something to one thing, one time, or one extent.',
    points: [
      {
        point: 'きり', forms: ['っきり', 'きりだ'],
        connection: 'N / V-た ＋ きり',
        meaning: 'only ~ / since ~ (and not again)',
        explanation: 'With a noun or number: "only" (二人きり). After a past verb: something happened and nothing has followed since (行ったきり帰らない).',
        compare: '～だけ is a neutral "only"; ～きり often suggests nothing more has happened.',
        examples: [
          { jp: '久しぶりに、母と二人［きり］で食事をした。', en: 'For the first time in a while, I had a meal alone with my mother.' },
          { jp: '兄は朝出かけた［きり］、まだ帰ってこない。', en: 'My brother went out this morning and has not been back since.' },
        ],
      },
      {
        point: 'にすぎない', forms: ['に過ぎない', 'にすぎません', 'に過ぎなかった'],
        connection: 'N / plain ＋ にすぎない',
        meaning: 'merely ~; no more than ~',
        explanation: 'Belittles something as only that, and not as important or large as might be thought.',
        compare: 'The opposite in tone from ～にほかならない, which insists something is exactly this.',
        examples: [
          { jp: '私は自分の意見を述べた［にすぎない］。', en: 'I merely gave my own opinion.' },
          { jp: '参加者はわずか十人［に過ぎなかった］。', en: 'There were no more than ten participants.' },
        ],
      },
      {
        point: 'てばかりいる', forms: ['でばかりいる', 'てばかりいて', 'でばかりいて'],
        connection: 'V-て ＋ ばかりいる',
        meaning: 'do nothing but ~',
        explanation: 'Criticises someone for doing the same thing all the time, to the exclusion of what they should be doing.',
        compare: '～ばかり after a noun means "only that thing" (肉ばかり食べる).',
        examples: [
          { jp: '弟は休みの日も、ゲームをし［てばかりいる］。', en: 'My little brother does nothing but play games, even on his days off.' },
          { jp: '遊ん［でばかりいて］、全然勉強しない。', en: 'He does nothing but play and doesn\'t study at all.' },
        ],
      },
      {
        point: 'かぎり', forms: ['限り'],
        connection: 'V-dic / V-ている / N＋の ＋ かぎり',
        meaning: 'as long as ~ / as far as ~',
        explanation: 'Sets a condition or a limit: as long as a state continues, or as far as the speaker knows or can.',
        compare: '～かぎりでは narrows it to "as far as … goes" (私の知る限りでは).',
        examples: [
          { jp: '私が知っている［かぎり］、彼はうそをつくような人ではない。', en: 'As far as I know, he is not the kind of person who lies.' },
          { jp: '雨が降らない［限り］、試合は予定どおり行います。', en: 'As long as it does not rain, the match will go ahead as planned.' },
        ],
      },
    ],
  },
  {
    id: 'n2-limit-2',
    jp: '部分否定',
    title: 'Not necessarily, and not now',
    summary: 'Denying only part of an idea, and setting aside what is out of the question.',
    points: [
      {
        point: 'を問わず', forms: ['は問わず'],
        connection: 'N ＋ を問わず',
        meaning: 'regardless of ~',
        explanation: 'Something applies no matter the value of a category — age, sex, experience, day or night. Common in job ads and notices.',
        compare: '～にかかわらず is very close and also follows paired opposites (晴雨にかかわらず).',
        examples: [
          { jp: 'このイベントには、年齢［を問わず］誰でも参加できます。', en: 'Anyone can take part in this event, regardless of age.' },
          { jp: 'この店は昼夜［を問わず］、いつも混んでいる。', en: 'This restaurant is always crowded, day or night.' },
        ],
      },
      {
        point: 'とは限らない', forms: ['とは限りません'],
        connection: 'plain ＋ とは限らない',
        meaning: 'not necessarily ~',
        explanation: 'Denies that something is always true. Often after かならずしも or a ～からといって clause.',
        compare: '～わけではない denies an inference; ～とは限らない denies a generalisation.',
        examples: [
          { jp: '専門家の意見が、いつも正しい［とは限らない］。', en: 'Experts\' opinions are not always right.' },
          { jp: 'よく知っている道でも、安全［とは限りません］。', en: 'Even a road you know well is not necessarily safe.' },
        ],
      },
      {
        point: 'わけではない', forms: ['わけでもない', 'わけじゃない'],
        connection: 'plain (N＋の/である, な-adj＋な) ＋ わけではない',
        meaning: 'it is not that ~; it does not mean ~',
        explanation: 'A partial denial: corrects a conclusion the listener might draw, without denying everything.',
        compare: '～わけがない is a total denial ("no way"); ～わけではない is partial ("it is not that…").',
        examples: [
          { jp: '肉が嫌いな［わけではない］が、今日は野菜料理にしよう。', en: 'It is not that I dislike meat, but let\'s have vegetables today.' },
          { jp: '日本に住んでいるからといって、日本語が話せる［わけじゃない］。', en: 'Living in Japan does not mean you can speak Japanese.' },
        ],
      },
      {
        point: 'どころではない', forms: ['どころじゃない'],
        connection: 'V-dic / N ＋ どころではない',
        meaning: 'it is no time for ~; ~ is out of the question',
        explanation: 'Circumstances are so pressing that something else is out of the question right now.',
        compare: '～どころか is a different point: "far from ~".',
        examples: [
          { jp: '明日が締め切りなので、遊ぶ［どころではない］。', en: 'The deadline is tomorrow, so this is no time for fun.' },
          { jp: '熱が高くて、仕事［どころじゃない］。', en: 'I have such a high fever that work is out of the question.' },
        ],
      },
    ],
  },
  {
    id: 'n2-condition',
    jp: '条件',
    title: 'Conditions',
    summary: 'What must happen first, what is enough, and what it all depends on.',
    points: [
      {
        point: 'さえすれば', forms: ['さえあれば'],
        connection: 'V-ます ＋ さえすれば / N ＋ さえ ＋ ～ば',
        meaning: 'as long as ~; if only ~',
        explanation: 'Only one condition is needed for the result: if just this happens, the rest will follow.',
        compare: '～さえ alone means "even"; with ～ば it becomes "as long as".',
        examples: [
          { jp: 'この薬を飲み［さえすれば］、すぐによくなりますよ。', en: 'As long as you take this medicine, you will soon get better.' },
          { jp: 'お金［さえあれば］幸せだと思う人もいる。', en: 'Some people think that as long as they have money, they will be happy.' },
        ],
      },
      {
        point: 'ないことには',
        connection: 'V-ない ＋ ないことには',
        meaning: 'unless ~ (it cannot be ~)',
        explanation: 'Something cannot happen unless a condition is met first. The second half is negative.',
        compare: '～なければ is the neutral conditional; ～ないことには stresses the condition is indispensable.',
        examples: [
          { jp: '実際に使ってみ［ないことには］、良いかどうか分からない。', en: 'You cannot tell whether it is any good until you actually try it.' },
          { jp: '社長が来［ないことには］、会議を始められない。', en: 'We cannot start the meeting unless the president comes.' },
        ],
      },
      {
        point: 'てからでないと', forms: ['てからでなければ', 'てからでないと'],
        connection: 'V-て ＋ からでないと',
        meaning: 'not until ~; only after ~',
        explanation: 'Something cannot be done before a necessary first step. The second half is negative or difficult.',
        compare: 'Similar to ～ないことには, but it focuses on the order: first this, then that.',
        examples: [
          { jp: '親と相談し［てからでないと］、留学は決められない。', en: 'I can\'t decide on studying abroad until I have talked to my parents.' },
          { jp: 'お金を払っ［てからでなければ］、商品は受け取れません。', en: 'You cannot collect the item until you have paid.' },
        ],
      },
      {
        point: 'ては', forms: ['では'],
        connection: 'V-て / い-adj＋くて / な-adj＋で ＋ は',
        meaning: 'if ~ (then something bad follows)',
        explanation: 'A condition that leads to an unwelcome result. The second half is negative: 困る, 無理だ, いけない.',
        compare: '～ては、～ては can also show a repeated cycle (食べては寝る) — a different use.',
        examples: [
          { jp: 'こんなに雨が降っ［ては］、試合は無理だろう。', en: 'With rain like this, the match is surely impossible.' },
          { jp: 'そんなに不安［では］、何もできないよ。', en: 'If you are that anxious, you won\'t be able to do anything.' },
        ],
      },
      {
        point: 'ものなら', forms: ['もんなら'],
        connection: 'V-dic (potential) ＋ ものなら',
        meaning: 'if (only) ~ could ~',
        explanation: 'With a potential verb, a wish for something that is hard or impossible to do. With the volitional (～ようものなら) it warns of bad consequences.',
        compare: '～たら is a plain conditional; ～ものなら marks the condition as unlikely.',
        examples: [
          { jp: '行ける［ものなら］、今すぐ故郷に帰りたい。', en: 'If I could, I would go back to my hometown right now.' },
          { jp: '時間を戻せる［ものなら］、あの日に戻りたい。', en: 'If I could turn back time, I would go back to that day.' },
        ],
      },
      {
        point: 'にしろ', forms: ['にせよ', 'にしても'],
        connection: 'plain (N / な-adj) ＋ にしろ',
        meaning: 'even if ~; whether ~ or ~',
        explanation: 'Grants a possibility and says it does not change the conclusion. Often paired: 行くにしろ行かないにしろ.',
        compare: '～にせよ is the more formal version.',
        examples: [
          { jp: 'どんな理由がある［にしろ］、暴力は許されない。', en: 'Whatever the reason, violence cannot be tolerated.' },
          { jp: '冗談だった［にせよ］、言っていいことと悪いことがある。', en: 'Even if it was a joke, some things just should not be said.' },
        ],
      },
      {
        point: '次第だ', forms: ['次第で', '次第では'],
        connection: 'N ＋ 次第だ',
        meaning: 'depends on ~',
        explanation: 'An outcome is decided entirely by something: effort, the weather, someone\'s answer.',
        compare: 'After a verb stem, 次第 means "as soon as" — a different point.',
        examples: [
          { jp: '合格できるかどうかは、君の努力［次第だ］。', en: 'Whether you pass depends on your own effort.' },
          { jp: '天気［次第で］、明日の予定を決めましょう。', en: 'Let\'s decide tomorrow\'s plans depending on the weather.' },
        ],
      },
    ],
  },
  {
    id: 'n2-must',
    jp: '義務と必然',
    title: 'Having no choice',
    summary: 'Obligation, the only remaining option, and what one simply cannot do.',
    points: [
      {
        point: 'ざるを得ない', forms: ['ざるを得ません', 'ざるをえない'],
        connection: 'V-ない ＋ ざるを得ない (する → せざるを得ない)',
        meaning: 'have no choice but to ~',
        explanation: 'Circumstances force the speaker to do something they would rather not. Formal.',
        compare: '～しかない is the everyday version.',
        examples: [
          { jp: '台風が来るので、旅行は中止せ［ざるを得ない］。', en: 'A typhoon is coming, so we have no choice but to cancel the trip.' },
          { jp: '彼の言うことは正しいと認め［ざるを得ません］。', en: 'I have to admit that what he says is right.' },
        ],
      },
      {
        point: 'しかない',
        connection: 'V-dic ＋ しかない',
        meaning: 'have no choice but to ~; can only ~',
        explanation: 'Only one option is left. Conversational and very common.',
        compare: '～ほかない and ～ざるを得ない express the same idea more formally.',
        examples: [
          { jp: '終電を逃したので、タクシーで帰る［しかない］。', en: 'I missed the last train, so I have no choice but to take a taxi.' },
          { jp: '誰も手伝ってくれないなら、自分でやる［しかない］。', en: 'If nobody will help, I will just have to do it myself.' },
        ],
      },
      {
        point: 'ほかない', forms: ['ほかはない', '他ない'],
        connection: 'V-dic ＋ ほかない',
        meaning: 'have no option but to ~',
        explanation: 'A slightly more formal version of ～しかない: no other way remains.',
        compare: '～よりほかない is the same with より added for emphasis.',
        examples: [
          { jp: '薬が効かない以上、手術をする［ほかない］。', en: 'Since the medicine is not working, there is no option but surgery.' },
          { jp: '道が分からないので、人に聞く［ほかはない］。', en: 'I don\'t know the way, so I have no choice but to ask someone.' },
        ],
      },
      {
        point: 'より　ほかない', forms: ['よりほかない', 'よりほかはない', 'よりほかに方法がない'],
        connection: 'V-dic ＋ よりほかない',
        meaning: 'there is nothing to do but ~',
        explanation: 'The emphatic form of ～ほかない: every alternative has been ruled out.',
        compare: 'Means the same as ～ほかない and ～しかない, but more emphatic and formal.',
        examples: [
          { jp: 'バスが来ないので、駅まで歩く［よりほかない］。', en: 'The bus is not coming, so there is nothing for it but to walk to the station.' },
          { jp: '今となっては、結果を待つ［よりほかはない］。', en: 'At this point, there is nothing to do but wait for the result.' },
        ],
      },
      {
        point: 'わけにはいかない', forms: ['わけにはいきません', 'わけにもいかない'],
        connection: 'V-dic ＋ わけにはいかない',
        meaning: 'cannot (afford to) ~',
        explanation: 'Something is not possible because of social, moral or practical reasons — even though it is physically possible.',
        compare: 'V-ない＋わけにはいかない means "must": 行かないわけにはいかない = "I have to go".',
        examples: [
          { jp: '明日は大事な試験なので、休む［わけにはいかない］。', en: 'Tomorrow is an important exam, so I can\'t afford to take the day off.' },
          { jp: 'お客様を待たせる［わけにはいきません］。', en: 'We cannot keep a customer waiting.' },
        ],
      },
      {
        point: 'べきだ', forms: ['べきではない', 'べき'],
        connection: 'V-dic ＋ べきだ (する → すべきだ / するべきだ)',
        meaning: 'should ~; ought to ~',
        explanation: 'The speaker\'s strong opinion of what is right or proper. Used as advice or criticism, not for rules imposed by others.',
        compare: '～なければならない is an obligation; ～べきだ is a moral or logical judgement.',
        examples: [
          { jp: '若いうちに、いろいろな経験をする［べきだ］。', en: 'You should get as much varied experience as you can while you are young.' },
          { jp: '人の悪口は言う［べきではない］。', en: 'You should not speak ill of others.' },
        ],
      },
    ],
  },
];

export const grammarLessons: Partial<Record<Level, GrammarUnit[]>> = { N2 };
