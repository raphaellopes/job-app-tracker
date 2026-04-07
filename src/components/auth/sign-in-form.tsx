"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useFormik } from "formik";
import * as Yup from "yup";

import Button from "@/components/buttons/button";
import ErrorBox from "@/components/form/error-box";
import Input from "@/components/form/input";

import { firebaseAuth, getFormattedFirebaseError } from "@/lib/firebase/client";

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
        const credential = await signInWithEmailAndPassword(
          firebaseAuth,
          values.email.trim().toLowerCase(),
          values.password,
        );
        const idToken = await credential.user.getIdToken();

        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          setServerError("Unable to start your session. Please try again.");
          return;
        }

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
      <Button type="submit" disabled={isSubmitting} className="sm:min-w-[120px] self-start">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
};

export default SignInForm;
