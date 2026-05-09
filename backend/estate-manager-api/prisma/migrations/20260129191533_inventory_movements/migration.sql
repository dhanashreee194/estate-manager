-- CreateTable
CREATE TABLE "InventoryInward" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryInward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryOutward" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryOutward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryInward_projectId_idx" ON "InventoryInward"("projectId");

-- CreateIndex
CREATE INDEX "InventoryInward_materialId_idx" ON "InventoryInward"("materialId");

-- CreateIndex
CREATE INDEX "InventoryOutward_projectId_idx" ON "InventoryOutward"("projectId");

-- CreateIndex
CREATE INDEX "InventoryOutward_materialId_idx" ON "InventoryOutward"("materialId");

-- AddForeignKey
ALTER TABLE "InventoryInward" ADD CONSTRAINT "InventoryInward_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryInward" ADD CONSTRAINT "InventoryInward_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryOutward" ADD CONSTRAINT "InventoryOutward_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryOutward" ADD CONSTRAINT "InventoryOutward_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
