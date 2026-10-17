import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuthStore from "../store/authStore";
import { loginUser, registerUser } from "../api/client";
import { registerSchema } from "../schemas/authSchema";
import type { RegisterFormValues } from "../schemas/authSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pageHeading, sectionLabel } from "../styles/ui";

const errorText = "text-sm text-late dark:text-late-lift";

function RegisterPage() {
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: { name: "", email: "", password: "" },
  });

  const signUp = useMutation({
    // Two requests, in order. /api/auth/register creates the user but issues
    // no token -- login is the only route that signs one. Without the second
    // call you would land on the login page to type the same password again.
    mutationFn: async (values: RegisterFormValues) => {
      await registerUser(values);
      return loginUser({ email: values.email, password: values.password });
    },
    onSuccess: (reply) => {
      setSession(reply.token, reply.user.name);
      void navigate("/submissions");
    },
  });

  const onSubmit = (values: RegisterFormValues): void => {
    signUp.mutate(values);
  };

  return (
    <div className="max-w-sm">
      <p className={sectionLabel}>session</p>
      <h2 className={`mt-2 ${pageHeading}`}>Register</h2>
      <p className="mt-2 text-sm text-graphite dark:text-graphite-lift">
        Make an account, and you are logged in straight away.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="name" className="text-foreground">
            Your name
          </Label>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            placeholder="Juan dela Cruz"
            className="font-mono"
            {...register("name")}
          />
          {errors.name && <p className={errorText}>{errors.name.message}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="email" className="text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            placeholder="juan@dlsl.edu.ph"
            className="font-mono"
            {...register("email")}
          />
          {errors.email && <p className={errorText}>{errors.email.message}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="password" className="text-foreground">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? true : undefined}
            className="font-mono"
            {...register("password")}
          />
          {errors.password && (
            <p className={errorText}>{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={signUp.isPending}
          className="justify-self-start"
        >
          {signUp.isPending ? "Creating account…" : "Register"}
        </Button>
      </form>

      {/* The API's own sentence, e.g. "That email is already registered". */}
      {signUp.isError && (
        <p className={`mt-4 ${errorText}`}>{signUp.error.message}</p>
      )}

      <p className="mt-6 text-sm text-graphite dark:text-graphite-lift">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-ink underline underline-offset-4 dark:text-paper"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
