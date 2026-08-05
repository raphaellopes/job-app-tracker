import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import JobFinderResultsTable from "./job-finder-results-table";

import type { JobFinderItem } from "@/features/job-finder/types";

const baseJob: JobFinderItem = {
  externalJobId: "job-1",
  title: "Software Engineer",
  employerName: "Acme Corp",
  employerLogo: null,
  jobPublisher: "LinkedIn",
  employmentTypes: ["FULLTIME"],
  applyLink: "https://example.com/apply",
  description: "Build things",
  isRemote: false,
  requiredSkills: [],
  highlightQualifications: [],
  highlightResponsibilities: [],
};

describe("JobFinderResultsTable", () => {
  it("shows a Not a fit badge for dismissed jobs", () => {
    render(
      <JobFinderResultsTable
        results={[{ ...baseJob, userState: "not_a_fit" }]}
        onSelectJob={jest.fn()}
      />,
    );

    expect(screen.getByText("Not a fit")).toBeInTheDocument();
  });

  it("shows an In wishlist badge for saved jobs", () => {
    render(
      <JobFinderResultsTable
        results={[{ ...baseJob, userState: "saved" }]}
        onSelectJob={jest.fn()}
      />,
    );

    expect(screen.getByText("In wishlist")).toBeInTheDocument();
  });

  it("calls onSelectJob when a row is clicked", async () => {
    const user = userEvent.setup();
    const onSelectJob = jest.fn();

    render(<JobFinderResultsTable results={[baseJob]} onSelectJob={onSelectJob} />);

    await user.click(screen.getByRole("button", { name: /Software Engineer/i }));

    expect(onSelectJob).toHaveBeenCalledWith(baseJob);
  });
});
