import { RHYTHM_CONFIG } from "../config/rhythm";
import { ageParticles, spawnNoteParticles, type NoteParticle } from "../rendering/NoteParticles";
import type { TimingGrade } from "./TurnTiming";

// Every successful-turn presentation (sound, cube pulse, trail pulse,
// particles, camera micro-response) is coordinated from this one event —
// nothing triggers these independently in unrelated modules (PLAN.md §12).
export interface TurnEvent {
  position: { x: number; z: number };
  timingGrade: TimingGrade;
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

const PULSE_STRENGTH_BY_GRADE: Record<TimingGrade, number> = { perfect: 1, good: 0.7, normal: 0.35 };

const PARTICLE_COUNT_BY_GRADE: Record<TimingGrade, number> = {
  perfect: RHYTHM_CONFIG.particles.perfectCount,
  good: RHYTHM_CONFIG.particles.goodCount,
  normal: RHYTHM_CONFIG.particles.normalCount,
};

const PULSE_DECAY_RATE = 8; // per second — ~100-180ms felt duration

export function applyTurnFeedback(
  state: FeedbackState,
  event: TurnEvent,
  playAccent: (grade: TimingGrade) => void,
): void {
  playAccent(event.timingGrade);

  state.cubeScale = Math.max(state.cubeScale, CUBE_SCALE_BY_GRADE[event.timingGrade]);
  const strength = PULSE_STRENGTH_BY_GRADE[event.timingGrade];
  state.trailPulse = Math.max(state.trailPulse, strength);
  state.cameraPulse = Math.max(state.cameraPulse, strength);
  state.lastGrade = event.timingGrade;

  spawnNoteParticles(state.particles, event.position, PARTICLE_COUNT_BY_GRADE[event.timingGrade]);
}

export function decayFeedback(state: FeedbackState, dt: number): void {
  const decay = Math.exp(-PULSE_DECAY_RATE * dt);
  state.cubeScale = 1 + (state.cubeScale - 1) * decay;
  state.trailPulse *= decay;
  state.cameraPulse *= decay;
  ageParticles(state.particles, dt);
}
