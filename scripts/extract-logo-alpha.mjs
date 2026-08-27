#!/usr/bin/env node
import sharp from 'sharp';

const [, , input, output] = process.argv;
if (!input || !output) throw new Error('usage: extract-logo-alpha input.png output.png');

const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const pixels = info.width * info.height;
const candidate = new Uint8Array(pixels);
const visited = new Uint8Array(pixels);

for (let pixel = 0; pixel < pixels; pixel += 1) {
  const offset = pixel * 3;
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const minimum = Math.min(r, g, b);
  const maximum = Math.max(r, g, b);
  candidate[pixel] = minimum > 224 && maximum - minimum < 13 ? 1 : 0;
}

const transparent = new Uint8Array(pixels);
const queue = new Int32Array(pixels);

for (let start = 0; start < pixels; start += 1) {
  if (!candidate[start] || visited[start]) continue;
  let head = 0;
  let tail = 0;
  queue[tail++] = start;
  visited[start] = 1;
  while (head < tail) {
    const pixel = queue[head++];
    const x = pixel % info.width;
    const neighbours = [pixel - info.width, pixel + info.width, pixel - 1, pixel + 1];
    for (const next of neighbours) {
      if (next < 0 || next >= pixels || visited[next] || !candidate[next]) continue;
      if ((next === pixel - 1 && x === 0) || (next === pixel + 1 && x === info.width - 1)) continue;
      visited[next] = 1;
      queue[tail++] = next;
    }
  }
  // Large regions are the generated checkerboard. Small enclosed regions are
  // legitimate highlights in the eyes, muzzle, or painted lettering.
  if (tail > 64) for (let index = 0; index < tail; index += 1) transparent[queue[index]] = 1;
}

const rgba = Buffer.alloc(pixels * 4);
for (let pixel = 0; pixel < pixels; pixel += 1) {
  const source = pixel * 3;
  const target = pixel * 4;
  rgba[target] = data[source];
  rgba[target + 1] = data[source + 1];
  rgba[target + 2] = data[source + 2];
  rgba[target + 3] = transparent[pixel] ? 0 : 255;
}

await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
  .extend({ top: 24, right: 24, bottom: 24, left: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(output);
