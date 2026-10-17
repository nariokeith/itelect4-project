import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AiReview } from "../types/index";
import { askAi } from "../api/client";
import { reviewFormSchema } from "../schemas/reviewSchema";
import type { ReviewFormValues } from "../schemas/reviewSchema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { chromePanel, pageHeading, sectionLabel } from "../styles/ui";

// One entry for every value readiness can have, in the same three colours the
// submission badges use. Add a fourth value to AiReview and this object stops
// compiling until it has a colour for it.
const READINESS_STYLE: Record<AiReview["readiness"], string> = {
  ready: "bg-graded/10 text-graded ring-graded/30 dark:bg-graded-lift/10 dark:text-graded-lift dark:ring-graded-lift/30",
  almost: "bg-pending/10 text-pending ring-pending/30 dark:bg-pending-lift/10 dark:text-pending-lift dark:ring-pending-lift/30",
  "not-yet": "bg-late/10 text-late ring-late/30 dark:bg-late-lift/10 dark:text-late-lift dark:ring-late-lift/30",
};

// Styled to match <Input>, the same way SubmissionsPage styles its <select>:
// there is no shadcn Textarea installed, and register() spreads onto a plain
// <textarea> exactly as it does onto an <input>.
const textareaClass =
  "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50";

const errorText = "text-sm text-late dark:text-late-lift";

function ReviewPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    // No mode: "onBlur" here. The button sits right under the error message,
    // and checking on blur makes the message appear or vanish between
    // pressing the button and letting go -- the button moves and the click
    // misses. The default checks on submit, then on every keystroke after.
    defaultValues: { prompt: "" },
  });

  // A mutation, not a query: it runs only when the button is pressed, and
  // asking twice is two requests -- two answers that may differ, and two
  // spent from the quota. Nothing to cache.
  const review = useMutation({
    mutationFn: askAi,
  });

  const onSubmit = (values: ReviewFormValues): void => {
    review.mutate(values.prompt);
  };

  return (
    <div className="max-w-2xl">
      <p className={sectionLabel}>gemini</p>
      <h2 className={`mt-2 ${pageHeading}`}>AI Review</h2>
      <p className="mt-2 text-sm text-graphite dark:text-graphite-lift">
        Describe your project and get feedback before you submit it. The
        review is a suggestion written by an AI, so check it against your own
        work.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`mt-6 grid gap-4 rounded-2xl p-5 ${chromePanel}`}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="prompt" className="text-foreground">
            Project description
          </Label>
          <textarea
            id="prompt"
            rows={6}
            aria-invalid={errors.prompt ? true : undefined}
            placeholder="What it does, how it is built, where it runs..."
            className={textareaClass}
            {...register("prompt")}
          />
          {errors.prompt && (
            <p className={errorText}>{errors.prompt.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={review.isPending}
          className="justify-self-start"
        >
          {review.isPending ? "Reviewing…" : "Review my project"}
        </Button>
      </form>

      {/* The API's own sentence: the rate limit, the quota, or a reply that
          failed the schema -- never Google's raw error text. */}
      {review.isError && (
        <p className={`mt-4 ${errorText}`}>{review.error.message}</p>
      )}

      {/* Every field of the reply is on screen. React renders each string as
          text, never as HTML, so nothing the model writes can run here. */}
      {review.data && (
        <section className={`mt-6 grid gap-5 rounded-2xl p-6 ${chromePanel}`}>
          <span
            className={`justify-self-start rounded-md px-2.5 py-1 font-mono text-xs font-medium tracking-[0.14em] uppercase ring-1 ${
              READINESS_STYLE[review.data.readiness]
            }`}
          >
            {review.data.readiness}
          </span>

          <p className="text-base text-ink dark:text-paper">
            {review.data.summary}
          </p>

          <div>
            <h3 className={sectionLabel}>Strengths</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink dark:text-paper">
              {review.data.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={sectionLabel}>Before you submit</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink dark:text-paper">
              {review.data.improvements.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

export default ReviewPage;
