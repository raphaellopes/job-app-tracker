import { redirect } from "next/navigation";

import { getDbUserForSession } from "@/features/auth/server";

export default async function HomePage() {
  const { session, dbUser } = await getDbUserForSession();
  if (session && dbUser) {
    redirect("/dashboard");
  }
  if (session && !dbUser) {
    redirect("/sign-up/complete");
  }
  redirect("/sign-in");
}
