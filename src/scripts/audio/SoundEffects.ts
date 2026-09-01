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

// The piano line — the primary music, scheduled directly from
// music/canonTimeline.ts. A plucked-string-ish timbre: fundamental plus two
// quiet upper partials, each with its own quick decay, through a lowpass
// that softens the harder harmonics — closer to a struck string than a
// single pure tone.
export function playPianoNote(engine: AudioEngine, time: number, midiNote: number, velocity: number): void {
  const fundamental = midiToFrequency(midiNote);
  const partials: [number, number, number][] = [
    [1, 1, 0.9], // [harmonic multiple, relative gain, relative decay]
    [2, 0.35, 0.6],
    [3, 0.12, 0.4],
  ];

  const filter = engine.context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 3200;
  filter.connect(engine.piano);

  for (const [multiple, relativeGain, relativeDecay] of partials) {
    const oscillator = engine.context.createOscillator();
    const gain = engine.context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(fundamental * multiple, time);

    const peak = velocity * relativeGain * 0.5;
    const duration = 0.7 * relativeDecay;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(peak, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    oscillator.connect(gain).connect(filter);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.05);
  }
}

// A slow atmospheric pad, sustained under the whole run.
export function playPad(engine: AudioEngine, startTime: number, durationSeconds: number): void {
  const chord = [220, 277.18, 329.63];
  const sustainEnd = startTime + Math.max(2, durationSeconds - 1);
  const end = startTime + durationSeconds;

  for (const frequency of chord) {
    const oscillator = engine.context.createOscillator();
    const gain = engine.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.045, startTime + 2);
    gain.gain.setValueAtTime(0.045, sustainEnd);
    gain.gain.linearRampToValueAtTime(0, end);
    oscillator.connect(gain).connect(engine.pad);
    oscillator.start(startTime);
    oscillator.stop(end + 0.1);
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
