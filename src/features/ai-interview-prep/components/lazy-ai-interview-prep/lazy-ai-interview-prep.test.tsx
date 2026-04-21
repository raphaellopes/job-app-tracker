import { render, screen } from "@testing-library/react";

import LazyAIInterviewPrep from "./index";

import { createMockInterviewPrepResult, createMockJob } from "@/test-utils/factories";
import { useJobInterviewPrep } from "@/features/ai-interview-prep/queries";

jest.mock("@/features/ai-interview-prep/components/ai-interview-prep", () => ({
  __esModule: true,
  default: ({
    job,
    initialSavedResult,
  }: {
    job: { id: number };
    initialSavedResult: unknown;
  }) => (
    <div data-testid="ai-interview-prep">
      <span data-testid="prep-job-id">{job.id}</span>
      <span data-testid="prep-initial">{initialSavedResult ? "set" : "null"}</span>
    </div>
  ),
}));

jest.mock("@/features/ai-interview-prep/queries", () => ({
  useJobInterviewPrep: jest.fn(),
}));

const mockedUseJobInterviewPrep = jest.mocked(useJobInterviewPrep);

describe("LazyAIInterviewPrep", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("passes saved prep to AIInterviewPrep when query resolves", () => {
    const result = createMockInterviewPrepResult();
    mockedUseJobInterviewPrep.mockReturnValue({
      data: result,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useJobInterviewPrep>);

    render(<LazyAIInterviewPrep job={createMockJob({ id: 42 })} />);

    expect(mockedUseJobInterviewPrep).toHaveBeenCalledWith(42);
    expect(screen.getByTestId("prep-job-id")).toHaveTextContent("42");
    expect(screen.getByTestId("prep-initial")).toHaveTextContent("set");
  });

  it("shows loading message while query is loading", () => {
    mockedUseJobInterviewPrep.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useJobInterviewPrep>);

    render(<LazyAIInterviewPrep job={createMockJob({ id: 11 })} />);

    expect(screen.getByText("Loading saved interview prep...")).toBeInTheDocument();
    expect(screen.queryByTestId("ai-interview-prep")).not.toBeInTheDocument();
  });

  it("shows an error message when query fails", () => {
    mockedUseJobInterviewPrep.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Could not load saved interview prep."),
    } as ReturnType<typeof useJobInterviewPrep>);

    render(<LazyAIInterviewPrep job={createMockJob({ id: 11 })} />);

    expect(screen.getByText("Could not load saved interview prep.")).toBeInTheDocument();
    expect(screen.queryByTestId("ai-interview-prep")).not.toBeInTheDocument();
  });
});
