/*
  Warnings:

  - A unique constraint covering the columns `[shop,variantId]` on the table `VariantImageMap` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VariantImageMap_shop_variantId_key" ON "VariantImageMap"("shop", "variantId");
