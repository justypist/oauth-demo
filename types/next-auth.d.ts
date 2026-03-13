import type { DefaultSession } from "next-auth";

import type { UserRole, UserStatus } from "@/db/schema";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      status: UserStatus;
    };
  }
}
