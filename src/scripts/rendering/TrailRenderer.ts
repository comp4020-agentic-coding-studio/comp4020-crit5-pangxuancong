import { PLATFORM_THICKNESS, TRAIL_WIDTH, VISUAL_CONFIG } from "../config/visual";
import { toScreen, type ScreenPoint, type WorldPoint } from "./Projection";

// The trail is exactly the sequence of world positions the player actually
// occupied (main.ts records one per frame while playing) — it is never
// derived from the level data, so cutting a corner early or overshooting
// late shows up in the trail exactly as it happened (PLAN.md §9).
export function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: { x: number; z: number }[],
  cameraWorld: WorldPoint,
  anchor: ScreenPoint,
): void {
  if (trail.length < 2) return;

  ctx.strokeStyle = VISUAL_CONFIG.trail;
  ctx.lineWidth = TRAIL_WIDTH;
  ctx.lineCap = "round";

  const at = (point: { x: number; z: number }) => toScreen({ ...point, height: PLATFORM_THICKNESS }, cameraWorld, anchor);

  ctx.beginPath();
  const first = at(trail[0]);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < trail.length; i++) {
    const point = at(trail[i]);
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
}
