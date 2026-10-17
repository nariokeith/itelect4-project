// Session 8 left the login form on plain useState on purpose: one field, no
// rules worth writing. It has an email and a password now, so it gets the
// same treatment the submission form got.
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("That is not an email address."),

  // Eight is not picked here: itelect4-backend's User schema says
  // minlength 8. This only moves the message to where it is typed.
  password: z.string().min(8, "At least 8 characters."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// .extend() adds to a schema instead of repeating it, so the email and
// password rules are written once and used by both forms.
export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1, "Your name is required."),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
