const express = require("express")
const router = express.Router()

const shopify = require("../services/shopifyService")
const autoArrange = require("../services/ImageMatcher")
const prisma = require("../utils/prisma")

router.post("/", async(req,res)=>{

 try{

  const { productId, shop } = req.body

  const product = await shopify.getProduct(productId)

  const mappings = autoArrange(product.variants, product.images)

  const saved = []

  for(const variantId in mappings){

   const imageId = mappings[variantId]

   if(!imageId) continue

   const record = await prisma.variantImageMap.create({
    data:{
     shop,
     productId,
     variantId,
     imageId
    }
   })

   saved.push(record)
  }

  res.json({
   success:true,
   saved
  })

 }catch(err){
  res.status(500).json({error:err.message})
 }

})

module.exports = router