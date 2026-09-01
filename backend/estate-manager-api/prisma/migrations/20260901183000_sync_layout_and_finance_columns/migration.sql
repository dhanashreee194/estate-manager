-- Sync columns that were applied locally via `db push` but never migrated.
-- These missing columns cause /projects and /dashboard to 500 in production.

-- Project layout map
ALTER TABLE "Project" ADD COLUMN "layoutRows" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "Project" ADD COLUMN "layoutCols" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "Project" ADD COLUMN "layoutImageUrl" TEXT;

-- Unit placement on layout map
ALTER TABLE "Unit" ADD COLUMN "layoutRow" INTEGER;
ALTER TABLE "Unit" ADD COLUMN "layoutCol" INTEGER;
CREATE INDEX "Unit_projectId_layoutRow_layoutCol_idx" ON "Unit"("projectId", "layoutRow", "layoutCol");

-- Payment / expense finance fields expected by Prisma client
ALTER TABLE "Payment" ADD COLUMN "bankAccountId" TEXT;
CREATE INDEX "Payment_bankAccountId_idx" ON "Payment"("bankAccountId");

ALTER TABLE "Expense" ADD COLUMN "description" TEXT;
ALTER TABLE "Expense" ADD COLUMN "vendorId" TEXT;
ALTER TABLE "Expense" ADD COLUMN "bankAccountId" TEXT;
CREATE INDEX "Expense_vendorId_idx" ON "Expense"("vendorId");
CREATE INDEX "Expense_bankAccountId_idx" ON "Expense"("bankAccountId");
