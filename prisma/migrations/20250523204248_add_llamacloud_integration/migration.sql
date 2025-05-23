-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "llamaCloudApiKey" TEXT,
ADD COLUMN     "llamaCloudConnectedAt" TIMESTAMP(3),
ADD COLUMN     "llamaCloudOrgId" TEXT;
