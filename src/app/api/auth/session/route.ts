import { NextResponse } from "next/server";

import { getSessionCookieName } from "@/lib/auth/session";
import { firebaseAdminAuth } from "@/lib/firebase/admin";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const body = (await request.json()) as { idToken?: string };
  const idToken = body.idToken;

  if (!idToken) {
    return NextResponse.json({ message: "Missing idToken." }, { status: 400 });
  }

  const expiresIn = FIVE_DAYS_MS;
  const sessionCookie = await firebaseAdminAuth.createSessionCookie(idToken, { expiresIn });
  const response = NextResponse.json({ ok: true });

  response.cookies.set(getSessionCookieName(), sessionCookie, {
    maxAge: expiresIn / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return response;
}
