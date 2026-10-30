import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import type { ApiSubmission, Course } from "../types/index";
import useAuthStore from "../store/authStore";
import { API_URL, fetchCourses, fetchSubmissions } from "../api/client";
import {
  chromePanel,
  pageHeading,
  sectionCount,
  sectionLabel,
  sectionRule,
} from "../styles/ui";

const plural = (count: number, word: string): string =>
  count === 1 ? word : `${word}s`;

function DashboardPage() {
  const token = useAuthStore((state) => state.token);
  const isLoggedIn = token !== null;

  const courses = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });
  const submissions = useQuery<ApiSubmission[]>({
    queryKey: ["submissions", token],
    queryFn: fetchSubmissions,
    enabled: isLoggedIn,
  });

  const isPending = courses.isPending || (isLoggedIn && submissions.isPending);
  const isError = courses.isError || (isLoggedIn && submissions.isError);

  if (isPending) {
    return (
      <div>
        <p className={sectionLabel}>loading overview</p>
        <div className="mt-6 h-44 animate-pulse rounded-2xl border border-rule bg-white shadow-sm motion-reduce:animate-none dark:border-ink-line dark:bg-ink-raise" />
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
          The overview didn't load
        </h2>
        <p className="mt-1 text-sm text-graphite dark:text-graphite-lift">
          {(courses.error ?? submissions.error)?.message} &mdash; tried{" "}
          {API_URL}
        </p>
      </div>
    );
  }

  const allCourses = courses.data;
  const allSubmissions = submissions.data ?? [];

  const gradedCount = allSubmissions.filter(
    (s) => s.score !== undefined
  ).length;
  const term = allCourses[0]?.semester;

  return (
    <div>
      <header className={`rounded-2xl p-6 ${chromePanel}`}>
        <p className={sectionLabel}>overview</p>
        <h2 className={`mt-2 ${pageHeading}`}>Dashboard</h2>
        <p className="mt-2 font-mono text-xs text-graphite dark:text-graphite-lift">
          {term}
          <span aria-hidden="true"> · </span>
          <span className={sectionCount}>{allCourses.length}</span>{" "}
          {plural(allCourses.length, "course")}
          <span aria-hidden="true"> · </span>
          <span className={sectionCount}>{allSubmissions.length}</span>{" "}
          {plural(allSubmissions.length, "submission")}
          <span aria-hidden="true"> · </span>
          <span className={sectionCount}>{gradedCount}</span> graded
        </p>
      </header>

      <section className="mt-10">
        <div className="flex items-baseline gap-3">
          <h3 className={sectionLabel}>Sections</h3>
          <span className={sectionRule} aria-hidden="true" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/courses"
            className={`group rounded-2xl p-5 transition hover:bg-white focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none dark:hover:bg-ink-raise dark:focus-visible:ring-paper ${chromePanel}`}
          >
            <p className={sectionLabel}>courses</p>
            <p className="mt-2 font-mono text-2xl font-medium text-ink dark:text-paper">
              {allCourses.length}
            </p>
            <p className="mt-1 text-sm text-graphite dark:text-graphite-lift">
              Search and open a course
            </p>
          </Link>

          <Link
            to={isLoggedIn ? "/submissions" : "/register"}
            className={`group rounded-2xl p-5 transition hover:bg-white focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none dark:hover:bg-ink-raise dark:focus-visible:ring-paper ${chromePanel}`}
          >
            <p className={sectionLabel}>account</p>
            <p className="mt-2 font-mono text-2xl font-medium text-ink dark:text-paper">
              {isLoggedIn ? "signed in" : "register"}
            </p>
            <p className="mt-1 text-sm text-graphite dark:text-graphite-lift">
              {isLoggedIn
                ? "Your submissions are saved to your account"
                : "Make an account to submit your work"}
            </p>
          </Link>

          <Link
            to="/submissions"
            className={`group rounded-2xl p-5 transition hover:bg-white focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none dark:hover:bg-ink-raise dark:focus-visible:ring-paper ${chromePanel}`}
          >
            <p className={sectionLabel}>submissions</p>
            <p className="mt-2 font-mono text-2xl font-medium text-ink dark:text-paper">
              {allSubmissions.length}
            </p>
            <p className="mt-1 text-sm text-graphite dark:text-graphite-lift">
              {isLoggedIn ? "Yours, newest first" : "Sign in required"}
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
