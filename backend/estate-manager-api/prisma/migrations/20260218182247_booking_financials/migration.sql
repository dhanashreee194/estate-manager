/*
  Warnings:

  - Added the required column `advocateFee` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `builtUpSqft` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `builtUpValue` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cashAmount` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `govtAmount` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `govtSqMeter` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `govtValue` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gstAmount` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maintenanceFee` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marketRate` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mecbFee` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oneTimeMaint` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationFee` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stampDuty` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "advocateFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "builtUpSqft" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "builtUpValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "cashAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "govtAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "govtSqMeter" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "govtValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "gstAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "maintenanceFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "marketRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "mecbFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "oneTimeMaint" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "registrationFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "stampDuty" DOUBLE PRECISION NOT NULL;
