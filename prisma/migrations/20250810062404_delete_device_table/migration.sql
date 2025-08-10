/*
  Warnings:

  - The values [DEVICE] on the enum `VerificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isUsed` on the `VerificationCode` table. All the data in the column will be lost.
  - You are about to drop the `Device` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."VerificationType_new" AS ENUM ('EMAIL', 'PHONE');
ALTER TABLE "public"."VerificationCode" ALTER COLUMN "type" TYPE "public"."VerificationType_new" USING ("type"::text::"public"."VerificationType_new");
ALTER TYPE "public"."VerificationType" RENAME TO "VerificationType_old";
ALTER TYPE "public"."VerificationType_new" RENAME TO "VerificationType";
DROP TYPE "public"."VerificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Device" DROP CONSTRAINT "Device_userId_fkey";

-- AlterTable
ALTER TABLE "public"."VerificationCode" DROP COLUMN "isUsed";

-- DropTable
DROP TABLE "public"."Device";
