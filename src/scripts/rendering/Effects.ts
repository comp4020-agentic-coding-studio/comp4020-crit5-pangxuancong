import { PLATFORM_THICKNESS, VISUAL_CONFIG } from "../config/visual";
import { toScreen, withAlpha, type ScreenPoint, type WorldPoint } from "./Projection";

// Postponed for the gameplay sandbox (PLAN.md §11) — not wired into
// Renderer.ts right now, kept for when per-turn feedback returns.
export interface Pulse {
  x: number;
  z: number;
  age: number; // seconds since spawn
}

export const PULSE_LIFETIME = 0.35;

export function drawPulses(
  ctx: CanvasRenderingContext2D,
  pulses: Pulse[],
  cameraWorld: WorldPoint,
  anchor: ScreenPoint,
): void {
  for (const pulse of pulses) {
    const t = pulse.age / PULSE_LIFETIME;
    if (t >= 1) continue;
    const screen = toScreen({ x: pulse.x, z: pulse.z, height: PLATFORM_THICKNESS }, cameraWorld, anchor);
    const radius = 8 + t * 20;
    ctx.beginPath();
    ctx.strokeStyle = withAlpha(VISUAL_CONFIG.player, 1 - t);
    ctx.lineWidth = 2;
    ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}
