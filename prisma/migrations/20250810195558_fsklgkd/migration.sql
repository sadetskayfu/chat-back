/*
  Warnings:

  - You are about to drop the column `ip` on the `RefreshToken` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Made the column `userAgent` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."RefreshToken" DROP COLUMN "ip",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "userAgent" SET NOT NULL;
