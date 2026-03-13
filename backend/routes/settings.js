const express = require("express")
const router = express.Router()
const prisma = require("../utils/prisma")

// GET /settings?shop=...
router.get("/", async (req, res) => {
  const { shop } = req.query

  if (!shop) return res.status(400).json({ error: "Missing shop" })

  try {
    let settings = await prisma.appSettings.findFirst({ where: { shop } })

    if (!settings) {
      // Return defaults if no settings saved yet
      return res.json({
        applyMode: "tag",
        swatchStyle: "button",
        swatchSize: "medium",
        hideDefaultPicker: true,
        enableGalleryFilter: true,
        autoDetectImages: true,
        showOutOfStock: false,
        outOfStockStyle: "strikethrough",
        customCss: ""
      })
    }

    res.json(settings)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch settings" })
  }
})

// POST /settings/save
router.post("/save", async (req, res) => {
  const {
    shop,
    applyMode,
    swatchStyle,
    swatchSize,
    hideDefaultPicker,
    enableGalleryFilter,
    autoDetectImages,
    showOutOfStock,
    outOfStockStyle,
    customCss
  } = req.body

  if (!shop) return res.status(400).json({ error: "Missing shop" })

  try {
    const existing = await prisma.appSettings.findFirst({ where: { shop } })

    const data = {
      applyMode: applyMode || "tag",
      swatchStyle: swatchStyle || "button",
      swatchSize: swatchSize || "medium",
      hideDefaultPicker: hideDefaultPicker ?? true,
      enableGalleryFilter: enableGalleryFilter ?? true,
      autoDetectImages: autoDetectImages ?? true,
      showOutOfStock: showOutOfStock ?? false,
      outOfStockStyle: outOfStockStyle || "strikethrough",
      customCss: customCss || ""
    }

    if (existing) {
      await prisma.appSettings.update({
        where: { id: existing.id },
        data
      })
    } else {
      await prisma.appSettings.create({
        data: { shop, ...data }
      })
    }

    res.json({ status: "saved" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to save settings" })
  }
})

module.exports = router