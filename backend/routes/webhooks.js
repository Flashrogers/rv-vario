const express = require("express")
const prisma = require("../utils/prisma")

const router = express.Router()

router.post("/app-uninstalled", async (req,res)=>{

 const shop = req.headers["x-shopify-shop-domain"]

 if(shop){

  await prisma.shop.delete({
   where:{shop}
  })

  console.log("App uninstalled:", shop)

 }

 res.sendStatus(200)

})

module.exports = router