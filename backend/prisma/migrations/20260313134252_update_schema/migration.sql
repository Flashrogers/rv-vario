/*
  Warnings:

  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantImage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[shop,variantId,imageId]` on the table `VariantImageMap` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "VariantImageMap_shop_variantId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Store";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VariantImage";
PRAGMA foreign_keys=on;

-- CreateIndex
CREATE UNIQUE INDEX "VariantImageMap_shop_variantId_imageId_key" ON "VariantImageMap"("shop", "variantId", "imageId");
