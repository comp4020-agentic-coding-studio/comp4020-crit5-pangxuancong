export type Direction = "east" | "south" | "west" | "north";

// The only turn the player can ever make: always clockwise, always 90
// degrees. There is no left/right choice — this is the entire input space.
const CLOCKWISE_ORDER: Direction[] = ["east", "south", "west", "north"];

export function turnClockwise(direction: Direction): Direction {
  const index = CLOCKWISE_ORDER.indexOf(direction);
  return CLOCKWISE_ORDER[(index + 1) % CLOCKWISE_ORDER.length];
}

// Direction for the Nth segment of a level, given the path always starts
// facing east and turns clockwise once per segment boundary.
export function directionForSegment(index: number): Direction {
  return CLOCKWISE_ORDER[index % CLOCKWISE_ORDER.length];
}

export function directionVector(direction: Direction): { x: number; y: number } {
  switch (direction) {
    case "east":
      return { x: 1, y: 0 };
    case "south":
      return { x: 0, y: 1 };
    case "west":
      return { x: -1, y: 0 };
    case "north":
      return { x: 0, y: -1 };
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
