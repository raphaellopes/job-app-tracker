import { useRouter } from "next/navigation";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { getFormattedFirebaseError } from "@/lib/firebase/client";

import SignUpForm from "./index";

import {
  createSessionFromCurrentUser,
  signInWithGoogleAndCreateSession,
} from "@/features/auth/client";
import { registerUser } from "@/features/auth/server/actions";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock("@/lib/firebase/client", () => ({
  firebaseAuth: {},
  getFormattedFirebaseError: jest.fn((e: { message: string }) => e.message),
}));

jest.mock("@/features/auth/client", () => ({
  createSessionFromCurrentUser: jest.fn(() => Promise.resolve()),
  signInWithGoogleAndCreateSession: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/features/auth/server/actions", () => ({
  registerUser: jest.fn(),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedCreateUser = jest.mocked(createUserWithEmailAndPassword);
const mockedCreateSession = jest.mocked(createSessionFromCurrentUser);
const mockedGoogleSignUp = jest.mocked(signInWithGoogleAndCreateSession);
const mockedGetFormattedFirebaseError = jest.mocked(getFormattedFirebaseError);
const mockedRegisterUser = jest.mocked(registerUser);

function mockCredential(idToken = "mock-id-token") {
  return {
    user: {
      getIdToken: jest.fn().mockResolvedValue(idToken),
    },
  } as unknown as Awaited<ReturnType<typeof createUserWithEmailAndPassword>>;
}

describe("SignUpForm", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useRouter>);
    mockedCreateUser.mockResolvedValue(mockCredential());
    mockedRegisterUser.mockResolvedValue({ ok: true });
    mockedCreateSession.mockResolvedValue(undefined);
    mockedGoogleSignUp.mockResolvedValue(undefined);
  });

  describe("rendering", () => {
    it("renders the form, labeled fields, actions, and divider", () => {
      render(<SignUpForm />);

      expect(document.querySelector("form")).toBeInTheDocument();
      expect(screen.getByLabelText(/^first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /create account$/i })).toBeInTheDocument();
      expect(screen.getByText("Or sign up with email")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows required errors when submitting an empty form", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      await user.click(screen.getByRole("button", { name: /create account$/i }));

      expect(await screen.findByText("First name is required")).toBeInTheDocument();
      expect(screen.getByText("Last name is required")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
      expect(mockedCreateUser).not.toHaveBeenCalled();
    });

    it("shows an invalid email message when the email format is wrong", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      await user.type(screen.getByLabelText(/^first name/i), "Jane");
      await user.type(screen.getByLabelText(/^last name/i), "Doe");
      await user.type(screen.getByLabelText(/^email/i), "not-an-email");
      await user.type(screen.getByLabelText(/^password/i), "password1");
      await user.click(screen.getByRole("button", { name: /create account$/i }));

      expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
      expect(mockedCreateUser).not.toHaveBeenCalled();
    });

    it("shows password length error when password is too short", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      await user.type(screen.getByLabelText(/^first name/i), "Jane");
      await user.type(screen.getByLabelText(/^last name/i), "Doe");
      await user.type(screen.getByLabelText(/^email/i), "user@example.com");
      await user.type(screen.getByLabelText(/^password/i), "short");
      await user.click(screen.getByRole("button", { name: /create account$/i }));

      expect(await screen.findByText("Password must be at least 8 characters")).toBeInTheDocument();
      expect(mockedCreateUser).not.toHaveBeenCalled();
    });
  });

  describe("email/password submit", () => {
    it("creates a Firebase user, registers the user, creates a session, and navigates to the dashboard", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      await user.type(screen.getByLabelText(/^first name/i), "Jane");
      await user.type(screen.getByLabelText(/^last name/i), "Doe");
      await user.type(screen.getByLabelText(/^email/i), "User@Example.COM");
      await user.type(screen.getByLabelText(/^password/i), "secret-pass");
      await user.click(screen.getByRole("button", { name: /create account$/i }));

      await waitFor(() => {
        expect(mockedCreateUser).toHaveBeenCalledWith({}, "user@example.com", "secret-pass");
      });
      expect(mockedRegisterUser).toHaveBeenCalled();
      const formData = mockedRegisterUser.mock.calls[0][0] as FormData;
      expect(formData.get("firstName")).toBe("Jane");
      expect(formData.get("lastName")).toBe("Doe");
      expect(formData.get("email")).toBe("User@Example.COM");
      expect(formData.get("idToken")).toBe("mock-id-token");
      expect(mockedCreateSession).toHaveBeenCalledWith("mock-id-token");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("shows the server message when registerUser returns ok: false", async () => {
      const user = userEvent.setup();
      mockedRegisterUser.mockResolvedValueOnce({
        ok: false,
        message: "An account with this email already exists.",
      });

      render(<SignUpForm />);

      await user.type(screen.getByLabelText(/^first name/i), "Jane");
      await user.type(screen.getByLabelText(/^last name/i), "Doe");
      await user.type(screen.getByLabelText(/^email/i), "taken@example.com");
      await user.type(screen.getByLabelText(/^password/i), "password1");
      await user.click(screen.getByRole("button", { name: /create account$/i }));

      expect(
        await screen.findByText("An account with this email already exists."),
      ).toBeInTheDocument();
      expect(mockedCreateSession).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("shows a formatted Firebase error when createUser throws FirebaseError", async () => {
      const user = userEvent.setup();
      const firebaseErr = new FirebaseError("auth/email-already-in-use", "Email in use");
      mockedCreateUser.mockRejectedValueOnce(firebaseErr);
      mockedGetFormattedFirebaseError.mockReturnValueOnce("That email is already registered.");

      render(<SignUpForm />);

      await user.type(screen.getByLabelText(/^first name/i), "Jane");
      await user.type(screen.getByLabelText(/^last name/i), "Doe");
      await user.type(screen.getByLabelText(/^email/i), "user@example.com");
      await user.type(screen.getByLabelText(/^password/i), "password1");
      await user.click(screen.getByRole("button", { name: /create account$/i }));

      expect(await screen.findByText("That email is already registered.")).toBeInTheDocument();
      expect(mockedGetFormattedFirebaseError).toHaveBeenCalledWith(firebaseErr);
      expect(mockedRegisterUser).not.toHaveBeenCalled();
      expect(mockedCreateSession).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("shows a generic message when createUser fails with a non-Firebase error", async () => {
      const user = userEvent.setup();
      mockedCreateUser.mockRejectedValueOnce(new Error("unexpected"));

      render(<SignUpForm />);

      await user.type(screen.getByLabelText(/^first name/i), "Jane");
      await user.type(screen.getByLabelText(/^last name/i), "Doe");
      await user.type(screen.getByLabelText(/^email/i), "user@example.com");
      await user.type(screen.getByLabelText(/^password/i), "password1");
      await user.click(screen.getByRole("button", { name: /create account$/i }));

      expect(await screen.findByText("Unable to create account.")).toBeInTheDocument();
      expect(mockedGetFormattedFirebaseError).not.toHaveBeenCalled();
      expect(mockedCreateSession).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Google sign-up", () => {
    it("calls Google sign-up, then navigates to home and refreshes", async () => {
      const user = userEvent.setup();
      render(<SignUpForm />);

      await user.click(screen.getByRole("button", { name: /continue with google/i }));

      await waitFor(() => {
        expect(mockedGoogleSignUp).toHaveBeenCalled();
      });
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockRefresh).toHaveBeenCalled();
      expect(mockedCreateUser).not.toHaveBeenCalled();
    });

    it("shows a formatted message when Google sign-up throws FirebaseError", async () => {
      const user = userEvent.setup();
      const firebaseErr = new FirebaseError("auth/popup-closed-by-user", "Popup was closed");
      mockedGoogleSignUp.mockRejectedValueOnce(firebaseErr);
      mockedGetFormattedFirebaseError.mockReturnValueOnce("Could not complete Google sign-up");

      render(<SignUpForm />);

      await user.click(screen.getByRole("button", { name: /continue with google/i }));

      expect(await screen.findByText("Could not complete Google sign-up")).toBeInTheDocument();
      expect(mockedGetFormattedFirebaseError).toHaveBeenCalledWith(firebaseErr);
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("shows the error message when Google sign-up throws a generic Error", async () => {
      const user = userEvent.setup();
      mockedGoogleSignUp.mockRejectedValueOnce(new Error("Network request failed"));

      render(<SignUpForm />);

      await user.click(screen.getByRole("button", { name: /continue with google/i }));

      expect(await screen.findByText("Network request failed")).toBeInTheDocument();
      expect(mockedGetFormattedFirebaseError).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("shows a fallback message when Google sign-up throws a non-Error value", async () => {
      const user = userEvent.setup();
      mockedGoogleSignUp.mockRejectedValueOnce("unexpected");

      render(<SignUpForm />);

      await user.click(screen.getByRole("button", { name: /continue with google/i }));

      expect(await screen.findByText("Unable to continue with Google.")).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
