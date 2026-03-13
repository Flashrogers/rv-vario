const express = require("express")
const axios = require("axios")

const router = express.Router()

router.get("/", async (req, res) => {

 try {

  const SHOP = process.env.SHOPIFY_SHOP
  const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

  console.log("SHOP:", SHOP)
  console.log("TOKEN:", TOKEN ? "Token Loaded" : "Token Missing")

  const response = await axios.get(
   `https://${SHOP}/admin/api/2024-01/products.json`,
   {
    headers: {
     "X-Shopify-Access-Token": TOKEN,
     "Content-Type": "application/json"
    }
   }
  )

  const products = response.data.products.map(product => ({
   id: product.id,
   title: product.title,
   image: product.image?.src || null,
   media: product.images.length,
   status: product.status
  }))

  res.json({ products })

 } catch (error) {

  console.log("SHOPIFY ERROR ↓↓↓")

  if (error.response) {
   console.log(error.response.status)
   console.log(error.response.data)
  } else {
   console.log(error.message)
  }

  res.status(500).json({
   error: "Failed to fetch products"
  })

 }

})

module.exports = router