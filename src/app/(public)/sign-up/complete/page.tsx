import { CompleteSignUpForm } from "@/components/auth/complete-sign-up-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import CardWithLogoContainer from "@/components/cards/card-with-logo-container";

export default function SignUpCompletePage() {
  return (
    <CardWithLogoContainer>
      <div className="flex flex-col gap-2 mb-8 border-t border-gray-200 pt-8">
        <h1 className="text-2xl font-bold">Complete your profile</h1>
        <p className="text-sm text-gray-600">
          We need a few details to finish setting up your account
        </p>
      </div>
      <CompleteSignUpForm />
      <p className="mt-8 text-sm text-gray-600">
        Wrong account?{" "}
        <SignOutButton className="text-blue-700 font-medium hover:underline cursor-pointer bg-transparent p-0 inline align-baseline" />
      </p>
    </CardWithLogoContainer>
  );
}
