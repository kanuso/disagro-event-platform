-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "productsDiscountPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "productsSubtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "servicesDiscountPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "servicesSubtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ALTER COLUMN "discountPercentage" SET DEFAULT 0,
ALTER COLUMN "discountAmount" SET DEFAULT 0;
