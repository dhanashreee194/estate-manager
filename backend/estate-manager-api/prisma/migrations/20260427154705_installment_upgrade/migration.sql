/*
  Warnings:

  - The values [COMPLETED] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'UPCOMING', 'DUE', 'OVERDUE', 'PAID', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('HOLD', 'BOOKED', 'PARTIAL_PAID', 'FULLY_PAID', 'REGISTERED', 'CANCELLED');
ALTER TABLE "Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'BOOKED';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UnitStatus" ADD VALUE 'HOLD';
ALTER TYPE "UnitStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bankAmount" DOUBLE PRECISION,
ADD COLUMN     "bookingAmount" DOUBLE PRECISION,
ADD COLUMN     "bookingNumber" TEXT,
ADD COLUMN     "brokerId" TEXT,
ADD COLUMN     "cancelDate" TIMESTAMP(3),
ADD COLUMN     "deductionAmount" DOUBLE PRECISION,
ADD COLUMN     "loanAmount" DOUBLE PRECISION,
ADD COLUMN     "refundAmount" DOUBLE PRECISION,
ADD COLUMN     "tokenAmount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "InstallmentPlan" ADD COLUMN     "overdueNoticeSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "penaltyAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderSentAt" TIMESTAMP(3),
ADD COLUMN     "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "installmentId" TEXT;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "InstallmentPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstallmentPlan" ADD CONSTRAINT "InstallmentPlan_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
