import { PLATFORM_THICKNESS, PLAYER_HEIGHT, PLAYER_SIZE, VISUAL_CONFIG } from "../config/visual";
import { getAnticipationEmphasis } from "../game/Anticipation";
import type { GameState } from "../game/GameState";
import type { PlayerRuntime } from "../game/Player";
import type { RoadSegment } from "../game/Road";
import type { TimingGrade } from "../game/TurnTiming";
import { drawBackground, type BackgroundState } from "./Background";
import { drawDebugOverlay } from "./DebugOverlay";
import { drawNoteParticles, type NoteParticle } from "./NoteParticles";
import { drawSegment } from "./Platform";
import { drawTrail } from "./TrailRenderer";
import { fillQuad, toScreen, withAlpha, type WorldPoint } from "./Projection";

export interface RenderInput {
  state: GameState;
  segments: RoadSegment[];
  cornerTimes: number[]; // the expected turn time for each segment's corner, straight from the score
  songTime: number;
  musicalIntensity: number; // 0..1, how far into the arrangement the environment should read
  player: PlayerRuntime;
  trail: { x: number; z: number }[];
  camera: { x: number; z: number };
  idlePhase: number;
  fallProgress: number; // 0 (just fell) .. 1 (fully settled)
  cubeScale: number;
  trailPulse: number;
  cameraPulse: number; // drives the shared zoom pulse (PLAN.md §11)
  particles: NoteParticle[];
  beatPulse: number;
  background: BackgroundState;
  lastGrade: TimingGrade | null;
  audioStarted: boolean;
  nextCornerTime: number | null;
}

// The player sits in the lower third of the frame, not centred — the camera
// leads in the direction of travel (game/Camera.ts) so most of the visible
// space ahead is upcoming road, not travelled trail.
const ANCHOR_Y_RATIO = 0.62;
const ZOOM_PULSE_MAX = 0.012; // PLAN.md §11: 1.0 -> ~1.012 -> 1.0, never a shake

export function render(ctx: CanvasRenderingContext2D, width: number, height: number, input: RenderInput): void {
  const anchor = { x: width / 2, y: height * ANCHOR_Y_RATIO };
  const cameraWorld: WorldPoint = { x: input.camera.x, z: input.camera.z };
  const zoom = 1 + input.cameraPulse * ZOOM_PULSE_MAX;

  drawBackground(ctx, width, height, cameraWorld, anchor, input.background, input.beatPulse, input.musicalIntensity, zoom);
  drawPlatforms(ctx, input, cameraWorld, anchor, zoom);
  drawTrail(ctx, input.trail, cameraWorld, anchor, input.trailPulse, zoom);
  drawPlayer(ctx, input, cameraWorld, anchor, zoom);
  drawNoteParticles(ctx, input.particles, cameraWorld, anchor, zoom);
  drawDebugOverlay(ctx, input.audioStarted ? input.songTime : null, input.nextCornerTime, input.lastGrade);
}

function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  input: RenderInput,
  cameraWorld: WorldPoint,
  anchor: { x: number; y: number },
  zoom: number,
): void {
  input.segments.forEach((segment, index) => {
    const cornerTime = input.cornerTimes[index];
    const anticipation = cornerTime !== undefined ? getAnticipationEmphasis(cornerTime, input.songTime) : 0;
    const emphasis = Math.max(anticipation, input.beatPulse * 3);
    drawSegment(ctx, segment, cameraWorld, anchor, emphasis, zoom);
  });
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  input: RenderInput,
  cameraWorld: WorldPoint,
  anchor: { x: number; y: number },
  zoom: number,
): void {
  const isFalling = input.state === "falling";
  const bob = input.state === "ready" ? Math.sin(input.idlePhase * 3) * 4 : 0;
  const sink = isFalling ? input.fallProgress * 50 : 0;
  const baseHeight = PLATFORM_THICKNESS + bob - sink;
  const topHeight = baseHeight + PLAYER_HEIGHT;
  const alpha = isFalling ? 1 - input.fallProgress : 1;

  const s = PLAYER_SIZE * input.cubeScale;
  const { x: cx, z: cz } = input.player;
  const back = { x: cx - s, z: cz - s };
  const right = { x: cx + s, z: cz - s };
  const front = { x: cx + s, z: cz + s };
  const left = { x: cx - s, z: cz + s };

  const at = (point: { x: number; z: number }, height: number) => toScreen({ ...point, height }, cameraWorld, anchor, zoom);

  ctx.globalAlpha = alpha;
  ctx.fillStyle = VISUAL_CONFIG.playerSide;
  fillQuad(ctx, at(right, topHeight), at(front, topHeight), at(front, baseHeight), at(right, baseHeight));
  fillQuad(ctx, at(front, topHeight), at(left, topHeight), at(left, baseHeight), at(front, baseHeight));

  ctx.fillStyle = withAlpha(isFalling ? VISUAL_CONFIG.playerFallen : VISUAL_CONFIG.player, 1);
  fillQuad(ctx, at(back, topHeight), at(right, topHeight), at(front, topHeight), at(left, topHeight));
  ctx.globalAlpha = 1;
}
