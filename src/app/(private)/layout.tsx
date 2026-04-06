import { redirect } from "next/navigation";

import { Sidebar } from "@/components/sidebar";
import { getCurrentUser } from "@/lib/auth/session";

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <>
      <Sidebar userEmail={user.email} />
      <div className="ml-0 sm:ml-[280px] pt-16 sm:pt-0 min-h-screen">{children}</div>
    </>
  );
}
