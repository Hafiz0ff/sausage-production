-- CreateTable
CREATE TABLE "sausage_raw_materials" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "warehouse_qty" DOUBLE PRECISION NOT NULL,
    "workshop_qty" DOUBLE PRECISION NOT NULL,
    "reserved_qty" DOUBLE PRECISION NOT NULL,
    "min_qty" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "supplier_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sausage_raw_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sausage_finished_products" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "stock_qty" DOUBLE PRECISION NOT NULL,
    "stock_pcs" DOUBLE PRECISION,
    "reserved_qty" DOUBLE PRECISION NOT NULL,
    "shelf_life_days" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sausage_finished_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sausage_recipes" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "finished_product_id" TEXT NOT NULL,
    "finished_product_name" TEXT NOT NULL,
    "output_qty" DOUBLE PRECISION NOT NULL,
    "expected_yield_percent" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sausage_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sausage_recipe_items" (
    "id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "raw_material_id" TEXT NOT NULL,
    "raw_material_name" TEXT NOT NULL,
    "quantity_qty" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "sausage_recipe_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sausage_clients" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "phone" TEXT,
    "external_client_id" TEXT,
    "balance_amount" DOUBLE PRECISION,
    "balance_currency" TEXT,
    "last_order_at" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sausage_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sausage_production_orders" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "finished_product_id" TEXT NOT NULL,
    "finished_product_name" TEXT NOT NULL,
    "quantity_qty" DOUBLE PRECISION NOT NULL,
    "client_id" TEXT,
    "client_name" TEXT,
    "status" TEXT NOT NULL,
    "progress_percent" DOUBLE PRECISION NOT NULL,
    "due_at" TEXT,
    "shift" TEXT,
    "external_order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sausage_production_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sausage_production_batches" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "batch_no" TEXT NOT NULL,
    "production_order_id" TEXT NOT NULL,
    "production_order_number" TEXT NOT NULL,
    "finished_product_id" TEXT NOT NULL,
    "finished_product_name" TEXT NOT NULL,
    "produced_qty" DOUBLE PRECISION NOT NULL,
    "accepted_qty" DOUBLE PRECISION NOT NULL,
    "rejected_qty" DOUBLE PRECISION NOT NULL,
    "yield_percent" DOUBLE PRECISION NOT NULL,
    "released_at" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sausage_production_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sausage_stock_movements" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "item_kind" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity_qty" DOUBLE PRECISION NOT NULL,
    "from_location" TEXT NOT NULL,
    "to_location" TEXT NOT NULL,
    "production_order_id" TEXT,
    "production_batch_id" TEXT,
    "created_by_user_id" TEXT NOT NULL,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "sausage_stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sausage_losses" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "item_kind" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "quantity_qty" DOUBLE PRECISION NOT NULL,
    "cost_amount" DOUBLE PRECISION,
    "cost_currency" TEXT,
    "production_order_id" TEXT,
    "production_batch_id" TEXT,
    "created_by_user_id" TEXT NOT NULL,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sausage_losses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sausage_raw_materials_company_id_idx" ON "sausage_raw_materials"("company_id");

-- CreateIndex
CREATE INDEX "sausage_finished_products_company_id_idx" ON "sausage_finished_products"("company_id");

-- CreateIndex
CREATE INDEX "sausage_recipes_company_id_idx" ON "sausage_recipes"("company_id");

-- CreateIndex
CREATE INDEX "sausage_clients_company_id_idx" ON "sausage_clients"("company_id");

-- CreateIndex
CREATE INDEX "sausage_production_orders_company_id_idx" ON "sausage_production_orders"("company_id");

-- CreateIndex
CREATE INDEX "sausage_production_batches_company_id_idx" ON "sausage_production_batches"("company_id");

-- CreateIndex
CREATE INDEX "sausage_stock_movements_company_id_idx" ON "sausage_stock_movements"("company_id");

-- CreateIndex
CREATE INDEX "sausage_losses_company_id_idx" ON "sausage_losses"("company_id");

-- AddForeignKey
ALTER TABLE "sausage_recipes" ADD CONSTRAINT "sausage_recipes_finished_product_id_fkey" FOREIGN KEY ("finished_product_id") REFERENCES "sausage_finished_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sausage_recipe_items" ADD CONSTRAINT "sausage_recipe_items_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "sausage_recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sausage_recipe_items" ADD CONSTRAINT "sausage_recipe_items_raw_material_id_fkey" FOREIGN KEY ("raw_material_id") REFERENCES "sausage_raw_materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

