import { PLATFORM_THICKNESS, VISUAL_CONFIG } from "../config/visual";
import type { RoadSegment } from "../game/Road";
import { fillQuad, toScreen, withAlpha, type ScreenPoint, type WorldPoint } from "./Projection";

// Each segment is real rectangular geometry, not a stroked line: a flat top
// surface plus two side walls extruded by a rendering-only height, so the
// platform reads as a suspended slab over a void. The rectangle drawn here
// is exactly the rectangle isSupported() tests against (game/Collision.ts)
// — rendering never invents geometry collision doesn't know about.
export function drawSegment(
  ctx: CanvasRenderingContext2D,
  segment: RoadSegment,
  cameraWorld: WorldPoint,
  anchor: ScreenPoint,
  fade = 1,
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

  const at = (point: { x: number; z: number }, height: number) => toScreen({ ...point, height }, cameraWorld, anchor);

  // Side walls first — darker, drawn underneath the top surface's seam.
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
