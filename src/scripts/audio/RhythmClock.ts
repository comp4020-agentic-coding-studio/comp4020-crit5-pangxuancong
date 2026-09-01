// The one authoritative timing source: AudioContext.currentTime. Never
// setInterval/setTimeout/Date.now() for anything rhythm-sensitive — those
// drift against scheduled audio and against each other.
//
// Pure math lives first, decoupled from AudioContext, so it can be unit
// tested without mocking anything (spec/rhythm.test.ts); the RhythmClock
// below is a thin AudioContext-backed wrapper around the same functions.

export function secondsPerBeat(bpm: number): number {
  return 60 / bpm;
}

export function beatFloatFromSongTime(songTime: number, bpm: number): number {
  return songTime / secondsPerBeat(bpm);
}

export function beatIndexFromSongTime(songTime: number, bpm: number): number {
  return Math.floor(beatFloatFromSongTime(songTime, bpm));
}

export function beatPhaseFromSongTime(songTime: number, bpm: number): number {
  const beatFloat = beatFloatFromSongTime(songTime, bpm);
  return beatFloat - Math.floor(beatFloat);
}

// Seconds from the current song time to the NEAREST beat, in either
// direction. A turn's timing grade is judged against this — the general
// beat grid, not a corner — because rhythm quality and gameplay success are
// separate questions (PLAN.md §11).
export function nearestBeatDistance(songTime: number, bpm: number): number {
  const phase = beatPhaseFromSongTime(songTime, bpm);
  const distanceInBeats = phase <= 0.5 ? phase : 1 - phase;
  return distanceInBeats * secondsPerBeat(bpm);
}

export interface RhythmClock {
  context: AudioContext;
  bpm: number;
  startTime: number;
}

export function createRhythmClock(context: AudioContext, bpm: number, startTime: number): RhythmClock {
  return { context, bpm, startTime };
}

export function getSongTime(clock: RhythmClock): number {
  return clock.context.currentTime - clock.startTime;
}

export function getBeatFloat(clock: RhythmClock): number {
  return beatFloatFromSongTime(getSongTime(clock), clock.bpm);
}

export function getBeatIndex(clock: RhythmClock): number {
  return beatIndexFromSongTime(getSongTime(clock), clock.bpm);
}

export function getBeatPhase(clock: RhythmClock): number {
  return beatPhaseFromSongTime(getSongTime(clock), clock.bpm);
}

export function getNearestBeatDistance(clock: RhythmClock): number {
  return nearestBeatDistance(getSongTime(clock), clock.bpm);
}
