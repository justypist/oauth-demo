# OAuth Demo

一个基于 Next.js App Router + `next-auth` + `drizzle` + PostgreSQL 的 OAuth 登录与账号绑定示例。
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

## CI

仓库内已经添加 GitHub Actions CI，配置文件在 `.github/workflows/ci.yml`。

触发条件：

- `pull_request`
- 推送到 `main`

执行内容：

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

## Docker Compose

先准备环境变量：

```bash
cp .env.example .env
```

然后至少填写基础项和一组已启用平台的凭证，例如：

```bash
GOOGLE_CLIENT_ID=你的_google_client_id
GOOGLE_CLIENT_SECRET=你的_google_client_secret
NEXTAUTH_SECRET=自己生成的长随机字符串
NEXTAUTH_URL=http://localhost:3000
```

`compose.yaml` 会自动把容器内 `DATABASE_URL` 指向 `db` 服务，不需要手工改成容器地址。

启动：

```bash
docker compose up -d --build
```

首次建表：

```bash
docker compose exec app pnpm db:push
```

查看日志：

```bash
docker compose logs -f app
```

停止：

```bash
docker compose down
```

如果连数据库数据一起删除：

```bash
docker compose down -v
```

## 推送到 GHCR

仓库内已经添加自动发布工作流，配置文件在 `.github/workflows/docker-publish.yml`。

触发条件：

- 手动触发 `workflow_dispatch`
- 推送到 `main`
- 推送 `v*` tag，例如 `v0.1.0`

执行内容：

- 使用仓库根目录 `Dockerfile` 构建镜像
- 登录 `ghcr.io`
- 推送到 `ghcr.io/<owner>/<repo>`
- 自动生成这些 tag：
  - `latest`，仅默认分支
  - 分支名
  - Git tag 名
  - commit sha

默认使用 `GITHUB_TOKEN` 推送，不需要额外的 GHCR Token，但仓库 Actions 需要有包写入权限。

如果要手工推送，先登录：

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u justypist --password-stdin
```

构建并打标签：

```bash
export APP_IMAGE=ghcr.io/justypist/oauth-demo:latest
docker compose build app
```

推送：

```bash
docker compose push app
```

如果要打版本号：

```bash
export APP_IMAGE=ghcr.io/justypist/oauth-demo:v0.1.0
docker compose build app
docker compose push app
```

## 当前本地开发数据库

- 数据库：`oauth_demo_dev`
- 用户：`oauth_demo_dev`
- 密码：`oauth_demo_dev`

项目使用的连接串已经写入 `.env.local`，如需重建，也可以直接用下面命令：

```bash
docker exec postgres psql -U typist -d test -c "CREATE ROLE oauth_demo_dev LOGIN PASSWORD 'oauth_demo_dev';"
docker exec postgres psql -U typist -d test -c "CREATE DATABASE oauth_demo_dev OWNER oauth_demo_dev;"
```

## 需要手工配置的内容

不同 OAuth 平台的控制台入口各不相同，但整体流程一致：创建应用、配置同意页、填写回调地址、拿到客户端凭证，再写入环境变量。

下面给出一个 Google 平台示例，其他平台按各自文档替换即可。

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
DATABASE_URL=postgresql://oauth_demo_dev:oauth_demo_dev@127.0.0.1:5432/oauth_demo_dev
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
- 当前已内置多个常见 OAuth 平台接入结构；补齐对应环境变量即可启用。

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
