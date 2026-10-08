'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Level, Question } from './levels';
import type { ListeningLesson } from './listening-lessons';
import { StudyText, type FuriganaComponent } from './grammar-study';
import { registerRuby } from './ruby';

/** Loads the lessons and their furigana on demand. */
export async function loadListeningLessons(level: Level): Promise<ListeningLesson[]> {
  const [mod, ruby] = await Promise.all([import('./listening-lessons'), import(`./banks/listening-${level}.ruby.json`)]);
  const lessons = mod.listeningLessons[level] ?? [];
  registerRuby(mod.listeningStrings(lessons), (ruby.default ?? ruby) as string[]);
  return lessons;
}

const SPEAKER = { man: '男', woman: '女', narrator: '＊' } as const;
/** Text without the spacing the bank puts between phrases. */
const flat = (text: string) => text.replace(/[　 ]/g, '');

type Props = {
  level: Level;
  lessons: ListeningLesson[];
  bank: Question[];
  studied: string[];
  furigana: boolean;
  Furigana: FuriganaComponent;
  onToggle: (type: string) => void;
  onPlay: (q: Question, onEnd: () => void) => void;
  /** Must be a stable function — it runs on unmount. */
  onStop: () => void;
  practiceCount: (type: string) => number;
  onPractise: (type: string) => void;
  onBack: () => void;
  minQuestions: number;
  backIcon: ReactNode;
  nextIcon: ReactNode;
  tabs: ReactNode;
};

/** One worked example: play it, then reveal the transcript and the answer. */
function Worked({ q, keyLine, why, n, playing, onPlay, furigana, Furigana }: {
  q: Question; keyLine: number; why: string; n: number; playing: boolean;
  onPlay: () => void; furigana: boolean; Furigana: FuriganaComponent;
}) {
  const [transcript, setTranscript] = useState(false);
  const [answer, setAnswer] = useState(false);
  // 概要理解 asks its question only after the talk, so the card does too.
  const [heard, setHeard] = useState(false);
  const showPrompt = !q.revealAfterAudio || heard || transcript || answer;
  const lines = q.narration ?? [];
  const setting = lines[0]?.speaker === 'narrator' ? lines[0].text : '';
  return (
    <article className="study-card listen-worked">
      <div className="study-card-top">
        <h3 className="listen-worked-title">Worked example {n}</h3>
        <button className={`listen-play ${playing ? 'on' : ''}`} onClick={() => { setHeard(true); onPlay(); }} aria-pressed={playing}>{playing ? '■ Stop' : '▶ Play'}</button>
      </div>
      {setting && <p className="listen-setting" lang="ja"><Furigana text={setting} furigana={furigana} /></p>}
      {showPrompt && !flat(setting).includes(flat(q.prompt)) && <p className="listen-question" lang="ja"><Furigana text={q.prompt} furigana={furigana} /></p>}
      <div className="listen-reveal">
        <button className="study-learned" aria-expanded={transcript} onClick={() => setTranscript((v) => !v)}>{transcript ? 'Hide transcript' : 'Show transcript'}</button>
        <button className="study-learned" aria-expanded={answer} onClick={() => setAnswer((v) => !v)}>{answer ? 'Hide answer' : 'Show answer'}</button>
      </div>
      {transcript && (
        <ol className="listen-transcript" lang="ja">
          {lines.map((line, i) => (
            <li key={i} className={i === keyLine ? 'key' : ''}>
              <span className="listen-speaker">{SPEAKER[line.speaker]}</span>
              <span><Furigana text={line.text} furigana={furigana} /></span>
            </li>
          ))}
        </ol>
      )}
      {answer && (
        <div className="listen-answer">
          <ul lang="ja">
            {q.options.map((opt, i) => (
              <li key={opt} className={i === (q.answer ?? 0) ? 'right' : ''}><Furigana text={opt} furigana={furigana} /></li>
            ))}
          </ul>
          <p><StudyText text={why} furigana={furigana} Furigana={Furigana} /></p>
        </div>
      )}
    </article>
  );
}

export function ListeningStudy({ level, lessons, bank, studied, furigana, Furigana, onToggle, onPlay, onStop, practiceCount, onPractise, onBack, minQuestions, backIcon, nextIcon, tabs }: Props) {
  const [active, setActive] = useState(0);
  const [english, setEnglish] = useState(true);
  const [playing, setPlaying] = useState('');
  // Each play gets a ticket; an onEnd from a clip that was stopped or replaced
  // carries an old ticket and is ignored, so it cannot clear the new one.
  const ticket = useRef(0);
  const stop = () => { ticket.current += 1; setPlaying(''); onStop(); };
  // Leaving the tab (or the study hub) stops whatever is playing. onStop must
  // be stable, or this would stop playback on every render.
  useEffect(() => () => onStop(), [onStop]);

  const lesson = lessons[active];
  if (!lesson) return null;
  const learned = lessons.filter((l) => studied.includes(l.type)).length;
  const isLearned = studied.includes(lesson.type);
  const drill = practiceCount(lesson.type);
  const play = (q: Question) => {
    if (playing === q.audio) { stop(); return; }
    stop();
    const mine = ++ticket.current;
    setPlaying(q.audio ?? '');
    onPlay(q, () => { if (ticket.current === mine) setPlaying(''); });
  };
  const choose = (i: number) => { stop(); setActive(i); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <section id="top" className="pathway-home study-home">
      <div className="pathway-heading">
        <button className="pathway-back" onClick={onBack}>{backIcon}{level} pathway</button>
        {tabs}
        <div className="study-intro">
          <span className="eyebrow">{level} 聴解まとめ • LISTENING STUDY</span>
          <h1>Know what <em>to listen for</em>.</h1>
          <p>Each listening item type: what it tests, how to approach it, the traps it sets, and the phrases that give the answer away — then two worked examples to play, read and check before you drill the rest.</p>
          <div className="study-progress" role="img" aria-label={`${learned} of ${lessons.length} item types learned`}>
            <i style={{ width: `${lessons.length ? (learned / lessons.length) * 100 : 0}%` }} />
          </div>
          <small className="daily-stat">{learned}/{lessons.length} item types learned</small>
        </div>
      </div>

      <div className="study-layout">
        <nav className="study-units" aria-label="Listening item types">
          {lessons.map((l, i) => (
            <button key={l.type} className={i === active ? 'active' : ''} onClick={(e) => { choose(i); e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest' }); }}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <b lang="ja">{l.type}</b>
              <small>{l.title}{studied.includes(l.type) ? ' • ✓' : ''}</small>
            </button>
          ))}
        </nav>

        <div className="study-main">
          <header className="study-unit-head">
            <div>
              <small>ITEM TYPE {active + 1}</small>
              <h2><b lang="ja"><Furigana text={lesson.type} furigana={furigana} /></b> <span>{lesson.title}</span></h2>
              <p>{lesson.purpose}</p>
            </div>
            <label className="study-toggle">
              <input type="checkbox" checked={english} onChange={(e) => setEnglish(e.target.checked)} /> Show English
            </label>
          </header>

          <article className={`study-card ${isLearned ? 'learned' : ''}`}>
            <div className="study-card-top">
              <h3 className="listen-section">How it works</h3>
              <button className="study-learned" aria-pressed={isLearned} onClick={() => onToggle(lesson.type)}>{isLearned ? '✓ Learned' : 'Mark as learned'}</button>
            </div>
            <p className="study-explain"><StudyText text={lesson.flow} furigana={furigana} Furigana={Furigana} /></p>
            <h4 className="listen-sub">Approach</h4>
            <ul className="listen-list">{lesson.strategy.map((s) => <li key={s}><StudyText text={s} furigana={furigana} Furigana={Furigana} /></li>)}</ul>
            <h4 className="listen-sub">Traps</h4>
            <ul className="listen-list traps">{lesson.traps.map((s) => <li key={s}><StudyText text={s} furigana={furigana} Furigana={Furigana} /></li>)}</ul>
          </article>

          <article className="study-card">
            <h3 className="listen-section">Signal phrases</h3>
            <div className="listen-signals">
              {lesson.signals.map((s) => (
                <div key={s.phrase} className="listen-signal">
                  <div className="listen-signal-head">
                    <b lang="ja"><Furigana text={s.phrase} furigana={furigana} /></b>
                    <small>{s.role}</small>
                  </div>
                  <span className="study-jp" lang="ja"><StudyText text={s.jp} furigana={furigana} Furigana={Furigana} /></span>
                  {english && <span className="study-en">{s.en}</span>}
                </div>
              ))}
            </div>
          </article>

          {lesson.worked.map((w, i) => {
            const q = bank.find((x) => x.audio === w.audio);
            return q ? <Worked key={w.audio} q={q} keyLine={w.keyLine} why={w.why} n={i + 1} playing={playing === w.audio} onPlay={() => play(q)} furigana={furigana} Furigana={Furigana} /> : null;
          })}

          <footer className="study-foot">
            <div>
              <b lang="ja">Practise {lesson.type}</b>
              <small>{drill >= minQuestions ? `${drill} more ${lesson.type} items, leaving out the worked examples` : 'Not enough items for this type yet'}</small>
            </div>
            <button className="daily-start" disabled={drill < minQuestions} onClick={() => { stop(); onPractise(lesson.type); }}>Practise {nextIcon}</button>
          </footer>
        </div>
      </div>
    </section>
  );
}
