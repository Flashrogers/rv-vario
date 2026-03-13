const axios = require("axios")
const prisma = require("../utils/prisma")

async function syncProducts(shop, token){

  let url = `https://${shop}/admin/api/2024-01/products.json?limit=250`

  while(url){

    const response = await axios.get(url,{
      headers:{
        "X-Shopify-Access-Token":token
      }
    })

    const products = response.data.products

    for(const product of products){

      await prisma.product.upsert({

        where:{
          id:product.id.toString()
        },

        update:{
          title:product.title,
          handle:product.handle,
          image:product.image?.src,
          media:product.images.length,
          status:product.status
        },

        create:{
          id:product.id.toString(),
          shop,
          title:product.title,
          handle:product.handle,
          image:product.image?.src,
          media:product.images.length,
          status:product.status
        }

      })

    }

    const link = response.headers.link

    if(link && link.includes("rel=\"next\"")){
      url = link.match(/<(.*?)>/)[1]
    }else{
      url = null
    }

  }

}

module.exports = syncProducts