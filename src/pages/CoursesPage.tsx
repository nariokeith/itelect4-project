import { useState, useEffect, useRef } from "react";
import type React from "react";
import { Link, useOutletContext } from "react-router";
import type { Course } from "../types/index";
import CourseCard from "../components/CourseCard";
import usePrevious from "../hooks/usePrevious";
import { allCourses } from "../data/mockData";
import type { LayoutContext } from "../components/Layout";
import {
  chromePanel,
  pageHeading,
  quietButton,
  sectionCount,
  sectionLabel,
  sectionRule,
} from "../styles/ui";

function CoursesPage() {
  const { isCompact } = useOutletContext<LayoutContext>();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const previousSearch = usePrevious(searchTerm);

  useEffect(() => {
    setTimeout(() => {
      setCourses(allCourses);
      setIsLoading(false);
    }, 500);
  }, []);

  const focusSearch = (): void => {
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    if (!isLoading) {
      focusSearch();
    }
  }, [isLoading]);

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchTerm(e.target.value);
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
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
          The request failed before any records arrived.
        </p>
        <button
          onClick={() => setIsError(false)}
          className="mt-4 rounded-md bg-late px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-late/90 focus-visible:ring-2 focus-visible:ring-late focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:focus-visible:ring-offset-ink"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className={sectionLabel}>catalog</p>
      <h2 className={`mt-2 ${pageHeading}`}>Courses</h2>

      <div className="mt-6 flex gap-2">
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
        <button
          onClick={() => setIsError(true)}
          className="shrink-0 rounded-md bg-white/70 px-3 py-1.5 font-mono text-xs text-late ring-1 ring-late/30 backdrop-blur-md transition hover:bg-white focus-visible:ring-2 focus-visible:ring-late focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none dark:bg-ink-raise/70 dark:text-late-lift dark:ring-late-lift/30 dark:hover:bg-ink-raise dark:focus-visible:ring-offset-ink"
        >
          simulate error
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
            {filteredCourses.length} of {courses.length}
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
