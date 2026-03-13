import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

type SessionResponse = {
  authenticated: boolean;
  session?: {
    expires: string;
    user: {
      id?: string;
      email?: string | null;
      image?: string | null;
      name?: string | null;
      role?: "admin" | "user";
      status?: "active" | "disabled";
    } | null;
  };
};

export async function GET(): Promise<NextResponse<SessionResponse>> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 401,
      },
    );
  }

  return NextResponse.json({
    authenticated: true,
    session: {
      expires: session.expires,
      user: session.user ?? null,
    },
  });
}
