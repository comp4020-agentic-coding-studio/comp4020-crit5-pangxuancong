// AudioContext.currentTime is the one clock the whole run reads timing from
// — never setTimeout/requestAnimationFrame's own timer, which would drift
// against scheduled audio over a multi-minute run.
//
// Master mix: drums/bass/pad/reactive each have their own gain, all routed
// through one master gain — so no layer can independently run hot, and the
// whole mix ducks together on a fall (SoundEffects.playFall).
export interface AudioEngine {
  context: AudioContext;
  startTime: number;
  master: GainNode;
  drums: GainNode;
  bass: GainNode;
  pad: GainNode;
  reactive: GainNode;
}

// Must be called from within a user gesture handler: the same click that
// starts the run also unlocks audio, with no separate "enable audio" step.
export function startAudioEngine(): AudioEngine {
  const context = new AudioContext();

  const master = context.createGain();
  master.gain.value = 0.85;
  master.connect(context.destination);

  const drums = context.createGain();
  drums.gain.value = 0.9;
  drums.connect(master);

  const bass = context.createGain();
  bass.gain.value = 0.7;
  bass.connect(master);

  const pad = context.createGain();
  pad.gain.value = 0.6;
  pad.connect(master);

  const reactive = context.createGain();
  reactive.gain.value = 0.9;
  reactive.connect(master);

  return { context, startTime: context.currentTime, master, drums, bass, pad, reactive };
}

// Closing the context tears down every node it owns — the reliable way to
// guarantee old oscillators/timers never survive into a restarted run.
export function stopAudioEngine(engine: AudioEngine): void {
  void engine.context.close();
}
