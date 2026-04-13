import { render, screen } from "@testing-library/react";

import InterviewPrepMatchScore from "./index";

describe("InterviewPrepMatchScore", () => {
  it("shows the rounded match percentage and a progress bar for a normal score", () => {
    render(<InterviewPrepMatchScore score={73.4} />);

    expect(screen.getByText("Match score")).toBeInTheDocument();
    expect(screen.getByText("73%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /resume match score/i })).toHaveAttribute(
      "aria-valuenow",
      "73",
    );
  });

  it("clamps scores below zero to zero", () => {
    render(<InterviewPrepMatchScore score={-20} />);

    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /resume match score/i })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("clamps scores above 100 to 100", () => {
    render(<InterviewPrepMatchScore score={150} />);

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /resume match score/i })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });
});
