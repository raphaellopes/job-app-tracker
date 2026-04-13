import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { JOB_STATUSES } from "@/db/schema";

import StatusFilter from "./index";

import { formatStatusName } from "@/utils/format-status-name";

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

describe("StatusFilter", () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePathname.mockReturnValue("/board");
    mockedUseRouter.mockReturnValue({
      replace: mockReplace,
    } as unknown as ReturnType<typeof useRouter>);
    mockSearchParams("");
  });

  describe("rendering", () => {
    it("renders All Statuses and one option per job status with formatted labels", () => {
      render(<StatusFilter />);

      const select = screen.getByRole("combobox");
      expect(within(select).getByRole("option", { name: "All Statuses" })).toHaveValue("");
      for (const status of JOB_STATUSES) {
        expect(
          within(select).getByRole("option", { name: formatStatusName(status) }),
        ).toHaveValue(status);
      }
    });

    it("selects the current status from the URL when present", () => {
      mockSearchParams("status=APPLIED");
      render(<StatusFilter />);

      expect(screen.getByRole("combobox")).toHaveValue("APPLIED");
    });
  });

  describe("filtering", () => {
    it("calls router.replace with status when a status is chosen", async () => {
      const user = userEvent.setup();
      render(<StatusFilter />);

      await user.selectOptions(screen.getByRole("combobox"), "INTERVIEWING");

      expect(mockReplace).toHaveBeenCalledTimes(1);
      const target = mockReplace.mock.calls[0][0] as string;
      expect(target.startsWith("/board?")).toBe(true);
      const qs = new URLSearchParams(target.split("?")[1] ?? "");
      expect(qs.get("status")).toBe("INTERVIEWING");
    });

    it("preserves other query params when setting status", async () => {
      const user = userEvent.setup();
      mockSearchParams("search=acme&sort=updated");
      render(<StatusFilter />);

      await user.selectOptions(screen.getByRole("combobox"), "OFFER");

      const target = mockReplace.mock.calls[0][0] as string;
      const qs = new URLSearchParams(target.split("?")[1] ?? "");
      expect(qs.get("search")).toBe("acme");
      expect(qs.get("sort")).toBe("updated");
      expect(qs.get("status")).toBe("OFFER");
    });

    it("removes status from the URL when All Statuses is chosen", async () => {
      const user = userEvent.setup();
      mockSearchParams("status=REJECTED&search=foo");
      render(<StatusFilter />);

      await user.selectOptions(screen.getByRole("combobox"), "");

      const target = mockReplace.mock.calls[0][0] as string;
      const qs = new URLSearchParams(target.split("?")[1] ?? "");
      expect(qs.get("status")).toBeNull();
      expect(qs.get("search")).toBe("foo");
    });
  });
});
