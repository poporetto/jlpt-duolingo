'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { levelDetails, levels, questionBank, type Level, type Question, type QuestionType, type Token } from './course-data';
import { playNarration, playSfx, rankJapaneseVoices, setSfxEnabled, stopNarration, unlockAudio } from './audio';
import furiganaReadings from './furigana-map.json' with { type: 'json' };

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const asset = (path: string) => `${BASE_PATH}${path}`;

const skills: { type: QuestionType; label: string; color: string }[] = [
  { type: 'GRAMMAR', label: 'Grammar', color: 'coral' },
  { type: 'KANJI', label: 'Kanji', color: 'amber' },
  { type: 'VOCABULARY', label: 'Vocabulary', color: 'mint' },
  { type: 'READING', label: 'Reading', color: 'plum' },
  { type: 'LISTENING', label: 'Listening', color: 'blue' },
];

const questionModeIcons: Record<QuestionType, { src: string; alt: string }> = {
  GRAMMAR: { src: '/mode-grammar.webp', alt: 'Open notebook and pencil' },
  KANJI: { src: '/mode-kanji.webp', alt: 'Calligraphy brush and reading card' },
  VOCABULARY: { src: '/mode-vocabulary.webp', alt: 'Picture vocabulary cards' },
  LISTENING: { src: '/mode-listening.webp', alt: 'Headphones with sound waves' },
  READING: { src: '/mode-reading.webp', alt: 'An open reading book with a coral bookmark' },
};

const initialXp: Record<Level, number> = { N1: 0, N2: 12, N3: 35, N4: 70, N5: 120 };
const levelMascots: Record<Level, { src: string; alt: string }> = {
  N5: { src: '/mascot-n5-baby.webp', alt: 'Baby Kuma reading a picture book' },
  N4: { src: '/mascot-n4-toddler.webp', alt: 'Toddler Kuma learning with hiragana blocks' },
  N3: { src: '/mascot-n3-primary.webp', alt: 'Primary-school Kuma wearing a randoseru' },
  N2: { src: '/mascot-n2-high-school.webp', alt: 'High-school Kuma studying Japanese' },
  N1: { src: '/mascot-n1-karate.webp', alt: 'Kuma wearing a karate gi and holding a notebook' },
};

type SavedSettings = { furigana: boolean; unlimitedHearts: boolean; voiceUri: string; sound: boolean };
type Streak = { last: string; count: number };
type Missed = Partial<Record<Level, number[]>>;
type MasteryScores = Partial<Record<Level, Record<string, number>>>;
type MockResults = Partial<Record<Level, Record<string, { correct: number; total: number; completedAt: string }>>>;

type UiIconName = 'arrow-right' | 'arrow-left' | 'close' | 'heart' | 'replay' | 'play' | 'pause';

function UiIcon({ name }: { name: UiIconName }) {
  return <span className={`ui-icon ui-icon-${name}`} aria-hidden="true" />;
}
/** How many times each question has been served in daily mode, so a run can
 *  prefer what the learner has seen least. */
type DailySeen = Partial<Record<Level, Record<string, number>>>;
type DailyLog = Partial<Record<Level, { day: string; runs: number }>>;
type CurriculumStage = { id: string; type: QuestionType; title: string; jp: string; itemType: string; description: string; levels: Level[] };

const allLevels: Level[] = ['N1', 'N2', 'N3', 'N4', 'N5'];
const curriculum: CurriculumStage[] = [
  { id: 'kanji-reading', type: 'KANJI', title: 'Kanji readings', jp: '漢字読み', itemType: 'Kanji reading', description: 'Choose the correct reading for kanji in sentence context.', levels: allLevels },
  { id: 'orthography', type: 'KANJI', title: 'Orthography', jp: '表記', itemType: 'Orthography', description: 'Choose the kanji spelling that matches a written reading.', levels: ['N2', 'N3', 'N4', 'N5'] },
  { id: 'word-formation', type: 'VOCABULARY', title: 'Word formation', jp: '語形成', itemType: 'Word formation', description: 'Build words accurately from prefixes, suffixes and stems.', levels: ['N2'] },
  { id: 'context', type: 'VOCABULARY', title: 'Words in context', jp: '文脈規定', itemType: 'Contextual vocabulary', description: 'Select the word that naturally completes a sentence.', levels: allLevels },
  { id: 'paraphrase', type: 'VOCABULARY', title: 'Paraphrases', jp: '言い換え類義', itemType: 'Paraphrase', description: 'Recognise equivalent meanings and expressions.', levels: allLevels },
  { id: 'usage', type: 'VOCABULARY', title: 'Word usage', jp: '用法', itemType: 'Usage', description: 'Identify the sentence that uses a word naturally.', levels: ['N1', 'N2', 'N3', 'N4'] },
  { id: 'grammar-form', type: 'GRAMMAR', title: 'Grammar forms', jp: '文の文法1', itemType: 'Grammar form', description: 'Choose the form that fits meaning, register and structure.', levels: allLevels },
  { id: 'sentence-composition', type: 'GRAMMAR', title: 'Sentence composition', jp: '文の文法2', itemType: 'Sentence assembly', description: 'Reorder chunks and identify the starred position.', levels: allLevels },
  { id: 'text-grammar', type: 'GRAMMAR', title: 'Text grammar', jp: '文章の文法', itemType: 'Text grammar', description: 'Follow cohesion and grammar across a connected text.', levels: allLevels },
  { id: 'reading-short', type: 'READING', title: 'Short passages', jp: '内容理解（短文）', itemType: 'Short passage', description: 'Find the purpose or key detail in a compact passage.', levels: allLevels },
  { id: 'reading-mid', type: 'READING', title: 'Mid-size passages', jp: '内容理解（中文）', itemType: 'Mid-size passage', description: 'Trace reasons, relationships and the writer’s point.', levels: allLevels },
  { id: 'reading-long', type: 'READING', title: 'Long passages', jp: '内容理解（長文）', itemType: 'Long passage', description: 'Sustain comprehension across a longer structured text.', levels: ['N1', 'N3'] },
  { id: 'reading-integrated', type: 'READING', title: 'Integrated reading', jp: '統合理解', itemType: 'Integrated reading', description: 'Compare viewpoints and combine information from texts.', levels: ['N1', 'N2'] },
  { id: 'reading-thematic', type: 'READING', title: 'Thematic reading', jp: '主張理解（長文）', itemType: 'Thematic reading', description: 'Identify the argument and the author’s broader position.', levels: ['N1', 'N2'] },
  { id: 'information-retrieval', type: 'READING', title: 'Information retrieval', jp: '情報検索', itemType: 'Information retrieval', description: 'Scan notices, schedules and listings for exact conditions.', levels: allLevels },
  { id: 'listening-task', type: 'LISTENING', title: 'Task comprehension', jp: '課題理解', itemType: 'Task comprehension', description: 'Work out what the speaker needs to do next.', levels: allLevels },
  { id: 'listening-points', type: 'LISTENING', title: 'Key-point listening', jp: 'ポイント理解', itemType: 'Point comprehension', description: 'Listen for a requested detail under clear conditions.', levels: allLevels },
  { id: 'listening-summary', type: 'LISTENING', title: 'General outline', jp: '概要理解', itemType: 'Summary comprehension', description: 'Infer the main idea, stance or overall situation.', levels: ['N1', 'N2', 'N3'] },
  { id: 'listening-verbal', type: 'LISTENING', title: 'Verbal expressions', jp: '発話表現', itemType: 'Verbal expressions', description: 'Choose what to say in a pictured everyday situation.', levels: ['N3', 'N4', 'N5'] },
  { id: 'listening-response', type: 'LISTENING', title: 'Quick response', jp: '即時応答', itemType: 'Quick response', description: 'Respond naturally to one short spoken utterance.', levels: allLevels },
  { id: 'listening-integrated', type: 'LISTENING', title: 'Integrated listening', jp: '統合理解', itemType: 'Integrated listening', description: 'Combine a longer conversation with several conditions.', levels: ['N1', 'N2'] },
];

const today = () => new Date().toISOString().slice(0, 10);

/** A unit needs at least this many questions to be playable. The real exam has
 *  only two to four 長文 / 統合理解 / 主張理解 items, so a small unit is authentic —
 *  it is not a bank still being filled. */
const MIN_UNIT_QUESTIONS = 4;

/** Daily mode: one mixed stage drawing on every section at once. */
const DAILY_LENGTH = 10;
const DAILY_SECTIONS: QuestionType[] = ['KANJI', 'VOCABULARY', 'GRAMMAR', 'READING', 'LISTENING'];
/** Slots per run reserved for items already met but not yet mastered. The rest of
 *  the stage is fresh, so "the questions always change" holds while the handful
 *  you still owe keeps coming back. */
const DAILY_REVIEW_SLOTS = 3;

/**
 * Everything this app keeps in localStorage. Listed once so the profile panel can
 * export and restore progress without a key silently going missing when a new
 * feature adds one.
 */
const STORAGE_KEYS = [
  'kuma-level', 'kuma-xp', 'kuma-streak', 'kuma-missed', 'kuma-settings',
  'kuma-mastery-scores', 'kuma-mock-results', 'kuma-daily-seen', 'kuma-daily-log',
] as const;
const BACKUP_FORMAT = 'kuma-no-ryoku/progress@1';

const lessonChunks = (indices: number[], size = 8) => {
  if (!indices.length) return [[]];
  if (indices.length < size) return [indices];
  const groups = Math.ceil(indices.length / 10);
  const base = Math.floor(indices.length / groups);
  const remainder = indices.length % groups;
  let cursor = 0;
  return Array.from({ length: groups }, (_, part) => {
    const length = base + (part < remainder ? 1 : 0);
    const chunk = indices.slice(cursor, cursor + length);
    cursor += length;
    return chunk;
  });
};

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch { return fallback; }
};

const readLevel = (): Level => {
  if (typeof window === 'undefined') return 'N2';
  const saved = window.localStorage.getItem('kuma-level') as Level | null;
  return saved && levels.includes(saved) ? saved : 'N2';
};

/* Options are shuffled per attempt. The bank is authored answer-first for
 * readability, and without this every correct answer would sit in slot 1. */
const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const permutation = (length: number, seed: number) => {
  const random = mulberry32(seed);
  const order = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

const readingsByFirst = new Map<string, [string, string][]>();
for (const [word, reading] of Object.entries(furiganaReadings)) {
  const first = [...word][0];
  const group = readingsByFirst.get(first) ?? [];
  group.push([word, reading]);
  readingsByFirst.set(first, group);
}
for (const group of readingsByFirst.values()) group.sort(([a], [b]) => b.length - a.length);

/** Add ruby to ordinary Japanese strings. The bank also contains explicit Token
 * objects; those win when present because they encode the intended contextual
 * reading and, importantly, whether a word is the item under test. */
function FuriganaText({ text, furigana }: { text: string; furigana: boolean }) {
  if (!furigana || !/\p{Script=Han}/u.test(text)) return <span className="furigana-text">{text}</span>;

  const pieces: ReactNode[] = [];
  let plain = '';
  let offset = 0;
  const flush = () => {
    if (!plain) return;
    pieces.push(<span key={`plain-${offset}-${pieces.length}`}>{plain}</span>);
    plain = '';
  };

  while (offset < text.length) {
    const match = (readingsByFirst.get(text[offset]) ?? []).find(([word]) => text.startsWith(word, offset));
    if (!match) {
      plain += text[offset];
      offset += 1;
      continue;
    }
    flush();
    const [word, reading] = match;
    pieces.push(<ruby key={`ruby-${offset}`}>{word}<rt>{reading}</rt></ruby>);
    offset += word.length;
  }
  flush();
  // One element, not a fragment: a bare fragment's children each become their own
  // grid item inside a grid parent, which stacked the option explanations on top
  // of one another instead of laying them out in a column.
  return <span className="furigana-text">{pieces}</span>;
}

function JapaneseText({ tokens, furigana }: { tokens?: Token[]; furigana: boolean }) {
  if (!tokens) return null;
  return (
    <span className="sentence-text">
      {tokens.map((token, index) => {
        if (typeof token === 'string') return <span key={index}><FuriganaText text={token} furigana={furigana} /></span>;
        // The item under test is underlined and never furigana'd — otherwise a
        // kanji-reading question prints its own answer above the word.
        if (token.target) return <u key={index} className="target-word">{token.kanji}</u>;
        return <ruby key={index}>{token.kanji}{furigana && <rt>{token.reading}</rt>}</ruby>;
      })}
    </span>
  );
}

export default function Home() {
  const [level, setLevel] = useState<Level>('N2');
  const [xpByLevel, setXpByLevel] = useState(initialXp);
  const [streak, setStreak] = useState<Streak>({ last: '', count: 0 });
  const [missed, setMissed] = useState<Missed>({});
  const [masteryScores, setMasteryScores] = useState<MasteryScores>({});
  const [mockResults, setMockResults] = useState<MockResults>({});
  const [lessonKind, setLessonKind] = useState<'practice' | 'mock' | 'daily'>('practice');
  const [dailySeen, setDailySeen] = useState<DailySeen>({});
  const [dailyLog, setDailyLog] = useState<DailyLog>({});
  const [activeMock, setActiveMock] = useState('');
  const [pathwayOpen, setPathwayOpen] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [restoreNote, setRestoreNote] = useState('');
  const [order, setOrder] = useState<number[]>([]);
  const [seed, setSeed] = useState(1);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [complete, setComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongThisLesson, setWrongThisLesson] = useState<number[]>([]);
  const [hearts, setHearts] = useState(5);
  const [furigana, setFurigana] = useState(true);
  const [unlimitedHearts, setUnlimitedHearts] = useState(false);
  const [sound, setSound] = useState(true);
  const [voiceUri, setVoiceUri] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  // Nothing may be written back to localStorage until the saved values have been
  // read in, or the first render's defaults overwrite the user's preferences.
  const hydrated = useRef(false);

  const bank = questionBank[level];
  const current: Question | undefined = bank[order[step]];
  const details = levelDetails[level];
  const mascot = levelMascots[level];
  const xp = xpByLevel[level];
  const levelMissed = useMemo(() => missed[level] ?? [], [missed, level]);
  const japaneseVoices = useMemo(() => rankJapaneseVoices(voices), [voices]);
  const outOfHearts = lessonKind !== 'mock' && !unlimitedHearts && hearts === 0;

  /* Shuffle this question's options, and map the authored answer onto its new slot. */
  const view = useMemo(() => {
    if (!current) return null;
    const perm = permutation(current.options.length, seed + step * 7919);
    return {
      options: perm.map((i) => current.options[i]),
      optionNotes: current.optionNotes ? perm.map((i) => current.optionNotes?.[i] ?? '') : undefined,
      answer: perm.indexOf(current.answer),
    };
  }, [current, seed, step]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const settings = read<SavedSettings>('kuma-settings', { furigana: true, unlimitedHearts: false, voiceUri: '', sound: true });
      setLevel(readLevel());
      setXpByLevel(read('kuma-xp', initialXp));
      setStreak(read<Streak>('kuma-streak', { last: '', count: 0 }));
      setMissed(read<Missed>('kuma-missed', {}));
      setMasteryScores(read<MasteryScores>('kuma-mastery-scores', {}));
      setMockResults(read<MockResults>('kuma-mock-results', {}));
      setDailySeen(read<DailySeen>('kuma-daily-seen', {}));
      setDailyLog(read<DailyLog>('kuma-daily-log', {}));
      setFurigana(settings.furigana);
      setUnlimitedHearts(settings.unlimitedHearts);
      setVoiceUri(settings.voiceUri);
      setSound(settings.sound);
      setSfxEnabled(settings.sound);
      hydrated.current = true;
    });
    const loadVoices = () => setVoices(window.speechSynthesis?.getVoices() ?? []);
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.cancelAnimationFrame(frame);
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  useEffect(() => {
    setSfxEnabled(sound);
    if (!hydrated.current) return;
    window.localStorage.setItem('kuma-settings', JSON.stringify({ furigana, unlimitedHearts, voiceUri, sound }));
  }, [furigana, unlimitedHearts, voiceUri, sound]);

  const closeLesson = useCallback(() => {
    stopNarration();
    setPlaying(false);
    setLessonOpen(false);
  }, []);

  /* Both overlays are real modals: Escape closes, Tab stays inside, focus returns. */
  useEffect(() => {
    const open = lessonOpen || settingsOpen || profileOpen;
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (profileOpen) setProfileOpen(false);
        else if (settingsOpen) setSettingsOpen(false);
        else closeLesson();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), select, summary, [href]');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [lessonOpen, settingsOpen, profileOpen, closeLesson]);

  const chooseLevel = (next: Level) => {
    playSfx('select');
    setLevel(next);
    window.localStorage.setItem('kuma-level', next);
  };

  const showPathway = () => {
    playSfx('open');
    setPathwayOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Build a run: optionally one skill only, and always lead with what you got wrong last time. */
  const openLesson = (types?: QuestionType[], itemTypes?: string[], questionIndices?: number[]) => {
    unlockAudio();
    playSfx('open');
    const previously = missed[level] ?? [];
    const indices = bank
      .map((question, index) => ({ question, index }))
      .filter(({ question, index }) => (!types || types.includes(question.type)) && (!itemTypes || itemTypes.includes(question.itemType)) && (!questionIndices || questionIndices.includes(index)))
      .map(({ index }) => index)
      .sort((a, b) => {
        const missedPriority = Number(previously.includes(b)) - Number(previously.includes(a));
        if (missedPriority) return missedPriority;
        return (masteryScores[level]?.[String(a)] ?? 0) - (masteryScores[level]?.[String(b)] ?? 0);
      });
    if (!indices.length) return;
    setLessonKind('practice');
    setActiveMock('');
    setOrder(indices);
    setSeed((value) => value + 1);
    setStep(0); setSelected(null); setChecked(false); setComplete(false);
    setCorrectCount(0); setWrongThisLesson([]); setHearts(5); setHasPlayed(false);
    setLessonOpen(true);
  };

  /** Replay the run that just ended. openLesson() with no arguments would rebuild
   *  from the whole level bank, which is now hundreds of questions long. */
  const retryLesson = () => {
    unlockAudio();
    playSfx('open');
    setSeed((value) => value + 1);
    setStep(0); setSelected(null); setChecked(false); setComplete(false);
    setCorrectCount(0); setWrongThisLesson([]); setHearts(5); setHasPlayed(false);
  };

  /**
   * Daily mode — a ten-question mixed stage, two from each section.
   *
   * Ranking is mastery first, then how often the item has appeared before. That
   * gives both halves of what daily mode promises: an item you have not finished
   * keeps coming back until it is mastered, while everything else rotates so two
   * runs on the same day are not the same ten questions. Because mastered items
   * sink to the bottom, running daily repeatedly walks the whole bank.
   */
  const openDaily = () => {
    const seen = dailySeen[level] ?? {};
    const scores = masteryScores[level] ?? {};
    const random = mulberry32(Date.now() % 100000);
    const rank = (index: number) => ({
      index,
      score: scores[String(index)] ?? 0,
      times: seen[String(index)] ?? 0,
      jitter: random(),
    });
    const byPriority = (a: ReturnType<typeof rank>, b: ReturnType<typeof rank>) =>
      a.score - b.score || a.times - b.times || a.jitter - b.jitter;

    const picked: number[] = [];
    const taken = new Set<number>();

    // 1. Review: met before, not finished. Longest-unseen first, so this is
    //    spaced repetition rather than the same three items every run.
    const due = bank.map((_, index) => index)
      .filter((index) => (seen[String(index)] ?? 0) > 0 && (scores[String(index)] ?? 0) < 2)
      .map(rank)
      .sort((a, b) => a.score - b.score || b.times - a.times || a.jitter - b.jitter)
      .slice(0, DAILY_REVIEW_SLOTS);
    due.forEach((entry) => { picked.push(entry.index); taken.add(entry.index); });

    // 2. One slot per section that still has unfinished items, so every run
    //    really does span all five modes.
    for (const section of DAILY_SECTIONS) {
      if (picked.length >= DAILY_LENGTH) break;
      const pool = bank.map((question, index) => ({ question, index }))
        .filter(({ question, index }) => question.type === section && (scores[String(index)] ?? 0) < 2 && !taken.has(index))
        .map(({ index }) => rank(index))
        .sort(byPriority);
      if (!pool.length) continue;
      picked.push(pool[0].index);
      taken.add(pool[0].index);
    }

    // 3. Fill from whatever is furthest from mastery anywhere in the bank.
    //    Without this the small sections would recycle every few runs while 漢字
    //    crawled — they differ in size by more than an order of magnitude.
    const filler = bank.map((_, index) => index)
      .filter((index) => !taken.has(index))
      .map(rank)
      .sort(byPriority)
      .slice(0, Math.max(0, DAILY_LENGTH - picked.length));
    picked.push(...filler.map((entry) => entry.index));

    if (!picked.length) return;

    unlockAudio();
    playSfx('open');
    setLessonKind('daily');
    setActiveMock('');
    // Interleave so the sections alternate rather than arriving in blocks.
    setOrder(permutation(picked.length, Date.now() % 100000).map((k) => picked[k]));
    setSeed((value) => value + 1);
    setStep(0); setSelected(null); setChecked(false); setComplete(false);
    setCorrectCount(0); setWrongThisLesson([]); setHearts(5); setHasPlayed(false);
    setLessonOpen(true);
  };

  const openMock = (form: number) => {
    const questionsPerFamily = 5;
    const offset = (form - 1) * questionsPerFamily;
    const indices = levelCurriculum.flatMap((family) => {
      const familyIndices = bank.map((question, index) => ({ question, index })).filter(({ question }) => question.itemType === family.itemType).map(({ index }) => index);
      return Array.from({ length: Math.min(questionsPerFamily, familyIndices.length) }, (_, part) => familyIndices[(offset + part) % familyIndices.length]);
    });
    if (!indices.length) return;
    unlockAudio();
    playSfx('open');
    setLessonKind('mock');
    setActiveMock(`form-${form}`);
    setOrder(indices);
    setSeed((value) => value + form * 101);
    setStep(0); setSelected(null); setChecked(false); setComplete(false);
    setCorrectCount(0); setWrongThisLesson([]); setHearts(5); setHasPlayed(false);
    setLessonOpen(true);
  };

  /** Download every stored key as one JSON file. Progress lives only in this
   *  browser, so this is the only way to move it to another device or keep it
   *  through a cache clear. */
  const saveProgress = () => {
    playSfx('select');
    const data: Record<string, unknown> = {};
    for (const key of STORAGE_KEYS) {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) data[key] = raw;
    }
    const payload = { format: BACKUP_FORMAT, savedAt: new Date().toISOString(), data };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `kuma-progress-${today()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setRestoreNote('Saved. Keep the file somewhere you can find it again.');
  };

  /** Restore from a file written by saveProgress. Only keys this app owns are
   *  written, and the page reloads afterwards so every piece of state is read
   *  back from storage rather than half-updated in memory. */
  const loadProgress = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.format !== BACKUP_FORMAT || typeof parsed.data !== 'object' || !parsed.data) {
        setRestoreNote('That file isn’t a Kuma progress save.');
        return;
      }
      const restored = STORAGE_KEYS.filter((key) => typeof parsed.data[key] === 'string');
      if (!restored.length) {
        setRestoreNote('That save file had nothing to restore.');
        return;
      }
      for (const key of restored) window.localStorage.setItem(key, parsed.data[key]);
      setRestoreNote(`Restored ${restored.length} of ${STORAGE_KEYS.length} records. Reloading…`);
      window.setTimeout(() => window.location.reload(), 700);
    } catch {
      setRestoreNote('Couldn’t read that file — is it the right JSON?');
    }
  };

  const playListening = () => {
    if (!current?.narration) return;
    setPlaying(true);
    setHasPlayed(true);
    playNarration(current, level, {
      basePath: BASE_PATH,
      voiceUri,
      voices,
      onEnd: () => setPlaying(false),
    });
  };

  const finishLesson = (finalCorrect: number, wrong: number[]) => {
    stopNarration();
    setPlaying(false);
    const gained = finalCorrect * 5;
    const nextXp = { ...xpByLevel, [level]: xp + gained };
    setXpByLevel(nextXp);
    window.localStorage.setItem('kuma-xp', JSON.stringify(nextXp));

    if (lessonKind === 'mock') {
      const nextResults: MockResults = { ...mockResults, [level]: { ...(mockResults[level] ?? {}), [activeMock]: { correct: finalCorrect, total: order.length, completedAt: new Date().toISOString() } } };
      setMockResults(nextResults);
      window.localStorage.setItem('kuma-mock-results', JSON.stringify(nextResults));
      setComplete(true);
      window.setTimeout(() => playSfx('complete'), 120);
      return;
    }

    // Missed questions persist and lead the next run — spaced repetition, cheaply.
    // Only the items this run actually asked about may be cleared.
    const attempted = new Set(order);
    const untouched = (missed[level] ?? []).filter((index) => !attempted.has(index));
    const nextMissed: Missed = { ...missed, [level]: [...untouched, ...wrong] };
    setMissed(nextMissed);
    window.localStorage.setItem('kuma-missed', JSON.stringify(nextMissed));

    // A question is mastered only after two correct lesson attempts. A miss
    // resets that streak, putting the item back at the front of spaced review.
    const wrongSet = new Set(wrong);
    const levelScores = { ...(masteryScores[level] ?? {}) };
    order.forEach((index) => {
      const key = String(index);
      levelScores[key] = wrongSet.has(index) ? 0 : Math.min(2, (levelScores[key] ?? 0) + 1);
    });
    const nextScores: MasteryScores = { ...masteryScores, [level]: levelScores };
    setMasteryScores(nextScores);
    window.localStorage.setItem('kuma-mastery-scores', JSON.stringify(nextScores));

    if (lessonKind === 'daily') {
      const counts = { ...(dailySeen[level] ?? {}) };
      order.forEach((index) => { counts[String(index)] = (counts[String(index)] ?? 0) + 1; });
      const nextSeen: DailySeen = { ...dailySeen, [level]: counts };
      setDailySeen(nextSeen);
      window.localStorage.setItem('kuma-daily-seen', JSON.stringify(nextSeen));

      const day = today();
      const previous = dailyLog[level];
      const nextLog: DailyLog = { ...dailyLog, [level]: { day, runs: previous?.day === day ? previous.runs + 1 : 1 } };
      setDailyLog(nextLog);
      window.localStorage.setItem('kuma-daily-log', JSON.stringify(nextLog));
    }

    const day = today();
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const nextStreak: Streak = streak.last === day
      ? streak
      : { last: day, count: streak.last === yesterday ? streak.count + 1 : 1 };
    setStreak(nextStreak);
    window.localStorage.setItem('kuma-streak', JSON.stringify(nextStreak));

    setComplete(true);
    window.setTimeout(() => playSfx('complete'), 120);
  };

  const continueLesson = () => {
    if (!current || !view) return;
    if (!checked) {
      if (selected === null) return;
      setChecked(true);
      const right = selected === view.answer;
      playSfx(right ? 'correct' : 'incorrect');
      if (right) setCorrectCount((value) => value + 1);
      else {
        setWrongThisLesson((value) => [...value, order[step]]);
        if (!unlimitedHearts) setHearts((value) => Math.max(0, value - 1));
      }
      return;
    }
    if (outOfHearts) return;
    stopNarration();
    setPlaying(false);
    if (step < order.length - 1) {
      playSfx('advance');
      setStep(step + 1); setSelected(null); setChecked(false); setHasPlayed(false);
    } else {
      finishLesson(correctCount, wrongThisLesson);
    }
  };

  /* Answer with the number keys, confirm with Enter — the way you'd sit an exam. */
  useEffect(() => {
    if (!lessonOpen || complete || !view) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < view.options.length && !checked) {
        event.preventDefault();
        playSfx('select');
        setSelected(index);
      } else if (event.key === 'Enter' && (document.activeElement as HTMLElement)?.tagName !== 'BUTTON') {
        event.preventDefault();
        continueLesson();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const totalXp = Object.values(xpByLevel).reduce((a, b) => a + b, 0);
  const levelMastered = Object.entries(masteryScores[level] ?? {}).filter(([, score]) => score >= 2).map(([index]) => Number(index));
  const levelCurriculum = curriculum.filter((stage) => stage.levels.includes(level));
  const pathTypePriority: Record<QuestionType, number> = { VOCABULARY: 0, GRAMMAR: 1, KANJI: 2, READING: 3, LISTENING: 4 };
  const levelPathStages = levelCurriculum.flatMap((stage) => {
    const indices = bank.map((question, index) => ({ question, index })).filter(({ question }) => question.itemType === stage.itemType).map(({ index }) => index);
    const chunks = lessonChunks(indices);
    return chunks.map((questionIndices, part) => ({ ...stage, questionIndices, part, parts: chunks.length, pathId: `${stage.id}-${part + 1}` }));
  }).sort((a, b) => {
    // Spread every skill across the whole journey. Comparing normalized part
    // positions prevents hundreds of kanji items from becoming one solid block.
    const progressA = (a.part + 0.5) / a.parts;
    const progressB = (b.part + 0.5) / b.parts;
    return progressA - progressB || pathTypePriority[a.type] - pathTypePriority[b.type];
  });
  const levelCompletedStages = levelPathStages.filter((stage) => stage.questionIndices.length >= MIN_UNIT_QUESTIONS && stage.questionIndices.every((index) => levelMastered.includes(index))).map((stage) => stage.pathId);
  const masteredCount = bank.reduce((n, _, index) => n + ((masteryScores[level]?.[String(index)] ?? 0) >= 2 ? 1 : 0), 0);
  const savedLevels = levels.map((item) => {
    const size = questionBank[item].length;
    const done = Object.values(masteryScores[item] ?? {}).filter((score) => score >= 2).length;
    return { level: item, done, size, percent: size ? Math.round((done / size) * 100) : 0, xp: xpByLevel[item] ?? 0 };
  });
  const dailyRunsToday = dailyLog[level]?.day === today() ? dailyLog[level]!.runs : 0;
  const curriculumComplete = bank.length > 0 && bank.every((_, index) => (masteryScores[level]?.[String(index)] ?? 0) >= 2);
  const skillProgress = skills.map((skill) => {
    const relevantStages = levelPathStages.filter((stage) => stage.type === skill.type);
    const relevantQuestions = bank.map((question, index) => ({ question, index })).filter(({ question }) => question.type === skill.type);
    const total = relevantStages.length;
    const done = relevantStages.filter((stage) => levelCompletedStages.includes(stage.pathId)).length;
    const mastered = relevantQuestions.filter(({ index }) => levelMastered.includes(index)).length;
    return { ...skill, total, done, percent: relevantQuestions.length ? Math.round((mastered / relevantQuestions.length) * 100) : 0 };
  });
  // Kanji can have far more individual items than the other sections. Treat all
  // five exam skills equally so “overall mastery” reflects balanced readiness.
  const overallProgress = skillProgress.length ? Math.round(skillProgress.reduce((sum, skill) => sum + skill.percent, 0) / skillProgress.length) : 0;
  const longOptions = (view?.options ?? []).some((option) => option.length > 11);
  const veiled = !!current?.revealAfterAudio && !hasPlayed;

  return (
    <main className="app-shell" style={{ '--level-accent': details.accent } as React.CSSProperties}>
      <header className="topbar">
        <a className="brand" href="#top" onClick={() => setPathwayOpen(false)} aria-label="Kuma no Ryoku welcome screen">
          <Image className="brand-logo" src={asset('/logo-kuma-cute-brush.png')} alt="Kuma no Ryoku — 熊の力" width={2153} height={556} priority />
        </a>
        <div className="top-stats" aria-label="Daily progress">
          <span title={streak.count ? `${streak.count}-day streak` : 'Finish a lesson to start a streak'}><Image className="top-stat-icon" src={asset('/ui-streak.webp')} alt="" width={160} height={160} /><b>{streak.count}</b></span>
          <span title="Total XP"><Image className="top-stat-icon" src={asset('/ui-points.webp')} alt="" width={160} height={160} /><b>{totalXp}</b></span>
          <button className="settings-button" onClick={() => { unlockAudio(); playSfx('select'); setSettingsOpen(true); }} aria-label="Open learning settings"><Image src={asset('/ui-settings.webp')} alt="" width={160} height={160} /></button>
          <button className="avatar" onClick={() => { unlockAudio(); playSfx('select'); setRestoreNote(''); setProfileOpen(true); }} aria-label="Open profile and saved progress"><Image src={asset('/ui-profile.webp')} alt="" width={160} height={160} /></button>
        </div>
      </header>

      <nav className="level-nav" aria-label="JLPT level">
        <span>Choose your level</span>
        <div>{levels.map((item) => <button key={item} className={level === item ? 'active' : ''} aria-pressed={level === item} onClick={() => chooseLevel(item)}>{item}</button>)}</div>
      </nav>

      {!pathwayOpen ? <><section id="top" className="hero">
        <div className="hero-copy">
          <span className="eyebrow">日本語能力試験 • {level}</span>
          <h1>{details.title.split(' ')[0]}<br /><em>{details.title.split(' ').slice(1).join(' ')}</em></h1>
          <p>{details.subtitle}. Build confidence with exam-shaped practice across grammar, kanji, vocabulary, reading and listening.</p>
          <p className="brand-pun"><b>熊の力</b>で、<b>能力試験</b>へ。<span>Kuma’s power for your Japanese proficiency journey.</span></p>
          <button className="primary-button" onClick={showPathway}>View {level} pathway <UiIcon name="arrow-right" /></button>
          <div className="today-line"><span>Today</span><div><i style={{ width: `${Math.min(100, (xp / 125) * 100)}%` }} /></div><b>{xp} XP</b></div>
        </div>

        <div className="mascot-card">
          <span className="speech-bubble">{level}も一緒に頑張ろう！<small>Let’s learn together!</small></span>
          <div className="sun" />
          <Image key={level} className="level-mascot" src={asset(mascot.src)} alt={mascot.alt} width={1024} height={1536} priority />
        </div>
      </section>

      <section className="skill-strip" aria-label="Course skills">
        {skills.map((skill) => {
          const icon = questionModeIcons[skill.type];
          return <div className="skill-item" key={skill.label}><span className={`skill-icon ${skill.color}`}><Image src={asset(icon.src)} alt="" width={160} height={160} /></span><div><b>{skill.label}</b><small>{level} practice</small></div></div>;
        })}
      </section>
      </> : <section id="top" className="pathway-home">
        <div className="pathway-heading">
          <button className="pathway-back" onClick={() => setPathwayOpen(false)}><UiIcon name="arrow-left" />Welcome</button>
          <div className="pathway-intro">
            <div>
              <span className="eyebrow">YOUR {level} LEARNING PATH</span>
              <h1>Master every part<br />of the <em>{level}</em>.</h1>
              <p>Complete every official JLPT item family for {level}, revisit weak questions, and finish with full exam-format coverage.</p>
            </div>
            <div className="overall-card">
              <div className="progress-ring" style={{ '--progress': `${overallProgress * 3.6}deg` } as React.CSSProperties}><span><b>{overallProgress}%</b><small>mastered</small></span></div>
              <div><small>BALANCED SKILL PROGRESS</small><b>{levelCompletedStages.length} of {levelPathStages.length} stages</b><p>Grammar, kanji, vocabulary, reading and listening count equally • {levelMastered.length}/{bank.length} items mastered{levelMissed.length ? ` • ${levelMissed.length} to review` : ''}</p></div>
            </div>
          </div>
        </div>

        <section className="daily-card" aria-label={`${level} daily mix`}>
          <span className="daily-mark" aria-hidden="true">日</span>
          <div className="daily-copy">
            <small>DAILY MIX • {DAILY_LENGTH} QUESTIONS</small>
            <h2>Today&rsquo;s ten</h2>
            <p>Every section in one stage, weighted towards whatever you are furthest from mastering. Anything unfinished comes back until it sticks, so the daily mix reaches the same mastery as the pathway by a different route.</p>
            <div className="daily-meter" role="img" aria-label={`${masteredCount} of ${bank.length} questions mastered`}>
              <i style={{ width: `${bank.length ? (masteredCount / bank.length) * 100 : 0}%` }} />
            </div>
            <small className="daily-stat">{masteredCount}/{bank.length} mastered{dailyRunsToday ? ` • ${dailyRunsToday} run${dailyRunsToday > 1 ? 's' : ''} today` : ''}</small>
          </div>
          <button className="daily-start" onClick={openDaily} disabled={bank.length < DAILY_LENGTH}>
            {dailyRunsToday ? 'Another round' : 'Start daily mix'}<UiIcon name="arrow-right" />
          </button>
        </section>

        <div className="mastery-grid" aria-label={`${level} skill progress`}>
          {skillProgress.map((skill) => {
            const icon = questionModeIcons[skill.type];
            return <article key={skill.type} className="mastery-card"><span className={`skill-icon ${skill.color}`}><Image src={asset(icon.src)} alt="" width={160} height={160} /></span><div><b>{skill.label}</b><small>{skill.done}/{skill.total} stages</small><div className="mastery-bar"><i style={{ width: `${skill.percent}%` }} /></div></div><strong>{skill.percent}%</strong></article>;
          })}
        </div>

        <div className="pathway-layout">
          <aside className="pathway-guide">
            <Image src={asset(mascot.src)} alt={mascot.alt} width={1024} height={1536} />
            <div><span>{level} guide</span><b>{overallProgress ? 'Keep climbing!' : 'Let’s begin!'}</b><small>熊の力で、一歩ずつ。</small></div>
          </aside>
          <div className="learning-path" aria-label={`${level} lesson pathway`}>
            {levelPathStages.map((unit, index) => {
              const unitQuestions = unit.questionIndices.map((questionIndex) => bank[questionIndex]);
              const unitDone = levelCompletedStages.includes(unit.pathId);
              const unitIcon = questionModeIcons[unit.type];
              return <article className={`pathway-unit pathway-${unit.type.toLowerCase()} ${unitDone ? 'completed' : ''}`} key={unit.pathId}>
                <span className="pathway-step">{unitDone ? '✓' : String(index + 1).padStart(2, '0')}</span>
                <div className="pathway-unit-icon"><Image src={asset(unitIcon.src)} alt="" width={160} height={160} /></div>
                <div><small>{unit.jp} • {unit.type === 'KANJI' ? 'VOCABULARY' : unit.type} • {unitQuestions.length} QUESTIONS</small><h2>{unit.title}{unit.parts > 1 ? ` ${unit.part + 1}` : ''}</h2><p>{unit.description}</p></div>
                <button disabled={unitQuestions.length < MIN_UNIT_QUESTIONS} aria-label={`Start ${unit.title}`} onClick={() => openLesson([unit.type], [unit.itemType], unit.questionIndices)}>{unitQuestions.length < MIN_UNIT_QUESTIONS ? 'Building bank' : unitDone ? 'Practise' : 'Learn'}{unitQuestions.length >= MIN_UNIT_QUESTIONS && <UiIcon name="arrow-right" />}</button>
              </article>;
            })}
            <section className={`mock-gate ${curriculumComplete ? 'unlocked' : ''}`} aria-label={`${level} full mock tests`}>
              <span className="mock-seal">{curriculumComplete ? '試' : '鍵'}</span>
              <div className="mock-copy"><small>FINAL CHECKPOINT</small><h2>Full {level} mock tests</h2><p>{curriculumComplete ? 'Your curriculum is mastered. Test every official item family without changing lesson mastery.' : `Master all ${bank.length} curriculum questions twice across separate attempts to unlock three complete mixed mock forms.`}</p></div>
              <div className="mock-forms">{[1, 2, 3].map((form) => {
                const result = mockResults[level]?.[`form-${form}`];
                return <button key={form} disabled={!curriculumComplete} onClick={() => openMock(form)}><span>Form {form}</span><b>{result ? `${result.correct}/${result.total}` : curriculumComplete ? 'Start test' : 'Locked'}</b></button>;
              })}</div>
            </section>
          </div>
        </div>
      </section>}

      {profileOpen && <div className="lesson-overlay" role="dialog" aria-modal="true" aria-label="Profile and saved progress">
        <div className="settings-panel profile-panel" ref={dialogRef} tabIndex={-1}>
          <header>
            <div><span className="eyebrow">YOUR PROGRESS</span><h2>Profile</h2></div>
            <button className="close-button" onClick={() => setProfileOpen(false)} aria-label="Close profile"><UiIcon name="close" /></button>
          </header>

          <p className="profile-lede">
            Everything is stored in this browser only — nothing is uploaded, and no account is needed.
            Clearing site data will erase it, so save a file before you do.
          </p>

          <div className="profile-figures">
            <div><small>TOTAL XP</small><b>{totalXp}</b></div>
            <div><small>STREAK</small><b>{streak.count} day{streak.count === 1 ? '' : 's'}</b></div>
            <div><small>DAILY MIX TODAY</small><b>{dailyRunsToday}</b></div>
          </div>

          <ul className="profile-levels">
            {savedLevels.map((entry) => (
              <li key={entry.level} className={entry.level === level ? 'current' : ''}>
                <b>{entry.level}</b>
                <div className="mastery-bar"><i style={{ width: `${entry.percent}%` }} /></div>
                <small>{entry.done}/{entry.size} mastered · {entry.xp} XP</small>
              </li>
            ))}
          </ul>

          <div className="profile-actions">
            <button className="save-settings" onClick={saveProgress}>Save progress to a file</button>
            <label className="load-progress">
              Load progress from a file
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) void loadProgress(file);
                }}
              />
            </label>
          </div>
          {restoreNote && <p className="profile-note" role="status">{restoreNote}</p>}
        </div>
      </div>}

      {settingsOpen && <div className="lesson-overlay" role="dialog" aria-modal="true" aria-label="Learning settings">
        <div className="settings-panel" ref={dialogRef} tabIndex={-1}>
          <header><div><span className="eyebrow">LEARNING PREFERENCES</span><h2>Settings</h2></div><button className="close-button" onClick={() => setSettingsOpen(false)} aria-label="Close settings"><UiIcon name="close" /></button></header>
          <div className="setting-row"><div className="setting-symbol"><Image src={asset('/settings-furigana.webp')} alt="" width={160} height={160} /></div><div><b>Show furigana</b><p>Display small readings above kanji during lessons. Words being tested stay unmarked.</p><span className="ruby-demo"><ruby>日本語<rt>{furigana ? 'にほんご' : ''}</rt></ruby></span></div><button className={`toggle ${furigana ? 'on' : ''}`} onClick={() => { setFurigana(!furigana); playSfx('select'); }} role="switch" aria-checked={furigana} aria-label="Show furigana"><i /></button></div>
          <div className="setting-row"><div className="setting-symbol heart-symbol"><Image src={asset('/settings-hearts.webp')} alt="" width={160} height={160} /></div><div><b>Unlimited hearts</b><p>Practice freely without losing hearts after mistakes.</p></div><button className={`toggle ${unlimitedHearts ? 'on' : ''}`} onClick={() => { setUnlimitedHearts(!unlimitedHearts); playSfx('select'); }} role="switch" aria-checked={unlimitedHearts} aria-label="Unlimited hearts"><i /></button></div>
          <div className="setting-row"><div className="setting-symbol sound-symbol"><Image src={asset('/settings-sound.webp')} alt="" width={160} height={160} /></div><div><b>Sound effects</b><p>Koto, wood block and bell tones as you answer. Never plays over listening audio.</p></div><button className={`toggle ${sound ? 'on' : ''}`} onClick={() => { const next = !sound; setSound(next); setSfxEnabled(next); if (next) { unlockAudio(); playSfx('correct'); } }} role="switch" aria-checked={sound} aria-label="Sound effects"><i /></button></div>
          <div className="setting-row voice-setting"><div className="setting-symbol voice-symbol"><Image src={asset('/settings-voice.webp')} alt="" width={160} height={160} /></div><div><b>Listening voice</b><p>Lessons use recorded audio. This voice is the fallback if a clip can’t load.</p><select value={voiceUri} onChange={(event) => setVoiceUri(event.target.value)} aria-label="Japanese listening voice"><option value="">Best available Japanese voice</option>{japaneseVoices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}</select></div></div>
          <button className="save-settings" onClick={() => setSettingsOpen(false)}>Save preferences</button>
        </div>
      </div>}

      {lessonOpen && current && view && <div className="lesson-overlay" role="dialog" aria-modal="true" aria-label={`${level} practice lesson`}>
        <div className="lesson-window" ref={dialogRef} tabIndex={-1}>
          <header className="lesson-top">
            <button className="close-button" onClick={closeLesson} aria-label="Close lesson"><UiIcon name="close" /></button>
            <div className="lesson-progress" aria-label={`Question ${step + 1} of ${order.length}`}><i style={{ width: `${complete ? 100 : ((step + 1) / order.length) * 100}%` }} /></div>
            <span className="heart" aria-label={unlimitedHearts ? 'Unlimited hearts' : `${hearts} hearts left`}><UiIcon name="heart" /><b>{unlimitedHearts ? '∞' : hearts}</b></span>
          </header>

          {complete ? <div className="complete-card">
            <div className="celebration">祝</div>
            <span className="eyebrow">{level} {lessonKind === 'mock' ? 'MOCK TEST COMPLETE' : lessonKind === 'daily' ? 'DAILY MIX COMPLETE' : 'LESSON COMPLETE'}</span>
            <h2>{lessonKind === 'mock' ? 'Test complete!' : lessonKind === 'daily' ? 'Daily mix done!' : 'That was bear-y good!'}</h2>
            <p>{lessonKind === 'mock' ? 'Your test result is saved separately, so it does not change curriculum mastery.' : lessonKind === 'daily' ? 'This counts towards the same mastery meter as the pathway. Run it again for a fresh ten.' : 'You practised the same 大問 families the JLPT uses: 文字・語彙, 文法, 読解 and 聴解.'}</p>
            <div className="reward-row">
              <div><small>XP EARNED</small><b>+{correctCount * 5} XP</b></div>
              <div><small>SCORE</small><b>{correctCount} / {order.length}</b></div>
            </div>
            {lessonKind !== 'mock' && wrongThisLesson.length > 0 && <p className="review-note">Saved for next time: {wrongThisLesson.map((index) => bank[index].jpItemType).join('、')}</p>}
            <button className="primary-button" onClick={() => setLessonOpen(false)}>Back to my path <UiIcon name="arrow-right" /></button>
          </div> : outOfHearts && checked ? <div className="complete-card">
            <div className="celebration hearts-gone">再</div>
            <span className="eyebrow">OUT OF HEARTS</span>
            <h2>Let’s go again</h2>
            <p>You got {correctCount} of {step + 1} so far. Turn on unlimited hearts in settings if you’d rather practise without the limit.</p>
            <button className="primary-button" onClick={retryLesson}>Retry lesson <UiIcon name="replay" /></button>
            <button className="ghost-button" onClick={closeLesson}>Back to my path</button>
          </div> : <div className="question-wrap">
            <div className="question-meta">
              <span className={`question-mode-icon mode-${current.type.toLowerCase()}`}><Image src={asset(questionModeIcons[current.type].src)} alt={questionModeIcons[current.type].alt} width={44} height={44} /></span>
              <div className="question-label"><b>{current.itemType}</b><small lang="ja"><FuriganaText text={current.jpItemType} furigana={furigana} /></small></div>
              <small className="question-count">{level} • {step + 1}/{order.length}</small>
            </div>
            {veiled ? <h2 className="prompt-veiled"><FuriganaText text="まず 話を 聞いて ください。" furigana={furigana} /><small>Listen first — in <FuriganaText text="概要理解" furigana={furigana} /> the question comes after the audio.</small></h2> : <h2 lang="ja"><FuriganaText text={current.prompt} furigana={furigana} /></h2>}

            {current.type === 'LISTENING' && <div className="listening-scene">
              {current.image && <Image src={asset(current.image)} alt={current.imageAlt ?? ''} width={180} height={180} />}
              <button className={`listen-button ${playing ? 'playing' : ''}`} onClick={playListening} aria-label="Play Japanese listening prompt">
                <span>{playing ? <UiIcon name="pause" /> : <UiIcon name="play" />}</span>
                <div><b>{playing ? 'Playing…' : 'Play audio'}</b><small>{level === 'N1' || level === 'N2' ? 'Natural exam pace' : 'Clear learner pace'} • replay anytime</small></div>
              </button>
            </div>}

            {current.type !== 'LISTENING' && current.image && <figure className="scene-figure">
              <Image src={asset(current.image)} alt={current.imageAlt ?? ''} width={120} height={120} />
            </figure>}
            {current.passage && <div className="passage-card" lang="ja">{current.passage.map((line, index) => <p key={index}><JapaneseText tokens={line} furigana={furigana} /></p>)}</div>}
            {current.tokens && <div className="sentence-card" lang="ja"><JapaneseText tokens={current.tokens} furigana={furigana} /></div>}

            {!veiled && <div className={`answers ${longOptions ? 'stacked' : ''}`} role="group" aria-label="Answer options">
              {view.options.map((option, index) => {
                const state = checked
                  ? index === view.answer ? 'correct' : index === selected ? 'wrong' : ''
                  : selected === index ? 'selected' : '';
                return (
                  <button key={index} className={state} aria-pressed={selected === index} disabled={checked} onClick={() => { playSfx('select'); setSelected(index); }}>
                    <span>{index + 1}</span><em lang="ja"><FuriganaText text={option} furigana={furigana && current.type !== 'KANJI'} /></em>{checked && index === view.answer && <b>✓</b>}
                  </button>
                );
              })}
            </div>}

            {checked && <div className={`feedback ${selected === view.answer ? 'success' : 'retry'}`} role="status">
              <b>{selected === view.answer ? 'Correct! よくできました' : 'Not quite — here’s the clue'}</b>
              <p><FuriganaText text={current.note} furigana={furigana} /></p>
              {view.optionNotes && <ol className="option-explanations">{view.optionNotes.map((explanation, index) => <li key={index} className={index === view.answer ? 'is-answer' : ''}><span>{index + 1}</span><FuriganaText text={explanation} furigana={furigana} /></li>)}</ol>}
              {current.narration && <details><summary>Review listening transcript</summary>{current.narration.map((line, index) => <p key={index} lang="ja" className={`script-line speaker-${line.speaker}`}><FuriganaText text={line.text} furigana={furigana} /></p>)}</details>}
            </div>}

            {!outOfHearts && !veiled && <button className="check-button" disabled={selected === null} onClick={continueLesson}>
              {checked ? (step === order.length - 1 ? 'Finish lesson' : 'Continue') : 'Check answer'}
            </button>}
          </div>}
        </div>
      </div>}

      <footer>Curriculum follows the <a href="https://www.jlpt.jp/e/guideline/testsections.html" target="_blank" rel="noreferrer">official JLPT test-item composition</a> • Original Kuma level mascots • Question illustrations © <a href="https://www.irasutoya.com/" target="_blank" rel="noreferrer">いらすとや</a> • <span>Sources:</span> <a href="https://www.irasutoya.com/2014/06/blog-post_9691.html" target="_blank" rel="noreferrer">station</a>, <a href="https://www.irasutoya.com/2018/04/blog-post_59.html" target="_blank" rel="noreferrer">meeting</a>, <a href="https://www.irasutoya.com/2017/11/blog-post_639.html" target="_blank" rel="noreferrer">shopping</a>, <a href="https://www.irasutoya.com/2015/01/blog-post_8.html" target="_blank" rel="noreferrer">weather</a> • Kanji &amp; vocabulary data from <a href="http://www.edrdg.org/wiki/index.php/KANJIDIC_Project" target="_blank" rel="noreferrer">KANJIDIC</a> and <a href="https://www.edrdg.org/jmdict/j_jmdict.html" target="_blank" rel="noreferrer">JMdict</a> (© EDRDG, CC BY-SA 4.0) • Example sentences from <a href="https://tatoeba.org/" target="_blank" rel="noreferrer">Tatoeba</a> (CC BY 2.0 FR) • JLPT level assignments from <a href="http://www.tanos.co.uk/jlpt/" target="_blank" rel="noreferrer">Jonathan Waller’s JLPT Resources</a></footer>
    </main>
  );
}
