import Link from "next/link";

import CardWithLogoContainer from "@/components/cards/card-with-logo-container";

import { SignInForm } from "@/features/auth";

export default function SignInPage() {
  return (
    <CardWithLogoContainer>
      <SignInForm />
      <p className="mt-8 text-sm text-gray-600">
        New here?{" "}
        <Link href="/sign-up" className="text-blue-700 font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </CardWithLogoContainer>
  );
}
