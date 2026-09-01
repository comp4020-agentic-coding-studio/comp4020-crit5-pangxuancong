import { CANON_LEFT_HAND } from "../music/canonTimeline";
import type { AudioEngine } from "./AudioEngine";
import { playPianoChord } from "./SoundEffects";

const SCHEDULE_AHEAD_TIME = 0.1; // seconds of lookahead per scheduler tick
const SCHEDULER_INTERVAL_MS = 25;

export interface SequencerHandle {
  stop: () => void;
}

// Schedules the ACCOMPANIMENT only — the piano's own left-hand chords — on
// its own fixed schedule, regardless of the player. The right-hand melody
// is deliberately not scheduled here: the player supplies it by turning
// (main.ts plays each melody note live, quantized to the score).
//
// A standard look-ahead Web Audio scheduler: a lightweight polling loop
// decides WHEN to schedule, but every event it schedules is an absolute
// AudioContext timestamp taken straight from the music timeline — never
// tied to setInterval's own timing or to a render frame (PLAN.md §5/§8).
export function startSequencer(engine: AudioEngine, startTime: number): SequencerHandle {
  let nextIndex = 0;

  const tick = (): void => {
    const horizon = engine.context.currentTime + SCHEDULE_AHEAD_TIME;
    while (nextIndex < CANON_LEFT_HAND.length && startTime + CANON_LEFT_HAND[nextIndex].time < horizon) {
      const chord = CANON_LEFT_HAND[nextIndex];
      playPianoChord(engine, startTime + chord.time, chord.duration, chord.midiNotes, chord.velocity);
      nextIndex += 1;
    }
  };

  tick();
  const intervalId = window.setInterval(tick, SCHEDULER_INTERVAL_MS);
  return { stop: () => window.clearInterval(intervalId) };
}
