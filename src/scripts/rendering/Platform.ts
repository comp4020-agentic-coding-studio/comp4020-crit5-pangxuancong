import { PLATFORM_THICKNESS, VISUAL_CONFIG } from "../config/visual";
import type { RoadSegment } from "../game/Road";
import { fillQuad, toScreen, withAlpha, type ScreenPoint, type WorldPoint } from "./Projection";

// Each segment is real rectangular geometry, not a stroked line: a flat top
// surface plus two side walls extruded by a rendering-only height, so the
// platform reads as a suspended slab over a void. The rectangle drawn here
// is exactly the rectangle isSupported() tests against (game/Collision.ts)
// — rendering never invents geometry collision doesn't know about.
//
// `emphasis` (0..1) is the road's only reaction to rhythm — a subtle
// brightness lift, used for both the global beat pulse and the upcoming
// corner's anticipation cue (PLAN.md §28/§29). It never changes width or
// position. `zoom` carries the shared perfect-hit zoom pulse (PLAN.md §11).
export function drawSegment(
  ctx: CanvasRenderingContext2D,
  segment: RoadSegment,
  cameraWorld: WorldPoint,
  anchor: ScreenPoint,
  emphasis = 0,
  zoom = 1,
): void {
  const halfWidth = segment.width / 2;
  const isXAxis = segment.axis === "x";

  const leftFrom = isXAxis
    ? { x: segment.startX, z: segment.startZ + halfWidth }
    : { x: segment.startX + halfWidth, z: segment.startZ };
  const leftTo = isXAxis
    ? { x: segment.endX, z: segment.startZ + halfWidth }
    : { x: segment.startX + halfWidth, z: segment.endZ };
  const rightFrom = isXAxis
    ? { x: segment.startX, z: segment.startZ - halfWidth }
    : { x: segment.startX - halfWidth, z: segment.startZ };
  const rightTo = isXAxis
    ? { x: segment.endX, z: segment.startZ - halfWidth }
    : { x: segment.startX - halfWidth, z: segment.endZ };

  const at = (point: { x: number; z: number }, height: number) => toScreen({ ...point, height }, cameraWorld, anchor, zoom);

  // Side walls first — darker, drawn underneath the top surface's seam.
  ctx.fillStyle = VISUAL_CONFIG.platformSide;
  fillQuad(ctx, at(leftFrom, PLATFORM_THICKNESS), at(leftTo, PLATFORM_THICKNESS), at(leftTo, 0), at(leftFrom, 0));
  fillQuad(ctx, at(rightFrom, PLATFORM_THICKNESS), at(rightTo, PLATFORM_THICKNESS), at(rightTo, 0), at(rightFrom, 0));

  // Top surface on top.
  ctx.fillStyle = VISUAL_CONFIG.platformTop;
  const topQuad: [ScreenPoint, ScreenPoint, ScreenPoint, ScreenPoint] = [
    at(leftFrom, PLATFORM_THICKNESS),
    at(leftTo, PLATFORM_THICKNESS),
    at(rightTo, PLATFORM_THICKNESS),
    at(rightFrom, PLATFORM_THICKNESS),
  ];
  fillQuad(ctx, ...topQuad);

  if (emphasis > 0.01) {
    ctx.fillStyle = withAlpha("#ffffff", Math.min(1, emphasis) * 0.35);
    fillQuad(ctx, ...topQuad);
  }
}
