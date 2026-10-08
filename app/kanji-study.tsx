'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Level } from './levels';
import type { RubySeg } from './ruby';

export type KanjiExample = { word: string; reading: string; gloss: string; ruby: RubySeg[] };
export type KanjiEntry = { ch: string; strokes: number; meanings: string[]; on: string[]; kun: string[]; examples: KanjiExample[] };
export type KanjiTable = { id: string; kanji: KanjiEntry[] };

/** Loads one level's tables on demand; they never weigh on first paint. */
export async function loadKanjiTables(level: Level): Promise<KanjiTable[]> {
  const data = await import('./kanji-tables.json');
  return ((data.default ?? data) as unknown as Record<string, KanjiTable[]>)[level] ?? [];
}

/**
 * An example word with ruby per kanji — the reading split computed at build
 * time, so 傾く gets かたむ over 傾 and nothing over the okurigana. The kanji
 * being taught is emphasised.
 */
function ExampleWord({ ex, ch, furigana }: { ex: KanjiExample; ch: string; furigana: boolean }) {
  const parts: ReactNode[] = [];
  let at = 0;
  const plain = (text: string) => { if (text) parts.push(<span key={`p${at}`}>{text}</span>); };
  for (const [start, len, reading] of ex.ruby) {
    plain(ex.word.slice(at, start));
    const text = ex.word.slice(start, start + len);
    const body = text === ch ? <b>{text}</b> : text;
    parts.push(<ruby key={`r${start}`}>{body}{furigana && <rt>{reading}</rt>}</ruby>);
    at = start + len;
  }
  plain(ex.word.slice(at));
  return <span className="kanji-word">{parts}</span>;
}

type Props = {
  level: Level;
  tables: KanjiTable[];
  studied: string[];
  furigana: boolean;
  onToggle: (ch: string) => void;
  practiceCount: (chars: string[]) => number;
  practiceSize: number;
  onPractise: (chars: string[]) => void;
  onBack: () => void;
  minQuestions: number;
  backIcon: ReactNode;
  nextIcon: ReactNode;
  tabs: ReactNode;
};

export function KanjiStudy({ level, tables, studied, furigana, onToggle, practiceCount, practiceSize, onPractise, onBack, minQuestions, backIcon, nextIcon, tabs }: Props) {
  const [active, setActive] = useState(0);
  const [readings, setReadings] = useState(true);
  const table = tables[active];
  const total = tables.reduce((n, t) => n + t.kanji.length, 0);
  const learned = tables.reduce((n, t) => n + t.kanji.filter((k) => studied.includes(k.ch)).length, 0);
  if (!table) return null;
  const chars = table.kanji.map((k) => k.ch);
  const drill = practiceCount(chars);
  const first = tables.slice(0, active).reduce((n, t) => n + t.kanji.length, 0) + 1;

  return (
    <section id="top" className="pathway-home study-home">
      <div className="pathway-heading">
        <button className="pathway-back" onClick={onBack}>{backIcon}{level} pathway</button>
        {tabs}
        <div className="study-intro">
          <span className="eyebrow">{level} 漢字表 • KANJI TABLES</span>
          <h1>Every kanji, <em>with words</em> to hang it on.</h1>
          <p>The {total} kanji on the {level} list, in tables of about twenty, most frequent in newspapers first. Each shows the readings real vocabulary uses — not every reading the dictionary lists — with example words. Hide the readings to test yourself, then drill the table.</p>
          <div className="study-progress" role="img" aria-label={`${learned} of ${total} kanji learned`}>
            <i style={{ width: `${total ? (learned / total) * 100 : 0}%` }} />
          </div>
          <small className="daily-stat">{learned}/{total} kanji learned</small>
        </div>
      </div>

      <div className="study-layout">
        <nav className="study-units" aria-label="Kanji tables">
          {tables.map((t, i) => {
            const done = t.kanji.filter((k) => studied.includes(k.ch)).length;
            return (
              <button key={t.id} className={i === active ? 'active' : ''} onClick={(e) => { setActive(i); e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <b className="kanji-preview" lang="ja">{t.kanji.slice(0, 6).map((k) => k.ch).join('')}…</b>
                <small>{t.kanji.length} kanji • {done}/{t.kanji.length}</small>
              </button>
            );
          })}
        </nav>

        <div className="study-main">
          <header className="study-unit-head">
            <div>
              <small>TABLE {active + 1}</small>
              <h2>{chars.join('')}</h2>
              <p>Frequency ranks {first}–{first + chars.length - 1} of {total}.</p>
            </div>
            <label className="study-toggle">
              <input type="checkbox" checked={readings} onChange={(e) => setReadings(e.target.checked)} /> Show readings
            </label>
          </header>

          <div className="kanji-grid">
            {table.kanji.map((k) => {
              const isLearned = studied.includes(k.ch);
              return (
                <article key={k.ch} className={`study-card kanji-card ${isLearned ? 'learned' : ''}`}>
                  <div className="kanji-head">
                    <span className="kanji-char" lang="ja">{k.ch}</span>
                    <div>
                      <p className="kanji-meaning">{k.meanings.join(', ')}</p>
                      <small>{k.strokes} strokes</small>
                    </div>
                  </div>
                  <dl className={`kanji-readings ${readings ? '' : 'hidden'}`} lang="ja">
                    {k.on.length > 0 && <div><dt>音</dt><dd>{k.on.join('・')}</dd></div>}
                    {k.kun.length > 0 && <div><dt>訓</dt><dd>{k.kun.join('・')}</dd></div>}
                  </dl>
                  {k.examples.length > 0 && (
                    <ul className="kanji-examples">
                      {k.examples.map((ex) => (
                        <li key={ex.word}>
                          <span lang="ja"><ExampleWord ex={ex} ch={k.ch} furigana={furigana && readings} /></span>
                          <small>{ex.gloss}</small>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button className="study-learned" aria-pressed={isLearned} onClick={() => onToggle(k.ch)}>
                    {isLearned ? '✓ Learned' : 'Mark as learned'}
                  </button>
                </article>
              );
            })}
          </div>

          <footer className="study-foot">
            <div>
              <b>Practise table {active + 1}</b>
              <small>{drill >= minQuestions ? `${Math.min(drill, practiceSize)} of ${drill} 漢字読み and 表記 questions on these kanji, weakest first` : 'Not enough questions for these kanji yet'}</small>
            </div>
            <button className="daily-start" disabled={drill < minQuestions} onClick={() => onPractise(chars)}>Practise {nextIcon}</button>
          </footer>
        </div>
      </div>
    </section>
  );
}
