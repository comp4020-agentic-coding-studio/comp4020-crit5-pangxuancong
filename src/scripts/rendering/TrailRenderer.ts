import type { Direction } from "../utils/math";
import { directionForSegment, directionVector } from "../utils/math";
import { VISUAL_CONFIG } from "../config/visual";
import type { PathPoint } from "../game/Path";
import { segmentStart } from "../game/Path";

export type ScreenPoint = { x: number; y: number };

// The trail is the level's own completed geometry, drawn dim — it represents
// "completed musical history" (PLAN.md §15), not a separate particle system.
export function drawTrail(
  ctx: CanvasRenderingContext2D,
  pathPoints: PathPoint[],
  segmentIndex: number,
  distanceIntoSegment: number,
  toScreen: (point: PathPoint) => ScreenPoint,
  lineWidth: number,
): void {
  ctx.strokeStyle = VISUAL_CONFIG.trail;
  ctx.lineWidth = lineWidth * 0.5;
  ctx.lineCap = "round";

  for (let i = 0; i < segmentIndex; i++) {
    drawSegment(ctx, segmentStart(pathPoints, i), pathPoints[i], toScreen);
  }

  const direction: Direction = directionForSegment(segmentIndex);
  const vector = directionVector(direction);
  const start = segmentStart(pathPoints, segmentIndex);
  const current: PathPoint = {
    x: start.x + vector.x * distanceIntoSegment,
    y: start.y + vector.y * distanceIntoSegment,
  };
  drawSegment(ctx, start, current, toScreen);
}

function drawSegment(
  ctx: CanvasRenderingContext2D,
  from: PathPoint,
  to: PathPoint,
  toScreen: (point: PathPoint) => ScreenPoint,
): void {
  const a = toScreen(from);
  const b = toScreen(to);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}
