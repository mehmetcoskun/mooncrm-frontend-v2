# syntax=docker/dockerfile:1.7

# --- Build stage ---
FROM oven/bun:1-alpine AS build
WORKDIR /app

# Copy manifest and lockfile first for better layer caching
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Build-time env: baked into the bundle.
# Set whichever applies via Dokploy build-args.
ARG VITE_API_URL
ARG VITE_STORAGE_URL
ARG VITE_FACEBOOK_APP_ID
ARG VITE_WHATSAPP_SCHEDULER_API_URL
ARG VITE_VAPI_API_URL
ARG VITE_MAIL_SCHEDULER_API_URL
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_STORAGE_URL=${VITE_STORAGE_URL} \
    VITE_FACEBOOK_APP_ID=${VITE_FACEBOOK_APP_ID} \
    VITE_WHATSAPP_SCHEDULER_API_URL=${VITE_WHATSAPP_SCHEDULER_API_URL} \
    VITE_VAPI_API_URL=${VITE_VAPI_API_URL} \
    VITE_MAIL_SCHEDULER_API_URL=${VITE_MAIL_SCHEDULER_API_URL}

COPY . .
RUN bun run build


# --- Runtime stage ---
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
