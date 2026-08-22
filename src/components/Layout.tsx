import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router";
import ArrowCursor from "./ArrowCursor";
import useAuthStore from "../store/authStore";
import useUiStore from "../store/uiStore";
import { chromePanel, quietButton } from "../styles/ui";

// The useToggle import is GONE -- Layout does not own dark mode or density
// now, so there is no longer a LayoutContext to hand down through <Outlet />.
// CoursesPage reads isCompact straight from the store instead.

const baseLink =
  "rounded-md px-3 py-1.5 font-mono text-xs transition focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink";

const activeLink = `${baseLink} bg-ink font-medium text-paper dark:bg-paper dark:text-ink`;

const idleLink = `${baseLink} text-graphite hover:bg-ink/5 hover:text-ink dark:text-graphite-lift dark:hover:bg-paper/10 dark:hover:text-paper`;

type Metrics = { left: number; width: number };

function Layout() {
  // WAS: const [isDarkMode, toggleDarkMode] = useToggle(false);
  // WAS: const [isCompact, toggleCompact] = useToggle(false);
  const isDarkMode = useUiStore((state) => state.isDarkMode);
  const toggleDarkMode = useUiStore((state) => state.toggleDarkMode);
  const isCompact = useUiStore((state) => state.isCompact);
  const toggleCompact = useUiStore((state) => state.toggleCompact);

  const userName = useAuthStore((state) => state.userName);
  const logout = useAuthStore((state) => state.logout);

  const comfortableRef = useRef<HTMLButtonElement>(null);
  const compactRef = useRef<HTMLButtonElement>(null);
  const [metrics, setMetrics] = useState<{
    comfortable: Metrics;
    compact: Metrics;
  } | null>(null);

  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    isActive ? activeLink : idleLink;

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
    <div className={isDarkMode ? "dark" : ""}>
      <ArrowCursor />
      <div className="min-h-screen bg-paper font-sans text-ink dark:bg-ink dark:text-paper">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <nav
            className={`flex flex-wrap items-center gap-2 rounded-2xl p-4 ${chromePanel}`}
          >
            <span className="mr-2 font-display text-base font-bold tracking-tight text-ink dark:text-paper">
              ITELECT4 Tracker
            </span>

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

            <div className="relative ml-auto inline-flex rounded-md bg-white/70 p-0.5 ring-1 ring-rule backdrop-blur-md dark:bg-ink-raise/70 dark:ring-ink-line">
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
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
