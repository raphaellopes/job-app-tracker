import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

import { createJob, updateJob } from "@/actions/jobs";
import { JobForm } from "@/features/jobs/components/job-form";
import { createMockJob } from "@/test-utils/factories";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
  unstable_rethrow: jest.fn(),
}));
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQueryClient: jest.fn(),
}));

jest.mock("@/actions/jobs", () => ({
  createJob: jest.fn(),
  updateJob: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
  },
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedUsePathname = jest.mocked(usePathname);
const mockedUseSearchParams = jest.mocked(useSearchParams);
const mockedUseQueryClient = jest.mocked(useQueryClient);
const mockedCreateJob = jest.mocked(createJob);
const mockedUpdateJob = jest.mocked(updateJob);
const mockedToast = jest.mocked(toast);

describe("JobForm", () => {
  const mockReplace = jest.fn();
  const mockRefresh = jest.fn();
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePathname.mockReturnValue("/board");
    mockedUseSearchParams.mockReturnValue(
      new URLSearchParams("add=true&edit=1&status=APPLIED") as unknown as ReturnType<
        typeof useSearchParams
      >,
    );
    mockedUseRouter.mockReturnValue({
      replace: mockReplace,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useRouter>);
    mockedUseQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    } as unknown as ReturnType<typeof useQueryClient>);
    mockedCreateJob.mockResolvedValue({ success: true });
    mockedUpdateJob.mockResolvedValue({ success: true });
  });

  describe("validation", () => {
    it("shows errors for company name and position when they are empty on submit", async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      await user.click(screen.getByRole("button", { name: /add job/i }));

      expect(await screen.findByText("Company name is required")).toBeInTheDocument();
      expect(screen.getByText("Position is required")).toBeInTheDocument();
      expect(mockedCreateJob).not.toHaveBeenCalled();
      expect(mockedUpdateJob).not.toHaveBeenCalled();
    });

    it("shows an error when status is empty on submit", async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      const statusSelect = screen.getByLabelText(/status/i);
      fireEvent.change(statusSelect, { target: { value: "" } });

      await user.type(screen.getByLabelText(/company name/i), "Contoso");
      await user.type(screen.getByLabelText(/^position/i), "PM");
      await user.click(screen.getByRole("button", { name: /add job/i }));

      expect(await screen.findByText("Status is required")).toBeInTheDocument();
      expect(mockedCreateJob).not.toHaveBeenCalled();
    });
  });

  describe("submit", () => {
    it("calls createJob with FormData and navigates on success when creating", async () => {
      const user = userEvent.setup();
      render(<JobForm />);

      await user.type(screen.getByLabelText(/company name/i), "Contoso");
      await user.type(screen.getByLabelText(/^position/i), "Engineer");
      await user.selectOptions(screen.getByLabelText(/status/i), "APPLIED");
      await user.type(screen.getByLabelText(/salary range/i), "100-120k");
      await user.type(screen.getByLabelText(/^tags/i), "react, ts");
      await user.type(screen.getByLabelText(/description/i), "Great team");

      await user.click(screen.getByRole("button", { name: /add job/i }));

      await waitFor(() => {
        expect(mockedCreateJob).toHaveBeenCalledTimes(1);
      });
      expect(mockedUpdateJob).not.toHaveBeenCalled();

      const fd = mockedCreateJob.mock.calls[0][0];
      expect(fd.get("companyName")).toBe("Contoso");
      expect(fd.get("jobTitle")).toBe("Engineer");
      expect(fd.get("status")).toBe("APPLIED");
      expect(fd.get("salaryRange")).toBe("100-120k");
      expect(fd.get("tags")).toBe("react, ts");
      expect(fd.get("description")).toBe("Great team");
      expect(fd.get("id")).toBeNull();

      expect(mockedToast.success).toHaveBeenCalledWith("Job added successfully.");
      expect(mockReplace).toHaveBeenCalledWith("/board");
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("calls updateJob with FormData including id when editing", async () => {
      const user = userEvent.setup();
      const job = createMockJob({ id: 7, companyName: "Old Co", jobTitle: "Old Role" });
      render(<JobForm job={job} />);

      await user.clear(screen.getByLabelText(/company name/i));
      await user.type(screen.getByLabelText(/company name/i), "New Co");
      await user.click(screen.getByRole("button", { name: /update job/i }));

      await waitFor(() => {
        expect(mockedUpdateJob).toHaveBeenCalledTimes(1);
      });
      expect(mockedCreateJob).not.toHaveBeenCalled();

      const fd = mockedUpdateJob.mock.calls[0][0];
      expect(fd.get("id")).toBe("7");
      expect(fd.get("companyName")).toBe("New Co");
      expect(fd.get("jobTitle")).toBe("Old Role");

      expect(mockedToast.success).toHaveBeenCalledWith("Job updated successfully.");
      expect(mockReplace).toHaveBeenCalledWith("/board");
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("does not call updateJob when validation fails in edit mode", async () => {
      const user = userEvent.setup();
      render(
        <JobForm
          job={createMockJob({
            id: 42,
            tags: ["remote"],
          })}
        />,
      );

      await user.clear(screen.getByLabelText(/company name/i));
      await user.clear(screen.getByLabelText(/^position/i));
      await user.click(screen.getByRole("button", { name: /update job/i }));

      await waitFor(() => {
        expect(screen.getByText("Company name is required")).toBeInTheDocument();
      });
      expect(mockedUpdateJob).not.toHaveBeenCalled();
    });

    it("does not toast or navigate when the action returns without success", async () => {
      const user = userEvent.setup();
      mockedCreateJob.mockResolvedValueOnce({ error: "validation" });
      render(<JobForm />);

      await user.type(screen.getByLabelText(/company name/i), "Solo");
      await user.type(screen.getByLabelText(/^position/i), "Dev");
      await user.click(screen.getByRole("button", { name: /add job/i }));

      await waitFor(() => {
        expect(mockedCreateJob).toHaveBeenCalled();
      });
      expect(mockedToast.success).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });
});
