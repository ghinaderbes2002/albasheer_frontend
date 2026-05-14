# syntax=docker/dockerfile:1.7

# ─── Stage 1: build the SPA bundle with Node ─────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for better Docker layer caching.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy the rest of the source.
COPY . .

# Vite reads VITE_* vars at build time and inlines them into the bundle.
# Override with `--build-arg` or via docker-compose `args:` for env-specific
# deployments (staging / production / IP changes).
ARG VITE_API_BASE_URL
ARG VITE_MEDIA_BASE_URL
ARG VITE_DEFAULT_LANG=ar

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_MEDIA_BASE_URL=${VITE_MEDIA_BASE_URL}
ENV VITE_DEFAULT_LANG=${VITE_DEFAULT_LANG}

RUN npm run build

# ─── Stage 2: serve the static bundle behind nginx ───────────────────
FROM nginx:1.27-alpine AS runtime

# SPA-friendly nginx config (try_files fallback, gzip, asset caching).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built artifacts from the builder stage.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Run nginx in the foreground so the container stays alive.
CMD ["nginx", "-g", "daemon off;"]
