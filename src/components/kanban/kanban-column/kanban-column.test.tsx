import { render, screen } from "@testing-library/react";

import { useDroppable } from "@dnd-kit/core";

import type { Job } from "@/db/schema";

import KanbanColumn from "./index";

jest.mock("@dnd-kit/core", () => ({
  ...jest.requireActual("@dnd-kit/core"),
  useDroppable: jest.fn(),
}));

jest.mock("@/components/job/add-job-button", () => ({
  AddJobButton: ({ status }: { status: string }) => (
    <button type="button" data-testid={`add-job-${status}`}>
      Add
    </button>
  ),
}));

jest.mock("@/components/job/job-card", () => ({
  __esModule: true,
  default: ({ job }: { job: Job }) => (
    <div data-testid={`job-card-${job.id}`}>{job.companyName}</div>
  ),
}));

const mockedUseDroppable = jest.mocked(useDroppable);

function createJob(overrides: Partial<Job> = {}): Job {
  const now = new Date();
  return {
    id: 1,
    userId: 10,
    companyName: "Acme Corp",
    jobTitle: "Software Engineer",
    tags: ["remote"],
    status: "WISHLIST",
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

describe("KanbanColumn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseDroppable.mockReturnValue({
      setNodeRef: jest.fn(),
      isOver: false,
    } as unknown as ReturnType<typeof useDroppable>);
  });

  it("registers the column as a droppable with the status id", () => {
    render(<KanbanColumn status="INTERVIEWING" jobs={[]} />);

    expect(mockedUseDroppable).toHaveBeenCalledWith({ id: "INTERVIEWING" });
  });

  it("renders formatted status title and job count", () => {
    render(
      <KanbanColumn
        status="APPLIED"
        jobs={[createJob({ id: 1, status: "APPLIED" }), createJob({ id: 2, status: "APPLIED" })]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Applied" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders empty state copy when there are no jobs", () => {
    render(<KanbanColumn status="OFFER" jobs={[]} />);

    expect(screen.getByText("No jobs yet")).toBeInTheDocument();
    expect(screen.getByText(/Drop a job here or click \+ to add/)).toBeInTheDocument();
  });

  it("renders a job card for each job", () => {
    render(
      <KanbanColumn
        status="WISHLIST"
        jobs={[
          createJob({ id: 5, companyName: "Beta", status: "WISHLIST" }),
          createJob({ id: 6, companyName: "Gamma", status: "WISHLIST" }),
        ]}
      />,
    );

    expect(screen.getByTestId("job-card-5")).toHaveTextContent("Beta");
    expect(screen.getByTestId("job-card-6")).toHaveTextContent("Gamma");
  });

  it("passes status to AddJobButton", () => {
    render(<KanbanColumn status="REJECTED" jobs={[]} />);

    expect(screen.getByTestId("add-job-REJECTED")).toBeInTheDocument();
  });

  it("applies highlight styling when the column is an active drop target", () => {
    mockedUseDroppable.mockReturnValue({
      setNodeRef: jest.fn(),
      isOver: true,
    } as unknown as ReturnType<typeof useDroppable>);

    const { container } = render(<KanbanColumn status="WISHLIST" jobs={[]} />);
    const column = container.firstElementChild as HTMLElement;

    expect(column.className).toContain("border-blue-500");
  });
});
