# syntax = docker/dockerfile:1@sha256:865e5dd094beca432e8c0a1d5e1c465db5f998dca4e439981029b3b81fb39ed5

# Install Node.js
ARG NODE_VERSION=22.10.0
FROM node:${NODE_VERSION}-slim as base

# Set up working directory
LABEL fly_launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV="production"

# Install dependencies
FROM base as build
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
CMD [ "npm", "run", "start" ]
