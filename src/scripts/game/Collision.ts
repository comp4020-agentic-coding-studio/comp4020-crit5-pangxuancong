import { GAMEPLAY_CONFIG } from "../config/gameplay";

// distanceToCorner is signed world-space distance from the player to the
// next corner along the current segment: positive means "before the
// corner", negative means "already past it".

// The forgiving turn window (spec §6/§7): a click registers as a valid turn
// anywhere inside this region, not only at the exact corner pixel.
export function canTurn(distanceToCorner: number): boolean {
  return (
    distanceToCorner <= GAMEPLAY_CONFIG.turnToleranceBefore &&
    distanceToCorner >= -GAMEPLAY_CONFIG.turnToleranceAfter
  );
}

// The player stays supported until they've travelled past the corner beyond
// even the turn window's forgiveness — beyond that point they've walked off
// the segment into empty space instead of taking a turn.
export function isSupported(distanceToCorner: number): boolean {
  const fallThreshold = -(GAMEPLAY_CONFIG.turnToleranceAfter + GAMEPLAY_CONFIG.supportForgiveness);
  return distanceToCorner >= fallThreshold;
}
