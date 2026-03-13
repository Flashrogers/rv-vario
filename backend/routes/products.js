const express = require("express")
const router = express.Router()
const prisma = require("../utils/prisma")

/**
 * GET /products?shop=...&page=1&search=...&status=...
 * Returns paginated product list for the admin UI
 */
router.get("/", async (req, res) => {
  const { shop, search = "", status = "", page = 1 } = req.query

  if (!shop) return res.status(400).json({ error: "Missing shop" })

  const PAGE_SIZE = 20
  const skip = (parseInt(page) - 1) * PAGE_SIZE

  try {
    const where = {
      shop,
      ...(search && {
        title: { contains: search, mode: "insensitive" }
      }),
      ...(status && { status })
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" }
      }),
      prisma.product.count({ where })
    ])

    res.json({
      products,
      total,
      page: parseInt(page),
      hasNext: skip + PAGE_SIZE < total,
      hasPrev: parseInt(page) > 1
    })
  } catch (err) {
    console.error("[products]", err)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

module.exports = router