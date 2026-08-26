#!/usr/bin/env node
/**
 * Pre-renders every listening clip in the question bank to public/audio/<id>.m4a.
 *
 *   node scripts/generate-audio.mjs            # macOS `say` (default)
 *   node scripts/generate-audio.mjs --force    # re-render clips that already exist
 *   node scripts/generate-audio.mjs --backend=external
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
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { questionBank } from '../app/course-data.ts';

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
const pitchForSpeaker = { narrator: 42, a: 52, b: 34 };

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

const backends = { say: renderWithSay, external: renderWithExternal };

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

async function main() {
  const render = backends[backend];
  if (!render) throw new Error(`unknown backend "${backend}" (have: ${Object.keys(backends).join(', ')})`);

  await mkdir(outDir, { recursive: true });
  await mkdir(tmpDir, { recursive: true });

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
    await render(lines, level, outFile);
    const { size } = await stat(outFile);
    console.log(`  ✓     ${id}  (${(size / 1024).toFixed(0)} KB)`);
    made += 1;
  }

  // Anything left over is a clip whose question was renamed or removed.
  for (const file of await readdir(outDir)) {
    if (file.endsWith('.m4a') && !seen.has(file.replace(/\.m4a$/, ''))) {
      await rm(path.join(outDir, file));
      console.log(`  −     ${file} (orphaned)`);
    }
  }

  await rm(tmpDir, { recursive: true, force: true });
  console.log(`\n${made} clip(s) rendered via "${backend}", ${seen.size} total in public/audio.`);
}

main().catch((error) => { console.error(error.message); process.exit(1); });
