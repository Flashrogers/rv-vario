const express = require("express")
const axios = require("axios")
const prisma = require("../utils/prisma")

const router = express.Router()

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET
const HOST = process.env.HOST

router.get("/install", async (req,res)=>{

 const shop = req.query.shop

 const redirect = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=read_products,write_products&redirect_uri=${HOST}/auth/callback`

 res.redirect(redirect)

})

router.get("/callback", async (req,res)=>{

 const {shop, code} = req.query

 const response = await axios.post(
   `https://${shop}/admin/oauth/access_token`,
   {
     client_id: SHOPIFY_API_KEY,
     client_secret: SHOPIFY_API_SECRET,
     code
   }
 )

 const accessToken = response.data.access_token

// Save shop in database
await prisma.shop.upsert({
  where: { shop },
  update: {
    accessToken
  },
  create: {
    shop,
    accessToken,
    scope: "read_products,write_products"
  }
})

console.log("Shop saved:", shop)

res.send("App Installed Successfully")

})

module.exports = router