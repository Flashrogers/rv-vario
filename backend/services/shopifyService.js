const axios = require("axios");

const SHOP = process.env.SHOPIFY_SHOP;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const client = axios.create({
 baseURL: `https://${SHOP}/admin/api/2024-01`,
 headers: {
  "X-Shopify-Access-Token": TOKEN
 }
});

async function getProducts() {
 const res = await client.get("/products.json");
 return res.data.products;
}

async function getProduct(id) {
 const res = await client.get(`/products/${id}.json`);
 return res.data.product;
}

module.exports = {
 getProducts,
 getProduct
};