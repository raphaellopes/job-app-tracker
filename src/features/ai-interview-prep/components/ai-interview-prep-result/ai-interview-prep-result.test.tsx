import { render, screen, within } from "@testing-library/react";

import type { InterviewPrepResult } from "@/actions/gemini";

import AIInterviewPrepResult from "./index";

function createPrepResult(overrides: Partial<InterviewPrepResult> = {}): InterviewPrepResult {
  return {
    suggestedSkills: ["React", "TypeScript"],
    mockQuestions: ["How do you handle state?", "Describe your testing approach."],
    resumeMatchScore: 82,
    tips: "Highlight system design experience.",
    ...overrides,
  };
}

describe("AIInterviewPrepResult", () => {
  it("renders match score, keywords, questions, and the tip card", () => {
    const result = createPrepResult();
    render(<AIInterviewPrepResult result={result} />);

    expect(screen.getByText("Match score")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();

    expect(screen.getByText("Recommended keywords")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();

    expect(screen.getByText("Likely questions")).toBeInTheDocument();
    expect(screen.getByText("How do you handle state?")).toBeInTheDocument();
    expect(screen.getByText("Describe your testing approach.")).toBeInTheDocument();

    const tip = screen.getByText(/Highlight system design experience\./);
    expect(tip).toBeInTheDocument();
    expect(screen.getByText("Tip:")).toBeInTheDocument();
  });

  it("lists each mock question in its own list item", () => {
    const result = createPrepResult({
      mockQuestions: ["Q1", "Q2"],
    });
    render(<AIInterviewPrepResult result={result} />);

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Q1");
    expect(items[1]).toHaveTextContent("Q2");
  });
});
