const express = require("express")

const router = express.Router()

router.post("/app-uninstalled",(req,res)=>{

 console.log("App uninstall webhook received")

 res.sendStatus(200)

})

module.exports = router