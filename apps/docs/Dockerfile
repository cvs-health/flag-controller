FROM node:22-bookworm-slim AS base
ARG PNPM_VERSION="12.6.0"
ARG TURBO_VERSION="2.9.16"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo@${TURBO_VERSION}
COPY . .
RUN turbo prune flag-controller-docs --docker

# Install dependencies
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/.pnpmfile.mjs ./.pnpmfile.mjs
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile

# Build project and its dependencies
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm turbo build --filter=flag-controller-docs

FROM nginxinc/nginx-unprivileged:1.31.4-alpine AS runner
WORKDIR /app

EXPOSE 3000

COPY --from=installer --chown="nginx:nginx" /app/apps/docs/build /usr/share/nginx/html/
COPY --from=installer --chown="nginx:nginx" /app/apps/docs/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]