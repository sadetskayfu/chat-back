-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "passwordHash" DROP NOT NULL,
ALTER COLUMN "passwordSalt" DROP NOT NULL;
