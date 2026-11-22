// A small lo-fi hip-hop generator built on the Web Audio API.
// Everything is synthesised in the browser (no audio files, no licensing questions):
// jazzy electric-piano chords, a round sine bass, a soft swung drum kit, vinyl crackle and tape wobble.

const BPM = 74;
const STEP = 60 / BPM / 4; // one 16th note in seconds
const SWING = 0.18; // delay applied to off-beat 16ths, as a fraction of a 16th
const LOOKAHEAD = 0.14;

// Four-bar progression in D minor (Dm9 – G13 – Cmaj9 – A7♭13), voiced in the middle register.
const CHORDS = [
  { bass: 38, notes: [53, 57, 60, 64, 65] },
  { bass: 43, notes: [53, 59, 64, 69] },
  { bass: 36, notes: [52, 55, 59, 62, 64] },
  { bass: 45, notes: [55, 61, 65, 67] },
];
const MELODY = [62, 65, 67, 69, 72, 74, 77]; // D minor pentatonic-ish

const midi = (note) => 440 * Math.pow(2, (note - 69) / 12);

function noiseBuffer(context, seconds, shape = (value) => value) {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = shape(Math.random() * 2 - 1, i, length);
  return buffer;
}

class LofiEngine {
  constructor() {
    this.context = null;
    this.playing = false;
    this.timer = 0;
    this.step = 0;
    this.nextTime = 0;
    this.listeners = new Set();
  }

  build() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    this.context = context;

    // Master chain: music bus → tape wobble → warm low-pass → glue compressor → volume → speakers.
    this.master = context.createGain();
    this.master.gain.value = 0;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.25;
    this.tone = context.createBiquadFilter();
    this.tone.type = 'lowpass';
    this.tone.frequency.value = 2600;
    this.tone.Q.value = 0.4;
    const wobble = context.createDelay(0.05);
    wobble.delayTime.value = 0.012;
    const lfo = context.createOscillator();
    lfo.frequency.value = 0.55;
    const lfoDepth = context.createGain();
    lfoDepth.gain.value = 0.0016;
    lfo.connect(lfoDepth).connect(wobble.delayTime);
    lfo.start();

    this.bus = context.createGain();
    this.bus.gain.value = 0.9;
    this.bus.connect(wobble).connect(this.tone).connect(compressor).connect(this.master).connect(context.destination);

    // Echo for the melody.
    this.echo = context.createDelay(1);
    this.echo.delayTime.value = STEP * 6;
    const feedback = context.createGain();
    feedback.gain.value = 0.32;
    const echoTone = context.createBiquadFilter();
    echoTone.type = 'lowpass';
    echoTone.frequency.value = 1800;
    this.echo.connect(echoTone).connect(feedback).connect(this.echo);
    echoTone.connect(this.bus);

    // Shared noise buffers.
    this.noise = noiseBuffer(context, 1);
    this.crackle = noiseBuffer(context, 3, (value) => (Math.random() < 0.0009 ? value * 0.9 : value * 0.012));

    // Vinyl crackle and tape hiss run underneath everything.
    const crackle = context.createBufferSource();
    crackle.buffer = this.crackle;
    crackle.loop = true;
    const crackleFilter = context.createBiquadFilter();
    crackleFilter.type = 'highpass';
    crackleFilter.frequency.value = 900;
    const crackleGain = context.createGain();
    crackleGain.gain.value = 0.22;
    crackle.connect(crackleFilter).connect(crackleGain).connect(compressor);
    crackle.start();
  }

  on(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit() {
    this.listeners.forEach((listener) => listener(this.playing));
  }

  async start() {
    if (this.playing) return;
    if (!this.context) this.build();
    if (this.context.state === 'suspended') await this.context.resume();
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.5, now + 1.6);
    this.step = 0;
    this.nextTime = now + 0.08;
    this.playing = true;
    window.clearInterval(this.timer);
    this.timer = window.setInterval(() => this.schedule(), 25);
    this.emit();
  }

  stop() {
    if (!this.playing || !this.context) return;
    this.playing = false;
    window.clearInterval(this.timer);
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.5);
    const context = this.context;
    window.setTimeout(() => { if (!this.playing) context.suspend().catch(() => {}); }, 700);
    this.emit();
  }

  toggle() {
    if (this.playing) this.stop();
    else this.start();
  }

  schedule() {
    const context = this.context;
    while (this.nextTime < context.currentTime + LOOKAHEAD) {
      const step = this.step % 64;
      const swing = step % 2 === 1 ? SWING * STEP : 0;
      this.playStep(step, this.nextTime + swing);
      this.nextTime += STEP;
      this.step += 1;
    }
  }

  playStep(step, time) {
    const bar = Math.floor(step / 16);
    const inBar = step % 16;
    const chord = CHORDS[bar];
    // Drums: kick on 1 and the "and" of 3, snare on 2 and 4, soft swung hats.
    if (inBar === 0 || inBar === 10 || (inBar === 7 && bar % 2 === 1)) this.kick(time, inBar === 0 ? 0.9 : 0.65);
    if (inBar === 4 || inBar === 12) this.snare(time);
    if (inBar % 2 === 0) this.hat(time, inBar % 4 === 2 ? 0.05 : 0.03);
    else if (Math.random() < 0.25) this.hat(time, 0.018);
    // Chords: a gentle strum on the downbeat, a softer re-strike late in the bar.
    if (inBar === 0) this.chord(chord.notes, time, 0.075, STEP * 13);
    if (inBar === 14 && bar % 2 === 0) this.chord(chord.notes.slice(1), time, 0.04, STEP * 2.2);
    // Bass follows the root, with a passing note on the last beat.
    if (inBar === 0) this.bass(chord.bass, time, STEP * 7);
    if (inBar === 10) this.bass(chord.bass + (bar % 2 ? 7 : 12), time, STEP * 3);
    // A few melody notes, never the same twice in a row.
    if ((inBar === 6 || inBar === 9 || inBar === 13) && Math.random() < 0.45) {
      const note = MELODY[Math.floor(Math.random() * MELODY.length)];
      this.keys(note, time, STEP * 3, 0.05, true);
    }
  }

  chord(notes, time, gain, length) {
    notes.forEach((note, index) => this.keys(note, time + index * 0.022, length, gain / Math.sqrt(notes.length) * 1.6));
  }

  // Electric-piano style tone: sine fundamental plus a quiet bell partial and a slow tremolo.
  keys(note, time, length, gain, echo = false) {
    const context = this.context;
    const out = context.createGain();
    out.gain.setValueAtTime(0, time);
    out.gain.linearRampToValueAtTime(gain, time + 0.012);
    out.gain.exponentialRampToValueAtTime(gain * 0.45, time + 0.5);
    out.gain.exponentialRampToValueAtTime(0.0001, time + length + 0.4);
    const body = context.createOscillator();
    body.type = 'sine';
    body.frequency.value = midi(note);
    body.detune.value = (Math.random() - 0.5) * 8;
    const bell = context.createOscillator();
    bell.type = 'sine';
    bell.frequency.value = midi(note) * 4;
    const bellGain = context.createGain();
    bellGain.gain.setValueAtTime(0.12, time);
    bellGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    const warm = context.createOscillator();
    warm.type = 'triangle';
    warm.frequency.value = midi(note) * 2;
    const warmGain = context.createGain();
    warmGain.gain.value = 0.08;
    body.connect(out);
    bell.connect(bellGain).connect(out);
    warm.connect(warmGain).connect(out);
    out.connect(this.bus);
    if (echo) out.connect(this.echo);
    [body, bell, warm].forEach((osc) => { osc.start(time); osc.stop(time + length + 0.5); });
  }

  bass(note, time, length) {
    const context = this.context;
    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = midi(note);
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.32, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.12, time + length * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
    osc.connect(filter).connect(gain).connect(this.bus);
    osc.start(time);
    osc.stop(time + length + 0.05);
  }

  kick(time, level) {
    const context = this.context;
    const osc = context.createOscillator();
    osc.frequency.setValueAtTime(115, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.14);
    const gain = context.createGain();
    gain.gain.setValueAtTime(level * 0.75, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.38);
    osc.connect(gain).connect(this.bus);
    osc.start(time);
    osc.stop(time + 0.4);
  }

  snare(time) {
    const context = this.context;
    const noise = context.createBufferSource();
    noise.buffer = this.noise;
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1700;
    filter.Q.value = 0.7;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
    noise.connect(filter).connect(gain).connect(this.bus);
    noise.start(time, Math.random() * 0.5);
    noise.stop(time + 0.22);
    const body = context.createOscillator();
    body.frequency.setValueAtTime(190, time);
    body.frequency.exponentialRampToValueAtTime(120, time + 0.08);
    const bodyGain = context.createGain();
    bodyGain.gain.setValueAtTime(0.12, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
    body.connect(bodyGain).connect(this.bus);
    body.start(time);
    body.stop(time + 0.12);
  }

  hat(time, level) {
    const context = this.context;
    const noise = context.createBufferSource();
    noise.buffer = this.noise;
    const filter = context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6500;
    const gain = context.createGain();
    gain.gain.setValueAtTime(level, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
    noise.connect(filter).connect(gain).connect(this.bus);
    noise.start(time, Math.random() * 0.8);
    noise.stop(time + 0.06);
  }

  // A short two-tone chirp for the robot. Uses the same audio context, so it works once audio is unlocked.
  beep() {
    try {
      if (!this.context) this.build();
      const context = this.context;
      if (context.state === 'suspended') context.resume();
      const time = context.currentTime + 0.01;
      [880, 1320].forEach((frequency, index) => {
        const osc = context.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = frequency;
        const gain = context.createGain();
        gain.gain.setValueAtTime(0, time + index * 0.09);
        gain.gain.linearRampToValueAtTime(0.06, time + index * 0.09 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + index * 0.09 + 0.12);
        osc.connect(gain).connect(context.destination);
        osc.start(time + index * 0.09);
        osc.stop(time + index * 0.09 + 0.14);
      });
    } catch { /* audio unavailable */ }
  }
}

let engine = null;
export function getLofi() {
  if (typeof window === 'undefined') return null;
  if (!engine) engine = new LofiEngine();
  return engine;
}
