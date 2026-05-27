-- DropIndex (IF EXISTS to avoid errors if already dropped)
DROP INDEX IF EXISTS "daily_balances_merchant_id_idx";

-- DropIndex (IF EXISTS to avoid errors if already dropped)
DROP INDEX IF EXISTS "daily_balances_merchant_id_date_key";

-- AlterTable (IF EXISTS to avoid errors if already dropped)
ALTER TABLE "daily_balances" DROP COLUMN IF EXISTS "merchant_id";

-- CreateIndex (only if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS "daily_balances_date_key" ON "daily_balances"("date");

-- Made with Bob
