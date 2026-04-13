import { render, screen } from "@testing-library/react";

import { getStatusColor } from "@/utils/status-colors";

import JobStatusTag from "./index";

jest.mock("@/utils/status-colors", () => ({
  getStatusColor: jest.fn(() => ({
    bg: "bg-test-bg",
    text: "text-test-text",
    border: "border-test-border",
  })),
}));

const mockedGetStatusColor = jest.mocked(getStatusColor);

describe("JobStatusTag", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ["WISHLIST", "Wishlist"],
    ["APPLIED", "Applied"],
    ["INTERVIEWING", "Interviewing"],
    ["OFFER", "Offer"],
    ["REJECTED", "Rejected"],
  ] as const)("formats %s as %s", (status, expectedLabel) => {
    render(<JobStatusTag status={status} />);

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    expect(mockedGetStatusColor).toHaveBeenCalledWith(status);
  });

  it("merges color classes from getStatusColor onto the span", () => {
    const { container } = render(<JobStatusTag status="APPLIED" />);
    const span = container.querySelector("span");

    expect(span).toHaveClass("bg-test-bg", "text-test-text", "bg-opacity-10");
  });

  it("forwards extra span attributes", () => {
    render(<JobStatusTag status="OFFER" data-testid="status-pill" title="Status" />);

    const pill = screen.getByTestId("status-pill");
    expect(pill).toHaveAttribute("title", "Status");
  });
});
