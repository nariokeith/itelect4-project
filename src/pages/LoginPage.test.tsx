// Test 3 of 3: form validation. It types into the real form and presses the
// real button, the way a student would.
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./LoginPage";

// LoginPage calls useNavigate and useMutation, and both throw unless the page
// sits inside the providers main.tsx gives the real app. MemoryRouter is
// BrowserRouter without an address bar.
function renderLoginPage(): void {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// Put fetch back after every test, so a spy from one test cannot leak into
// the next.
afterEach(() => {
  vi.restoreAllMocks();
});

describe("LoginPage", () => {
  it("shows both schema messages when the form is sent empty", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "Log In" }));

    // The exact sentences from src/schemas/authSchema.ts.
    expect(
      await screen.findByText("That is not an email address."),
    ).toBeInTheDocument();
    expect(screen.getByText("At least 8 characters.")).toBeInTheDocument();
  });

  it("sends nothing to the API while the form is invalid", async () => {
    // Watches fetch without stopping it. If the form ever got past the
    // schema, request() in client.ts would call fetch and this would count it.
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText("Email"), "juan@dlsl.edu.ph");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(
      await screen.findByText("At least 8 characters."),
    ).toBeInTheDocument();
    // The email was fine, so its message is not on the page.
    expect(
      screen.queryByText("That is not an email address."),
    ).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
