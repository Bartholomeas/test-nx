FROM node:24-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
ARG APP_NAME
WORKDIR /app
COPY . .
RUN npx nx build ${APP_NAME}

FROM base AS runner
ARG APP_NAME
WORKDIR /app
RUN apk add --no-cache curl

COPY --from=builder /app/dist/apps/${APP_NAME}/package.json ./
COPY --from=builder /app/dist/apps/${APP_NAME}/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist/apps/${APP_NAME}/main.js ./

EXPOSE 8000

CMD ["node", "main.js"]
