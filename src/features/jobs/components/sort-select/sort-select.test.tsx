import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SortSelect from "./index";

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

describe("SortSelect", () => {
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
    it("renders all sort options with labels and values", () => {
      render(<SortSelect />);

      const select = screen.getByRole("combobox");
      expect(within(select).getByRole("option", { name: "Newest First" })).toHaveValue("date-desc");
      expect(within(select).getByRole("option", { name: "Oldest First" })).toHaveValue("date-asc");
      expect(within(select).getByRole("option", { name: "Salary (High to Low)" })).toHaveValue(
        "salary-desc",
      );
      expect(within(select).getByRole("option", { name: "Salary (Low to High)" })).toHaveValue(
        "salary-asc",
      );
    });

    it("defaults to Newest First when sort is absent from the URL", () => {
      mockSearchParams("");
      render(<SortSelect />);

      expect(screen.getByRole("combobox")).toHaveValue("date-desc");
    });

    it("selects the current sort from the URL when present", () => {
      mockSearchParams("sort=salary-asc");
      render(<SortSelect />);

      expect(screen.getByRole("combobox")).toHaveValue("salary-asc");
    });
  });

  describe("sorting", () => {
    it("calls router.replace with sort when an option is chosen", async () => {
      const user = userEvent.setup();
      render(<SortSelect />);

      await user.selectOptions(screen.getByRole("combobox"), "date-asc");

      expect(mockReplace).toHaveBeenCalledTimes(1);
      const target = mockReplace.mock.calls[0][0] as string;
      expect(target.startsWith("/board?")).toBe(true);
      const qs = new URLSearchParams(target.split("?")[1] ?? "");
      expect(qs.get("sort")).toBe("date-asc");
    });

    it("preserves other query params when setting sort", async () => {
      const user = userEvent.setup();
      mockSearchParams("search=acme&status=APPLIED");
      render(<SortSelect />);

      await user.selectOptions(screen.getByRole("combobox"), "salary-desc");

      const target = mockReplace.mock.calls[0][0] as string;
      const qs = new URLSearchParams(target.split("?")[1] ?? "");
      expect(qs.get("search")).toBe("acme");
      expect(qs.get("status")).toBe("APPLIED");
      expect(qs.get("sort")).toBe("salary-desc");
    });
  });
});
