-- CreateTable
CREATE TABLE "sausage_sales_orders" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "client_id" TEXT,
    "client_name" TEXT,
    "external_order_id" TEXT,
    "status" TEXT NOT NULL,
    "requested_date" TEXT,
    "due_date" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sausage_sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sausage_sales_order_items" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "sales_order_id" TEXT NOT NULL,
    "finished_product_id" TEXT NOT NULL,
    "finished_product_name" TEXT NOT NULL,
    "quantity_qty" DOUBLE PRECISION NOT NULL,
    "reserved_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "produced_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shipped_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shortage_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sausage_sales_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sausage_finished_goods_reservations" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "sales_order_id" TEXT NOT NULL,
    "sales_order_item_id" TEXT NOT NULL,
    "finished_product_id" TEXT NOT NULL,
    "finished_product_name" TEXT NOT NULL,
    "quantity_qty" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "reason" TEXT,

    CONSTRAINT "sausage_finished_goods_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sausage_sales_orders_company_id_idx" ON "sausage_sales_orders"("company_id");

-- CreateIndex
CREATE INDEX "sausage_sales_order_items_sales_order_id_idx" ON "sausage_sales_order_items"("sales_order_id");

-- CreateIndex
CREATE INDEX "sausage_sales_order_items_company_id_idx" ON "sausage_sales_order_items"("company_id");

-- CreateIndex
CREATE INDEX "sausage_finished_goods_reservations_company_id_idx" ON "sausage_finished_goods_reservations"("company_id");

-- AddForeignKey
ALTER TABLE "sausage_sales_order_items" ADD CONSTRAINT "sausage_sales_order_items_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sausage_sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
