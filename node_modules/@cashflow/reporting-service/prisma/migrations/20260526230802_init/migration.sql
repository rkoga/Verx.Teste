-- CreateTable
CREATE TABLE "transaction_read_model" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_read_model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_balance_read_model" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "opening_balance" DECIMAL(65,30) NOT NULL,
    "total_credits" DECIMAL(65,30) NOT NULL,
    "total_debits" DECIMAL(65,30) NOT NULL,
    "closing_balance" DECIMAL(65,30) NOT NULL,
    "transaction_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_balance_read_model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_statistics" (
    "id" TEXT NOT NULL,
    "total_transactions" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_expenses" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "current_balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "last_transaction_date" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_summary" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "transaction_count" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transaction_read_model_date_idx" ON "transaction_read_model"("date");

-- CreateIndex
CREATE INDEX "transaction_read_model_type_idx" ON "transaction_read_model"("type");

-- CreateIndex
CREATE INDEX "transaction_read_model_category_idx" ON "transaction_read_model"("category");

-- CreateIndex
CREATE INDEX "transaction_read_model_status_idx" ON "transaction_read_model"("status");

-- CreateIndex
CREATE UNIQUE INDEX "daily_balance_read_model_date_key" ON "daily_balance_read_model"("date");

-- CreateIndex
CREATE INDEX "daily_balance_read_model_date_idx" ON "daily_balance_read_model"("date");

-- CreateIndex
CREATE UNIQUE INDEX "category_summary_month_category_key" ON "category_summary"("month", "category");

-- Made with Bob
