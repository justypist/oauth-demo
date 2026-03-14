# syntax=docker/dockerfile:1.7

FROM node:lts-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder

WORKDIR /app

ARG DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres"
ARG GOOGLE_CLIENT_ID="docker-build-placeholder"
ARG GOOGLE_CLIENT_SECRET="docker-build-placeholder"
ARG GITHUB_ID=""
ARG GITHUB_SECRET=""
ARG NEXTAUTH_SECRET="docker-build-placeholder"
ARG NEXTAUTH_URL="http://localhost:3000"

ENV DATABASE_URL="$DATABASE_URL"
ENV GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
ENV GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
ENV GITHUB_ID="$GITHUB_ID"
ENV GITHUB_SECRET="$GITHUB_SECRET"
ENV NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
ENV NEXTAUTH_URL="$NEXTAUTH_URL"

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

FROM node:lts-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
