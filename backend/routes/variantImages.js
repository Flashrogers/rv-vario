const express = require("express")
const router = express.Router()

const prisma = require("../utils/prisma")
const axios = require("axios")

const imageMatcher = require("../services/ImageMatcher")

/*
SAVE VARIANT IMAGE MAPPING
*/

router.post("/save", async (req,res)=>{

  const {shop,productId,assignments} = req.body

  try{

    for(const variantId in assignments){

      await prisma.variantImageMap.upsert({

        where:{
          shop_variantId:{
            shop,
            variantId
          }
        },

        update:{
          imageId:assignments[variantId]
        },

        create:{
          shop,
          productId,
          variantId,
          imageId:assignments[variantId]
        }

      })

    }

    res.json({status:"saved"})

  }catch(err){

    console.error(err)
    res.status(500).json({error:"Failed to save mapping"})

  }

})

/*
AUTO ARRANGE IMAGES
*/

router.post("/auto", async (req,res)=>{

  const {shop,productId} = req.body

  try{

    const store = await prisma.store.findUnique({
      where:{shop}
    })

    const product = await axios.get(
      `https://${shop}/admin/api/2024-04/products/${productId}.json`,
      {
        headers:{
          "X-Shopify-Access-Token":store.accessToken
        }
      }
    )

    const variants = product.data.product.variants
    const images = product.data.product.images

    const result = imageMatcher(variants,images)

    res.json(result)

  }catch(err){

    console.error(err)
    res.status(500).json({error:"Auto arrange failed"})

  }

})

module.exports = router