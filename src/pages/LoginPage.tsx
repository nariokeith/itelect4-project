import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuthStore from "../store/authStore";
import { loginUser } from "../api/client";
import { loginSchema } from "../schemas/authSchema";
import type { LoginFormValues } from "../schemas/authSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pageHeading, sectionLabel } from "../styles/ui";

const errorText = "text-sm text-late dark:text-late-lift";

function LoginPage() {
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const logIn = useMutation({
    mutationFn: loginUser,
    onSuccess: (reply) => {
      setSession(reply.token, reply.user.name);
      void navigate("/submissions");
    },
  });

  const onSubmit = (values: LoginFormValues): void => {
    logIn.mutate(values);
  };

  return (
    <div className="max-w-sm">
      <p className={sectionLabel}>session</p>
      <h2 className={`mt-2 ${pageHeading}`}>Login</h2>
      <p className="mt-2 text-sm text-graphite dark:text-graphite-lift">
        Logging in unlocks the Submissions page.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4">
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
            autoComplete="current-password"
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
          disabled={logIn.isPending}
          className="justify-self-start"
        >
          {logIn.isPending ? "Signing in…" : "Log In"}
        </Button>
      </form>

      {logIn.isError && (
        <p className={`mt-4 ${errorText}`}>{logIn.error.message}</p>
      )}

      <p className="mt-6 text-sm text-graphite dark:text-graphite-lift">
        No account yet?{" "}
        <Link
          to="/register"
          className="font-semibold text-ink underline underline-offset-4 dark:text-paper"
        >
          Register
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
