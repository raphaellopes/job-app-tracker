import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

import { getCurrentUser } from "./session";

import "server-only";

export type DbUser = {
  id: number;
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
};

export async function getDbUserForSession(): Promise<{
  session: Awaited<ReturnType<typeof getCurrentUser>>;
  dbUser: DbUser | null;
}> {
  const session = await getCurrentUser();
  if (!session) {
    return { session: null, dbUser: null };
  }

  const row = await db.query.users.findFirst({
    where: eq(users.firebaseUid, session.uid),
  });

  if (!row) {
    return { session, dbUser: null };
  }

  return {
    session,
    dbUser: {
      id: row.id,
      firebaseUid: row.firebaseUid,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
    },
  };
}
