import type { Level, Question, QuestionType } from './course-data';

type Spec = { itemType: string; jp: string; type: QuestionType };
type Word = { word: string; reading: string; meaning: string; paraphrase: string; sentence: string };
type Grammar = { form: string; sentence: string; answer: string; distractors: [string, string, string]; note: string };

const n3Specs: Spec[] = [
  ['Kanji reading', '漢字読み', 'KANJI'], ['Orthography', '表記', 'KANJI'],
  ['Contextual vocabulary', '文脈規定', 'VOCABULARY'], ['Paraphrase', '言い換え類義', 'VOCABULARY'], ['Usage', '用法', 'VOCABULARY'],
  ['Grammar form', '文の文法1（文法形式の判断）', 'GRAMMAR'], ['Sentence assembly', '文の文法2（文の組み立て）', 'GRAMMAR'], ['Text grammar', '文章の文法', 'GRAMMAR'],
  ['Short passage', '内容理解（短文）', 'READING'], ['Mid-size passage', '内容理解（中文）', 'READING'], ['Long passage', '内容理解（長文）', 'READING'], ['Information retrieval', '情報検索', 'READING'],
  ['Task comprehension', '課題理解', 'LISTENING'], ['Point comprehension', 'ポイント理解', 'LISTENING'], ['Summary comprehension', '概要理解', 'LISTENING'], ['Verbal expressions', '発話表現', 'LISTENING'], ['Quick response', '即時応答', 'LISTENING'],
].map(([itemType, jp, type]) => ({ itemType, jp, type: type as QuestionType }));

const n2Specs: Spec[] = [
  ['Kanji reading', '漢字読み', 'KANJI'], ['Orthography', '表記', 'KANJI'], ['Word formation', '語形成', 'VOCABULARY'],
  ['Contextual vocabulary', '文脈規定', 'VOCABULARY'], ['Paraphrase', '言い換え類義', 'VOCABULARY'], ['Usage', '用法', 'VOCABULARY'],
  ['Grammar form', '文の文法1（文法形式の判断）', 'GRAMMAR'], ['Sentence assembly', '文の文法2（文の組み立て）', 'GRAMMAR'], ['Text grammar', '文章の文法', 'GRAMMAR'],
  ['Short passage', '内容理解（短文）', 'READING'], ['Mid-size passage', '内容理解（中文）', 'READING'], ['Integrated reading', '統合理解', 'READING'], ['Thematic reading', '主張理解（長文）', 'READING'], ['Information retrieval', '情報検索', 'READING'],
  ['Task comprehension', '課題理解', 'LISTENING'], ['Point comprehension', 'ポイント理解', 'LISTENING'], ['Summary comprehension', '概要理解', 'LISTENING'], ['Quick response', '即時応答', 'LISTENING'], ['Integrated listening', '統合理解', 'LISTENING'],
].map(([itemType, jp, type]) => ({ itemType, jp, type: type as QuestionType }));

const n3Words: Word[] = [
  ['確認', 'かくにん', 'confirmation', '間違いがないか確かめること', '出発する前に、集合時間を確認した。'],
  ['変更', 'へんこう', 'change', '決めた内容を別のものにすること', '会議の場所が急に変更になった。'],
  ['影響', 'えいきょう', 'influence', 'ほかの物事に変化を与えること', '大雨が電車の運行に影響した。'],
  ['解決', 'かいけつ', 'resolution', '問題をうまく片づけること', 'みんなで話し合って問題を解決した。'],
  ['工夫', 'くふう', 'ingenuity', 'よりよくするため方法を考えること', '狭い部屋を広く使えるよう工夫した。'],
  ['協力', 'きょうりょく', 'cooperation', '力を合わせて取り組むこと', '地域の人々が祭りの準備に協力した。'],
  ['印象', 'いんしょう', 'impression', '見聞きしたことから受ける感じ', '丁寧な説明が強い印象に残った。'],
  ['管理', 'かんり', 'management', 'よい状態を保つよう扱うこと', '図書館では本の状態を厳しく管理している。'],
  ['状況', 'じょうきょう', 'situation', 'その時の周りの様子', '現場の状況を電話で知らせてください。'],
  ['期待', 'きたい', 'expectation', 'よい結果になるだろうと思うこと', '新しい選手の活躍に期待している。'],
  ['提案', 'ていあん', 'proposal', '考えや方法を示すこと', '社員が新しい販売方法を提案した。'],
  ['判断', 'はんだん', 'judgment', '事情を考えて決めること', '資料を読んで参加するか判断する。'],
  ['改善', 'かいぜん', 'improvement', '悪いところを直してよくすること', '利用者の意見をもとにサービスを改善した。'],
  ['報告', 'ほうこく', 'report', '結果や状況を知らせること', '調査の結果を責任者に報告した。'],
  ['発見', 'はっけん', 'discovery', '今まで知らなかったものを見つけること', '研究中に意外な事実を発見した。'],
  ['継続', 'けいぞく', 'continuation', '途中でやめず続けること', '毎日の練習を継続することが大切だ。'],
].map(([word, reading, meaning, paraphrase, sentence]) => ({ word, reading, meaning, paraphrase, sentence }));

const n2Words: Word[] = [
  ['促進', 'そくしん', 'promotion or acceleration', '物事が早く進むように働きかけること', '自治体は公共交通の利用を促進している。'],
  ['維持', 'いじ', 'maintenance', '同じ状態を保ち続けること', '品質を維持するには定期的な点検が必要だ。'],
  ['普及', 'ふきゅう', 'spread or diffusion', '広く一般に行き渡ること', '電子決済は幅広い世代に普及した。'],
  ['把握', 'はあく', 'grasp or understanding', '全体の内容や状況を正確につかむこと', '担当者は被害の規模を把握している。'],
  ['配慮', 'はいりょ', 'consideration', '相手や状況を思いやって気を配ること', '案内表示には高齢者への配慮が求められる。'],
  ['削減', 'さくげん', 'reduction', '数量や費用を減らすこと', '会社は電力使用量の削減に取り組んだ。'],
  ['確保', 'かくほ', 'securing', '必要なものを確実に用意すること', '災害時の避難経路を確保しておく。'],
  ['検討', 'けんとう', 'consideration or examination', 'よく調べて考えること', '委員会は制度の見直しを検討している。'],
  ['指摘', 'してき', 'pointing out', '問題となる点を具体的に示すこと', '専門家は計画の弱点を指摘した。'],
  ['導入', 'どうにゅう', 'introduction', '新しい仕組みや設備を取り入れること', '工場は省エネ設備を導入した。'],
  ['対応', 'たいおう', 'response', '状況に応じて適切に処理すること', '窓口では多言語で問い合わせに対応する。'],
  ['傾向', 'けいこう', 'tendency', 'ある方向へ変化しやすい様子', '若い世代ほど動画で情報を得る傾向がある。'],
  ['負担', 'ふたん', 'burden', '責任や費用などを引き受けること', '作業を分担して一人の負担を減らした。'],
  ['評価', 'ひょうか', 'evaluation', '価値や成果を判断すること', '新製品は使いやすさの点で高く評価された。'],
  ['実施', 'じっし', 'implementation', '計画したことを実際に行うこと', '市は来月、住民向けの調査を実施する。'],
  ['見込む', 'みこむ', 'anticipate', '将来そうなると予想すること', '今年は海外からの利用者が増えると見込んでいる。'],
].map(([word, reading, meaning, paraphrase, sentence]) => ({ word, reading, meaning, paraphrase, sentence }));

const n3Grammar: Grammar[] = [
  ['～とおりに', '説明書に書いてある（　）操作してください。', 'とおりに', ['ばかりに', 'ほどに', 'ために'], '～とおりに means in the same way as something states.'],
  ['～ことになっている', 'この建物では夜十時に入口を閉める（　）。', 'ことになっている', ['ことにしている', 'ようになった', 'ところだった'], '～ことになっている describes a rule or established arrangement.'],
  ['～わけではない', '便利だからといって、問題がない（　）。', 'わけではない', ['ほどではない', 'ことではない', 'ものがない'], '～わけではない makes a partial denial.'],
  ['～うちに', '温かい（　）召し上がってください。', 'うちに', ['ところに', 'ために', 'ばかりに'], '～うちに means while a state still holds.'],
  ['～おかげで', '友人が手伝ってくれた（　）、早く終わった。', 'おかげで', ['せいで', 'かわりに', 'ほどで'], '～おかげで gives a favorable cause.'],
  ['～に対して', '兄が活発なの（　）、弟は静かだ。', 'に対して', ['について', 'によって', 'にとって'], '～に対して contrasts two facts here.'],
  ['～たびに', 'この曲を聞く（　）、故郷を思い出す。', 'たびに', ['うえに', 'ところに', 'ために'], '～たびに means every time.'],
  ['～しかない', '終電がないので、歩いて帰る（　）。', 'しかない', ['ほどない', 'わけない', 'ことない'], '～しかない means there is no choice but to do it.'],
  ['～ようにする', '健康のため、毎日歩く（　）いる。', 'ようにして', ['ことになって', 'ところにして', 'ためになって'], '～ようにする describes a deliberate habit.'],
  ['～最中に', '会議の（　）、電話が鳴った。', '最中に', ['うちまで', 'とおりで', 'ためから'], '～最中に means in the middle of an activity.'],
  ['～に違いない', '電気がついているから、誰かいる（　）。', 'に違いない', ['にすぎない', 'とは限らない', 'しかない'], '～に違いない expresses strong inference.'],
  ['～ばかりでなく', 'この店は安い（　）、品質もいい。', 'ばかりでなく', ['こともなく', 'ほどでなく', 'しかなく'], '～ばかりでなく adds another feature.'],
  ['～ことから', '駅に近い（　）、この町は人気がある。', 'ことから', ['ことまで', 'ことには', 'ことより'], '～ことから states the basis for a conclusion.'],
  ['～ようとする', '家を出（　）としたとき、雨が降り始めた。', 'よう', ['そう', 'たい', 'らしい'], 'Volitional + とする means be about to attempt an action.'],
  ['～てもらう', '先生に作文を直し（　）。', 'てもらった', ['てあげた', 'ておいた', 'てしまった'], '～てもらう presents a favor received.'],
  ['～ものの', '申し込んだ（　）、参加できるかまだ分からない。', 'ものの', ['ために', 'ところで', 'ばかりで'], '～ものの introduces an unexpected contrast.'],
  ['～はずだ', '彼は昨日出発したから、もう着いている（　）だ。', 'はず', ['つもり', 'まま', 'ばかり'], '～はずだ states a confident expectation based on evidence.'],
  ['～わけだ', '十年住んでいたのか。日本語が上手な（　）だ。', 'わけ', ['はず', 'つもり', 'ばかり'], '～わけだ presents a conclusion that now makes sense.'],
  ['～ことにする', '毎朝三十分歩く（　）にしました。', 'こと', ['よう', 'もの', 'ところ'], '～ことにする marks a decision you made yourself.'],
  ['～ことになる', '来月から大阪に転勤する（　）になりました。', 'こと', ['もの', 'よう', 'ところ'], '～ことになる marks a decision made by circumstances or others.'],
  ['～ようにする', '野菜を多く食べる（　）にしています。', 'よう', ['こと', 'もの', 'ほう'], '～ようにする is an ongoing effort, not a one-time decision.'],
  ['～ようになる', '自転車に乗れる（　）になった。', 'よう', ['こと', 'もの', 'ところ'], '～ようになる marks a change in ability or habit.'],
  ['～ばかりだ', '病状は悪くなる（　）だ。', 'ばかり', ['ところ', 'まま', 'ほど'], '～ばかりだ says a trend keeps going one way.'],
  ['～たびに', 'この曲を聞く（　）、学生時代を思い出す。', 'たびに', ['うちに', 'あいだに', 'ながらに'], '～たびに means every time something happens.'],
  ['～うちに', '熱い（　）に召し上がってください。', 'うち', ['あいだ', 'まで', 'ころ'], '～うちに means while a state still lasts.'],
  ['～において', '会議は本社（　）行われる。', 'において', ['にとって', 'によって', 'に対して'], '～において marks a formal setting or location.'],
  ['～によって', 'この橋は百年前（　）建てられた。', 'によって', ['において', 'にとって', 'に対して'], '～によって marks the agent in a passive sentence.'],
  ['～にとって', '私（　）、家族が一番大切だ。', 'にとって', ['によって', 'において', 'に対して'], '～にとって gives the viewpoint something is judged from.'],
  ['～に対して', '先生の質問（　）はっきり答えた。', 'に対して', ['にとって', 'において', 'によって'], '～に対して marks the target an action is directed at.'],
  ['～について', '環境問題（　）話し合った。', 'について', ['にとって', 'によって', 'において'], '～について marks the topic of discussion.'],
  ['～ために', '留学する（　）、お金をためている。', 'ために', ['ように', 'ことに', 'ものに'], '～ために introduces a purpose you control.'],
  ['～ように', '忘れない（　）、メモしておく。', 'ように', ['ために', 'ことに', 'ものに'], '～ように is used for a purpose you cannot directly control.'],
  ['～そうだ（伝聞）', '天気予報によると、明日は雪が降る（　）だ。', 'そう', ['よう', 'はず', 'つもり'], 'Plain form + そうだ reports information heard from elsewhere.'],
  ['～らしい', '駅前に新しい店ができた（　）。', 'らしい', ['そうに', 'ようで', 'みたく'], '～らしい reports what you have gathered from around you.'],
  ['～みたいだ', '外は雨が降っている（　）だ。', 'みたい', ['そう', 'らしく', 'ほど'], '～みたいだ is the casual equivalent of ～ようだ.'],
  ['～かもしれない', '道が混んでいるから、遅れる（　）。', 'かもしれない', ['にちがいない', 'はずだ', 'わけだ'], '～かもしれない expresses a possibility.'],
  ['～にちがいない', 'あの様子では、彼は知っていた（　）。', 'にちがいない', ['かもしれない', 'おそれがある', 'わけがない'], '～にちがいない expresses near-certainty.'],
  ['～わけがない', 'そんな高い物が買える（　）。', 'わけがない', ['にちがいない', 'ことがない', 'ものがない'], '～わけがない denies a possibility outright.'],
  ['～わけではない', '嫌いという（　）が、あまり食べない。', 'わけではない', ['わけがない', 'はずがない', 'ものではない'], '～わけではない softens a denial: it is not that ~.'],
  ['～てしまう', '大事な書類をなくし（　）。', 'てしまった', ['ておいた', 'てあった', 'ていった'], '～てしまう marks completion, often with regret.'],
  ['～ておく', '会議の前に資料を読ん（　）。', 'でおく', ['である', 'でいる', 'でしまう'], '～ておく is preparing in advance.'],
  ['～てある', '壁に地図が貼っ（　）。', 'てある', ['ている', 'ておく', 'てしまう'], 'Transitive + てある marks a deliberately prepared state.'],
  ['～まま', '靴をはいた（　）、部屋に入らないでください。', 'まま', ['ばかり', 'うち', 'ほど'], '～まま means leaving a state unchanged.'],
  ['～きり', '彼とは去年会った（　）だ。', 'きり', ['ばかり', 'まま', 'ほど'], '～きり means that was the last time.'],
  ['～ながらも', '狭い（　）、居心地のよい部屋だ。', 'ながらも', ['ながらに', 'つつも', 'ばかりか'], '～ながらも concedes a point, like "although".'],
  ['～つつ', '悪いと知り（　）、やめられない。', 'つつ', ['ながらに', 'ばかりに', 'ものの'], '～つつ links a contrast in written style.'],
  ['～ものの', '約束はした（　）、実行は難しい。', 'ものの', ['ものを', 'ものか', 'もので'], '～ものの concedes the first clause before contradicting it.'],
  ['～に比べて', '去年（　）、今年は雨が多い。', 'に比べて', ['によって', 'について', 'に応じて'], '～に比べて sets up a comparison.'],
  ['～に従って', '説明書（　）組み立ててください。', 'に従って', ['に比べて', 'に対して', 'について'], '～に従って means in accordance with.'],
  ['～によると', '新聞（　）、事故の原因は不明だそうだ。', 'によると', ['によって', 'について', 'にとって'], '～によると marks an information source and pairs with そうだ.'],
  ['～おかげで', '先生の（　）、合格できました。', 'おかげで', ['せいで', 'ために', 'ばかりに'], '～おかげで credits a positive cause.'],
  ['～せいで', '寝坊した（　）、電車に乗り遅れた。', 'せいで', ['おかげで', 'ように', 'ばかりで'], '～せいで blames a negative cause.'],
  ['～くせに', '知っている（　）、教えてくれない。', 'くせに', ['のに', 'ものの', 'ながら'], '～くせに criticises, unlike the neutral ～のに.'],
  ['～さえ', '子ども（　）知っていることだ。', 'さえ', ['こそ', 'しか', 'だけ'], '～さえ means "even".'],
  ['～こそ', '今度（　）成功させたい。', 'こそ', ['さえ', 'しか', 'ばかり'], '～こそ adds emphasis to the preceding word.'],
  ['～ばかりで', '文句を言う（　）、何もしない。', 'ばかりで', ['ところで', 'ままで', 'うちで'], '～ばかりで says only that one thing happens.'],
  ['～しかない', 'こうなったら、やる（　）。', 'しかない', ['ほかならない', 'までもない', 'わけがない'], '～しかない means there is no other option.'],
  ['～ないわけにはいかない', '約束したから、行か（　）。', 'ないわけにはいかない', ['ないではいられない', 'ずにはすまない', 'ないこともない'], 'Obligation arising from circumstances.'],
  ['～ようがない', '連絡先を知らないので、知らせ（　）。', 'ようがない', ['かねない', 'きれない', 'づらい'], '～ようがない means there is no way to do it.'],
  ['～がる', '妹は新しい自転車を欲し（　）いる。', 'がって', ['たがり', 'そうで', 'ようで'], '～がる describes a third person showing a feeling.'],
  ['～たがる', '弟は外で遊び（　）。', 'たがる', ['たい', 'そうだ', 'ようだ'], '～たがる describes what someone else wants to do.'],
].map((entry) => { const [form, sentence, answer, distractors, note] = entry as [string, string, string, [string, string, string], string]; return { form, sentence, answer, distractors, note }; });

const n2Grammar: Grammar[] = [
  ['～にもかかわらず', '悪天候（　）、試合には多くの観客が集まった。', 'にもかかわらず', ['にしたがって', 'にかけて', 'にともなって'], '～にもかかわらず marks a result contrary to expectation.'],
  ['～ざるを得ない', '部品が届かないため、計画を延期せ（　）。', 'ざるを得ない', ['ずにはおかない', 'ないことはない', 'ないものでもない'], '～ざるを得ない means being forced to do something.'],
  ['～にすぎない', 'この数字は一つの目安（　）。', 'にすぎない', ['にほかならない', 'に違いない', 'に限らない'], '～にすぎない means merely or no more than.'],
  ['～を問わず', '経験の有無（　）、応募できます。', 'を問わず', ['に応じて', 'に沿って', 'をめぐって'], '～を問わず means regardless of.'],
  ['～に伴って', '人口の増加（　）、住宅不足が深刻になった。', 'に伴って', ['に反して', 'に先立って', 'に限って'], '～に伴って describes one change accompanying another.'],
  ['～一方だ', '対策を取らなければ、状況は悪化する（　）。', '一方だ', ['ところだ', 'ばかりだ', 'ほどだ'], '～一方だ describes a continuing trend.'],
  ['～かねない', 'その発言は誤解を招き（　）。', 'かねない', ['かねる', 'きれない', 'ようがない'], '～かねない warns that an undesirable result is possible.'],
  ['～ものなら', 'できる（　）、もう一度最初からやり直したい。', 'ものなら', ['ものの', 'ものだから', 'ものを'], 'Potential + ものなら presents a difficult hypothetical wish.'],
  ['～に先立って', '式典（　）、関係者への説明会が開かれた。', 'に先立って', ['にわたって', 'に加えて', 'に代わって'], '～に先立って means before a significant event.'],
  ['～に基づいて', '調査結果（　）、新しい方針を決定した。', 'に基づいて', ['に比べて', 'に向けて', 'にこたえて'], '～に基づいて means based on evidence or a standard.'],
  ['～どころか', '休む（　）、食事をする時間さえなかった。', 'どころか', ['ばかりか', 'ものなら', 'だけあって'], '～どころか rejects one idea and presents a stronger reality.'],
  ['～にこたえて', '利用者の要望（　）、開館時間が延長された。', 'にこたえて', ['に反して', 'にかけて', 'において'], '～にこたえて means in response to expectations or requests.'],
  ['～上で', '資料を十分に確認した（　）、判断してください。', '上で', ['末に', '際に', '最中に'], 'Past + 上で means after doing the necessary preparation.'],
  ['～ことなく', '選手は最後まであきらめる（　）走り続けた。', 'ことなく', ['ものなく', 'わけなく', 'ほどなく'], '～ことなく means without doing something.'],
  ['～を通じて', '研修（　）、異なる部署の仕事を学んだ。', 'を通じて', ['をもとに', 'を除いて', 'をこめて'], '～を通じて means throughout or by means of.'],
  ['～に限り', '本日に（　）、入場料が無料になります。', '限り', ['限って', '限らず', '限ると'], '～に限り restricts a special rule to a stated group or time.'],
  ['～に違いない', 'あの反応からすると、彼は知っていた（　）。', 'に違いない', ['かねない', 'おそれがある', 'わけがない'], '～に違いない expresses near-certainty.'],
  ['～かねない', 'この状態が続けば、事故になり（　）。', 'かねない', ['かねる', 'がたい', 'えない'], '～かねない warns that something bad could happen.'],
  ['～かねる', 'その件については、お答えし（　）。', 'かねます', ['かねません', 'がたいです', 'えません'], '～かねる politely says you cannot do something.'],
  ['～得る', 'それは十分に起こり（　）ことだ。', '得る', ['かねる', 'がたい', 'づらい'], '～得る means something is possible.'],
  ['～がたい', '彼の説明は理解し（　）。', 'がたい', ['かねない', 'づらい', '得る'], '～がたい means hard to do, in formal writing.'],
  ['～ざるを得ない', '証拠がある以上、認め（　）。', 'ざるを得ない', ['ずにはおかない', 'てはならない', 'ないではない'], '～ざるを得ない means having no choice but to.'],
  ['～に過ぎない', 'それは推測（　）。', 'に過ぎない', ['にほかならない', 'に限らない', 'にすぎる'], '～に過ぎない means merely, nothing more.'],
  ['～にほかならない', '成功は努力の結果（　）。', 'にほかならない', ['に過ぎない', 'に限る', 'にあたらない'], '～にほかならない means it is nothing other than.'],
  ['～に限らず', '若者（　）、幅広い世代に人気がある。', 'に限らず', ['に限り', 'に限って', 'を限りに'], '～に限らず means not only that group.'],
  ['～はもちろん', '国内（　）、海外でも高く評価されている。', 'はもちろん', ['はもとで', 'をよそに', 'にしては'], '～はもちろん means "not to mention".'],
  ['～ばかりか', '彼は英語（　）、中国語も話せる。', 'ばかりか', ['どころか', 'ばかりに', 'からには'], '～ばかりか adds a further, stronger fact.'],
  ['～どころか', '疲れる（　）、かえって元気になった。', 'どころか', ['ばかりか', 'ものの', 'とはいえ'], '～どころか denies the expectation and reverses it.'],
  ['～からには', '引き受けた（　）、最後までやります。', 'からには', ['あげく', 'うえは', 'ものの'], '～からには means "now that", with resolve following.'],
  ['～上は', '決定した（　）、全員で取り組むべきだ。', '上は', ['あげく', 'ところで', 'ばかりに'], '～上は resembles ～からには in formal writing.'],
  ['～あげく', '長時間議論した（　）、結論は出なかった。', 'あげく', ['うえは', 'からには', 'とたん'], '～あげく marks a disappointing outcome after long effort.'],
  ['～末に', '検討を重ねた（　）、計画は中止された。', '末に', ['あげくに', 'うえに', 'ところに'], '～末に marks the outcome of a long process.'],
  ['～とたん', 'ドアを開けた（　）、猫が飛び出した。', 'とたん', ['うちに', 'ながら', 'まま'], '～とたん marks something happening the instant after.'],
  ['～次第', '書類が届き（　）、ご連絡します。', '次第', ['たとたん', 'かぎり', 'うちに'], 'Verb stem + 次第 means as soon as.'],
  ['～に際して', '開会（　）、一言ご挨拶申し上げます。', 'に際して', ['に先立って', 'にわたって', 'をめぐって'], '～に際して marks a formal occasion.'],
  ['～に伴って', '人口の増加（　）、住宅が不足している。', 'に伴って', ['に反して', 'にわたって', 'をめぐって'], '～に伴って marks two things changing together.'],
  ['～に応じて', '収入（　）、税額が決まる。', 'に応じて', ['に反して', 'に際して', 'をめぐって'], '～に応じて means in proportion to.'],
  ['～に反して', '予想（　）、売上は伸びた。', 'に反して', ['に応じて', 'に伴って', 'に際して'], '～に反して means contrary to.'],
  ['～をめぐって', '新しい制度（　）、議論が続いている。', 'をめぐって', ['に応じて', 'に伴って', 'に際して'], '～をめぐって marks the issue being disputed.'],
  ['～にわたって', '工事は三年（　）行われた。', 'にわたって', ['をめぐって', 'に応じて', 'にあたって'], '～にわたって marks an extent of time or space.'],
  ['～を通じて', '一年（　）、この地域は温暖だ。', 'を通じて', ['をめぐって', 'に応じて', 'に際して'], '～を通じて means throughout, or by means of.'],
  ['～上で', 'よく調べた（　）、判断したい。', '上で', ['うちに', 'ところで', 'ばかりに'], '～上で means after doing something first.'],
  ['～わりに', 'この店は安い（　）、味がいい。', 'わりに', ['ばかりに', 'ものの', 'どころか'], '～わりに means considering, against expectation.'],
  ['～につれて', '年をとる（　）、体力が落ちる。', 'につれて', ['に反して', 'にしては', 'をめぐって'], '～につれて marks gradual parallel change.'],
  ['～にしては', '初めて（　）、うまくできている。', 'にしては', ['につれて', 'に応じて', 'にわたって'], '～にしては means "for" in the sense of surprisingly.'],
  ['～ないことには', '実際に見（　）、判断できない。', 'ないことには', ['ないうちに', 'ないものの', 'ないばかりに'], '～ないことには means unless you do it first.'],
  ['～ものだから', '道が混んでいた（　）、遅れました。', 'ものだから', ['ものの', 'ものなら', 'ものか'], '～ものだから gives an excuse.'],
  ['～ようがない', '住所がわからないので、送り（　）。', 'ようがない', ['かねない', 'きれない', 'づらい'], '～ようがない means there is no way to do it.'],
  ['～きれない', 'この量は一人では食べ（　）。', 'きれない', ['かねない', 'がたい', '得ない'], '～きれない means unable to finish.'],
  ['～ぬきで', '前置きは（　）、本題に入ろう。', 'ぬきで', ['こめて', 'めぐって', 'そって'], '～ぬきで means leaving something out.'],
  ['～に沿って', '方針（　）、計画を立てる。', 'に沿って', ['に反して', 'をめぐって', 'にしては'], '～に沿って means following a guideline.'],
  ['～のみならず', '本人（　）、家族も影響を受ける。', 'のみならず', ['ばかりに', 'にすぎず', 'どころに'], '～のみならず is the formal "not only".'],
  ['～はともかく', '味（　）、値段は手ごろだ。', 'はともかく', ['はもちろん', 'にとって', 'にしては'], '～はともかく sets an issue aside for now.'],
  ['～に決まっている', 'こんな時間なら、道は空いている（　）。', 'に決まっている', ['に違いない', 'おそれがある', 'かねない'], '～に決まっている is a confident, colloquial certainty.'],
  ['～おそれがある', '大雨で川が増水する（　）。', 'おそれがある', ['にすぎない', 'ようがない', 'きれない'], '～おそれがある warns of a risk in formal register.'],
  ['～たものだ', '子どものころ、よくここで遊ん（　）。', 'だものだ', ['でおいた', 'でしまった', 'であった'], '～たものだ recalls a repeated past habit.'],
  ['～というものだ', '一方的に決めるのは、身勝手（　）。', 'というものだ', ['ということだ', 'というものか', 'というほどだ'], '～というものだ delivers a judgement.'],
  ['～ということだ', '会議は延期された（　）。', 'ということだ', ['というものだ', 'というほかない', 'というわけがない'], '～ということだ reports information.'],
  ['～わけにはいかない', '大事な会議なので、休む（　）。', 'わけにはいかない', ['ようがない', 'ほかならない', 'にすぎない'], '～わけにはいかない marks a social or moral impossibility.'],
].map((entry) => { const [form, sentence, answer, distractors, note] = entry as [string, string, string, [string, string, string], string]; return { form, sentence, answer, distractors, note }; });

const people = ['田中さん', '山本さん', 'リーさん', '佐々木さん', '高橋さん', '木村さん', '伊藤さん', '森さん'];
const days = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日', '祝日の翌日'];
/** Day-change listening items need real weekdays only — 祝日の翌日 is not a valid option. */
const weekdays = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];
const places = ['市民会館', '図書館', '研修センター', '駅前広場', '文化センター', '会社の会議室', '地域交流館', '大学の講堂'];
const badge = (type: QuestionType) => type === 'KANJI' ? '漢字' : type === 'VOCABULARY' ? '語彙' : type === 'GRAMMAR' ? '文法' : type === 'READING' ? '読解' : '聴解';
const pick4 = (words: Word[], index: number, field: 'word' | 'reading' | 'paraphrase') => [0, 1, 2, 3].map((offset) => words[(index + offset * 5) % words.length][field]);
const slug = (value: string) => value.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');

function languageQuestion(level: 'N3' | 'N2', spec: Spec, index: number, words: Word[], grammar: Grammar): Question | null {
  const word = words[index % words.length];
  const person = people[index % people.length];
  const day = days[(index * 3) % days.length];
  const place = places[(index * 5) % places.length];
  const tag = `練習${index + 1}`;
  const common = { type: spec.type, badge: badge(spec.type), itemType: spec.itemType, jpItemType: spec.jp } as const;
  if (spec.itemType === 'Kanji reading') return { ...common, prompt: '＿＿の言葉の読み方として最もよいものを選んでください。', tokens: [`${tag}：${person}は資料の内容を`, { kanji: word.word, reading: word.reading, target: true }, 'してから説明した。'], options: pick4(words, index, 'reading'), answer: 0, note: `${word.word} is read ${word.reading} and means ${word.meaning}.` };
  if (spec.itemType === 'Orthography') return { ...common, prompt: '＿＿の言葉は漢字でどう書きますか。', tokens: [`${tag}：計画について`, { kanji: word.reading, reading: '', target: true }, 'する必要がある。'], options: pick4(words, index, 'word'), answer: 0, note: `${word.reading} is written ${word.word}.` };
  if (spec.itemType === 'Contextual vocabulary') return { ...common, prompt: '（　）に入れるのに最もよいものを選んでください。', tokens: [`${tag}：${word.sentence.replace(word.word, '（　　）')}`], options: pick4(words, index, 'word'), answer: 0, note: `${word.word}（${word.reading}） means ${word.meaning}.` };
  if (spec.itemType === 'Paraphrase') return { ...common, prompt: '＿＿と意味が最も近いものを選んでください。', tokens: [`${tag}：${word.sentence}`], options: pick4(words, index, 'paraphrase'), answer: 0, note: `${word.word}（${word.reading}）means ${word.meaning}. In Japanese it can be restated as ${word.paraphrase}.` };
  if (spec.itemType === 'Usage') return { ...common, prompt: `「${word.word}」の使い方として最もよいものを選んでください。`, options: [`${tag}：${word.sentence}`, `${tag}：机を${word.word}に飲んだ。`, `${tag}：空が${word.word}を走っている。`, `${tag}：この靴は${word.word}で甘い。`], answer: 0, note: `Only the first sentence uses ${word.word} naturally in the sense “${word.meaning}.”` };
  if (spec.itemType === 'Word formation') return { ...common, prompt: '（　）に入れて一つの言葉にするとき、最もよいものを選んでください。', tokens: [`${tag}：省エネ設備の（　）導入が進められている。`], options: ['再', '未', '無', '不'], answer: 0, note: '再導入 means introducing something again; 再 is a productive prefix at N2.' };
  if (spec.itemType === 'Grammar form') return { ...common, prompt: '（　）に入れるのに最もよいものを選んでください。', tokens: [`${tag}：${grammar.sentence}`], options: [grammar.answer, ...grammar.distractors], answer: 0, note: `${grammar.form}: ${grammar.note}` };
  if (spec.itemType === 'Sentence assembly') return { ...common, prompt: '★に入るものはどれですか。', tokens: [`${tag}：${person}は ＿＿＿ ＿★＿ ＿＿＿ ＿＿＿ と話した。`], options: [grammar.answer, '今回の結果は', '予想していた', 'とは違う'], answer: 0, note: `Build the whole sentence before selecting the starred slot. This item practises ${grammar.form}.` };
  if (spec.itemType === 'Text grammar') return { ...common, prompt: '文章の（　）に入れるのに最もよいものを選んでください。', passage: [[`${tag}：${day}、${place}で説明会が開かれた。`], [`${person}は参加を希望していた。（　　）、急な仕事で会場へ行けなかった。`], ['そこで、後日公開された動画で内容を確認した。']], options: ['ところが', 'したがって', 'たとえば', 'つまり'], answer: 0, note: 'ところが introduces an unexpected contrast between the intention and what happened.' };
  return null;
}

function readingQuestion(level: 'N3' | 'N2', spec: Spec, index: number): Question {
  const person = people[index % people.length];
  const place = places[(index * 5) % places.length];
  const tag = `${level}資料${index + 1}`;
  const common = { type: spec.type, badge: badge(spec.type), itemType: spec.itemType, jpItemType: spec.jp } as const;
  if (spec.itemType === 'Information retrieval') return { ...common, prompt: `${person}の条件に合う講座はどれですか。`, passage: [[`${tag}　${place} 秋の講座案内`], ['A 写真入門：火曜18時、全4回、6,000円'], ['B 会話練習：木曜19時、全6回、8,000円'], ['C 料理教室：土曜10時、全3回、5,000円'], [`${person}は平日の夜に参加でき、予算は7,000円までである。`]], options: ['A 写真入門', 'B 会話練習', 'C 料理教室', '条件に合う講座はない'], answer: 0, note: 'Only A satisfies both the weekday-evening and price conditions.' };
  if (spec.itemType === 'Integrated reading') return { ...common, prompt: '二つの文章で共通して述べられていることは何ですか。', passage: [[`${tag}　文章A：在宅勤務は通勤時間を減らし、集中しやすいという利点がある。一方、相談の機会を意識して作る必要がある。`], ['文章B：出社には偶然の会話から発想が生まれる利点がある。ただし、全員が毎日集まる必要はない。']], options: ['働く場所は目的に応じて選ぶ必要がある', '全員が毎日出社すべきだ', '在宅勤務では相談できない', '通勤時間は仕事の一部である'], answer: 0, note: 'Both texts value different settings and imply choosing them according to purpose.' };
  if (spec.itemType === 'Thematic reading') return { ...common, prompt: '筆者が最も言いたいことは何ですか。', passage: [[`${tag}　新しい技術が便利かどうかは、機能の多さだけでは決まらない。使う人が何をしたいのかを理解し、必要な機能へ迷わず到達できて初めて役に立つ。開発者には、追加することだけでなく、不要なものを減らす判断も求められる。`]], options: ['利用者の目的を基準に機能を設計すべきだ', '新しい技術には機能が多いほどよい', '利用者はすべての機能を学ぶべきだ', '開発者は古い機能を残すべきだ'], answer: 0, note: 'The conclusion calls for designing around the user’s purpose, including removing unnecessary features.' };
  const long = spec.itemType === 'Long passage';
  const mid = spec.itemType === 'Mid-size passage';
  const passage = [[`${tag}　${place}では、利用者が本を選びやすいよう、職員が短い紹介文を付ける取り組みを始めた。`], ['当初は貸出数を増やすことだけが目的だったが、紹介文をきっかけに利用者同士が感想を交換するようになった。'], ...(mid || long ? [['職員は、数字だけでなく、人と本を結ぶ会話が生まれたことに手応えを感じている。']] : []), ...(long ? [['一方で、紹介文が先入観を与える可能性もあるため、内容を断定せず、読者が自分で考えられる書き方を工夫している。']] : [])];
  return { ...common, prompt: long ? '職員が紹介文を書くとき注意していることは何ですか。' : mid ? '職員が特に評価している変化は何ですか。' : 'この取り組みを始めた目的は何ですか。', passage, options: long ? ['読者の解釈を決めつけないこと', '本の結末まで説明すること', '貸出数だけを紹介すること', '感想を書かせないこと'] : mid ? ['本を通じた会話が生まれたこと', '職員の仕事が減ったこと', '紹介文が不要になったこと', '利用者が本を買ったこと'] : ['利用者が本を選びやすくすること', '本の価格を下げること', '職員を増やすこと', '感想の交換を禁止すること'], answer: 0, note: 'The answer follows the purpose or conclusion stated directly in the passage.' };
}

function listeningQuestion(level: 'N3' | 'N2', spec: Spec, index: number): Question {
  const person = people[index % people.length];
  const day = days[(index * 3) % days.length];
  const place = places[(index * 5) % places.length];
  const audio = `${level.toLowerCase()}-generated-${slug(spec.itemType)}-${index + 1}`;
  const numbered = (prompt: string) => `第${index + 1}問：${prompt}`;
  const common = { type: spec.type, badge: badge(spec.type), itemType: spec.itemType, jpItemType: spec.jp, audio } as const;
  if (spec.itemType === 'Quick response') return { ...common, prompt: numbered('聞いて、最もよい返事を選んでください。'), narration: [{ speaker: 'a', text: `${person}さん、今日中にこの資料を見ていただけませんか。` }], options: ['はい、確認しておきます。', 'いいえ、見てありました。', '資料が見えませんでしたか。', '今日までにいただきました。'], answer: 0, note: 'A polite request is naturally accepted with はい plus an action commitment.' };
  if (spec.itemType === 'Verbal expressions') return { ...common, prompt: numbered('この場面で何と言いますか。'), narration: [{ speaker: 'narrator', text: `${day}、${place}で、${person}は借りた資料を返すのが遅れたことを職員に謝います。何と言いますか。` }], options: ['返すのが遅くなって、申し訳ありません。', '遅く返してもらえませんか。', '返すことにしてよかったです。', '借りるのが遅いでしょう。'], answer: 0, note: 'The first option directly and politely apologizes for the late return.' };
  if (spec.itemType === 'Summary comprehension') return { ...common, prompt: numbered('話の主な内容は何ですか。'), revealAfterAudio: true, narration: [{ speaker: 'narrator', text: `${place}で担当者が話しています。`, pauseAfter: 500 }, { speaker: 'a', text: `これまで資料は紙で配っていましたが、${day}から電子版を基本にします。印刷費を減らすだけでなく、修正をすぐ反映できるからです。ただし、希望する方には紙でも用意します。` }], options: ['資料の配布方法を変えること', '紙の資料を完全に廃止すること', '説明会を中止すること', '印刷会社を変更すること'], answer: 0, note: 'The main point is the shift to digital-first distribution, with paper still available on request.' };
  if (spec.itemType === 'Integrated listening') return { ...common, prompt: numbered('二人はどの案を選びますか。'), narration: [{ speaker: 'narrator', text: `${person}と女の人が研修会場について話しています。`, pauseAfter: 500 }, { speaker: 'a', text: '駅前会場は便利ですが、午後しか空いていません。', pauseAfter: 300 }, { speaker: 'b', text: '参加者は午前を希望しています。郊外会場なら午前も使えますが、駅からバスです。', pauseAfter: 300 }, { speaker: 'a', text: '送迎バスを用意できるそうです。それなら希望の時間を優先しましょう。' }], options: ['郊外会場を午前に使う', '駅前会場を午後に使う', '郊外会場を午後に使う', '研修をオンラインにする'], answer: 0, note: 'The shuttle removes the access problem, so they prioritize the requested morning time at the suburban venue.' };
  const point = spec.itemType === 'Point comprehension';
  // The old day and the new one must differ, or the audio says a Friday briefing
  // moved to Friday. Offsetting by 1–6 guarantees they never coincide.
  const fromDay = weekdays[index % weekdays.length];
  const toDay = weekdays[(index + 1 + (index % (weekdays.length - 1))) % weekdays.length];
  // Four *distinct* days: the answer, the stated original as the trap, and two fillers.
  const spare = weekdays.filter((d) => d !== toDay && d !== fromDay);
  const dayOptions = [toDay, fromDay, spare[index % spare.length], spare[(index + 2) % spare.length]];
  return { ...common, prompt: numbered(point ? '説明会は何曜日になりましたか。' : '男の人はこのあとまず何をしますか。'), narration: [{ speaker: 'narrator', text: `${place}で${person}と女の人が話しています。`, pauseAfter: 450 }, { speaker: 'a', text: `${fromDay}の説明会ですが、会場の都合で${toDay}に変更になりました。`, pauseAfter: 300 }, { speaker: 'b', text: 'では、参加者に連絡します。', pauseAfter: 250 }, { speaker: 'a', text: 'その前に、開始時刻も変わらないか受付に確認してください。' }], options: point ? dayOptions : ['受付に開始時刻を確認する', '参加者に連絡する', '会場を掃除する', '説明会を始める'], answer: 0, note: point ? `The briefing moves from ${fromDay} to ${toDay}. The day stated first is the old one — ポイント理解 almost always names the original before the change, so the first date you hear is the trap.` : 'その前に identifies the first required action.' };
}

function make(level: 'N3' | 'N2', spec: Spec, index: number): Question {
  const words = level === 'N3' ? n3Words : n2Words;
  const points = level === 'N3' ? n3Grammar : n2Grammar;
  const grammar = points[index % points.length];
  return languageQuestion(level, spec, index, words, grammar)
    ?? (spec.type === 'READING' ? readingQuestion(level, spec, index) : listeningQuestion(level, spec, index));
}

export function expandIntermediateBank(level: Level, existing: Question[]) {
  if (level !== 'N3' && level !== 'N2') return existing;
  const specs = level === 'N3' ? n3Specs : n2Specs;
  const desired = 16;
  const points = level === 'N3' ? n3Grammar : n2Grammar;
  // Grammar specs run once per point so the whole list is reachable.
  const desiredFor = (spec: Spec) => (spec.itemType === 'Grammar form' ? Math.max(desired, points.length) : desired);
  const result = [...existing];
  for (const spec of specs) {
    const have = result.filter((question) => question.itemType === spec.itemType).length;
    for (let index = have; index < desiredFor(spec); index += 1) result.push(make(level, spec, index));
  }
  const target = specs.length * desired;
  if (result.length < target) throw new Error(`${level} bank expected at least ${target} questions, got ${result.length}`);
  return result;
}
