import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { analyzeJob, type InterviewPrepResult } from "@/actions/gemini";
import { saveJobInterviewPrep } from "@/actions/jobs";
import type { Job } from "@/db/schema";

import AIInterviewPrep from "./index";

jest.mock("@/actions/gemini", () => ({
  analyzeJob: jest.fn(),
}));

jest.mock("@/actions/jobs", () => ({
  saveJobInterviewPrep: jest.fn(),
}));

jest.mock("@/components/ai-interview-prep/ai-interview-prep-result", () => ({
  __esModule: true,
  default: ({ result }: { result: InterviewPrepResult }) => (
    <div data-testid="ai-interview-prep-result">score:{result.resumeMatchScore}</div>
  ),
}));

const mockedAnalyzeJob = jest.mocked(analyzeJob);
const mockedSaveJobInterviewPrep = jest.mocked(saveJobInterviewPrep);

function createMockJob(overrides: Partial<Job> = {}): Job {
  const now = new Date();
  return {
    id: 10,
    userId: 1,
    companyName: "Acme",
    jobTitle: "Engineer",
    tags: [],
    status: "WISHLIST",
    position: 0,
    salaryRange: null,
    appliedDate: null,
    description: "Build things",
    notes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createPrepResult(overrides: Partial<InterviewPrepResult> = {}): InterviewPrepResult {
  return {
    suggestedSkills: ["a"],
    mockQuestions: ["b"],
    resumeMatchScore: 50,
    tips: "c",
    ...overrides,
  };
}

describe("AIInterviewPrep", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("shows the section title and a Generate control", () => {
      render(<AIInterviewPrep job={createMockJob()} />);

      expect(screen.getByRole("heading", { name: /ai interview prep/i })).toBeInTheDocument();
      expect(
        screen.getByText(/get ai-generated interview questions and resume matching analysis/i),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^generate$/i })).toBeInTheDocument();
    });

    it("does not render the result panel until a result exists", () => {
      render(<AIInterviewPrep job={createMockJob()} />);

      expect(screen.queryByTestId("ai-interview-prep-result")).not.toBeInTheDocument();
    });

    it("renders saved prep from props and shows Regenerate and Saved", () => {
      const prep = createPrepResult({ resumeMatchScore: 88 });
      render(<AIInterviewPrep job={createMockJob()} initialSavedResult={prep} />);

      expect(screen.getByTestId("ai-interview-prep-result")).toHaveTextContent("score:88");
      expect(screen.getByRole("button", { name: /^regenerate$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^saved$/i })).toBeDisabled();
    });
  });

  describe("generate flow", () => {
    it("calls analyzeJob and shows the result when generation succeeds", async () => {
      const user = userEvent.setup();
      const prep = createPrepResult({ resumeMatchScore: 61 });
      mockedAnalyzeJob.mockResolvedValueOnce(prep);
      render(<AIInterviewPrep job={createMockJob({ id: 3 })} />);

      await user.click(screen.getByRole("button", { name: /^generate$/i }));

      await waitFor(() => {
        expect(mockedAnalyzeJob).toHaveBeenCalledWith(expect.objectContaining({ id: 3 }));
      });
      expect(screen.getByTestId("ai-interview-prep-result")).toHaveTextContent("score:61");
      expect(screen.getByRole("button", { name: /^regenerate$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
    });

    it("shows an error when the AI response cannot be parsed", async () => {
      const user = userEvent.setup();
      mockedAnalyzeJob.mockResolvedValueOnce(null);
      render(<AIInterviewPrep job={createMockJob()} />);

      await user.click(screen.getByRole("button", { name: /^generate$/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Could not parse the AI response. Please try again."),
        ).toBeInTheDocument();
      });
      expect(screen.queryByTestId("ai-interview-prep-result")).not.toBeInTheDocument();
    });

    it("shows an error message when analyzeJob throws", async () => {
      const user = userEvent.setup();
      mockedAnalyzeJob.mockRejectedValueOnce(new Error("API unavailable"));
      render(<AIInterviewPrep job={createMockJob()} />);

      await user.click(screen.getByRole("button", { name: /^generate$/i }));

      await waitFor(() => {
        expect(screen.getByText("API unavailable")).toBeInTheDocument();
      });
    });
  });

  describe("save flow", () => {
    it("calls saveJobInterviewPrep and marks the prep as saved", async () => {
      const user = userEvent.setup();
      const prep = createPrepResult();
      mockedAnalyzeJob.mockResolvedValueOnce(prep);
      mockedSaveJobInterviewPrep.mockResolvedValueOnce({ success: true });
      render(<AIInterviewPrep job={createMockJob({ id: 7 })} />);

      await user.click(screen.getByRole("button", { name: /^generate$/i }));
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole("button", { name: /^save$/i });
      expect(saveButton).not.toBeDisabled();
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockedSaveJobInterviewPrep).toHaveBeenCalledWith(7, prep);
      });
      expect(screen.getByRole("button", { name: /^saved$/i })).toBeDisabled();
    });

    it("shows save errors returned by the action", async () => {
      const user = userEvent.setup();
      const prep = createPrepResult();
      mockedAnalyzeJob.mockResolvedValueOnce(prep);
      mockedSaveJobInterviewPrep.mockResolvedValueOnce({ error: "Job not found" });
      render(<AIInterviewPrep job={createMockJob()} />);

      await user.click(screen.getByRole("button", { name: /^generate$/i }));
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole("button", { name: /^save$/i }));

      await waitFor(() => {
        expect(screen.getByText("Job not found")).toBeInTheDocument();
      });
    });

    it("shows a message when saveJobInterviewPrep rejects", async () => {
      const user = userEvent.setup();
      const prep = createPrepResult();
      mockedAnalyzeJob.mockResolvedValueOnce(prep);
      mockedSaveJobInterviewPrep.mockRejectedValueOnce(new Error("network"));
      render(<AIInterviewPrep job={createMockJob()} />);

      await user.click(screen.getByRole("button", { name: /^generate$/i }));
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole("button", { name: /^save$/i }));

      await waitFor(() => {
        expect(screen.getByText("network")).toBeInTheDocument();
      });
    });
  });
});
