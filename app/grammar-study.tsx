'use client';

import { useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import type { Level } from './levels';
import type { GrammarUnit } from './grammar-lessons';
import { registerRuby, studyChunks, uniqueInOrder } from './ruby';

export type FuriganaComponent = ComponentType<{ text: string; furigana: boolean }>;

/** Levels that have study material. Kept here, not in the lessons file, so the
 *  pathway can show the card without loading the material itself. */
export const STUDY_LEVELS: Level[] = ['N2'];

export type StudyData = {
  units: GrammarUnit[];
  legend: [string, string][];
  /** Every spelling an answer may take for each point, for matching drill items. */
  accepted: Record<string, string[]>;
};

/** Loads the lessons and the inventory on demand, so neither weighs on first paint. */
export async function loadGrammarUnits(level: Level): Promise<StudyData> {
  const [lessons, inventory, ruby] = await Promise.all([import('./grammar-lessons'), import('./grammar-inventory'), import(`./banks/lessons-${level}.ruby.json`)]);
  const units = lessons.grammarLessons[level] ?? [];
  registerRuby(
    uniqueInOrder(units.flatMap((u) => u.points.flatMap((p) => [...studyChunks(p.explanation), ...studyChunks(p.compare ?? ''), ...p.examples.flatMap((e) => studyChunks(e.jp))]))),
    (ruby.default ?? ruby) as string[],
  );
  const norm = (s: string) => s.replace(/^[～〜]/, '').replace(/[　 ]/g, '');
  const accepted: Record<string, string[]> = {};
  for (const g of inventory.grammarInventory[level] ?? []) {
    accepted[g.point] = [g.form, g.point, ...(g.aliases ?? [])].filter((x): x is string => !!x).map(norm);
  }
  return { units, legend: lessons.CONNECTION_LEGEND, accepted };
}

/**
 * Renders lesson text: ［…］ is the grammar span (highlighted), {漢字|かな} is a
 * word with an explicit reading, and everything else goes through the app's
 * usual furigana. English text passes through unchanged.
 */
export function StudyText({ text, furigana, Furigana }: { text: string; furigana: boolean; Furigana: FuriganaComponent }) {
  const parts: ReactNode[] = [];
  const pattern = /［([^］]+)］|\{([^|}]+)\|([^}]+)\}/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  const plain = (chunk: string) => { if (chunk) parts.push(<Furigana key={key++} text={chunk} furigana={furigana} />); };
  while ((match = pattern.exec(text))) {
    plain(text.slice(last, match.index));
    if (match[1] !== undefined) {
      parts.push(<mark key={key++} className="study-span"><StudyText text={match[1]} furigana={furigana} Furigana={Furigana} /></mark>);
    } else {
      parts.push(<ruby key={key++}>{match[2]}{furigana && <rt>{match[3]}</rt>}</ruby>);
    }
    last = pattern.lastIndex;
  }
  plain(text.slice(last));
  return <>{parts}</>;
}

type Props = {
  level: Level;
  units: GrammarUnit[];
  legend: [string, string][];
  studied: string[];
  furigana: boolean;
  Furigana: FuriganaComponent;
  onToggle: (point: string) => void;
  practiceCount: (points: string[]) => number;
  onPractise: (points: string[]) => void;
  onBack: () => void;
  minQuestions: number;
  backIcon: ReactNode;
  nextIcon: ReactNode;
  /** The study hub's tab bar, shown under the back button. */
  tabs?: ReactNode;
};

export function GrammarStudy({ level, units, legend, studied, furigana, Furigana, onToggle, practiceCount, onPractise, onBack, minQuestions, backIcon, nextIcon, tabs }: Props) {
  const [active, setActive] = useState(0);
  const [english, setEnglish] = useState(true);
  const unit = units[active];
  const total = units.reduce((n, u) => n + u.points.length, 0);
  const learned = units.reduce((n, u) => n + u.points.filter((p) => studied.includes(p.point)).length, 0);
  if (!unit) return null;
  const unitPoints = unit.points.map((p) => p.point);
  const drill = practiceCount(unitPoints);

  return (
    <section id="top" className="pathway-home study-home">
      <div className="pathway-heading">
        <button className="pathway-back" onClick={onBack}>{backIcon}{level} pathway</button>
        {tabs}
        <div className="study-intro">
          <span className="eyebrow">{level} 文法まとめ • GRAMMAR STUDY</span>
          <h1>Learn it, <em>then</em> drill it.</h1>
          <p>Each pattern with how it attaches, what it means, how it differs from its neighbours, and example sentences. Mark a point once it makes sense, then practise the whole unit.</p>
          <div className="study-progress" role="img" aria-label={`${learned} of ${total} points learned`}>
            <i style={{ width: `${total ? (learned / total) * 100 : 0}%` }} />
          </div>
          <small className="daily-stat">{learned}/{total} points learned</small>
        </div>
      </div>

      <div className="study-layout">
        <nav className="study-units" aria-label="Grammar units">
          {units.map((u, i) => {
            const done = u.points.filter((p) => studied.includes(p.point)).length;
            return (
              <button key={u.id} className={i === active ? 'active' : ''} onClick={(e) => { setActive(i); e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <b>{u.jp}</b>
                <small>{u.title} • {done}/{u.points.length}</small>
              </button>
            );
          })}
        </nav>

        <div className="study-main">
          <header className="study-unit-head">
            <div>
              <small>UNIT {active + 1}</small>
              <h2>{unit.jp} <span>{unit.title}</span></h2>
              <p>{unit.summary}</p>
            </div>
            <label className="study-toggle">
              <input type="checkbox" checked={english} onChange={(e) => setEnglish(e.target.checked)} /> Show English
            </label>
          </header>

          {unit.points.map((lesson) => {
            const isLearned = studied.includes(lesson.point);
            return (
              <article key={lesson.point} className={`study-card ${isLearned ? 'learned' : ''}`}>
                <div className="study-card-top">
                  <h3>～{lesson.point}</h3>
                  <button className="study-learned" aria-pressed={isLearned} onClick={() => onToggle(lesson.point)}>
                    {isLearned ? '✓ Learned' : 'Mark as learned'}
                  </button>
                </div>
                <p className="study-meaning">{lesson.meaning}</p>
                <dl className="study-facts">
                  <dt>接続</dt><dd>{lesson.connection}</dd>
                </dl>
                <p className="study-explain"><StudyText text={lesson.explanation} furigana={furigana} Furigana={Furigana} /></p>
                {lesson.compare && <p className="study-compare"><b>Compare</b> <StudyText text={lesson.compare} furigana={furigana} Furigana={Furigana} /></p>}
                <ol className="study-examples">
                  {lesson.examples.map((ex) => (
                    <li key={ex.jp}>
                      <span className="study-jp"><StudyText text={ex.jp} furigana={furigana} Furigana={Furigana} /></span>
                      {english && <span className="study-en">{ex.en}</span>}
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}

          <footer className="study-foot">
            <div>
              <b>Practise unit {active + 1}</b>
              <small>{drill >= minQuestions ? `${drill} 文法形式 questions on these ${unit.points.length} points` : 'Not enough questions for these points yet'}</small>
            </div>
            <button className="daily-start" disabled={drill < minQuestions} onClick={() => onPractise(unitPoints)}>Practise {nextIcon}</button>
          </footer>

          <details className="study-legend">
            <summary>How to read 接続</summary>
            <dl>{legend.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </details>
        </div>
      </div>
    </section>
  );
}
