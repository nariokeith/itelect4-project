// src/components/CourseCard.tsx
import useMiniTilt from "../hooks/useMiniTilt";
import type { Course } from "../types/index";

interface CourseCardProps {
  course: Course;
  variant?: "default" | "compact"; // optional prop, union type
}

// Tailwind only sees COMPLETE class names as literal text, so these are
// written out in full rather than assembled from pieces.
// The hover lift is an arbitrary-property utility on `translate`, not a
// transform utility: GSAP owns `transform` on this element during the
// scroll reveal, and Tailwind v4 writes translate utilities to the separate
// `translate` property, so the two compose instead of fighting.
// (Careful writing that class name in prose -- Tailwind scans comments too,
// and a placeholder like the one that used to be here got compiled into a
// junk rule.)
const cardFace =
  "group relative flex flex-col overflow-hidden bg-linear-to-b from-bevel-hi to-bevel-lo shadow-card transition-[translate] duration-500 ease-[cubic-bezier(0.6,0,0.2,1)] hover:[translate:0_-8px] motion-reduce:transition-none motion-reduce:hover:[translate:0_0] dark:from-bevel-hi-dark dark:to-bevel-lo-dark dark:shadow-card-dark";

const tagChip =
  "rounded-full bg-ink/6 px-3 py-1 font-mono text-[0.625rem] font-medium tracking-[0.18em] text-graphite uppercase dark:bg-paper/10 dark:text-graphite-lift";

function CourseCard({ course, variant = "default" }: CourseCardProps) {
  const isCompact = variant === "compact";
  const cardRef = useMiniTilt();

  return (
    // No cursor-pointer -- the reference sets it (style.css:319) on a card
    // that does nothing when clicked. Nothing here is clickable either.
    <div
      ref={cardRef}
      className={`${cardFace} ${
        isCompact ? "gap-2 rounded-2xl p-3.5" : "gap-4 rounded-[28px] p-6"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* The mini tile is the card's one piece of physical furniture, so
            compact -- which exists to fit more on screen -- drops it. */}
        {!isCompact && (
          <div
            data-mini
            aria-hidden="true"
            className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-linear-to-b from-tile-hi to-tile-lo font-mono text-base font-semibold text-paper shadow-mini will-change-transform dark:from-tile-hi-dark dark:to-tile-lo-dark dark:text-ink dark:shadow-mini-dark"
          >
            {course.code.charAt(0)}
          </div>
        )}
        <span className={tagChip}>{course.units} units</span>
      </div>

      {/* a course code is an identifier -- mono, and set in full-strength
          ink: in this palette colour is reserved for reporting state */}
      <h3
        className={`font-mono font-medium tracking-tight text-ink dark:text-paper ${
          isCompact ? "text-sm" : "text-lg"
        }`}
      >
        {course.code}
      </h3>

      {!isCompact && (
        <p className="flex-1 text-base text-ink dark:text-paper">
          {course.title}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-rule pt-3.5 font-mono text-xs text-graphite dark:border-ink-line dark:text-graphite-lift">
        <span>{course.semester}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          className="transition-[translate] duration-[400ms] ease-[cubic-bezier(0.6,0,0.2,1)] group-hover:[translate:3px_-3px] motion-reduce:transition-none motion-reduce:group-hover:[translate:0_0]"
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </div>
    </div>
  );
}

export default CourseCard;
