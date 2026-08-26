'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { levelDetails, levels, questionBank, type Level, type Token } from './course-data';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const asset = (path: string) => `${BASE_PATH}${path}`;

const skills = [
  { icon: '文', label: 'Grammar', color: 'coral' },
  { icon: '漢', label: 'Kanji', color: 'amber' },
  { icon: '語', label: 'Vocabulary', color: 'mint' },
  { icon: '♫', label: 'Listening', color: 'blue' },
];

const questionModeIcons = {
  GRAMMAR: { src: '/mode-grammar.webp', alt: 'Open notebook and pencil' },
  KANJI: { src: '/mode-kanji.webp', alt: 'Calligraphy brush and reading card' },
  VOCABULARY: { src: '/mode-vocabulary.webp', alt: 'Picture vocabulary cards' },
  LISTENING: { src: '/mode-listening.webp', alt: 'Headphones with sound waves' },
} as const;

const initialXp: Record<Level, number> = { N1: 0, N2: 12, N3: 35, N4: 70, N5: 120 };
const levelMascots: Record<Level, { src: string; alt: string; stage: string }> = {
  N5: { src: '/mascot-n5-baby.webp', alt: 'Baby Kuma reading a picture book', stage: 'Baby steps' },
  N4: { src: '/mascot-n4-toddler.webp', alt: 'Toddler Kuma learning with hiragana blocks', stage: 'Curious toddler' },
  N3: { src: '/mascot-n3-primary.webp', alt: 'Primary-school Kuma wearing a randoseru', stage: 'School explorer' },
  N2: { src: '/mascot-n2-high-school.webp', alt: 'High-school Kuma studying Japanese', stage: 'Focused student' },
  N1: { src: '/mascot-n1-karate.webp', alt: 'Kuma wearing a karate gi and holding a notebook', stage: 'Language mastery' },
};
type SavedSettings = { furigana: boolean; unlimitedHearts: boolean; voiceUri: string };

const readLevel = (): Level => {
  if (typeof window === 'undefined') return 'N2';
  const saved = window.localStorage.getItem('kuma-level') as Level | null;
  return saved && levels.includes(saved) ? saved : 'N2';
};

const readXp = (): Record<Level, number> => {
  if (typeof window === 'undefined') return initialXp;
  try { return { ...initialXp, ...JSON.parse(window.localStorage.getItem('kuma-xp') ?? '{}') }; }
  catch { return initialXp; }
};

const readSettings = (): SavedSettings => {
  const defaults = { furigana: true, unlimitedHearts: false, voiceUri: '' };
  if (typeof window === 'undefined') return defaults;
  try { return { ...defaults, ...JSON.parse(window.localStorage.getItem('kuma-settings') ?? '{}') }; }
  catch { return defaults; }
};

function JapaneseText({ tokens, furigana }: { tokens?: Token[]; furigana: boolean }) {
  if (!tokens) return null;
  return <span className="sentence-text">{tokens.map((token, index) => typeof token === 'string' ? <span key={index}>{token}</span> : <ruby key={index}>{token.kanji}{furigana && <rt>{token.reading}</rt>}</ruby>)}</span>;
}

export default function Home() {
  const [level, setLevel] = useState<Level>('N2');
  const [xpByLevel, setXpByLevel] = useState(initialXp);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [question, setQuestion] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [complete, setComplete] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [furigana, setFurigana] = useState(true);
  const [unlimitedHearts, setUnlimitedHearts] = useState(false);
  const [voiceUri, setVoiceUri] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const questions = questionBank[level];
  const current = questions[question];
  const modeIcon = questionModeIcons[current.type];
  const details = levelDetails[level];
  const mascot = levelMascots[level];
  const xp = xpByLevel[level];
  const japaneseVoices = useMemo(() => voices.filter((voice) => voice.lang.toLowerCase().startsWith('ja')), [voices]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const settings = readSettings();
      setLevel(readLevel()); setXpByLevel(readXp());
      setFurigana(settings.furigana); setUnlimitedHearts(settings.unlimitedHearts); setVoiceUri(settings.voiceUri);
    });
    const loadVoices = () => setVoices(window.speechSynthesis?.getVoices() ?? []);
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => { window.cancelAnimationFrame(frame); window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices); };
  }, []);

  useEffect(() => {
    window.localStorage.setItem('kuma-settings', JSON.stringify({ furigana, unlimitedHearts, voiceUri }));
  }, [furigana, unlimitedHearts, voiceUri]);

  const chooseLevel = (next: Level) => {
    setLevel(next); window.localStorage.setItem('kuma-level', next);
    setQuestion(0); setSelected(null); setChecked(false); setComplete(false);
  };

  const openLesson = () => {
    setLessonOpen(true); setQuestion(0); setSelected(null); setChecked(false); setComplete(false); setHearts(5);
  };

  const playListening = () => {
    if (!current.narration || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(current.narration);
    utterance.lang = 'ja-JP'; utterance.rate = level === 'N1' ? 0.98 : level === 'N2' ? 0.92 : level === 'N3' ? 0.86 : 0.78;
    const selectedVoice = voices.find((voice) => voice.voiceURI === voiceUri) ?? japaneseVoices[0];
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
  };

  const continueLesson = () => {
    if (!checked) {
      if (selected === null) return;
      setChecked(true);
      if (selected !== current.answer && !unlimitedHearts) setHearts((value) => Math.max(0, value - 1));
      return;
    }
    if (question < questions.length - 1) {
      setQuestion(question + 1); setSelected(null); setChecked(false);
    } else {
      const next = { ...xpByLevel, [level]: xp + 20 };
      setXpByLevel(next); window.localStorage.setItem('kuma-xp', JSON.stringify(next)); setComplete(true);
    }
  };

  return (
    <main className="app-shell" style={{ '--level-accent': details.accent } as React.CSSProperties}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Kuma no Ryoku home"><span className="brand-mark">熊</span><span className="brand-copy"><b>Kuma no Ryoku</b><small>熊の力</small></span></a>
        <div className="top-stats" aria-label="Daily progress">
          <span>🔥 <b>12</b></span><span>◈ <b>{860 + Object.values(xpByLevel).reduce((a, b) => a + b, 0)}</b></span>
          <button className="settings-button" onClick={() => setSettingsOpen(true)} aria-label="Open learning settings">⚙</button>
          <button className="avatar" aria-label="Open profile">A</button>
        </div>
      </header>

      <nav className="level-nav" aria-label="JLPT level">
        <span>Choose your level</span>
        <div>{levels.map((item) => <button key={item} className={level === item ? 'active' : ''} onClick={() => chooseLevel(item)}>{item}</button>)}</div>
      </nav>

      <section id="top" className="hero">
        <div className="hero-copy">
          <span className="eyebrow">日本語能力試験 • {level}</span>
          <h1>{details.title.split(' ')[0]}<br /><em>{details.title.split(' ').slice(1).join(' ')}</em></h1>
          <p>{details.subtitle}. Build confidence with exam-shaped practice across grammar, kanji, vocabulary, and listening.</p>
          <p className="brand-pun"><b>熊の力</b>で、<b>能力試験</b>へ。<span>Kuma’s power for your Japanese proficiency journey.</span></p>
          <button className="primary-button" onClick={openLesson}>Start {level} lesson <span>→</span></button>
          <div className="today-line"><span>Today</span><div><i style={{ width: `${Math.min(100, xp / 125 * 100)}%` }} /></div><b>{xp} XP</b></div>
        </div>

        <div className="mascot-card">
          <span className="speech-bubble">{level}も一緒に頑張ろう！<small>Let’s learn together!</small></span>
          <div className="sun" />
          <Image key={level} className="level-mascot" src={asset(mascot.src)} alt={mascot.alt} width={1024} height={1536} priority />
          <span className="mascot-note">{mascot.stage}<br /><b>Kuma • {level}</b></span>
        </div>
      </section>

      <section className="skill-strip" aria-label="Course skills">
        {skills.map((skill) => <div className="skill-item" key={skill.label}><span className={`skill-icon ${skill.color}`}>{skill.icon}</span><div><b>{skill.label}</b><small>{level} practice</small></div></div>)}
      </section>

      <section className="journey" id="journey">
        <div className="section-heading"><div><span className="eyebrow">YOUR {level} JOURNEY</span><h2>Small steps. Real progress.</h2></div><span className="level-pill">Level {level} <b>✓</b></span></div>
        <div className="path-preview">
          <article className="lesson-card active"><span className="lesson-index">01</span><div><small>MIXED PRACTICE • 8 MIN</small><h3>{details.lesson}</h3><p>Exam-style vocabulary, grammar & listening</p></div><button aria-label={`Start ${level} lesson`} onClick={openLesson}>▶</button></article>
          <article className="lesson-card"><span className="lesson-index">02</span><div><small>GRAMMAR • 7 MIN</small><h3>{details.grammar}</h3><p>Sentence formation & meaning</p></div><span className="locked">25 XP</span></article>
          <article className="lesson-card faint"><span className="lesson-index">03</span><div><small>KANJI • 6 MIN</small><h3>{details.kanji}</h3><p>Reading in authentic context</p></div><span className="locked">🔒</span></article>
        </div>
      </section>

      {settingsOpen && <div className="lesson-overlay" role="dialog" aria-modal="true" aria-label="Learning settings">
        <div className="settings-panel">
          <header><div><span className="eyebrow">LEARNING PREFERENCES</span><h2>Settings</h2></div><button className="close-button" onClick={() => setSettingsOpen(false)} aria-label="Close settings">×</button></header>
          <div className="setting-row"><div className="setting-symbol">振</div><div><b>Show furigana</b><p>Display small readings above kanji during lessons.</p><span className="ruby-demo"><ruby>日本語<rt>{furigana ? 'にほんご' : ''}</rt></ruby></span></div><button className={`toggle ${furigana ? 'on' : ''}`} onClick={() => setFurigana(!furigana)} role="switch" aria-checked={furigana}><i /></button></div>
          <div className="setting-row"><div className="setting-symbol heart-symbol">♥</div><div><b>Unlimited hearts</b><p>Practice freely without losing hearts after mistakes.</p></div><button className={`toggle ${unlimitedHearts ? 'on' : ''}`} onClick={() => setUnlimitedHearts(!unlimitedHearts)} role="switch" aria-checked={unlimitedHearts}><i /></button></div>
          <div className="setting-row voice-setting"><div className="setting-symbol voice-symbol">♫</div><div><b>Listening voice</b><p>Choose a Japanese voice installed on this device.</p><select value={voiceUri} onChange={(event) => setVoiceUri(event.target.value)} aria-label="Japanese listening voice"><option value="">Automatic Japanese voice</option>{japaneseVoices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}</select></div></div>
          <button className="save-settings" onClick={() => setSettingsOpen(false)}>Save preferences</button>
        </div>
      </div>}

      {lessonOpen && <div className="lesson-overlay" role="dialog" aria-modal="true" aria-label={`${level} mixed practice lesson`}>
        <div className="lesson-window">
          <header className="lesson-top">
            <button className="close-button" onClick={() => { window.speechSynthesis?.cancel(); setLessonOpen(false); }} aria-label="Close lesson">×</button>
            <div className="lesson-progress" aria-label={`Question ${question + 1} of ${questions.length}`}><i style={{ width: `${complete ? 100 : (question + 1) / questions.length * 100}%` }} /></div>
            <span className="heart">♥ <b>{unlimitedHearts ? '∞' : hearts}</b></span>
          </header>

          {!complete ? <div className="question-wrap">
            <div className="question-meta"><span className={`question-mode-icon mode-${current.type.toLowerCase()}`}><Image src={asset(modeIcon.src)} alt={modeIcon.alt} width={44} height={44} /></span><b>{current.itemType}</b><small>{level} • {question + 1}/{questions.length}</small></div>
            <h2>{current.prompt}</h2>
            {current.type === 'LISTENING' && <div className="listening-scene">
              {current.image && <Image src={asset(current.image)} alt={current.imageAlt ?? ''} width={180} height={180} />}
              <button className="listen-button" onClick={playListening} aria-label="Play Japanese listening prompt"><span>▶</span><div><b>Play audio</b><small>{level === 'N1' || level === 'N2' ? 'Natural exam pace' : 'Clear learner pace'} • replay anytime</small></div></button>
            </div>}
            {current.tokens && <div className="sentence-card" lang="ja"><JapaneseText tokens={current.tokens} furigana={furigana} /></div>}
            <div className="answers">
              {current.options.map((option, index) => {
                const state = checked ? index === current.answer ? 'correct' : index === selected ? 'wrong' : '' : selected === index ? 'selected' : '';
                return <button key={option} className={state} onClick={() => !checked && setSelected(index)}><span>{index + 1}</span>{option}{checked && index === current.answer && <b>✓</b>}</button>;
              })}
            </div>
            {checked && <div className={`feedback ${selected === current.answer ? 'success' : 'retry'}`} role="status"><b>{selected === current.answer ? 'Correct! よくできました' : 'Not quite — learn the clue'}</b><p>{current.note}</p>{current.transcript && <details><summary>Review listening transcript</summary><p lang="ja">{current.transcript}</p></details>}</div>}
            <button className="check-button" disabled={selected === null} onClick={continueLesson}>{checked ? (question === questions.length - 1 ? 'Finish lesson' : 'Continue') : 'Check answer'}</button>
          </div> : <div className="complete-card">
            <div className="celebration">祝</div><span className="eyebrow">{level} LESSON COMPLETE</span><h2>That was bear-y good!</h2><p>You practised the same core item families used by the JLPT: language knowledge and level-appropriate listening comprehension.</p>
            <div className="reward-row"><div><small>XP EARNED</small><b>+20 XP</b></div><div><small>QUESTIONS</small><b>4 / 4</b></div></div>
            <button className="primary-button" onClick={() => setLessonOpen(false)}>Back to my path <span>→</span></button>
          </div>}
        </div>
      </div>}

      <footer>Original Kuma level mascots • Question illustrations © <a href="https://www.irasutoya.com/" target="_blank" rel="noreferrer">いらすとや</a> • <span>Sources:</span> <a href="https://www.irasutoya.com/2014/06/blog-post_9691.html" target="_blank" rel="noreferrer">station</a>, <a href="https://www.irasutoya.com/2018/04/blog-post_59.html" target="_blank" rel="noreferrer">meeting</a>, <a href="https://www.irasutoya.com/2017/11/blog-post_639.html" target="_blank" rel="noreferrer">shopping</a>, <a href="https://www.irasutoya.com/2015/01/blog-post_8.html" target="_blank" rel="noreferrer">weather</a></footer>
    </main>
  );
}
