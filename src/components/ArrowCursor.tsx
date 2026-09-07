import { useEffect } from "react";
import useArrowCursor from "../hooks/useArrowCursor";

function ArrowCursor() {
  const { cursorRef, isEnabled } = useArrowCursor();

  useEffect(() => {
    if (!isEnabled) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");
    return () => root.classList.remove("has-custom-cursor");
  }, [isEnabled]);

  if (!isEnabled) return null;

  // No colour class here on purpose. The arrow's `color` is written inline
  // every ~40ms by useArrowCursor, which samples what is actually painted
  // under the pointer and picks pure black or pure white -- whichever WCAG
  // scores as the more readable of the two against that backdrop.
  //
  // It used to be `text-ink dark:text-paper`: the theme's own foreground,
  // which meant every surface already wearing that exact colour swallowed it
  // -- the `bg-ink` active nav link and the sliding density pill in light
  // mode, their `dark:bg-paper` mirrors in dark mode, and any shadcn
  // `bg-primary` button (--primary IS --color-ink).
  //
  // CSS difference blending was tried in between and rejected. It inverts
  // each channel independently, so it inverts HUE as well as lightness: over
  // graphite the arrow came out a pale tan, over the red `late` tokens a
  // cyan. Two arbitrary colours per surface instead of two fixed ones -- it
  // read as translucent rather than as a cursor. (Naming the Tailwind class
  // here would also be enough to make Tailwind emit the unused rule, since
  // v4 scans comments as candidate text.)
  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[9999] -mt-3 -ml-[18px] h-6 w-9 opacity-0 transition-opacity duration-200 will-change-transform"
    >
      <div
        data-arrow
        className="h-full w-full transition-[scale] duration-200 ease-out will-change-transform"
      >
        <svg
          width="36"
          height="24"
          viewBox="-18 -12 36 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path d="M0 0-16-7.5-11.5 0-16 7.5Z" />
        </svg>
      </div>
    </div>
  );
}

export default ArrowCursor;
