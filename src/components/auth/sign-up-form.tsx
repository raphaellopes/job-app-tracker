"use client";

import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import classNames from "classnames";

import { registerUser } from "@/actions/sign-up";
import Input from "@/components/form/input";
import Button from "@/components/buttons/button";
import { firebaseAuth } from "@/lib/firebase/client";

const step1Schema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  email: Yup.string().trim().email("Enter a valid email address").required("Email is required"),
});

const step2Schema = Yup.object({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

type Step = 1 | 2;

function yupToFormErrors(error: unknown): Record<string, string> {
  if (!(error instanceof Yup.ValidationError)) return {};
  const formErrors: Record<string, string> = {};
  for (const inner of error.inner.length ? error.inner : [error]) {
    if (inner.path) formErrors[inner.path] = inner.message;
  }
  return formErrors;
}

export function SignUpForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const schema = step === 1 ? step1Schema : step2Schema;
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

        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          setServerError("Unable to start your session. Please sign in.");
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        if (error instanceof Error) {
          setServerError(error.message);
          return;
        }
        setServerError("Unable to create account.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const { errors, touched, getFieldProps, validateForm, setTouched, handleSubmit } = formik;

  const getError = (field: string) => {
    return errors[field as keyof typeof errors] && touched[field as keyof typeof touched]
      ? errors[field as keyof typeof errors]
      : null;
  };

  const goToStep2 = async () => {
    setServerError(null);
    const formErrors = await validateForm();
    const step1Keys = ["firstName", "lastName", "email"] as const;
    if (step1Keys.some((k) => formErrors[k])) {
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
      });
      return;
    }
    setStep(2);
  };

  const goToStep1 = () => {
    setServerError(null);
    setStep(1);
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <span
          className={classNames(
            "text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded",
            step === 1 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500",
          )}
        >
          1 — Profile
        </span>
        <span className="text-gray-300">/</span>
        <span
          className={classNames(
            "text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded",
            step === 2 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500",
          )}
        >
          2 — Sign-in
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 1) {
            void goToStep2();
            return;
          }
          void handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        {step === 1 && (
          <>
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
            <Button
              type="button"
              className="w-full sm:w-auto self-start"
              onClick={() => void goToStep2()}
            >
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Input
              id="password"
              type="password"
              label="Password"
              autoComplete="new-password"
              error={getError("password")}
              {...getFieldProps("password")}
            />
            {serverError && (
              <p className="text-sm text-red-800" role="alert">
                {serverError}
              </p>
            )}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:items-center">
              <button
                type="button"
                onClick={goToStep1}
                className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 cursor-pointer"
              >
                Back
              </button>
              <Button type="submit" disabled={isSubmitting} className="sm:min-w-[120px]">
                {isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
