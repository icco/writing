# Project Overview

This is a static React frontend for a personal blog at natwelch.com. The project compiles MDX files into a Next.js-based website with a focus on content presentation, readability, and performance.

# Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS 4.0 with DaisyUI components
- **Content**: MDX files processed via Contentlayer2
- **Runtime**: React 19
- **Testing**: Jest
- **Linting**: ESLint with TypeScript, Prettier, and Next.js configs

# Project Structure

- `src/app/`: Next.js App Router pages and layouts
- `src/components/`: Reusable React components
- `src/lib/`: Utility functions and shared logic
- `posts/`: MDX blog post files
- `public/`: Static assets

# Coding Guidelines

## General Principles

- Write clear, maintainable TypeScript code
- Prefer functional components with hooks
- Use TypeScript strict mode features
- Follow existing patterns in the codebase

## Code Style

- Use Prettier for formatting (configured in package.json)
- 2 spaces for indentation
- No semicolons (per Prettier config)
- Double quotes for strings
- ES5 trailing commas
- Use Tailwind CSS utility classes for styling

## Import Organization

- Use the simple-import-sort ESLint plugin
- Group imports: external libraries first, then internal modules
- Use named exports (avoid default exports where possible)

## TypeScript

- Always specify types explicitly where they're not obvious
- Use interfaces for object shapes
- Avoid `any` types
- Enable strict TypeScript checking
- Target ES2018

## React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper TypeScript types for component props
- Follow React 19 best practices

## Content and MDX

- Blog posts are written in MDX format in the `posts/` directory
- Use Contentlayer2 for processing MDX content
- Support for GitHub emoji, Mermaid diagrams, and syntax highlighting
- Use remark and rehype plugins for content processing

## Performance

- Optimize for static generation where possible
- Use Next.js image optimization
- Minimize client-side JavaScript
- Follow Next.js App Router best practices

## Testing

- Use Jest for testing
- Write tests for critical functionality
- Follow existing test patterns in the repository

## Build and Development

- Use `yarn dev` to run the development server
- Use `yarn build` to create a production build
- Use `yarn lint` to check code quality
- The project uses npm-run-all to run multiple dev tasks in parallel

# Security Practices

- Never commit secrets or API keys
- Use environment variables for sensitive configuration
- Validate and sanitize user inputs
- Follow Next.js security best practices
- Keep dependencies updated

# Common Commands

- `yarn dev`: Start development server (runs contentlayer and next dev in parallel)
- `yarn build`: Build for production (includes contentlayer build)
- `yarn lint`: Run ESLint with auto-fix
- `yarn lint:spell`: Check spelling in posts
- `yarn test`: Run Jest tests
- `yarn start`: Start production server

# Additional Notes

- The project uses Contentlayer2 to process MDX files at build time
- The site supports both light and dark themes via next-themes
- RSS feed generation is supported via the feed package
- Code syntax highlighting uses starry-night
- The blog posts are located in the `posts/` directory
