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

// The only two colours the arrow is ever allowed to be.
const ARROW_ON_DARK = "#ffffff";
const ARROW_ON_LIGHT = "#000000";

// The relative luminance at which black and white are EQUALLY readable against
// the backdrop, so it is the honest place to switch between them. WCAG scores
// contrast as (L1 + 0.05) / (L2 + 0.05); setting white's score equal to
// black's gives (L + 0.05)^2 = 1.05 * 0.05, i.e. L = 0.1791. Above it a black
// arrow wins, below it a white one does. Not a hand-tuned 0.5 guess.
const CONTRAST_PIVOT = 0.1791;

// Sampling is throttled to ~25Hz rather than run every frame. Each sample
// costs an elementsFromPoint plus a getComputedStyle per element under the
// pointer, and 40ms of staleness on a colour that only ever flips between two
// values is invisible. The throttle is unconditional -- NOT "only when the
// pointer moves" -- because backgrounds move under a still cursor too: the
// density pill slides for 500ms while you hover it.
const SAMPLE_INTERVAL_MS = 40;

// getComputedStyle hands back whatever colour space the author wrote, and this
// project mixes hex with oklch (the chart ramp). Rather than hand-parse that
// zoo, paint the string onto a 1x1 canvas and read the pixel back -- if the
// browser can render the colour, this reads it. Results are memoised, because
// a page only ever uses a couple of dozen distinct background colours.
type Rgba = readonly [number, number, number, number];

const colorCache = new Map<string, Rgba | null>();
let colorCanvas: CanvasRenderingContext2D | null = null;

function parseColor(value: string): Rgba | null {
  const cached = colorCache.get(value);
  if (cached !== undefined) return cached;

  if (colorCanvas === null) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    colorCanvas = canvas.getContext("2d", { willReadFrequently: true });
  }

  let parsed: Rgba | null = null;
  if (colorCanvas !== null) {
    colorCanvas.clearRect(0, 0, 1, 1);
    colorCanvas.fillStyle = "#000";
    colorCanvas.fillStyle = value;
    colorCanvas.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = colorCanvas.getImageData(0, 0, 1, 1).data;
    parsed = a === 0 ? null : [r, g, b, a / 255];
  }

  colorCache.set(value, parsed);
  return parsed;
}

// sRGB -> linear, the gamma step WCAG requires before weighting the channels.
function toLinear(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

// What colour is ACTUALLY behind the point, flattened to one opaque value.
//
// elementsFromPoint -- plural -- is the load-bearing choice. The singular
// elementFromPoint returns only the topmost hit, which is wrong here: the
// density pill in Layout is an absolutely positioned sibling painted BEHIND
// its buttons, so hovering it returns the button, whose own background is
// transparent. Walking up from there finds the panel's translucent white and
// concludes "light", and the arrow turns black on a black pill -- the exact
// bug this is meant to fix. The plural call returns every element covering the
// point in paint order, topmost first, so the pill is in the list.
//
// Compositing therefore runs BACKWARDS through that list -- furthest first --
// laying each background over the last with source-over, which is the order
// the compositor itself paints in.
function sampleBackdrop(x: number, y: number): string | null {
  const stack = document.elementsFromPoint(x, y);
  if (stack.length === 0) return null;

  // The canvas under everything. body's background propagates to it, and body
  // is in the stack, so this only shows through if nothing paints at all.
  let r = 255;
  let g = 255;
  let b = 255;

  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const color = parseColor(getComputedStyle(stack[i]).backgroundColor);
    if (color === null) continue;

    const a = color[3];
    r += (color[0] - r) * a;
    g += (color[1] - g) * a;
    b += (color[2] - b) * a;
  }

  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  return luminance > CONTRAST_PIVOT ? ARROW_ON_LIGHT : ARROW_ON_DARK;
}

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
    let color = "";
    let sinceSampleMs = 0;

    // The SVG strokes with `currentColor`, so one inline `color` on the
    // wrapper repaints the arrow. Writing only on an actual change keeps this
    // off the style-recalc path for the frames where nothing flipped.
    const paint = (): void => {
      const next = sampleBackdrop(px, py);
      if (next === null || next === color) return;
      color = next;
      el.style.color = next;
    };

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
        paint();
        el.style.opacity = "1";
      }
    };

    const tick = (_time: number, deltaMs: number): void => {
      if (!isPlaced) return;

      // Read before write. elementsFromPoint needs current geometry, and
      // asking for it AFTER the transform writes below would force a
      // synchronous layout inside the same frame.
      sinceSampleMs += deltaMs;
      if (sinceSampleMs >= SAMPLE_INTERVAL_MS) {
        sinceSampleMs = 0;
        paint();
      }

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
