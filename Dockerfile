# ============================================
# Dockerfile — SmartPayUT Admin (React + Vite)
# ============================================
# Multi-stage build:
# 1. Install dependencies (cached)
# 2. Build production bundle
# 3. Serve with Nginx
# ============================================

# ============================================
# Stage 1: Install dependencies
# ============================================
FROM node:22-alpine AS dependencies

WORKDIR /app

# Copy only package files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies (ci = clean install, reproducible)
RUN npm ci

# ============================================
# Stage 2: Build the application
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy installed node_modules from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Build the production bundle
RUN npm run build

# ============================================
# Stage 3: Production image with Nginx
# ============================================
FROM nginx:1.27-alpine

# Metadata
LABEL maintainer="smartpayut"
LABEL service="frontend-admin"
LABEL version="1.0.0"

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Non-root user (nginx alpine already runs worker as nginx user)
# Master process needs root, but workers run as unprivileged

EXPOSE 80

# Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
