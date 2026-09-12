# Repository Guidelines

## Project Structure & Module Organization

This is a personal blog built with Next.js, TypeScript, Tailwind CSS, and
Contentlayer. Application routes and global styles live in `src/app/`; reusable
UI belongs in `src/components/`, and content/domain helpers belong in `src/lib/`.
Blog posts are MDX in `posts/` (typically numeric names such as `posts/779.md`).
Contentlayer schema and MDX processing are defined in `contentlayer.config.ts`.
Put publicly served assets under `public/`; do not edit generated `.next/` or
`.contentlayer/` output.

## Build, Test, and Development Commands

Run commands from the repository root with pnpm (Node 26 or later):

- `pnpm dev` runs Contentlayer and Next.js together at port 8080.
- `pnpm build` generates Contentlayer data and creates the production build.
- `pnpm start` serves a completed production build (`PORT` selects the port).
- `pnpm test` runs the Vitest suite once.
- `pnpm lint` applies ESLint fixes across the project; inspect its changes before
  committing.
- `pnpm lint:spell` checks US-English spelling in `posts/`.

## Coding Style & Naming Conventions

Use TypeScript for application code and keep components in PascalCase filenames
(`PostCard.tsx`); utilities use camelCase filenames (`postBodyMetrics.ts`).
Follow the existing Prettier settings: two-space indentation, no semicolons,
double quotes, and ES5 trailing commas. Tailwind utility ordering is formatted
by the configured Prettier plugin. Keep route-specific code adjacent to its
`src/app` route and use established `@/` imports where appropriate.

## Testing Guidelines

Write Vitest tests next to the code they cover using `*.test.ts` naming. Use
clear `describe` blocks and behavior-focused `test` names, as in
`src/lib/postBodyMetrics.test.ts`. Add regression cases for parsing or content
edge cases and run `pnpm test` before opening a pull request. There is no
repository-wide coverage threshold configured.

## Commit & Pull Request Guidelines

Recent history favors short Conventional Commit-style subjects, e.g.
`fix: handle empty tags` or `chore(deps): pnpm update`; keep each commit focused.
In pull requests, explain the user-visible change, link the relevant issue when
available, and include screenshots for visual changes. Update `README.md` for
interface, environment-variable, port, or container changes. Assign `@icco` for
review; the existing contribution policy requires two approvals before merge.

## Configuration & Content Safety

Never commit secrets such as `SECRET_TOKEN` or `GEMINI_API_KEY`. `pnpm
prepare-posts` can call external AI and image-upload services, so run it only
when intentionally updating post metadata or images.
