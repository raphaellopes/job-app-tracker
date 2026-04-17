import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

import { deleteJob } from "@/actions/jobs";

import DeleteJobButton from "@/features/jobs/components/delete-job-button";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQueryClient: jest.fn(),
}));

jest.mock("@/actions/jobs", () => ({
  deleteJob: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedUseQueryClient = jest.mocked(useQueryClient);
const mockedDeleteJob = jest.mocked(deleteJob);
const mockedToast = jest.mocked(toast);

describe("DeleteJobButton", () => {
  const mockRefresh = jest.fn();
  const mockInvalidateQueries = jest.fn();
  let consoleErrorSpy: jest.SpyInstance<void, Parameters<typeof console.error>>;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedUseRouter.mockReturnValue({
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useRouter>);
    mockedUseQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    } as unknown as ReturnType<typeof useQueryClient>);
    mockedDeleteJob.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  function getDeleteFormControls(jobId: number) {
    const idInput = screen.getByDisplayValue(String(jobId));
    const form = idInput.closest("form");
    if (!form) {
      throw new Error("Expected form wrapping the id input");
    }
    const submitButton = within(form).getByRole("button");
    return { form, submitButton };
  }

  describe("rendering", () => {
    it("renders a form with a hidden id field and a submit button", () => {
      render(<DeleteJobButton id={42} />);

      const { form, submitButton } = getDeleteFormControls(42);
      expect(form).toBeInTheDocument();
      expect(form.querySelector('input[name="id"]')).toHaveAttribute("value", "42");
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });

  describe("confirm modal", () => {
    it("opens the confirm modal when the delete control is used", async () => {
      const user = userEvent.setup();
      render(<DeleteJobButton id={7} />);

      await user.click(getDeleteFormControls(7).submitButton);

      expect(screen.getByRole("heading", { name: /delete this job\?/i })).toBeInTheDocument();
      expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^delete$/i })).toBeInTheDocument();
    });

    it("closes the modal when Cancel is clicked without calling deleteJob", async () => {
      const user = userEvent.setup();
      render(<DeleteJobButton id={8} />);

      await user.click(getDeleteFormControls(8).submitButton);
      await user.click(screen.getByRole("button", { name: /^cancel$/i }));

      await waitFor(() => {
        expect(
          screen.queryByRole("heading", { name: /delete this job\?/i }),
        ).not.toBeInTheDocument();
      });
      expect(mockedDeleteJob).not.toHaveBeenCalled();
    });
  });

  describe("delete flow", () => {
    it("calls deleteJob with FormData containing the job id when Delete is confirmed", async () => {
      const user = userEvent.setup();
      render(<DeleteJobButton id={99} />);

      await user.click(getDeleteFormControls(99).submitButton);
      await user.click(screen.getByRole("button", { name: /^delete$/i }));

      await waitFor(() => {
        expect(mockedDeleteJob).toHaveBeenCalledTimes(1);
      });
      const fd = mockedDeleteJob.mock.calls[0][0];
      expect(fd.get("id")).toBe("99");
    });

    it("shows success toast and refreshes when deleteJob succeeds", async () => {
      const user = userEvent.setup();
      mockedDeleteJob.mockResolvedValueOnce({ success: true });
      render(<DeleteJobButton id={1} />);

      await user.click(getDeleteFormControls(1).submitButton);
      await user.click(screen.getByRole("button", { name: /^delete$/i }));

      await waitFor(() => {
        expect(mockedToast.success).toHaveBeenCalledWith("Job removed successfully.");
      });
      expect(mockedToast.error).not.toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe("error scenarios", () => {
    it("shows an error toast and logs when deleteJob rejects", async () => {
      const user = userEvent.setup();
      const err = new Error("network failure");
      mockedDeleteJob.mockRejectedValueOnce(err);
      render(<DeleteJobButton id={2} />);

      await user.click(getDeleteFormControls(2).submitButton);
      await user.click(screen.getByRole("button", { name: /^delete$/i }));

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith(
          "Something went wrong while deleting the job.",
        );
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting job:", err);
      expect(mockedToast.success).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("shows a specific error toast when deleteJob returns invalid_id", async () => {
      const user = userEvent.setup();
      mockedDeleteJob.mockResolvedValueOnce({ error: "invalid_id" });
      render(<DeleteJobButton id={3} />);

      await user.click(getDeleteFormControls(3).submitButton);
      await user.click(screen.getByRole("button", { name: /^delete$/i }));

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith("This job could not be found or removed.");
      });
      expect(mockedToast.success).not.toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("shows a generic error toast when deleteJob returns another error code", async () => {
      const user = userEvent.setup();
      mockedDeleteJob.mockResolvedValueOnce({ error: "unknown" });
      render(<DeleteJobButton id={4} />);

      await user.click(getDeleteFormControls(4).submitButton);
      await user.click(screen.getByRole("button", { name: /^delete$/i }));

      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith("Could not delete this job.");
      });
      expect(mockedToast.success).not.toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
