-- Fix column naming to match Prisma schema (camelCase)

-- Fix daily_balance_read_model columns
ALTER TABLE "daily_balance_read_model" RENAME COLUMN "opening_balance" TO "openingBalance";
ALTER TABLE "daily_balance_read_model" RENAME COLUMN "total_credits" TO "totalCredits";
ALTER TABLE "daily_balance_read_model" RENAME COLUMN "total_debits" TO "totalDebits";
ALTER TABLE "daily_balance_read_model" RENAME COLUMN "closing_balance" TO "closingBalance";
ALTER TABLE "daily_balance_read_model" RENAME COLUMN "transaction_count" TO "transactionCount";
ALTER TABLE "daily_balance_read_model" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "daily_balance_read_model" RENAME COLUMN "updated_at" TO "updatedAt";

-- Fix transaction_read_model columns
ALTER TABLE "transaction_read_model" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "transaction_read_model" RENAME COLUMN "updated_at" TO "updatedAt";

-- Add missing columns to transaction_read_model
ALTER TABLE "transaction_read_model" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "transaction_read_model" ADD COLUMN IF NOT EXISTS "categoryName" TEXT;
ALTER TABLE "transaction_read_model" ADD COLUMN IF NOT EXISTS "cancelReason" TEXT;
ALTER TABLE "transaction_read_model" ADD COLUMN IF NOT EXISTS "transactionDate" TIMESTAMP(3);

-- Copy data from old columns to new ones
UPDATE "transaction_read_model" SET "categoryId" = "category" WHERE "categoryId" IS NULL;
UPDATE "transaction_read_model" SET "categoryName" = "category" WHERE "categoryName" IS NULL;
UPDATE "transaction_read_model" SET "transactionDate" = "date" WHERE "transactionDate" IS NULL;

-- Drop old columns
ALTER TABLE "transaction_read_model" DROP COLUMN IF EXISTS "category";
ALTER TABLE "transaction_read_model" DROP COLUMN IF EXISTS "date";

-- Make new columns NOT NULL
ALTER TABLE "transaction_read_model" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "transaction_read_model" ALTER COLUMN "categoryName" SET NOT NULL;
ALTER TABLE "transaction_read_model" ALTER COLUMN "transactionDate" SET NOT NULL;

-- Fix category_summary columns
ALTER TABLE "category_summary" RENAME COLUMN "updated_at" TO "updatedAt";
ALTER TABLE "category_summary" RENAME COLUMN "transaction_count" TO "transactionCount";

-- Add missing columns to category_summary
ALTER TABLE "category_summary" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "category_summary" ADD COLUMN IF NOT EXISTS "categoryName" TEXT;
ALTER TABLE "category_summary" ADD COLUMN IF NOT EXISTS "totalCredits" DECIMAL(15,2) DEFAULT 0;
ALTER TABLE "category_summary" ADD COLUMN IF NOT EXISTS "totalDebits" DECIMAL(15,2) DEFAULT 0;
ALTER TABLE "category_summary" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Copy data
UPDATE "category_summary" SET "categoryId" = "category" WHERE "categoryId" IS NULL;
UPDATE "category_summary" SET "categoryName" = "category" WHERE "categoryName" IS NULL;

-- Drop old columns
ALTER TABLE "category_summary" DROP COLUMN IF EXISTS "category";
ALTER TABLE "category_summary" DROP COLUMN IF EXISTS "total_amount";

-- Make new columns NOT NULL
ALTER TABLE "category_summary" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "category_summary" ALTER COLUMN "categoryName" SET NOT NULL;
ALTER TABLE "category_summary" ALTER COLUMN "totalCredits" SET NOT NULL;
ALTER TABLE "category_summary" ALTER COLUMN "totalDebits" SET NOT NULL;
ALTER TABLE "category_summary" ALTER COLUMN "createdAt" SET NOT NULL;

-- Update indexes for transaction_read_model
DROP INDEX IF EXISTS "transaction_read_model_date_idx";
DROP INDEX IF EXISTS "transaction_read_model_category_idx";

CREATE INDEX IF NOT EXISTS "transaction_read_model_transactionDate_idx" ON "transaction_read_model"("transactionDate");
CREATE INDEX IF NOT EXISTS "transaction_read_model_type_transactionDate_idx" ON "transaction_read_model"("type", "transactionDate");
CREATE INDEX IF NOT EXISTS "transaction_read_model_status_transactionDate_idx" ON "transaction_read_model"("status", "transactionDate");
CREATE INDEX IF NOT EXISTS "transaction_read_model_categoryId_transactionDate_idx" ON "transaction_read_model"("categoryId", "transactionDate");

-- Update unique constraint for category_summary
ALTER TABLE "category_summary" DROP CONSTRAINT IF EXISTS "category_summary_month_category_key";
ALTER TABLE "category_summary" ADD CONSTRAINT "category_summary_categoryId_month_key" UNIQUE ("categoryId", "month");

-- Update indexes for category_summary
CREATE INDEX IF NOT EXISTS "category_summary_month_idx" ON "category_summary"("month");
CREATE INDEX IF NOT EXISTS "category_summary_categoryId_month_idx" ON "category_summary"("categoryId", "month");

-- Made with Bob