import { RHYTHM_CONFIG } from "../config/rhythm";
import { ageParticles, spawnNoteParticles, type NoteParticle } from "../rendering/NoteParticles";
import type { TimingGrade } from "./TurnTiming";

// Every successful-turn presentation (sound, cube pulse, trail pulse,
// particles, camera micro-response) is coordinated from this one event —
// nothing triggers these independently in unrelated modules (PLAN.md §12).
export interface TurnEvent {
  position: { x: number; z: number };
  timingGrade: TimingGrade;
  midiNote?: number; // the corner's own note — biases particle motion (PLAN.md §10)
}

export interface FeedbackState {
  cubeScale: number; // decays toward 1
  trailPulse: number; // decays toward 0
  cameraPulse: number; // decays toward 0
  particles: NoteParticle[];
  lastGrade: TimingGrade | null;
}

export function createFeedbackState(): FeedbackState {
  return { cubeScale: 1, trailPulse: 0, cameraPulse: 0, particles: [], lastGrade: null };
}

const CUBE_SCALE_BY_GRADE: Record<TimingGrade, number> = {
  perfect: RHYTHM_CONFIG.feedback.perfectCubePulse,
  good: RHYTHM_CONFIG.feedback.goodCubePulse,
  normal: RHYTHM_CONFIG.feedback.normalCubePulse,
};

const PULSE_STRENGTH_BY_GRADE: Record<TimingGrade, number> = { perfect: 1, good: 0.65, normal: 0.3 };

const PARTICLE_COUNT_BY_GRADE: Record<TimingGrade, number> = {
  perfect: RHYTHM_CONFIG.particles.perfectCount,
  good: RHYTHM_CONFIG.particles.goodCount,
  normal: RHYTHM_CONFIG.particles.normalCount,
};

// Perfect's cube pulse (~1.20 peak) should read over ~120-160ms; the trail
// brighten should hold a touch longer (~150-250ms) — two decay rates rather
// than one shared constant (PLAN.md §11).
const CUBE_DECAY_RATE = 7; // ~140ms felt duration
const TRAIL_DECAY_RATE = 5; // ~200ms felt duration
const CAMERA_DECAY_RATE = 7;

export function applyTurnFeedback(
  state: FeedbackState,
  event: TurnEvent,
  playAccent: (grade: TimingGrade, midiNote?: number) => void,
): void {
  playAccent(event.timingGrade, event.midiNote);

  state.cubeScale = Math.max(state.cubeScale, CUBE_SCALE_BY_GRADE[event.timingGrade]);
  const strength = PULSE_STRENGTH_BY_GRADE[event.timingGrade];
  state.trailPulse = Math.max(state.trailPulse, strength);
  state.cameraPulse = Math.max(state.cameraPulse, strength);
  state.lastGrade = event.timingGrade;

  spawnNoteParticles(state.particles, event.position, PARTICLE_COUNT_BY_GRADE[event.timingGrade], event.midiNote);
}

export function decayFeedback(state: FeedbackState, dt: number): void {
  state.cubeScale = 1 + (state.cubeScale - 1) * Math.exp(-CUBE_DECAY_RATE * dt);
  state.trailPulse *= Math.exp(-TRAIL_DECAY_RATE * dt);
  state.cameraPulse *= Math.exp(-CAMERA_DECAY_RATE * dt);
  ageParticles(state.particles, dt);
}
