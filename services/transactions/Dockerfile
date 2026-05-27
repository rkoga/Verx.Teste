# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy shared module
COPY shared ./shared

# Copy service files
COPY services/transactions ./services/transactions

# Install dependencies
RUN npm install

# Generate Prisma Client
WORKDIR /app/services/transactions
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/services/transactions/package*.json ./services/transactions/

# Install production dependencies only
RUN npm install --production

# Copy built application
COPY --from=builder /app/services/transactions/dist ./services/transactions/dist
COPY --from=builder /app/services/transactions/prisma ./services/transactions/prisma
COPY --from=builder /app/shared/dist ./shared/dist

# Generate Prisma Client in production
WORKDIR /app/services/transactions
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]

# Made with Bob
