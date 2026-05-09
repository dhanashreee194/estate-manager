/*
  Warnings:

  - You are about to alter the column `dailyWage` on the `Labour` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Labour" ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "dailyWage" SET DATA TYPE INTEGER;

-- AddForeignKey
ALTER TABLE "Labour" ADD CONSTRAINT "Labour_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
