import { z } from "zod";

export const submissionSchema = z.object({
  courseCode: z.string().min(1, "Choose a course."),

  repoUrl: z
    .url("That is not a valid URL -- include https://")
    .refine((url) => url.includes("github.com"), "It has to be a GitHub URL.")
    .refine(
      (url) => url.split("github.com/")[1]?.includes("/") ?? false,
      "Point at a repository, not a profile -- github.com/owner/repo."
    ),
});

export type SubmissionFormValues = z.infer<typeof submissionSchema>;
