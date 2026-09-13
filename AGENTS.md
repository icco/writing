# AGENTS.md

Guidance for coding agents working on writing.natwelch.com.
See [CLAUDE.md](CLAUDE.md) for Claude Code entrypoint (`@AGENTS.md`).

## Project Overview

Personal blog built with Next.js, TypeScript, Tailwind CSS, and Contentlayer.
- Application routes & styles: `src/app/`
- Reusable UI components: `src/components/`
- Domain helpers: `src/lib/`
- Blog posts: MDX files in `posts/` (typically numeric e.g. `posts/779.md`)
- Contentlayer config: `contentlayer.config.ts`
- Static assets: `public/`. Do not manually edit `.next/` or `.contentlayer/`.

## Commands

Use pnpm (Node >= 26):
- `pnpm dev` — Start dev server with Contentlayer on port 8080
- `pnpm build` — Generate Contentlayer artifacts and production build
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
