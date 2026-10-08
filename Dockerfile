# syntax = docker/dockerfile:1.28.0@sha256:bb22d9815c728170f72750f4e5b0d672e06176142e1d602c7e66c050100b7e5b

# Install Node.js
FROM node:24.15.0-slim@sha256:4e6b70dd6cbfc88c8157ba19aa3d9f9cce6ba4703576d55459e45efcbc9c5f5d AS base

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
