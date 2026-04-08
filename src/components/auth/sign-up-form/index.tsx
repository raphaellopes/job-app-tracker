"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useFormik } from "formik";
import * as Yup from "yup";

import Button from "@/components/buttons/button";
import DividerText from "@/components/divider-text";
import ErrorBox from "@/components/form/error-box";
import Input from "@/components/form/input";

import { registerUser } from "@/actions/sign-up";

import {
  createSessionFromCurrentUser,
  signInWithGoogleAndCreateSession,
} from "@/lib/auth/client-session";
import { firebaseAuth, getFormattedFirebaseError } from "@/lib/firebase/client";

const signUpSchema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  email: Yup.string().trim().email("Enter a valid email address").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

function yupToFormErrors(error: unknown): Record<string, string> {
  if (!(error instanceof Yup.ValidationError)) return {};
  const formErrors: Record<string, string> = {};
  for (const inner of error.inner.length ? error.inner : [error]) {
    if (inner.path) formErrors[inner.path] = inner.message;
  }
  return formErrors;
}

const SignUpForm: React.FC = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleGoogleSignUp = async () => {
    setServerError(null);
    setIsGoogleSubmitting(true);

    try {
      await signInWithGoogleAndCreateSession();
      router.push("/");
      router.refresh();
    } catch (error) {
      if (error instanceof FirebaseError) {
        setServerError(getFormattedFirebaseError(error));
      } else if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("Unable to continue with Google.");
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    validateOnBlur: true,
    validateOnChange: true,
    validate: (values) => {
      try {
        signUpSchema.validateSync(values, { abortEarly: false });
        return {};
      } catch (e) {
        return yupToFormErrors(e);
      }
    },
    onSubmit: async (values) => {
      setServerError(null);
      setIsSubmitting(true);
      try {
        const credential = await createUserWithEmailAndPassword(
          firebaseAuth,
          values.email.trim().toLowerCase(),
          values.password,
        );
        const idToken = await credential.user.getIdToken();

        const data = new FormData();
        data.append("firstName", values.firstName);
        data.append("lastName", values.lastName);
        data.append("email", values.email);
        data.append("idToken", idToken);

        const result = await registerUser(data);
        if (!result.ok) {
          setServerError(result.message);
          return;
        }

        await createSessionFromCurrentUser(idToken);

        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        if (error instanceof FirebaseError) {
          setServerError(getFormattedFirebaseError(error));
          return;
        }
        setServerError("Unable to create account.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const { errors, touched, getFieldProps, handleSubmit } = formik;

  const getError = (field: string) => {
    return errors[field as keyof typeof errors] && touched[field as keyof typeof touched]
      ? errors[field as keyof typeof errors]
      : null;
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Button
          type="button"
          variant="secondary"
          disabled={isGoogleSubmitting}
          onClick={() => void handleGoogleSignUp()}
          className="w-full sm:w-auto self-start"
        >
          {isGoogleSubmitting ? "Connecting..." : "Continue with Google"}
        </Button>
        <DividerText>Or sign up with email</DividerText>
        <Input
          id="firstName"
          label="First name"
          autoComplete="given-name"
          error={getError("firstName")}
          {...getFieldProps("firstName")}
        />
        <Input
          id="lastName"
          label="Last name"
          autoComplete="family-name"
          error={getError("lastName")}
          {...getFieldProps("lastName")}
        />
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
          autoComplete="new-password"
          error={getError("password")}
          {...getFieldProps("password")}
        />
        {serverError && <ErrorBox>{serverError}</ErrorBox>}
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto self-start">
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </div>
  );
};

export default SignUpForm;
