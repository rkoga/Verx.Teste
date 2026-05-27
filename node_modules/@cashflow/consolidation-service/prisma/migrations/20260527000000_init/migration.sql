-- CreateEnum
CREATE TYPE "ConsolidationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "daily_balances" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "opening_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_credits" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_debits" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "closing_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "transaction_count" INTEGER NOT NULL DEFAULT 0,
    "consolidated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consolidation_logs" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "ConsolidationStatus" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "transactions_processed" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consolidation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_balances_date_key" ON "daily_balances"("date");

-- CreateIndex
CREATE INDEX "daily_balances_date_idx" ON "daily_balances"("date");

-- CreateIndex
CREATE INDEX "daily_balances_consolidated_at_idx" ON "daily_balances"("consolidated_at");

-- CreateIndex
CREATE INDEX "consolidation_logs_date_idx" ON "consolidation_logs"("date");

-- CreateIndex
CREATE INDEX "consolidation_logs_status_idx" ON "consolidation_logs"("status");

-- CreateIndex
CREATE INDEX "consolidation_logs_started_at_idx" ON "consolidation_logs"("started_at");

-- Made with Bob
