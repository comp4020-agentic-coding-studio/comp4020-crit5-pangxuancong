import { describe, expect, it } from "vitest";
import {
  beatIndexFromSongTime,
  beatPhaseFromSongTime,
  nearestBeatDistance,
  secondsPerBeat,
} from "../src/scripts/audio/RhythmClock";
import { getTimingGrade } from "../src/scripts/game/TurnTiming";

// Spec line: turn timing is graded against the shared beat grid, never a
// frame-rate-driven timer (PLAN.md §1/§2/§45).
describe("rhythm math (pure, no AudioContext)", () => {
  it("derives seconds-per-beat from BPM", () => {
    expect(secondsPerBeat(120)).toBeCloseTo(0.5);
  });

  it("derives the beat index from song time", () => {
    expect(beatIndexFromSongTime(2.1, 120)).toBe(4);
  });

  it("derives beat phase within the current beat", () => {
    expect(beatPhaseFromSongTime(2.1, 120)).toBeCloseTo(0.2, 5);
  });

  it("measures distance to the nearest beat in either direction", () => {
    expect(nearestBeatDistance(2.0, 120)).toBeCloseTo(0, 5); // exactly on a beat
    expect(nearestBeatDistance(2.05, 120)).toBeCloseTo(0.05, 5); // just after
    expect(nearestBeatDistance(2.45, 120)).toBeCloseTo(0.05, 5); // just before the next
  });
});

describe("getTimingGrade", () => {
  it("grades a near-exact hit as perfect", () => {
    expect(getTimingGrade(0.04)).toBe("perfect");
  });

  it("grades a slightly off hit as good", () => {
    expect(getTimingGrade(0.1)).toBe("good");
  });

  it("grades a loose hit as normal", () => {
    expect(getTimingGrade(0.2)).toBe("normal");
  });
});
