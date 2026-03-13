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

  if(!shop || !productId || !assignments){
    return res.status(400).json({error:"Missing required fields"})
  }

  try{

    for(const variantId in assignments){

      const imageId = assignments[variantId]

      if(!imageId) continue

      await prisma.variantImageMap.upsert({

        where:{
          shop_variantId:{
            shop,
            variantId
          }
        },

        update:{
          imageId
        },

        create:{
          shop,
          productId,
          variantId,
          imageId
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

  if(!shop || !productId){
    return res.status(400).json({error:"Missing parameters"})
  }

  try{

    const store = await prisma.store.findUnique({
      where:{shop}
    })

    if(!store){
      return res.status(404).json({error:"Store not found"})
    }

    const productResponse = await axios.get(
      `https://${shop}/admin/api/2024-04/products/${productId}.json`,
      {
        headers:{
          "X-Shopify-Access-Token":store.accessToken
        }
      }
    )

    const product = productResponse.data.product

    const variants = product.variants
    const images = product.images

    const assignments = imageMatcher(variants,images)

    /*
    SAVE RESULT
    */

    for(const variantId in assignments){

      const imageId = assignments[variantId]

      if(!imageId) continue

      await prisma.variantImageMap.upsert({

        where:{
          shop_variantId:{
            shop,
            variantId
          }
        },

        update:{
          imageId
        },

        create:{
          shop,
          productId,
          variantId,
          imageId
        }

      })

    }

    res.json({
      status:"auto-arranged",
      assignments
    })

  }catch(err){

    console.error(err)
    res.status(500).json({error:"Auto arrange failed"})

  }

})

module.exports = router