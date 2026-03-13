const express = require("express")
const prisma = require("../utils/prisma")

const router = express.Router()

router.post("/save", async (req,res)=>{

 const {shop,productId,variantId,type,value} = req.body

 try{

  const swatch = await prisma.variantSwatch.create({
   data:{
    shop,
    productId,
    variantId,
    type,
    value
   }
  })

  res.json(swatch)

 }catch(err){

  console.error(err)
  res.status(500).json({error:"Failed to save swatch"})

 }

})
router.get("/", (req,res)=>{
 res.json({message:"Swatch route working"})
})

module.exports = router