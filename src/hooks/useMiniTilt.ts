import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import gsap from "gsap";

function useMiniTilt(): RefObject<HTMLDivElement | null> {
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

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
