import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import type { ApiSubmission, ApiUser, Course, RoleCount } from "../types/index";
import useToggle from "../hooks/useToggle";
import { fetchCourses, fetchSubmissions, fetchUsers } from "../api/client";
import {
  chromePanel,
  pageHeading,
  quietButton,
  sectionCount,
  sectionLabel,
  sectionRule,
} from "../styles/ui";

const plural = (count: number, word: string): string =>
  count === 1 ? word : `${word}s`;

const emptyTally: RoleCount = { student: 0, admin: 0, instructor: 0 };

const tallyRoles = (users: ApiUser[]): RoleCount =>
  users.reduce<RoleCount>(
    (tally, user) => ({ ...tally, [user.role]: tally[user.role] + 1 }),
    emptyTally
  );

function DashboardPage() {
  // useToggle is NOT deleted -- this is the one place still using it.
  const [showDetails, toggleDetails] = useToggle(false);

  // Three reads, three cache entries, all shared with the pages that own them.
  // Arriving here from /courses reuses ["courses"] with no second request.
  const courses = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });
  const submissions = useQuery<ApiSubmission[]>({
    queryKey: ["submissions"],
    queryFn: fetchSubmissions,
  });
  const users = useQuery<ApiUser[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const isPending =
    courses.isPending || submissions.isPending || users.isPending;
  const isError = courses.isError || submissions.isError || users.isError;

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
          Is json-server running on port 3001?
        </p>
      </div>
    );
  }

  // Past the two returns above, all three .data are defined.
  const allCourses = courses.data;
  const allSubmissions = submissions.data;
  const allUsers = users.data;

  // This was a module-level const while the data was a static import. It has
  // to be computed per render now, because the data arrives after the module.
  const roleTally = tallyRoles(allUsers);

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

        <button onClick={toggleDetails} className={`${quietButton} mt-5`}>
          {showDetails ? "hide details" : "show details"}
        </button>

        {showDetails && (
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-rule pt-4 dark:border-ink-line">
            {Object.entries(roleTally).map(([role, count]) => (
              <div key={role}>
                <dt className={sectionLabel}>{role}</dt>
                <dd className="mt-1 font-mono text-lg font-medium text-ink dark:text-paper">
                  {count}
                </dd>
              </div>
            ))}
          </dl>
        )}
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
            to="/people"
            className={`group rounded-2xl p-5 transition hover:bg-white focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none dark:hover:bg-ink-raise dark:focus-visible:ring-paper ${chromePanel}`}
          >
            <p className={sectionLabel}>people</p>
            <p className="mt-2 font-mono text-2xl font-medium text-ink dark:text-paper">
              {allUsers.length}
            </p>
            <p className="mt-1 text-sm text-graphite dark:text-graphite-lift">
              Students, instructors and admins
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
              Sign in required
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
