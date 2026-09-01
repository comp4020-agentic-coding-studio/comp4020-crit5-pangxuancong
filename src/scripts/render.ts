import type { SimState } from "./sim";
import type { Track } from "./track";

const TILE_WIDTH = 64;
const TRACK_Y_RATIO = 0.55;
const VISIBLE_TILES_AHEAD = 8;
const VISIBLE_TILES_BEHIND = 2;

export interface Particle {
  x: number;
  y: number;
  age: number; // seconds since spawn
}

export const PARTICLE_LIFETIME = 0.5;

export interface RenderInput {
  state: SimState;
  track: Track;
  fractionalBeat: number; // 0..1 progress within the current beat, for smooth scroll
  idlePhase: number; // seconds; drives the pre-start idle sway only
  particles: Particle[];
}

export function render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, input: RenderInput): void {
  const { state, track, fractionalBeat, idlePhase, particles } = input;
  const width = canvas.width;
  const height = canvas.height;
  const trackY = height * TRACK_Y_RATIO;
  const playerX = width * 0.28;

  drawBackground(ctx, width, height, state.beatIndex);

  const scrollOffset = state.status === "running" ? fractionalBeat * TILE_WIDTH : 0;

  for (let i = -VISIBLE_TILES_BEHIND; i <= VISIBLE_TILES_AHEAD; i++) {
    const beatIndex = state.beatIndex + i;
    const step = track[beatIndex];
    if (!step) continue;
    const x = playerX + i * TILE_WIDTH - scrollOffset;
    drawTile(ctx, x, trackY, step, i === 0);
  }

  drawVoid(ctx, width, height, trackY);
  drawPlayer(ctx, playerX, trackY, state, idlePhase);
  drawParticles(ctx, particles);
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, beatIndex: number): void {
  const section = Math.floor(beatIndex / 32) % 4;
  const palettes = [
    ["#1b2a4a", "#0d1526"],
    ["#2a1b4a", "#150d26"],
    ["#4a1b2e", "#260d15"],
    ["#1b4a3a", "#0d261e"],
  ];
  const [top, bottom] = palettes[section];
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  trackY: number,
  step: { corner: boolean },
  isCurrent: boolean,
): void {
  const tileHeight = 26;
  ctx.fillStyle = step.corner ? (isCurrent ? "#fff3c4" : "#ffd166") : isCurrent ? "#ffffff" : "#e8eef5";
  ctx.fillRect(x - TILE_WIDTH / 2 + 4, trackY, TILE_WIDTH - 8, tileHeight);

  if (step.corner) {
    // The corner cue is purely visual: a raised marker standing above the
    // tile, readable by height and shape alone (not color hue alone).
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.moveTo(x, trackY - 22);
    ctx.lineTo(x - 8, trackY);
    ctx.lineTo(x + 8, trackY);
    ctx.closePath();
    ctx.fill();
  }
}

function drawVoid(ctx: CanvasRenderingContext2D, width: number, height: number, trackY: number): void {
  const gradient = ctx.createLinearGradient(0, trackY + 26, 0, height);
  gradient.addColorStop(0, "rgba(0,0,0,0.35)");
  gradient.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, trackY + 26, width, height - trackY - 26);
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  trackY: number,
  state: SimState,
  idlePhase: number,
): void {
  const bob = state.status === "idle" ? Math.sin(idlePhase * 3) * 4 : 0;
  let y = trackY - 10 + bob;
  let alpha = 1;

  if (state.status === "fallen") {
    y = trackY + 70;
    alpha = 0.5;
  }

  ctx.globalAlpha = alpha;
  ctx.fillStyle = state.status === "fallen" ? "#555b66" : "#2ec4b6";
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  ctx.font = "20px system-ui, sans-serif";
  ctx.textAlign = "center";
  for (const particle of particles) {
    const t = particle.age / PARTICLE_LIFETIME;
    if (t >= 1) continue;
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = "#fff3c4";
    ctx.fillText("♪", particle.x, particle.y - t * 30);
  }
  ctx.globalAlpha = 1;
}

export { TILE_WIDTH };
