# writing

A Next.js blog. Posts are written in MDX and processed with contentlayer2.

Design inspiration is in the [inspiration folder](https://github.com/icco/writing/tree/main/public/images/inspiration).

## Development

```bash
yarn dev      # start dev server on :8080
yarn build    # build for production
yarn start    # run production build
```

## Features

- Syntax highlighting, Mermaid diagrams, and GFM via rehype/remark plugins
- OpenGraph images generated with Playwright
- RSS feed
- Dark mode via next-themes
- AI-generated post descriptions (optional)
