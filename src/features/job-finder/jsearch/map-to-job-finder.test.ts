import {
  mapJSearchJobDtoToJobFinderItem,
  mapJSearchResponseToJobFinderSearch,
} from "./map-to-job-finder";

import { generateExternalJobId } from "@/features/job-finder/generate-external-job-id";

describe("mapJSearchJobDtoToJobFinderItem", () => {
  it("maps core fields and defaults with a deterministic externalJobId", () => {
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
      externalJobId: generateExternalJobId({
        title: "Engineer",
        companyName: "Acme",
        location: "",
      }),
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

  it("ignores unstable provider job_id when generating externalJobId", () => {
    const a = mapJSearchJobDtoToJobFinderItem({
      job_id: "provider-id-1",
      job_title: "Engineer",
      employer_name: "Acme",
      job_city: "Austin",
      job_state: "TX",
      job_country: "USA",
    });
    const b = mapJSearchJobDtoToJobFinderItem({
      job_id: "provider-id-2",
      job_title: "Engineer",
      employer_name: "Acme",
      job_city: "Austin",
      job_state: "TX",
      job_country: "USA",
    });

    expect(a.externalJobId).toBe(b.externalJobId);
    expect(a.externalJobId).toBe(
      generateExternalJobId({
        title: "Engineer",
        companyName: "Acme",
        location: "Austin, TX, USA",
      }),
    );
  });

  it("merges primary employment type with list and maps highlights", () => {
    const item = mapJSearchJobDtoToJobFinderItem({
      job_id: "1",
      job_title: "Role",
      employer_name: "Co",
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
      job_title: "Role",
      employer_name: "Co",
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
      job_title: "Role",
      employer_name: "Co",
      job_city: " Austin ",
      job_state: "TX",
      job_country: "USA",
    });

    expect(item.locationTag).toBe("Austin, TX, USA");
  });
});

describe("mapJSearchResponseToJobFinderSearch", () => {
  it("filters out rows without usable identity and sets hasNextPage from raw count", () => {
    const result = mapJSearchResponseToJobFinderSearch(
      {
        data: [
          { job_id: "ignored", job_title: "", employer_name: "" },
          { job_id: "also-ignored", job_title: "Yes", employer_name: "Acme" },
          ...Array.from({ length: 8 }, (_, i) => ({
            job_id: String(i),
            job_title: "Filler",
            employer_name: "Co",
          })),
        ],
      },
      2,
    );

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.items).toHaveLength(9);
    expect(result.items.every((j) => j.externalJobId)).toBe(true);
    expect(
      result.items.some(
        (j) =>
          j.externalJobId ===
          generateExternalJobId({
            title: "Yes",
            companyName: "Acme",
            location: "",
          }),
      ),
    ).toBe(true);
  });

  it("treats missing data as empty", () => {
    const result = mapJSearchResponseToJobFinderSearch({}, 1);
    expect(result.items).toEqual([]);
    expect(result.pagination.hasNextPage).toBe(false);
  });
});
