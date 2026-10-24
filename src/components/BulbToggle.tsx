import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import useUiStore from "../store/uiStore";

// Adapted from jh3y's "Tuggable Light Bulb!" (codepen.io/jh3y/pen/VwjgdLj).
// The pen loads MorphSVG from a CodePen URL; both plugins ship inside the
// gsap package we already have, so they come from there instead.
gsap.registerPlugin(Draggable, MorphSVGPlugin);

// The pen's own numbers: the cord's resting end, and how long each wobble of
// the cord takes.
const END_X = 98.7255;
const END_Y = 380.5405;
const CORD_DURATION = 0.1;
const VIEWBOX_HEIGHT = 481.081;

// The pen asks for a 50px tug on a bulb 50vmin tall. This one is ~76px tall,
// so a 50px pull would be most of the navbar -- 20px keeps the same feel.
const TUG_DISTANCE_PX = 20;

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The pen drives every colour from one --on variable. Here "on" IS light mode,
// so the same job is done by the palette's own dark: variants.
const cordColor = "stroke-graphite dark:stroke-graphite-lift";

function BulbToggle() {
  const isDarkMode = useUiStore((state) => state.isDarkMode);
  const toggleDarkMode = useUiStore((state) => state.toggleDarkMode);

  const sceneRef = useRef<SVGSVGElement>(null);
  const swingRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const ctx = gsap.context(() => {
      const cords = scene.querySelectorAll<SVGPathElement>("[data-cord]");
      const hit = scene.querySelector<SVGCircleElement>("[data-hit]");
      const dummy = scene.querySelector<SVGGElement>("[data-dummy]");
      const dummyCord = dummy?.querySelector("line");
      if (cords.length < 2 || !hit || !dummy || !dummyCord) return;

      // Draggable moves this detached div, never the SVG itself. Its x and y
      // are read back and written onto the dummy cord's end point.
      const proxy = document.createElement("div");
      const reset = (): void => {
        gsap.set(proxy, { x: END_X, y: END_Y });
      };
      reset();

      // The straight cord morphs through the four wavy ones and back. It no
      // longer flips the theme in onStart like the pen did -- a click on the
      // bulb toggles too, so the toggle lives in pull() and this is just the
      // animation.
      const swing = gsap.timeline({
        paused: true,
        onStart: () => {
          gsap.set([dummy, hit], { display: "none" });
          gsap.set(cords[0], { display: "block" });
        },
        onComplete: () => {
          gsap.set([dummy, hit], { display: "block" });
          gsap.set(cords[0], { display: "none" });
          reset();
        },
      });
      for (let i = 1; i < cords.length; i += 1) {
        swing.add(
          gsap.to(cords[0], {
            morphSVG: cords[i],
            duration: CORD_DURATION,
            repeat: 1,
            yoyo: true,
          })
        );
      }
      swingRef.current = swing;

      let startX = 0;
      let startY = 0;
      // SVG units per screen pixel. The pen got away with ignoring this
      // because its bulb was drawn close to 1:1; at navbar size one pixel of
      // drag is ~6 units, and without it the cord would barely follow.
      let unitsPerPx = 1;

      Draggable.create(proxy, {
        trigger: hit,
        type: "x,y",
        onPress: function (this: Draggable) {
          startX = this.pointerX;
          startY = this.pointerY;
          unitsPerPx = VIEWBOX_HEIGHT / scene.getBoundingClientRect().height;
        },
        onDrag: function (this: Draggable) {
          gsap.set(dummyCord, {
            attr: {
              x2: END_X + (this.x - END_X) * unitsPerPx,
              y2: END_Y + (this.y - END_Y) * unitsPerPx,
            },
          });
        },
        onRelease: function (this: Draggable) {
          const travelled = Math.hypot(
            this.pointerX - startX,
            this.pointerY - startY
          );
          gsap.to(dummyCord, {
            attr: { x2: END_X, y2: END_Y },
            duration: prefersReducedMotion() ? 0 : CORD_DURATION,
            onComplete: () => {
              if (travelled > TUG_DISTANCE_PX) {
                // getState(), not the toggleDarkMode above: this callback is
                // created once and would otherwise hold a stale closure.
                useUiStore.getState().toggleDarkMode();
                if (!prefersReducedMotion()) swing.restart();
              } else {
                reset();
              }
            },
          });
        },
      });
    }, scene);

    // Reverts every tween, the timeline AND the Draggable -- Draggable
    // registers itself with the context it was created in.
    return () => {
      swingRef.current = null;
      ctx.revert();
    };
  }, []);

  // The pen could only be tugged. A real button means a click, Enter or Space
  // works too -- dragging must never be the only way (WCAG 2.5.7).
  const pull = (): void => {
    toggleDarkMode();
    if (!prefersReducedMotion()) swingRef.current?.restart();
  };

  return (
    <div className="relative h-7 w-8 shrink-0">
      <button
        type="button"
        onClick={pull}
        aria-label="Dark mode"
        aria-pressed={isDarkMode}
        className="absolute inset-x-0 -top-1.5 z-10 h-9 rounded-md focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink"
      />
      <svg
        ref={sceneRef}
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 left-1/2 h-19 w-auto -translate-x-1/2 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMinYMin"
        viewBox="0 0 197.451 481.081"
      >
        <defs>
          <marker
            id="bulb-cord-end"
            orient="auto"
            overflow="visible"
            refX="0"
            refY="0"
          >
            <path
              className={`fill-graphite dark:fill-graphite-lift ${cordColor}`}
              fillRule="evenodd"
              strokeWidth=".2666"
              d="M.98 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </marker>
          <clipPath id="bulb-cap-clip" clipPathUnits="userSpaceOnUse">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4.677"
              d="M-774.546 827.629s12.917-13.473 29.203-13.412c16.53.062 29.203 13.412 29.203 13.412v53.6s-8.825 16-29.203 16c-21.674 0-29.203-16-29.203-16z"
            />
          </clipPath>
        </defs>

        <g>
          {/* data-cord 0 is the straight cord that swings; 1-4 are only ever
              morph targets, so all five start hidden. */}
          {[
            "M123.228-28.56v150.493",
            "M123.228-28.59s28 8.131 28 19.506-18.667 13.005-28 19.507c-9.333 6.502-28 8.131-28 19.506s28 19.507 28 19.507",
            "M123.228-28.575s-20 16.871-20 28.468c0 11.597 13.333 18.978 20 28.468 6.667 9.489 20 16.87 20 28.467 0 11.597-20 28.468-20 28.468",
            "M123.228-28.569s16 20.623 16 32.782c0 12.16-10.667 21.855-16 32.782-5.333 10.928-16 20.623-16 32.782 0 12.16 16 32.782 16 32.782",
            "M123.228-28.563s-10 24.647-10 37.623c0 12.977 6.667 25.082 10 37.623 3.333 12.541 10 24.647 10 37.623 0 12.977-10 37.623-10 37.623",
          ].map((d) => (
            <path
              key={d}
              data-cord
              className={`hidden ${cordColor}`}
              markerEnd="url(#bulb-cord-end)"
              fill="none"
              strokeLinecap="square"
              strokeWidth="6"
              d={d}
              transform="translate(-24.503 256.106)"
            />
          ))}
          <g data-dummy className={cordColor} strokeWidth="6">
            <line
              markerEnd="url(#bulb-cord-end)"
              x1={END_X}
              x2={END_X}
              y1="240.5405"
              y2={END_Y}
            />
          </g>
          {/* The only part of the SVG that takes the pointer: the grab spot
              at the end of the cord. */}
          <circle
            data-hit
            className="pointer-events-auto"
            cx={END_X}
            cy={END_Y}
            r="60"
            fill="transparent"
          />
        </g>

        <g transform="translate(844.069 -645.213)">
          <path
            className="fill-rule transition-colors dark:fill-graphite"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4.677"
            d="M-774.546 827.629s12.917-13.473 29.203-13.412c16.53.062 29.203 13.412 29.203 13.412v53.6s-8.825 16-29.203 16c-21.674 0-29.203-16-29.203-16z"
          />
          <path
            className="fill-white/60 transition-colors dark:fill-paper/40"
            d="M-778.379 802.873h25.512v118.409h-25.512z"
            clipPath="url(#bulb-cap-clip)"
            transform="matrix(.52452 0 0 .90177 -368.282 82.976)"
          />
          <path
            className="fill-rule transition-colors dark:fill-graphite"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            d="M-774.546 827.629s12.917-13.473 29.203-13.412c16.53.062 29.203 13.412 29.203 13.412v0s-8.439 10.115-28.817 10.115c-21.673 0-29.59-10.115-29.59-10.115z"
          />
          <path
            className="stroke-ink transition-colors dark:stroke-graphite-lift"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4.677"
            d="M-774.546 827.629s12.917-13.473 29.203-13.412c16.53.062 29.203 13.412 29.203 13.412v53.6s-8.825 16-29.203 16c-21.674 0-29.203-16-29.203-16z"
          />
          <g
            className="stroke-pending transition-colors dark:stroke-graphite"
            fill="none"
            strokeLinecap="round"
            strokeWidth="5"
          >
            <path d="M-752.914 823.875l-8.858-33.06" />
            <path d="M-737.772 823.875l8.858-33.06" />
          </g>
          <path
            className="fill-pending-lift/50 stroke-ink transition-colors dark:fill-paper/10 dark:stroke-graphite-lift"
            strokeLinecap="round"
            strokeWidth="5"
            d="M-783.192 803.855c5.251 8.815 5.295 21.32 13.272 27.774 12.299 8.045 36.46 8.115 49.127 0 7.976-6.454 8.022-18.96 13.273-27.774 3.992-6.7 14.408-19.811 14.408-19.811 8.276-11.539 12.769-24.594 12.769-38.699 0-35.898-29.102-65-65-65-35.899 0-65 29.102-65 65 0 13.667 4.217 26.348 12.405 38.2 0 0 10.754 13.61 14.746 20.31z"
          />
          <path
            className="stroke-white/70 transition-colors dark:stroke-paper/50"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
            d="M-789.19 757.501a45.897 45.897 0 013.915-36.189 45.897 45.897 0 0129.031-21.957"
          />
        </g>
      </svg>
    </div>
  );
}

export default BulbToggle;
