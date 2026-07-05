# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24.18.0

FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    QURAN_DATABASE_PATH=/app/data/quran.sqlite \
    npm_config_audit=false \
    npm_config_fund=false

FROM base AS build
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build:ts
RUN npm run db:seed
RUN npm prune --omit=dev

FROM base AS runtime

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/data ./data
COPY --chown=node:node package.json package-lock.json ./

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["sh", "-c", "exec node node_modules/fastify-cli/cli.js start -a 0.0.0.0 -p ${PORT:-3000} -l info dist/app.js"]
