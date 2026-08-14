// src/styles/ui.ts
// GT2 kept these class strings at the top of App.tsx. Now that App.tsx is
// nothing but a route table, the pages that use them need a shared home --
// otherwise the same long string gets pasted into five files and they drift.
//
// Tailwind only sees COMPLETE class names as literal text. Every string below
// is written out in full, so the scanner still finds each class even though
// no JSX in this file references them.

// Chrome -- the nav bar, the controls, the search field -- sits a half step
// above the page on a faint frost. Content surfaces (cards, the submission
// tag) are fully opaque.
export const chromePanel =
  "bg-white/70 ring-1 ring-rule backdrop-blur-md shadow-[0_1px_2px_0_rgba(22,22,26,0.06)] dark:bg-ink-raise/70 dark:ring-ink-line";

export const quietButton =
  "rounded-md bg-white/70 px-3 py-1.5 font-mono text-xs text-graphite ring-1 ring-rule backdrop-blur-md transition hover:bg-white hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:bg-ink-raise/70 dark:text-graphite-lift dark:ring-ink-line dark:hover:bg-ink-raise dark:hover:text-paper dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink";

export const sectionLabel =
  "font-mono text-xs uppercase tracking-[0.18em] text-graphite dark:text-graphite-lift";

// Counts are data, so they take the full-strength ink rather than a hue --
// in this palette colour is reserved for reporting state.
export const sectionCount =
  "font-mono text-xs font-medium text-ink dark:text-paper";

export const sectionRule = "h-px flex-1 bg-rule dark:bg-ink-line";

// Every page opens with the same heading, so the size and weight live here
// rather than being retyped on each one.
export const pageHeading =
  "font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl dark:text-paper";

// The one shape used for "this record does not exist" -- a bad :code, a bad
// :id. It takes the `late` hue because in this palette colour reports state.
export const notFoundPanel =
  "rounded-2xl bg-white/70 p-6 ring-1 ring-late/25 backdrop-blur-md dark:bg-ink-raise/70 dark:ring-late-lift/25";

export const notFoundLabel =
  "font-mono text-xs uppercase tracking-[0.18em] text-late dark:text-late-lift";
