/*
  Warnings:

  - You are about to drop the `current_status` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "current_status" DROP CONSTRAINT "current_status_UserId_fkey";

-- DropTable
DROP TABLE "current_status";

-- CreateTable
CREATE TABLE "user_url_status" (
    "id" SERIAL NOT NULL,
    "url_status" "url_status" NOT NULL,
    "responseTime" TIME NOT NULL,
    "UserId" INTEGER NOT NULL,

    CONSTRAINT "user_url_status_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_url_status" ADD CONSTRAINT "user_url_status_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
