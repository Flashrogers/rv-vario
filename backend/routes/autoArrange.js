const express = require("express")

const router = express.Router()

router.post("/", async (req,res)=>{

 try{

  res.json({message:"Auto arrange working"})

 }catch(err){

  console.error(err)

  res.status(500).json({
   error:"Auto arrange failed"
  })

 }

})

module.exports = router