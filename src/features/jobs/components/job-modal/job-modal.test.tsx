import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Job } from "@/db/schema";

import JobModal from "./index";

import { createMockJob } from "@/test-utils/factories";

jest.mock("@/features/jobs/components/job-form", () => ({
  JobForm: ({ job, initialStatus }: { job?: Job | null; initialStatus?: string }) => (
    <div data-testid="job-form-mock">
      <span data-testid="job-form-job-id">{job?.id ?? "none"}</span>
      <span data-testid="job-form-initial-status">{initialStatus ?? "none"}</span>
    </div>
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedUsePathname = jest.mocked(usePathname);
const mockedUseSearchParams = jest.mocked(useSearchParams);

function mockSearchParams(query: string) {
  mockedUseSearchParams.mockReturnValue(
    new URLSearchParams(query) as unknown as ReturnType<typeof useSearchParams>,
  );
}

describe("JobModal", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePathname.mockReturnValue("/board");
    mockedUseRouter.mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>);
    mockSearchParams("");
  });

  it("renders nothing when the modal should not be open", () => {
    mockSearchParams("other=value");
    const { container } = render(<JobModal />);

    expect(container.firstChild).toBeNull();
  });

  it("renders the add title and form when add=true", () => {
    mockSearchParams("add=true");
    render(<JobModal />);

    expect(screen.getByRole("heading", { name: /add new job/i })).toBeInTheDocument();
    expect(screen.getByTestId("job-form-mock")).toBeInTheDocument();
    expect(screen.getByTestId("job-form-job-id")).toHaveTextContent("none");
  });

  it("renders the edit title when edit is set and a job is provided", () => {
    mockSearchParams("edit=7");
    render(<JobModal job={createMockJob({ id: 7 })} />);

    expect(screen.getByRole("heading", { name: /edit job/i })).toBeInTheDocument();
    expect(screen.getByTestId("job-form-job-id")).toHaveTextContent("7");
  });

  it("passes a valid status from the query string to JobForm", () => {
    mockSearchParams("add=true&status=INTERVIEWING");
    render(<JobModal />);

    expect(screen.getByTestId("job-form-initial-status")).toHaveTextContent("INTERVIEWING");
  });

  it("does not pass initialStatus when the status query is invalid", () => {
    mockSearchParams("add=true&status=NOT_A_STATUS");
    render(<JobModal />);

    expect(screen.getByTestId("job-form-initial-status")).toHaveTextContent("none");
  });

  it("navigates away while preserving unrelated query params when the modal is closed", async () => {
    const user = userEvent.setup();
    mockSearchParams("add=true&tab=settings&status=APPLIED");
    render(<JobModal />);

    await user.click(screen.getByRole("button", { name: /close modal/i }));

    expect(mockPush).toHaveBeenCalledWith("/board?tab=settings");
  });

  it("navigates to the pathname alone when no query params remain after close", async () => {
    const user = userEvent.setup();
    mockSearchParams("add=true");
    render(<JobModal />);

    await user.click(screen.getByRole("button", { name: /close modal/i }));

    expect(mockPush).toHaveBeenCalledWith("/board");
  });
});
