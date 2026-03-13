import Image from "next/image";
import { getServerSession } from "next-auth";

import { GoogleSignInButton, SignOutButton } from "@/components/auth-actions";
import { authOptions, isGoogleOAuthConfigured } from "@/lib/auth";

const requiredEnvNames = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
] as const;

export default async function Home(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);
  const sessionJson = session ? JSON.stringify(session, null, 2) : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#111827_45%,_#020617_100%)] px-6 py-10 text-white sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-sky-950/30 backdrop-blur sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-5">
              <p className="text-sm font-medium uppercase tracking-[0.32em] text-sky-200/80">
                Google OAuth Demo
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                基于 Next.js App Router 的 Google 登录示例
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                当前实现使用 next-auth，登录后会直接回到首页，并在服务端读取会话信息。
                你也可以访问
                <code className="mx-1 rounded bg-white/10 px-2 py-1 text-sm text-sky-100">
                  /api/demo/session
                </code>
                验证受保护接口。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isGoogleOAuthConfigured ? (
                session ? (
                  <SignOutButton />
                ) : (
                  <GoogleSignInButton />
                )
              ) : (
                <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                  先配置环境变量后再启用登录
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">当前登录状态</h2>
                <p className="mt-1 text-sm text-slate-300">
                  这里展示服务端读取到的 session 数据。
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                {session ? "Authenticated" : "Guest"}
              </span>
            </div>

            {session ? (
              <div className="mt-6 space-y-6">
                <div className="flex flex-col gap-4 rounded-3xl bg-white/5 p-5 sm:flex-row sm:items-center">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "Google avatar"}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-400/20 text-2xl font-semibold text-sky-100">
                      {(session.user?.name ?? "G").slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-white">
                      {session.user?.name ?? "未返回昵称"}
                    </p>
                    <p className="text-sm text-slate-300">
                      {session.user?.email ?? "未返回邮箱"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Session 过期时间：{session.expires}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                  <div className="border-b border-white/10 px-4 py-3 text-sm text-slate-300">
                    Session JSON
                  </div>
                  <pre className="overflow-x-auto px-4 py-4 text-sm leading-6 text-sky-100">
                    <code>{sessionJson}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-sm leading-7 text-slate-300">
                还没有检测到登录态。完成 Google OAuth 配置后，点击上方按钮即可跳转到 Google 授权页。
              </div>
            )}
          </article>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6">
              <h2 className="text-xl font-semibold text-white">环境变量</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                本 demo 依赖下面四项配置。缺少任意一项时，页面只展示说明，不会触发登录。
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                {requiredEnvNames.map((name) => (
                  <li
                    key={name}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 font-mono"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[28px] border border-sky-300/10 bg-sky-300/[0.08] p-6">
              <h2 className="text-xl font-semibold text-white">回调地址</h2>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                开发环境请在 Google Cloud Console 中添加下面这个 redirect URI：
              </p>
              <code className="mt-4 block rounded-2xl bg-slate-950/70 px-4 py-3 text-sm text-sky-100">
                http://localhost:3000/api/auth/callback/google
              </code>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6">
              <h2 className="text-xl font-semibold text-white">验证方式</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                登录后访问
                <code className="mx-1 rounded bg-white/10 px-2 py-1 text-xs text-sky-100">
                  /api/demo/session
                </code>
                ，未登录会返回 401，已登录会返回当前 session。
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
