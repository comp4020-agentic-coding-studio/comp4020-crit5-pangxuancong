import { CANON_BASS, CANON_TIMELINE, timelineDuration } from "../music/canonTimeline";
import type { AudioEngine } from "./AudioEngine";
import { playBassNote, playPad } from "./SoundEffects";

const SCHEDULE_AHEAD_TIME = 0.1; // seconds of lookahead per scheduler tick
const SCHEDULER_INTERVAL_MS = 25;

export interface SequencerHandle {
  stop: () => void;
}

// Schedules the ACCOMPANIMENT only — the Canon ground bass and a sustained
// pad — on its own fixed schedule, regardless of the player. The piano
// melody is deliberately not scheduled here: the player supplies it by
// turning (main.ts plays each melody note live, quantized to the score).
//
// A standard look-ahead Web Audio scheduler: a lightweight polling loop
// decides WHEN to schedule, but every event it schedules is an absolute
// AudioContext timestamp taken straight from the music timeline — never
// tied to setInterval's own timing or to a render frame (PLAN.md §5/§8).
export function startSequencer(engine: AudioEngine, startTime: number): SequencerHandle {
  const durationSeconds = timelineDuration(CANON_TIMELINE);
  let nextIndex = 0;

  playPad(engine, startTime, durationSeconds);

  const tick = (): void => {
    const horizon = engine.context.currentTime + SCHEDULE_AHEAD_TIME;
    while (nextIndex < CANON_BASS.length && startTime + CANON_BASS[nextIndex].time < horizon) {
      const note = CANON_BASS[nextIndex];
      playBassNote(engine, startTime + note.time, note.duration, note.midiNote, note.velocity);
      nextIndex += 1;
    }
  };

  tick();
  const intervalId = window.setInterval(tick, SCHEDULER_INTERVAL_MS);
  return { stop: () => window.clearInterval(intervalId) };
}
