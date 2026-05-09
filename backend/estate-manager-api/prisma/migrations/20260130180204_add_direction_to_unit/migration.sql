/*
  Warnings:

  - A unique constraint covering the columns `[projectId,unitType,unitNumber]` on the table `Unit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `Building` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Building" ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "facing" TEXT;

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "bhk" INTEGER,
ADD COLUMN     "direction" TEXT,
ADD COLUMN     "floor" INTEGER,
ADD COLUMN     "gatNumber" TEXT,
ADD COLUMN     "plotLength" DOUBLE PRECISION,
ADD COLUMN     "plotWidth" DOUBLE PRECISION,
ADD COLUMN     "washrooms" INTEGER,
ADD COLUMN     "wingId" TEXT;

-- CreateTable
CREATE TABLE "Wing" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalFloors" INTEGER NOT NULL,
    "totalFlats" INTEGER NOT NULL,
    "hasLift" BOOLEAN NOT NULL DEFAULT false,
    "liftCount" INTEGER,

    CONSTRAINT "Wing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Wing_buildingId_idx" ON "Wing"("buildingId");

-- CreateIndex
CREATE INDEX "Building_projectId_idx" ON "Building"("projectId");

-- CreateIndex
CREATE INDEX "Unit_projectId_idx" ON "Unit"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_projectId_unitType_unitNumber_key" ON "Unit"("projectId", "unitType", "unitNumber");

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wing" ADD CONSTRAINT "Wing_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wing" ADD CONSTRAINT "Wing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_wingId_fkey" FOREIGN KEY ("wingId") REFERENCES "Wing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
