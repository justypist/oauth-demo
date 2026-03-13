import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getAccountCenterSummary } from "@/lib/account";
import { authOptions } from "@/lib/auth";

type AccountLinksResponse =
  | {
      authenticated: false;
    }
  | {
      authenticated: true;
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

export async function GET(): Promise<NextResponse<AccountLinksResponse>> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 401,
      },
    );
  }

  const summary = await getAccountCenterSummary(session.user.id);

  if (!summary) {
    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    authenticated: true,
    linkedAccounts: summary.linkedAccounts,
    user: summary.user,
  });
}
