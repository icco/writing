# AGENTS.md

Guidance for coding agents working on writing.natwelch.com.

## Project Overview

Personal blog built with Next.js, TypeScript, Tailwind CSS, and content-collections.
- Application routes & styles: `src/app/`
- Reusable UI components: `src/components/`
- Domain helpers: `src/lib/`
- Blog posts: MDX files in `posts/` (typically numeric e.g. `posts/779.md`)
- content-collections config: `content-collections.ts`
- Static assets: `public/`. Do not manually edit `.next/` or `.content-collections/`.

## Commands

Use pnpm (Node >= 26):
- `pnpm dev` — Start dev server with content-collections on port 8080
- `pnpm build` — Generate content-collections output and production build
- `pnpm start` — Start production server (`PORT` environment variable)
- `pnpm test` — Run Vitest suite once
- `pnpm lint` — Run ESLint with auto-fix
- `pnpm lint:spell` — Spellcheck US English in `posts/`

## Conventions

- **Style**: TypeScript, PascalCase component filenames (`PostCard.tsx`), camelCase utilities (`postBodyMetrics.ts`).
- **Formatting**: Prettier with 2 spaces, double quotes, no semicolons, ES5 trailing commas. Path alias `@/`.
- **Testing**: Vitest (`*.test.ts` adjacent to code under test). Run `pnpm test` before opening PRs.
- **Commits**: Conventional Commits with lowercase subjects (e.g. `fix: handle empty tags`).
- **Safety**: Never commit secrets (`SECRET_TOKEN`, `GEMINI_API_KEY`). Run `pnpm prepare-posts` only when deliberately updating post metadata/images as it calls external APIs.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
