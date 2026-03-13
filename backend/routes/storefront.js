const express = require("express")
const router = express.Router()

const prisma = require("../utils/prisma")

router.get("/swatches/:productId", async (req,res)=>{

  const {productId} = req.params

  try{

    const swatches = await prisma.variantSwatch.findMany({
      where:{
        productId: productId.toString()
      }
    })

    res.json(swatches)

  }catch(err){

    console.error(err)

    res.status(500).json({
      error:"Failed to load swatches"
    })

  }

})

module.exports = router