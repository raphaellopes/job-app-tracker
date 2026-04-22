import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

import JobStatusSelect from "./index";

import { useUpdateJobStatus } from "@/features/jobs/mutations";

jest.mock("@/features/jobs/mutations", () => ({
  useUpdateJobStatus: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedUseUpdateJobStatus = jest.mocked(useUpdateJobStatus);
const mockedToast = jest.mocked(toast);

describe("JobStatusSelect", () => {
  const mutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mutateAsync.mockResolvedValue({ success: true });
    mockedUseUpdateJobStatus.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateJobStatus>);
  });

  it("renders the formatted current status", () => {
    render(<JobStatusSelect jobId={1} status="INTERVIEWING" />);

    expect(
      screen.getByRole("button", {
        name: /interviewing/i,
      }),
    ).toBeInTheDocument();
  });

  it("opens and shows all available statuses", async () => {
    const user = userEvent.setup();
    render(<JobStatusSelect jobId={1} status="WISHLIST" />);

    await user.click(screen.getByRole("button", { name: /wishlist/i }));

    const listbox = screen.getByRole("listbox", { name: /select job status/i });
    expect(listbox).toBeInTheDocument();
    expect(within(listbox).getByRole("button", { name: "Wishlist" })).toBeInTheDocument();
    expect(within(listbox).getByRole("button", { name: "Applied" })).toBeInTheDocument();
    expect(within(listbox).getByRole("button", { name: "Interviewing" })).toBeInTheDocument();
    expect(within(listbox).getByRole("button", { name: "Offer" })).toBeInTheDocument();
    expect(within(listbox).getByRole("button", { name: "Rejected" })).toBeInTheDocument();
  });

  it("updates status and shows success toast", async () => {
    const user = userEvent.setup();
    render(<JobStatusSelect jobId={7} status="WISHLIST" />);

    await user.click(screen.getByRole("button", { name: /wishlist/i }));
    await user.click(screen.getByRole("button", { name: "Applied" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ jobId: 7, status: "APPLIED" });
    });
    expect(screen.getByRole("button", { name: /applied/i })).toBeInTheDocument();
    expect(mockedToast.success).toHaveBeenCalledWith("Status updated successfully.");
  });

  it("shows an error toast and reverts selection when mutation returns an error", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValueOnce({ error: "Failed to update job status" });
    render(<JobStatusSelect jobId={7} status="WISHLIST" />);

    await user.click(screen.getByRole("button", { name: /wishlist/i }));
    await user.click(screen.getByRole("button", { name: "Applied" }));

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith("Could not update the job status.");
    });
    expect(screen.getByRole("button", { name: /wishlist/i })).toBeInTheDocument();
  });

  it("applies mapped status colors to trigger and options", async () => {
    const user = userEvent.setup();
    render(<JobStatusSelect jobId={2} status="APPLIED" />);

    const trigger = screen.getByRole("button", { name: /applied/i });
    expect(trigger).toHaveClass("border-blue-900");
    expect(trigger.querySelector(".bg-blue-500")).toBeInTheDocument();

    await user.click(trigger);

    const rejectedOption = screen.getByRole("button", { name: "Rejected" });
    expect(rejectedOption.querySelector(".bg-red-500")).toBeInTheDocument();
  });
});
