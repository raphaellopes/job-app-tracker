import { useRouter } from "next/navigation";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { onAuthStateChanged } from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/client";

import CompleteSignUpForm from "./index";

import { registerUser, type RegisterUserResult } from "@/features/auth/server/register-user";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
}));

jest.mock("@/lib/firebase/client", () => ({
  firebaseAuth: {
    currentUser: {
      email: "user@example.com",
      getIdToken: jest.fn().mockResolvedValue("mock-id-token"),
    },
  },
}));

jest.mock("@/features/auth/server/register-user", () => ({
  registerUser: jest.fn(),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedOnAuthStateChanged = jest.mocked(onAuthStateChanged);
const mockedRegisterUser = jest.mocked(registerUser);

function setFirebaseCurrentUser(user: { email?: string; getIdToken?: jest.Mock } | null) {
  Object.assign(firebaseAuth, {
    currentUser: user,
  });
}

describe("CompleteSignUpForm", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();
  let authCallback: (
    user: {
      email?: string | null;
      displayName?: string | null;
    } | null,
  ) => void;

  const mockedFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    authCallback = () => {};
    mockedOnAuthStateChanged.mockImplementation((_auth, callback) => {
      const cb = callback as (
        user: {
          email?: string | null;
          displayName?: string | null;
        } | null,
      ) => void;
      authCallback = cb;
      cb({
        email: "user@example.com",
        displayName: null,
      });
      return jest.fn();
    });
    mockedUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useRouter>);
    mockedRegisterUser.mockResolvedValue({ ok: true });
    setFirebaseCurrentUser({
      email: "user@example.com",
      getIdToken: jest.fn().mockResolvedValue("mock-id-token"),
    });
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    global.fetch = mockedFetch as unknown as typeof fetch;
  });

  describe("rendering", () => {
    it("shows Loading until auth state is received", async () => {
      mockedOnAuthStateChanged.mockImplementation((_auth, callback) => {
        authCallback = callback as typeof authCallback;
        return jest.fn();
      });

      render(<CompleteSignUpForm />);

      expect(screen.getByText("Loading…")).toBeInTheDocument();

      await act(async () => {
        authCallback({ email: "user@example.com", displayName: null });
      });

      await waitFor(() => {
        expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
      });
      expect(document.querySelector("form")).toBeInTheDocument();
    });

    it("renders the form, labeled fields, disabled email, and Continue", async () => {
      render(<CompleteSignUpForm />);

      await waitFor(() => {
        expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
      });

      expect(document.querySelector("form")).toBeInTheDocument();
      expect(screen.getByLabelText(/^first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email/i)).toBeDisabled();
      expect(screen.getByRole("button", { name: /^continue$/i })).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows required errors when first and last name are empty", async () => {
      const user = userEvent.setup();
      render(<CompleteSignUpForm />);

      await waitFor(() => {
        expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /^continue$/i }));

      expect(await screen.findByText("First name is required")).toBeInTheDocument();
      expect(screen.getByText("Last name is required")).toBeInTheDocument();
      expect(mockedRegisterUser).not.toHaveBeenCalled();
    });

    it("shows invalid email when the session email is not valid", async () => {
      const user = userEvent.setup();
      mockedOnAuthStateChanged.mockImplementation((_auth, callback) => {
        const cb = callback as (
          u: {
            email?: string | null;
            displayName?: string | null;
          } | null,
        ) => void;
        cb({
          email: "not-an-email",
          displayName: "Jane Doe",
        });
        return jest.fn();
      });

      render(<CompleteSignUpForm />);

      await waitFor(() => {
        expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /^continue$/i }));

      expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
      expect(mockedRegisterUser).not.toHaveBeenCalled();
    });
  });

  describe("submit", () => {
    it("registers the user, refreshes the session, shows Saving… while submitting, and navigates to the dashboard", async () => {
      const user = userEvent.setup();
      let resolveRegister!: (value: RegisterUserResult) => void;
      const registerPending = new Promise<RegisterUserResult>((resolve) => {
        resolveRegister = resolve;
      });
      mockedRegisterUser.mockImplementation(() => registerPending);

      render(<CompleteSignUpForm />);

      await waitFor(() => {
        expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/^first name/i), "Jane");
      await user.type(screen.getByLabelText(/^last name/i), "Doe");

      await user.click(screen.getByRole("button", { name: /^continue$/i }));

      expect(await screen.findByRole("button", { name: /^saving/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^saving/i })).toBeDisabled();

      await act(async () => {
        resolveRegister({ ok: true });
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^continue$/i })).toBeInTheDocument();
      });

      expect(mockedRegisterUser).toHaveBeenCalledTimes(1);
      const formData = mockedRegisterUser.mock.calls[0][0] as FormData;
      expect(formData.get("firstName")).toBe("Jane");
      expect(formData.get("lastName")).toBe("Doe");
      expect(formData.get("email")).toBe("user@example.com");
      expect(formData.get("idToken")).toBe("mock-id-token");

      expect(mockedFetch).toHaveBeenCalledWith(
        "/api/auth/session",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: "mock-id-token" }),
        }),
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("submits trimmed values from displayName prefill", async () => {
      const user = userEvent.setup();
      mockedOnAuthStateChanged.mockImplementation((_auth, callback) => {
        const cb = callback as (
          u: {
            email?: string | null;
            displayName?: string | null;
          } | null,
        ) => void;
        cb({
          email: "user@example.com",
          displayName: "Jane Doe",
        });
        return jest.fn();
      });

      render(<CompleteSignUpForm />);

      await waitFor(() => {
        expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /^continue$/i }));

      await waitFor(() => {
        expect(mockedRegisterUser).toHaveBeenCalled();
      });
      const formData = mockedRegisterUser.mock.calls[0][0] as FormData;
      expect(formData.get("firstName")).toBe("Jane");
      expect(formData.get("lastName")).toBe("Doe");
    });
  });

  describe("errors", () => {
    it("shows an error when there is no Firebase user on submit", async () => {
      const user = userEvent.setup();
      render(<CompleteSignUpForm />);

      await waitFor(() => {
        expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/^first name/i), "Jane");
      await user.type(screen.getByLabelText(/^last name/i), "Doe");

      setFirebaseCurrentUser(null);

      await user.click(screen.getByRole("button", { name: /^continue$/i }));

      expect(
        await screen.findByText("Unable to read your session. Please sign in again."),
      ).toBeInTheDocument();
      expect(mockedRegisterUser).not.toHaveBeenCalled();
    });

    it("shows registerUser failure message", async () => {
      const user = userEvent.setup();
      mockedRegisterUser.mockResolvedValueOnce({
        ok: false,
        message: "Could not save profile.",
      });

      render(<CompleteSignUpForm />);

      await waitFor(() => {
        expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/^first name/i), "Jane");
      await user.type(screen.getByLabelText(/^last name/i), "Doe");
      await user.click(screen.getByRole("button", { name: /^continue$/i }));

      expect(await screen.findByText("Could not save profile.")).toBeInTheDocument();
      expect(mockedFetch).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("shows an error when session refresh returns not ok", async () => {
      const user = userEvent.setup();
      mockedFetch.mockResolvedValueOnce({ ok: false });

      render(<CompleteSignUpForm />);

      await waitFor(() => {
        expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/^first name/i), "Jane");
      await user.type(screen.getByLabelText(/^last name/i), "Doe");
      await user.click(screen.getByRole("button", { name: /^continue$/i }));

      expect(
        await screen.findByText("Unable to refresh your session. Please try again."),
      ).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("shows Error.message when registerUser throws", async () => {
      const user = userEvent.setup();
      mockedRegisterUser.mockRejectedValueOnce(new Error("Network down"));

      render(<CompleteSignUpForm />);

      await waitFor(() => {
        expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/^first name/i), "Jane");
      await user.type(screen.getByLabelText(/^last name/i), "Doe");
      await user.click(screen.getByRole("button", { name: /^continue$/i }));

      expect(await screen.findByText("Network down")).toBeInTheDocument();
    });

    it("shows a generic message when registerUser rejects a non-Error", async () => {
      const user = userEvent.setup();
      mockedRegisterUser.mockRejectedValueOnce("unexpected");

      render(<CompleteSignUpForm />);

      await waitFor(() => {
        expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/^first name/i), "Jane");
      await user.type(screen.getByLabelText(/^last name/i), "Doe");
      await user.click(screen.getByRole("button", { name: /^continue$/i }));

      expect(await screen.findByText("Something went wrong.")).toBeInTheDocument();
    });
  });
});
