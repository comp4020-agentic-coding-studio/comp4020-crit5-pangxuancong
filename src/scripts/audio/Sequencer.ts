import { SECONDS_PER_BEAT } from "../config/audio";
import type { LevelSegment } from "../game/Level";
import { totalBeats } from "../game/Level";
import { playKick } from "./SoundEffects";

// Schedules the whole run's kick pulse up front, in absolute AudioContext
// time. One kick per beat, for the entire level — this is the shared clock
// the player learns to read ahead of a corner (PLAN.md §8/§22).
export function scheduleLevel(context: AudioContext, startTime: number, level: LevelSegment[]): void {
  const beats = totalBeats(level);
  for (let beat = 0; beat <= beats; beat++) {
    playKick(context, startTime + beat * SECONDS_PER_BEAT);
  }
}
