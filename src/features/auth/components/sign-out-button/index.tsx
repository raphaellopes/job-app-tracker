"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/client";

interface SignOutButtonProps {
  className?: string;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({ className }) => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(firebaseAuth);
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/sign-in");
      router.refresh();
    } catch (err) {
      console.error("Failed to sign out", err);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      className={
        className ??
        "block w-full text-center text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
      }
    >
      Sign out
    </button>
  );
};

export default SignOutButton;
