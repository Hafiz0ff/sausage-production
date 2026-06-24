-- CreateTable
CREATE TABLE "sausage_documents" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "title" TEXT,
    "source_entity_kind" TEXT,
    "source_entity_id" TEXT,
    "external_document_id" TEXT,
    "related_order_id" TEXT,
    "related_batch_id" TEXT,
    "client_id" TEXT,
    "client_name" TEXT,
    "total_qty" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT,
    "note" TEXT,
    "created_by_user_id" TEXT NOT NULL,
    "created_by_name" TEXT,
    "posted_by_user_id" TEXT,
    "posted_by_name" TEXT,
    "posted_at" TIMESTAMP(3),
    "cancelled_by_user_id" TEXT,
    "cancelled_by_name" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sausage_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sausage_document_lines" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "item_kind" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity_qty" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "from_location" TEXT,
    "to_location" TEXT,
    "price_amount" DOUBLE PRECISION,
    "cost_amount" DOUBLE PRECISION,
    "currency" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sausage_document_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sausage_audit_logs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_kind" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "document_id" TEXT,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT,
    "before_json" JSONB,
    "after_json" JSONB,
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sausage_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sausage_documents_company_id_idx" ON "sausage_documents"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "sausage_documents_company_id_type_number_key" ON "sausage_documents"("company_id", "type", "number");

-- CreateIndex
CREATE INDEX "sausage_document_lines_company_id_idx" ON "sausage_document_lines"("company_id");

-- CreateIndex
CREATE INDEX "sausage_document_lines_document_id_idx" ON "sausage_document_lines"("document_id");

-- CreateIndex
CREATE INDEX "sausage_audit_logs_company_id_idx" ON "sausage_audit_logs"("company_id");

-- CreateIndex
CREATE INDEX "sausage_audit_logs_entity_kind_entity_id_idx" ON "sausage_audit_logs"("entity_kind", "entity_id");

-- AddForeignKey
ALTER TABLE "sausage_document_lines" ADD CONSTRAINT "sausage_document_lines_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "sausage_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
