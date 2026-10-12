-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('LABOUR', 'MATERIAL', 'BOTH');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('PORTAL_99ACRES', 'MAGICBRICKS', 'HOUSING', 'MAKAAN', 'FACEBOOK', 'INSTAGRAM', 'GOOGLE_ADS', 'WALK_IN', 'REFERRAL', 'BROKER', 'WEBSITE', 'WHATSAPP', 'OTHER');

-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('BANK', 'CASH', 'UPI', 'OTHER');

-- CreateEnum
CREATE TYPE "CashbookEntryType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "CashbookCategory" AS ENUM ('OPENING', 'BOOKING_RECEIPT', 'EXPENSE', 'VENDOR_PAYMENT', 'BROKER_COMMISSION', 'LAND_PURCHASE', 'JV_PAYOUT', 'TRANSFER', 'ADJUSTMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LandAcquisitionType" AS ENUM ('OUTRIGHT', 'JV', 'DEVELOPMENT_AGREEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "LandParcelStatus" AS ENUM ('PROSPECT', 'UNDER_NEGOTIATION', 'AGREED', 'REGISTERED', 'LINKED_TO_PROJECT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LandPartnerRole" AS ENUM ('LANDOWNER', 'INVESTOR', 'DEVELOPER', 'OTHER');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('LEAD_FOLLOW_UP', 'INSTALLMENT_DUE', 'INSTALLMENT_OVERDUE', 'MANUAL');

-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('WHATSAPP', 'SMS', 'IN_APP', 'MANUAL');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'DONE', 'SKIPPED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "InstallmentStatus" ADD VALUE 'PARTIAL';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPERVISOR';

-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "accountType" "BankAccountType" NOT NULL DEFAULT 'BANK',
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ifsc" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "balance" SET DEFAULT 0;

-- Default only backfills existing rows; Prisma sets updatedAt itself.
ALTER TABLE "BankAccount" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Broker" ADD COLUMN     "address" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "panNumber" TEXT;

-- AlterTable
ALTER TABLE "DailyGoods" ADD COLUMN     "materialId" TEXT,
ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "DailyLabour" ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "DailyMaterial" ADD COLUMN     "materialId" TEXT;

-- AlterTable
ALTER TABLE "DailyPayment" ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "DailyReport" ADD COLUMN     "checkedBy" TEXT,
ADD COLUMN     "meterFrom" DOUBLE PRECISION,
ADD COLUMN     "meterTo" DOUBLE PRECISION,
ADD COLUMN     "meterUnits" DOUBLE PRECISION,
ADD COLUMN     "siteName" TEXT;

-- AlterTable
ALTER TABLE "InventoryInward" ADD COLUMN     "invoiceNo" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "unitCost" DOUBLE PRECISION,
ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "Labour" ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "portalListingId" TEXT,
ADD COLUMN     "portalUrl" TEXT,
ADD COLUMN     "referredBy" TEXT,
ADD COLUMN     "sourceDetail" TEXT;

-- Convert the old free-text source in place so existing leads keep their value.
ALTER TABLE "Lead" ALTER COLUMN "source" TYPE "LeadSource" USING (
  CASE
    WHEN "source" IN ('PORTAL_99ACRES', 'MAGICBRICKS', 'HOUSING', 'MAKAAN', 'FACEBOOK', 'INSTAGRAM', 'GOOGLE_ADS', 'WALK_IN', 'REFERRAL', 'BROKER', 'WEBSITE', 'WHATSAPP', 'OTHER')
      THEN "source"::"LeadSource"
    ELSE 'OTHER'::"LeadSource"
  END
),
ALTER COLUMN "source" SET DEFAULT 'OTHER',
ALTER COLUMN "source" SET NOT NULL;

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "gstNumber" TEXT,
    "address" TEXT,
    "type" "VendorType" NOT NULL DEFAULT 'BOTH',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashbookEntry" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "type" "CashbookEntryType" NOT NULL,
    "category" "CashbookCategory" NOT NULL DEFAULT 'OTHER',
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "reference" TEXT,
    "projectId" TEXT,
    "paymentId" TEXT,
    "expenseId" TEXT,
    "transferGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashbookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerCommission" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "dealAmount" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "paidAmount" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrokerCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandPartner" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "panNumber" TEXT,
    "aadharNumber" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandParcel" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "surveyNumber" TEXT,
    "gatNumber" TEXT,
    "village" TEXT,
    "taluka" TEXT,
    "district" TEXT,
    "areaSqFt" DOUBLE PRECISION,
    "areaAcres" DOUBLE PRECISION,
    "acquisitionType" "LandAcquisitionType" NOT NULL DEFAULT 'OUTRIGHT',
    "status" "LandParcelStatus" NOT NULL DEFAULT 'PROSPECT',
    "purchasePrice" DOUBLE PRECISION,
    "agreementDate" TIMESTAMP(3),
    "registrationDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandParcel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandParcelPartner" (
    "id" TEXT NOT NULL,
    "landParcelId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "role" "LandPartnerRole" NOT NULL DEFAULT 'LANDOWNER',
    "sharePercent" DOUBLE PRECISION,
    "landShareSqFt" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "LandParcelPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandParcelPayment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "landParcelId" TEXT NOT NULL,
    "partnerId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "reference" TEXT,
    "bankAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandParcelPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "channel" "ReminderChannel" NOT NULL DEFAULT 'IN_APP',
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "phone" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vendor_companyId_idx" ON "Vendor"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CashbookEntry_paymentId_key" ON "CashbookEntry"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "CashbookEntry_expenseId_key" ON "CashbookEntry"("expenseId");

-- CreateIndex
CREATE INDEX "CashbookEntry_companyId_date_idx" ON "CashbookEntry"("companyId", "date");

-- CreateIndex
CREATE INDEX "CashbookEntry_bankAccountId_date_idx" ON "CashbookEntry"("bankAccountId", "date");

-- CreateIndex
CREATE INDEX "CashbookEntry_transferGroupId_idx" ON "CashbookEntry"("transferGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerCommission_bookingId_key" ON "BrokerCommission"("bookingId");

-- CreateIndex
CREATE INDEX "BrokerCommission_companyId_idx" ON "BrokerCommission"("companyId");

-- CreateIndex
CREATE INDEX "BrokerCommission_brokerId_idx" ON "BrokerCommission"("brokerId");

-- CreateIndex
CREATE INDEX "BrokerCommission_status_idx" ON "BrokerCommission"("status");

-- CreateIndex
CREATE INDEX "LandPartner_companyId_idx" ON "LandPartner"("companyId");

-- CreateIndex
CREATE INDEX "LandParcel_companyId_idx" ON "LandParcel"("companyId");

-- CreateIndex
CREATE INDEX "LandParcel_projectId_idx" ON "LandParcel"("projectId");

-- CreateIndex
CREATE INDEX "LandParcel_status_idx" ON "LandParcel"("status");

-- CreateIndex
CREATE INDEX "LandParcelPartner_partnerId_idx" ON "LandParcelPartner"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "LandParcelPartner_landParcelId_partnerId_key" ON "LandParcelPartner"("landParcelId", "partnerId");

-- CreateIndex
CREATE INDEX "LandParcelPayment_companyId_idx" ON "LandParcelPayment"("companyId");

-- CreateIndex
CREATE INDEX "LandParcelPayment_landParcelId_idx" ON "LandParcelPayment"("landParcelId");

-- CreateIndex
CREATE INDEX "LandParcelPayment_partnerId_idx" ON "LandParcelPayment"("partnerId");

-- CreateIndex
CREATE INDEX "LandParcelPayment_bankAccountId_idx" ON "LandParcelPayment"("bankAccountId");

-- CreateIndex
CREATE INDEX "Reminder_companyId_status_dueAt_idx" ON "Reminder"("companyId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "Reminder_companyId_type_idx" ON "Reminder"("companyId", "type");

-- CreateIndex
CREATE INDEX "Reminder_entityType_entityId_idx" ON "Reminder"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "BankAccount_companyId_idx" ON "BankAccount"("companyId");

-- CreateIndex
CREATE INDEX "Broker_companyId_idx" ON "Broker"("companyId");

-- CreateIndex
CREATE INDEX "DailyGoods_materialId_idx" ON "DailyGoods"("materialId");

-- CreateIndex
CREATE INDEX "DailyGoods_vendorId_idx" ON "DailyGoods"("vendorId");

-- CreateIndex
CREATE INDEX "DailyLabour_vendorId_idx" ON "DailyLabour"("vendorId");

-- CreateIndex
CREATE INDEX "DailyMaterial_materialId_idx" ON "DailyMaterial"("materialId");

-- CreateIndex
CREATE INDEX "DailyPayment_vendorId_idx" ON "DailyPayment"("vendorId");

-- CreateIndex
CREATE INDEX "InventoryInward_vendorId_idx" ON "InventoryInward"("vendorId");

-- CreateIndex
CREATE INDEX "Labour_vendorId_idx" ON "Labour"("vendorId");

-- CreateIndex
CREATE INDEX "Lead_companyId_source_idx" ON "Lead"("companyId", "source");

-- CreateIndex
CREATE INDEX "Lead_companyId_status_idx" ON "Lead"("companyId", "status");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Labour" ADD CONSTRAINT "Labour_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryInward" ADD CONSTRAINT "InventoryInward_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLabour" ADD CONSTRAINT "DailyLabour_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPayment" ADD CONSTRAINT "DailyPayment_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyGoods" ADD CONSTRAINT "DailyGoods_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashbookEntry" ADD CONSTRAINT "CashbookEntry_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashbookEntry" ADD CONSTRAINT "CashbookEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashbookEntry" ADD CONSTRAINT "CashbookEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashbookEntry" ADD CONSTRAINT "CashbookEntry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashbookEntry" ADD CONSTRAINT "CashbookEntry_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broker" ADD CONSTRAINT "Broker_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerCommission" ADD CONSTRAINT "BrokerCommission_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerCommission" ADD CONSTRAINT "BrokerCommission_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandPartner" ADD CONSTRAINT "LandPartner_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandParcel" ADD CONSTRAINT "LandParcel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandParcel" ADD CONSTRAINT "LandParcel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandParcelPartner" ADD CONSTRAINT "LandParcelPartner_landParcelId_fkey" FOREIGN KEY ("landParcelId") REFERENCES "LandParcel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandParcelPartner" ADD CONSTRAINT "LandParcelPartner_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "LandPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandParcelPayment" ADD CONSTRAINT "LandParcelPayment_landParcelId_fkey" FOREIGN KEY ("landParcelId") REFERENCES "LandParcel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandParcelPayment" ADD CONSTRAINT "LandParcelPayment_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "LandPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandParcelPayment" ADD CONSTRAINT "LandParcelPayment_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

