import { appliedDatePatchForStatusChange } from "./shared";

jest.mock("@/features/auth/server", () => ({
  getDbUserForSession: jest.fn(),
}));

describe("appliedDatePatchForStatusChange", () => {
  it("clears appliedDate when moving to NOT_A_FIT", () => {
    expect(appliedDatePatchForStatusChange("APPLIED", "NOT_A_FIT")).toEqual({
      appliedDate: null,
    });
  });

  it("clears appliedDate when moving to WISHLIST", () => {
    expect(appliedDatePatchForStatusChange("NOT_A_FIT", "WISHLIST")).toEqual({
      appliedDate: null,
    });
  });
});
