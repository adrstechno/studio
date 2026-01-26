/*
  Warnings:

  - A unique constraint covering the columns `[internId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'intern';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "internId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_internId_key" ON "users"("internId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_internId_fkey" FOREIGN KEY ("internId") REFERENCES "interns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
