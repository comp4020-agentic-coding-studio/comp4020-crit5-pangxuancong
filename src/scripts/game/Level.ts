// A segment is entirely described by its length in beats. Direction is not
// stored: every segment boundary is a turn, and the only turn available is
// clockwise, so direction is a pure function of segment index
// (utils/math.ts's directionForSegment). Rhythm and geometry are the same
// data — there is no second, independently-tunable timeline to keep in sync.
export interface Segment {
  beats: number;
}

export function totalBeats(level: Segment[]): number {
  return level.reduce((sum, segment) => sum + segment.beats, 0);
}

// World-space distance from the level start to the end of each segment
// (i.e. each corner), in level order.
export function cornerDistances(level: Segment[], distancePerBeat: number): number[] {
  const distances: number[] = [];
  let cumulative = 0;
  for (const segment of level) {
    cumulative += segment.beats * distancePerBeat;
    distances.push(cumulative);
  }
  return distances;
}

// Beat index (from level start) at which each corner falls — used to line
// the audio accent up with the same events the geometry uses.
export function cornerBeatIndices(level: Segment[]): number[] {
  const indices: number[] = [];
  let cumulative = 0;
  for (const segment of level) {
    cumulative += segment.beats;
    indices.push(cumulative);
  }
  return indices;
}
