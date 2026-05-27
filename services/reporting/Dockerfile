FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from reporting service
COPY services/reporting/package*.json ./

# Install dependencies
RUN npm install

# Copy tsconfig
COPY services/reporting/tsconfig.json ./

# Copy source code from reporting service
COPY services/reporting/src ./src
COPY services/reporting/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY services/reporting/package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy Prisma schema and generate client
COPY services/reporting/prisma ./prisma
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3003

CMD ["node", "dist/server.js"]

# Made with Bob
