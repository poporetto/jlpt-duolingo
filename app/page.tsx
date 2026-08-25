'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const skills = [
  { icon: '文', label: 'Grammar', color: 'coral' },
  { icon: '漢', label: 'Kanji', color: 'amber' },
  { icon: '語', label: 'Vocabulary', color: 'mint' },
  { icon: '♫', label: 'Listening', color: 'blue' },
];

const questions = [
  {
    type: 'GRAMMAR', badge: '文法', prompt: 'Choose the best word to complete the sentence.',
    sentence: '雨が降っている＿＿、試合は予定通り行われた。',
    options: ['にもかかわらず', 'にしたがって', 'にかけて', 'に限って'], answer: 0,
    note: '～にもかかわらず means “despite / in spite of.” It highlights an unexpected contrast.',
  },
  {
    type: 'KANJI', badge: '漢字', prompt: 'Which reading completes the word?',
    sentence: '経済（＿＿）', options: ['けいざい', 'きょうさい', 'けいさい', 'きょうざい'], answer: 0,
    note: '経済（けいざい）means “economy.” Think: the flow (経) that helps society (済) function.',
  },
  {
    type: 'VOCABULARY', badge: '語彙', prompt: 'Choose the closest meaning.',
    sentence: 'この計画は「大幅に」変更された。', options: ['slightly', 'secretly', 'significantly', 'suddenly'], answer: 2,
    note: '大幅に（おおはばに）means “significantly” or “by a large margin.”',
  },
  {
    type: 'LISTENING', badge: '聴解', prompt: 'Listen, then choose what happened.',
    sentence: '「電車は事故の影響で、到着が十分ほど遅れる見込みです。」', options: ['The train was cancelled.', 'The train will be about 10 minutes late.', 'The train leaves in 10 minutes.', 'The accident happened 10 minutes ago.'], answer: 1,
    note: '～見込みです means “is expected to.” The arrival is expected to be delayed by around ten minutes.',
  },
];

export default function Home() {
  const [started, setStarted] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [question, setQuestion] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [xp, setXp] = useState(12);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('kuma-n2-xp');
    if (saved) setXp(Number(saved));
  }, []);

  const openLesson = () => { setStarted(true); setLessonOpen(true); setQuestion(0); setSelected(null); setChecked(false); setComplete(false); };
  const playListening = () => {
    window.speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(questions[3].sentence.replace(/[「」]/g, ''));
    voice.lang = 'ja-JP'; voice.rate = 0.82; window.speechSynthesis.speak(voice);
  };
  const continueLesson = () => {
    if (!checked) { if (selected !== null) setChecked(true); return; }
    if (question < questions.length - 1) { setQuestion(question + 1); setSelected(null); setChecked(false); }
    else { const nextXp = xp + 20; setXp(nextXp); window.localStorage.setItem('kuma-n2-xp', String(nextXp)); setComplete(true); }
  };

  const current = questions[question];

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Kuma N2 home"><span className="brand-mark">熊</span><span>Kuma N2</span></a>
        <div className="top-stats" aria-label="Daily progress"><span>🔥 <b>12</b></span><span>◈ <b>{860 + Math.max(0, xp - 12)}</b></span><button className="avatar" aria-label="Open profile">A</button></div>
      </header>

      <section id="top" className="hero">
        <div className="hero-copy">
          <span className="eyebrow">日本語能力試験 • N2</span>
          <h1>Ready for a little<br /><em>日本語?</em></h1>
          <p>Build real N2 confidence with quick, memorable lessons across grammar, kanji, vocabulary, and listening.</p>
          <button className="primary-button" onClick={openLesson}>{started ? 'Continue lesson' : 'Continue learning'} <span>→</span></button>
          <div className="today-line"><span>Today</span><div><i style={{ width: `${Math.min(100, xp / 25 * 100)}%` }} /></div><b>{xp} / 25 XP</b></div>
        </div>

        <div className="mascot-card">
          <span className="speech-bubble">一緒に頑張ろう！<small>Let’s do our best!</small></span>
          <div className="sun" />
          <Image src="/irasutoya-study-bear.png" alt="A bear studying Japanese with a notebook" width={332} height={400} priority />
          <span className="mascot-note">Your study buddy<br /><b>Kuma</b></span>
        </div>
      </section>

      <section className="skill-strip" aria-label="Course skills">
        {skills.map((skill) => <div className="skill-item" key={skill.label}><span className={`skill-icon ${skill.color}`}>{skill.icon}</span><div><b>{skill.label}</b><small>N2 practice</small></div></div>)}
      </section>

      <section className="journey" id="journey">
        <div className="section-heading"><div><span className="eyebrow">YOUR N2 JOURNEY</span><h2>Small steps. Real progress.</h2></div><span className="level-pill">Level N2 <b>⌄</b></span></div>
        <div className="path-preview">
          <article className="lesson-card active"><span className="lesson-index">01</span><div><small>GRAMMAR • 5 MIN</small><h3>Expressing contrast</h3><p>～にもかかわらず</p></div><button aria-label="Start expressing contrast lesson" onClick={openLesson}>▶</button></article>
          <article className="lesson-card"><span className="lesson-index">02</span><div><small>KANJI • 7 MIN</small><h3>News & society</h3><p>報 ・ 政 ・ 経</p></div><span className="locked">25 XP</span></article>
          <article className="lesson-card faint"><span className="lesson-index">03</span><div><small>LISTENING • 6 MIN</small><h3>Station announcement</h3><p>聞いて選ぼう</p></div><span className="locked">🔒</span></article>
        </div>
      </section>

      {lessonOpen && <div className="lesson-overlay" role="dialog" aria-modal="true" aria-label="N2 mixed practice lesson">
        <div className="lesson-window">
          <header className="lesson-top">
            <button className="close-button" onClick={() => setLessonOpen(false)} aria-label="Close lesson">×</button>
            <div className="lesson-progress" aria-label={`Question ${question + 1} of ${questions.length}`}><i style={{ width: `${complete ? 100 : (question + 1) / questions.length * 100}%` }} /></div>
            <span className="heart">♥ <b>5</b></span>
          </header>

          {!complete ? <div className="question-wrap">
            <div className="question-meta"><span>{current.badge}</span><b>{current.type}</b><small>{question + 1} / {questions.length}</small></div>
            <h2>{current.prompt}</h2>
            {current.type === 'LISTENING' && <button className="listen-button" onClick={playListening} aria-label="Play Japanese audio"><span>▶</span><div><b>Play audio</b><small>Tap to listen again</small></div></button>}
            <div className="sentence-card" lang="ja">{current.type === 'LISTENING' ? '何が起こりましたか？' : current.sentence}</div>
            <div className="answers">
              {current.options.map((option, index) => {
                const state = checked ? index === current.answer ? 'correct' : index === selected ? 'wrong' : '' : selected === index ? 'selected' : '';
                return <button key={option} className={state} onClick={() => !checked && setSelected(index)}><span>{index + 1}</span>{option}{checked && index === current.answer && <b>✓</b>}</button>;
              })}
            </div>
            {checked && <div className={`feedback ${selected === current.answer ? 'success' : 'retry'}`} role="status"><b>{selected === current.answer ? 'Great job! よくできました' : 'Not quite — remember this'}</b><p>{current.note}</p></div>}
            <button className="check-button" disabled={selected === null} onClick={continueLesson}>{checked ? (question === questions.length - 1 ? 'Finish lesson' : 'Continue') : 'Check answer'}</button>
          </div> : <div className="complete-card">
            <div className="celebration">祝</div><span className="eyebrow">LESSON COMPLETE</span><h2>That was bear-y good!</h2><p>You mixed grammar, kanji, vocabulary and listening — just like the real N2.</p>
            <div className="reward-row"><div><small>XP EARNED</small><b>+20 XP</b></div><div><small>QUESTIONS</small><b>4 / 4</b></div></div>
            <button className="primary-button" onClick={() => setLessonOpen(false)}>Back to my path <span>→</span></button>
          </div>}
        </div>
      </div>}

      <footer>Illustration: <a href="https://www.irasutoya.com/2014/05/blog-post_587.html" target="_blank" rel="noreferrer">いらすとや</a> • Made for joyful N2 study</footer>
    </main>
  );
}
