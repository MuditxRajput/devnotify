-- AlterTable
ALTER TABLE "url_table" ADD COLUMN     "consecutiveFailCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "consecutiveSuccessCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "downNotified" BOOLEAN NOT NULL DEFAULT false;
