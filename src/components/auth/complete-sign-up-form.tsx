"use client";

import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { registerUser } from "@/actions/sign-up";
import Input from "@/components/form/input";
import Button from "@/components/buttons/button";
import { firebaseAuth } from "@/lib/firebase/client";
import ErrorBox from "@/components/form/error-box";

const schema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  email: Yup.string().trim().email("Enter a valid email address").required("Email is required"),
});

function yupToFormErrors(error: unknown): Record<string, string> {
  if (!(error instanceof Yup.ValidationError)) return {};
  const formErrors: Record<string, string> = {};
  for (const inner of error.inner.length ? error.inner : [error]) {
    if (inner.path) formErrors[inner.path] = inner.message;
  }
  return formErrors;
}

export function CompleteSignUpForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [emailFromAuth, setEmailFromAuth] = useState("");

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: emailFromAuth,
    },
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
    validate: (values) => {
      try {
        schema.validateSync(values, { abortEarly: false });
        return {};
      } catch (e) {
        return yupToFormErrors(e);
      }
    },
    onSubmit: async (values) => {
      setServerError(null);
      setIsSubmitting(true);
      try {
        const user = firebaseAuth.currentUser;
        if (!user) {
          setServerError("Unable to read your session. Please sign in again.");
          return;
        }
        const idToken = await user.getIdToken();

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

        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          setServerError("Unable to refresh your session. Please try again.");
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        if (error instanceof Error) {
          setServerError(error.message);
          return;
        }
        setServerError("Something went wrong.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      setAuthReady(true);
      if (user?.email) {
        setEmailFromAuth(user.email);
      }
    });
    return () => unsub();
  }, []);

  const { errors, touched, getFieldProps, handleSubmit } = formik;

  const getError = (field: "firstName" | "lastName" | "email") => {
    return errors[field] && touched[field] ? errors[field] : null;
  };

  if (!authReady) {
    return <p className="text-sm text-gray-600">Loading…</p>;
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="flex flex-col gap-8 w-full mx-auto"
      noValidate
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-8">
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
            disabled
            {...getFieldProps("email")}
          />
        </div>
      </div>
      {serverError && <ErrorBox>{serverError}</ErrorBox>}
      <Button type="submit" disabled={isSubmitting} className="sm:min-w-[120px]">
        {isSubmitting ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
