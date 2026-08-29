import { useEffect, useRef } from "react";
import type React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import type { Course } from "../types/index";
import CourseCard from "../components/CourseCard";
import { Input } from "@/components/ui/input";
import usePrevious from "../hooks/usePrevious";
import useUiStore from "../store/uiStore";
import { fetchCourses } from "../api/client";
import {
  chromePanel,
  pageHeading,
  quietButton,
  sectionCount,
  sectionLabel,
  sectionRule,
} from "../styles/ui";

// GONE from this file: the courses/isLoading/isError useState trio, the
// useEffect + setTimeout that faked a network call, the mockData import, and
// the "simulate error" button. Four lines of useQuery replaced all of it, and
// brought caching, retries and background refetching along with them.

function CoursesPage() {
  const { data, isPending, isError, error, refetch } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  // The search box reads and writes the store now, not local state. isCompact
  // comes from the store too, so this page no longer needs useOutletContext.
  const searchTerm = useUiStore((state) => state.searchTerm);
  const setSearchTerm = useUiStore((state) => state.setSearchTerm);
  const isCompact = useUiStore((state) => state.isCompact);
  const previousSearch = usePrevious(searchTerm);

  // The ref stays: it drives the "focus" button, which is a real feature and
  // has nothing to do with how the courses are fetched.
  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusSearch = (): void => {
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    if (!isPending) {
      focusSearch();
    }
  }, [isPending]);

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchTerm(e.target.value);
  };

  if (isPending) {
    return (
      <div>
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
      </div>
    );
  }

  if (isError) {
    return (
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
          {error.message} &mdash; is json-server running on port 3001?
        </p>
        <button
          onClick={() => void refetch()}
          className="mt-4 rounded-md bg-late px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-late/90 focus-visible:ring-2 focus-visible:ring-late focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:focus-visible:ring-offset-ink"
        >
          Retry
        </button>
      </div>
    );
  }

  // Below this line data is Course[], never undefined -- the two returns above
  // ruled the other cases out, and TypeScript followed.
  const filteredCourses = data.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <p className={sectionLabel}>catalog</p>
      <h2 className={`mt-2 ${pageHeading}`}>Courses</h2>

      <div className="mt-6 flex gap-2">
        {/* A third page on the shadcn <Input>. Every hand-written class the
            old <input> carried now lives in src/components/ui/input.tsx, and
            the ref still works -- in React 19 ref is an ordinary prop, so it
            travels through {...props} to the real DOM node. */}
        <Input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          placeholder="Search courses..."
          onChange={handleSearchChange}
          className="font-mono"
        />
        <button onClick={focusSearch} className={`${quietButton} shrink-0`}>
          focus
        </button>
      </div>
      {previousSearch !== undefined && previousSearch !== searchTerm && (
        <p className="mt-2 font-mono text-xs text-graphite dark:text-graphite-lift">
          previous: "{previousSearch}"
        </p>
      )}

      <section className="mt-8">
        <div className="flex items-baseline gap-3">
          <h3 className={sectionLabel}>Results</h3>
          <span className={sectionCount}>
            {filteredCourses.length} of {data.length}
          </span>
          <span className={sectionRule} aria-hidden="true" />
        </div>

        {filteredCourses.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((c) => (
              <Link
                key={c.code}
                to={`/courses/${c.code}`}
                className={`block focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-paper focus-visible:outline-none dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink ${
                  isCompact ? "rounded-2xl" : "rounded-[28px]"
                }`}
              >
                <CourseCard
                  course={c}
                  variant={isCompact ? "compact" : "default"}
                />
              </Link>
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
    </div>
  );
}

export default CoursesPage;
