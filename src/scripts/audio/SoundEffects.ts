import type { AudioEngine } from "./AudioEngine";

// All sound is synthesized — no audio assets, nothing to license. Every
// helper plays a short envelope-shaped tone through one of the engine's mix
// buses, never straight to destination.
function playTone(
  context: AudioContext,
  destination: AudioNode,
  time: number,
  frequency: number,
  duration: number,
  type: OscillatorType,
  peakGain: number,
): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, time);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(peakGain, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  oscillator.connect(gain).connect(destination);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.02);
}

export function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

// A small additive piano model — the two cues that actually read as
// "struck string" rather than "synth pluck":
//
// 1. Inharmonicity: a real string is stiff, so its overtones sit slightly
//    SHARP of a pure harmonic series (n, 2n, 3n, ...), by an amount that
//    grows with the partial number. Pure integer multiples sound like an
//    organ; this stretch is what makes it sound like wire under tension.
// 2. A hammer strike: a very short burst of filtered noise at the onset,
//    under the tone itself — the percussive "thock" of a hammer hitting a
//    string, which a pure tone (however well-enveloped) never has.
//
// [harmonic number, relative gain, relative decay] — higher partials both
// quieter and shorter, which is why a piano's attack sounds "bright" and
// its tail sounds "mellow": the top end simply dies first.
const PIANO_PARTIALS: [number, number, number][] = [
  [1, 1.0, 1.0],
  [2, 0.52, 0.6],
  [3, 0.3, 0.42],
  [4, 0.16, 0.32],
  [5, 0.09, 0.24],
  [6, 0.05, 0.18],
  [8, 0.025, 0.12],
];
const INHARMONICITY = 0.00035; // string stiffness coefficient (piano ≈ 0.0001-0.001 depending on register)

function partialFrequency(fundamental: number, harmonic: number): number {
  return fundamental * harmonic * Math.sqrt(1 + INHARMONICITY * harmonic * harmonic);
}

// The hammer-strike transient: a few milliseconds of noise, bandpass-tuned
// near the string's own register, gone almost immediately.
function playHammerStrike(context: AudioContext, destination: AudioNode, time: number, fundamental: number, velocity: number): void {
  const duration = 0.012;
  const sampleCount = Math.max(1, Math.round(context.sampleRate * duration));
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
  }

  const source = context.createBufferSource();
  source.buffer = buffer;

  const bandpass = context.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = Math.min(6000, fundamental * 3);
  bandpass.Q.value = 0.7;

  const gain = context.createGain();
  gain.gain.setValueAtTime(velocity * 0.1, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  source.connect(bandpass).connect(gain).connect(destination);
  source.start(time);
  source.stop(time + duration + 0.01);
}

// The additive body of a struck note: one sine oscillator per (inharmonic)
// partial, each with its own gain envelope. `decayScale` stretches every
// partial's natural decay by the same factor — used to let a held chord
// ring for its full duration without changing what makes it sound like a
// piano (used at 1 for a plainly struck note).
function playPianoTone(
  context: AudioContext,
  destination: AudioNode,
  time: number,
  midiNote: number,
  velocity: number,
  decayScale: number,
): void {
  const fundamental = midiToFrequency(midiNote);

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 5200;
  filter.connect(destination);

  for (const [harmonic, relativeGain, relativeDecay] of PIANO_PARTIALS) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(partialFrequency(fundamental, harmonic), time);

    const peak = velocity * relativeGain * 0.5;
    const duration = 0.85 * relativeDecay * decayScale;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.004); // fast hammer-strike attack
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    oscillator.connect(gain).connect(filter);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.05);
  }
}

// The right hand — the melody, played live by the player turning
// (main.ts), one struck note at a time.
export function playPianoNote(engine: AudioEngine, time: number, midiNote: number, velocity: number): void {
  playPianoTone(engine.context, engine.piano, time, midiNote, velocity, 1);
  playHammerStrike(engine.context, engine.piano, time, midiToFrequency(midiNote), velocity);
}

// The left hand — the accompaniment (music/canonTimeline.ts's
// CANON_LEFT_HAND), on the SAME instrument as the melody, just chorded,
// quieter, and stretched to ring for the whole held duration rather than
// decaying like a single struck note.
export function playPianoChord(
  engine: AudioEngine,
  time: number,
  duration: number,
  midiNotes: number[],
  velocity: number,
): void {
  const decayScale = duration / 0.85;
  for (const midiNote of midiNotes) {
    playPianoTone(engine.context, engine.leftHand, time, midiNote, velocity * 0.55, decayScale);
    playHammerStrike(engine.context, engine.leftHand, time, midiToFrequency(midiNote), velocity * 0.4);
  }
}

// A brief filtered sweep and a mix duck rather than an instant cut — the run
// breaking instead of simply stopping.
export function playFall(engine: AudioEngine): void {
  const { context } = engine;
  const time = context.currentTime;

  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(160, time);
  oscillator.frequency.exponentialRampToValueAtTime(55, time + 0.25);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2200, time);
  filter.frequency.exponentialRampToValueAtTime(180, time + 0.25);

  gain.gain.setValueAtTime(0.12, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

  oscillator.connect(filter).connect(gain).connect(engine.master);
  oscillator.start(time);
  oscillator.stop(time + 0.3);

  engine.master.gain.setValueAtTime(engine.master.gain.value, time);
  engine.master.gain.linearRampToValueAtTime(0.25, time + 0.2);
}

export function playComplete(engine: AudioEngine): void {
  const time = engine.context.currentTime;
  [440, 554.37, 659.25].forEach((frequency, index) => {
    playTone(engine.context, engine.reactive, time + index * 0.09, frequency, 0.4, "sine", 0.1);
  });
}
