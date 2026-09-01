import { directionForSegment, directionVector, type Direction } from "../utils/math";
import type { PathPoint } from "./Path";
import { segmentStart } from "./Path";

export interface PlayerRuntime {
  segmentIndex: number;
  distanceIntoSegment: number; // world units travelled within the current segment
}

export function initialPlayer(): PlayerRuntime {
  return { segmentIndex: 0, distanceIntoSegment: 0 };
}

export function playerDirection(player: PlayerRuntime): Direction {
  return directionForSegment(player.segmentIndex);
}

// World position is derived from segment index + in-segment progress against
// the precomputed path, not accumulated frame over frame — this avoids float
// drift over a multi-minute run and keeps position a pure function of level
// + state.
export function playerPosition(player: PlayerRuntime, pathPoints: PathPoint[]): PathPoint {
  const start = segmentStart(pathPoints, player.segmentIndex);
  const vector = directionVector(directionForSegment(player.segmentIndex));
  return { x: start.x + vector.x * player.distanceIntoSegment, y: start.y + vector.y * player.distanceIntoSegment };
}
