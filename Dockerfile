# syntax = docker/dockerfile:1.15.1@sha256:9857836c9ee4268391bb5b09f9f157f3c91bb15821bb77969642813b0d00518d

# Install Node.js
ARG NODE_VERSION=22.10.0
FROM node:${NODE_VERSION}-slim AS base

# Set up working directory
LABEL fly_launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV="production"

# Install dependencies
FROM base AS build
COPY --link package-lock.json package.json ./
RUN npm ci --include=dev

# Build TypeScript
COPY --link . .
RUN node --run build

# Remove development dependencies
RUN npm prune --omit=dev
FROM base
COPY --from=build /app /app

# Run bot
CMD [ "npm", "run", "start", "--", "--production" ]
