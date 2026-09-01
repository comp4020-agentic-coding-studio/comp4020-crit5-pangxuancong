import { describe, expect, it } from "vitest";
import { turnClockwise, directionForSegment } from "../src/scripts/utils/math";

// Spec line: "click/tap → rotate direction by 90 degrees", always clockwise
// — the entire input space this game has.
describe("turnClockwise", () => {
  it("cycles east -> south -> west -> north -> east", () => {
    expect(turnClockwise("east")).toBe("south");
    expect(turnClockwise("south")).toBe("west");
    expect(turnClockwise("west")).toBe("north");
    expect(turnClockwise("north")).toBe("east");
  });
});

describe("directionForSegment", () => {
  it("derives direction from segment index alone, starting east", () => {
    expect(directionForSegment(0)).toBe("east");
    expect(directionForSegment(1)).toBe("south");
    expect(directionForSegment(2)).toBe("west");
    expect(directionForSegment(3)).toBe("north");
    expect(directionForSegment(4)).toBe("east");
  });
});
