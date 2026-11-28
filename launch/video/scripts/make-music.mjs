// Synthesises the launch video's music bed (no samples, so no licensing questions).
// 100 BPM, Am7 - Fmaj7 - Cmaj7 - G6, soft pad + kick + shaker + pluck arpeggio. Writes public/music.wav.
import { writeFileSync } from "node:fs";
const SR = 44100, DUR = 34, N = SR * DUR, BEAT = 0.6, BAR = BEAT * 4;
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[45, 57, 60, 64, 67], [41, 57, 60, 64, 65], [48, 55, 59, 64, 67], [43, 55, 59, 62, 64]]; // midi: bass + 4 voices
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 1; const noise = () => { seed = (seed * 16807) % 2147483647; return seed / 1073741823.5 - 1; };
let lpL = 0, lpR = 0, shLP = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR, bar = Math.floor(t / BAR), inBar = t - bar * BAR, ch = CHORDS[bar % 4], prev = CHORDS[(bar + 3) % 4];
  const xf = Math.min(1, inBar / 0.35); // crossfade from the previous chord
  let padL = 0, padR = 0;
  for (const [c, w] of [[ch, xf], [prev, 1 - xf]]) {
    if (w <= 0) continue;
    for (let v = 1; v < c.length; v++) {
      const f = hz(c[v]);
      padL += w * (Math.sin(2 * Math.PI * f * 0.998 * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t)) / 4;
      padR += w * (Math.sin(2 * Math.PI * f * 1.002 * t + 0.7) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t + 0.3)) / 4;
    }
    const b = w * 0.55 * Math.sin(2 * Math.PI * hz(c[0]) * t) * (0.7 + 0.3 * Math.exp(-3 * (t % BEAT)));
    padL += b; padR += b;
  }
  const swell = 0.8 + 0.2 * Math.sin(2 * Math.PI * t / BAR - Math.PI / 2);
  padL *= 0.16 * swell; padR *= 0.16 * swell;
  // kick on every beat after the intro
  const kb = t % BEAT, kick = t > 2.4 ? 0.5 * Math.sin(2 * Math.PI * (48 + 90 * Math.exp(-kb * 30)) * kb) * Math.exp(-kb * 9) : 0;
  // shaker on the off-beats
  const ob = (t + BEAT / 2) % BEAT; shLP += 0.35 * (noise() - shLP);
  const shaker = t > 4.8 ? 0.06 * (noise() - shLP) * Math.exp(-ob * 40) : 0;
  // pluck arpeggio on eighth notes
  const e = t % (BEAT / 2), step = Math.floor(t / (BEAT / 2)) % 8, note = ch[1 + [0, 1, 2, 3, 2, 1, 3, 2][step]] + 12;
  const pluck = t > 9.6 && t < 31 ? 0.07 * Math.sin(2 * Math.PI * hz(note) * t) * Math.exp(-e * 11) : 0;
  let l = padL + kick + shaker * 0.8 + pluck * 0.9, r = padR + kick + shaker * 1.2 + pluck * 1.1;
  lpL += 0.32 * (l - lpL); lpR += 0.32 * (r - lpR); // gentle low-pass
  const fade = Math.min(1, t / 1.5, (DUR - t) / 2.5);
  L[i] = lpL * fade; R[i] = lpR * fade;
}
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 0.7 / peak, buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(L[i] * gain * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * gain * 32767), 46 + i * 4); }
writeFileSync(new URL("../public/music.wav", import.meta.url), buf);
console.log(`music.wav: ${DUR}s, peak normalised`);
