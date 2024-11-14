/*
  Warnings:

  - You are about to drop the column `static` on the `Element` table. All the data in the column will be lost.
  - Added the required column `isStatic` to the `Element` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Element" DROP COLUMN "static",
ADD COLUMN     "isStatic" BOOLEAN NOT NULL;
