/*
  Warnings:

  - You are about to drop the column `gstAmount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `gstRate` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `stage` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "gstAmount",
DROP COLUMN "gstRate",
ADD COLUMN     "stage" TEXT NOT NULL;
