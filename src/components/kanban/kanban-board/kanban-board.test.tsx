import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";

import type { DragEndEvent } from "@dnd-kit/core";
import { useRouter } from "next/navigation";

import { updateJobPositions, updateJobStatus } from "@/actions/jobs";
import type { Job } from "@/db/schema";
import { createMockJob } from "@/test-utils/factories";

import KanbanBoard from "./index";

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

jest.mock("@/components/kanban/kanban-column", () => ({
  __esModule: true,
  default: () => <div data-testid="kanban-column-stub" />,
}));

jest.mock("@/components/job/job-card", () => ({
  __esModule: true,
  default: ({ job }: { job: Job }) => (
    <span data-testid={`job-card-${job.id}`}>{job.companyName}</span>
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/actions/jobs", () => ({
  updateJobPositions: jest.fn(),
  updateJobStatus: jest.fn(),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedUpdateJobPositions = jest.mocked(updateJobPositions);
const mockedUpdateJobStatus = jest.mocked(updateJobStatus);

describe("KanbanBoard", () => {
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    lastOnDragEnd = undefined;
    mockedUseRouter.mockReturnValue({
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useRouter>);
    mockedUpdateJobPositions.mockResolvedValue({ success: true });
    mockedUpdateJobStatus.mockResolvedValue({ success: true });
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
        expect(mockedUpdateJobPositions).toHaveBeenCalledWith([20, 10], "WISHLIST");
      });
      expect(mockedUpdateJobStatus).not.toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
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
        expect(mockedUpdateJobStatus).toHaveBeenCalledWith(10, "APPLIED");
      });
      expect(mockedUpdateJobPositions).not.toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("does not call updateJobPositions when there is no drop target", async () => {
      render(
        <KanbanBoard jobs={[createMockJob({ id: 10, status: "WISHLIST" }), createMockJob({ id: 20, status: "WISHLIST" })]} />,
      );

      await act(async () => {
        await lastOnDragEnd?.({
          active: { id: 10 },
          over: null,
        } as unknown as DragEndEvent);
      });

      expect(mockedUpdateJobPositions).not.toHaveBeenCalled();
      expect(mockedUpdateJobStatus).not.toHaveBeenCalled();
    });

    it("does not call updateJobPositions when the job is dropped on itself", async () => {
      render(<KanbanBoard jobs={[createMockJob({ id: 10, status: "WISHLIST" })]} />);

      await act(async () => {
        await lastOnDragEnd?.({
          active: { id: 10 },
          over: { id: 10 },
        } as DragEndEvent);
      });

      expect(mockedUpdateJobPositions).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("does not refresh when updateJobPositions returns an error", async () => {
      mockedUpdateJobPositions.mockResolvedValueOnce({ error: "Invalid job IDs" });
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
        expect(mockedUpdateJobPositions).toHaveBeenCalled();
      });
      expect(mockRefresh).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
