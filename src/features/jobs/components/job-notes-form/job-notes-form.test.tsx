import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { updateJobNotes } from "@/actions/jobs";

import JobNotesForm from "./index";

import { useUpdateJobNotes } from "@/features/jobs/mutations";

jest.mock("@/actions/jobs", () => ({
  updateJobNotes: jest.fn(),
}));
jest.mock("@/features/jobs/mutations", () => ({
  useUpdateJobNotes: jest.fn(),
}));

const mockedUpdateJobNotes = jest.mocked(updateJobNotes);
const mockedUseUpdateJobNotes = jest.mocked(useUpdateJobNotes);

async function advanceTimers(ms: number) {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });
}

describe("JobNotesForm", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockedUpdateJobNotes.mockResolvedValue({ success: true });
    mockedUseUpdateJobNotes.mockReturnValue({
      mutateAsync: ({ jobId, notes }: { jobId: number; notes: string }) =>
        updateJobNotes(jobId, notes),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateJobNotes>);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("rendering", () => {
    it("renders a textarea with the expected id, placeholder, and initial notes", () => {
      render(<JobNotesForm jobId={12} initialNotes="Line one" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("id", "job-notes-12");
      expect(textarea).toHaveAttribute(
        "placeholder",
        "Add interview prep notes, key contacts, follow-ups...",
      );
      expect(textarea).toHaveValue("Line one");
      expect(screen.getByText("Saved automatically")).toBeInTheDocument();
    });

    it("treats null initial notes as an empty string", () => {
      render(<JobNotesForm jobId={3} initialNotes={null} />);
      expect(screen.getByRole("textbox")).toHaveValue("");
    });
  });

  describe("saving", () => {
    it("does not call updateJobNotes on mount when notes match the last saved value", async () => {
      render(<JobNotesForm jobId={1} initialNotes="unchanged" />);

      await advanceTimers(700);

      expect(mockedUpdateJobNotes).not.toHaveBeenCalled();
    });

    it("debounces updateJobNotes until notes stop changing for SAVE_DEBOUNCE_MS", async () => {
      render(<JobNotesForm jobId={7} initialNotes="" />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "a" } });
      await advanceTimers(699);
      expect(mockedUpdateJobNotes).not.toHaveBeenCalled();

      fireEvent.change(textarea, { target: { value: "ab" } });
      await advanceTimers(699);
      expect(mockedUpdateJobNotes).not.toHaveBeenCalled();

      await advanceTimers(1);
      await waitFor(() => {
        expect(mockedUpdateJobNotes).toHaveBeenCalledTimes(1);
      });
      expect(mockedUpdateJobNotes).toHaveBeenLastCalledWith(7, "ab");
    });

    it("saves on blur without waiting for the debounce timer", async () => {
      render(<JobNotesForm jobId={9} initialNotes="" />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "urgent" } });
      fireEvent.blur(textarea);

      await waitFor(() => {
        expect(mockedUpdateJobNotes).toHaveBeenCalledWith(9, "urgent");
      });

      await advanceTimers(700);
      expect(mockedUpdateJobNotes).toHaveBeenCalledTimes(1);
    });

    it("keeps auto-save messaging while a save is in flight", async () => {
      mockedUpdateJobNotes.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ success: true });
            }, 400);
          }),
      );

      render(<JobNotesForm jobId={2} initialNotes="" />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "draft" } });
      await advanceTimers(700);

      await advanceTimers(400);
      await waitFor(() => {
        expect(screen.getByText("Saved automatically")).toBeInTheDocument();
      });
    });

    it("does not call updateJobNotes again on blur when there are no unsaved changes", async () => {
      render(<JobNotesForm jobId={4} initialNotes="" />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "once" } });
      await advanceTimers(700);
      await waitFor(() => {
        expect(mockedUpdateJobNotes).toHaveBeenCalledTimes(1);
      });

      mockedUpdateJobNotes.mockClear();
      fireEvent.blur(textarea);

      await advanceTimers(700);
      expect(mockedUpdateJobNotes).not.toHaveBeenCalled();
    });
  });

  describe("errors", () => {
    it("surfaces an error message from updateJobNotes when the action returns an error", async () => {
      mockedUpdateJobNotes.mockResolvedValueOnce({ error: "Job not found" });

      render(<JobNotesForm jobId={5} initialNotes="" />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "oops" } });
      await advanceTimers(700);

      await waitFor(() => {
        expect(screen.getByText("Job not found")).toBeInTheDocument();
      });
    });

    it("shows a generic message when updateJobNotes rejects", async () => {
      mockedUpdateJobNotes.mockRejectedValueOnce(new Error("network"));

      render(<JobNotesForm jobId={6} initialNotes="" />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "x" } });
      await advanceTimers(700);

      await waitFor(() => {
        expect(screen.getByText("Failed to save notes.")).toBeInTheDocument();
      });
    });
  });
});
