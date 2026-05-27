# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared module to the expected location
COPY shared ../../shared

# Copy service package files
COPY services/transactions/package*.json ./

# Install dependencies
RUN npm install

# Copy config files
COPY services/transactions/tsconfig.json ./
COPY services/transactions/nest-cli.json ./

# Copy source code from transactions service
COPY services/transactions/src ./src
COPY services/transactions/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY services/transactions/package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]

# Made with Bob
