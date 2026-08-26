import type { Level, NarrationLine } from './course-data';

/* ------------------------------------------------------------------ *
 * Sound effects
 *
 * Everything here is synthesised at runtime — no sample files, nothing to
 * download. The palette is deliberately 和: a hyoshigi wood clack, a plucked
 * koto string (Karplus–Strong), a suzu shimmer, a muted taiko for a wrong
 * answer (a buzzer is the cheap thing), and a rin bowl at the end of a lesson.
 * Pitched sounds sit on the 陽音階 (yo) pentatonic, so anything that overlaps
 * stays consonant. Everything runs through a small generated reverb, which is
 * most of what separates "designed" from "beepy".
 * ------------------------------------------------------------------ */

export type SfxName = 'select' | 'correct' | 'incorrect' | 'advance' | 'complete' | 'open';

/** 陽音階 on D — bright, folk-flavoured, unmistakably Japanese. */
const YO = { D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0, B5: 987.77, D6: 1174.66, D4: 293.66 };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: ConvolverNode | null = null;
let enabled = true;
const pluckCache = new Map<string, AudioBuffer>();

export function setSfxEnabled(on: boolean) {
  enabled = on;
}

/** Build a short exponential-decay noise impulse: a cheap hall, no asset needed. */
function makeImpulse(context: AudioContext, seconds: number, decay: number) {
  const length = Math.floor(context.sampleRate * seconds);
  const impulse = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
  }
  return impulse;
}

/**
 * Create the AudioContext lazily, inside a real user gesture. Constructing it on
 * mount lands it in `suspended` and every sound is silently inaudible.
 */
export function unlockAudio() {
  if (typeof window === 'undefined') return;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse(ctx, 1.4, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.28;
    reverb.connect(wet).connect(master);
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

/** Karplus–Strong pluck, rendered once per pitch and cached. Reads as a koto. */
function pluckBuffer(context: AudioContext, freq: number, seconds: number, damping: number) {
  const key = `${freq}|${seconds}|${damping}`;
  const cached = pluckCache.get(key);
  if (cached) return cached;

  const rate = context.sampleRate;
  const n = Math.max(2, Math.round(rate / freq));
  const total = Math.floor(rate * seconds);
  const buffer = context.createBuffer(1, total, rate);
  const out = buffer.getChannelData(0);

  // Excite with lowpassed noise — raw white noise sounds like a rubber band.
  const line = new Float32Array(n);
  let previous = 0;
  for (let i = 0; i < n; i += 1) {
    previous = (previous + (Math.random() * 2 - 1)) * 0.5;
    line[i] = previous;
  }

  for (let i = 0; i < total; i += 1) {
    const index = i % n;
    out[i] = line[index];
    line[index] = (line[index] + line[(index + 1) % n]) * 0.5 * damping;
  }
  // Fade the tail so the buffer never ends on a click.
  const fade = Math.min(total, Math.floor(rate * 0.05));
  for (let i = 0; i < fade; i += 1) out[total - 1 - i] *= i / fade;

  pluckCache.set(key, buffer);
  return buffer;
}

function connect(node: AudioNode, gain: GainNode) {
  gain.connect(master!);
  gain.connect(reverb!);
  node.connect(gain);
}

function pluck(freq: number, at: number, level: number, seconds = 1.6, damping = 0.996) {
  const source = ctx!.createBufferSource();
  source.buffer = pluckBuffer(ctx!, freq, seconds, damping);
  const tone = ctx!.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 3200;
  const gain = ctx!.createGain();
  gain.gain.value = level;
  source.connect(tone);
  connect(tone, gain);
  source.start(at);
}

/** Inharmonic partials with long tails — a struck metal bell rather than a sine beep. */
function bell(freq: number, at: number, level: number, seconds: number) {
  [1, 2.76, 5.4, 8.93].forEach((ratio, index) => {
    const osc = ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * ratio;
    const gain = ctx!.createGain();
    const peak = level / (index + 1.6) ** 1.35;
    const tail = seconds / (index * 0.55 + 1);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + tail);
    connect(osc, gain);
    osc.start(at);
    osc.stop(at + tail + 0.05);
  });
}

/** Filtered noise burst — the body of a wood clack or a paper-screen slide. */
function noise(at: number, seconds: number, level: number, type: BiquadFilterType, freq: number, q: number) {
  const length = Math.floor(ctx!.sampleRate * seconds);
  const buffer = ctx!.createBuffer(1, length, ctx!.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = ctx!.createBufferSource();
  source.buffer = buffer;
  const filter = ctx!.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = ctx!.createGain();
  gain.gain.setValueAtTime(level, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
  source.connect(filter);
  connect(filter, gain);
  source.start(at);
}

const voices: Record<SfxName, (t: number) => void> = {
  // 拍子木 — two hardwood blocks. Very short, very quiet: it must not tire.
  select: (t) => {
    noise(t, 0.045, 0.35, 'bandpass', 2100, 5);
    noise(t, 0.11, 0.09, 'bandpass', 780, 9);
  },
  // Koto pluck a fifth up, with a suzu shimmer riding on top.
  correct: (t) => {
    pluck(YO.A5, t, 0.3);
    pluck(YO.D6, t + 0.055, 0.16);
    bell(YO.D6 * 2, t + 0.02, 0.05, 1.1);
  },
  // Muted taiko: a pitch-dropping body, not a buzzer. Disappointment, not punishment.
  incorrect: (t) => {
    const osc = ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(104, t);
    osc.frequency.exponentialRampToValueAtTime(58, t + 0.34);
    const gain = ctx!.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.42, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    connect(osc, gain);
    osc.start(t);
    osc.stop(t + 0.45);
    noise(t, 0.05, 0.06, 'lowpass', 900, 1);
  },
  // A single low string for "next" — present, but under the reading voice.
  advance: (t) => pluck(YO.D5, t, 0.17, 1.1, 0.993),
  // 鈴 bowl plus a rising pentatonic run. The one moment allowed to ring out.
  complete: (t) => {
    bell(YO.D4, t, 0.3, 3.6);
    [YO.D5, YO.E5, YO.G5, YO.A5, YO.D6].forEach((freq, index) => pluck(freq, t + 0.14 + index * 0.105, 0.2));
    bell(YO.D6, t + 0.62, 0.07, 2.4);
  },
  // 襖 sliding open.
  open: (t) => noise(t, 0.33, 0.09, 'bandpass', 1500, 1.1),
};

export function playSfx(name: SfxName) {
  if (!enabled || typeof window === 'undefined') return;
  // A clack over the narration is mud — let the listening audio own the channel.
  if (isNarrating()) return;
  unlockAudio();
  if (!ctx || !master || ctx.state !== 'running') return;
  voices[name](ctx.currentTime + 0.005);
}

/* ------------------------------------------------------------------ *
 * Listening playback
 * ------------------------------------------------------------------ */

/** Pre-rendered clips first; speechSynthesis is the fallback when one is missing. */
let element: HTMLAudioElement | null = null;
let speechTimer: number | null = null;
let speaking = false;

export function isNarrating() {
  return speaking || (typeof window !== 'undefined' && !!window.speechSynthesis?.speaking);
}

export function stopNarration() {
  speaking = false;
  if (speechTimer !== null) { window.clearTimeout(speechTimer); speechTimer = null; }
  window.speechSynthesis?.cancel();
  if (element) { element.pause(); element.currentTime = 0; }
}

/**
 * Voices vary wildly in quality. Neural network voices (Google's, Microsoft's
 * Nanami/Keita) sound markedly better than the older local ones, so rank rather
 * than take whatever `getVoices()` happens to list first.
 */
const VOICE_RANK = ['google 日本語', 'google japanese', 'nanami', 'keita', 'ayumi', 'haruka', 'ichiro', 'o-ren', 'hattori', 'kyoko', 'otoya'];

export function rankJapaneseVoices(all: SpeechSynthesisVoice[]) {
  return all
    .filter((voice) => voice.lang.toLowerCase().startsWith('ja'))
    .map((voice) => {
      const name = voice.name.toLowerCase();
      const rank = VOICE_RANK.findIndex((known) => name.includes(known));
      return { voice, rank: rank === -1 ? VOICE_RANK.length : rank };
    })
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.voice);
}

const RATE: Record<Level, number> = { N5: 0.74, N4: 0.82, N3: 0.9, N2: 0.97, N1: 1.0 };
const PITCH: Record<NarrationLine['speaker'], number> = { narrator: 1.0, a: 1.14, b: 0.82 };

/** Walk the lines one at a time so the authored pauses actually happen. */
function speakLines(lines: NarrationLine[], level: Level, voice: SpeechSynthesisVoice | undefined, done: () => void) {
  let index = 0;
  const next = () => {
    if (!speaking) return;
    if (index >= lines.length) { speaking = false; done(); return; }
    const line = lines[index];
    index += 1;
    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.lang = 'ja-JP';
    utterance.rate = RATE[level];
    utterance.pitch = PITCH[line.speaker] ?? 1;
    if (voice) utterance.voice = voice;
    utterance.onend = () => { speechTimer = window.setTimeout(next, line.pauseAfter ?? 260); };
    utterance.onerror = () => { speaking = false; done(); };
    window.speechSynthesis.speak(utterance);
  };
  next();
}

export function playNarration(
  { audio, narration }: { audio?: string; narration?: NarrationLine[] },
  level: Level,
  { basePath = '', voiceUri = '', voices: available = [] as SpeechSynthesisVoice[], onEnd = () => {} } = {},
) {
  if (!narration?.length) return;
  stopNarration();
  speaking = true;

  const finish = () => { speaking = false; onEnd(); };

  const fallback = () => {
    if (!window.speechSynthesis) { finish(); return; }
    const chosen = available.find((voice) => voice.voiceURI === voiceUri) ?? rankJapaneseVoices(available)[0];
    speakLines(narration, level, chosen, finish);
  };

  if (!audio) { fallback(); return; }

  if (!element) element = new Audio();
  element.src = `${basePath}/audio/${audio}.m4a`;
  element.onended = finish;
  // A missing or unplayable file drops straight through to speechSynthesis.
  element.onerror = fallback;
  element.play().catch(fallback);
}
