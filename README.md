# ⛳️ Flag Controller

Flag Controller is an open-source feature flag management platform built on [OpenFeature](https://openfeature.dev/). It lets teams turn functionality on or off without changing source code or redeploying. See the [documentation](apps/docs) for concepts, architecture, and usage.

## What's inside?

This Turborepo includes the following apps:

### Apps

- `api`: a [Fastify](https://fastify.dev/) server using TypeScript, and Drizzle ORM for database access to a Postgres database
- `docs`: comprehensive documentation built with [Docusaurus](https://docusaurus.io/) explaining architecture and usage
- `flagd`: a [flagd](https://flagd.dev/) instance (feature flag evaluation engine)
- `ui`: a [Next.js](https://nextjs.org/) app built with React, Tailwind CSS, and Carbon UI for a modern, accessible interface

### Shared libraries

- `libs/shared-constants`: constants shared across all applications
- `libs/shared-types`: TypeScript type definitions and interfaces shared across all applications
- `libs/shared-utils`: utility functions shared across all applications

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) `>= 22`
- [pnpm](https://pnpm.io/) `11.11.0` (the repo pins its package manager; the easiest way to get the right version is `corepack enable && corepack prepare pnpm@11.11.0 --activate`)
- [Docker](https://www.docker.com/) (optional — used to run the whole stack together, see [Docker](#docker))
- A local [PostgreSQL](https://www.postgresql.org/) database when running the API outside of Docker (see [Database](#database))

### Getting started

1. Install all dependencies from the repo root:

   ```bash
   pnpm install
   ```

2. Create the environment files each app needs by copying the provided examples:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/ui/.env.example apps/ui/.env
   ```

   Review each `.env` and fill in the required values. Every setting is documented inline in the example files. At a minimum the API needs a valid `DATABASE_URL`, and GitHub sign-in requires `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and a `BETTER_AUTH_SECRET` (generate one with `openssl rand -base64 32`).

### Flagd schema sync

Run `pnpm schema:sync` at the repo root to refresh the committed flagd schema JSON files and the generated shared TypeScript types.

Run `pnpm schema:check` to verify those generated artifacts are already in sync. CI uses the same check to catch drift.

> **Behind a TLS-inspecting proxy?** `schema:sync` fetches the schema over HTTPS from `https://flagd.dev`.
> Proxies that inspect TLS re-sign responses with their own certificate authority, which Node.js does not
> trust by default, so the fetch fails with an error such as `UNABLE_TO_VERIFY_LEAF_SIGNATURE` or
> `SELF_SIGNED_CERT_IN_CHAIN`.
>
> Point Node.js at the CA bundle your proxy uses. Ask whoever administers it where to find the file:
> ```bash
> NODE_EXTRA_CA_CERTS=/path/to/ca-bundle.pem pnpm schema:sync
> ```
> As a **local-development-only** last resort, you can disable certificate verification entirely:
> ```bash
> NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm schema:sync
> ```
> ⚠️ **Never use `NODE_TLS_REJECT_UNAUTHORIZED=0` in production or CI** — it disables all TLS verification and exposes you to man-in-the-middle attacks.

We format and lint code using [Biome](https://biomejs.dev/). For the best development experience, download the Biome extension for your IDE and make sure that if you have other formatters or linters like Prettier or ESLint that they are disabled for this workspace.

#### UI

See the [UI README](apps/ui/README.md) for how to run the UI development server.

#### API

See the [API README](apps/api/README.md) for how to run the API development server.

#### Database

The API needs a local Postgres database. See the [API README](apps/api/README.md) for how to set up the database, configure `DATABASE_URL`, and run migrations.

## Docker
We are using docker compose to be able to run the different parts of the system together more easily. While this is a nice to have, you can run the API and UI separately locally and achieve a similar development result.


### Running with docker compose
You can run production builds all of the applications together using docker compose:

```bash
docker compose up --build
```

You can also use compose to just run a specific service:

```bash
docker compose up --build api
```

### Troubleshooting


> [!TIP]
> If your docker build is behaving strangely trying building with the --no-cache-option
>
>```bash
> # Build everything with no- ache
> docker compose build --no-cache
> # Build a specific service with no cache
> docker compose build --no-cache docs
>```
