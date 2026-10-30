# writing

My blog. Posts are written in MDX and processed with contentlayer2.

You can see screenshots of my inspiration in the [inspiration folder](https://github.com/icco/writing/tree/main/public/images/inspiration)

## Development

```bash
pnpm dev      # start dev server on :8080
pnpm build    # build for production
pnpm start    # run production build
pnpm test     # run unit tests
pnpm test:coverage  # run tests with 90% coverage threshold (used in CI)
```

## Features

- Syntax highlighting, Mermaid diagrams, and GFM via rehype/remark plugins
- OpenGraph images generated with Playwright
- RSS feed
- Dark mode via next-themes
- AI-generated post descriptions (optional)
