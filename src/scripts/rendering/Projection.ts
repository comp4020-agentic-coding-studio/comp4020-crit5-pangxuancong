// A lightweight pseudo-isometric projection. World space uses the same
// (x, z) ground plane as gameplay/collision, plus an optional rendering-only
// `height` for perceived thickness — projection happens ONLY here, never as
// part of simulation (PLAN.md's movement correction, §3).
export interface WorldPoint {
  x: number;
  z: number;
  height?: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

const SCALE_X = 0.78;
const SCALE_Y = 0.45;

export function project(point: WorldPoint): ScreenPoint {
  const height = point.height ?? 0;
  return {
    x: (point.x - point.z) * SCALE_X,
    y: (point.x + point.z) * SCALE_Y - height,
  };
}

// Projects a world point relative to the camera's world position, anchored
// at a fixed screen point. `zoom` (default 1) is the one place a perfect-hit
// micro zoom pulse (PLAN.md §11) is applied — it scales every point's
// distance from the anchor uniformly, so the whole frame (background,
// platforms, trail, player, particles) zooms together rather than one
// layer moving independently.
export function toScreen(point: WorldPoint, cameraWorld: WorldPoint, anchor: ScreenPoint, zoom = 1): ScreenPoint {
  const projectedPoint = project(point);
  const projectedCamera = project(cameraWorld);
  return {
    x: anchor.x + (projectedPoint.x - projectedCamera.x) * zoom,
    y: anchor.y + (projectedPoint.y - projectedCamera.y) * zoom,
  };
}

export function fillQuad(
  ctx: CanvasRenderingContext2D,
  a: ScreenPoint,
  b: ScreenPoint,
  c: ScreenPoint,
  d: ScreenPoint,
): void {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.closePath();
  ctx.fill();
}

export function withAlpha(color: string, alpha: number): string {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}
