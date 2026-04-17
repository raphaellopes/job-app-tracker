import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Job } from "@/db/schema";

import { createMockJob } from "@/test-utils/factories";

jest.mock("@/components/tag/tag-chip-list", () => ({
  __esModule: true,
  default: ({ tags }: { tags: string[] }) => (
    <div data-testid="tag-chip-list">{tags.join(",")}</div>
  ),
}));

jest.mock("@/features/jobs/components/job-notes-form", () => ({
  __esModule: true,
  default: ({ jobId, initialNotes }: { jobId: number; initialNotes: string | null }) => (
    <div data-testid="job-notes-form">
      <span data-testid="notes-job-id">{jobId}</span>
      <span data-testid="notes-initial">{initialNotes ?? "null"}</span>
    </div>
  ),
}));

jest.mock("@/components/ai-interview-prep/ai-interview-prep", () => ({
  __esModule: true,
  default: ({ job, initialSavedResult }: { job: Job; initialSavedResult: unknown }) => (
    <div data-testid="ai-interview-prep">
      <span data-testid="prep-job-id">{job.id}</span>
      <span data-testid="prep-initial">{initialSavedResult === null ? "null" : "set"}</span>
    </div>
  ),
}));

import JobView from "@/features/jobs/components/job-view";

describe("JobView", () => {
  it("defaults to the job information tab when opened", () => {
    render(<JobView job={createMockJob()} />);

    expect(screen.getByRole("tab", { name: "Job information" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "AI interview prep" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByText("Job publisher")).toBeVisible();
    expect(screen.getByTestId("ai-interview-prep")).not.toBeVisible();
  });

  it("shows tag chips when the job has tags", () => {
    render(<JobView job={createMockJob({ tags: ["remote", "typescript"] })} />);

    expect(screen.getByTestId("tag-chip-list")).toHaveTextContent("remote,typescript");
  });

  it("shows an empty-tags message when there are no tags", () => {
    render(<JobView job={createMockJob({ tags: [] })} />);

    expect(screen.queryByTestId("tag-chip-list")).not.toBeInTheDocument();
    expect(screen.getByText("No tags added yet.")).toBeInTheDocument();
  });

  it("renders the job description or a placeholder", () => {
    const { rerender } = render(<JobView job={createMockJob({ description: "Backend role" })} />);

    expect(screen.getByText("Backend role")).toBeInTheDocument();

    rerender(<JobView job={createMockJob({ description: null })} />);
    expect(screen.getByText("No description added yet.")).toBeInTheDocument();
  });

  it("passes job id and notes into JobNotesForm", () => {
    render(<JobView job={createMockJob({ id: 42, notes: "Follow up Monday" })} />);

    expect(screen.getByTestId("notes-job-id")).toHaveTextContent("42");
    expect(screen.getByTestId("notes-initial")).toHaveTextContent("Follow up Monday");
  });

  it("passes the job and interview prep into AIInterviewPrep", () => {
    const job = createMockJob({ id: 99 });
    const prep = { suggestedSkills: [], mockQuestions: [] } as never;

    render(<JobView job={job} initialInterviewPrep={prep} />);

    expect(screen.getByTestId("prep-job-id")).toHaveTextContent("99");
    expect(screen.getByTestId("prep-initial")).toHaveTextContent("set");
  });

  it("passes null interview prep when omitted", () => {
    render(<JobView job={createMockJob()} />);

    expect(screen.getByTestId("prep-initial")).toHaveTextContent("null");
  });

  it("switches to the AI interview prep tab", async () => {
    const user = userEvent.setup();
    render(<JobView job={createMockJob({ id: 7 })} />);

    await user.click(screen.getByRole("tab", { name: "AI interview prep" }));

    expect(screen.getByRole("tab", { name: "AI interview prep" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByTestId("ai-interview-prep")).toBeVisible();
    expect(screen.getByText("Job publisher")).not.toBeVisible();
    expect(screen.getByTestId("prep-job-id")).toHaveTextContent("7");
  });
});
