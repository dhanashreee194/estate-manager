/*
  Warnings:

  - You are about to drop the column `bhk` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `buildingId` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `floor` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `gatNumber` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `plotLength` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `plotWidth` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `washrooms` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `liftCount` on the `Wing` table. All the data in the column will be lost.
  - You are about to drop the column `totalFlats` on the `Wing` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Building" DROP CONSTRAINT "Building_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_buildingId_fkey";

-- DropForeignKey
ALTER TABLE "Wing" DROP CONSTRAINT "Wing_companyId_fkey";

-- DropIndex
DROP INDEX "Building_projectId_idx";

-- DropIndex
DROP INDEX "Unit_projectId_idx";

-- DropIndex
DROP INDEX "Unit_projectId_unitType_unitNumber_key";

-- DropIndex
DROP INDEX "Wing_buildingId_idx";

-- AlterTable
ALTER TABLE "Building" ALTER COLUMN "companyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "bhk",
DROP COLUMN "buildingId",
DROP COLUMN "floor",
DROP COLUMN "gatNumber",
DROP COLUMN "plotLength",
DROP COLUMN "plotWidth",
DROP COLUMN "washrooms";

-- AlterTable
ALTER TABLE "Wing" DROP COLUMN "liftCount",
DROP COLUMN "totalFlats",
ADD COLUMN     "liftsCount" INTEGER,
ALTER COLUMN "companyId" DROP NOT NULL,
ALTER COLUMN "hasLift" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wing" ADD CONSTRAINT "Wing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
