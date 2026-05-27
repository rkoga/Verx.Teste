-- Remove cancellation columns from transactions table
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "cancelled_at";
ALTER TABLE "transactions" DROP COLUMN IF EXISTS "cancel_reason";

-- Made with Bob