-- AlterTable
ALTER TABLE "DailyLabour" ADD COLUMN IF NOT EXISTS "skilledNames" TEXT[] DEFAULT ARRAY[]::TEXT[];
