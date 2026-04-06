import { CompleteSignUpForm } from "@/components/auth/complete-sign-up-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Header } from "@/components/header";

export default function SignUpCompletePage() {
  return (
    <main className="p-10 max-w-lg">
      <Header title="Complete your profile" subtitle="We need a few details to finish setting up your account" showAddButton={false} />
      <CompleteSignUpForm />
      <p className="mt-8 text-sm text-gray-600">
        Wrong account?{" "}
        <SignOutButton className="text-blue-700 font-medium hover:underline cursor-pointer bg-transparent p-0 inline align-baseline" />
      </p>
    </main>
  );
}
