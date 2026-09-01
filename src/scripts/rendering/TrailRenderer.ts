import { directionForSegment, directionVector } from "../utils/math";
import { PLATFORM_THICKNESS, TRAIL_WIDTH, VISUAL_CONFIG } from "../config/visual";
import { segmentStart, type PathPoint } from "../game/Path";
import { toScreen, type ScreenPoint, type WorldPoint } from "./Projection";

// The trail is deliberately thin against the platform's visual width — it
// represents "completed musical history" (PLAN.md §15), not a second road.
// Drawn at platform-top height so it reads as sitting on the surface.
export function drawTrail(
  ctx: CanvasRenderingContext2D,
  pathPoints: PathPoint[],
  segmentIndex: number,
  distanceIntoSegment: number,
  cameraWorld: WorldPoint,
  anchor: ScreenPoint,
): void {
  ctx.strokeStyle = VISUAL_CONFIG.trail;
  ctx.lineWidth = TRAIL_WIDTH;
  ctx.lineCap = "round";

  const at = (point: { x: number; y: number }) => toScreen({ ...point, z: PLATFORM_THICKNESS }, cameraWorld, anchor);

  for (let i = 0; i < segmentIndex; i++) {
    drawLine(ctx, at(segmentStart(pathPoints, i)), at(pathPoints[i]));
  }

  const vector = directionVector(directionForSegment(segmentIndex));
  const start = segmentStart(pathPoints, segmentIndex);
  const current = { x: start.x + vector.x * distanceIntoSegment, y: start.y + vector.y * distanceIntoSegment };
  drawLine(ctx, at(start), at(current));
}

function drawLine(ctx: CanvasRenderingContext2D, a: ScreenPoint, b: ScreenPoint): void {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}
