import {
  generateExternalJobId,
  hasUsableExternalJobIdentity,
  normalizeExternalJobIdPart,
} from "./generate-external-job-id";

describe("normalizeExternalJobIdPart", () => {
  it("trims, collapses whitespace, and lowercases", () => {
    expect(normalizeExternalJobIdPart("  Senior   Engineer  ")).toBe("senior engineer");
  });
});

describe("generateExternalJobId", () => {
  it("returns a 32-char hex string", () => {
    const id = generateExternalJobId({
      title: "Engineer",
      companyName: "Acme",
      location: "Austin, TX, USA",
    });

    expect(id).toMatch(/^[0-9a-f]{32}$/);
    expect(id).toHaveLength(32);
  });

  it("is stable for the same inputs", () => {
    const input = { title: "Engineer", companyName: "Acme", location: "Austin, TX, USA" };
    expect(generateExternalJobId(input)).toBe(generateExternalJobId(input));
  });

  it("normalizes whitespace and case before hashing", () => {
    const a = generateExternalJobId({
      title: "  Senior   Engineer ",
      companyName: "ACME",
      location: "Austin, TX, USA",
    });
    const b = generateExternalJobId({
      title: "senior engineer",
      companyName: "acme",
      location: "austin, tx, usa",
    });

    expect(a).toBe(b);
  });

  it("changes when location differs", () => {
    const austin = generateExternalJobId({
      title: "Engineer",
      companyName: "Acme",
      location: "Austin, TX, USA",
    });
    const denver = generateExternalJobId({
      title: "Engineer",
      companyName: "Acme",
      location: "Denver, CO, USA",
    });

    expect(austin).not.toBe(denver);
  });

  it("produces a stable id when location is empty", () => {
    const id = generateExternalJobId({
      title: "Engineer",
      companyName: "Acme",
      location: "",
    });

    expect(id).toMatch(/^[0-9a-f]{32}$/);
    expect(
      generateExternalJobId({
        title: "Engineer",
        companyName: "Acme",
        location: "   ",
      }),
    ).toBe(id);
  });
});

describe("hasUsableExternalJobIdentity", () => {
  it("is false when title and company are both empty", () => {
    expect(hasUsableExternalJobIdentity("", "")).toBe(false);
    expect(hasUsableExternalJobIdentity("  ", "\t")).toBe(false);
  });

  it("is true when title or company is present", () => {
    expect(hasUsableExternalJobIdentity("Engineer", "")).toBe(true);
    expect(hasUsableExternalJobIdentity("", "Acme")).toBe(true);
  });
});
