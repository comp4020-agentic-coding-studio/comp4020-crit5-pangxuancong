import { PLATFORM_THICKNESS, VISUAL_CONFIG } from "../config/visual";
import { toScreen, type ScreenPoint, type WorldPoint } from "./Projection";

export interface Pulse {
  x: number;
  y: number;
  age: number; // seconds since spawn
}

export const PULSE_LIFETIME = 0.35;

// A pulse answers "did I act correctly?" (PLAN.md §36) — nothing more. One
// per successful turn, a small brightening ring at platform-top height,
// gone well before the next.
export function drawPulses(
  ctx: CanvasRenderingContext2D,
  pulses: Pulse[],
  cameraWorld: WorldPoint,
  anchor: ScreenPoint,
): void {
  for (const pulse of pulses) {
    const t = pulse.age / PULSE_LIFETIME;
    if (t >= 1) continue;
    const screen = toScreen({ x: pulse.x, y: pulse.y, z: PLATFORM_THICKNESS }, cameraWorld, anchor);
    const radius = 8 + t * 20;
    ctx.beginPath();
    ctx.strokeStyle = withAlpha(VISUAL_CONFIG.player, 1 - t);
    ctx.lineWidth = 2;
    ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
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
