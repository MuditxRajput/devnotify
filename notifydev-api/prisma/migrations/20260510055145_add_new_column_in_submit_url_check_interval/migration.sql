/*
  Warnings:

  - Added the required column `checkInterval` to the `submit_url` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "submit_url" ADD COLUMN     "checkInterval" INTEGER NOT NULL;
