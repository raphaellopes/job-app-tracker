import {
  mapJSearchJobDtoToJobFinderItem,
  mapJSearchResponseToJobFinderSearch,
} from "./map-to-job-finder";

describe("mapJSearchJobDtoToJobFinderItem", () => {
  it("maps core fields and defaults", () => {
    const item = mapJSearchJobDtoToJobFinderItem({
      job_id: "abc",
      job_title: "Engineer",
      employer_name: "Acme",
      job_publisher: "Indeed",
      job_apply_link: "https://apply",
      job_description: "Do things",
      job_is_remote: true,
    });

    expect(item).toMatchObject({
      externalJobId: "abc",
      title: "Engineer",
      employerName: "Acme",
      jobPublisher: "Indeed",
      applyLink: "https://apply",
      description: "Do things",
      isRemote: true,
      employmentTypes: [],
      requiredSkills: [],
      highlightQualifications: [],
      highlightResponsibilities: [],
    });
    expect(item.employerLogo).toBeNull();
  });

  it("merges primary employment type with list and maps highlights", () => {
    const item = mapJSearchJobDtoToJobFinderItem({
      job_id: "1",
      job_employment_type: "FULLTIME",
      job_employment_types: ["PARTTIME"],
      job_highlights: {
        Qualifications: ["  A  ", "B"],
        Responsibilities: ["R1"],
      },
    });

    expect(item.employmentTypes).toEqual(["FULLTIME", "PARTTIME"]);
    expect(item.highlightQualifications).toEqual(["  A  ", "B"]);
    expect(item.highlightResponsibilities).toEqual(["R1"]);
  });

  it("formats salary when min and max are numbers", () => {
    const item = mapJSearchJobDtoToJobFinderItem({
      job_id: "x",
      job_min_salary: 100_000,
      job_max_salary: 150_000,
      job_salary_currency: "USD",
      job_salary_period: "year",
    });

    expect(item.salary).toContain("USD");
    expect(item.salary).toMatch(/100/);
    expect(item.salary).toMatch(/150/);
    expect(item.salary).toContain("year");
  });

  it("builds location tag from city, state, country", () => {
    const item = mapJSearchJobDtoToJobFinderItem({
      job_id: "1",
      job_city: " Austin ",
      job_state: "TX",
      job_country: "USA",
    });

    expect(item.locationTag).toBe("Austin, TX, USA");
  });
});

describe("mapJSearchResponseToJobFinderSearch", () => {
  it("filters out rows without externalJobId and sets hasNextPage from raw count", () => {
    const result = mapJSearchResponseToJobFinderSearch(
      {
        data: [
          { job_id: "", job_title: "No id" },
          { job_id: "ok", job_title: "Yes" },
          ...Array.from({ length: 8 }, (_, i) => ({ job_id: String(i), job_title: "Filler" })),
        ],
      },
      2,
    );

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.items.some((j) => j.externalJobId === "ok")).toBe(true);
    expect(result.items.every((j) => j.externalJobId)).toBe(true);
    expect(result.items).toHaveLength(9);
  });

  it("treats missing data as empty", () => {
    const result = mapJSearchResponseToJobFinderSearch({}, 1);
    expect(result.items).toEqual([]);
    expect(result.pagination.hasNextPage).toBe(false);
  });
});
