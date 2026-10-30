import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SubmissionBadge from "./SubmissionBadge";
import type { ApiSubmission } from "../types/index";

const graded: ApiSubmission = {
  id: "665f1c2ab4e8d3a1f0c9e101",
  studentId: "665f1c2ab4e8d3a1f0c9e001",
  courseCode: "ITELECT4",
  repoUrl: "https://github.com/nariokeith/itelect4-project",
  submittedAt: "2026-10-17T02:15:00.000Z",
  score: 95,
};

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
    const ungraded: ApiSubmission = { ...graded, score: undefined };

    render(<SubmissionBadge submission={ungraded} />);

    expect(screen.getByText("--")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.queryByText("graded")).not.toBeInTheDocument();
  });
});
