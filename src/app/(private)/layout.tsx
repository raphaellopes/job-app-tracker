import { redirect } from "next/navigation";

import { Sidebar } from "@/components/sidebar";

import { getDbUserForSession } from "@/lib/auth/user";

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, dbUser } = await getDbUserForSession();

  if (!session) {
    redirect("/sign-in");
  }
  if (!dbUser) {
    redirect("/sign-up/complete");
  }

  return (
    <>
      <Sidebar userName={dbUser.firstName} userEmail={dbUser.email} avatarUrl={session.photoUrl} />
      <div className="ml-0 sm:ml-[280px] pt-16 sm:pt-0 min-h-screen">{children}</div>
    </>
  );
}
