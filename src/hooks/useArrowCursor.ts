import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import gsap from "gsap";

interface ArrowCursor {
  cursorRef: RefObject<HTMLDivElement | null>;
  isEnabled: boolean;
}

const VELOCITY_SMOOTH = 0.35;
const ANGLE_SMOOTH = 0.2;

const MIN_SPEED_SQ = 0.25;

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

    const setX = gsap.quickSetter(el, "x", "px");
    const setY = gsap.quickSetter(el, "y", "px");
    const setRotation = gsap.quickSetter(arrow, "rotation", "deg");

    let angle = 0;
    let px = 0;
    let py = 0;
    let fx = 0;
    let fy = 0;
    let vx = 0;
    let vy = 0;
    let isPlaced = false;
    let isDirty = false;

    const onMove = (e: PointerEvent): void => {
      if (e.pointerType !== "mouse") return;

      px = e.clientX;
      py = e.clientY;
      isDirty = true;

      if (!isPlaced) {
        isPlaced = true;
        fx = px;
        fy = py;
        setX(px);
        setY(py);
        el.style.opacity = "1";
      }
    };

    const tick = (_time: number, deltaMs: number): void => {
      if (!isPlaced) return;

      const frames = Math.min(deltaMs, MAX_FRAME_MS) / (1000 / 60);

      const dx = px - fx;
      const dy = py - fy;
      fx = px;
      fy = py;

      if (isDirty) {
        setX(px);
        setY(py);
        isDirty = false;
      }

      const vk = 1 - Math.pow(1 - VELOCITY_SMOOTH, frames);
      vx += (dx - vx) * vk;
      vy += (dy - vy) * vk;

      if (vx * vx + vy * vy < MIN_SPEED_SQ) return;

      const target = (Math.atan2(vy, vx) * 180) / Math.PI;
      const delta = ((((target - angle) % 360) + 540) % 360) - 180;
      angle += delta * (1 - Math.pow(1 - ANGLE_SMOOTH, frames));
      setRotation(angle);
    };

    const onDown = (): void => {
      arrow.style.scale = "0.72";
    };
    const onUp = (): void => {
      arrow.style.scale = "1";
    };

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
      gsap.ticker.remove(tick);
    };
  }, [isEnabled]);

  return { cursorRef, isEnabled };
}

export default useArrowCursor;
