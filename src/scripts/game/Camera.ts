import { directionVector, lerp, type Direction } from "../utils/math";

const SMOOTHING = 0.08;
const LEAD_DISTANCE = 220; // world units of extra space shown ahead of the player

export interface Camera {
  x: number;
  y: number;
}

export function initialCamera(): Camera {
  return { x: 0, y: 0 };
}

// Camera targets a point ahead of the player in their current direction, not
// the player itself — this is what keeps more of the upcoming path visible
// than the trail behind (PLAN.md §17).
export function updateCamera(camera: Camera, playerX: number, playerY: number, direction: Direction): Camera {
  const lead = directionVector(direction);
  const targetX = playerX + lead.x * LEAD_DISTANCE;
  const targetY = playerY + lead.y * LEAD_DISTANCE;
  return {
    x: lerp(camera.x, targetX, SMOOTHING),
    y: lerp(camera.y, targetY, SMOOTHING),
  };
}
