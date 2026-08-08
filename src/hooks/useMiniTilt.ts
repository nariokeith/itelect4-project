// src/hooks/useMiniTilt.ts
import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import gsap from "gsap";

/**
 * Rotates the [data-mini] tile inside the returned ref's element while that
 * element is hovered -- the reference's f-card mini-tile effect
 * (script.js:242-262).
 *
 * This lives in JS rather than a Tailwind utility because back.out and
 * elastic.out are overshoot curves CSS cannot express.
 *
 * It targets a data attribute rather than a class because every class in
 * this project is a Tailwind utility; a bare selector class carrying no
 * styles would read as a hand-written CSS class at a glance.
 */
function useMiniTilt(): RefObject<HTMLDivElement | null> {
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // gsap.context gives us one revert() for everything created inside,
    // which is what makes StrictMode's double mount safe: the first mount
    // is fully undone, so tweens do not stack.
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // No reduce branch: a hover rotation has no resting state to restore,
      // because it only exists while the pointer is over the card.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const mini = card.querySelector<HTMLElement>("[data-mini]");
        if (!mini) return;

        const onEnter = (): void => {
          gsap.to(mini, {
            rotate: -8,
            y: -4,
            scale: 1.08,
            duration: 0.5,
            ease: "back.out(1.6)",
          });
        };

        const onLeave = (): void => {
          gsap.to(mini, {
            rotate: 0,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "elastic.out(1, 0.6)",
          });
        };

        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);

        return () => {
          card.removeEventListener("mouseenter", onEnter);
          card.removeEventListener("mouseleave", onLeave);
        };
      });
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return cardRef;
}

export default useMiniTilt;
