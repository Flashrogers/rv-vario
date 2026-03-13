const express = require("express")
const axios = require("axios")
const crypto = require("crypto")

const prisma = require("../utils/prisma")

const router = express.Router()

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET
const HOST = process.env.HOST

/*
INSTALL APP
*/

router.get("/install", (req,res)=>{

 const shop = req.query.shop

 if(!shop){
  return res.status(400).send("Missing shop parameter")
 }

 const state = crypto.randomBytes(16).toString("hex")

 const redirectUrl =
  `https://${shop}/admin/oauth/authorize` +
  `?client_id=${SHOPIFY_API_KEY}` +
  `&scope=read_products,write_products` +
  `&redirect_uri=${HOST}/auth/callback` +
  `&state=${state}`

 res.redirect(redirectUrl)

})

/*
OAUTH CALLBACK
*/

router.get("/callback", async (req,res)=>{

 const {shop, code, hmac, state, ...rest} = req.query

 if(!shop || !code || !hmac){
  return res.status(400).send("Invalid OAuth request")
 }

 /*
 VERIFY HMAC
 */

 const message = Object.keys(rest)
  .sort()
  .map(key => `${key}=${rest[key]}`)
  .join("&")

 const generatedHash = crypto
  .createHmac("sha256", SHOPIFY_API_SECRET)
  .update(message)
  .digest("hex")

 if(generatedHash !== hmac){
  return res.status(400).send("HMAC validation failed")
 }

 try{

  /*
  EXCHANGE CODE FOR ACCESS TOKEN
  */

  const tokenResponse = await axios.post(
   `https://${shop}/admin/oauth/access_token`,
   {
    client_id: SHOPIFY_API_KEY,
    client_secret: SHOPIFY_API_SECRET,
    code
   }
  )

  const accessToken = tokenResponse.data.access_token

  /*
  SAVE STORE
  */

  await prisma.shop.upsert({

   where:{shop},

   update:{
    accessToken
   },

   create:{
    shop,
    accessToken,
    scope:"read_products,write_products"
   }

  })

  console.log("Shop installed:", shop)

  /*
  REGISTER UNINSTALL WEBHOOK
  */

  await axios.post(
   `https://${shop}/admin/api/2024-04/webhooks.json`,
   {
    webhook:{
     topic:"app/uninstalled",
     address:`${HOST}/webhooks/app-uninstalled`,
     format:"json"
    }
   },
   {
    headers:{
     "X-Shopify-Access-Token":accessToken
    }
   }
  )

  /*
  REDIRECT TO APP
  */

  res.redirect(`/app?shop=${shop}`)

 }catch(err){

  console.error("OAuth error:", err.response?.data || err)

  res.status(500).send("OAuth failed")

 }

})

module.exports = router