const express = require("express");
const router = express.Router();

const shopify = require("../services/shopifyService");

router.get("/:id", async (req,res)=>{

 try{

  const product = await shopify.getProduct(req.params.id);

  res.json(product);

 }catch(err){

  console.error(err);

  res.status(500).json({
   error:"Failed to fetch product"
  });

 }

});

module.exports = router;