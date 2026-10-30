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
RUN turbo prune flag-controller-api --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/.pnpmfile.mjs ./.pnpmfile.mjs
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile

# Build project and its dependencies
COPY --from=pruner /app/out/full .
COPY turbo.json turbo.json

RUN pnpm turbo build --filter=flag-controller-api

FROM gcr.io/distroless/nodejs22-debian13:latest AS runner
WORKDIR /app

COPY --from=installer --chown="nonroot:nonroot" /app .

ENV NODE_ENV=production

EXPOSE 8080

#Change working directory before running the application
WORKDIR /app/apps/api

CMD ["./dist/index.js"]
