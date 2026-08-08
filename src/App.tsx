// src/App.tsx
import type React from "react";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import UserCard from "./components/UserCard";
import CourseCard from "./components/CourseCard";
import SubmissionBadge from "./components/SubmissionBadge";
import ArrowCursor from "./components/ArrowCursor";
import useToggle from "./hooks/useToggle";
import usePrevious from "./hooks/usePrevious";
import type { User, Course, Submission } from "./types/index";

// ===== MOCK DATA (GT1 types) -- the "server" our useEffect pretends to fetch from =====
const mockUsers: User[] = [
  {
    id: 1, name: "Juan dela Cruz", email: "juan@example.com",
    role: "student", isActive: true,
  },
  {
    id: 2, name: "Maria Santos", email: "maria@example.com",
    role: "instructor", isActive: true,
  },
];
const mockCourses: Course[] = [
  {
    code: "ITELECT4", title: "IT Elective 4",
    units: 3, semester: "1st Semester 2026-2027",
  },
  {
    code: "ITELECT3", title: "Web Systems and Technologies",
    units: 3, semester: "1st Semester 2026-2027",
  },
  {
    code: "CS101", title: "Introduction to Computing",
    units: 3, semester: "1st Semester 2026-2027",
  },
];
const mockSubmissions: Submission[] = [
  {
    id: 1, studentId: 1, courseCode: "ITELECT4",
    repoUrl: "github.com/juandc/itelect4-project",
    submittedAt: new Date(), score: 95,
  },
];

// ===== SHARED CLASS STRINGS =====
// Tailwind only sees COMPLETE class names as literal text. These consts are
// literal text in the file, so the scanner still finds every class.
// Chrome -- the header, the controls, the search field -- sits a half step
// above the page on a faint frost. Content surfaces (cards, the submission
// tag) are fully opaque.
const chromePanel =
  "bg-white/70 ring-1 ring-rule backdrop-blur-md shadow-[0_1px_2px_0_rgba(22,22,26,0.06)] dark:bg-ink-raise/70 dark:ring-ink-line";

const quietButton =
  "rounded-md bg-white/70 px-3 py-1.5 font-mono text-xs text-graphite ring-1 ring-rule backdrop-blur-md transition hover:bg-white hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:bg-ink-raise/70 dark:text-graphite-lift dark:ring-ink-line dark:hover:bg-ink-raise dark:hover:text-paper dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink";

const sectionLabel =
  "font-mono text-xs uppercase tracking-[0.18em] text-graphite dark:text-graphite-lift";

// Counts are data, so they take the full-strength ink rather than a hue --
// in this palette colour is reserved for reporting state.
const sectionCount =
  "font-mono text-xs font-medium text-ink dark:text-paper";

const sectionRule = "h-px flex-1 bg-rule dark:bg-ink-line";

// "1 submissions" reads like a bug, so count and noun agree
const plural = (count: number, word: string): string =>
  count === 1 ? word : `${word}s`;

// ===== PAGE FRAME =====
// The dark class lives on the outermost div, so every dark: utility inside
// -- including the loading and error screens -- flips together.
interface FrameProps {
  isDark: boolean;
  children: React.ReactNode;
}

function Frame({ isDark, children }: FrameProps) {
  return (
    <div className={isDark ? "dark" : ""}>
      {/* Inside the frame, not beside it, so the arrow inverts with the
          theme -- and so it exists on the loading and error screens too. */}
      <ArrowCursor />
      <div className="min-h-screen bg-paper font-sans text-ink dark:bg-ink dark:text-paper">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

function App() {
  // ===== TYPED STATE WITH useState<T> =====
  // useState<T> -- T is the type of the state value
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Array state -- starts empty, filled after "loading"
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Boolean state -- tracks whether data has finished loading
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Boolean state -- nothing sets this true yet except the demo button,
  // but the styled branch is ready for a real fetch that can fail
  const [isError, setIsError] = useState<boolean>(false);

  // String state -- whatever is typed into the search input
  const [searchTerm, setSearchTerm] = useState<string>("");

  // ===== TYPED DOM REFERENCE WITH useRef =====
  // useRef<T>(null) -- T is the DOM element type
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Refs on the two density buttons so the sliding pill can be measured
  const comfortableRef = useRef<HTMLButtonElement>(null);
  const compactRef = useRef<HTMLButtonElement>(null);
  type Metrics = { left: number; width: number };
  const [metrics, setMetrics] = useState<{
    comfortable: Metrics;
    compact: Metrics;
  } | null>(null);

  // ===== CUSTOM HOOKS =====
  // The same useToggle from Session 4, now powering three different features
  const [showDetails, toggleDetails] = useToggle(false);
  const [isDarkMode, toggleDarkMode] = useToggle(false);
  const [isCompact, toggleCompact] = useToggle(false);
  const previousSearch = usePrevious(searchTerm);

  // ===== LOADING MOCK DATA WITH useEffect =====
  // useEffect(fn, deps) -- fn runs after render;
  // an empty deps array [] means "run once, on mount"
  useEffect(() => {
    setTimeout(() => {
      setUsers(mockUsers);
      setCourses(mockCourses);
      setSubmissions(mockSubmissions);
      setIsLoading(false);
    }, 500);
  }, []);

  const focusSearch = (): void => {
    // .current can be null, so optional chaining guards the call
    searchInputRef.current?.focus();
  };

  // Focus the input programmatically once loading finishes
  useEffect(() => {
    if (!isLoading) {
      focusSearch();
    }
  }, [isLoading]);

  // Measure BOTH buttons up front -- deliberately not keyed on isCompact.
  // If the position were measured inside an effect that reruns on toggle,
  // the new value would land before the browser painted the old one and the
  // pill would jump instead of slide. Precomputing both means the toggle
  // changes the style in the same render as the click, which is what gives
  // the browser a previous value to animate from.
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
  }, [isLoading, isError]);

  const pill = metrics
    ? isCompact
      ? metrics.compact
      : metrics.comfortable
    : null;

  // ===== TYPED DOM EVENTS =====
  // React.ChangeEvent<HTMLInputElement> types e.target as an <input>
  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchTerm(e.target.value);
  };

  // Derived values -- recomputed every render, not stored in state
  // Match the code too -- the compact card only shows c.code
  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const gradedCount = submissions.filter((s) => s.score !== undefined).length;
  const term = courses[0]?.semester;

  // ===== STYLED LOADING STATE =====
  // Early return, same pattern as Session 4 -- but skeleton cards in the real
  // grid instead of plain text, so the layout does not jump when data lands
  if (isLoading) {
    return (
      <Frame isDark={isDarkMode}>
        <p className={sectionLabel}>loading records</p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-rule bg-white p-5 shadow-sm motion-reduce:animate-none dark:border-ink-line dark:bg-ink-raise"
            >
              <div className="h-4 w-24 rounded bg-graphite/20 dark:bg-graphite-lift/20" />
              <div className="mt-3 h-3 w-40 rounded bg-graphite/15 dark:bg-graphite-lift/15" />
              <div className="mt-3 h-3 w-28 rounded bg-graphite/15 dark:bg-graphite-lift/15" />
            </div>
          ))}
        </div>
      </Frame>
    );
  }

  // ===== STYLED ERROR STATE =====
  if (isError) {
    return (
      <Frame isDark={isDarkMode}>
        <div
          className={`rounded-2xl p-6 ring-late/25 dark:ring-late-lift/25 ${chromePanel}`}
        >
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-late dark:text-late-lift">
            request failed
          </p>
          <h2 className="mt-2 text-lg font-semibold text-ink dark:text-paper">
            Courses didn't load
          </h2>
          <p className="mt-1 text-sm text-graphite dark:text-graphite-lift">
            The request failed before any records arrived.
          </p>
          <button
            onClick={() => setIsError(false)}
            className="mt-4 rounded-md bg-late px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-late/90 focus-visible:ring-2 focus-visible:ring-late focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:focus-visible:ring-offset-ink"
          >
            Retry
          </button>
        </div>
      </Frame>
    );
  }

  return (
    <Frame isDark={isDarkMode}>
      {/* ===== HEADER: the status line is the thesis ===== */}
      <header className={`rounded-2xl p-6 ${chromePanel}`}>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl dark:text-paper">
          ITELECT4 Tracker
        </h1>
        <p className="mt-2 font-mono text-xs text-graphite dark:text-graphite-lift">
          {term}
          <span aria-hidden="true"> · </span>
          <span className={sectionCount}>{courses.length}</span>{" "}
          {plural(courses.length, "course")}
          <span aria-hidden="true"> · </span>
          <span className={sectionCount}>{submissions.length}</span>{" "}
          {plural(submissions.length, "submission")}
          <span aria-hidden="true"> · </span>
          <span className={sectionCount}>{gradedCount}</span> graded
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {/* density -- drives CourseCard's variant prop */}
          <div className="relative inline-flex rounded-md bg-white/70 p-0.5 ring-1 ring-rule backdrop-blur-md dark:bg-ink-raise/70 dark:ring-ink-line">
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
                  ? { width: pill.width, transform: `translateX(${pill.left}px)` }
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

          <button
            onClick={() => setIsError(true)}
            className="rounded-md bg-white/70 px-3 py-1.5 font-mono text-xs text-late ring-1 ring-late/30 backdrop-blur-md transition hover:bg-white focus-visible:ring-2 focus-visible:ring-late focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:bg-ink-raise/70 dark:text-late-lift dark:ring-late-lift/30 dark:hover:bg-ink-raise dark:focus-visible:ring-offset-ink"
          >
            simulate error
          </button>
        </div>
      </header>

      {/* ===== SEARCH ===== */}
      <div className="mt-8 flex gap-2">
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          placeholder="Search courses..."
          onChange={handleSearchChange}
          className="w-full rounded-md bg-white/70 px-3 py-2 font-mono text-sm text-ink ring-1 ring-rule backdrop-blur-md transition placeholder:text-graphite/80 focus:bg-white focus:ring-2 focus:ring-ink focus:outline-none dark:bg-ink-raise/70 dark:text-paper dark:ring-ink-line dark:placeholder:text-graphite-lift/80 dark:focus:bg-ink-raise dark:focus:ring-paper"
        />
        <button onClick={focusSearch} className={`${quietButton} shrink-0`}>
          focus
        </button>
      </div>
      {previousSearch !== undefined && previousSearch !== searchTerm && (
        <p className={`mt-2 font-mono text-xs text-graphite dark:text-graphite-lift`}>
          previous: "{previousSearch}"
        </p>
      )}

      {/* ===== PEOPLE ===== */}
      <section className="mt-10">
        <div className="flex items-baseline gap-3">
          <h2 className={sectionLabel}>People</h2>
          <span className={sectionCount}>{users.length}</span>
          <span className={sectionRule} aria-hidden="true" />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {users.map((u) => (
            <UserCard key={u.id} user={u} onSelect={setSelectedUser} />
          ))}
        </div>
        {selectedUser && (
          <p className={`mt-3 font-mono text-xs text-graphite dark:text-graphite-lift`}>
            selected
            <span aria-hidden="true"> · </span>
            <span className="text-ink dark:text-paper">
              {selectedUser.name}
            </span>
          </p>
        )}
      </section>

      {/* ===== COURSES: the responsive grid ===== */}
      <section className="mt-10">
        <div className="flex items-baseline gap-3">
          <h2 className={sectionLabel}>Courses</h2>
          <span className={sectionCount}>
            {filteredCourses.length} of {courses.length}
          </span>
          <span className={sectionRule} aria-hidden="true" />
          <button onClick={toggleDetails} className={`${quietButton} shrink-0`}>
            {showDetails ? "hide details" : "show details"}
          </button>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((c) => (
              <CourseCard
                key={c.code}
                course={c}
                variant={isCompact ? "compact" : "default"}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-ink/20 p-10 text-center dark:border-paper/20">
            <p className="text-sm text-ink dark:text-paper">
              No courses match{" "}
              <span className="font-mono text-ink dark:text-paper">
                {searchTerm}
              </span>
              .
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className={`${quietButton} mt-4`}
            >
              clear search
            </button>
          </div>
        )}
      </section>

      {/* ===== SUBMISSIONS (details panel) ===== */}
      {showDetails && (
        <section className="mt-10">
          <div className="flex items-baseline gap-3">
            <h2 className={sectionLabel}>Submissions</h2>
            <span className={sectionCount}>{submissions.length}</span>
            <span className={sectionRule} aria-hidden="true" />
          </div>
          <div className="mt-5 space-y-4">
            {/* The badge keeps its notched tag silhouette -- it is the one
                loud object on the page, and a bevel would fight it. */}
            {submissions.map((s) => (
              <SubmissionBadge key={s.id} submission={s}>
                <p className="mt-2 font-mono text-xs text-paper/70 dark:text-ink/70">
                  On time!
                </p>
              </SubmissionBadge>
            ))}
          </div>
        </section>
      )}
    </Frame>
  );
}

export default App;
