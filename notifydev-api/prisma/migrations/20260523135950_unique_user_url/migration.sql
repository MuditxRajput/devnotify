/*
  Warnings:

  - A unique constraint covering the columns `[UserId,url]` on the table `url_table` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "url_table_UserId_url_key" ON "url_table"("UserId", "url");
