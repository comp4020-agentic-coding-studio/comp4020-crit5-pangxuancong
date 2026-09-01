import { SECONDS_PER_BEAT } from "../config/audio";
import type { LevelSegment } from "../game/Level";
import { totalBeats } from "../game/Level";
import type { AudioEngine } from "./AudioEngine";
import { playBass, playClickPerc, playKick, playPad } from "./SoundEffects";

const SCHEDULE_AHEAD_TIME = 0.1; // seconds of lookahead per scheduler tick
const SCHEDULER_INTERVAL_MS = 25;

export interface SequencerHandle {
  stop: () => void;
}

// A standard look-ahead Web Audio scheduler: a lightweight polling loop
// decides WHEN to schedule, but every event it schedules is an absolute
// AudioContext timestamp — never tied to setInterval's own timing or to a
// render frame (PLAN.md §8/§9).
export function startSequencer(engine: AudioEngine, level: LevelSegment[], startTime: number): SequencerHandle {
  const beats = totalBeats(level);
  const durationSeconds = beats * SECONDS_PER_BEAT;
  let nextBeat = 0;

  playPad(engine, startTime, durationSeconds);

  const tick = (): void => {
    const horizon = engine.context.currentTime + SCHEDULE_AHEAD_TIME;
    while (nextBeat <= beats && startTime + nextBeat * SECONDS_PER_BEAT < horizon) {
      scheduleBeat(engine, nextBeat, startTime + nextBeat * SECONDS_PER_BEAT);
      nextBeat += 1;
    }
  };

  tick();
  const intervalId = window.setInterval(tick, SCHEDULER_INTERVAL_MS);
  return { stop: () => window.clearInterval(intervalId) };
}

function scheduleBeat(engine: AudioEngine, beatIndex: number, time: number): void {
  const beatInBar = ((beatIndex % 4) + 4) % 4;
  // Layer A: strongest on the downbeat, present on every other beat.
  playKick(engine, time, beatInBar === 0 ? 1 : 0.65);
  // Layer B: a precision transient on the off-beat subdivision.
  playClickPerc(engine, time + SECONDS_PER_BEAT / 2);
  // Layer C: soft bass on beats 1 and 3 of the bar.
  if (beatInBar === 0 || beatInBar === 2) playBass(engine, time);
}
