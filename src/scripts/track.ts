// One entry per beat. `corner: true` means the correct action at that beat is
// a click/tap; `corner: false` means the correct action is to do nothing.
// Either mismatch — clicking on a straight beat, or missing a corner beat —
// sends the player off the track edge.
export interface TrackStep {
  corner: boolean;
}

export type Track = TrackStep[];

const BEATS_PER_BAR = 8;

interface Section {
  bars: number;
  // beat positions (0-indexed, within each bar) that require a click.
  cornerBeats: number[];
}

// Corner density ramps up the way the Canon's own voices stack up: sparse
// while it's just the bass line, denser as the melodic variations layer on.
// This is the only difficulty knob — no separate hand-tuned curve.
const SECTIONS: Section[] = [
  { bars: 4, cornerBeats: [3] },
  { bars: 4, cornerBeats: [1, 5] },
  { bars: 4, cornerBeats: [0, 2, 4, 6] },
  { bars: 4, cornerBeats: [0, 1, 3, 4, 5, 7] },
];

export function buildTrack(sections: Section[] = SECTIONS): Track {
  const track: Track = [];
  for (const section of sections) {
    for (let bar = 0; bar < section.bars; bar++) {
      for (let beat = 0; beat < BEATS_PER_BAR; beat++) {
        track.push({ corner: section.cornerBeats.includes(beat) });
      }
    }
  }
  return track;
}

export const TRACK: Track = buildTrack();
export { BEATS_PER_BAR };
