import type { Segment } from "../game/Level";

// One deterministic level, four invisible phases (PLAN.md §11). Corner
// density is the difficulty knob, not speed — see PLAN.md §37.
//
// Phase 1 — SEE: wide, evenly spaced turns, nothing consecutive.
const PHASE_1_SEE: Segment[] = [{ beats: 4 }, { beats: 4 }, { beats: 4 }, { beats: 4 }];

// Phase 2 — REACT/PREDICT: turns close together, one back-to-back pair.
const PHASE_2_REACT: Segment[] = [
  { beats: 3 },
  { beats: 2 },
  { beats: 2 },
  { beats: 1 },
  { beats: 3 },
  { beats: 2 },
];

// Phase 3 — LISTEN: density holds, but the renderer's visibility horizon
// (config/visual.ts) shrinks across this phase — same geometry, less of it
// shown ahead of time.
const PHASE_3_LISTEN: Segment[] = [
  { beats: 2 },
  { beats: 1 },
  { beats: 2 },
  { beats: 1 },
  { beats: 2 },
  { beats: 1 },
  { beats: 2 },
];

// Phase 4 — REMEMBER/PERFORM: tightest spacing, shortest visibility horizon.
const PHASE_4_PERFORM: Segment[] = [
  { beats: 1 },
  { beats: 1 },
  { beats: 2 },
  { beats: 1 },
  { beats: 1 },
  { beats: 1 },
  { beats: 2 },
];

export const LEVEL_01: Segment[] = [...PHASE_1_SEE, ...PHASE_2_REACT, ...PHASE_3_LISTEN, ...PHASE_4_PERFORM];

// Segment-index boundaries, used by the renderer to pick a visibility
// horizon and by nothing the player ever sees directly.
export const PHASE_BOUNDARIES = {
  see: PHASE_1_SEE.length,
  reactPredict: PHASE_1_SEE.length + PHASE_2_REACT.length,
  listen: PHASE_1_SEE.length + PHASE_2_REACT.length + PHASE_3_LISTEN.length,
  performEnd: LEVEL_01.length,
};
