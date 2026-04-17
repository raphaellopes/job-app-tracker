import React from "react";
import { useRouter } from "next/navigation";
import type { DragEndEvent } from "@dnd-kit/core";
import { act, render, screen, waitFor } from "@testing-library/react";

import type { Job } from "@/db/schema";

import KanbanBoard from "@/features/jobs/components/kanban-board";
import { useUpdateJobPositions, useUpdateJobStatus } from "@/features/jobs/mutations";
import { createMockJob } from "@/test-utils/factories";

let lastOnDragEnd: ((e: DragEndEvent) => void | Promise<void>) | undefined;

jest.mock("@dnd-kit/core", () => {
  const actual = jest.requireActual("@dnd-kit/core");
  return {
    ...actual,
    DndContext: ({
      children,
      onDragEnd,
    }: {
      children: React.ReactNode;
      onDragEnd?: (e: DragEndEvent) => void | Promise<void>;
    }) => {
      lastOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
    },
    DragOverlay: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="drag-overlay">{children}</div>
    ),
  };
});

jest.mock("@dnd-kit/sortable", () => {
  const actual = jest.requireActual("@dnd-kit/sortable");
  return {
    ...actual,
    SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock("@/features/jobs/components/kanban-column", () => ({
  __esModule: true,
  default: () => <div data-testid="kanban-column-stub" />,
}));

jest.mock("@/features/jobs/components/job-card", () => ({
  __esModule: true,
  default: ({ job }: { job: Job }) => (
    <span data-testid={`job-card-${job.id}`}>{job.companyName}</span>
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/features/jobs/mutations", () => ({
  useUpdateJobPositions: jest.fn(),
  useUpdateJobStatus: jest.fn(),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedUseUpdateJobPositions = jest.mocked(useUpdateJobPositions);
const mockedUseUpdateJobStatus = jest.mocked(useUpdateJobStatus);
const mockedMutatePositionsAsync = jest.fn();
const mockedMutateStatusAsync = jest.fn();

describe("KanbanBoard", () => {
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    lastOnDragEnd = undefined;
    mockedUseRouter.mockReturnValue({
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useRouter>);
    mockedMutatePositionsAsync.mockResolvedValue({ success: true });
    mockedMutateStatusAsync.mockResolvedValue({ success: true });
    mockedUseUpdateJobPositions.mockReturnValue({
      mutateAsync: mockedMutatePositionsAsync,
    } as unknown as ReturnType<typeof useUpdateJobPositions>);
    mockedUseUpdateJobStatus.mockReturnValue({
      mutateAsync: mockedMutateStatusAsync,
    } as unknown as ReturnType<typeof useUpdateJobStatus>);
  });

  describe("rendering", () => {
    it("renders one column slot per job status", () => {
      render(<KanbanBoard jobs={[]} />);

      expect(screen.getByTestId("dnd-context")).toBeInTheDocument();
      expect(screen.getAllByTestId("kanban-column-stub")).toHaveLength(5);
    });
  });

  describe("drag end", () => {
    it("calls updateJobPositions with reordered ids when a job is moved within the same column", async () => {
      const jobs = [
        createMockJob({ id: 10, status: "WISHLIST", position: 0 }),
        createMockJob({ id: 20, status: "WISHLIST", position: 1 }),
      ];
      render(<KanbanBoard jobs={jobs} />);

      await act(async () => {
        await lastOnDragEnd?.({
          active: { id: 10 },
          over: { id: 20 },
        } as DragEndEvent);
      });

      await waitFor(() => {
        expect(mockedMutatePositionsAsync).toHaveBeenCalledWith({
          jobIds: [20, 10],
          status: "WISHLIST",
        });
      });
      expect(mockedMutateStatusAsync).not.toHaveBeenCalled();
    });

    it("calls updateJobStatus when a job is dropped into a different status column", async () => {
      const jobs = [
        createMockJob({ id: 10, status: "WISHLIST" }),
        createMockJob({ id: 20, status: "APPLIED" }),
      ];
      render(<KanbanBoard jobs={jobs} />);

      await act(async () => {
        await lastOnDragEnd?.({
          active: { id: 10 },
          over: { id: 20 },
        } as DragEndEvent);
      });

      await waitFor(() => {
        expect(mockedMutateStatusAsync).toHaveBeenCalledWith({ jobId: 10, status: "APPLIED" });
      });
      expect(mockedMutatePositionsAsync).not.toHaveBeenCalled();
    });

    it("does not call updateJobPositions when there is no drop target", async () => {
      render(
        <KanbanBoard
          jobs={[
            createMockJob({ id: 10, status: "WISHLIST" }),
            createMockJob({ id: 20, status: "WISHLIST" }),
          ]}
        />,
      );

      await act(async () => {
        await lastOnDragEnd?.({
          active: { id: 10 },
          over: null,
        } as unknown as DragEndEvent);
      });

      expect(mockedMutatePositionsAsync).not.toHaveBeenCalled();
      expect(mockedMutateStatusAsync).not.toHaveBeenCalled();
    });

    it("does not call updateJobPositions when the job is dropped on itself", async () => {
      render(<KanbanBoard jobs={[createMockJob({ id: 10, status: "WISHLIST" })]} />);

      await act(async () => {
        await lastOnDragEnd?.({
          active: { id: 10 },
          over: { id: 10 },
        } as DragEndEvent);
      });

      expect(mockedMutatePositionsAsync).not.toHaveBeenCalled();
    });

    it("does not refresh when updateJobPositions returns an error", async () => {
      mockedMutatePositionsAsync.mockResolvedValueOnce({ error: "Invalid job IDs" });
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const jobs = [
        createMockJob({ id: 10, status: "WISHLIST" }),
        createMockJob({ id: 20, status: "WISHLIST" }),
      ];
      render(<KanbanBoard jobs={jobs} />);

      await act(async () => {
        await lastOnDragEnd?.({
          active: { id: 10 },
          over: { id: 20 },
        } as DragEndEvent);
      });

      await waitFor(() => {
        expect(mockedMutatePositionsAsync).toHaveBeenCalled();
      });
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
