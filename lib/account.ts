import { asc, eq } from "drizzle-orm";

import { accounts, users } from "@/db/schema";
import { db } from "@/lib/db";

export type AccountCenterSummary = {
  linkedAccounts: {
    createdAt: string;
    provider: string;
    providerAccountId: string;
    type: string;
  }[];
  user: {
    createdAt: string;
    displayName: string | null;
    email: string | null;
    id: string;
    image: string | null;
    name: string | null;
    role: "admin" | "user";
    status: "active" | "disabled";
  };
};

export async function getAccountCenterSummary(
  userId: string,
): Promise<AccountCenterSummary | null> {
  const [userRecord] = await db
    .select({
      createdAt: users.createdAt,
      displayName: users.displayName,
      email: users.email,
      id: users.id,
      image: users.image,
      name: users.name,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRecord) {
    return null;
  }

  const linkedAccounts = await db
    .select({
      createdAt: accounts.createdAt,
      provider: accounts.provider,
      providerAccountId: accounts.providerAccountId,
      type: accounts.type,
    })
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .orderBy(asc(accounts.provider));

  return {
    linkedAccounts: linkedAccounts.map((account) => ({
      createdAt: account.createdAt.toISOString(),
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      type: account.type,
    })),
    user: {
      createdAt: userRecord.createdAt.toISOString(),
      displayName: userRecord.displayName,
      email: userRecord.email,
      id: userRecord.id,
      image: userRecord.image,
      name: userRecord.name,
      role: userRecord.role,
      status: userRecord.status,
    },
  };
}
