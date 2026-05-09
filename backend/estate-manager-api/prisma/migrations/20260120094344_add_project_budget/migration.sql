-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "gstAmount" DOUBLE PRECISION,
ADD COLUMN     "gstRate" DOUBLE PRECISION,
ADD COLUMN     "vendorGST" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "gstAmount" DOUBLE PRECISION,
ADD COLUMN     "gstRate" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ProjectBudget" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectBudget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectBudget_projectId_key" ON "ProjectBudget"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectBudget" ADD CONSTRAINT "ProjectBudget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
