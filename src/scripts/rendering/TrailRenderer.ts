import { PLATFORM_THICKNESS, TRAIL_WIDTH, VISUAL_CONFIG } from "../config/visual";
import { toScreen, withAlpha, type ScreenPoint, type WorldPoint } from "./Projection";

const RECENT_POINTS = 14;

// The trail is exactly the sequence of world positions the player actually
// occupied (main.ts records one per frame while playing) — it is never
// derived from the level data, so cutting a corner early or overshooting
// late shows up in the trail exactly as it happened (PLAN.md §9).
//
// `trailPulse` (0..1, decaying) brightens only the most recent stretch on a
// beat-aligned turn — never the entire historical trail (PLAN.md §14).
export function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: { x: number; z: number }[],
  cameraWorld: WorldPoint,
  anchor: ScreenPoint,
  trailPulse: number,
): void {
  if (trail.length < 2) return;

  const at = (point: { x: number; z: number }) => toScreen({ ...point, height: PLATFORM_THICKNESS }, cameraWorld, anchor);

  ctx.strokeStyle = VISUAL_CONFIG.trail;
  ctx.lineWidth = TRAIL_WIDTH;
  ctx.lineCap = "round";
  drawPolyline(ctx, trail, at);

  if (trailPulse > 0.02) {
    const recent = trail.slice(-RECENT_POINTS);
    ctx.strokeStyle = withAlpha(VISUAL_CONFIG.player, Math.min(1, trailPulse));
    ctx.lineWidth = TRAIL_WIDTH * (1 + trailPulse * 1.4);
    drawPolyline(ctx, recent, at);
  }
}

function drawPolyline(
  ctx: CanvasRenderingContext2D,
  points: { x: number; z: number }[],
  at: (point: { x: number; z: number }) => ScreenPoint,
): void {
  if (points.length < 2) return;
  ctx.beginPath();
  const first = at(points[0]);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < points.length; i++) {
    const point = at(points[i]);
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
}
