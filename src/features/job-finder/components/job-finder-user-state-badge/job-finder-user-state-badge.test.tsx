import { render, screen } from "@testing-library/react";

import UserStateBadge from "./index";

describe("UserStateBadge", () => {
  it("renders Not a fit for dismissed jobs", () => {
    render(<UserStateBadge userState="not_a_fit" />);

    expect(screen.getByText("Not a fit")).toBeInTheDocument();
  });

  it("renders In wishlist for saved jobs", () => {
    render(<UserStateBadge userState="saved" />);

    expect(screen.getByText("In wishlist")).toBeInTheDocument();
  });

  it("renders nothing for untracked jobs", () => {
    const { container } = render(<UserStateBadge userState="none" />);

    expect(container).toBeEmptyDOMElement();
  });
});
