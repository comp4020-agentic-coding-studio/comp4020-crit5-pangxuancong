import { directionForSegment, directionVector } from "../utils/math";
import { segmentStart, type PathPoint } from "../game/Path";
import { PLATFORM_THICKNESS, PLATFORM_WIDTH, VISUAL_CONFIG } from "../config/visual";
import { fillQuad, toScreen, type ScreenPoint, type WorldPoint } from "./Projection";
import { withAlpha } from "./Effects";

// Each segment is real rectangular geometry, not a stroked line: a flat top
// surface plus two side walls, so the platform reads as a suspended slab
// with a void beneath it rather than a tube. Corners stay squared — every
// segment's footprint is extended by half its own width along its own
// direction, which is what closes the joint with its neighbour without a
// rounded miter.
export function drawSegment(
  ctx: CanvasRenderingContext2D,
  pathPoints: PathPoint[],
  segmentIndex: number,
  cameraWorld: WorldPoint,
  anchor: ScreenPoint,
  fade: number,
): void {
  const halfWidth = PLATFORM_WIDTH / 2;
  const from = segmentStart(pathPoints, segmentIndex);
  const to = pathPoints[segmentIndex];
  const dir = directionVector(directionForSegment(segmentIndex));
  const perp = { x: -dir.y, y: dir.x };

  const extendedFrom = { x: from.x - dir.x * halfWidth, y: from.y - dir.y * halfWidth };
  const extendedTo = { x: to.x + dir.x * halfWidth, y: to.y + dir.y * halfWidth };

  const leftFrom = { x: extendedFrom.x + perp.x * halfWidth, y: extendedFrom.y + perp.y * halfWidth };
  const leftTo = { x: extendedTo.x + perp.x * halfWidth, y: extendedTo.y + perp.y * halfWidth };
  const rightFrom = { x: extendedFrom.x - perp.x * halfWidth, y: extendedFrom.y - perp.y * halfWidth };
  const rightTo = { x: extendedTo.x - perp.x * halfWidth, y: extendedTo.y - perp.y * halfWidth };

  const at = (point: { x: number; y: number }, z: number) => toScreen({ ...point, z }, cameraWorld, anchor);

  // Side walls first — darker, and drawn underneath the top surface's seam.
  ctx.fillStyle = withAlpha(VISUAL_CONFIG.platformSide, fade);
  fillQuad(ctx, at(leftFrom, PLATFORM_THICKNESS), at(leftTo, PLATFORM_THICKNESS), at(leftTo, 0), at(leftFrom, 0));
  fillQuad(ctx, at(rightFrom, PLATFORM_THICKNESS), at(rightTo, PLATFORM_THICKNESS), at(rightTo, 0), at(rightFrom, 0));

  // Top surface last, on top.
  ctx.fillStyle = withAlpha(VISUAL_CONFIG.platformTop, fade);
  fillQuad(
    ctx,
    at(leftFrom, PLATFORM_THICKNESS),
    at(leftTo, PLATFORM_THICKNESS),
    at(rightTo, PLATFORM_THICKNESS),
    at(rightFrom, PLATFORM_THICKNESS),
  );
}
