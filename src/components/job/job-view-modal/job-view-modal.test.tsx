import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Job } from "@/db/schema";

jest.mock("@/components/job/job-view", () => ({
  __esModule: true,
  default: ({ job }: { job: Job }) => (
    <div data-testid="job-view-mock">job-view:{job.id}</div>
  ),
}));

jest.mock("@/components/modals/modal", () => ({
  __esModule: true,
  default: ({
    title,
    description,
    children,
    onClose,
  }: {
    title?: string;
    description?: string;
    children: React.ReactNode;
    onClose: () => void;
  }) => (
    <div data-testid="modal-mock">
      <h2>{title}</h2>
      <p>{description}</p>
      <button type="button" aria-label="Close modal" onClick={onClose}>
        close
      </button>
      {children}
    </div>
  ),
}));

import JobViewModal from "./index";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedUsePathname = jest.mocked(usePathname);
const mockedUseSearchParams = jest.mocked(useSearchParams);

function createMockJob(overrides: Partial<Job> = {}): Job {
  const now = new Date();
  return {
    id: 12,
    userId: 3,
    companyName: "Globex",
    jobTitle: "Analyst",
    tags: [],
    status: "APPLIED",
    position: 0,
    salaryRange: null,
    appliedDate: null,
    description: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function mockSearchParams(query: string) {
  mockedUseSearchParams.mockReturnValue(
    new URLSearchParams(query) as unknown as ReturnType<typeof useSearchParams>,
  );
}

describe("JobViewModal", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePathname.mockReturnValue("/dashboard");
    mockedUseRouter.mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>);
    mockSearchParams("");
  });

  it("renders nothing when there is no view query param", () => {
    mockSearchParams("tab=jobs");
    const { container } = render(<JobViewModal job={createMockJob()} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when there is no job even if view is set", () => {
    mockSearchParams("view=12");
    const { container } = render(<JobViewModal />);

    expect(container.firstChild).toBeNull();
  });

  it("opens a modal with job title, company, and JobView when view and job are present", () => {
    mockSearchParams("view=12");
    const job = createMockJob({ id: 12, jobTitle: "PM", companyName: "Initech" });
    render(<JobViewModal job={job} />);

    expect(screen.getByRole("heading", { name: "PM" })).toBeInTheDocument();
    expect(screen.getByText("Initech")).toBeInTheDocument();
    expect(screen.getByTestId("job-view-mock")).toHaveTextContent("job-view:12");
  });

  it("removes only the view param and preserves others when closed", async () => {
    const user = userEvent.setup();
    mockSearchParams("view=12&tab=board&sort=date");
    render(<JobViewModal job={createMockJob({ id: 12 })} />);

    await user.click(screen.getByRole("button", { name: /close modal/i }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard?tab=board&sort=date");
  });

  it("navigates to the pathname alone when view was the only query param", async () => {
    const user = userEvent.setup();
    mockSearchParams("view=12");
    render(<JobViewModal job={createMockJob()} />);

    await user.click(screen.getByRole("button", { name: /close modal/i }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
