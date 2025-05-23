/*
  Warnings:

  - You are about to drop the column `llamaCloudOrgId` on the `organizations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "llamaCloudOrgId",
ADD COLUMN     "llamaCloudProjectId" TEXT,
ADD COLUMN     "llamaCloudProjectName" TEXT;
