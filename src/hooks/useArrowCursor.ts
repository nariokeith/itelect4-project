// src/hooks/useArrowCursor.ts
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import gsap from "gsap";

/**
 * Drives a custom pointer: the returned element sits exactly on the mouse and
 * turns to face whichever way the hand is travelling (curzr's arrow pointer).
 *
 * `isEnabled` is reported rather than assumed, and the caller renders nothing
 * when it is false -- which leaves the real cursor in place. Two conditions
 * have to hold:
 *
 *   - a fine pointer. A touch screen has no hover state to draw, and the
 *     native tap behaviour should be left alone.
 *   - no reduced-motion preference. Replacing the system cursor also
 *     discards the size and contrast settings the OS applies to it, so
 *     anyone who has asked for less motion keeps the pointer they configured.
 *
 * Both are live queries: plugging a mouse into a tablet, or flipping the
 * accessibility setting, changes the answer mid-session.
 *
 * This lives in JS rather than CSS because the angle only exists as a
 * derivative of two mouse samples; there is no declarative form of it.
 */
interface ArrowCursor {
  cursorRef: RefObject<HTMLDivElement | null>;
  isEnabled: boolean;
}

// ===== SMOOTHING =====
// Both are "fraction of the remaining gap closed per 60fps frame", not per
// event -- see the dt correction in the ticker. Higher is snappier.
//
// Two stages, because smoothing the ANGLE alone is not enough: atan2 of a
// single raw delta is extremely noisy at low speeds, and feeding a jumpy
// target into a smooth follower still reads as jitter. So the velocity
// VECTOR is smoothed first, and the angle is taken from that.
const VELOCITY_SMOOTH = 0.35;
const ANGLE_SMOOTH = 0.2;

// Below this speed (px per frame, squared) the direction is meaningless and
// the arrow holds the angle it already has instead of wobbling in place.
const MIN_SPEED_SQ = 0.25;

// Long frames (a tab switch, a GC pause) would otherwise resolve the whole
// backlog in one step and snap. Clamp what any single frame can be worth.
const MAX_FRAME_MS = 50;

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const sync = (): void => setMatches(list.matches);

    sync();
    list.addEventListener("change", sync);
    return () => list.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

function useArrowCursor(): ArrowCursor {
  const cursorRef = useRef<HTMLDivElement>(null);

  const hasFinePointer = useMediaQuery("(pointer: fine)");
  const allowsMotion = useMediaQuery("(prefers-reduced-motion: no-preference)");
  const isEnabled = hasFinePointer && allowsMotion;

  useLayoutEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    const arrow = el.querySelector<HTMLDivElement>("[data-arrow]");
    if (!arrow) return;

    // Position and orientation are written to DIFFERENT elements on purpose.
    // gsap.quickSetter(el, "x") takes a fast path that writes a bare
    // `translate(...)`, which silently wipes any rotation on the same
    // element. So the wrapper is moved and the arrow inside it is turned.
    // It reads well too: the outer node is where you are, the inner node is
    // which way you are heading.
    const setX = gsap.quickSetter(el, "x", "px");
    const setY = gsap.quickSetter(el, "y", "px");
    const setRotation = gsap.quickSetter(arrow, "rotation", "deg");

    // Accumulated, deliberately NOT wrapped to [-180, 180): crossing due west
    // would read as +170 -> -170 and the arrow would spin the long way round.
    // Adding the short delta each time keeps the turn 20deg.
    let angle = 0;
    // the pointer, updated by events
    let px = 0;
    let py = 0;
    // the pointer as of the previous frame, so velocity is per-frame
    let fx = 0;
    let fy = 0;
    // smoothed velocity, the vector the angle is read from
    let vx = 0;
    let vy = 0;
    let isPlaced = false;
    let isDirty = false;

    // Events only record; they never touch the DOM. Writing a transform per
    // event is wasted work -- a 1000Hz mouse fires many samples per frame and
    // only the last one can ever be seen -- and it splits position and
    // rotation across different moments, which is what makes a cursor look
    // like it is coming apart. One write per frame, both properties together.
    const onMove = (e: PointerEvent): void => {
      // A pen or a finger should not drag the mouse cursor around.
      if (e.pointerType !== "mouse") return;

      px = e.clientX;
      py = e.clientY;
      isDirty = true;

      // The first sample has no previous point, so it has no direction: it
      // seeds the position and fades in, but must not rotate anything.
      if (!isPlaced) {
        isPlaced = true;
        fx = px;
        fy = py;
        setX(px);
        setY(py);
        el.style.opacity = "1";
      }
    };

    // gsap's ticker is the same rAF loop its tweens run on, so this stays in
    // step with the press animation instead of racing it.
    const tick = (_time: number, deltaMs: number): void => {
      if (!isPlaced) return;

      // Frames elapsed, not milliseconds: it makes the constants above mean
      // the same thing at 60Hz and 144Hz instead of the arrow turning nearly
      // three times faster on a high-refresh display.
      const frames = Math.min(deltaMs, MAX_FRAME_MS) / (1000 / 60);

      const dx = px - fx;
      const dy = py - fy;
      fx = px;
      fy = py;

      // Exact, every frame -- the tip is never behind the true pointer, which
      // is what separates "this is my cursor" from "a shape chasing it".
      if (isDirty) {
        setX(px);
        setY(py);
        isDirty = false;
      }

      const vk = 1 - Math.pow(1 - VELOCITY_SMOOTH, frames);
      vx += (dx - vx) * vk;
      vy += (dy - vy) * vk;

      if (vx * vx + vy * vy < MIN_SPEED_SQ) return;

      // The SVG is drawn pointing east, so screen angle == rotation.
      const target = (Math.atan2(vy, vx) * 180) / Math.PI;
      // JS % keeps the sign of the dividend, so the +540 is applied after the
      // first fold to guarantee a positive operand.
      const delta = ((((target - angle) % 360) + 540) % 360) - 180;
      angle += delta * (1 - Math.pow(1 - ANGLE_SMOOTH, frames));
      setRotation(angle);
    };

    // Press feedback rides the INDEPENDENT `scale` property, with its
    // transition declared in the markup. That keeps it clear of `transform`,
    // which the rotation above owns outright -- the same composition trick
    // CourseCard uses for its hover lift.
    const onDown = (): void => {
      arrow.style.scale = "0.72";
    };
    const onUp = (): void => {
      arrow.style.scale = "1";
    };

    // Leaving the window, or losing it to another app, should take the arrow
    // with it -- otherwise it sits frozen at the edge of the page. Opacity is
    // a plain style write with a CSS transition for the same reason as the
    // scale: nothing but the two quickSetters may touch a transform.
    const hide = (): void => {
      el.style.opacity = "0";
    };
    const show = (): void => {
      if (isPlaced) el.style.opacity = "1";
    };

    const root = document.documentElement;
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("blur", hide);
    root.addEventListener("pointerleave", hide);
    root.addEventListener("pointerenter", show);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", hide);
      root.removeEventListener("pointerleave", hide);
      root.removeEventListener("pointerenter", show);
      // gsap.context does not track ticker callbacks, so this one is on us --
      // miss it and StrictMode's second mount leaves two loops running.
      gsap.ticker.remove(tick);
    };
  }, [isEnabled]);

  return { cursorRef, isEnabled };
}

export default useArrowCursor;
