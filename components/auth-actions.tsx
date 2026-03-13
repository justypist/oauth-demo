"use client";

import { useTransition } from "react";
import { signIn, signOut } from "next-auth/react";

type AuthProviderButtonProps = {
  mode?: "link" | "signin";
  provider: {
    id: string;
    name: string;
  };
  callbackUrl?: string;
};

export function ProviderAuthButton({
  callbackUrl = "/",
  mode = "signin",
  provider,
}: AuthProviderButtonProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition();

  const handleSignIn = (): void => {
    startTransition(() => {
      void signIn(provider.id, {
        callbackUrl,
      });
    });
  };

  const buttonLabel =
    mode === "link" ? `绑定 ${provider.name}` : `使用 ${provider.name} 登录`;

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isPending}
      className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "跳转中..." : buttonLabel}
    </button>
  );
}

export function SignOutButton({
  callbackUrl = "/",
}: {
  callbackUrl?: string;
}): React.JSX.Element {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = (): void => {
    startTransition(() => {
      void signOut({
        callbackUrl,
      });
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "退出中..." : "退出登录"}
    </button>
  );
}
