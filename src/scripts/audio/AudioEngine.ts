// AudioContext.currentTime is the one clock the whole run reads timing from
// (PLAN.md §9/§22) — never setTimeout/requestAnimationFrame's own timer,
// which would drift against scheduled audio over a multi-minute run.
export interface AudioEngine {
  context: AudioContext;
  startTime: number;
}

// Must be called from within a user gesture handler (PLAN.md §26/§27): the
// same click that starts the run also unlocks audio, with no separate
// "enable audio" step or prompt.
export function startAudioEngine(): AudioEngine {
  const context = new AudioContext();
  return { context, startTime: context.currentTime };
}

export function elapsedSeconds(engine: AudioEngine): number {
  return engine.context.currentTime - engine.startTime;
}

export function stopAudioEngine(engine: AudioEngine): void {
  void engine.context.close();
}
