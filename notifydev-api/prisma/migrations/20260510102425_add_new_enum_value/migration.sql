/*
  Warnings:

  - Changed the type of `responseTime` on the `user_url_status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "url_status" ADD VALUE 'pending';

-- AlterTable
ALTER TABLE "user_url_status" DROP COLUMN "responseTime",
ADD COLUMN     "responseTime" INTEGER NOT NULL;
