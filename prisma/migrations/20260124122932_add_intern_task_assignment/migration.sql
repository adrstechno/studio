-- CreateEnum
CREATE TYPE "AssigneeType" AS ENUM ('Employee', 'Intern');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "assigneeType" "AssigneeType" NOT NULL DEFAULT 'Employee',
ADD COLUMN     "internId" TEXT,
ALTER COLUMN "assigneeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_internId_fkey" FOREIGN KEY ("internId") REFERENCES "interns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
