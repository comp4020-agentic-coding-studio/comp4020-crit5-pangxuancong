import { RHYTHM_CONFIG } from "../config/rhythm";
import { toScreen, withAlpha, type ScreenPoint, type WorldPoint } from "./Projection";

// Three low-cost atmospheric layers (PLAN.md §21-27, evolving with musical
// density per §14): a gradient instead of flat black, distant decorative
// wireframes with no gameplay meaning, and sparse ambient particles — all
// far lower-contrast than the road, and all using the same parallax trick:
// scaling the camera offset applied to a layer, not recomputing anything
// expensive per frame.

export interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

interface DistantShape {
  x: number;
  z: number;
  width: number;
  height: number;
  parallax: number;
}

interface AmbientParticle {
  x: number;
  z: number;
  vx: number;
  vz: number;
  size: number;
  parallax: number;
}

export interface BackgroundState {
  shapes: DistantShape[];
  particles: AmbientParticle[];
  flowTime: number;
}

interface FlowBand {
  yRatio: number; // vertical position as a fraction of canvas height
  amplitude: number;
  wavelength: number;
  speed: number;
  phaseOffset: number;
  lineWidth: number;
  hue: number;
}

// Purely decorative, screen-space wavy bands drifting sideways — an
// atmospheric "flowing" layer, sitting in the empty sky above the road
// (the road itself lives in the lower ~40% of the frame — PLAN.md's
// atmosphere pass). Not projected through world space: nothing here needs
// to line up with gameplay geometry.
const FLOW_BANDS: FlowBand[] = [
  { yRatio: 0.16, amplitude: 22, wavelength: 340, speed: 14, phaseOffset: 0, lineWidth: 26, hue: 210 },
  { yRatio: 0.28, amplitude: 16, wavelength: 260, speed: -10, phaseOffset: 1.8, lineWidth: 18, hue: 250 },
  { yRatio: 0.4, amplitude: 12, wavelength: 200, speed: 8, phaseOffset: 3.4, lineWidth: 14, hue: 190 },
];

const PADDING = 260;
const MAX_SHAPES = 14;

export function createBackgroundState(bounds: Bounds): BackgroundState {
  const width = bounds.maxX - bounds.minX + PADDING * 2;
  const height = bounds.maxZ - bounds.minZ + PADDING * 2;

  const shapes: DistantShape[] = Array.from({ length: MAX_SHAPES }, () => ({
    x: bounds.minX - PADDING + Math.random() * width,
    z: bounds.minZ - PADDING + Math.random() * height,
    width: 14 + Math.random() * 30,
    height: 40 + Math.random() * 160,
    parallax: 0.12 + Math.random() * 0.13, // far background — PLAN.md §25
  }));

  const particles: AmbientParticle[] = Array.from({ length: RHYTHM_CONFIG.ambience.particleCount }, () => ({
    x: bounds.minX - PADDING + Math.random() * width,
    z: bounds.minZ - PADDING + Math.random() * height,
    vx: (Math.random() - 0.5) * 4,
    vz: (Math.random() - 0.5) * 4,
    size: 1 + Math.random() * 1.5,
    parallax: 0.3 + Math.random() * 0.2, // mid background — PLAN.md §25
  }));

  return { shapes, particles, flowTime: 0 };
}

export function updateBackground(state: BackgroundState, dt: number): void {
  for (const particle of state.particles) {
    particle.x += particle.vx * dt;
    particle.z += particle.vz * dt;
  }
  state.flowTime += dt;
}

// `intensity` (0..1) mirrors how far into the musical arrangement we are
// (music/canonTimeline.ts's musicalIntensity) — the environment gets
// visually richer as the piece does, not because of a fixed timer
// (PLAN.md §14).
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraWorld: WorldPoint,
  anchor: ScreenPoint,
  state: BackgroundState,
  beatPulse: number,
  intensity: number,
  zoom = 1,
): void {
  drawGradient(ctx, width, height, beatPulse);
  drawFlow(ctx, width, height, state.flowTime, beatPulse);
  drawShapes(ctx, state.shapes, cameraWorld, anchor, beatPulse, intensity, zoom);
  drawParticles(ctx, state.particles, cameraWorld, anchor, intensity, zoom);
}

function drawFlow(ctx: CanvasRenderingContext2D, width: number, height: number, flowTime: number, beatPulse: number): void {
  for (const band of FLOW_BANDS) {
    const y = height * band.yRatio;
    const drift = flowTime * band.speed;
    const alpha = 0.05 + beatPulse * 0.4;

    ctx.beginPath();
    ctx.moveTo(-band.wavelength, y);
    for (let x = -band.wavelength; x <= width + band.wavelength; x += 24) {
      const wave = Math.sin((x + drift) / band.wavelength * Math.PI * 2 + band.phaseOffset) * band.amplitude;
      ctx.lineTo(x, y + wave);
    }
    ctx.strokeStyle = `hsla(${band.hue}, 60%, 65%, ${alpha})`;
    ctx.lineWidth = band.lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

function drawGradient(ctx: CanvasRenderingContext2D, width: number, height: number, beatPulse: number): void {
  const lift = beatPulse * 6; // a few RGB points of lift, never an obvious flash
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `rgb(${8 + lift}, ${10 + lift}, ${18 + lift})`);
  gradient.addColorStop(0.55, `rgb(${12 + lift}, ${14 + lift}, ${24 + lift})`);
  gradient.addColorStop(1, `rgb(${18 + lift}, ${22 + lift}, ${32 + lift})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function parallaxScreen(
  point: { x: number; z: number },
  cameraWorld: WorldPoint,
  anchor: ScreenPoint,
  parallax: number,
  zoom: number,
): ScreenPoint {
  const scaledCamera: WorldPoint = { x: cameraWorld.x * parallax, z: cameraWorld.z * parallax };
  return toScreen(point, scaledCamera, anchor, zoom);
}

function drawShapes(
  ctx: CanvasRenderingContext2D,
  shapes: DistantShape[],
  cameraWorld: WorldPoint,
  anchor: ScreenPoint,
  beatPulse: number,
  intensity: number,
  zoom: number,
): void {
  const visibleCount = Math.max(3, Math.round(3 + (MAX_SHAPES - 3) * intensity));
  const alpha = (0.1 + beatPulse * 0.08) * (0.6 + intensity * 0.4);
  ctx.strokeStyle = withAlpha("#8fa4c8", alpha);
  ctx.lineWidth = 1;
  for (const shape of shapes.slice(0, visibleCount)) {
    const base = parallaxScreen(shape, cameraWorld, anchor, shape.parallax, zoom);
    ctx.strokeRect(base.x - shape.width / 2, base.y - shape.height, shape.width, shape.height);
  }
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: AmbientParticle[],
  cameraWorld: WorldPoint,
  anchor: ScreenPoint,
  intensity: number,
  zoom: number,
): void {
  ctx.fillStyle = withAlpha("#c9d6ef", 0.14 + intensity * 0.14);
  for (const particle of particles) {
    const screen = parallaxScreen(particle, cameraWorld, anchor, particle.parallax, zoom);
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
