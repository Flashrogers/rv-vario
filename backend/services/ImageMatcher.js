/**
 * ImageMatcher Service
 * Automatically matches product images to variants based on:
 *  1. Image alt text containing the variant option value
 *  2. Image filename containing the variant option value
 *  3. Variant title matching image alt text
 *  4. Position-based fallback (first image per option value group)
 */

/**
 * @param {Array} variants  - Shopify product variants
 * @param {Array} images    - Shopify product images
 * @returns {Object}        - { [variantId]: imageId }
 */
function imageMatcher(variants, images) {
  const assignments = {}

  if (!variants || !images || images.length === 0) return assignments

  // Build a reverse map: option1 value → list of images that match it
  const optionImageMap = {}

  images.forEach(image => {
    const alt = (image.alt || "").toLowerCase().trim()
    const src = (image.src || "").toLowerCase()

    variants.forEach(variant => {
      const option1 = (variant.option1 || "").toLowerCase().trim()
      const option2 = (variant.option2 || "").toLowerCase().trim()
      const option3 = (variant.option3 || "").toLowerCase().trim()
      const title   = (variant.title  || "").toLowerCase().trim()

      const valuesToMatch = [option1, option2, option3, title].filter(Boolean)

      for (const value of valuesToMatch) {
        if (!value) continue

        // Match: alt text contains the variant value
        const altMatch = alt && (
          alt === value ||
          alt.includes(value) ||
          alt.replace(/[-_\s]/g, " ").includes(value.replace(/[-_\s]/g, " "))
        )

        // Match: filename contains the variant value
        const fileMatch = src && (
          src.includes(value.replace(/\s+/g, "-")) ||
          src.includes(value.replace(/\s+/g, "_")) ||
          src.includes(value.replace(/\s+/g, ""))
        )

        if (altMatch || fileMatch) {
          if (!optionImageMap[option1]) {
            optionImageMap[option1] = []
          }
          const alreadyAdded = optionImageMap[option1].some(i => i.id === image.id)
          if (!alreadyAdded) {
            optionImageMap[option1].push(image)
          }
          break
        }
      }
    })
  })

  // Assign best image to each variant
  variants.forEach(variant => {
    const option1 = (variant.option1 || "").toLowerCase().trim()
    const variantId = String(variant.id)

    // Already assigned via alt/filename match
    if (optionImageMap[option1] && optionImageMap[option1].length > 0) {
      // Pick the first matched image (most likely the primary one)
      assignments[variantId] = String(optionImageMap[option1][0].id)
      return
    }

    // Fallback: use variant.image_id if Shopify already linked one
    if (variant.image_id) {
      assignments[variantId] = String(variant.image_id)
      return
    }

    // Fallback: assign first product image to variants without a match
    if (images.length > 0 && !assignments[variantId]) {
      assignments[variantId] = String(images[0].id)
    }
  })

  return assignments
}

module.exports = imageMatcher