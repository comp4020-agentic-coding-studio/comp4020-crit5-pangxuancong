import type { GameState } from "../game/GameState";
import { cornerDistances, type Segment } from "../game/Level";
import type { PathPoint } from "../game/Path";
import { PLATFORM_THICKNESS, PLAYER_HEIGHT, PLAYER_SIZE, VISUAL_CONFIG, visibilityHorizon } from "../config/visual";
import { drawPulses, withAlpha, type Pulse } from "./Effects";
import { drawSegment } from "./Platform";
import { drawTrail } from "./TrailRenderer";
import { fillQuad, toScreen, type WorldPoint } from "./Projection";

export interface RenderInput {
  state: GameState;
  level: Segment[];
  pathPoints: PathPoint[];
  distancePerBeat: number;
  segmentIndex: number;
  distanceIntoSegment: number;
  playerX: number;
  playerY: number;
  camera: WorldPoint;
  idlePhase: number;
  fallProgress: number; // 0 (just fell) .. 1 (fully settled)
  pulses: Pulse[];
}

// The player sits in the lower third of the frame, not centred — the camera
// leads in the direction of travel (game/Camera.ts) so most of the visible
// space ahead is upcoming path, not travelled trail.
const ANCHOR_Y_RATIO = 0.62;

export function render(ctx: CanvasRenderingContext2D, width: number, height: number, input: RenderInput): void {
  const anchor = { x: width / 2, y: height * ANCHOR_Y_RATIO };
  const cameraWorld: WorldPoint = { x: input.camera.x, y: input.camera.y, z: 0 };

  ctx.fillStyle = VISUAL_CONFIG.background;
  ctx.fillRect(0, 0, width, height);

  drawPlatforms(ctx, input, cameraWorld, anchor);
  drawTrail(ctx, input.pathPoints, input.segmentIndex, input.distanceIntoSegment, cameraWorld, anchor);
  drawPlayer(ctx, input, cameraWorld, anchor);
  drawPulses(ctx, input.pulses, cameraWorld, anchor);
}

function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  input: RenderInput,
  cameraWorld: WorldPoint,
  anchor: { x: number; y: number },
): void {
  const { level, pathPoints, distancePerBeat, segmentIndex, distanceIntoSegment } = input;
  const corners = cornerDistances(level, distancePerBeat);
  const playerDistance = (segmentIndex === 0 ? 0 : corners[segmentIndex - 1]) + distanceIntoSegment;
  const horizon = visibilityHorizon(segmentIndex);

  for (let i = segmentIndex; i < level.length; i++) {
    const segmentStartDistance = i === 0 ? 0 : corners[i - 1];
    const distanceAhead = segmentStartDistance - playerDistance;
    if (distanceAhead > horizon) break;

    const fade = 1 - Math.min(1, Math.max(0, distanceAhead) / horizon) * 0.7;
    drawSegment(ctx, pathPoints, i, cameraWorld, anchor, fade);
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  input: RenderInput,
  cameraWorld: WorldPoint,
  anchor: { x: number; y: number },
): void {
  const isFalling = input.state === "falling";
  const bob = input.state === "ready" ? Math.sin(input.idlePhase * 3) * 4 : 0;
  const sink = isFalling ? input.fallProgress * 50 : 0;
  const baseZ = PLATFORM_THICKNESS + bob - sink;
  const topZ = baseZ + PLAYER_HEIGHT;
  const alpha = isFalling ? 1 - input.fallProgress : 1;

  const s = PLAYER_SIZE;
  const { playerX: cx, playerY: cy } = input;
  const back = { x: cx - s, y: cy - s };
  const right = { x: cx + s, y: cy - s };
  const front = { x: cx + s, y: cy + s };
  const left = { x: cx - s, y: cy + s };

  const at = (point: { x: number; y: number }, z: number) => toScreen({ ...point, z }, cameraWorld, anchor);

  ctx.globalAlpha = alpha;
  ctx.fillStyle = VISUAL_CONFIG.playerSide;
  fillQuad(ctx, at(right, topZ), at(front, topZ), at(front, baseZ), at(right, baseZ));
  fillQuad(ctx, at(front, topZ), at(left, topZ), at(left, baseZ), at(front, baseZ));

  ctx.fillStyle = withAlpha(isFalling ? VISUAL_CONFIG.playerFallen : VISUAL_CONFIG.player, 1);
  fillQuad(ctx, at(back, topZ), at(right, topZ), at(front, topZ), at(left, topZ));
  ctx.globalAlpha = 1;
}
