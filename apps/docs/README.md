# Flag Controller Documentation

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator. It contains the user-facing documentation for the Flag Controller platform, covering concepts, guides, providers, and getting-started instructions.

## Prerequisites

- [Node.js](https://nodejs.org/) `>=20`
- [pnpm](https://pnpm.io/) (this repository uses pnpm workspaces)

## Getting started

To start the documentation development server:

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Navigate to the docs app directory:
   ```bash
   cd apps/docs
   ```

3. Start the development server:
   ```bash
   pnpm start
   ```

The documentation will be available at [http://localhost:3000](http://localhost:3000). The dev server supports hot reloading, so most changes are reflected live without restarting.

## Available scripts

Available scripts in `package.json`:

### `pnpm start`
Starts the local development server with hot reloading.

### `pnpm build`
Generates a static production build into the `build` directory.

### `pnpm serve`
Serves the static production build locally (run `pnpm build` first).

### `pnpm clear`
Clears the Docusaurus build cache and generated files.

### `pnpm typecheck`
Type-checks the project with the TypeScript compiler.

### `pnpm write-heading-ids`
Adds explicit heading IDs to the Markdown/MDX docs.

### `pnpm write-translations`
Extracts translatable strings for internationalization.

## Building for production

To generate a static build and preview it locally:

```bash
pnpm build
pnpm serve
```

The static output is written to the `build` directory and can be hosted by any static file server.

## Project structure

- `docs/`: the documentation content, written in Markdown/MDX
- `src/`: custom React components, pages, theme overrides, and CSS
- `static/`: static assets such as images and fonts
- `plugins/`: custom Docusaurus/remark plugins
- `docusaurus.config.ts`: site configuration
- `sidebars.ts`: sidebar navigation structure

## Learn more

To learn more about Docusaurus, check out the [Docusaurus documentation](https://docusaurus.io/docs).
