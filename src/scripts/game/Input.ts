// Click, tap and Space all trigger the single action this game has (PLAN.md
// §23). No text anywhere invites any of them — the opening geometry is the
// whole affordance.
export function bindTrigger(target: HTMLElement, onTrigger: () => void): void {
  const handlePointer = (event: Event) => {
    event.preventDefault();
    onTrigger();
  };
  target.addEventListener("pointerdown", handlePointer);

  const handleKey = (event: KeyboardEvent) => {
    if (event.code !== "Space") return;
    event.preventDefault(); // Space must not scroll the page
    onTrigger();
  };
  window.addEventListener("keydown", handleKey);
}
