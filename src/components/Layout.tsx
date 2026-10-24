import { NavLink, Outlet } from "react-router";
import { ChevronDownIcon } from "lucide-react";
import ArrowCursor from "./ArrowCursor";
import BulbToggle from "./BulbToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuthStore from "../store/authStore";
import useUiStore from "../store/uiStore";
import { chromePanel } from "../styles/ui";

// The useToggle import is GONE -- Layout does not own dark mode or density
// now, so there is no longer a LayoutContext to hand down through <Outlet />.
// CoursesPage reads isCompact straight from the store instead.

const baseLink =
  "rounded-md px-3 py-1.5 font-mono text-xs transition focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink";

const activeLink = `${baseLink} bg-ink font-medium text-paper dark:bg-paper dark:text-ink`;

const idleLink = `${baseLink} text-graphite hover:bg-ink/5 hover:text-ink dark:text-graphite-lift dark:hover:bg-paper/10 dark:hover:text-paper`;

function Layout() {
  // WAS: const [isDarkMode, toggleDarkMode] = useToggle(false);
  // WAS: const [isCompact, toggleCompact] = useToggle(false);
  // toggleDarkMode is not read here any more -- BulbToggle calls it itself.
  const isDarkMode = useUiStore((state) => state.isDarkMode);
  const isCompact = useUiStore((state) => state.isCompact);
  const toggleCompact = useUiStore((state) => state.toggleCompact);

  const userName = useAuthStore((state) => state.userName);
  const logout = useAuthStore((state) => state.logout);

  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    isActive ? activeLink : idleLink;

  // The store keeps a boolean; the radio group speaks in strings. Only flip
  // when the picked option differs, so choosing the current one is a no-op.
  const density = isCompact ? "compact" : "comfortable";
  const handleDensityChange = (value: string): void => {
    if (value !== density) toggleCompact();
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <ArrowCursor />
      <div className="min-h-screen bg-paper font-sans text-ink dark:bg-ink dark:text-paper">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          {/* Two groups: where you can GO on the left, who you are and how
              the app looks on the right. Login and register used to sit
              between the page links, reading as one more page. */}
          <nav
            className={`flex flex-wrap items-center gap-2 rounded-2xl p-4 ${chromePanel}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 font-display text-base font-bold tracking-tight text-ink dark:text-paper">
                ITELECT4 Tracker
              </span>

              <NavLink to="/" end className={linkClass}>
                dashboard
              </NavLink>
              <NavLink to="/courses" className={linkClass}>
                courses
              </NavLink>
              <NavLink to="/submissions" className={linkClass}>
                submissions
              </NavLink>
              {/* The one page that talks to Gemini, through our own API. */}
              <NavLink to="/review" className={linkClass}>
                review
              </NavLink>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {userName === null ? (
                <>
                  <NavLink to="/login" className={linkClass}>
                    login
                  </NavLink>
                  <NavLink to="/register" className={linkClass}>
                    register
                  </NavLink>
                </>
              ) : (
                // Just "logout": the name made the nav wrap to two rows. The
                // Submissions page still says who is signed in.
                <button onClick={logout} className={idleLink}>
                  logout
                </button>
              )}

              <BulbToggle />

              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`${idleLink} inline-flex items-center gap-1 data-popup-open:bg-ink/5 data-popup-open:text-ink dark:data-popup-open:bg-paper/10 dark:data-popup-open:text-paper`}
                >
                  view
                  <ChevronDownIcon aria-hidden="true" className="size-3.5" />
                </DropdownMenuTrigger>
                {/* The popup is portalled to <body>, OUTSIDE the div that
                    carries .dark above -- so it needs the class itself. */}
                <DropdownMenuContent
                  align="end"
                  className={`w-auto min-w-36 font-mono ${isDarkMode ? "dark" : ""}`}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-mono">
                      density
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={density}
                      onValueChange={handleDensityChange}
                    >
                      <DropdownMenuRadioItem
                        value="comfortable"
                        className="text-xs"
                      >
                        comfortable
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="compact" className="text-xs">
                        compact
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
