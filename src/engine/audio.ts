/** Procedural sound: no audio files needed. All sfx are tiny WebAudio recipes. */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxVol = 0.7;
let musicVol = 0.35;
let musicOn = false;
let musicTimer: number | undefined;

function ac() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = musicVol;
    musicGain.connect(master);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.2, when = 0, slideTo?: number, dest?: AudioNode) {
  const a = ac();
  const t = a.currentTime + when;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol * (dest ? 1 : sfxVol), t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest ?? master!);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(dur: number, vol = 0.2, when = 0, lp = 4000, hp = 200) {
  const a = ac();
  const t = a.currentTime + when;
  const buf = a.createBuffer(1, Math.max(1, Math.floor(a.sampleRate * dur)), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f1 = a.createBiquadFilter();
  f1.type = "lowpass";
  f1.frequency.value = lp;
  const f2 = a.createBiquadFilter();
  f2.type = "highpass";
  f2.frequency.value = hp;
  const g = a.createGain();
  g.gain.value = vol * sfxVol;
  src.connect(f1).connect(f2).connect(g).connect(master!);
  src.start(t);
}

const recipes: Record<string, () => void> = {
  click: () => tone(900, 0.04, "square", 0.05),
  hover: () => tone(1300, 0.025, "sine", 0.03),
  knock: () => [0, 0.16, 0.32].forEach((w) => { tone(140, 0.09, "triangle", 0.5, w, 70); noise(0.05, 0.25, w, 900, 80); }),
  knockShave: () => [0, 0.14, 0.24, 0.42, 0.62].forEach((w) => { tone(150, 0.08, "triangle", 0.45, w, 80); noise(0.04, 0.2, w, 900, 80); }),
  knockTap: () => [0, 0.2].forEach((w) => { tone(220, 0.05, "triangle", 0.28, w, 150); }),
  barge: () => { noise(0.25, 0.5, 0, 700, 60); tone(90, 0.25, "sawtooth", 0.3, 0, 40); },
  scooter: () => { tone(200, 0.6, "sawtooth", 0.12, 0, 600); noise(0.6, 0.08, 0, 2500, 800); },
  door: () => { tone(110, 0.3, "triangle", 0.25, 0, 70); noise(0.2, 0.12, 0, 800, 100); },
  stamp: () => { tone(110, 0.12, "square", 0.4, 0, 50); noise(0.1, 0.4, 0, 1200, 60); },
  paper: () => noise(0.18, 0.25, 0, 6000, 1500),
  flip: () => { noise(0.12, 0.2, 0, 7000, 2500); tone(500, 0.1, "sine", 0.06, 0, 900); },
  chime: () => [660, 880, 1320].forEach((f, i) => tone(f, 0.35, "sine", 0.18, i * 0.08)),
  good: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, "triangle", 0.2, i * 0.09)),
  bad: () => [330, 262, 196].forEach((f, i) => tone(f, 0.28, "triangle", 0.22, i * 0.13)),
  buzz: () => tone(110, 0.25, "sawtooth", 0.2, 0, 90),
  coin: () => { tone(988, 0.08, "square", 0.12); tone(1319, 0.2, "square", 0.12, 0.07); },
  ping: () => { tone(1568, 0.25, "sine", 0.15); tone(2093, 0.3, "sine", 0.1, 0.1); },
  ring: () => [0, 0.2, 0.6, 0.8].forEach((w) => tone(1400, 0.1, "square", 0.08, w)),
  sip: () => { noise(0.3, 0.25, 0, 1400, 300); tone(300, 0.2, "sine", 0.08, 0.05, 160); },
  whoosh: () => noise(0.35, 0.2, 0, 3000, 400),
  sprout: () => tone(400, 0.4, "sine", 0.12, 0, 1000),
  fanfare: () => [523, 523, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, "square", 0.12, i * 0.12)),
  tick: () => tone(1800, 0.02, "square", 0.04),
  confetti: () => { noise(0.4, 0.2, 0, 8000, 3000); [880, 1175, 1568].forEach((f, i) => tone(f, 0.18, "triangle", 0.14, i * 0.06)); },
};

export const sfx = {
  play(name: keyof typeof recipes | string) {
    try { recipes[name]?.(); } catch { /* audio unavailable */ }
  },
  setVolume(v: number) { sfxVol = v; },
  setMusicVolume(v: number) { musicVol = v; if (musicGain) musicGain.gain.value = v; },
};

// Soft pentatonic lo-fi loop, generated.
const scale = [0, 3, 5, 7, 10, 12, 15];
const chords = [[0, 7, 12], [5, 12, 17], [3, 10, 15], [7, 14, 19]];
let step = 0;
function musicStep() {
  if (!musicOn) return;
  const base = 220;
  const ch = chords[Math.floor(step / 8) % chords.length];
  if (step % 8 === 0) ch.forEach((n) => tone(base * Math.pow(2, (n - 12) / 12), 2.2, "sine", 0.12, 0, undefined, musicGain!));
  if (Math.random() < 0.55) {
    const n = scale[Math.floor(Math.random() * scale.length)];
    tone(base * Math.pow(2, n / 12), 0.7, "triangle", 0.07, 0, undefined, musicGain!);
  }
  step++;
}
export const music = {
  start() {
    if (musicOn) return;
    ac();
    musicOn = true;
    musicTimer = window.setInterval(musicStep, 520);
  },
  stop() {
    musicOn = false;
    if (musicTimer) clearInterval(musicTimer);
  },
  get on() { return musicOn; },
};
