// src/components/Layout.tsx
// The frame every page renders inside. This replaces GT2's <Frame> component:
// same theme wrapper, same ArrowCursor, same page shell -- but with a nav bar
// on top and an <Outlet /> where the page body goes.
//
// It is a LAYOUT ROUTE. App.tsx nests every other route inside this one, so
// the nav is mounted once and survives navigation instead of being re-rendered
// per page. That is what makes clicking a link swap only the <Outlet /> body.
import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router";
import ArrowCursor from "./ArrowCursor";
import useToggle from "../hooks/useToggle";
import useAuthStore from "../store/authStore";
import { chromePanel, quietButton } from "../styles/ui";

// What Layout hands down through the <Outlet />. A page rendered by a route
// is not a child element, so props cannot be passed to it -- React Router's
// outlet context is the supported way across that gap, and CoursesPage reads
// it with useOutletContext<LayoutContext>().
export interface LayoutContext {
  isCompact: boolean;
}

// The classes every nav link shares, then the two variants. Active is the
// same ink/paper inversion the density pill uses, so the two controls in the
// nav agree with each other.
const baseLink =
  "rounded-md px-3 py-1.5 font-mono text-xs transition focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink";

const activeLink = `${baseLink} bg-ink font-medium text-paper dark:bg-paper dark:text-ink`;

const idleLink = `${baseLink} text-graphite hover:bg-ink/5 hover:text-ink dark:text-graphite-lift dark:hover:bg-paper/10 dark:hover:text-paper`;

type Metrics = { left: number; width: number };

function Layout() {
  // Dark mode MOVES here, out of GT2's App.tsx, so every page inherits it.
  const [isDarkMode, toggleDarkMode] = useToggle(false);
  // Density moves here too: it is global chrome, and CourseCard reads it on
  // whichever page happens to be showing cards.
  const [isCompact, toggleCompact] = useToggle(false);

  // Selectors, not the whole store: this component re-renders when userName
  // changes, not when some unrelated field does.
  const userName = useAuthStore((state) => state.userName);
  const logout = useAuthStore((state) => state.logout);

  // Refs on the two density buttons so the sliding pill can be measured
  const comfortableRef = useRef<HTMLButtonElement>(null);
  const compactRef = useRef<HTMLButtonElement>(null);
  const [metrics, setMetrics] = useState<{
    comfortable: Metrics;
    compact: Metrics;
  } | null>(null);

  // NavLink hands this function an isActive flag on every render
  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    isActive ? activeLink : idleLink;

  // Measure BOTH buttons up front -- deliberately not keyed on isCompact.
  // If the position were measured inside an effect that reruns on toggle,
  // the new value would land before the browser painted the old one and the
  // pill would jump instead of slide. Precomputing both means the toggle
  // changes the style in the same render as the click, which is what gives
  // the browser a previous value to animate from.
  //
  // In GT2 this ran on [isLoading, isError], because the buttons only existed
  // once the loading screen was gone. Those are CoursesPage's state now and
  // Layout cannot see them -- but it no longer needs to: the nav is mounted
  // for the whole session, so a mount-time measure plus the font and resize
  // listeners below covers every case that can change the widths.
  useLayoutEffect(() => {
    const a = comfortableRef.current;
    const b = compactRef.current;
    if (!a || !b) return;

    const measure = (): void =>
      setMetrics({
        comfortable: { left: a.offsetLeft, width: a.offsetWidth },
        compact: { left: b.offsetLeft, width: b.offsetWidth },
      });

    measure();
    // the webfont changes the buttons' widths once it lands
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const pill = metrics
    ? isCompact
      ? metrics.compact
      : metrics.comfortable
    : null;

  return (
    // The dark class lives on the outermost div, so every dark: utility
    // inside it -- on every page, through the Outlet -- flips together.
    <div className={isDarkMode ? "dark" : ""}>
      {/* Inside the frame, not beside it, so the arrow inverts with the
          theme -- and so it exists on every page, including the 404. */}
      <ArrowCursor />
      <div className="min-h-screen bg-paper font-sans text-ink dark:bg-ink dark:text-paper">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <nav
            className={`flex flex-wrap items-center gap-2 rounded-2xl p-4 ${chromePanel}`}
          >
            <span className="mr-2 font-display text-base font-bold tracking-tight text-ink dark:text-paper">
              ITELECT4 Tracker
            </span>

            {/* `end` matters: without it, '/' counts as a prefix of every URL
                and the Dashboard link would look active on every page. */}
            <NavLink to="/" end className={linkClass}>
              dashboard
            </NavLink>
            <NavLink to="/courses" className={linkClass}>
              courses
            </NavLink>
            <NavLink to="/people" className={linkClass}>
              people
            </NavLink>
            <NavLink to="/submissions" className={linkClass}>
              submissions
            </NavLink>

            {userName === null ? (
              <NavLink to="/login" className={linkClass}>
                login
              </NavLink>
            ) : (
              <button onClick={logout} className={idleLink}>
                logout ({userName})
              </button>
            )}

            {/* density -- drives CourseCard's variant prop, through the
                outlet context at the bottom of this file */}
            <div className="relative ml-auto inline-flex rounded-md bg-white/70 p-0.5 ring-1 ring-rule backdrop-blur-md dark:bg-ink-raise/70 dark:ring-ink-line">
              {/* The pill slides between the two labels. It is measured, not
                  guessed, because the two words are different widths. */}
              <span
                aria-hidden="true"
                className={`absolute top-0.5 bottom-0.5 left-0 rounded bg-ink shadow-sm dark:bg-paper ${
                  pill
                    ? "transition-[transform,width] duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)] motion-reduce:transition-none"
                    : "opacity-0"
                }`}
                style={
                  pill
                    ? {
                        width: pill.width,
                        transform: `translateX(${pill.left}px)`,
                      }
                    : undefined
                }
              />
              <button
                ref={comfortableRef}
                onClick={() => {
                  if (isCompact) toggleCompact();
                }}
                aria-pressed={!isCompact}
                className={`relative rounded px-2.5 py-1 font-mono text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink ${
                  isCompact
                    ? "text-ink/60 hover:text-ink dark:text-paper/60 dark:hover:text-paper"
                    : "text-paper dark:text-ink"
                }`}
              >
                comfortable
              </button>
              <button
                ref={compactRef}
                onClick={() => {
                  if (!isCompact) toggleCompact();
                }}
                aria-pressed={isCompact}
                className={`relative rounded px-2.5 py-1 font-mono text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink ${
                  isCompact
                    ? "text-paper dark:text-ink"
                    : "text-ink/60 hover:text-ink dark:text-paper/60 dark:hover:text-paper"
                }`}
              >
                compact
              </button>
            </div>

            <button onClick={toggleDarkMode} className={quietButton}>
              {isDarkMode ? "light mode" : "dark mode"}
            </button>
          </nav>

          <main className="mt-8">
            {/* THE HOLE. Whichever child route matched renders here. Delete
                this line and every page still matches -- and nothing appears
                on screen, with no error and no warning. */}
            <Outlet context={{ isCompact } satisfies LayoutContext} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
