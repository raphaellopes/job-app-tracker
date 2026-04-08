import { useRouter } from "next/navigation";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signOut } from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/client";

import SignOutButton from "./index";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  signOut: jest.fn(),
}));

jest.mock("@/lib/firebase/client", () => ({
  firebaseAuth: {},
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedSignOut = jest.mocked(signOut);

describe("SignOutButton", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();
  const mockFetch = jest.fn();
  let consoleErrorSpy: jest.SpyInstance<void, Parameters<typeof console.error>>;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useRouter>);
    mockedSignOut.mockResolvedValue(undefined);
    mockFetch.mockResolvedValue({ ok: true } as Awaited<ReturnType<typeof fetch>>);
    global.fetch = mockFetch as typeof fetch;
  });

  describe("rendering", () => {
    it("renders a sign-out button", () => {
      render(<SignOutButton />);

      const button = screen.getByRole("button", { name: /sign out/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("type", "button");
    });
  });

  describe("sign out flow", () => {
    it("signs out from Firebase, clears the server session, then navigates to sign-in", async () => {
      const user = userEvent.setup();
      render(<SignOutButton />);

      await user.click(screen.getByRole("button", { name: /sign out/i }));

      await waitFor(() => {
        expect(mockedSignOut).toHaveBeenCalledWith(firebaseAuth);
      });
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/sign-out", { method: "POST" });
      });
      expect(mockPush).toHaveBeenCalledWith("/sign-in");
      expect(mockRefresh).toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe("error scenarios", () => {
    it("does not call fetch or navigate when Firebase sign-out fails", async () => {
      mockedSignOut.mockRejectedValueOnce(new Error("firebase sign out failed"));
      const user = userEvent.setup();
      render(<SignOutButton />);

      await user.click(screen.getByRole("button", { name: /sign out/i }));

      await waitFor(() => {
        expect(mockedSignOut).toHaveBeenCalledWith(firebaseAuth);
      });
      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to sign out",
        expect.any(Error),
      );
    });

    it("does not navigate when the sign-out API request fails", async () => {
      mockFetch.mockRejectedValueOnce(new Error("network error"));
      const user = userEvent.setup();
      render(<SignOutButton />);

      await user.click(screen.getByRole("button", { name: /sign out/i }));

      await waitFor(() => {
        expect(mockedSignOut).toHaveBeenCalledWith(firebaseAuth);
      });
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/sign-out", { method: "POST" });
      });
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to sign out",
        expect.any(Error),
      );
    });
  });
});
