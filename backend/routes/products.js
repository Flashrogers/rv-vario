const express = require("express");
const router = express.Router();
const axios = require("axios");

/*
GET ALL PRODUCTS
*/

router.get("/", async (req, res) => {

  try {

    const shop = process.env.SHOPIFY_SHOP;
    const token = process.env.SHOPIFY_ACCESS_TOKEN;

    const response = await axios.get(
      `https://${shop}/admin/api/2024-04/products.json`,
      {
        headers: {
          "X-Shopify-Access-Token": token,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      products: response.data.products
    });

  } catch (error) {

    console.error(error.response?.data || error);

    res.status(500).json({
      error: "Failed to fetch products"
    });

  }

});


