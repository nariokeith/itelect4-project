// Test 1 of 3: a component render. It sits beside SubmissionBadge.tsx with
// .test in front of .tsx, which is how Vitest finds it.
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SubmissionBadge from "./SubmissionBadge";
import type { ApiSubmission } from "../types/index";

// One submission shaped like a row from GET /api/submissions. Typed, so a
// field ApiSubmission does not have is a compile error here as well.
const graded: ApiSubmission = {
  id: "665f1c2ab4e8d3a1f0c9e101",
  studentId: "665f1c2ab4e8d3a1f0c9e001",
  courseCode: "ITELECT4",
  repoUrl: "https://github.com/nariokeith/itelect4-project",
  submittedAt: "2026-10-17T02:15:00.000Z",
  score: 95,
};

// The badge's corner box is the part that changes with the score prop: the
// number and "graded", or "--" and "pending". The CSS uppercases the label
// on screen, but the text in the page is lowercase, and that is what
// getByText reads.
describe("SubmissionBadge", () => {
  it("shows the repo link, the score and graded when there is a score", () => {
    render(<SubmissionBadge submission={graded} />);

    expect(
      screen.getByText("https://github.com/nariokeith/itelect4-project"),
    ).toBeInTheDocument();
    expect(screen.getByText("95")).toBeInTheDocument();
    expect(screen.getByText("graded")).toBeInTheDocument();
  });

  it("shows -- and pending when the submission has no score yet", () => {
    // Everything from graded, with the score taken away -- a submission the
    // instructor has not marked.
    const ungraded: ApiSubmission = { ...graded, score: undefined };

    render(<SubmissionBadge submission={ungraded} />);

    expect(screen.getByText("--")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.queryByText("graded")).not.toBeInTheDocument();
  });
});
