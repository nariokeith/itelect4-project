// One schema. The rules live here, and the TypeScript type is DERIVED from it
// -- so a rule and its type can never drift apart.
//
// Nothing in this file knows that React exists. The same object could check an
// API response or a seed row; it happens to be pointed at a form.
import { z } from "zod";

export const submissionSchema = z.object({
  // .min(1) is what "required" means for a string: not empty. The dropdown
  // starts on the "" option, so this is the rule that catches "never chose".
  courseCode: z.string().min(1, "Choose a course."),

  // Four rules across the two fields, three of them on this one.
  repoUrl: z
    // z.url() checks the whole shape of a URL, scheme included -- which is
    // why a bare "github.com/me/repo" fails here and not below.
    .url("That is not a valid URL -- include https://")
    // .refine() adds a rule Zod does not ship: yours, as a function. This app
    // tracks GitHub repository submissions, so the host is part of the data.
    .refine((url) => url.includes("github.com"), "It has to be a GitHub URL.")
    // Take whatever follows "github.com/" and require another slash in it --
    // that slash is the owner/repo split. "github.com/juandc" is a profile,
    // not something a marker can clone.
    .refine(
      (url) => url.split("github.com/")[1]?.includes("/") ?? false,
      "Point at a repository, not a profile -- github.com/owner/repo."
    ),
});

// z.infer reads the schema and hands back the TypeScript type:
//   { courseCode: string; repoUrl: string }
// Written by hand that would be a second thing to keep in sync; add a field
// above and this gains it in the same keystroke.
//
// `typeof` here is the TYPE-level typeof, not the JavaScript operator: inside
// a type expression it means "the type of the variable submissionSchema".
// z.infer wants a type and submissionSchema is a value, so it is required.
export type SubmissionFormValues = z.infer<typeof submissionSchema>;
