-- Apply vendor + daily sheet + finance enhancements
-- Prefer: cd backend/estate-manager-api && yarn prisma db push

CREATE TYPE "VendorType" AS ENUM ('LABOUR', 'MATERIAL', 'BOTH');

CREATE TABLE IF NOT EXISTS "Vendor" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "gstNumber" TEXT,
  "address" TEXT,
  "type" "VendorType" NOT NULL DEFAULT 'BOTH',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Vendor_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Vendor_companyId_idx" ON "Vendor"("companyId");

ALTER TABLE "Labour" ADD COLUMN IF NOT EXISTS "vendorId" TEXT;
CREATE INDEX IF NOT EXISTS "Labour_vendorId_idx" ON "Labour"("vendorId");

ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "vendorId" TEXT;
CREATE INDEX IF NOT EXISTS "Expense_vendorId_idx" ON "Expense"("vendorId");

ALTER TABLE "InventoryInward" ADD COLUMN IF NOT EXISTS "unitCost" DOUBLE PRECISION;
ALTER TABLE "InventoryInward" ADD COLUMN IF NOT EXISTS "invoiceNo" TEXT;
ALTER TABLE "InventoryInward" ADD COLUMN IF NOT EXISTS "remarks" TEXT;
ALTER TABLE "InventoryInward" ADD COLUMN IF NOT EXISTS "vendorId" TEXT;
CREATE INDEX IF NOT EXISTS "InventoryInward_vendorId_idx" ON "InventoryInward"("vendorId");

ALTER TABLE "DailyLabour" ADD COLUMN IF NOT EXISTS "vendorId" TEXT;
CREATE INDEX IF NOT EXISTS "DailyLabour_vendorId_idx" ON "DailyLabour"("vendorId");

ALTER TABLE "DailyMaterial" ADD COLUMN IF NOT EXISTS "materialId" TEXT;
CREATE INDEX IF NOT EXISTS "DailyMaterial_materialId_idx" ON "DailyMaterial"("materialId");

ALTER TABLE "DailyPayment" ADD COLUMN IF NOT EXISTS "vendorId" TEXT;
CREATE INDEX IF NOT EXISTS "DailyPayment_vendorId_idx" ON "DailyPayment"("vendorId");

CREATE INDEX IF NOT EXISTS "BankAccount_companyId_idx" ON "BankAccount"("companyId");
