import { expandQuestionBank } from './expanded-bank.ts';
import { kanjiQuestions } from './kanji-questions.ts';
import { listeningQuestions } from './listening-questions.ts';

export type Level = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';

/** A run of Japanese text. `target: true` marks the underlined item under test —
 *  furigana is always suppressed there so a kanji-reading question can't spoil itself. */
export type Token = string | { kanji: string; reading: string; target?: boolean };

export type Speaker = 'narrator' | 'a' | 'b';

/** Listening audio is authored as ordered lines, never one blob: speaker labels
 *  must never be spoken, and the pauses are what make it sound like exam audio. */
export type NarrationLine = { speaker: Speaker; text: string; pauseAfter?: number };

export type QuestionType = 'GRAMMAR' | 'KANJI' | 'VOCABULARY' | 'LISTENING' | 'READING';

export type Question = {
  type: QuestionType;
  badge: string;
  /** English label for the official 大問 */
  itemType: string;
  /** The official 大問 name, per jlpt.jp 試験科目と問題の構成 */
  jpItemType: string;
  prompt: string;
  tokens?: Token[];
  /** Reading passage, one token row per line — so furigana works here too. */
  passage?: Token[][];
  /** 概要理解 gives no question before the audio; hold it back until played. */
  revealAfterAudio?: boolean;
  narration?: NarrationLine[];
  /** Basename of a pre-rendered clip in public/audio (no extension). */
  audio?: string;
  options: string[];
  answer: number;
  note: string;
  image?: string;
  imageAlt?: string;
};

export const levels: Level[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const levelDetails: Record<Level, { title: string; subtitle: string; accent: string; lesson: string; grammar: string; kanji: string }> = {
  N5: { title: 'First foundations', subtitle: 'Everyday words and simple sentences', accent: '#55a47d', lesson: 'Everyday essentials', grammar: 'Particles & polite forms', kanji: '日 ・ 月 ・ 人' },
  N4: { title: 'Daily confidence', subtitle: 'Practical Japanese for familiar situations', accent: '#4c91a9', lesson: 'Plans and routines', grammar: '～ながら・～やすい', kanji: '予 ・ 定 ・ 遅' },
  N3: { title: 'Bridge to fluency', subtitle: 'Natural conversation and connected ideas', accent: '#7666a7', lesson: 'Work and arrangements', grammar: '～とおりに', kanji: '確 ・ 認 ・ 変' },
  N2: { title: 'Real-world fluency', subtitle: 'Nuanced language for news, work and society', accent: '#d66a4c', lesson: 'Contrast and consequence', grammar: '～にもかかわらず', kanji: '報 ・ 政 ・ 経' },
  N1: { title: 'Advanced mastery', subtitle: 'Abstract, formal and highly nuanced Japanese', accent: '#a34d4d', lesson: 'Analysis and inference', grammar: '～を皮切りに', kanji: '払 ・ 拭 ・ 顕' },
};

export const questionBank: Record<Level, Question[]> = {
  N5: [
    {
      type: 'KANJI', badge: '漢字', itemType: 'Kanji reading', jpItemType: '漢字読み',
      prompt: '＿＿の ことばは ひらがなで どう かきますか。',
      tokens: [{ kanji: '日曜日', reading: 'にちようび', target: true }, 'に　ともだちに　あいます。'],
      options: ['にちようび', 'げつようび', 'どようび', 'かようび'], answer: 0,
      note: '日曜日（にちようび）= Sunday. 日 is read にち at the start and び at the end — the same 日 takes different readings in one word, which is exactly what this item type checks.',
    },
    {
      type: 'VOCABULARY', badge: '語彙', itemType: 'Contextual vocabulary', jpItemType: '文脈規定',
      prompt: '（　）に いれるのに いちばん いい ものを えらんで ください。',
      tokens: ['この　みずは　とても　（　　）です。'],
      options: ['つめたい', 'さむい', 'すずしい', 'ひくい'], answer: 0,
      note: 'つめたい = cold to the touch (water, drinks, hands). さむい is cold weather or air, すずしい is pleasantly cool weather, ひくい is low in height or in a measured number. All four are い-adjectives about temperature, so the sentence context is the only clue.',
    },
    {
      type: 'VOCABULARY', badge: '語彙', itemType: 'Paraphrase', jpItemType: '言い換え類義',
      prompt: 'ぶんと だいたい おなじ いみの ものを えらんで ください。',
      tokens: ['きのうの　テストは　やさしかったです。'],
      options: ['むずかしく　なかったです', 'たのしかったです', 'ながかったです', 'ゆうめいでした'], answer: 0,
      note: 'やさしい has two meanings — "kind" and "easy". Next to テスト it means easy, so むずかしくない is the match. This item type always rewards reading the whole sentence, not just the word.',
    },
    {
      type: 'GRAMMAR', badge: '文法', itemType: 'Grammar form', jpItemType: '文の文法1（文法形式の判断）',
      prompt: '（　）に いれるのに いちばん いい ものを えらんで ください。',
      tokens: ['きのう　ともだち（　　）　てがみを　かきました。'],
      options: ['に', 'を', 'で', 'が'], answer: 0,
      note: 'The person who receives an action is marked with に: ともだちに てがみを かく. を already marks てがみ, and a sentence cannot take two を objects.',
    },
    {
      type: 'GRAMMAR', badge: '文法', itemType: 'Sentence assembly', jpItemType: '文の文法2（文の組み立て）',
      prompt: '★ に はいる ものは どれですか。',
      tokens: ['つくえの　＿＿＿　＿★＿　＿＿＿　＿＿＿　あります。'],
      options: ['に', 'うえ', 'が', 'ほん'], answer: 0,
      note: 'Correct order: つくえの　うえ　に　ほん　が　あります。The ★ is the second blank, so the answer is に. Build the whole sentence first, then read off the starred slot — that is the only reliable way to do this item type.',
    },
    {
      type: 'READING', badge: '読解', itemType: 'Short passage', jpItemType: '内容理解（短文）',
      prompt: '山田さんは かいぎの まえに 何を しますか。',
      passage: [
        ['（', { kanji: '会社', reading: 'かいしゃ' }, 'で、', { kanji: '山田', reading: 'やまだ' }, 'さんの　つくえの　', { kanji: '上', reading: 'うえ' }, 'に　メモが　あります。）'],
        [''],
        [{ kanji: '山田', reading: 'やまだ' }, 'さん'],
        ['きょうは　３', { kanji: '時', reading: 'じ' }, 'から　かいぎが　あります。ばしょは　５かいの　へやです。'],
        ['かいぎの　まえに、この　かみを　２０まい　コピーして　ください。'],
        ['　　　　　　　　　　　　　　　　　　　　', { kanji: '田中', reading: 'たなか' }],
      ],
      options: ['かみを　コピーします', '５かいの　へやを　そうじします', '田中さんに　でんわします', 'かいぎの　メモを　かきます'], answer: 0,
      note: 'The instruction is in the last line: 「かいぎの まえに、この かみを 20まい コピーして ください」. The 3時 and 5かい details are true but they are not what the question asks — short-passage items almost always plant correct-but-irrelevant facts as distractors.',
    },
    {
      type: 'LISTENING', badge: '聴解', itemType: 'Task comprehension', jpItemType: '課題理解',
      prompt: 'おんなの人は 何を 買いますか。',
      audio: 'n5-task',
      narration: [
        { speaker: 'narrator', text: 'みせで　おんなの人と　てんいんが　はなしています。おんなの人は　なにを　かいますか。', pauseAfter: 800 },
        { speaker: 'a', text: 'すみません、たまごは　ありますか。', pauseAfter: 350 },
        { speaker: 'b', text: 'すみません、きょうは　もう　ありません。ぎゅうにゅうは　ありますよ。', pauseAfter: 350 },
        { speaker: 'a', text: 'そうですか。じゃあ、それを　ください。', pauseAfter: 700 },
        { speaker: 'narrator', text: 'おんなの人は　なにを　かいますか。' },
      ],
      options: ['ぎゅうにゅう', 'たまご', 'パン', 'みず'], answer: 0,
      note: 'She asks for eggs, but they are sold out. 「それ」 in her last line points at the ぎゅうにゅう the clerk just offered. In 課題理解 the first thing mentioned is very often not the answer.',
      image: '/irasutoya-shopping.png', imageAlt: 'A family shopping at a supermarket',
    },
    {
      type: 'LISTENING', badge: '聴解', itemType: 'Quick response', jpItemType: '即時応答',
      prompt: 'きいて、いちばん いい へんじを えらんで ください。',
      audio: 'n5-response',
      narration: [{ speaker: 'a', text: 'すみません。その　あかい　りんごを　みっつ　ください。' }],
      options: ['はい、みっつですね。', 'いいえ、りんごでした。', 'さんじに　いきます。', 'あかく　ありません。'], answer: 0,
      note: 'A customer is ordering, so the shopkeeper confirms the quantity. 三つ (みっつ, three items) and 三時 (さんじ, three o’clock) sound similar — that near-homophone trap is standard in 即時応答.',
      image: '/irasutoya-shopping.png', imageAlt: 'A family shopping at a supermarket',
    },
  ],

  N4: [
    {
      type: 'KANJI', badge: '漢字', itemType: 'Kanji reading', jpItemType: '漢字読み',
      prompt: '＿＿の ことばは ひらがなで どう かきますか。',
      tokens: ['あしたの　', { kanji: '予定', reading: 'よてい', target: true }, 'を　かくにんします。'],
      options: ['よてい', 'ようてい', 'よってい', 'よだい'], answer: 0,
      note: '予定（よてい）= a plan or schedule. The distractors are all long-vowel and small-つ variations — the exam tests whether you hear 予 as よ, not ように or よっ.',
    },
    {
      type: 'VOCABULARY', badge: '語彙', itemType: 'Contextual vocabulary', jpItemType: '文脈規定',
      prompt: '（　）に 入れるのに いちばん いい ものを えらんで ください。',
      tokens: ['いそげば、まだ　バスに　（　　）と　思います。'],
      options: ['間に合う', '追いつく', '間違える', '乗り換える'], answer: 0,
      note: '間に合う = to be in time for something. 追いつく is to catch up with someone who is ahead of you — close enough to be tempting, but it needs a person or a moving target, not a scheduled departure.',
    },
    {
      type: 'VOCABULARY', badge: '語彙', itemType: 'Paraphrase', jpItemType: '言い換え類義',
      prompt: '文と だいたい 同じ 意味の ものを えらんで ください。',
      tokens: ['この　へやは　ずいぶん　ひろいですね。'],
      options: ['とても　ひろい', 'すこし　ひろい', 'あまり　ひろくない', 'ひろすぎる'], answer: 0,
      note: 'ずいぶん = quite / considerably, so it strengthens the adjective (≒ とても). It is not the same as すぎる, which adds the judgement that something is excessive.',
    },
    {
      type: 'GRAMMAR', badge: '文法', itemType: 'Grammar form', jpItemType: '文の文法1（文法形式の判断）',
      prompt: '（　）に 入れるのに いちばん いい ものを えらんで ください。',
      tokens: ['わたしは　', { kanji: '音楽', reading: 'おんがく' }, 'を　', { kanji: '聞', reading: 'き' }, 'き（　　）、べんきょうします。'],
      options: ['ながら', 'まで', 'しか', 'ので'], answer: 0,
      note: 'Verb stem + ながら = doing two things at once. The giveaway is the form of the blank: it follows 聞き, a bare stem, and only ながら attaches there.',
    },
    {
      type: 'GRAMMAR', badge: '文法', itemType: 'Sentence assembly', jpItemType: '文の文法2（文の組み立て）',
      prompt: '★ に 入る ものは どれですか。',
      tokens: ['この　カメラは　＿＿＿　＿★＿　＿＿＿　＿＿＿　です。'],
      options: ['でも', 'だれ', 'つかい', 'やすい'], answer: 0,
      note: 'Correct order: この　カメラは　だれ　でも　つかい　やすい　です。The ★ is the second blank, so the answer is でも. Two chunks are fixed from the start: だれでも (anyone) and 〜やすい (easy to ~), and pairing them up leaves only one arrangement.',
    },
    {
      type: 'READING', badge: '読解', itemType: 'Short passage', jpItemType: '内容理解（短文）',
      prompt: 'あした 雨が やまなかったら、運動会は いつ しますか。',
      passage: [
        ['＜あしたの　', { kanji: '運動会', reading: 'うんどうかい' }, 'に　ついて＞'],
        [''],
        [{ kanji: '天気予報', reading: 'てんきよほう' }, 'に　よると、あしたの　', { kanji: '朝', reading: 'あさ' }, 'は　', { kanji: '雨', reading: 'あめ' }, 'が　', { kanji: '降', reading: 'ふ' }, 'るそうです。'],
        ['そのため、', { kanji: '運動会', reading: 'うんどうかい' }, 'は　', { kanji: '午前', reading: 'ごぜん' }, '９', { kanji: '時', reading: 'じ' }, 'ではなく、', { kanji: '午後', reading: 'ごご' }, '１', { kanji: '時', reading: 'じ' }, 'に　', { kanji: '始', reading: 'はじ' }, 'めます。'],
        ['ただし、', { kanji: '雨', reading: 'あめ' }, 'が　やまない　', { kanji: '場合', reading: 'ばあい' }, 'は、', { kanji: '来週', reading: 'らいしゅう' }, 'の　', { kanji: '土曜日', reading: 'どようび' }, 'に　します。'],
        [{ kanji: '朝', reading: 'あさ' }, '８', { kanji: '時', reading: 'じ' }, 'までに　', { kanji: '学校', reading: 'がっこう' }, 'の　ホームページを　', { kanji: '見', reading: 'み' }, 'て　ください。'],
      ],
      options: ['来週の　土曜日', 'あしたの　午後１時', 'あしたの　午前９時', '来週の　日曜日'], answer: 0,
      note: 'ただし ("however") introduces the exception, and the exception is what the question asks about: 「雨がやまない場合は、来週の土曜日にします」. 午後1時 is the plan only if the rain stops. Watch for ただし and でも — they usually mark the sentence the question is built on.',
    },
    {
      type: 'LISTENING', badge: '聴解', itemType: 'Task comprehension', jpItemType: '課題理解',
      prompt: '女の人は、まず 何を 買いますか。',
      audio: 'n4-task',
      narration: [
        { speaker: 'narrator', text: 'スーパーで　女の人と　店員が　話しています。女の人は、まず　何を　買いますか。', pauseAfter: 800 },
        { speaker: 'a', text: 'すみません、牛乳は　どこですか。', pauseAfter: 350 },
        { speaker: 'b', text: '飲み物は　奥です。でも、卵は　もうすぐ　売り切れますよ。', pauseAfter: 350 },
        { speaker: 'a', text: 'そうですか。じゃあ、先に　そちらへ　行きます。', pauseAfter: 700 },
        { speaker: 'narrator', text: '女の人は、まず　何を　買いますか。' },
      ],
      options: ['卵', '牛乳', 'パン', 'ジュース'], answer: 0,
      note: 'She came for 牛乳, but after hearing the eggs may sell out she says 「先にそちらへ行きます」 — そちら is where the eggs are. The word まず in the question is the whole point: it asks for the order, not the shopping list.',
      image: '/irasutoya-shopping.png', imageAlt: 'A family holding a shopping basket in a supermarket',
    },
    {
      type: 'LISTENING', badge: '聴解', itemType: 'Quick response', jpItemType: '即時応答',
      prompt: '聞いて、いちばん いい 返事を えらんで ください。',
      audio: 'n4-response',
      narration: [{ speaker: 'a', text: 'その　資料、コピーして　おきましょうか。' }],
      options: ['ええ、お願いします。', 'はい、コピーしました。', 'いいえ、資料です。', 'もう　行きましょう。'], answer: 0,
      note: '〜ましょうか here offers to do something for you, so the reply accepts or declines the offer. 「コピーしました」 answers a different question — a past-tense report, not a response to an offer.',
      image: '/irasutoya-meeting.png', imageAlt: 'Colleagues talking in an office',
    },
  ],

  N3: [
    {
      type: 'KANJI', badge: '漢字', itemType: 'Kanji reading', jpItemType: '漢字読み',
      prompt: '＿＿の ことばの 読み方を えらんで ください。',
      tokens: ['メールで　', { kanji: '確認', reading: 'かくにん', target: true }, 'して　ください。'],
      options: ['かくにん', 'かくねん', 'こくにん', 'こくねん'], answer: 0,
      note: '確認（かくにん）= confirmation, checking. 確 is かく and 認 is にん; the distractors swap in こく and ねん, the readings of look-alike kanji like 告 and 念.',
    },
    {
      type: 'VOCABULARY', badge: '語彙', itemType: 'Contextual vocabulary', jpItemType: '文脈規定',
      prompt: '（　）に 入れるのに 最も よい ものを えらんで ください。',
      tokens: ['あの　二人は　', { kanji: '性格', reading: 'せいかく' }, 'が　（　　）ので、よく　けんかを　する。'],
      options: ['合わない', '通じない', '続かない', '及ばない'], answer: 0,
      note: '性格が合う／合わない is a fixed collocation for personalities matching. 話が通じない (not getting through to each other) is close in meaning but collocates with 話, not 性格. Learn N3 vocabulary in pairs — noun + verb — rather than as isolated words.',
    },
    {
      type: 'VOCABULARY', badge: '語彙', itemType: 'Paraphrase', jpItemType: '言い換え類義',
      prompt: '＿＿の ことばに 意味が 最も 近い ものを えらんで ください。',
      tokens: [{ kanji: 'うっかり', reading: '', target: true }, { kanji: '約束', reading: 'やくそく' }, 'を　', { kanji: '忘', reading: 'わす' }, 'れて　しまった。'],
      options: ['不注意で', 'わざと', '完全に', '運よく'], answer: 0,
      note: 'うっかり = carelessly, without noticing (不注意で). わざと is deliberately — the exact opposite; 完全に is completely; 運よく is luckily. うっかり always carries regret, which is why しまった follows it so often.',
    },
    {
      type: 'GRAMMAR', badge: '文法', itemType: 'Grammar form', jpItemType: '文の文法1（文法形式の判断）',
      prompt: '（　）に 入れるのに 最も よい ものを えらんで ください。',
      tokens: [{ kanji: '先生', reading: 'せんせい' }, 'に　', { kanji: '言', reading: 'い' }, 'われた（　　）に、もう', { kanji: '一度', reading: 'いちど' }, '　', { kanji: '書', reading: 'か' }, 'き', { kanji: '直', reading: 'なお' }, 'した。'],
      options: ['とおり', 'まま', 'うち', 'ところ'], answer: 0,
      note: '～とおりに = exactly as / in accordance with. ～まま would mean leaving something unchanged, ～うちに is "while", ～ところ marks a point in time. All four follow a plain past verb, so only the meaning separates them.',
    },
    {
      type: 'GRAMMAR', badge: '文法', itemType: 'Sentence assembly', jpItemType: '文の文法2（文の組み立て）',
      prompt: '★ に 入る ものは どれですか。',
      tokens: [{ kanji: '日本', reading: 'にほん' }, 'に　＿＿＿　＿★＿　＿＿＿　＿＿＿　なりました。'],
      options: ['日本語が', '来てから', '話せる', 'ように'], answer: 0,
      note: 'Correct order: 日本に　来てから　日本語が　話せる　ように　なりました。The ★ is the second blank, so the answer is 日本語が. Anchor the end first — ように なりました is a fixed pair — then work backwards.',
    },
    {
      type: 'READING', badge: '読解', itemType: 'Short passage', jpItemType: '内容理解（短文）',
      prompt: 'この メールで いちばん 伝えたい ことは 何ですか。',
      passage: [
        [{ kanji: '件名', reading: 'けんめい' }, '：', { kanji: '会議室', reading: 'かいぎしつ' }, 'の　', { kanji: '変更', reading: 'へんこう' }, 'に　ついて'],
        [''],
        [{ kanji: '営業部', reading: 'えいぎょうぶ' }, 'の　みなさん'],
        [''],
        [{ kanji: '明日', reading: 'あす' }, 'の　', { kanji: '打', reading: 'う' }, 'ち', { kanji: '合', reading: 'あ' }, 'わせですが、３', { kanji: '階', reading: 'かい' }, 'の　', { kanji: '会議室', reading: 'かいぎしつ' }, 'が　', { kanji: '使', reading: 'つか' }, 'えなく　なりました。'],
        [{ kanji: '急', reading: 'きゅう' }, 'で　', { kanji: '申', reading: 'もう' }, 'し', { kanji: '訳', reading: 'わけ' }, 'ありませんが、５', { kanji: '階', reading: 'かい' }, 'の　', { kanji: '小会議室', reading: 'しょうかいぎしつ' }, 'に　', { kanji: '変更', reading: 'へんこう' }, 'します。'],
        [{ kanji: '時間', reading: 'じかん' }, 'は　これまでどおり　１０', { kanji: '時', reading: 'じ' }, 'からです。', { kanji: '資料', reading: 'しりょう' }, 'は　', { kanji: '各自', reading: 'かくじ' }, 'お', { kanji: '持', reading: 'も' }, 'ちください。'],
      ],
      options: ['会議の　場所が　変わった　こと', '会議の　時間が　変わった　こと', '会議が　中止に　なった　こと', '資料を　配る　こと'], answer: 0,
      note: 'The subject line and the body agree: only the room changed. 「時間はこれまでどおり」 explicitly rules out (2), and 「各自お持ちください」 means bring your own, not that someone will hand them out. When a passage has a 件名, read it first — it usually states the main point.',
    },
    {
      type: 'LISTENING', badge: '聴解', itemType: 'Point comprehension', jpItemType: 'ポイント理解',
      prompt: '女の人は どうして 会議に 遅れましたか。',
      audio: 'n3-point',
      narration: [
        { speaker: 'narrator', text: '会社で　男の人と　女の人が　話しています。女の人は　どうして　会議に　遅れましたか。', pauseAfter: 800 },
        { speaker: 'a', text: '遅かったですね。電車が　止まったんですか。', pauseAfter: 350 },
        { speaker: 'b', text: 'いいえ、電車は　動いて　いました。実は、資料の　印刷に　時間が　かかって…。', pauseAfter: 350 },
        { speaker: 'a', text: 'ああ、コピー機、また　調子が　悪かったんですか。', pauseAfter: 350 },
        { speaker: 'b', text: 'ええ。途中で　紙が　なくなって　しまって。', pauseAfter: 700 },
        { speaker: 'narrator', text: '女の人は　どうして　会議に　遅れましたか。' },
      ],
      options: ['資料の　印刷に　時間が　かかったから', '電車が　止まったから', '道が　こんで　いたから', '会議の　時間を　まちがえたから'], answer: 0,
      note: 'The train is raised and then explicitly denied — 「いいえ、電車は動いていました」. ポイント理解 nearly always plants a plausible reason early and knocks it down; train yourself to wait for the いいえ or でも before deciding.',
      image: '/irasutoya-meeting.png', imageAlt: 'Businesspeople having a meeting',
    },
    {
      type: 'LISTENING', badge: '聴解', itemType: 'Quick response', jpItemType: '即時応答',
      prompt: '聞いて、最も よい 返事を えらんで ください。',
      audio: 'n3-response',
      narration: [{ speaker: 'a', text: '明日の　会議、三時からに　変わったそうですよ。' }],
      options: ['えっ、教えて　くれて　助かります。', '三時まで　会議でした。', '会議は　変えませんでした。', '昨日なら　大丈夫です。'], answer: 0,
      note: '～そうですよ passes on information the listener probably has not heard yet, so the natural reply reacts to the news. The other three all answer questions that were never asked — a reply can be perfectly grammatical and still be wrong here.',
      image: '/irasutoya-meeting.png', imageAlt: 'Businesspeople having a meeting',
    },
  ],

  N2: [
    {
      type: 'KANJI', badge: '漢字', itemType: 'Kanji reading', jpItemType: '漢字読み',
      prompt: '＿＿の ことばの 読み方を えらんで ください。',
      tokens: [{ kanji: '経済', reading: 'けいざい', target: true }, 'の　ニュースを　読む。'],
      options: ['けいざい', 'きょうさい', 'けいさい', 'きょうざい'], answer: 0,
      note: '経済（けいざい）= economy. The distractors flip two things at once: けい／きょう for 経 and ざい／さい for 済. Real N2 kanji items test voicing (さい vs ざい) as much as the reading itself.',
    },
    {
      type: 'VOCABULARY', badge: '語彙', itemType: 'Contextual vocabulary', jpItemType: '文脈規定',
      prompt: '（　）に 入れるのに 最も よい ものを えらんで ください。',
      tokens: [{ kanji: '長時間', reading: 'ちょうじかん' }, 'の　', { kanji: '議論', reading: 'ぎろん' }, 'の　', { kanji: '末', reading: 'すえ' }, '、ようやく　', { kanji: '結論', reading: 'けつろん' }, 'に　（　　）。'],
      options: ['達した', '届いた', '至らせた', '及ぼした'], answer: 0,
      note: '結論に達する is the standard collocation for reaching a conclusion. 届く is for physical things or messages arriving; 至らせる is transitive and needs an object; 影響を及ぼす takes 影響, not 結論.',
    },
    {
      type: 'VOCABULARY', badge: '語彙', itemType: 'Paraphrase', jpItemType: '言い換え類義',
      prompt: '＿＿の ことばに 意味が 最も 近い ものを えらんで ください。',
      tokens: ['この　', { kanji: '計画', reading: 'けいかく' }, 'は　', { kanji: '大幅', reading: 'おおはば', target: true }, 'に　', { kanji: '変更', reading: 'へんこう' }, 'された。'],
      options: ['大きく', 'わずかに', '突然', 'ひそかに'], answer: 0,
      note: '大幅に = by a large margin, significantly (≒ 大きく). わずかに is slightly — the opposite; 突然 is suddenly, which is about timing not size; ひそかに is secretly. 大幅 describes the extent of a change, never its speed or its secrecy.',
    },
    {
      type: 'GRAMMAR', badge: '文法', itemType: 'Grammar form', jpItemType: '文の文法1（文法形式の判断）',
      prompt: '（　）に 入れるのに 最も よい ものを えらんで ください。',
      tokens: [{ kanji: '雨', reading: 'あめ' }, 'が　', { kanji: '降', reading: 'ふ' }, 'って　いる（　　）、', { kanji: '試合', reading: 'しあい' }, 'は　', { kanji: '予定通', reading: 'よていどお' }, 'り　', { kanji: '行', reading: 'おこな' }, 'われた。'],
      options: ['にもかかわらず', 'にしたがって', 'にかけて', 'に限って'], answer: 0,
      note: '～にもかかわらず = despite, and marks a result that runs against expectation. Rain would normally cancel a match, and the match went ahead — that contradiction is the signal. にしたがって expects the two clauses to move together, which is the reverse relationship.',
    },
    {
      type: 'GRAMMAR', badge: '文法', itemType: 'Sentence assembly', jpItemType: '文の文法2（文の組み立て）',
      prompt: '★ に 入る ものは どれですか。',
      tokens: [{ kanji: '一度', reading: 'いちど' }, '　', { kanji: '引', reading: 'ひ' }, 'き', { kanji: '受', reading: 'う' }, 'けた　＿＿＿　＿★＿　＿＿＿　＿＿＿　ない。'],
      options: ['は', '以上', 'やり遂げる', 'ほか'], answer: 0,
      note: 'Correct order: 一度　引き受けた　以上　は　やり遂げる　ほか　ない。The ★ is the second blank, so the answer is は. Two set phrases do all the work: ～以上（は）("now that…") and ～ほかない ("there is no choice but to").',
    },
    {
      type: 'READING', badge: '読解', itemType: 'Short passage', jpItemType: '内容理解（短文）',
      prompt: '筆者の 考えに 合う ものは どれですか。',
      passage: [
        ['「便利に　なれば、その分　時間が　生まれる」と　長く　言われてきた。'],
        ['しかし　実際には、通信技術が　発達した　結果、私たちは　いつでも　連絡が　取れる　状態に　置かれ、'],
        ['仕事と　私生活の　境界は　かえって　あいまいに　なった。'],
        ['効率化が　生んだ　時間は、そのまま　新たな　仕事に　吸収されて　しまうのである。'],
      ],
      options: [
        '技術の　進歩は　必ずしも　自由な　時間を　増やさない',
        '通信技術の　発達で　仕事の　効率が　下がった',
        '仕事と　私生活は　完全に　分ける　べきだ',
        '便利な　道具ほど　使うのが　難しい',
      ], answer: 0,
      note: 'The last sentence carries the argument: the time efficiency creates is absorbed by more work. (2) misreads かえって — efficiency did rise, the free time did not. (3) is a recommendation the writer never makes. In 内容理解, an option can be reasonable in the real world and still not be in the text.',
    },
    {
      type: 'LISTENING', badge: '聴解', itemType: 'Point comprehension', jpItemType: 'ポイント理解',
      prompt: '駅員は どうして 地下鉄を 勧めていますか。',
      audio: 'n2-point',
      narration: [
        { speaker: 'narrator', text: '駅で　駅員が　利用客に　案内しています。駅員は　どうして　地下鉄を　勧めて　いますか。', pauseAfter: 800 },
        { speaker: 'a', text: 'お客様、ただいま　事故の　影響で、この先の　電車は　到着まで　三十分以上　かかる　見込みです。', pauseAfter: 400 },
        { speaker: 'a', text: 'お急ぎでしたら、東口から　地下鉄を　ご利用ください。振替乗車券は　こちらで　お渡しします。', pauseAfter: 700 },
        { speaker: 'narrator', text: '駅員は　どうして　地下鉄を　勧めて　いますか。' },
      ],
      options: [
        '電車の　遅れが　三十分以上に　なりそうだから',
        '終電が　もう　出て　しまったから',
        '今日は　地下鉄の　ほうが　安いから',
        '東口が　閉まって　いるから',
      ], answer: 0,
      note: 'The reason is 「三十分以上かかる見込み」. 東口 and 振替乗車券 are mentioned, but as the how, not the why — announcements are dense with detail precisely so that you have to hold on to the question while you listen.',
      image: '/irasutoya-station-staff.png', imageAlt: 'A station employee bowing apologetically',
    },
    {
      type: 'LISTENING', badge: '聴解', itemType: 'Quick response', jpItemType: '即時応答',
      prompt: '聞いて、最も よい 返事を えらんで ください。',
      audio: 'n2-response',
      narration: [{ speaker: 'a', text: 'ここだけの　話、来月　部署が　変わるらしいんです。' }],
      options: ['えっ、誰にも　言いませんよ。', 'はい、部署は　こちらです。', '来月なら　空いて　います。', 'もう　変わりましたか。'], answer: 0,
      note: 'ここだけの話 = "just between us", so the reply has to acknowledge the confidence. At N2 the 即時応答 hinges on set phrases like this rather than on grammar — a literal reading of the words misses the social move entirely.',
      image: '/irasutoya-meeting.png', imageAlt: 'Colleagues talking in an office',
    },
  ],

  N1: [
    {
      type: 'KANJI', badge: '漢字', itemType: 'Kanji reading', jpItemType: '漢字読み',
      prompt: '＿＿の ことばの 読み方を えらんで ください。',
      tokens: ['これまでの　', { kanji: '不安', reading: 'ふあん' }, 'を　', { kanji: '払拭', reading: 'ふっしょく', target: true }, 'する。'],
      options: ['ふっしょく', 'ふっそく', 'はっしょく', 'はっそく'], answer: 0,
      note: '払拭（ふっしょく）= to dispel or wipe away, used for doubts, anxiety and bad impressions. 払 is normally はらう, but in this compound it is ふつ → ふっ; N1 kanji items lean heavily on 音読み that never appear in the everyday word.',
    },
    {
      type: 'VOCABULARY', badge: '語彙', itemType: 'Contextual vocabulary', jpItemType: '文脈規定',
      prompt: '（　）に 入れるのに 最も よい ものを えらんで ください。',
      tokens: ['データには　', { kanji: '顕著', reading: 'けんちょ' }, 'な　', { kanji: '差', reading: 'さ' }, 'が　（　　）。'],
      options: ['見られる', '見せられる', '見届ける', '見合わせる'], answer: 0,
      note: '顕著な差が見られる is the conventional written-Japanese collocation: "a marked difference can be observed." 見せられる is passive-causative; 見届ける is to see something through to the end; 見合わせる is to postpone. Formal Japanese runs on collocations, and N1 tests whether you have read enough to hear which one is idiomatic.',
    },
    {
      type: 'VOCABULARY', badge: '語彙', itemType: 'Paraphrase', jpItemType: '言い換え類義',
      prompt: '＿＿の ことばに 意味が 最も 近い ものを えらんで ください。',
      tokens: ['その　', { kanji: '提案', reading: 'ていあん' }, 'は　', { kanji: 'あっけなく', reading: '', target: true }, { kanji: '退', reading: 'しりぞ' }, 'けられた。'],
      options: ['簡単に', '慎重に', '全員一致で', 'しぶしぶ'], answer: 0,
      note: 'あっけなく = over far more easily than expected, with a note of anticlimax (≒ 簡単に、拍子抜けするほど). 慎重に is carefully; しぶしぶ is reluctantly — both describe the opposite kind of process. The feeling of "that was it?" is the part that carries the meaning.',
    },
    {
      type: 'GRAMMAR', badge: '文法', itemType: 'Grammar form', jpItemType: '文の文法1（文法形式の判断）',
      prompt: '（　）に 入れるのに 最も よい ものを えらんで ください。',
      tokens: [{ kanji: '東京公演', reading: 'とうきょうこうえん' }, '（　　）、', { kanji: '全国', reading: 'ぜんこく' }, '十', { kanji: '都市', reading: 'とし' }, 'を　', { kanji: '回', reading: 'まわ' }, 'る　ツアーが　', { kanji: '始', reading: 'はじ' }, 'まる。'],
      options: ['を皮切りに', 'をものともせず', 'に即して', 'にひきかえ'], answer: 0,
      note: '～を皮切りに = "starting with", and what follows must be a series that spreads out from that first event — here, a ten-city tour. をものともせず means "undaunted by"; に即して is "in accordance with"; にひきかえ draws a contrast. Only 皮切り fits a sequence.',
    },
    {
      type: 'GRAMMAR', badge: '文法', itemType: 'Sentence assembly', jpItemType: '文の文法2（文の組み立て）',
      prompt: '★ に 入る ものは どれですか。',
      tokens: ['この　', { kanji: '問題', reading: 'もんだい' }, 'は　＿＿＿　＿★＿　＿＿＿　＿＿＿　ものではない。'],
      options: ['さえ', '謝り', 'すれば', '済む'], answer: 0,
      note: 'Correct order: この　問題は　謝り　さえ　すれば　済む　ものではない。The ★ is the second blank, so the answer is さえ. ～さえ～ば splits around the verb stem, and 済むものではない closes it: "this is not something a mere apology settles."',
    },
    {
      type: 'READING', badge: '読解', itemType: 'Short passage', jpItemType: '内容理解（短文）',
      prompt: '筆者は なぜ 素人の 問いが 突破口に なると 述べていますか。',
      passage: [
        ['専門家の　助言が　常に　最善で　あるとは　限らない。'],
        ['専門家は　自らの　領域の　内側で　思考する　ことに　慣れており、'],
        ['その　枠組みの　外に　答えが　ある　場合、それを　見落とす　傾向が　ある。'],
        ['素人の　素朴な　問いが　突破口に　なるのは、まさに　この　ためである。'],
      ],
      options: [
        '専門家が　見落としがちな　枠組みの　外側に　触れるから',
        '素人の　ほうが　専門家より　知識が　豊富だから',
        '専門家は　助言を　するのを　ためらうから',
        '素朴な　問いは　答えるのが　簡単だから',
      ], answer: 0,
      note: 'この ため in the last line points back at the preceding sentence — experts miss what lies outside their frame. The writer never claims amateurs know more (2); the argument is about where attention falls, not how much anyone knows. Tracing what こそあど words refer back to is most of N1 reading.',
    },
    {
      type: 'LISTENING', badge: '聴解', itemType: 'Summary comprehension', jpItemType: '概要理解',
      prompt: '気象予報士は 何を 勧めていますか。',
      revealAfterAudio: true,
      audio: 'n1-summary',
      narration: [
        { speaker: 'narrator', text: '気象予報士が　地域イベントに　ついて　話しています。', pauseAfter: 800 },
        { speaker: 'a', text: '午前中は　強い　雨が　残りますが、昼過ぎには　弱まるでしょう。', pauseAfter: 300 },
        { speaker: 'a', text: 'ただし、風は　夕方まで　強く、屋外に　大型テントを　設置するのは　危険です。', pauseAfter: 300 },
        { speaker: 'a', text: '開始時刻を　遅らせるだけでは　十分とは　言えません。', pauseAfter: 300 },
        { speaker: 'a', text: '来場者の　安全を　考えると、今回は　屋内会場に　切り替えるのが　現実的です。', pauseAfter: 700 },
        { speaker: 'narrator', text: '気象予報士は　何を　勧めて　いますか。' },
      ],
      options: [
        '会場を　屋内に　変更する　こと',
        'イベントを　中止する　こと',
        '開始時刻を　遅らせて　屋外で　行う　こと',
        'より　大きな　テントを　用意する　こと',
      ], answer: 0,
      note: 'The rain weakens, so rain is not the deciding factor — the wind is. 「開始時刻を遅らせるだけでは十分とは言えません」 rules out (3) explicitly, and cancelling is never proposed. 概要理解 gives you no question in advance, so listen for the conclusion marker: here, 現実的です.',
      image: '/irasutoya-weather.png', imageAlt: 'A weather forecaster pointing to a forecast map',
    },
    {
      type: 'LISTENING', badge: '聴解', itemType: 'Quick response', jpItemType: '即時応答',
      prompt: '聞いて、最も よい 返事を えらんで ください。',
      audio: 'n1-response',
      narration: [{ speaker: 'a', text: '課長の　あの　言い方は　ないんじゃないですか。'}],
      options: ['確かに、少し　きつかったですね。', 'はい、課長が　言いました。', '言い方が　わかりません。', 'まだ　言って　いません。'], answer: 0,
      note: '「～はないんじゃないですか」 is criticism phrased as a question, inviting the listener to agree. The reply 確かに aligns with it. Taking the sentence literally as a question about who said what leads straight to (2) — at N1 the 即時応答 items turn almost entirely on tone and implication.',
      image: '/irasutoya-meeting.png', imageAlt: 'Colleagues talking in an office',
    },
  ],
};

/** The hand-authored seed items, captured before any generator runs. */
const handAuthored: Record<Level, Question[]> = Object.fromEntries(
  levels.map((level) => [level, [...questionBank[level]]]),
) as Record<Level, Question[]>;

for (const level of levels) questionBank[level] = expandQuestionBank(level, questionBank[level]);

// The generated 漢字読み / 表記 items were built from a handful of template
// sentences with unrelated-word distractors. Replace them wholesale with the
// data-driven pool, which uses real Tatoeba carriers and phonetic distractors.
for (const level of levels) {
  const generated = kanjiQuestions(level);
  if (!generated.length) continue;
  const keptHandAuthored = questionBank[level].filter(
    (question) => question.jpItemType !== '漢字読み' && question.jpItemType !== '表記',
  );
  const seeds = handAuthored[level].filter(
    (question) => question.jpItemType === '漢字読み' || question.jpItemType === '表記',
  );
  questionBank[level] = [...keptHandAuthored, ...seeds, ...generated];
}

// Same story for 聴解: 416 generated items were rotations of ~60 template scripts,
// and in listening the script *is* the question. Swap them for authored ones.
for (const level of levels) {
  const authored = listeningQuestions(level);
  if (!authored.length) continue;
  const seeds = handAuthored[level].filter((question) => question.type === 'LISTENING');
  questionBank[level] = [
    ...questionBank[level].filter((question) => question.type !== 'LISTENING'),
    ...seeds,
    ...authored,
  ];
}
