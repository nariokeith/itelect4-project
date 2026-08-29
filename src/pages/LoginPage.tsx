import { useState } from "react";
import { useNavigate } from "react-router";
import useAuthStore from "../store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pageHeading, sectionLabel } from "../styles/ui";

// The second page using Button, Input and Label -- and it keeps useState on
// purpose. One field with one rule ("not empty") does not need a schema, a
// resolver or useForm. The UI components and the form library are independent:
// either one works without the other, and knowing when to stop is the point.
function LoginPage() {
  const [name, setName] = useState<string>("");

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (): void => {
    login(name);
    void navigate("/submissions");
  };

  return (
    <div className="max-w-sm">
      <p className={sectionLabel}>session</p>
      <h2 className={`mt-2 ${pageHeading}`}>Login</h2>
      <p className="mt-2 text-sm text-graphite dark:text-graphite-lift">
        Any name works. Logging in unlocks the Submissions page.
      </p>

      <div className="mt-5 grid gap-1.5">
        <Label htmlFor="name" className="text-foreground">
          Your name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan dela Cruz"
          className="font-mono"
        />
      </div>

      {/* Disabling on empty is fine HERE: there is no error message this
          would hide, and no blur-then-click to get in the way. */}
      <Button onClick={handleLogin} disabled={name === ""} className="mt-3">
        Log In
      </Button>
    </div>
  );
}

export default LoginPage;
