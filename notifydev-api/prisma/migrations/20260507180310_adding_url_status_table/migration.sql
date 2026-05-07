-- CreateEnum
CREATE TYPE "url_status" AS ENUM ('success', 'timeout', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "current_status" (
    "id" SERIAL NOT NULL,
    "url_status" "url_status" NOT NULL,
    "responseTime" TIME NOT NULL,
    "UserId" INTEGER NOT NULL,

    CONSTRAINT "current_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "current_status" ADD CONSTRAINT "current_status_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
