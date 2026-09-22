# Multi-stage Dockerfile for LivPath AI (Vite frontend + Express backend)

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies needed for build
RUN npm install

# Copy source files
COPY . .

# Build Vite frontend and bundled Express server
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Copy package manifests and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 8000

# Start production server
CMD ["node", "dist/server.cjs"]
