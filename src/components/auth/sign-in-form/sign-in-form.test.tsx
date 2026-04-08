import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";

import {
  createSessionFromCurrentUser,
  signInWithGoogleAndCreateSession,
} from "@/lib/auth/client-session";

import SignInForm from "./index";

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

jest.mock("@/lib/auth/client-session", () => ({
  createSessionFromCurrentUser: jest.fn(() => Promise.resolve()),
  signInWithGoogleAndCreateSession: jest.fn(() => Promise.resolve()),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedSignInWithEmailAndPassword = jest.mocked(signInWithEmailAndPassword);
const mockedCreateSession = jest.mocked(createSessionFromCurrentUser);
const mockedGoogleSignIn = jest.mocked(signInWithGoogleAndCreateSession);

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
  });
});
