import { Link, useNavigate, useParams } from "react-router";
import { allSubmissions, allUsers } from "../data/mockData";
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

  const personId = Number(id);
  const person = Number.isInteger(personId)
    ? allUsers.find((u) => u.id === personId)
    : undefined;

  if (person === undefined) {
    return (
      <div className={notFoundPanel}>
        <p className={notFoundLabel}>no such record</p>
        <h2 className={`mt-2 ${pageHeading}`}>Person not found</h2>
        <p className="mt-2 text-sm text-graphite dark:text-graphite-lift">
          No one is filed under the id{" "}
          <span className="font-mono text-ink dark:text-paper">{id}</span>.
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

  const personSubmissions = allSubmissions.filter(
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
