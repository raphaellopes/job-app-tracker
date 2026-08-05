import { getStatusLabel } from "./status-labels";

describe("getStatusLabel", () => {
  it.each([
    ["WISHLIST", "Wishlist"],
    ["APPLIED", "Applied"],
    ["NOT_A_FIT", "Not a fit"],
  ] as const)("maps %s to %s", (status, expected) => {
    expect(getStatusLabel(status)).toBe(expected);
  });
});
