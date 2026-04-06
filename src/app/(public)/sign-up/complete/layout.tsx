import { redirect } from "next/navigation";

import { getDbUserForSession } from "@/lib/auth/user";

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
