function normalize(text) {
 return text.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function detectVariantImages(images, variants) {

 const mappings = []

 variants.forEach(variant => {

  const variantName = normalize(variant.title)

  images.forEach(image => {

   const filename = image.src.split("/").pop()
   const normalizedFilename = normalize(filename)

   if (normalizedFilename.includes(variantName)) {

    mappings.push({
     variantId: variant.id,
     imageUrl: image.src
    })

   }

  })

 })

 return mappings
}

module.exports = detectVariantImages