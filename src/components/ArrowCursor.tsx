// src/components/ArrowCursor.tsx
import { useEffect } from "react";
import useArrowCursor from "../hooks/useArrowCursor";

/**
 * The page's pointer: a hollow arrowhead that leans into the direction of
 * travel. Renders nothing on a touch device, or for anyone who has asked for
 * reduced motion -- see useArrowCursor for why each case bows out.
 */
function ArrowCursor() {
  const { cursorRef, isEnabled } = useArrowCursor();

  // The native cursor is only hidden once this component is actually on
  // screen and drawing a replacement. Doing it from CSS alone would leave a
  // pointer-less page if the bundle failed to run -- and would hide the
  // system cursor from the very people the isEnabled check exists to spare.
  useEffect(() => {
    if (!isEnabled) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");
    return () => root.classList.remove("has-custom-cursor");
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    // Offset by margin, not by a translate utility: GSAP owns `transform` on
    // this element, so the offset has to live somewhere it cannot be
    // overwritten. `left-0 top-0` keeps x/y equal to client coords, and the
    // half-size negative margins put the box's CENTRE on the pointer.
    //
    // The centre is where the SVG puts the arrow's TIP -- see the viewBox
    // below. That is what makes this a cursor rather than a decoration: the
    // point you aim with is the point that receives the click, and rotation
    // (origin 50% 50% by default) pivots about it, so changing direction
    // swings the tail while the tip stays exactly under your hand.
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[9999] -mt-3 -ml-[18px] h-6 w-9 text-ink opacity-0 transition-opacity duration-200 will-change-transform dark:text-paper"
    >
      {/* The turn goes on this div, not on the <svg> itself. Rotating the
          root <svg> was measured to do nothing: the tween ran, but the
          element's rendered matrix stayed identity. A plain div has no such
          ambiguity, and it boxes the SVG exactly, so the default
          `transform-origin: 50% 50%` still lands on the tip. */}
      {/* `transition-[scale]`, not a transform utility: the press feedback
          animates the INDEPENDENT `scale` property so it composes with the
          rotation GSAP writes to `transform` instead of overwriting it. */}
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
          {/* The viewBox is centred on (0,0) and the tip is drawn AT (0,0),
              so the tip lands on the element's centre with no magic offsets
              to keep in sync. Drawn pointing east, so a screen-space angle
              from atan2 is the rotation with no correction. The concave rear
              edge is what reads as an arrow rather than a triangle. */}
          <path d="M0 0-16-7.5-11.5 0-16 7.5Z" />
        </svg>
      </div>
    </div>
  );
}

export default ArrowCursor;
