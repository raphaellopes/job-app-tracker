import { cookies } from "next/headers";

import { firebaseAdminAuth } from "@/lib/firebase/admin";

import "server-only";

const SESSION_COOKIE_NAME = "firebase_session";

export type AuthUser = {
  uid: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
};

export async function getSessionCookieValue(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const sessionCookie = await getSessionCookieValue();
  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await firebaseAdminAuth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email,
      displayName: typeof decoded.name === "string" ? decoded.name : undefined,
      photoUrl: typeof decoded.picture === "string" ? decoded.picture : undefined,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}
