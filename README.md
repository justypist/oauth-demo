# Local Account Demo

一个基于 Next.js App Router + `next-auth` + `drizzle` + PostgreSQL 的本地账号系统示例。
核心目标：

- 第三方登录后落本地 `user`
- 用 `account` 表维护多个平台绑定关系
- 已登录状态下继续 OAuth，可把不同平台账号绑定到同一个本地用户

## 本地运行

```bash
pnpm install
pnpm db:push
pnpm dev
```

默认打开 `http://localhost:3000`。

## 当前本地开发数据库

- 数据库：`google_oauth_demo_dev`
- 用户：`google_oauth_demo_dev`
- 密码：`google_oauth_demo_dev`

项目使用的连接串已经写入 `.env.local`，如需重建，也可以直接用下面命令：

```bash
docker exec postgres psql -U typist -d test -c "CREATE ROLE google_oauth_demo_dev LOGIN PASSWORD 'google_oauth_demo_dev';"
docker exec postgres psql -U typist -d test -c "CREATE DATABASE google_oauth_demo_dev OWNER google_oauth_demo_dev;"
```

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
DATABASE_URL=postgresql://google_oauth_demo_dev:google_oauth_demo_dev@127.0.0.1:5432/google_oauth_demo_dev
GOOGLE_CLIENT_ID=你的_google_client_id
GOOGLE_CLIENT_SECRET=你的_google_client_secret
GITHUB_ID=
GITHUB_SECRET=
NEXTAUTH_SECRET=自己生成的长随机字符串
NEXTAUTH_URL=http://localhost:3000
```

可以用下面命令生成 `NEXTAUTH_SECRET`：

```bash
openssl rand -base64 32
```

## 功能说明

- 首页会显示当前会话、本地用户 ID、已绑定平台数量。
- `GET /api/account/links` 会返回当前本地账号和已绑定平台。
- `GET /api/demo/session` 是一个受保护的示例接口。
- 账号中心页面是 `/account`。
- 未登录访问受保护接口会返回 `401`。
- 当前已支持 Google；结构上已预留 GitHub，补环境变量即可启用。

## 数据库命令

```bash
pnpm db:push
pnpm db:studio
```

## 关键文件

- `db/schema.ts`：本地账号和绑定关系表结构。
- `lib/db.ts`：PostgreSQL + drizzle 连接。
- `lib/auth.ts`：`next-auth` + Drizzle Adapter 配置。
- `lib/account.ts`：账号中心查询逻辑。
- `app/api/auth/[...nextauth]/route.ts`：认证路由。
- `app/api/account/links/route.ts`：当前账号和绑定列表接口。
- `app/api/demo/session/route.ts`：受保护 demo 接口。
- `components/auth-actions.tsx`：登录/绑定/退出按钮。
- `app/page.tsx`：首页展示。
- `app/account/page.tsx`：账号中心。
