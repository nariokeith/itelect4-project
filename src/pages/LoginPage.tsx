// src/pages/LoginPage.tsx
// There is no real password -- typing a name is enough. The point is the
// store write and the redirect, not authentication.
import { useState } from "react";
import { useNavigate } from "react-router";
import useAuthStore from "../store/authStore";
import { pageHeading, sectionLabel } from "../styles/ui";

function LoginPage() {
  const [name, setName] = useState<string>("");

  // Pull just the login action out of the store
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // useNavigate() gives you a function to call LATER, from inside a handler.
  // Calling navigate() in the component body would run on every render and
  // loop forever.
  const handleLogin = (): void => {
    login(name); // 1. put the token in the store
    navigate("/submissions"); // 2. then send them where they were going
  };

  return (
    <div className="max-w-sm">
      <p className={sectionLabel}>session</p>
      <h2 className={`mt-2 ${pageHeading}`}>Login</h2>
      <p className="mt-2 text-sm text-graphite dark:text-graphite-lift">
        Any name works. Logging in unlocks the Submissions page.
      </p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="mt-5 w-full rounded-md bg-white/70 px-3 py-2 font-mono text-sm text-ink ring-1 ring-rule backdrop-blur-md transition placeholder:text-graphite/80 focus:bg-white focus:ring-2 focus:ring-ink focus:outline-none dark:bg-ink-raise/70 dark:text-paper dark:ring-ink-line dark:placeholder:text-graphite-lift/80 dark:focus:bg-ink-raise dark:focus:ring-paper"
      />

      <button
        onClick={handleLogin}
        disabled={name === ""}
        className="mt-3 rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-ink/85 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none disabled:bg-graphite/40 disabled:text-graphite dark:bg-paper dark:text-ink dark:hover:bg-paper/85 dark:focus-visible:ring-paper dark:focus-visible:ring-offset-ink dark:disabled:bg-graphite-lift/30 dark:disabled:text-graphite-lift"
      >
        Log In
      </button>
    </div>
  );
}

export default LoginPage;
