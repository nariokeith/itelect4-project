import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiSubmission, ApiUser, Course } from "../types/index";
import SubmissionBadge from "../components/SubmissionBadge";
import {
  createSubmission,
  fetchCourses,
  fetchSubmissions,
  fetchUsers,
} from "../api/client";
import { chromePanel, pageHeading, quietButton, sectionLabel } from "../styles/ui";
import useAuthStore from "../store/authStore";

// The student the demo submits as. There is no /users lookup at login and no
// real auth until Module 4, so this stays hard-coded on purpose.
const DEMO_STUDENT_ID = "1";

function SubmissionsPage() {
  const userName = useAuthStore((state) => state.userName);
  const queryClient = useQueryClient();

  // Local, because only this one form reads them. Not store material.
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [courseCode, setCourseCode] = useState<string>("");

  // 1. READ -- the same useQuery pattern as CoursesPage.
  const { data, isPending, isError, error, refetch } = useQuery<ApiSubmission[]>(
    {
      queryKey: ["submissions"],
      queryFn: fetchSubmissions,
    }
  );

  // The names beside each badge.
  const { data: users } = useQuery<ApiUser[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // The dropdown options. This is the SAME ["courses"] entry CoursesPage
  // filled, so arriving here from /courses costs no second request.
  const { data: courses } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  // 2. WRITE -- mutationFn does the POST, onSuccess cleans up after it.
  const addSubmission = useMutation({
    mutationFn: createSubmission,
    onSuccess: () => {
      // "the submissions list is out of date now -- go and refetch it".
      // This marks the key stale; it does not fetch. Query refetches because
      // something on screen is still using that entry.
      void queryClient.invalidateQueries({ queryKey: ["submissions"] });
      setRepoUrl("");
    },
  });

  // mutate() is what an event handler calls. It is fire-and-forget: the result
  // arrives in onSuccess, never on the next line.
  const handleAdd = (): void => {
    addSubmission.mutate({
      studentId: DEMO_STUDENT_ID,
      courseCode: courseCode,
      repoUrl: repoUrl,
      submittedAt: new Date().toISOString(), // a STRING, not a Date
    });
  };

  const nameFor = (studentId: string): string =>
    users?.find((u) => u.id === studentId)?.name ?? "Unknown student";

  if (isPending) {
    return (
      <div>
        <p className={sectionLabel}>loading records</p>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-r-lg bg-ink/10 motion-reduce:animate-none dark:bg-paper/10"
            />
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
          Submissions didn't load
        </h2>
        <p className="mt-1 text-sm text-graphite dark:text-graphite-lift">
          {error.message} &mdash; is json-server running on port 3001?
        </p>
        <button onClick={() => void refetch()} className={`${quietButton} mt-4`}>
          retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className={sectionLabel}>signed in as {userName}</p>
      <h2 className={`mt-2 ${pageHeading}`}>Submissions</h2>

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="github.com/you/your-repo"
          className="min-w-0 flex-1 rounded-md bg-white/70 px-3 py-2 font-mono text-sm text-ink ring-1 ring-rule backdrop-blur-md transition placeholder:text-graphite/80 focus:bg-white focus:ring-2 focus:ring-ink focus:outline-none dark:bg-ink-raise/70 dark:text-paper dark:ring-ink-line dark:placeholder:text-graphite-lift/80 dark:focus:bg-ink-raise dark:focus:ring-paper"
        />

        <select
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          aria-label="Course"
          className="shrink-0 rounded-md bg-white/70 px-3 py-2 font-mono text-sm text-ink ring-1 ring-rule backdrop-blur-md transition focus:bg-white focus:ring-2 focus:ring-ink focus:outline-none dark:bg-ink-raise/70 dark:text-paper dark:ring-ink-line dark:focus:bg-ink-raise dark:focus:ring-paper"
        >
          <option value="">select a course…</option>
          {(courses ?? []).map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>

        <button
          onClick={handleAdd}
          disabled={
            repoUrl === "" || courseCode === "" || addSubmission.isPending
          }
          className="shrink-0 rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-ink/85 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none disabled:bg-graphite/40 disabled:hover:bg-graphite/40 dark:bg-paper dark:text-ink dark:hover:bg-paper/85 dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink dark:disabled:bg-graphite-lift/40"
        >
          {addSubmission.isPending ? "Saving…" : "Add"}
        </button>
      </div>

      {addSubmission.isError && (
        <p className="mt-3 text-sm text-late dark:text-late-lift">
          {addSubmission.error.message}
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.map((s) => (
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
