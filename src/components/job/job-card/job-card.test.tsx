import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Job } from "@/db/schema";

jest.mock("@/components/job/delete-job-button", () => ({
  __esModule: true,
  default: ({ id }: { id: number }) => <span data-testid={`delete-job-${id}`}>Delete</span>,
}));

import JobCard from "./index";

const navigationState = {
  pathname: "/board",
  searchParams: new URLSearchParams(),
};

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => navigationState.pathname),
  useSearchParams: jest.fn(() => navigationState.searchParams),
}));

jest.mock("@dnd-kit/sortable", () => ({
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  })),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedUsePathname = jest.mocked(usePathname);
const mockedUseSearchParams = jest.mocked(useSearchParams);
const mockedUseSortable = jest.mocked(useSortable);

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

describe("JobCard", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    navigationState.pathname = "/board";
    navigationState.searchParams = new URLSearchParams();
    mockedUseRouter.mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>);
    mockedUsePathname.mockImplementation(() => navigationState.pathname);
    mockedUseSearchParams.mockImplementation(
      () => navigationState.searchParams as unknown as ReturnType<typeof useSearchParams>,
    );
    mockedUseSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      transform: null,
      transition: undefined,
      isDragging: false,
    } as unknown as ReturnType<typeof useSortable>);
  });

  describe("rendering", () => {
    it("renders company name, job title, and tags", () => {
      render(<JobCard job={createJob()} />);

      expect(screen.getByRole("heading", { name: "Acme Corp" })).toBeInTheDocument();
      expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      expect(screen.getByText("remote")).toBeInTheDocument();
    });

    it("renders salary and description when present", () => {
      render(
        <JobCard
          job={createJob({
            salaryRange: "$120k–$150k",
            description: "Build great things",
          })}
        />,
      );

      expect(screen.getByText("💰 $120k–$150k")).toBeInTheDocument();
      expect(screen.getByText("Build great things")).toBeInTheDocument();
    });

    it("does not render salary or description when absent", () => {
      render(<JobCard job={createJob({ salaryRange: null, description: null })} />);

      expect(screen.queryByText(/💰/)).not.toBeInTheDocument();
      expect(screen.queryByText("Build great things")).not.toBeInTheDocument();
    });

    it("renders the edit link with the job id", () => {
      render(<JobCard job={createJob({ id: 42 })} />);

      const editLink = document.querySelector('a[href="/board?edit=42"]');
      expect(editLink).toBeInTheDocument();
    });
  });

  describe("open view", () => {
    it("pushes the board URL with view set and add/edit cleared", async () => {
      const user = userEvent.setup();
      navigationState.searchParams = new URLSearchParams("add=1&edit=99&foo=bar");
      render(<JobCard job={createJob({ id: 7 })} />);

      await user.click(screen.getByRole("heading", { name: "Acme Corp" }));

      expect(mockPush).toHaveBeenCalledWith("/board?foo=bar&view=7");
    });

    it("pushes only view when there were no other params", async () => {
      const user = userEvent.setup();
      navigationState.searchParams = new URLSearchParams();
      render(<JobCard job={createJob({ id: 3 })} />);

      await user.click(screen.getByRole("heading", { name: "Acme Corp" }));

      expect(mockPush).toHaveBeenCalledWith("/board?view=3");
    });
  });

  describe("drag affordance", () => {
    it("uses grabbing cursor while dragging", () => {
      mockedUseSortable.mockReturnValueOnce({
        attributes: {},
        listeners: {},
        setNodeRef: jest.fn(),
        transform: null,
        transition: undefined,
        isDragging: true,
      } as unknown as ReturnType<typeof useSortable>);

      render(<JobCard job={createJob()} />);

      expect(screen.getByRole("heading", { name: "Acme Corp" }).closest("div.group")).toHaveClass(
        "cursor-grabbing",
      );
    });
  });
});
