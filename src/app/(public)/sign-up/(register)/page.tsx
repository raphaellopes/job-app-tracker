import Link from "next/link";

import { Header } from "@/components/header";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="p-10 max-w-lg">
      <Header title="Sign up" subtitle="Create an account to use Job Tracker" showAddButton={false} />
      <SignUpForm />
      <p className="mt-8 text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-blue-700 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
