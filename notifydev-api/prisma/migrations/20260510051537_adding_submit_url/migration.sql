/*
  Warnings:

  - You are about to drop the column `UserId` on the `user_url_status` table. All the data in the column will be lost.
  - Added the required column `submit_urlId` to the `user_url_status` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_url_status" DROP CONSTRAINT "user_url_status_UserId_fkey";

-- AlterTable
ALTER TABLE "user_url_status" DROP COLUMN "UserId",
ADD COLUMN     "submit_urlId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "submit_url" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "UserId" INTEGER NOT NULL,

    CONSTRAINT "submit_url_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "submit_url" ADD CONSTRAINT "submit_url_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_url_status" ADD CONSTRAINT "user_url_status_submit_urlId_fkey" FOREIGN KEY ("submit_urlId") REFERENCES "submit_url"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
