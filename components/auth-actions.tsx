"use client";

import { useTransition } from "react";
import { signIn, signOut } from "next-auth/react";

type AuthActionButtonProps = {
  callbackUrl?: string;
};

export function GoogleSignInButton({
  callbackUrl = "/",
}: AuthActionButtonProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition();

  const handleSignIn = (): void => {
    startTransition(() => {
      void signIn("google", {
        callbackUrl,
      });
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isPending}
      className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "跳转中..." : "使用 Google 登录"}
    </button>
  );
}

export function SignOutButton({
  callbackUrl = "/",
}: AuthActionButtonProps): React.JSX.Element {
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
