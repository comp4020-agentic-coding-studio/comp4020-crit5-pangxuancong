import type { TimingGrade } from "../game/TurnTiming";
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

// Layer A — the primary beat: strong but restrained, a touch more presence
// on the downbeat than the other three.
export function playKick(engine: AudioEngine, time: number, strength: number): void {
  playTone(engine.context, engine.drums, time, 92, 0.12, "sine", 0.18 * strength);
}

// Layer B — a small high-frequency transient for timing precision, sitting
// on the off-beat subdivision rather than doubling the kick.
export function playClickPerc(engine: AudioEngine, time: number): void {
  playTone(engine.context, engine.drums, time, 1500, 0.025, "square", 0.025);
}

// Layer C — soft low bass, present rather than dominant.
export function playBass(engine: AudioEngine, time: number): void {
  playTone(engine.context, engine.bass, time, 55, 0.35, "triangle", 0.09);
}

// Layer D — slow atmospheric pad, sustained under the whole run.
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
    gain.gain.linearRampToValueAtTime(0.05, startTime + 2);
    gain.gain.setValueAtTime(0.05, sustainEnd);
    gain.gain.linearRampToValueAtTime(0, end);
    oscillator.connect(gain).connect(engine.pad);
    oscillator.start(startTime);
    oscillator.stop(end + 0.1);
  }
}

// Layer E — the reactive accent: fired live on every turn, through its own
// bus, so a well-timed moment reads as a contribution to the music rather
// than a sound effect layered on top of it.
const ACCENT_TONE: Record<TimingGrade, { frequency: number; gain: number }> = {
  perfect: { frequency: 880, gain: 0.16 },
  good: { frequency: 740, gain: 0.12 },
  normal: { frequency: 600, gain: 0.08 },
};

export function playAccent(engine: AudioEngine, grade: TimingGrade): void {
  const { frequency, gain } = ACCENT_TONE[grade];
  playTone(engine.context, engine.reactive, engine.context.currentTime, frequency, 0.12, "triangle", gain);
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
