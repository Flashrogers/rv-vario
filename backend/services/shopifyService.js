const axios = require("axios")

const baseURL = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01`

const client = axios.create({
 baseURL,
 headers: {
  "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
  "Content-Type": "application/json"
 }
})

async function getProducts(pageInfo = null) {

 let url = "/products.json?limit=20"

 if (pageInfo) {
  url += `&page_info=${pageInfo}`
 }

 const res = await client.get(url)

 return res.data.products
}

async function getProduct(productId) {

 const res = await client.get(`/products/${productId}.json`)

 return res.data.product
}

module.exports = {
 getProducts,
 getProduct
}