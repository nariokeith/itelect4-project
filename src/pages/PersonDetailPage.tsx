import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import type { ApiSubmission, ApiUser } from "../types/index";
import { fetchSubmissions, fetchUserById } from "../api/client";
import {
  chromePanel,
  notFoundLabel,
  notFoundPanel,
  pageHeading,
  quietButton,
  sectionCount,
  sectionLabel,
} from "../styles/ui";

function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // The id from the URL goes INTO the key, so /people/1 and /people/3 get one
  // cache entry each. No Number() conversion any more: json-server ids ARE
  // strings, so the URL segment is already the right shape to send.
  const {
    data: person,
    isPending,
    isError,
    error,
  } = useQuery<ApiUser>({
    queryKey: ["users", id],
    queryFn: () => fetchUserById(id!),
    enabled: id !== undefined,
  });

  const { data: submissions } = useQuery<ApiSubmission[]>({
    queryKey: ["submissions"],
    queryFn: fetchSubmissions,
  });

  if (isPending) {
    return (
      <div>
        <p className={sectionLabel}>loading record</p>
        <div className="mt-6 h-48 max-w-lg animate-pulse rounded-2xl border border-rule bg-white shadow-sm motion-reduce:animate-none dark:border-ink-line dark:bg-ink-raise" />
      </div>
    );
  }

  // Session 6 needed a `person === undefined` check for a bad id. Now an
  // unknown id makes json-server answer 404, fetchUserById throws, and
  // isError catches it here.
  if (isError) {
    return (
      <div className={notFoundPanel}>
        <p className={notFoundLabel}>no such record</p>
        <h2 className={`mt-2 ${pageHeading}`}>Person not found</h2>
        <p className="mt-2 text-sm text-graphite dark:text-graphite-lift">
          {error.message}
        </p>
        <button
          onClick={() => navigate("/people")}
          className={`${quietButton} mt-4`}
        >
          back to people
        </button>
      </div>
    );
  }

  // studentId is a string here, matching ApiUser["id"] -- that is exactly why
  // ApiSubmission redeclares it. Left as a number this === would never match.
  const personSubmissions = (submissions ?? []).filter(
    (s) => s.studentId === person.id
  );
  const gradedCount = personSubmissions.filter(
    (s) => s.score !== undefined
  ).length;

  return (
    <div>
      <p className={sectionLabel}>{person.role}</p>
      <h2 className={`mt-2 ${pageHeading}`}>{person.name}</h2>

      <dl className={`mt-6 max-w-lg rounded-2xl p-6 ${chromePanel}`}>
        <div className="flex items-baseline justify-between gap-4">
          <dt className={sectionLabel}>email</dt>
          <dd className="font-mono text-xs text-ink dark:text-paper">
            {person.email}
          </dd>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-rule pt-3 dark:border-ink-line">
          <dt className={sectionLabel}>status</dt>
          <dd
            className={`font-mono text-xs uppercase tracking-[0.14em] ${
              person.isActive
                ? "text-graded dark:text-graded-lift"
                : "text-pending dark:text-pending-lift"
            }`}
          >
            {person.isActive ? "active" : "inactive"}
          </dd>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-rule pt-3 dark:border-ink-line">
          <dt className={sectionLabel}>submissions</dt>
          <dd className={sectionCount}>
            {personSubmissions.length}
            <span className="text-graphite dark:text-graphite-lift">
              {" "}
              · {gradedCount} graded
            </span>
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-graphite dark:text-graphite-lift">
        The records themselves live on the{" "}
        <Link
          to="/submissions"
          className="text-ink underline underline-offset-2 transition hover:text-ink/70 dark:text-paper dark:hover:text-paper/70"
        >
          Submissions
        </Link>{" "}
        page, which requires signing in.
      </p>

      <button
        onClick={() => navigate("/people")}
        className={`${quietButton} mt-6`}
      >
        back to people
      </button>
    </div>
  );
}

export default PersonDetailPage;
