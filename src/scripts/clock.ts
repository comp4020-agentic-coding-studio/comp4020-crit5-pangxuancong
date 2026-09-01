// Every clock reading comes from AudioContext.currentTime, never from
// setTimeout/requestAnimationFrame's own timer. Over a ~2 minute run those
// drift against the scheduled audio; the AudioContext clock is what the
// audio itself is scheduled against, so reading from it keeps picture and
// sound from ever falling out of sync.
export const BEAT_DURATION = 0.5; // seconds per beat — sets the tempo

export interface Clock {
  audioContext: AudioContext;
  startTime: number | null;
}

export function createClock(audioContext: AudioContext): Clock {
  return { audioContext, startTime: null };
}

export function startClock(clock: Clock): Clock {
  return { ...clock, startTime: clock.audioContext.currentTime };
}

export function elapsedSeconds(clock: Clock): number {
  if (clock.startTime === null) return 0;
  return clock.audioContext.currentTime - clock.startTime;
}

export function elapsedBeats(clock: Clock, beatDuration = BEAT_DURATION): number {
  return elapsedSeconds(clock) / beatDuration;
}

export function beatIndexAt(clock: Clock, beatDuration = BEAT_DURATION): number {
  return Math.floor(elapsedBeats(clock, beatDuration));
}
