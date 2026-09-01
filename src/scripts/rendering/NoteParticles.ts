import { PLATFORM_THICKNESS, PLAYER_HEIGHT, VISUAL_CONFIG } from "../config/visual";
import { toScreen, withAlpha, type ScreenPoint, type WorldPoint } from "./Projection";

export type NoteParticleType = "note" | "dot" | "line";

// Particles live in world space, near the player, and are projected through
// the same camera/projection system as everything else (PLAN.md §16) — `y`
// here is a rendering-only vertical offset, exactly like platform height.
export interface NoteParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  age: number;
  lifetime: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  type: NoteParticleType;
}

const MAX_PARTICLES = 60;
const TYPES: NoteParticleType[] = ["note", "note", "dot", "line"]; // notes are the common case
const NOTE_BASE_SIZE = 18; // px-equivalent radius before scale — readable against a bright road (PLAN.md §8)

export function spawnNoteParticles(
  particles: NoteParticle[],
  origin: { x: number; z: number },
  count: number,
  midiNote?: number,
): void {
  // -1 (low) .. +1 (high), subtle bias only (PLAN.md §10).
  const pitchFactor = midiNote === undefined ? 0 : Math.max(-1, Math.min(1, (midiNote - 62) / 18));

  for (let i = 0; i < count; i++) {
    if (particles.length >= MAX_PARTICLES) particles.shift();

    const angle = (Math.random() - 0.5) * 1.4;
    const speed = (16 + Math.random() * 14) * (1 + pitchFactor * 0.2);
    const isDominant = i === 0 && count >= 8; // one clearly larger note on a strong burst

    particles.push({
      x: origin.x + (Math.random() - 0.5) * 4,
      y: PLATFORM_THICKNESS + PLAYER_HEIGHT * 0.6,
      z: origin.z + (Math.random() - 0.5) * 4,
      vx: Math.sin(angle) * speed,
      vz: Math.cos(angle) * speed * 0.35,
      vy: (75 + Math.random() * 35) * (1 + pitchFactor * 0.15),
      age: 0,
      lifetime: 0.55 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 3,
      scale: isDominant ? 1.65 - pitchFactor * 0.15 : (0.8 + Math.random() * 0.45) * (1 - pitchFactor * 0.1),
      type: isDominant ? "note" : TYPES[Math.floor(Math.random() * TYPES.length)],
    });
  }
}

// Rise, fan slightly, ease off — an elegant game-feel accent, not a physical
// explosion (PLAN.md §19). Vertical travel and lifetime are tuned so the
// rise reads clearly (~40-90 screen px) without lingering.
export function ageParticles(particles: NoteParticle[], dt: number): void {
  for (const particle of particles) {
    particle.age += dt;
    particle.x += particle.vx * dt;
    particle.z += particle.vz * dt;
    particle.y += particle.vy * dt;
    particle.vy -= 60 * dt;
    particle.rotation += particle.rotationSpeed * dt;
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].age >= particles[i].lifetime) particles.splice(i, 1);
  }
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function drawNoteParticles(
  ctx: CanvasRenderingContext2D,
  particles: NoteParticle[],
  cameraWorld: WorldPoint,
  anchor: ScreenPoint,
  zoom = 1,
): void {
  for (const particle of particles) {
    const life = particle.age / particle.lifetime;
    if (life >= 1) continue;

    const alpha = 1 - easeOutQuad(life);
    const screen = toScreen({ x: particle.x, z: particle.z, height: particle.y }, cameraWorld, anchor, zoom);

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.rotate(particle.rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = withAlpha(VISUAL_CONFIG.player, 1);
    ctx.strokeStyle = withAlpha(VISUAL_CONFIG.player, 1);
    drawShape(ctx, particle.type, particle.scale);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// Small procedural shapes only — no imported iconography (PLAN.md §17).
function drawShape(ctx: CanvasRenderingContext2D, type: NoteParticleType, scale: number): void {
  const s = NOTE_BASE_SIZE * scale;

  if (type === "dot") {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (type === "line") {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, 0);
    ctx.lineTo(s * 0.5, 0);
    ctx.stroke();
    return;
  }

  // A simplified musical note: a filled head and a stem.
  ctx.beginPath();
  ctx.ellipse(0, s * 0.32, s * 0.24, s * 0.17, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(s * 0.21, s * 0.26);
  ctx.lineTo(s * 0.21, -s * 0.48);
  ctx.stroke();
}
