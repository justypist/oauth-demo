# Google OAuth Demo

一个基于 Next.js App Router + `next-auth` 的 Google 登录示例。

## 本地运行

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

默认打开 `http://localhost:3000`。

## 需要手工配置的内容

1. 打开 Google Cloud Console。
2. 创建或选择一个项目。
3. 进入 `APIs & Services` -> `OAuth consent screen`，完成应用名称、测试用户等基础配置。
4. 进入 `Credentials` -> `Create Credentials` -> `OAuth client ID`。
5. 应用类型选择 `Web application`。
6. 在 `Authorized redirect URIs` 中添加：

```text
http://localhost:3000/api/auth/callback/google
```

7. 复制生成的 `Client ID` 和 `Client Secret`。
8. 填写 `.env.local`：

```bash
GOOGLE_CLIENT_ID=你的_client_id
GOOGLE_CLIENT_SECRET=你的_client_secret
NEXTAUTH_SECRET=自己生成的长随机字符串
NEXTAUTH_URL=http://localhost:3000
```

可以用下面命令生成 `NEXTAUTH_SECRET`：

```bash
openssl rand -base64 32
```

## 功能说明

- 首页会显示当前是否已登录。
- 登录成功后，页面会展示 Google 返回的基础用户信息。
- `GET /api/demo/session` 是一个受保护的示例接口。
- 未登录访问 `/api/demo/session` 会返回 `401`。

## 关键文件

- `lib/auth.ts`：`next-auth` 配置。
- `app/api/auth/[...nextauth]/route.ts`：认证路由。
- `app/api/demo/session/route.ts`：受保护 demo 接口。
- `components/auth-actions.tsx`：登录/退出按钮。
- `app/page.tsx`：首页展示。
