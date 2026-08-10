/*
  Warnings:

  - The values [FLUTTERWAVE] on the enum `PaymentProvider` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `coverLetter` on the `CareerApplication` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentProvider_new" AS ENUM ('PESAPAL', 'MTN_MOMO', 'AIRTEL_MONEY', 'STRIPE');
ALTER TABLE "Donation" ALTER COLUMN "provider" TYPE "PaymentProvider_new" USING ("provider"::text::"PaymentProvider_new");
ALTER TABLE "PaymentConfiguration" ALTER COLUMN "provider" TYPE "PaymentProvider_new" USING ("provider"::text::"PaymentProvider_new");
ALTER TYPE "PaymentProvider" RENAME TO "PaymentProvider_old";
ALTER TYPE "PaymentProvider_new" RENAME TO "PaymentProvider";
DROP TYPE "public"."PaymentProvider_old";
COMMIT;

-- AlterTable
ALTER TABLE "CareerApplication" DROP COLUMN "coverLetter";

-- AlterTable
ALTER TABLE "ContactMessage" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "updatedAt" DROP DEFAULT;
