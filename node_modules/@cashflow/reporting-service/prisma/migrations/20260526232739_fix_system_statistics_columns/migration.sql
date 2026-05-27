-- AlterTable system_statistics - Remove old columns and add new ones
ALTER TABLE "system_statistics" DROP COLUMN IF EXISTS "total_transactions";
ALTER TABLE "system_statistics" DROP COLUMN IF EXISTS "total_revenue";
ALTER TABLE "system_statistics" DROP COLUMN IF EXISTS "total_expenses";

-- Rename current_balance to match schema (if needed)
ALTER TABLE "system_statistics" RENAME COLUMN "current_balance" TO "currentBalance";
ALTER TABLE "system_statistics" RENAME COLUMN "last_transaction_date" TO "lastTransactionDate";
ALTER TABLE "system_statistics" RENAME COLUMN "updated_at" TO "lastUpdated";

-- Add new columns
ALTER TABLE "system_statistics" ADD COLUMN IF NOT EXISTS "totalCreditsMonth" DECIMAL(15,2) NOT NULL DEFAULT 0;
ALTER TABLE "system_statistics" ADD COLUMN IF NOT EXISTS "totalDebitsMonth" DECIMAL(15,2) NOT NULL DEFAULT 0;
ALTER TABLE "system_statistics" ADD COLUMN IF NOT EXISTS "totalTransactionsMonth" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "system_statistics" ADD COLUMN IF NOT EXISTS "averageTransactionValue" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- Made with Bob
