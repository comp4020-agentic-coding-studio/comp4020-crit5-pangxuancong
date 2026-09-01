import { SECONDS_PER_BEAT } from "../config/audio";
import { GAMEPLAY_CONFIG } from "../config/gameplay";

// The one shared derivation: geometry is measured in beats, and this is the
// only place beats become world-space distance. Both the level layout and
// the audio scheduler read from the same BPM, so they cannot drift apart.
export const DISTANCE_PER_BEAT = GAMEPLAY_CONFIG.baseSpeed * SECONDS_PER_BEAT;
