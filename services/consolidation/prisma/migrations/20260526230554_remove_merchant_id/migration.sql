-- DropIndex
DROP INDEX "daily_balances_merchant_id_idx";

-- DropIndex
DROP INDEX "daily_balances_merchant_id_date_key";

-- AlterTable
ALTER TABLE "daily_balances" DROP COLUMN "merchant_id";

-- CreateIndex
CREATE UNIQUE INDEX "daily_balances_date_key" ON "daily_balances"("date");

-- Made with Bob
