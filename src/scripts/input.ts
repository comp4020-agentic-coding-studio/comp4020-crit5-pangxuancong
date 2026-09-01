// Click and touch both trigger the single action this game has. No text
// anywhere invites either — the opening screen's own animation is the whole
// affordance.
export function bindTrigger(target: HTMLElement, onTrigger: () => void): void {
  const handle = (event: Event) => {
    event.preventDefault();
    onTrigger();
  };
  target.addEventListener("click", handle);
  target.addEventListener("touchstart", handle, { passive: false });
}
