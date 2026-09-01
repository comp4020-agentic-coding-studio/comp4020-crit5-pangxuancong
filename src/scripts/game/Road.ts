import type { Axis } from "./Axis";
import type { LevelSegment } from "./Level";

// The road as world-space area, not a centerline. Collision tests whether
// the player's point falls inside one of these rectangles — never a
// distance-to-corner check (PLAN.md's movement correction, §6/§7).
export interface RoadSegment {
  axis: Axis;
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  width: number;
}

// Each segment's rectangle is extended backward along its own axis by half
// its width, so consecutive segments' support areas overlap at the joint.
// This is what closes the corner without a collision gap — and without ever
// snapping the player's continuous position onto it.
export function buildRoadSegments(level: LevelSegment[], distancePerBeat: number, width: number): RoadSegment[] {
  const overlap = width / 2;
  const segments: RoadSegment[] = [];
  let x = 0;
  let z = 0;

  for (const segment of level) {
    const length = segment.beats * distancePerBeat;
    const startX = segment.axis === "x" ? x - overlap : x;
    const startZ = segment.axis === "z" ? z - overlap : z;
    const endX = segment.axis === "x" ? x + length : x;
    const endZ = segment.axis === "z" ? z + length : z;

    segments.push({ axis: segment.axis, startX, startZ, endX, endZ, width });
    x = endX;
    z = endZ;
  }

  return segments;
}

// World-space bounding box of the whole road — used only to scatter
// decorative background elements around the level, never for gameplay.
export function roadBounds(segments: RoadSegment[]): { minX: number; maxX: number; minZ: number; maxZ: number } {
  let minX = 0;
  let maxX = 0;
  let minZ = 0;
  let maxZ = 0;
  for (const segment of segments) {
    minX = Math.min(minX, segment.startX, segment.endX);
    maxX = Math.max(maxX, segment.startX, segment.endX);
    minZ = Math.min(minZ, segment.startZ, segment.endZ);
    maxZ = Math.max(maxZ, segment.startZ, segment.endZ);
  }
  return { minX, maxX, minZ, maxZ };
}
