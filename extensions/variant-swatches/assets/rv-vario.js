/**
 * RV-VARIO Storefront Script
 * Handles: swatch rendering, variant switching, gallery filtering, color swatches
 */

;(function () {
  "use strict"

  // ─── Config ───────────────────────────────────────────────────────────────
  const RV = {
    shop: window.Shopify?.shop || "",
    product: window.rvProduct || window.product || null,
    variantData: window.rvVariantData || {},   // { variantId: imageId } injected by liquid
    settings: window.rvSettings || {},         // injected by liquid
    currentVariant: null,
    galleryImages: [],
    swatchEls: [],
  }

  // ─── DOM Helpers ──────────────────────────────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel)
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]

  // ─── Gallery Detection ────────────────────────────────────────────────────
  function detectGalleryImages() {
    // Support Dawn, Debut, Narrative, Sense, and common theme gallery selectors
    const selectors = [
      ".product__media-list img",
      ".product-single__photos img",
      ".product__photo-wrapper img",
      "[data-product-media-type-image] img",
      ".product-gallery img",
      ".product__media img",
      ".gallery-cell img",
      ".product-images img"
    ]

    for (const sel of selectors) {
      const imgs = $$(sel)
      if (imgs.length > 0) {
        return imgs
      }
    }
    return []
  }

  function detectGallerySlides() {
    const selectors = [
      ".product__media-item",
      ".product-single__photo",
      ".product__media-list > li",
      "[data-product-single-media-wrapper]",
      ".gallery-cell",
      ".product-media-container"
    ]

    for (const sel of selectors) {
      const slides = $$(sel)
      if (slides.length > 0) return slides
    }
    return []
  }

  // ─── Variant Selection ────────────────────────────────────────────────────
  function getVariantById(variantId) {
    if (!RV.product || !RV.product.variants) return null
    return RV.product.variants.find(v => String(v.id) === String(variantId)) || null
  }

  function selectVariant(variantId) {
    const variant = getVariantById(variantId)
    if (!variant) return

    RV.currentVariant = variant

    // 1. Update URL without reload
    const url = new URL(window.location.href)
    url.searchParams.set("variant", variantId)
    window.history.replaceState({}, "", url.toString())

    // 2. Dispatch variant change event (Shopify themes listen to this)
    document.dispatchEvent(
      new CustomEvent("variant:changed", {
        detail: { variant },
        bubbles: true
      })
    )

    // Also fire the event on the form for themes that need it
    const form = $("[data-product-form], form[action*='/cart/add']")
    if (form) {
      const input = form.querySelector("[name='id']")
      if (input) {
        input.value = variantId
        input.dispatchEvent(new Event("change", { bubbles: true }))
      }
    }

    // 3. Update add to cart button availability
    updateCartButton(variant)

    // 4. Update price
    updatePrice(variant)

    // 5. Filter gallery
    if (RV.settings.enableGalleryFilter !== false) {
      filterGallery(variantId)
    }

    // 6. Update swatch active states
    updateSwatchActiveStates(variantId)
  }

  function updateCartButton(variant) {
    const btn = $(
      "[data-add-to-cart], .btn--add-to-cart, [name='add'], .product-form__cart-submit"
    )
    if (!btn) return

    if (!variant.available) {
      btn.disabled = true
      btn.textContent = btn.dataset.unavailableText || "Sold Out"
    } else {
      btn.disabled = false
      btn.textContent = btn.dataset.addToCartText || "Add to Cart"
    }
  }

  function updatePrice(variant) {
    const priceEls = $$(
      "[data-product-price], .product__price, .price__regular, .product-single__price"
    )
    if (!priceEls.length || !variant.price) return

    const formatted = formatMoney(variant.price)
    priceEls.forEach(el => {
      el.innerHTML = formatted
    })

    // Compare-at price
    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      const compareEls = $$(
        "[data-compare-price], .product__price--compare, .price__compare"
      )
      compareEls.forEach(el => {
        el.innerHTML = formatMoney(variant.compare_at_price)
        el.style.display = ""
      })
    }
  }

  function formatMoney(cents) {
    const amount = (cents / 100).toFixed(2)
    const symbol = window.Shopify?.currency?.active === "EUR" ? "€" : "$"
    return `${symbol}${amount}`
  }

  // ─── Gallery Filtering ────────────────────────────────────────────────────
  function filterGallery(variantId) {
    const mappedImageId = RV.variantData[String(variantId)]
    const slides = detectGallerySlides()
    const imgs = detectGalleryImages()

    if (!mappedImageId) {
      // No mapping — show all images
      slides.forEach(slide => slide.style.display = "")
      return
    }

    if (slides.length > 0) {
      // Slide-based gallery (Dawn, Narrative, etc.)
      let firstVisible = null

      slides.forEach((slide, i) => {
        const img = slide.querySelector("img")
        const imageId = slide.dataset.mediaId ||
          slide.dataset.imageId ||
          img?.dataset?.mediaId ||
          img?.dataset?.imageId ||
          extractImageIdFromSrc(img?.src)

        const isMatch = imageId && String(imageId) === String(mappedImageId)

        if (RV.settings.filterMode === "show-only") {
          // Show only the matched image + unassigned images
          const isUnassigned = !isImageAssignedToAnyVariant(imageId)
          slide.style.display = (isMatch || isUnassigned) ? "" : "none"
        } else {
          // Default: highlight matched, dim others
          slide.style.opacity = isMatch ? "1" : "0.3"
        }

        if (isMatch && !firstVisible) firstVisible = slide
      })

      // Scroll to matched image
      if (firstVisible) {
        firstVisible.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })
      }
    } else if (imgs.length > 0) {
      // Image-only gallery
      imgs.forEach(img => {
        const imageId = extractImageIdFromSrc(img.src) || img.dataset.imageId
        const isMatch = imageId && String(imageId) === String(mappedImageId)
        img.style.opacity = isMatch ? "1" : "0.3"
      })
    }
  }

  function extractImageIdFromSrc(src) {
    if (!src) return null
    // Shopify CDN image URLs contain the image ID: /products/123456789_image.jpg
    const match = src.match(/\/(\d{10,})[_.]/)
    return match ? match[1] : null
  }

  function isImageAssignedToAnyVariant(imageId) {
    return Object.values(RV.variantData).some(id => String(id) === String(imageId))
  }

  // ─── Swatch Rendering ─────────────────────────────────────────────────────
  function renderSwatches() {
    const container = $("#rv-variant-swatches")
    if (!container || !RV.product) return

    container.innerHTML = ""

    RV.product.variants.forEach(variant => {
      const swatch = createSwatchElement(variant)
      container.appendChild(swatch)
      RV.swatchEls.push(swatch)
    })

    // Set initial active state
    const initialVariantId =
      new URLSearchParams(window.location.search).get("variant") ||
      (RV.product.variants[0] && RV.product.variants[0].id)

    if (initialVariantId) {
      updateSwatchActiveStates(initialVariantId)
      RV.currentVariant = getVariantById(initialVariantId)
    }
  }

  function createSwatchElement(variant) {
    const btn = document.createElement("button")
    btn.className = "rv-swatch"
    btn.dataset.variantId = variant.id
    btn.setAttribute("aria-label", variant.title)
    btn.setAttribute("type", "button")

    if (!variant.available) {
      btn.classList.add("out-of-stock")

      const settings = RV.settings
      if (settings.outOfStockStyle === "hidden") {
        btn.style.display = "none"
      } else if (settings.outOfStockStyle === "grey") {
        btn.style.opacity = "0.35"
        btn.style.cursor = "not-allowed"
      }

      if (settings.showOutOfStock === false) {
        btn.style.display = "none"
      }
    }

    // Determine swatch type
    const swatchInfo = getSwatchInfo(variant)

    if (swatchInfo.type === "color") {
      btn.classList.add("rv-swatch--color")
      btn.style.backgroundColor = swatchInfo.value
      btn.title = variant.title

      // Add strikethrough line for out-of-stock color swatches
      if (!variant.available && RV.settings.outOfStockStyle === "strikethrough") {
        const line = document.createElement("span")
        line.className = "rv-swatch__strikethrough"
        btn.appendChild(line)
      }
    } else if (swatchInfo.type === "image") {
      btn.classList.add("rv-swatch--image")
      const img = document.createElement("img")
      img.src = swatchInfo.value
      img.alt = variant.title
      img.loading = "lazy"
      btn.appendChild(img)
    } else {
      btn.classList.add("rv-swatch--button")
      btn.textContent = variant.option1 || variant.title
    }

    btn.addEventListener("click", () => {
      if (!variant.available && RV.settings.outOfStockStyle === "hidden") return
      selectVariant(variant.id)
    })

    return btn
  }

  function getSwatchInfo(variant) {
    // Check if we have a custom swatch saved
    const saved = RV.swatchData && RV.swatchData[String(variant.id)]
    if (saved) return saved

    // Auto-detect based on settings or option name
    const style = RV.settings.swatchStyle || "button"
    const optionName = (RV.product.options && RV.product.options[0]) || ""

    if (style === "color" || (style === "mixed" && /color|colour/i.test(optionName))) {
      // Try to map common color names to hex
      const colorHex = colorNameToHex(variant.option1)
      if (colorHex) {
        return { type: "color", value: colorHex }
      }
    }

    if (style === "image") {
      // Use the mapped image as the swatch thumbnail
      const imageId = RV.variantData[String(variant.id)]
      if (imageId) {
        const image = RV.product.images?.find(img => String(img.id) === String(imageId))
        if (image) {
          return { type: "image", value: image.src }
        }
      }
    }

    return { type: "button", value: variant.option1 || variant.title }
  }

  function updateSwatchActiveStates(activeVariantId) {
    RV.swatchEls.forEach(swatch => {
      const isActive = String(swatch.dataset.variantId) === String(activeVariantId)
      swatch.classList.toggle("active", isActive)
      swatch.setAttribute("aria-pressed", isActive ? "true" : "false")
    })
  }

  // ─── Color Name → Hex Map ─────────────────────────────────────────────────
  function colorNameToHex(name) {
    if (!name) return null
    const map = {
      black: "#000000", white: "#ffffff", red: "#e53e3e", blue: "#3182ce",
      green: "#38a169", yellow: "#ecc94b", orange: "#ed8936", purple: "#805ad5",
      pink: "#ed64a6", grey: "#a0aec0", gray: "#a0aec0", navy: "#1a365d",
      beige: "#f5f0e8", brown: "#744210", gold: "#d4a017", silver: "#c0c0c0",
      ivory: "#fffff0", cream: "#fffdd0", teal: "#319795", coral: "#fc8181",
      mint: "#9ae6b4", lavender: "#b794f4", khaki: "#c3b091", tan: "#d2b48c",
      maroon: "#7b0000", olive: "#556b2f", cyan: "#00bcd4", lime: "#cddc39",
      indigo: "#5c6bc0", turquoise: "#40e0d0", rose: "#f43f5e", amber: "#f59e0b",
    }
    return map[name.toLowerCase().trim()] || null
  }

  // ─── Hide Default Picker ──────────────────────────────────────────────────
  function hideDefaultVariantPicker() {
    if (RV.settings.hideDefaultPicker === false) return

    const selectors = [
      ".product-form__input--dropdown",
      ".product-single__variants",
      ".variant-selects",
      ".variant-radios",
      "[data-section-type='product-template'] select",
      ".selector-wrapper",
      ".single-option-selector",
      ".product-options",
      ".product-variants"
    ]

    selectors.forEach(sel => {
      $$(sel).forEach(el => {
        el.style.display = "none"
      })
    })
  }

  // ─── Inject Custom CSS ────────────────────────────────────────────────────
  function injectCustomCss() {
    const css = RV.settings.customCss
    if (!css) return
    const style = document.createElement("style")
    style.id = "rv-vario-custom-css"
    style.textContent = css
    document.head.appendChild(style)
  }

  // ─── Bulk Variant Mapping Support ─────────────────────────────────────────
  // Expose a global API for admin use (auto-arrange previews etc.)
  window.rvVario = {
    selectVariant,
    filterGallery,
    getCurrentVariant: () => RV.currentVariant,
    getProduct: () => RV.product,
    refresh: init
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  function init() {
    if (!RV.product) {
      console.warn("[RV-VARIO] No product data found. Ensure window.rvProduct is set.")
      return
    }

    injectCustomCss()
    hideDefaultVariantPicker()
    renderSwatches()

    // Handle initial variant from URL
    const urlVariantId = new URLSearchParams(window.location.search).get("variant")
    if (urlVariantId) {
      filterGallery(urlVariantId)
    }

    console.log("[RV-VARIO] Initialized for product:", RV.product.title)
  }

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()