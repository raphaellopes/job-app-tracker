import { redirect } from "next/navigation";

import { getDbUserForSession } from "@/features/auth/server";

export default async function SignUpRegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, dbUser } = await getDbUserForSession();

  if (session && dbUser) {
    redirect("/dashboard");
  }
  if (session && !dbUser) {
    redirect("/sign-up/complete");
  }

  return <>{children}</>;
}
