require("dotenv").config()

const express = require("express")
const cors = require("cors")

const productsRoute = require("./routes/products")
const productRoute = require("./routes/product")
const variantImagesRoute = require("./routes/variantimages")
const autoArrangeRoute = require("./routes/autoArrange")
const swatchRoute = require("./routes/swatches")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/products", productsRoute)
app.use("/product", productRoute)
app.use("/variant-images", variantImagesRoute)
app.use("/auto-arrange", autoArrangeRoute)
app.use("/swatches", swatchRoute)

app.listen(process.env.PORT, () => {
 console.log(`Server running on port ${process.env.PORT}`)
})