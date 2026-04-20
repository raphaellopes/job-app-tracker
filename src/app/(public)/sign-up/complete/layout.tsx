import { redirect } from "next/navigation";

import { getDbUserForSession } from "@/features/auth/server";

export default async function SignUpCompleteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, dbUser } = await getDbUserForSession();

  if (!session) {
    redirect("/sign-in");
  }
  if (dbUser) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
