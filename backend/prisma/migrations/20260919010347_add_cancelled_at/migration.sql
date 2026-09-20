-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ALTER COLUMN "confirmedAt" DROP NOT NULL,
ALTER COLUMN "confirmedAt" DROP DEFAULT;
