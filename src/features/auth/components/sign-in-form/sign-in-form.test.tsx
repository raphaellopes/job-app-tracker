import { useRouter } from "next/navigation";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";

import { getFormattedFirebaseError } from "@/lib/firebase/client";

import SignInForm from "./index";

import {
  createSessionFromCurrentUser,
  signInWithGoogleAndCreateSession,
} from "@/features/auth/client";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock("@/lib/firebase/client", () => ({
  firebaseAuth: {},
  getFormattedFirebaseError: jest.fn((e: { message: string }) => e.message),
}));

jest.mock("@/features/auth/client", () => ({
  createSessionFromCurrentUser: jest.fn(() => Promise.resolve()),
  signInWithGoogleAndCreateSession: jest.fn(() => Promise.resolve()),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedSignInWithEmailAndPassword = jest.mocked(signInWithEmailAndPassword);
const mockedCreateSession = jest.mocked(createSessionFromCurrentUser);
const mockedGoogleSignIn = jest.mocked(signInWithGoogleAndCreateSession);
const mockedGetFormattedFirebaseError = jest.mocked(getFormattedFirebaseError);

describe("SignInForm", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useRouter>);
    mockedSignInWithEmailAndPassword.mockResolvedValue(
      {} as Awaited<ReturnType<typeof signInWithEmailAndPassword>>,
    );
    mockedCreateSession.mockResolvedValue(undefined);
    mockedGoogleSignIn.mockResolvedValue(undefined);
  });

  describe("rendering", () => {
    it("renders the form, labeled fields, actions, and divider", () => {
      render(<SignInForm />);

      expect(document.querySelector("form")).toBeInTheDocument();
      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in$/i })).toBeInTheDocument();
      expect(screen.getByText("Or")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows required errors when submitting an empty form", async () => {
      const user = userEvent.setup();
      render(<SignInForm />);

      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      expect(await screen.findByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
      expect(mockedSignInWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it("shows an invalid email message when the email format is wrong", async () => {
      const user = userEvent.setup();
      render(<SignInForm />);

      await user.type(screen.getByLabelText(/^email/i), "not-an-email");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
      expect(mockedSignInWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it("shows password required when email is valid and password is empty", async () => {
      const user = userEvent.setup();
      render(<SignInForm />);

      await user.type(screen.getByLabelText(/^email/i), "user@example.com");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      expect(await screen.findByText("Password is required")).toBeInTheDocument();
      expect(mockedSignInWithEmailAndPassword).not.toHaveBeenCalled();
    });
  });

  describe("email/password submit", () => {
    it("signs in with trimmed, lowercased email, creates a session, and navigates to the dashboard", async () => {
      const user = userEvent.setup();
      render(<SignInForm />);

      await user.type(screen.getByLabelText(/^email/i), "  User@Example.COM  ");
      await user.type(screen.getByLabelText(/^password/i), "secret-pass");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      await waitFor(() => {
        expect(mockedSignInWithEmailAndPassword).toHaveBeenCalledWith(
          {},
          "user@example.com",
          "secret-pass",
        );
      });
      expect(mockedCreateSession).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("shows a formatted Firebase error when email/password sign-in throws FirebaseError", async () => {
      const user = userEvent.setup();
      const firebaseErr = new FirebaseError("auth/wrong-password", "Firebase auth failed");
      mockedSignInWithEmailAndPassword.mockRejectedValueOnce(firebaseErr);
      mockedGetFormattedFirebaseError.mockReturnValueOnce("Wrong password. Try again.");

      render(<SignInForm />);

      await user.type(screen.getByLabelText(/^email/i), "user@example.com");
      await user.type(screen.getByLabelText(/^password/i), "bad");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      expect(await screen.findByText("Wrong password. Try again.")).toBeInTheDocument();
      expect(mockedGetFormattedFirebaseError).toHaveBeenCalledWith(firebaseErr);
      expect(mockedCreateSession).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("shows the generic invalid-credentials message when sign-in fails with a non-Firebase error", async () => {
      const user = userEvent.setup();
      mockedSignInWithEmailAndPassword.mockRejectedValueOnce(new Error("unexpected"));

      render(<SignInForm />);

      await user.type(screen.getByLabelText(/^email/i), "user@example.com");
      await user.type(screen.getByLabelText(/^password/i), "secret");
      await user.click(screen.getByRole("button", { name: /sign in$/i }));

      expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
      expect(mockedGetFormattedFirebaseError).not.toHaveBeenCalled();
      expect(mockedCreateSession).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Google sign-in", () => {
    it("calls Google sign-in, then navigates to home and refreshes", async () => {
      const user = userEvent.setup();
      render(<SignInForm />);

      await user.click(screen.getByRole("button", { name: /continue with google/i }));

      await waitFor(() => {
        expect(mockedGoogleSignIn).toHaveBeenCalled();
      });
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockedSignInWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it("shows a formatted message when Google sign-in throws FirebaseError", async () => {
      const user = userEvent.setup();
      const firebaseErr = new FirebaseError("auth/popup-closed-by-user", "Popup was closed");
      mockedGoogleSignIn.mockRejectedValueOnce(firebaseErr);
      mockedGetFormattedFirebaseError.mockReturnValueOnce("Could not complete Google sign-in");

      render(<SignInForm />);

      await user.click(screen.getByRole("button", { name: /continue with google/i }));

      expect(await screen.findByText("Could not complete Google sign-in")).toBeInTheDocument();
      expect(mockedGetFormattedFirebaseError).toHaveBeenCalledWith(firebaseErr);
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("shows the Error message when Google sign-in throws a generic Error", async () => {
      const user = userEvent.setup();
      mockedGoogleSignIn.mockRejectedValueOnce(new Error("Network request failed"));

      render(<SignInForm />);

      await user.click(screen.getByRole("button", { name: /continue with google/i }));

      expect(await screen.findByText("Network request failed")).toBeInTheDocument();
      expect(mockedGetFormattedFirebaseError).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("shows a fallback message when Google sign-in throws a non-Error value", async () => {
      const user = userEvent.setup();
      mockedGoogleSignIn.mockRejectedValueOnce("unexpected");

      render(<SignInForm />);

      await user.click(screen.getByRole("button", { name: /continue with google/i }));

      expect(await screen.findByText("Unable to sign in with Google.")).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
