import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import { eq } from "drizzle-orm";

import {
  accounts,
  authenticators,
  sessions,
  users,
  verificationTokens,
} from "@/db/schema";
import { db } from "@/lib/db";
import { isAuthConfigured, oauthProviders } from "@/lib/auth-providers";

export const authOptions = {
  adapter: DrizzleAdapter(db, {
    accountsTable: accounts,
    authenticatorsTable: authenticators,
    sessionsTable: sessions,
    usersTable: users,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const [dbUser] = await db
          .select({
            role: users.role,
            status: users.status,
          })
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        session.user.id = user.id;
        session.user.role = dbUser?.role ?? "user";
        session.user.status = dbUser?.status ?? "active";
      }

      return session;
    },
  },
  providers: oauthProviders,
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/",
  },
} satisfies NextAuthOptions;

export { isAuthConfigured };
