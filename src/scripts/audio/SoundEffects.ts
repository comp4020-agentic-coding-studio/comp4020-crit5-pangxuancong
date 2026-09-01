// All sound is synthesized — no audio assets, nothing to license (PLAN.md
// §9). Every helper plays a single short envelope-shaped tone.
function playTone(
  context: AudioContext,
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
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.02);
}

// The steady pulse the whole level is scheduled against — background
// rhythm, not a reward. This is what lets the player learn to predict
// corners by listening (PLAN.md §8).
export function playKick(context: AudioContext, time: number): void {
  playTone(context, time, 90, 0.12, "sine", 0.14);
}

// Fired live, immediately, only on an actual successful turn — the reward
// is tied to the player's action, not to a pre-scheduled beat (PLAN.md §10).
export function playTurnSuccess(context: AudioContext): void {
  playTone(context, context.currentTime, 660, 0.09, "triangle", 0.12);
}

export function playFall(context: AudioContext): void {
  playTone(context, context.currentTime, 140, 0.35, "sawtooth", 0.1);
}

export function playComplete(context: AudioContext): void {
  const time = context.currentTime;
  [440, 554, 660].forEach((frequency, index) => {
    playTone(context, time + index * 0.09, frequency, 0.4, "sine", 0.1);
  });
}
