import type { TimingGrade } from "../game/TurnTiming";

// Dev-only synchronization readout (PLAN.md §38, adapted for a beatmap
// timeline rather than a generic BPM grid) — never present in a production
// build.
export function drawDebugOverlay(
  ctx: CanvasRenderingContext2D,
  songTime: number | null,
  nextCornerTime: number | null,
  lastGrade: TimingGrade | null,
): void {
  if (!import.meta.env.DEV) return;

  const lines =
    songTime === null
      ? ["audio not started"]
      : [
          `song ${songTime.toFixed(2)}s`,
          `next corner ${nextCornerTime !== null ? `${nextCornerTime.toFixed(2)}s (in ${(nextCornerTime - songTime).toFixed(2)}s)` : "-"}`,
          `last turn: ${lastGrade ?? "-"}`,
        ];

  ctx.save();
  ctx.font = "12px monospace";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  lines.forEach((line, index) => ctx.fillText(line, 8, 8 + index * 14));
  ctx.restore();
}
