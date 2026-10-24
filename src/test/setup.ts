// vite.config.ts names this file in test.setupFiles, so Vitest runs it before
// every test file. The app itself never imports it.
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Adds toBeInTheDocument() and friends to expect(), and tells TypeScript
// they exist.
import "@testing-library/jest-dom/vitest";

// Every render() lands on the same pretend page. Without this the next test
// would still see what the last one rendered -- two "Log In" buttons.
afterEach(() => {
  cleanup();
});
