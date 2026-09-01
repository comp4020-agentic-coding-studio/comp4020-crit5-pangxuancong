import { describe, expect, it } from "vitest";
import { buildBeatmapRoad } from "../src/scripts/game/Beatmap";
import { CANON_TIMELINE } from "../src/scripts/music/canonTimeline";
import { GAMEPLAY_CONFIG } from "../src/scripts/config/gameplay";
import type { MusicEvent } from "../src/scripts/music/canonTimeline";

// Spec line: the level is a spatial representation of the music — long
// musical intervals become long segments, short ones become short segments
// (PLAN.md's beatmap revision, §2).
describe("buildBeatmapRoad", () => {
  it("creates one segment per consecutive pair of turn events, alternating axis", () => {
    const timeline: MusicEvent[] = [
      { time: 0, turn: true },
      { time: 2, turn: true },
      { time: 3, turn: true },
      { time: 5, turn: true },
    ];
    const { segments } = buildBeatmapRoad(timeline, 100, 40);

    expect(segments).toHaveLength(3);
    expect(segments.map((s) => s.axis)).toEqual(["x", "z", "x"]);
  });

  it("maps segment length directly from the interval between turn times", () => {
    const timeline: MusicEvent[] = [
      { time: 0, turn: true },
      { time: 2, turn: true }, // 2s interval
    ];
    const speed = 100;
    const { segments } = buildBeatmapRoad(timeline, speed, 40);

    expect(segments[0].endX - (segments[0].startX + 40 / 2)).toBeCloseTo(2 * speed, 5);
  });

  it("records each corner's expected time straight from the score", () => {
    const timeline: MusicEvent[] = [
      { time: 0, turn: true },
      { time: 1.5, turn: true, accent: "strong", midiNote: 67 },
    ];
    const { corners } = buildBeatmapRoad(timeline, 100, 40);

    expect(corners).toEqual([{ time: 1.5, accent: "strong", midiNote: 67 }]);
  });

  it("ignores passing notes that aren't marked as turns", () => {
    const timeline: MusicEvent[] = [
      { time: 0, turn: true },
      { time: 1, midiNote: 64 }, // passing note, no corner
      { time: 2, turn: true },
    ];
    const { segments } = buildBeatmapRoad(timeline, 100, 40);
    expect(segments).toHaveLength(1);
  });
});

describe("the shipped Canon validation section stays physically playable", () => {
  it("keeps every segment comfortably longer than the road width", () => {
    const { segments } = buildBeatmapRoad(CANON_TIMELINE, GAMEPLAY_CONFIG.baseSpeed, GAMEPLAY_CONFIG.pathWidth);
    for (const segment of segments) {
      const length = segment.axis === "x" ? segment.endX - segment.startX : segment.endZ - segment.startZ;
      expect(length).toBeGreaterThan(GAMEPLAY_CONFIG.pathWidth);
    }
  });

  it("turns on every note in the score — no piano attack goes unmatched by a corner", () => {
    const noteCount = CANON_TIMELINE.filter((event) => event.midiNote !== undefined).length;
    const turnCount = CANON_TIMELINE.filter((event) => event.turn).length;
    expect(turnCount).toBe(noteCount);

    const { corners } = buildBeatmapRoad(CANON_TIMELINE, GAMEPLAY_CONFIG.baseSpeed, GAMEPLAY_CONFIG.pathWidth);
    expect(corners).toHaveLength(noteCount - 1);
  });
});
