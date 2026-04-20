import { NextResponse } from "next/server";

import { getSessionCookieName } from "@/features/auth/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(getSessionCookieName());
  return response;
}
