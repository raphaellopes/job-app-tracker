import { usePathname } from "next/navigation";
import { render, screen } from "@testing-library/react";

import { AddJobButton } from "./index";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const mockedUsePathname = jest.mocked(usePathname);

describe("AddJobButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePathname.mockReturnValue("/board");
  });

  describe("disabled state", () => {
    it("renders a disabled button with an explanatory label", () => {
      render(<AddJobButton isDisabled />);

      const button = screen.getByRole("button", {
        name: /add new job \(disabled while editing\)/i,
      });
      expect(button).toBeDisabled();
    });

    it("does not render a link when disabled", () => {
      render(<AddJobButton isDisabled />);

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
  });

  describe("enabled state", () => {
    it("links to the current pathname with add=true", () => {
      mockedUsePathname.mockReturnValue("/dashboard");
      render(<AddJobButton />);

      const link = screen.getByRole("link", { name: /add new job/i });
      expect(link).toHaveAttribute("href", "/dashboard?add=true");
    });

    it("appends status to the query string when provided", () => {
      mockedUsePathname.mockReturnValue("/board");
      render(<AddJobButton status="APPLIED" />);

      const link = screen.getByRole("link", { name: /add new job/i });
      expect(link).toHaveAttribute("href", "/board?add=true&status=APPLIED");
    });
  });
});
