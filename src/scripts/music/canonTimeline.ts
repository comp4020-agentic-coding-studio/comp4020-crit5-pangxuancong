// The one authoritative musical event timeline (PLAN.md's beatmap
// revision, §1): every `time` below is the single source of truth that
// drives piano audio, level geometry, turn-timing grading, particle
// feedback, and background response. Nothing else independently
// approximates rhythm.
export interface MusicEvent {
  time: number; // seconds from song start
  midiNote?: number;
  velocity?: number;
  turn?: boolean;
  accent?: "normal" | "strong";
}

// Authoring tempo — used only to place these events on a readable grid
// while writing them. The exported array's `time` values (in seconds) are
// what every consumer actually reads; there is no live parallel clock.
const BEAT = 0.75; // 80 BPM

function at(beat: number): number {
  return beat * BEAT;
}

// A short (~21s) validation section (PLAN.md §17): the MELODY line of an
// original, simplified piano interpretation of the Canon-in-D harmonic
// skeleton (I - V - vi - iii - IV - I - IV - V), sparse at the start and
// denser toward the end. This is deliberately not auto-played — the player
// supplies the piano part by turning (audio/Sequencer.ts only schedules the
// accompaniment below; main.ts plays each melody note live, quantized to
// its own `time`, when the player turns for it).
export const CANON_TIMELINE: MusicEvent[] = [
  // I (D) — sparse open
  { time: at(0), midiNote: 62, velocity: 0.7, turn: true, accent: "strong" }, // spawn
  { time: at(2), midiNote: 66, velocity: 0.4, turn: true },
  { time: at(4), midiNote: 69, velocity: 0.65, turn: true, accent: "normal" }, // V (A)
  { time: at(6), midiNote: 66, velocity: 0.4, turn: true },
  { time: at(8), midiNote: 71, velocity: 0.65, turn: true, accent: "normal" }, // vi (Bm)
  { time: at(10), midiNote: 66, velocity: 0.6, turn: true },
  { time: at(12), midiNote: 61, velocity: 0.65, turn: true, accent: "normal" }, // iii (F#m)
  { time: at(13), midiNote: 66, velocity: 0.45, turn: true },
  { time: at(14), midiNote: 69, velocity: 0.6, turn: true },
  { time: at(16), midiNote: 67, velocity: 0.7, turn: true, accent: "strong" }, // IV (G)
  { time: at(17), midiNote: 71, velocity: 0.55, turn: true },
  { time: at(17.5), midiNote: 74, velocity: 0.4, turn: true },
  { time: at(18), midiNote: 69, velocity: 0.6, turn: true },
  { time: at(19), midiNote: 74, velocity: 0.6, turn: true },
  { time: at(19.5), midiNote: 71, velocity: 0.4, turn: true },
  { time: at(20), midiNote: 62, velocity: 0.7, turn: true, accent: "strong" }, // I (D) — return
  { time: at(21), midiNote: 66, velocity: 0.55, turn: true },
  { time: at(22), midiNote: 69, velocity: 0.6, turn: true },
  { time: at(22.5), midiNote: 74, velocity: 0.4, turn: true },
  { time: at(24), midiNote: 67, velocity: 0.65, turn: true, accent: "normal" }, // IV (G) — release begins
  { time: at(26), midiNote: 62, velocity: 0.55, turn: true },
  { time: at(28), midiNote: 62, velocity: 0.6, turn: true, accent: "strong" }, // resolution / section end
];

export function timelineDuration(timeline: MusicEvent[]): number {
  return timeline.length === 0 ? 0 : timeline[timeline.length - 1].time;
}

// A cheap, honest proxy for "musical density" over this monotonically
// building validation section: how far through it we are. The full
// composition (PLAN.md §3/§14) will have a real sparse→dense→resolve arc;
// this section only builds, so progress-through-section IS the density
// curve for now.
export function musicalIntensity(songTime: number, timeline: MusicEvent[]): number {
  const duration = timelineDuration(timeline);
  if (duration <= 0) return 0;
  return Math.min(1, Math.max(0, songTime / duration));
}

export interface BassNote {
  time: number;
  duration: number;
  midiNote: number;
  velocity: number;
}

// The ACCOMPANIMENT: the famous Canon-in-D ground bass (D-A-B-F#-G-D-G-A),
// held as long sustained notes rather than a busy walking line — this plays
// on its own fixed schedule regardless of the player, spanning exactly the
// same duration as CANON_TIMELINE so the two always line up.
const GROUND_BASS = [50, 45, 47, 54, 55, 50, 55, 45]; // D3 A2 B2 F#3 G3 D3 G3 A2
const BASS_REGION_BEATS = timelineDuration(CANON_TIMELINE) / BEAT / GROUND_BASS.length;

export const CANON_BASS: BassNote[] = GROUND_BASS.map((midiNote, index) => ({
  time: at(index * BASS_REGION_BEATS),
  duration: BASS_REGION_BEATS * BEAT,
  midiNote,
  velocity: 0.5,
}));
