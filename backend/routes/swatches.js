const express = require("express")
const router = express.Router()

const prisma = require("../utils/prisma")

router.post("/save", async (req,res)=>{

  const {shop, productId, variantId, type, value} = req.body

  try{

    await prisma.variantSwatch.upsert({

      where:{
        variantId
      },

      update:{
        type,
        value
      },

      create:{
        shop,
        productId,
        variantId,
        type,
        value
      }

    })

    res.json({status:"saved"})

  }catch(err){

    console.error(err)

    res.status(500).json({
      error:"Failed to save swatch"
    })

  }

})

module.exports = router