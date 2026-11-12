FROM oven/bun:1.3.5-slim AS dependencies
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.3.5-slim
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/bot.db
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY config ./config
COPY drizzle ./drizzle
COPY scripts ./scripts
COPY src ./src
RUN mkdir -p /app/data && chown -R bun:bun /app/data
USER bun
VOLUME ["/app/data"]
CMD ["bun", "src/index.ts"]
