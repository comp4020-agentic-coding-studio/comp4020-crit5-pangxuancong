import type { RoadSegment } from "./Road";

// The road is an area, not a centerline, and support is checked against
// world-space (x, z) — never against projected screen coordinates, and
// never as "was this click near a corner". A point is supported if it falls
// inside ANY road segment's rectangle, expanded by a small forgiveness
// margin on every side (PLAN.md's movement correction, §7).
export function isSupported(x: number, z: number, segments: RoadSegment[], forgiveness: number): boolean {
  return segments.some((segment) => withinSegment(x, z, segment, forgiveness));
}

function withinSegment(x: number, z: number, segment: RoadSegment, forgiveness: number): boolean {
  const halfWidth = segment.width / 2 + forgiveness;

  if (segment.axis === "x") {
    const minX = Math.min(segment.startX, segment.endX) - forgiveness;
    const maxX = Math.max(segment.startX, segment.endX) + forgiveness;
    return x >= minX && x <= maxX && Math.abs(z - segment.startZ) <= halfWidth;
  }

  const minZ = Math.min(segment.startZ, segment.endZ) - forgiveness;
  const maxZ = Math.max(segment.startZ, segment.endZ) + forgiveness;
  return z >= minZ && z <= maxZ && Math.abs(x - segment.startX) <= halfWidth;
}
