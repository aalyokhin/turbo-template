# Based on the official pnpm Docker guide: https://pnpm.io/docker
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
# git is needed by the simple-git-hooks prepare script during install.
RUN apk add --no-cache git
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @repo/api run build
RUN pnpm --filter @repo/web run build
RUN pnpm deploy --filter @repo/api --prod /prod/api

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /prod/api /app
COPY --from=build /usr/src/app/apps/web/dist /app/web-dist
COPY --from=build /usr/src/app/packages/db/drizzle /app/drizzle
WORKDIR /app
ENV WEB_DIST_PATH=/app/web-dist
ENV MIGRATIONS_PATH=/app/drizzle
ENV DATABASE_URL=file:/app/data/app.db
EXPOSE 3001
CMD ["node", "dist/index.js"]
