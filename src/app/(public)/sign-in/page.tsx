import Link from "next/link";

import { Header } from "@/components/header";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <main className="p-10 max-w-lg">
      <Header title="Sign in" subtitle="Access your job tracking workspace" showAddButton={false} />
      <SignInForm />
      <p className="mt-8 text-sm text-gray-600">
        New here?{" "}
        <Link href="/sign-up" className="text-blue-700 font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
