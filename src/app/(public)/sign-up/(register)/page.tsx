import Link from "next/link";

import CardWithLogoContainer from "@/components/cards/card-with-logo-container";

import { SignUpForm } from "@/features/auth";

export default function SignUpPage() {
  return (
    <CardWithLogoContainer>
      <SignUpForm />
      <p className="mt-8 text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-blue-700 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </CardWithLogoContainer>
  );
}
