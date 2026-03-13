require("dotenv").config()

const express = require("express")
const cors = require("cors")

const productsRoute = require("./routes/products")
const productRoute = require("./routes/product")
const variantImagesRoute = require("./routes/variantImages")
const autoArrangeRoute = require("./routes/autoArrange")
const swatchRoute = require("./routes/swatches")
const storefrontRoute = require("./routes/storefront")
const syncRoute = require("./routes/sync")

const webhooks = require("./routes/webhooks")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/products", productsRoute)
app.use("/product", productRoute)
app.use("/variant-images", variantImagesRoute)
app.use("/auto-arrange", autoArrangeRoute)
app.use("/swatches", swatchRoute)
app.use("/storefront", storefrontRoute)
app.use("/sync-products", syncRoute)

app.use("/webhooks", webhooks)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`)
})