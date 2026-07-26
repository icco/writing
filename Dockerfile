FROM node:26-slim AS base

RUN npm install -g pnpm@11.2.2

# Install dependencies only when needed
FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=secret,id=npm_token \
  echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/npm_token)" >> .npmrc && \
  pnpm install --frozen-lockfile && \
  rm -f .npmrc


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DOMAIN="https://writing.natwelch.com"

RUN pnpm run chrome

RUN pnpm build

# Production image, copy all the files and run next
FROM node:26-slim AS runner

LABEL org.opencontainers.image.source=https://github.com/icco/writing
LABEL org.opencontainers.image.description="A react frontend for my blog"
LABEL org.opencontainers.image.licenses=MPL-2.0
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV DOMAIN="https://writing.natwelch.com"

CMD ["node", "server.js"]
