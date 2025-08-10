/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordSalt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codeSalt` to the `VerificationCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "password",
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "passwordSalt" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."VerificationCode" ADD COLUMN     "codeSalt" TEXT NOT NULL;
