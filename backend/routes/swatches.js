const express = require("express")
const router = express.Router()
const prisma = require("../utils/prisma")

/**
 * GET /swatches?shop=...&productId=...
 * Fetch all swatches for a product
 */
router.get("/", async (req, res) => {
  const { shop, productId } = req.query

  if (!shop || !productId) {
    return res.status(400).json({ error: "Missing shop or productId" })
  }

  try {
    const swatches = await prisma.variantSwatch.findMany({
      where: { shop, productId }
    })
    res.json(swatches)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch swatches" })
  }
})

/**
 * POST /swatches/save
 * Save swatches for multiple variants at once
 * Body: { shop, productId, swatches: [{ variantId, type, value }] }
 */
router.post("/save", async (req, res) => {
  const { shop, productId, swatches } = req.body

  if (!shop || !productId || !Array.isArray(swatches)) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    for (const swatch of swatches) {
      const { variantId, type, value } = swatch

      if (!variantId || !type || !value) continue

      const existing = await prisma.variantSwatch.findFirst({
        where: { shop, variantId }
      })

      if (existing) {
        await prisma.variantSwatch.update({
          where: { id: existing.id },
          data: { type, value }
        })
      } else {
        await prisma.variantSwatch.create({
          data: { shop, productId, variantId, type, value }
        })
      }
    }

    res.json({ status: "saved" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to save swatches" })
  }
})

/**
 * DELETE /swatches/:id
 * Delete a single swatch
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    await prisma.variantSwatch.delete({ where: { id: parseInt(id) } })
    res.json({ status: "deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to delete swatch" })
  }
})

module.exports = router