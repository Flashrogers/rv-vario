const express = require("express")
const router = express.Router()

const syncProducts = require("../services/productSync")

router.get("/", async (req,res)=>{

  const shop = process.env.SHOPIFY_SHOP
  const token = process.env.SHOPIFY_ACCESS_TOKEN

  await syncProducts(shop,token)

  res.json({
    success:true,
    message:"Products synced"
  })

})

module.exports = router