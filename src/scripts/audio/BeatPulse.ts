import { RHYTHM_CONFIG } from "../config/rhythm";
import type { MusicEvent } from "../music/canonTimeline";

// The environment's rhythmic breathing is driven by the same timeline as
// everything else (PLAN.md §1: "background rhythmic response" is one of the
// things the one authoritative timeline must drive) — not a generic BPM
// grid. It decays from whichever accented event most recently sounded,
// strong accents pulsing harder than normal ones.
export function getMusicPulse(timeline: MusicEvent[], songTime: number): number {
  let strength = 0;
  let sinceAccent = Infinity;

  for (const event of timeline) {
    if (event.time > songTime) break;
    if (!event.accent) continue;
    const elapsed = songTime - event.time;
    if (elapsed < sinceAccent) {
      sinceAccent = elapsed;
      strength = event.accent === "strong" ? 1 : 0.5;
    }
  }

  if (!Number.isFinite(sinceAccent)) return 0;
  const envelope = Math.exp(-6 * sinceAccent);
  return strength * envelope * RHYTHM_CONFIG.ambience.beatPulseStrength;
}
