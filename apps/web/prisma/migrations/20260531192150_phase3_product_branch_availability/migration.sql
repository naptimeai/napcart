-- CreateTable
CREATE TABLE "product_branch_availability" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "delivery_available" BOOLEAN NOT NULL DEFAULT true,
    "pickup_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_branch_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_branch_availability_branch_id_idx" ON "product_branch_availability"("branch_id");

-- CreateIndex
CREATE INDEX "product_branch_availability_product_id_idx" ON "product_branch_availability"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_branch_availability_product_id_branch_id_key" ON "product_branch_availability"("product_id", "branch_id");

-- AddForeignKey
ALTER TABLE "product_branch_availability" ADD CONSTRAINT "product_branch_availability_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_branch_availability" ADD CONSTRAINT "product_branch_availability_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
