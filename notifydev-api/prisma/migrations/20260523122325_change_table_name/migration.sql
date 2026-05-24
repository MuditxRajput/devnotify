/*
  Warnings:

  - You are about to drop the `submit_url` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_url_status` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "status" AS ENUM ('pending', 'success', 'timeout', 'failed');

-- DropForeignKey
ALTER TABLE "submit_url" DROP CONSTRAINT "submit_url_UserId_fkey";

-- DropForeignKey
ALTER TABLE "user_url_status" DROP CONSTRAINT "user_url_status_submit_urlId_fkey";

-- DropTable
DROP TABLE "submit_url";

-- DropTable
DROP TABLE "user_url_status";

-- DropEnum
DROP TYPE "url_status";

-- CreateTable
CREATE TABLE "url_table" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "checkInterval" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL,

    CONSTRAINT "url_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url_status" (
    "id" SERIAL NOT NULL,
    "status" "status" NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "url_tableId" INTEGER NOT NULL,

    CONSTRAINT "url_status_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "url_table" ADD CONSTRAINT "url_table_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "url_status" ADD CONSTRAINT "url_status_url_tableId_fkey" FOREIGN KEY ("url_tableId") REFERENCES "url_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
