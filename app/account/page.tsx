import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { ProviderAuthButton, SignOutButton } from "@/components/auth-actions";
import { getAccountCenterSummary } from "@/lib/account";
import { authOptions } from "@/lib/auth";
import { enabledAuthProviders, supportedAuthProviders } from "@/lib/auth-providers";

function maskProviderAccountId(providerAccountId: string): string {
  if (providerAccountId.length <= 10) {
    return providerAccountId;
  }

  return `${providerAccountId.slice(0, 6)}...${providerAccountId.slice(-4)}`;
}

export default async function AccountPage(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const summary = await getAccountCenterSummary(session.user.id);

  if (!summary) {
    redirect("/");
  }

  const linkedProviderIds = new Set(
    summary.linkedAccounts.map((account) => account.provider),
  );

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#0f172a_0%,_#0f172a_35%,_#020617_100%)] px-6 py-10 text-white sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-[32px] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-sky-950/20 backdrop-blur sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-4">
                {summary.user.image ? (
                  <Image
                    src={summary.user.image}
                    alt={summary.user.name ?? "avatar"}
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] rounded-3xl border border-white/10 object-cover"
                  />
                ) : (
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-3xl bg-sky-400/15 text-3xl font-semibold text-sky-100">
                    {(summary.user.name ?? "U").slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-sm uppercase tracking-[0.24em] text-sky-200/75">
                    Account Center
                  </p>
                  <h1 className="text-3xl font-semibold tracking-tight text-white">
                    {summary.user.displayName ??
                      summary.user.name ??
                      "未设置昵称"}
                  </h1>
                  <p className="text-sm text-slate-300">
                    {summary.user.email ?? "未返回邮箱"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                  <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">
                    Local User ID
                  </span>
                  <code className="mt-2 block break-all text-sky-100">
                    {summary.user.id}
                  </code>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                  <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">
                    Linked Providers
                  </span>
                  <span className="mt-2 block text-lg font-semibold text-white">
                    {summary.linkedAccounts.length}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                  <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">
                    Role
                  </span>
                  <span className="mt-2 block text-white">{summary.user.role}</span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                  <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">
                    Status
                  </span>
                  <span className="mt-2 block text-white">
                    {summary.user.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                返回首页
              </Link>
              <SignOutButton callbackUrl="/" />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <article className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6 shadow-xl shadow-black/20">
            <h2 className="text-xl font-semibold text-white">已绑定平台</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              每条记录都绑定到同一个本地用户 ID。后续新增平台时，保持登录状态点击绑定即可安全关联到当前账号。
            </p>

            <div className="mt-6 space-y-4">
              {summary.linkedAccounts.length > 0 ? (
                summary.linkedAccounts.map((account) => (
                  <div
                    key={`${account.provider}:${account.providerAccountId}`}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {account.provider}
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          providerAccountId:
                          <code className="ml-2 rounded bg-white/10 px-2 py-1 text-sky-100">
                            {maskProviderAccountId(account.providerAccountId)}
                          </code>
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-emerald-100">
                        linked
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                      绑定时间：{new Date(account.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-5 text-sm leading-7 text-slate-300">
                  还没有任何已绑定平台。至少完成一次第三方登录后，这里才会出现绑定记录。
                </div>
              )}
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6">
              <h2 className="text-xl font-semibold text-white">绑定新平台</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                当前登录状态下再次执行 OAuth，会把新平台账号绑定到当前本地用户，而不是创建新用户。
              </p>

              <div className="mt-6 space-y-4">
                {supportedAuthProviders.map((provider) => {
                  const isLinked = linkedProviderIds.has(provider.id);

                  return (
                    <div
                      key={provider.id}
                      className="rounded-3xl border border-white/10 bg-slate-950/45 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold text-white">
                            {provider.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-300">
                            {provider.enabled
                              ? "已配置，可直接绑定"
                              : "尚未配置环境变量"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.22em] ${
                            isLinked
                              ? "border border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                              : provider.enabled
                                ? "border border-sky-300/20 bg-sky-300/10 text-sky-100"
                                : "border border-white/10 bg-white/5 text-slate-300"
                          }`}
                        >
                          {isLinked
                            ? "已绑定"
                            : provider.enabled
                              ? "可绑定"
                              : "未启用"}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {isLinked ? (
                          <span className="text-sm text-slate-300">
                            当前账号已经绑定了 {provider.name}。
                          </span>
                        ) : provider.enabled ? (
                          <ProviderAuthButton
                            provider={provider}
                            callbackUrl="/account"
                            mode="link"
                          />
                        ) : (
                          <code className="rounded-2xl bg-black/30 px-3 py-2 text-xs text-slate-300">
                            {provider.requiredEnvNames.join(", ")}
                          </code>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-sky-300/10 bg-sky-300/[0.08] p-6">
              <h2 className="text-xl font-semibold text-white">当前启用平台</h2>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                {enabledAuthProviders.length > 0
                  ? enabledAuthProviders.map((provider) => provider.name).join(" / ")
                  : "当前还没有启用任何第三方登录平台。"}
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
