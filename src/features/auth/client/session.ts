"use client";

import { signInWithPopup } from "firebase/auth";

import { firebaseAuth, googleProvider } from "@/lib/firebase/client";

export async function createSessionFromCurrentUser(idTokenOverride?: string): Promise<void> {
  const idToken = idTokenOverride ?? (await firebaseAuth.currentUser?.getIdToken());
  if (!idToken) {
    throw new Error("Unable to read your sign-in token.");
  }

  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error("Unable to start your session. Please try again.");
  }
}

export async function signInWithGoogleAndCreateSession(): Promise<void> {
  await signInWithPopup(firebaseAuth, googleProvider);
  await createSessionFromCurrentUser();
}
