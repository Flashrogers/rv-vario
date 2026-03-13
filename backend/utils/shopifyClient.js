const axios = require("axios")

const SHOP = process.env.SHOPIFY_SHOP
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN
const API_VERSION = "2024-01"

const shopify = axios.create({
 baseURL: `https://${SHOP}/admin/api/${API_VERSION}`,
 headers: {
  "X-Shopify-Access-Token": ACCESS_TOKEN,
  "Content-Type": "application/json"
 }
})

module.exports = shopify