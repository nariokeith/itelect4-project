import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiSubmission, Course } from "../types/index";
import { submissionSchema } from "../schemas/submissionSchema";
import type { SubmissionFormValues } from "../schemas/submissionSchema";
import SubmissionBadge from "../components/SubmissionBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  API_URL,
  createSubmission,
  fetchCourses,
  fetchSubmissions,
} from "../api/client";
import { chromePanel, pageHeading, quietButton, sectionLabel } from "../styles/ui";
import useAuthStore from "../store/authStore";

const selectClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50";

const errorText = "text-sm text-late dark:text-late-lift";

function SubmissionsPage() {
  const userName = useAuthStore((state) => state.userName);
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    mode: "onBlur",
    defaultValues: { courseCode: "", repoUrl: "" },
  });

  const { data, isPending, isError, error, refetch } = useQuery<ApiSubmission[]>(
    {
      queryKey: ["submissions", token],
      queryFn: fetchSubmissions,
    }
  );

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  const addSubmission = useMutation({
    mutationFn: createSubmission,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["submissions"] });
      reset();
    },
  });

  const onSubmit = (values: SubmissionFormValues): void => {
    addSubmission.mutate(values);
  };

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
          {error.message} &mdash; tried {API_URL}/api/submissions
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`mt-6 grid gap-4 rounded-2xl p-5 sm:grid-cols-2 ${chromePanel}`}
      >
        <div className="grid content-start gap-1.5">
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
          {errors.courseCode && (
            <p className={errorText}>{errors.courseCode.message}</p>
          )}
        </div>

        <div className="grid content-start gap-1.5">
          <Label htmlFor="repoUrl" className="text-foreground">
            Repository URL
          </Label>
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
              {userName} · {s.courseCode}
            </p>
          </SubmissionBadge>
        ))}
      </div>
    </div>
  );
}

export default SubmissionsPage;
