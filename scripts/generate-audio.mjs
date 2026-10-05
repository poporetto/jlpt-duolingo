#!/usr/bin/env node
/**
 * Pre-renders every listening clip in the question bank to public/audio/<id>.m4a.
 *
 *   node scripts/generate-audio.mjs --backend=voicevox   # shipped voices
 *   node scripts/generate-audio.mjs                      # macOS `say` fallback
 *   node scripts/generate-audio.mjs --force              # re-render existing clips
 *
 * The shipped clips come from VOICEVOX. Start the engine first:
 *   docker run -d --name voicevox -p 50021:50021 \
 *     voicevox/voicevox_engine:cpu-arm64-ubuntu22.04-latest
 * Characters, credits and licence limits live in scripts/voicevox-voices.json.
 *
 * Why pre-render at all: the browser's speechSynthesis voice is a lottery — a
 * different voice, or none, on every OS/browser — and it cannot reproduce the
 * pauses that make exam audio sound like exam audio. A shipped file is identical
 * for every learner, works offline, and bakes the timing in.
 *
 * Swapping in a neural voice: set the `external` backend and TTS_CMD to any
 * command that writes a WAV/AIFF to $OUT given plain text on stdin, e.g. a
 * local Piper/VOICEVOX binary or a `curl` to a TTS API run from your machine.
 * Nothing here ever runs in the browser, so no API key is exposed.
 */
import { execFile } from 'node:child_process';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { questionBank } from '../app/course-data.ts';
import { pronounce } from './voicevox-readings.mjs';
import voices from './voicevox-voices.json' with { type: 'json' };

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'audio');
const tmpDir = path.join(root, '.audio-tmp');

const args = process.argv.slice(2);
const force = args.includes('--force');
const backend = (args.find((a) => a.startsWith('--backend=')) ?? '--backend=say').split('=')[1];

/** Words-per-minute per level. N5/N4 are deliberately slower than natural speech,
 *  which is how the real exam grades its own listening difficulty. */
const rateForLevel = { N5: 130, N4: 145, N3: 160, N2: 175, N1: 185 };

/** `say` pitch base per speaker, so a two-person dialogue is actually followable. */
const pitchForSpeaker = { narrator: 42, woman: 52, man: 34 };

/** macOS `say`: one call per clip, with [[slnc]] baking the pauses in. */
async function renderWithSay(lines, level, outFile) {
  const script = lines
    .map(({ speaker, text, pauseAfter }) => {
      const pitch = pitchForSpeaker[speaker] ?? 42;
      const pause = pauseAfter ? `[[slnc ${pauseAfter}]]` : '';
      return `[[pbas ${pitch}]]${text}${pause}`;
    })
    .join('');
  // Render losslessly first so the authored pauses survive, then compress to
  // mono AAC. Direct M4A output from `say` is uncompressed on current macOS
  // and makes the static GitHub Pages build hundreds of megabytes larger.
  const rawFile = path.join(tmpDir, `${path.basename(outFile, '.m4a')}.aiff`);
  await run('say', ['-v', 'Kyoko', '-r', String(rateForLevel[level] ?? 160), '-o', rawFile, script]);
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', rawFile, '-c:a', 'aac', '-b:a', '32k', '-ac', '1', '-ar', '22050', '-movflags', '+faststart', outFile]);
  await rm(rawFile, { force: true });
}

/** Any external engine. TTS_CMD receives the line's text on stdin and writes $OUT. */
async function renderWithExternal(lines, level, outFile) {
  const cmd = process.env.TTS_CMD;
  if (!cmd) throw new Error('--backend=external requires TTS_CMD (see the header comment)');
  const parts = [];
  for (const [i, line] of lines.entries()) {
    const part = path.join(tmpDir, `${path.basename(outFile, '.m4a')}-${i}.wav`);
    await run('sh', ['-c', cmd], { env: { ...process.env, OUT: part, SPEAKER: line.speaker, LEVEL: level, TEXT: line.text } });
    parts.push({ part, pauseAfter: line.pauseAfter ?? 0 });
  }
  // Concatenation is left to the engine's own toolchain; a single-line clip needs none.
  if (parts.length === 1) {
    await run('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '32000', '-s', '0', parts[0].part, outFile]);
    return;
  }
  throw new Error('external backend: multi-line clips need a concat step for your toolchain');
}

/* ---------------- VOICEVOX ---------------- */

const VOICEVOX_API = process.env.VOICEVOX_API ?? 'http://127.0.0.1:50021';

/** Target speaking rate in morae/second, excluding pauses. N5 is deliberately
 *  slower than natural speech, which is how the real exam grades difficulty. */
const moraeForLevel = { N5: 5.0, N4: 5.5, N3: 6.0, N2: 6.5, N1: 7.0 };

/** Length of one phrase-internal pause (the scripts' full-width spaces), per level. */
const phrasePauseForLevel = { N5: 0.45, N4: 0.4, N3: 0.35, N2: 0.3, N1: 0.28 };

/** Each character's own rate at speedScale 1.0, measured over 24 real narration
 *  lines (659 morae) with pause morae subtracted — the same arithmetic the
 *  renderer uses. A single reference sentence is not enough: it put No.7 at 9.09
 *  and left the two faster voices ~25% short of target. 九州そら runs ~26% slower
 *  than the others, so without this the woman drags in every dialogue. */
const baseRate = { 'No.7/アナウンス': 7.44, '九州そら/ノーマル': 5.5, '青山龍星/ノーマル': 6.92 };

async function vvPost(pathAndQuery, body) {
  const res = await fetch(VOICEVOX_API + pathAndQuery, {
    method: 'POST',
    ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  });
  if (!res.ok) throw new Error(`VOICEVOX ${pathAndQuery} -> ${res.status} ${await res.text()}`);
  return res;
}

/** Resolve "character/style" to a style id, failing loudly rather than guessing. */
async function voiceIds() {
  let speakers;
  try {
    speakers = await (await fetch(`${VOICEVOX_API}/speakers`)).json();
  } catch {
    throw new Error(`no VOICEVOX engine at ${VOICEVOX_API} — see the header comment for the docker command`);
  }
  const available = new Map();
  for (const sp of speakers) for (const st of sp.styles) available.set(`${sp.name}/${st.name}`, st.id);
  const ids = {};
  for (const [role, { style }] of Object.entries(voices.voices)) {
    const id = available.get(style);
    if (id === undefined) throw new Error(`engine has no voice "${style}" for ${role}`);
    if (!baseRate[style]) throw new Error(`no measured base rate for "${style}" — recalibrate before rendering`);
    ids[role] = { id, style };
  }
  return ids;
}

/** One narration line -> a wav buffer, with the level's rate and pauses applied. */
async function vvLine(line, level, ids) {
  const voice = ids[line.speaker];
  if (!voice) throw new Error(`no voice configured for speaker "${line.speaker}"`);
  const { text, expect } = pronounce(line.text);
  const query = await (await vvPost(`/audio_query?speaker=${voice.id}&text=${encodeURIComponent(text)}`)).json();

  // Assert every pronunciation override actually took, so a dictionary change in
  // a future engine build fails the render instead of shipping a wrong reading.
  const flat = query.kana.replace(/['\/_、]/g, '');
  for (const e of expect) {
    if (!flat.includes(e.requires)) throw new Error(`reading override did not take (${e.why}): ${query.kana}`);
  }

  const scale = moraeForLevel[level] / baseRate[voice.style];
  query.speedScale = scale;
  // Every silence is divided by speedScale at synthesis time, so pre-multiply to
  // get the absolute pause we actually want. Pause length is also a per-character
  // property (~3x longer for 九州そら), which would otherwise make her lines drag.
  for (const phrase of query.accent_phrases) {
    if (phrase.pause_mora) phrase.pause_mora.vowel_length = (phrasePauseForLevel[level] ?? 0.3) * scale;
  }
  query.prePhonemeLength = 0;
  query.postPhonemeLength = ((line.pauseAfter ?? 0) / 1000) * scale;
  const wav = await vvPost(`/synthesis?speaker=${voice.id}`, query);
  return Buffer.from(await wav.arrayBuffer());
}

async function renderWithVoicevox(lines, level, outFile, ids) {
  const parts = [];
  for (const line of lines) parts.push(await vvLine(line, level, ids));
  // /connect_waves takes a JSON array of base64 wavs (not multipart) and splices
  // them without re-encoding, so the authored pauses survive intact.
  const joined = parts.length === 1
    ? parts[0]
    : Buffer.from(await (await vvPost('/connect_waves', parts.map((b) => b.toString('base64')))).arrayBuffer());
  const rawFile = path.join(tmpDir, `${path.basename(outFile, '.m4a')}.wav`);
  await writeFile(rawFile, joined);
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', rawFile, '-c:a', 'aac', '-b:a', '32k', '-ac', '1', '-ar', '22050', '-movflags', '+faststart', outFile]);
  await rm(rawFile, { force: true });
}

const backends = { say: renderWithSay, external: renderWithExternal, voicevox: renderWithVoicevox };

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

async function main() {
  const render = backends[backend];
  if (!render) throw new Error(`unknown backend "${backend}" (have: ${Object.keys(backends).join(', ')})`);

  await mkdir(outDir, { recursive: true });
  await mkdir(tmpDir, { recursive: true });
  const ids = backend === 'voicevox' ? await voiceIds() : null;
  if (ids) {
    for (const [role, v] of Object.entries(ids)) console.log(`  voice ${role.padEnd(8)} ${v.style} (id ${v.id})`);
  }

  const clips = Object.entries(questionBank).flatMap(([level, questions]) =>
    questions.filter((q) => q.audio && q.narration).map((q) => ({ level, id: q.audio, lines: q.narration })),
  );

  const seen = new Set();
  let made = 0;
  for (const { level, id, lines } of clips) {
    if (seen.has(id)) throw new Error(`duplicate audio id "${id}"`);
    seen.add(id);
    const outFile = path.join(outDir, `${id}.m4a`);
    if (!force && (await exists(outFile))) { console.log(`  skip  ${id}`); continue; }
    await render(lines, level, outFile, ids);
    const { size } = await stat(outFile);
    console.log(`  ✓     ${id}  (${(size / 1024).toFixed(0)} KB)`);
    made += 1;
  }

  // Anything left over is a clip whose question was renamed or removed. Only
  // sweep once every expected clip is on disk: a script id is content-hashed, so
  // an interrupted re-render leaves the whole bank looking orphaned, and deleting
  // then would ship a bank with missing audio.
  const missing = [];
  for (const id of seen) if (!(await exists(path.join(outDir, `${id}.m4a`)))) missing.push(id);
  if (missing.length) {
    console.log(`\n  skipping orphan sweep: ${missing.length} expected clip(s) not rendered (e.g. ${missing.slice(0, 3).join(', ')})`);
  } else {
    for (const file of await readdir(outDir)) {
      if (file.endsWith('.m4a') && !seen.has(file.replace(/\.m4a$/, ''))) {
        await rm(path.join(outDir, file));
        console.log(`  −     ${file} (orphaned)`);
      }
    }
  }

  await rm(tmpDir, { recursive: true, force: true });
  console.log(`\n${made} clip(s) rendered via "${backend}", ${seen.size} total in public/audio.`);
}

main().catch((error) => { console.error(error.message); process.exit(1); });
