-- 1️⃣ Create Enum
CREATE TYPE "MaterialUnit" AS ENUM (
  'BAG',
  'KG',
  'TON',
  'PIECE',
  'LITER',
  'BRASS'
);

-- 2️⃣ Add temporary column
ALTER TABLE "Material"
ADD COLUMN "unit_new" "MaterialUnit";

-- 3️⃣ Copy existing values (convert to uppercase first)
UPDATE "Material"
SET "unit_new" = UPPER("unit")::"MaterialUnit";

-- 4️⃣ Drop old column
ALTER TABLE "Material"
DROP COLUMN "unit";

-- 5️⃣ Rename new column
ALTER TABLE "Material"
RENAME COLUMN "unit_new" TO "unit";

-- 6️⃣ Make NOT NULL
ALTER TABLE "Material"
ALTER COLUMN "unit" SET NOT NULL;
