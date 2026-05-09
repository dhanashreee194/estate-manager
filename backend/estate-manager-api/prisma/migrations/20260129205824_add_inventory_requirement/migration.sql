-- CreateTable
CREATE TABLE "InventoryRequirement" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "requiredQty" DOUBLE PRECISION NOT NULL,
    "fulfilledQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryRequirement_projectId_idx" ON "InventoryRequirement"("projectId");

-- AddForeignKey
ALTER TABLE "InventoryRequirement" ADD CONSTRAINT "InventoryRequirement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryRequirement" ADD CONSTRAINT "InventoryRequirement_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
