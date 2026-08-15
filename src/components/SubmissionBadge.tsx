import type React from "react";
import type { Submission } from "../types/index";

interface SubmissionBadgeProps {
  submission: Submission;
  children?: React.ReactNode;
}

const SubmissionBadge: React.FC<SubmissionBadgeProps> = ({
  submission,
  children,
}) => {
  const isGraded = submission.score !== undefined;

  return (
    <div className="relative rounded-r-lg bg-ink py-4 pr-4 pl-10 text-paper shadow-sm [clip-path:polygon(1.25rem_0,100%_0,100%_100%,1.25rem_100%,0_50%)] dark:bg-paper dark:text-ink">
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-6 h-2 w-2 -translate-y-1/2 rounded-full bg-paper/90 dark:bg-ink/90"
      />

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-[0.18em] text-paper/70 uppercase dark:text-ink/70">
            submission #{submission.id}
            <span aria-hidden="true"> · </span>
            {submission.courseCode}
          </p>

          <p className="mt-1 font-mono text-sm break-all text-paper dark:text-ink">
            {submission.repoUrl}
          </p>

          <p className="mt-2 text-xs text-paper/80 dark:text-ink/80">
            submitted {submission.submittedAt.toLocaleDateString()}
          </p>

          {children}
        </div>

        <div className="shrink-0 rounded-md bg-paper px-3 py-2 text-center dark:bg-ink">
          <p
            className={`font-display text-2xl leading-none font-bold ${
              isGraded
                ? "text-graded dark:text-graded-lift"
                : "text-pending dark:text-pending-lift"
            }`}
          >
            {isGraded ? submission.score : "--"}
          </p>
          <p
            className={`mt-1 font-mono text-[0.625rem] tracking-[0.14em] uppercase ${
              isGraded
                ? "text-graded dark:text-graded-lift"
                : "text-pending dark:text-pending-lift"
            }`}
          >
            {isGraded ? "graded" : "pending"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubmissionBadge;
