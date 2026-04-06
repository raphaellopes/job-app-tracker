import { NextResponse } from "next/server";

import { getSessionCookieName } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(getSessionCookieName());
  return response;
}
