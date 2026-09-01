import { directionForSegment, directionVector } from "../utils/math";
import type { Segment } from "./Level";

export interface PathPoint {
  x: number;
  y: number;
}

// Precomputed corner points for the whole level, from the origin.
// pathPoints[i] is the point ending segment i (the corner after it, or the
// level's final endpoint for the last segment). The level is deterministic
// (PLAN.md §38), so this only ever needs to be built once.
export function buildPathPoints(level: Segment[], distancePerBeat: number): PathPoint[] {
  const points: PathPoint[] = [];
  let point: PathPoint = { x: 0, y: 0 };
  for (let i = 0; i < level.length; i++) {
    const vector = directionVector(directionForSegment(i));
    const length = level[i].beats * distancePerBeat;
    point = { x: point.x + vector.x * length, y: point.y + vector.y * length };
    points.push(point);
  }
  return points;
}

export function segmentStart(pathPoints: PathPoint[], segmentIndex: number): PathPoint {
  return segmentIndex === 0 ? { x: 0, y: 0 } : pathPoints[segmentIndex - 1];
}
