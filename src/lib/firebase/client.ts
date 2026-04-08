"use client";

import { FirebaseError, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Formats a Firebase error into a human readable error message.
 * @param error - The Firebase error to format.
 * @returns The formatted error message.
 */
export const getFormattedFirebaseError = (error: FirebaseError) => {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "Email already in use. Please use a different email address.";
    case "auth/invalid-email":
      return "Invalid email address. Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Please enter a stronger password.";
    case "auth/invalid-credential":
      return "Invalid email or password.";
    default:
      return error.message;
  }
};
