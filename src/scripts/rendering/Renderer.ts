import type { GameState } from "../game/GameState";
import { cornerDistances, type Segment } from "../game/Level";
import type { PathPoint } from "../game/Path";
import { segmentStart } from "../game/Path";
import { GAMEPLAY_CONFIG } from "../config/gameplay";
import { VISUAL_CONFIG, visibilityHorizon } from "../config/visual";
import type { Camera } from "../game/Camera";
import { drawTrail } from "./TrailRenderer";
import { drawPulses, withAlpha, type Pulse } from "./Effects";

export interface RenderInput {
  state: GameState;
  level: Segment[];
  pathPoints: PathPoint[];
  distancePerBeat: number;
  segmentIndex: number;
  distanceIntoSegment: number;
  playerX: number;
  playerY: number;
  camera: Camera;
  idlePhase: number;
  fallProgress: number; // 0 (just fell) .. 1 (fully settled)
  pulses: Pulse[];
}

// width/height are CSS pixels, not canvas.width/height — the caller has
// already scaled the context by devicePixelRatio, and every coordinate here
// goes through that same transform.
export function render(ctx: CanvasRenderingContext2D, width: number, height: number, input: RenderInput): void {
  const { camera } = input;

  ctx.fillStyle = VISUAL_CONFIG.background;
  ctx.fillRect(0, 0, width, height);

  const toScreen = (point: PathPoint) => ({
    x: width / 2 + (point.x - camera.x),
    y: height / 2 + (point.y - camera.y),
  });

  drawPath(ctx, input, toScreen);
  drawTrail(ctx, input.pathPoints, input.segmentIndex, input.distanceIntoSegment, toScreen, GAMEPLAY_CONFIG.pathWidth);

  const playerScreen = toScreen({ x: input.playerX, y: input.playerY });
  drawPlayer(ctx, input, playerScreen);

  const pulsesOnScreen = input.pulses.map((pulse) => ({ ...toScreen(pulse), age: pulse.age }));
  drawPulses(ctx, pulsesOnScreen);
}

function drawPath(
  ctx: CanvasRenderingContext2D,
  input: RenderInput,
  toScreen: (point: PathPoint) => { x: number; y: number },
): void {
  const { level, pathPoints, distancePerBeat, segmentIndex, distanceIntoSegment } = input;
  const corners = cornerDistances(level, distancePerBeat);
  const playerDistance = (segmentIndex === 0 ? 0 : corners[segmentIndex - 1]) + distanceIntoSegment;
  const horizon = visibilityHorizon(segmentIndex);

  ctx.lineCap = "round";
  ctx.lineWidth = GAMEPLAY_CONFIG.pathWidth;

  for (let i = segmentIndex; i < level.length; i++) {
    const segmentStartDistance = i === 0 ? 0 : corners[i - 1];
    const distanceAhead = segmentStartDistance - playerDistance;
    if (distanceAhead > horizon) break;

    const from = segmentStart(pathPoints, i);
    const to = pathPoints[i];
    const fade = 1 - Math.min(1, Math.max(0, distanceAhead) / horizon) * 0.7;

    ctx.strokeStyle = withAlpha(VISUAL_CONFIG.path, fade);
    const a = toScreen(from);
    const b = toScreen(to);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  input: RenderInput,
  screen: { x: number; y: number },
): void {
  const bob = input.state === "ready" ? Math.sin(input.idlePhase * 3) * 4 : 0;
  const fallOffset = input.state === "falling" ? input.fallProgress * 90 : 0;
  const alpha = input.state === "falling" ? 1 - input.fallProgress : 1;

  ctx.globalAlpha = alpha;
  ctx.fillStyle = input.state === "falling" ? VISUAL_CONFIG.playerFallen : VISUAL_CONFIG.player;
  ctx.beginPath();
  ctx.arc(screen.x, screen.y + bob + fallOffset, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
