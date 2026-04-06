"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/client";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(firebaseAuth);
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      className="block w-full text-center text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
    >
      Sign out
    </button>
  );
}
