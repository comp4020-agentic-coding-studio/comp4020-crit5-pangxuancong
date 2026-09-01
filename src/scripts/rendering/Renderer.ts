import type { GameState } from "../game/GameState";
import type { PlayerRuntime } from "../game/Player";
import type { RoadSegment } from "../game/Road";
import { PLATFORM_THICKNESS, PLAYER_HEIGHT, PLAYER_SIZE, VISUAL_CONFIG } from "../config/visual";
import { drawSegment } from "./Platform";
import { drawTrail } from "./TrailRenderer";
import { fillQuad, toScreen, withAlpha, type WorldPoint } from "./Projection";

export interface RenderInput {
  state: GameState;
  segments: RoadSegment[];
  player: PlayerRuntime;
  trail: { x: number; z: number }[];
  camera: { x: number; z: number };
  idlePhase: number;
  fallProgress: number; // 0 (just fell) .. 1 (fully settled)
}

// The player sits in the lower third of the frame, not centred — the camera
// leads in the direction of travel (game/Camera.ts) so most of the visible
// space ahead is upcoming road, not travelled trail.
const ANCHOR_Y_RATIO = 0.62;

export function render(ctx: CanvasRenderingContext2D, width: number, height: number, input: RenderInput): void {
  const anchor = { x: width / 2, y: height * ANCHOR_Y_RATIO };
  const cameraWorld: WorldPoint = { x: input.camera.x, z: input.camera.z };

  ctx.fillStyle = VISUAL_CONFIG.background;
  ctx.fillRect(0, 0, width, height);

  for (const segment of input.segments) drawSegment(ctx, segment, cameraWorld, anchor);
  drawTrail(ctx, input.trail, cameraWorld, anchor);
  drawPlayer(ctx, input, cameraWorld, anchor);
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
  const baseHeight = PLATFORM_THICKNESS + bob - sink;
  const topHeight = baseHeight + PLAYER_HEIGHT;
  const alpha = isFalling ? 1 - input.fallProgress : 1;

  const s = PLAYER_SIZE;
  const { x: cx, z: cz } = input.player;
  const back = { x: cx - s, z: cz - s };
  const right = { x: cx + s, z: cz - s };
  const front = { x: cx + s, z: cz + s };
  const left = { x: cx - s, z: cz + s };

  const at = (point: { x: number; z: number }, height: number) => toScreen({ ...point, height }, cameraWorld, anchor);

  ctx.globalAlpha = alpha;
  ctx.fillStyle = VISUAL_CONFIG.playerSide;
  fillQuad(ctx, at(right, topHeight), at(front, topHeight), at(front, baseHeight), at(right, baseHeight));
  fillQuad(ctx, at(front, topHeight), at(left, topHeight), at(left, baseHeight), at(front, baseHeight));

  ctx.fillStyle = withAlpha(isFalling ? VISUAL_CONFIG.playerFallen : VISUAL_CONFIG.player, 1);
  fillQuad(ctx, at(back, topHeight), at(right, topHeight), at(front, topHeight), at(left, topHeight));
  ctx.globalAlpha = 1;
}
