# Crit 5 reflection

1. **What was the breakthrough that moved the work forward?**

   Two separate but related moments. The first was realizing that
   "successfully staying on the road" and "hitting the beat well" had to be
   completely different questions with completely different consequences —
   one decides whether you survive, the other only decides how loud the
   reward feels. Once that split was explicit, the timing-grade code
   stopped fighting the fairness of the collision code.

   The second, and the one I keep coming back to, was finding the clock
   drift bug ([`0541342`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-pangxuancong/commit/0541342)):
   the music was correctly scheduled against `AudioContext.currentTime`,
   but the player's own movement was still being integrated from
   `requestAnimationFrame`'s delta. It looked completely fine for the
   first several seconds and then audibly drifted out of the piano's
   rhythm. The breakthrough wasn't the fix itself — it was noticing that
   writing "use the audio clock" as a rule in one file doesn't make it
   true everywhere time is used. A principle has to be checked at every
   place it applies, not just the place it was first written down.

2. **What did this work change about who I want to be as a software
   developer?**

   I was surprised by how often the right move was to throw away a whole
   implementation rather than repair it — the first playable pass, then
   the entire movement model, both scrapped and rebuilt rather than
   patched. I used to think of a rewrite as a failure to plan well enough
   the first time. This project made it feel more like a normal, cheap
   part of finding out whether an idea actually works once it's playable,
   not just plausible on paper.

   It also changed how I think about directing an agent through detailed
   prompts instead of writing every line myself. The prompts I gave got
   more specific and more architectural over the course of this project —
   less "add rhythm feedback" and more "collision must be an area check in
   world space, never a screen-space or timing-window check." The
   discipline that mattered wasn't writing code, it was being precise
   enough about *why* a design decision was correct that the agent could
   apply it consistently across a dozen files, and specific enough that I
   could tell, from the result, whether it actually had been.
