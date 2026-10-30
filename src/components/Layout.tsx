import { NavLink, Outlet } from "react-router";
import { ChevronDownIcon } from "lucide-react";
import ArrowCursor from "./ArrowCursor";
import BulbToggle from "./BulbToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuthStore from "../store/authStore";
import useUiStore from "../store/uiStore";
import { chromePanel } from "../styles/ui";

const baseLink =
  "rounded-md px-3 py-1.5 font-mono text-xs transition focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink";

const activeLink = `${baseLink} bg-ink font-medium text-paper dark:bg-paper dark:text-ink`;

const idleLink = `${baseLink} text-graphite hover:bg-ink/5 hover:text-ink dark:text-graphite-lift dark:hover:bg-paper/10 dark:hover:text-paper`;

function Layout() {
  const isDarkMode = useUiStore((state) => state.isDarkMode);
  const isCompact = useUiStore((state) => state.isCompact);
  const toggleCompact = useUiStore((state) => state.toggleCompact);

  const userName = useAuthStore((state) => state.userName);
  const logout = useAuthStore((state) => state.logout);

  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    isActive ? activeLink : idleLink;

  const density = isCompact ? "compact" : "comfortable";
  const handleDensityChange = (value: string): void => {
    if (value !== density) toggleCompact();
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <ArrowCursor />
      <div className="min-h-screen bg-paper font-sans text-ink dark:bg-ink dark:text-paper">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
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
                <DropdownMenuContent
                  align="end"
                  className={`w-auto min-w-36 font-mono ${isDarkMode ? "dark" : ""}`}
                >
                  <DropdownMenuRadioGroup
                    aria-label="Density"
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
