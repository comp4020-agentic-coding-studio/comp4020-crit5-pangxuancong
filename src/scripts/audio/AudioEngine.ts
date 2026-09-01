// AudioContext.currentTime is the one clock the whole run reads timing from
// — never setTimeout/requestAnimationFrame's own timer, which would drift
// against scheduled audio over a multi-minute run.
//
// Master mix: the right-hand melody (piano, played live by the player) and
// the left-hand accompaniment (leftHand, scheduled chords) are the same
// instrument on two separate buses, plus a reactive bus for the completion
// chime — all routed through one master gain, so no layer can
// independently run hot, and the whole mix ducks together on a fall
// (SoundEffects.playFall).
export interface AudioEngine {
  context: AudioContext;
  startTime: number;
  master: GainNode;
  piano: GainNode;
  leftHand: GainNode;
  reactive: GainNode;
}

// Must be called from within a user gesture handler: the same click that
// starts the run also unlocks audio, with no separate "enable audio" step.
export function startAudioEngine(): AudioEngine {
  const context = new AudioContext();

  const master = context.createGain();
  master.gain.value = 0.85;
  master.connect(context.destination);

  const piano = context.createGain();
  piano.gain.value = 0.9;
  piano.connect(master);

  const leftHand = context.createGain();
  leftHand.gain.value = 0.55;
  leftHand.connect(master);

  const reactive = context.createGain();
  reactive.gain.value = 0.9;
  reactive.connect(master);

  return { context, startTime: context.currentTime, master, piano, leftHand, reactive };
}

// Closing the context tears down every node it owns — the reliable way to
// guarantee old oscillators/timers never survive into a restarted run.
export function stopAudioEngine(engine: AudioEngine): void {
  void engine.context.close();
}
