const express = require("express")
const router = express.Router()
const prisma = require("../utils/prisma")

/**
 * GET /storefront/product-data?shop=...&productId=...
 * Returns variant→image mappings and swatch data for a product.
 * Called by the storefront JS if not using metafield injection.
 */
router.get("/product-data", async (req, res) => {
  const { shop, productId } = req.query

  if (!shop || !productId) {
    return res.status(400).json({ error: "Missing shop or productId" })
  }

  try {
    const [variantMaps, swatches, settings] = await Promise.all([
      prisma.variantImageMap.findMany({ where: { shop, productId } }),
      prisma.variantSwatch.findMany({ where: { shop, productId } }),
      prisma.appSettings.findFirst({ where: { shop } })
    ])

    // Build variantData object: { variantId: imageId }
    const variantData = {}
    variantMaps.forEach(m => {
      variantData[m.variantId] = m.imageId
    })

    // Build swatchData object: { variantId: { type, value } }
    const swatchData = {}
    swatches.forEach(s => {
      swatchData[s.variantId] = { type: s.type, value: s.value }
    })

    res.json({
      variantData,
      swatchData,
      settings: settings || {}
    })
  } catch (err) {
    console.error("[storefront]", err)
    res.status(500).json({ error: "Failed to fetch product data" })
  }
})

/**
 * GET /storefront/settings?shop=...
 * Returns public-facing app settings for the storefront script.
 */
router.get("/settings", async (req, res) => {
  const { shop } = req.query
  if (!shop) return res.status(400).json({ error: "Missing shop" })

  try {
    const settings = await prisma.appSettings.findFirst({ where: { shop } })
    res.json(settings || {})
  } catch (err) {
    console.error("[storefront/settings]", err)
    res.status(500).json({ error: "Failed to fetch settings" })
  }
})

module.exports = router