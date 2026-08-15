import SubmissionBadge from "../components/SubmissionBadge";
import { allSubmissions, allUsers } from "../data/mockData";
import { pageHeading, sectionLabel } from "../styles/ui";
import useAuthStore from "../store/authStore";

const nameFor = (studentId: number): string =>
  allUsers.find((u) => u.id === studentId)?.name ?? "Unknown student";

function SubmissionsPage() {
  const userName = useAuthStore((state) => state.userName);

  return (
    <div>
      <p className={sectionLabel}>signed in as {userName}</p>
      <h2 className={`mt-2 ${pageHeading}`}>Submissions</h2>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {allSubmissions.map((s) => (
          <SubmissionBadge key={s.id} submission={s}>
            <p className="mt-2 font-mono text-xs text-paper/70 dark:text-ink/70">
              {nameFor(s.studentId)} · {s.courseCode}
            </p>
          </SubmissionBadge>
        ))}
      </div>
    </div>
  );
}

export default SubmissionsPage;
