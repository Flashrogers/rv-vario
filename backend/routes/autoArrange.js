const express = require("express")
const router = express.Router()
const prisma = require("../utils/prisma")
const axios = require("axios")
const imageMatcher = require("../services/ImageMatcher")

/**
 * POST /auto-arrange
 * Auto-detect and assign images to all variants for a single product
 */
router.post("/", async (req, res) => {
  const { shop, productId } = req.body

  if (!shop || !productId) {
    return res.status(400).json({ error: "Missing shop or productId" })
  }

  try {
    const store = await prisma.shop.findUnique({ where: { shop } })
    if (!store) return res.status(401).json({ error: "Shop not found" })

    const response = await axios.get(
      `https://${shop}/admin/api/2024-04/products/${productId}.json`,
      { headers: { "X-Shopify-Access-Token": store.accessToken } }
    )

    const product = response.data.product
    const assignments = imageMatcher(product.variants, product.images)

    // Save all assignments
    for (const variantId in assignments) {
      const imageId = assignments[variantId]
      if (!imageId) continue

      await prisma.variantImageMap.upsert({
        where: { shop_variantId: { shop, variantId } },
        update: { imageId },
        create: { shop, productId, variantId, imageId }
      })
    }

    res.json({ status: "auto-arranged", assignments })
  } catch (err) {
    console.error("[autoArrange]", err)
    res.status(500).json({ error: "Auto arrange failed" })
  }
})

/**
 * POST /auto-arrange/bulk
 * Auto-arrange images for multiple products at once
 */
router.post("/bulk", async (req, res) => {
  const { shop, productIds } = req.body

  if (!shop || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: "Missing shop or productIds" })
  }

  const store = await prisma.shop.findUnique({ where: { shop } })
  if (!store) return res.status(401).json({ error: "Shop not found" })

  const results = []
  const errors = []

  for (const productId of productIds) {
    try {
      const response = await axios.get(
        `https://${shop}/admin/api/2024-04/products/${productId}.json`,
        { headers: { "X-Shopify-Access-Token": store.accessToken } }
      )

      const product = response.data.product
      const assignments = imageMatcher(product.variants, product.images)

      for (const variantId in assignments) {
        const imageId = assignments[variantId]
        if (!imageId) continue

        await prisma.variantImageMap.upsert({
          where: { shop_variantId: { shop, variantId } },
          update: { imageId },
          create: { shop, productId, variantId, imageId }
        })
      }

      results.push({ productId, count: Object.keys(assignments).length })
    } catch (err) {
      console.error(`[autoArrange/bulk] Failed for product ${productId}:`, err.message)
      errors.push({ productId, error: err.message })
    }
  }

  res.json({
    status: "bulk-arranged",
    processed: results.length,
    results,
    errors
  })
})

module.exports = router