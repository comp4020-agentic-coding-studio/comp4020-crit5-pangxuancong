import { describe, expect, it } from "vitest";
import { CANON_LEFT_HAND, CANON_TIMELINE, timelineDuration } from "../src/scripts/music/canonTimeline";

// Regression guard for the left/right-hand misalignment: the accompaniment
// must change chord exactly where the melody's own harmony changes, not on
// a mechanical "divide the total duration evenly" schedule.
describe("CANON_LEFT_HAND stays aligned with the melody's harmony", () => {
  it("starts at the same time as the melody", () => {
    expect(CANON_LEFT_HAND[0].time).toBe(0);
  });

  it("covers the whole melody with no gaps or overlaps between chords", () => {
    for (let i = 0; i < CANON_LEFT_HAND.length - 1; i++) {
      const chordEnd = CANON_LEFT_HAND[i].time + CANON_LEFT_HAND[i].duration;
      expect(chordEnd).toBeCloseTo(CANON_LEFT_HAND[i + 1].time, 5);
    }
  });

  it("ends exactly when the melody ends", () => {
    const last = CANON_LEFT_HAND[CANON_LEFT_HAND.length - 1];
    expect(last.time + last.duration).toBeCloseTo(timelineDuration(CANON_TIMELINE), 5);
  });

  it("changes chord only at a time the melody itself marks a new harmony", () => {
    const melodyHarmonyChanges = new Set(CANON_TIMELINE.filter((event) => event.accent).map((event) => event.time));
    for (const chord of CANON_LEFT_HAND) {
      expect(melodyHarmonyChanges.has(chord.time)).toBe(true);
    }
  });
});
