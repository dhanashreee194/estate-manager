-- CreateTable
CREATE TABLE "DailyReport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "workDetails" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLabour" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "skilled" INTEGER NOT NULL,
    "men" INTEGER NOT NULL,
    "women" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,

    CONSTRAINT "DailyLabour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMaterial" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "size" TEXT,
    "stock" DOUBLE PRECISION NOT NULL,
    "consumed" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DailyMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPayment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DailyPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyGoods" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "DailyGoods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyReport_projectId_date_key" ON "DailyReport"("projectId", "date");

-- AddForeignKey
ALTER TABLE "DailyReport" ADD CONSTRAINT "DailyReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLabour" ADD CONSTRAINT "DailyLabour_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailyReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMaterial" ADD CONSTRAINT "DailyMaterial_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailyReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPayment" ADD CONSTRAINT "DailyPayment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailyReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyGoods" ADD CONSTRAINT "DailyGoods_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "DailyReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
