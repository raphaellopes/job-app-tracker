import Link from "next/link";

import SignInForm from "@/components/auth/sign-in-form";
import CardWithLogoContainer from "@/components/cards/card-with-logo-container";

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
