# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared module first
COPY shared ../../shared

# Install shared module dependencies
WORKDIR /shared
COPY shared/package*.json ./
RUN npm install

# Go back to app directory
WORKDIR /app

# Copy package files from consolidation service
COPY services/consolidation/package*.json ./

# Install dependencies
RUN npm install

# Copy config files
COPY services/consolidation/tsconfig.json ./
COPY services/consolidation/nest-cli.json ./

# Copy source code from consolidation service
COPY services/consolidation/src ./src
COPY services/consolidation/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY services/consolidation/package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3002/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main.js"]

# Made with Bob
