import type { MusicEvent } from "../music/canonTimeline";
import { timelineDuration } from "../music/canonTimeline";
import type { AudioEngine } from "./AudioEngine";
import { playPad, playPianoNote } from "./SoundEffects";

const SCHEDULE_AHEAD_TIME = 0.1; // seconds of lookahead per scheduler tick
const SCHEDULER_INTERVAL_MS = 25;

export interface SequencerHandle {
  stop: () => void;
}

// A standard look-ahead Web Audio scheduler: a lightweight polling loop
// decides WHEN to schedule, but every event it schedules is an absolute
// AudioContext timestamp taken straight from the music timeline — never
// tied to setInterval's own timing or to a render frame (PLAN.md §5/§8).
export function startSequencer(engine: AudioEngine, timeline: MusicEvent[], startTime: number): SequencerHandle {
  const notes = timeline.filter((event) => event.midiNote !== undefined);
  const durationSeconds = timelineDuration(timeline);
  let nextIndex = 0;

  playPad(engine, startTime, durationSeconds);

  const tick = (): void => {
    const horizon = engine.context.currentTime + SCHEDULE_AHEAD_TIME;
    while (nextIndex < notes.length && startTime + notes[nextIndex].time < horizon) {
      const event = notes[nextIndex];
      playPianoNote(engine, startTime + event.time, event.midiNote as number, event.velocity ?? 0.6);
      nextIndex += 1;
    }
  };

  tick();
  const intervalId = window.setInterval(tick, SCHEDULER_INTERVAL_MS);
  return { stop: () => window.clearInterval(intervalId) };
}
