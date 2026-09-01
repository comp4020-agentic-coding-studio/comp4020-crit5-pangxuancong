import { getBeatFloat, getBeatIndex, getBeatPhase, getNearestBeatDistance, getSongTime, type RhythmClock } from "../audio/RhythmClock";
import { RHYTHM_CONFIG } from "../config/rhythm";
import type { TimingGrade } from "../game/TurnTiming";

// Dev-only synchronization readout (PLAN.md §38) — never present in a
// production build.
export function drawDebugOverlay(
  ctx: CanvasRenderingContext2D,
  clock: RhythmClock | null,
  lastGrade: TimingGrade | null,
): void {
  if (!import.meta.env.DEV) return;

  const lines = clock
    ? [
        `bpm ${RHYTHM_CONFIG.bpm}`,
        `song ${getSongTime(clock).toFixed(2)}s`,
        `beat ${getBeatIndex(clock)} (${getBeatFloat(clock).toFixed(2)})`,
        `phase ${getBeatPhase(clock).toFixed(2)}`,
        `nearest-beat err ${(getNearestBeatDistance(clock) * 1000).toFixed(0)}ms`,
        `last turn: ${lastGrade ?? "-"}`,
      ]
    : [`bpm ${RHYTHM_CONFIG.bpm}`, "audio not started"];

  ctx.save();
  ctx.font = "12px monospace";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  lines.forEach((line, index) => ctx.fillText(line, 8, 8 + index * 14));
  ctx.restore();
}
