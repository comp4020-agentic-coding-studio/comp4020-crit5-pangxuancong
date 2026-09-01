import type { MusicEvent } from "../music/canonTimeline";
import type { Axis } from "./Axis";
import type { RoadSegment } from "./Road";

export interface CornerEvent {
  time: number; // the expected turn time for this corner, straight from the score
  accent: "normal" | "strong";
  midiNote?: number;
}

export interface Beatmap {
  segments: RoadSegment[];
  corners: CornerEvent[];
}

// The level is a spatial representation of the music, not a BPM-grid
// approximation of it (PLAN.md's beatmap revision, §2): every consecutive
// pair of turn-marked events becomes one road segment, axis alternating
// x/z starting at x, with length = playerSpeed * (time between them). Long
// musical intervals become long segments; short ones become short segments.
export function buildBeatmapRoad(timeline: MusicEvent[], playerSpeed: number, width: number): Beatmap {
  const turnEvents = timeline.filter((event) => event.turn);
  const overlap = width / 2;

  const segments: RoadSegment[] = [];
  const corners: CornerEvent[] = [];

  let x = 0;
  let z = 0;
  let axis: Axis = "x";

  for (let i = 0; i < turnEvents.length - 1; i++) {
    const duration = turnEvents[i + 1].time - turnEvents[i].time;
    const length = playerSpeed * duration;

    const startX = axis === "x" ? x - overlap : x;
    const startZ = axis === "z" ? z - overlap : z;
    const endX = axis === "x" ? x + length : x;
    const endZ = axis === "z" ? z + length : z;

    segments.push({ axis, startX, startZ, endX, endZ, width });
    corners.push({
      time: turnEvents[i + 1].time,
      accent: turnEvents[i + 1].accent ?? "normal",
      midiNote: turnEvents[i + 1].midiNote,
    });

    x = endX;
    z = endZ;
    axis = axis === "x" ? "z" : "x";
  }

  return { segments, corners };
}
