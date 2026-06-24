-- AlterTable
ALTER TABLE "sausage_production_batches"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'RELEASED',
ADD COLUMN "quality_status" TEXT NOT NULL DEFAULT 'NOT_CHECKED',
ADD COLUMN "planned_qty" DOUBLE PRECISION,
ADD COLUMN "variance_qty" DOUBLE PRECISION,
ADD COLUMN "variance_percent" DOUBLE PRECISION,
ADD COLUMN "master_user_id" TEXT,
ADD COLUMN "master_name" TEXT,
ADD COLUMN "operator_user_id" TEXT,
ADD COLUMN "operator_name" TEXT,
ADD COLUMN "quality_checked_by_user_id" TEXT,
ADD COLUMN "quality_checked_by_name" TEXT,
ADD COLUMN "quality_checked_at" TIMESTAMP(3),
ADD COLUMN "quality_note" TEXT;

-- AlterTable
ALTER TABLE "sausage_losses"
ADD COLUMN "category" TEXT,
ADD COLUMN "stage" TEXT,
ADD COLUMN "is_recoverable" BOOLEAN DEFAULT false,
ADD COLUMN "approved_by_user_id" TEXT,
ADD COLUMN "approved_by_name" TEXT,
ADD COLUMN "approved_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "sausage_quality_checks" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "production_batch_id" TEXT NOT NULL,
    "production_order_id" TEXT,
    "batch_no" TEXT,
    "finished_product_id" TEXT,
    "finished_product_name" TEXT,
    "checked_qty" DOUBLE PRECISION NOT NULL,
    "accepted_qty" DOUBLE PRECISION NOT NULL,
    "rejected_qty" DOUBLE PRECISION NOT NULL,
    "quality_status" TEXT NOT NULL,
    "temperature_celsius" DOUBLE PRECISION,
    "humidity_percent" DOUBLE PRECISION,
    "sample_weight_qty" DOUBLE PRECISION,
    "note" TEXT,
    "checked_by_user_id" TEXT NOT NULL,
    "checked_by_name" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sausage_quality_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sausage_quality_checks_company_id_idx" ON "sausage_quality_checks"("company_id");

-- CreateIndex
CREATE INDEX "sausage_quality_checks_production_batch_id_idx" ON "sausage_quality_checks"("production_batch_id");
