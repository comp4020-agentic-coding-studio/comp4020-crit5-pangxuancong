// A lightweight pseudo-isometric projection: world coordinates (x, y, and an
// optional rendering-only z for perceived height) map to screen space. This
// is the one place world and screen space meet — everything else in
// rendering/ works in world coordinates and calls toScreen() at the end.
export interface WorldPoint {
  x: number;
  y: number;
  z?: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

const SCALE_X = 0.78;
const SCALE_Y = 0.45;

export function project(point: WorldPoint): ScreenPoint {
  const z = point.z ?? 0;
  return {
    x: (point.x - point.y) * SCALE_X,
    y: (point.x + point.y) * SCALE_Y - z,
  };
}

// Projects a world point relative to the camera's world position, anchored
// at a fixed screen point. Because the projection above is linear, this is
// equivalent to projecting (point - camera) — computed directly here to
// keep the two call sites (Platform.ts, Renderer.ts) simple.
export function toScreen(point: WorldPoint, cameraWorld: WorldPoint, anchor: ScreenPoint): ScreenPoint {
  const projectedPoint = project(point);
  const projectedCamera = project(cameraWorld);
  return {
    x: anchor.x + projectedPoint.x - projectedCamera.x,
    y: anchor.y + projectedPoint.y - projectedCamera.y,
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
