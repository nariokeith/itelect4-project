import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiSubmission, ApiUser, Course } from "../types/index";
import { submissionSchema } from "../schemas/submissionSchema";
import type { SubmissionFormValues } from "../schemas/submissionSchema";
import SubmissionBadge from "../components/SubmissionBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// The native <select> below is styled to match <Input>, which is a shadcn
// component and reads these same variables. register() spreads onto a plain
// <select> exactly as it does onto an <input>, so there is no <Select>
// component to install for this.
const selectClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50";

const errorText = "text-sm text-late dark:text-late-lift";

function SubmissionsPage() {
  const userName = useAuthStore((state) => state.userName);
  const queryClient = useQueryClient();

  // GONE: the repoUrl/courseCode useState pair. useForm holds both values now,
  // in the DOM nodes themselves, so a keystroke no longer re-renders this
  // component -- and this component re-renders the whole submission grid.
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionFormValues>({
    // The adapter. React Hook Form has never heard of Zod and Zod has never
    // heard of React; this one line is the entire connection between them.
    // The import path ends in /zod -- the package root gives you nothing.
    resolver: zodResolver(submissionSchema),
    // Check a field when you LEAVE it, so a bad URL is called out before you
    // reach the button rather than after.
    mode: "onBlur",
    // What reset() puts back. Without these there is nothing to return to.
    defaultValues: { courseCode: "", repoUrl: "" },
  });

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

  // 2. WRITE -- unchanged since Session 7. Today changed what reaches
  // mutate(), not the write path itself.
  const addSubmission = useMutation({
    mutationFn: createSubmission,
    onSuccess: () => {
      // "the submissions list is out of date now -- go and refetch it".
      // This marks the key stale; it does not fetch. Query refetches because
      // something on screen is still using that entry.
      void queryClient.invalidateQueries({ queryKey: ["submissions"] });
      // One call clears every field, instead of one setter per field. It sits
      // in onSuccess so the boxes empty AFTER the row is really saved.
      reset();
    },
  });

  // handleSubmit runs the resolver first and only calls this if every rule
  // passed. There is no `if` anywhere deciding that -- handleSubmit is the
  // gate, and the schema is what it asks.
  const onSubmit = (values: SubmissionFormValues): void => {
    addSubmission.mutate({
      studentId: DEMO_STUDENT_ID,
      courseCode: values.courseCode,
      repoUrl: values.repoUrl,
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

      {/* handleSubmit(onSubmit), never onSubmit on its own: the bare version
          compiles, reloads the page and validates nothing. It also calls
          preventDefault() for us. */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`mt-6 grid gap-4 rounded-2xl p-5 sm:grid-cols-2 ${chromePanel}`}
      >
        <div className="grid content-start gap-1.5">
          {/* text-foreground, not text-ink dark:text-paper: index.css defines
              --foreground twice, so one class covers both themes. */}
          <Label htmlFor="courseCode" className="text-foreground">
            Course
          </Label>
          <select
            id="courseCode"
            aria-invalid={errors.courseCode ? true : undefined}
            className={selectClass}
            {...register("courseCode")}
          >
            <option value="">select a course…</option>
            {(courses ?? []).map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
          {/* && short-circuits: errors.courseCode only exists while that
              field is broken, so reading .message is guarded by its presence. */}
          {errors.courseCode && (
            <p className={errorText}>{errors.courseCode.message}</p>
          )}
        </div>

        <div className="grid content-start gap-1.5">
          <Label htmlFor="repoUrl" className="text-foreground">
            Repository URL
          </Label>
          {/* aria-invalid is read by a screen reader AND by input.tsx, which
              styles its red border off it -- so what is seen and what is heard
              cannot disagree. undefined, not false: the attribute disappears. */}
          <Input
            id="repoUrl"
            aria-invalid={errors.repoUrl ? true : undefined}
            placeholder="https://github.com/you/your-repo"
            className="font-mono"
            {...register("repoUrl")}
          />
          {errors.repoUrl && (
            <p className={errorText}>{errors.repoUrl.message}</p>
          )}
        </div>

        {/* Never disabled on "invalid": clicking it is what reveals the
            messages, and with mode "onBlur" a disabled button would also need
            two clicks. Only a save already in flight disables it. */}
        <Button
          type="submit"
          disabled={addSubmission.isPending}
          className="justify-self-start sm:col-span-2"
        >
          {addSubmission.isPending ? "Saving…" : "Add submission"}
        </Button>
      </form>

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
