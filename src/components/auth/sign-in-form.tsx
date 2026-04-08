"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useFormik } from "formik";
import * as Yup from "yup";

import Button from "@/components/buttons/button";
import ErrorBox from "@/components/form/error-box";
import Input from "@/components/form/input";
import DividerText from "@/components/divider-text";

import { firebaseAuth, getFormattedFirebaseError, googleProvider } from "@/lib/firebase/client";

const signInSchema = Yup.object({
  email: Yup.string().trim().email("Enter a valid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

function yupToFormErrors(error: unknown): Record<string, string> {
  if (!(error instanceof Yup.ValidationError)) return {};
  const formErrors: Record<string, string> = {};
  for (const inner of error.inner.length ? error.inner : [error]) {
    if (inner.path) formErrors[inner.path] = inner.message;
  }
  return formErrors;
}

const SignInForm: React.FC = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const createSessionFromCurrentUser = async () => {
    const idToken = await firebaseAuth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error("Unable to read your sign-in token.");
    }

    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error("Unable to start your session. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    setServerError(null);
    setIsGoogleSubmitting(true);

    try {
      await signInWithPopup(firebaseAuth, googleProvider);
      await createSessionFromCurrentUser();
      router.push("/");
      router.refresh();
    } catch (error) {
      if (error instanceof FirebaseError) {
        setServerError(getFormattedFirebaseError(error));
      } else if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("Unable to sign in with Google.");
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validateOnBlur: true,
    validateOnChange: true,
    validate: (values) => {
      try {
        signInSchema.validateSync(values, { abortEarly: false });
        return {};
      } catch (error) {
        return yupToFormErrors(error);
      }
    },
    onSubmit: async (values) => {
      setServerError(null);
      setIsSubmitting(true);

      try {
        await signInWithEmailAndPassword(
          firebaseAuth,
          values.email.trim().toLowerCase(),
          values.password,
        );
        await createSessionFromCurrentUser();

        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        if (error instanceof FirebaseError) {
          setServerError(getFormattedFirebaseError(error));
          return;
        }
        setServerError("Invalid email or password.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const { errors, touched, getFieldProps, handleSubmit } = formik;

  const getError = (field: "email" | "password") => {
    return errors[field] && touched[field] ? errors[field] : null;
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="w-full max-w-md flex flex-col gap-4"
    >
      <Input
        id="email"
        type="email"
        label="Email"
        autoComplete="email"
        error={getError("email")}
        {...getFieldProps("email")}
      />
      <Input
        id="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        error={getError("password")}
        {...getFieldProps("password")}
      />
      {serverError && <ErrorBox>{serverError}</ErrorBox>}
      <div className="flex flex-col gap-6 mt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
        <DividerText>Or</DividerText>
        <Button
          type="button"
          variant="secondary"
          disabled={isGoogleSubmitting}
          onClick={() => void handleGoogleSignIn()}
        >
          {isGoogleSubmitting ? "Connecting..." : "Continue with Google"}
        </Button>
      </div>
    </form>
  );
};

export default SignInForm;
