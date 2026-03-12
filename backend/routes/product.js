const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/:id", async (req, res) => {

  try {

    const productId = req.params.id;

    const response = await axios.get(
      `https://${process.env.SHOPIFY_SHOP}/admin/api/2024-01/products/${productId}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN
        }
      }
    );

    res.json(response.data.product);

  } catch (error) {

    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: "Failed to fetch product"
    });

  }

});

module.exports = router;