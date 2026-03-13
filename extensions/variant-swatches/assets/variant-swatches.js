document.addEventListener("DOMContentLoaded", () => {

  const swatches = document.querySelectorAll(".rv-swatch")

  if (!swatches.length) return

  const galleryImages = document.querySelectorAll(
    '[id^="Slide-"], .product__media-item, .thumbnail'
  )

  function resetImages(){
    galleryImages.forEach(img=>{
      img.style.display = ""
    })
  }

  function showVariantImage(variantId){

    const variant = window.product?.variants?.find(
      v => v.id == variantId
    )

    if(!variant){
      resetImages()
      return
    }

    const imageSrc = variant.featured_image?.src

    if(!imageSrc){
      resetImages()
      return
    }

    galleryImages.forEach(img=>{

      const imgTag = img.querySelector("img")

      if(!imgTag) return

      if(imgTag.src.includes(imageSrc.split("/").pop())){
        img.style.display = ""
      }else{
        img.style.display = "none"
      }

    })

  }

  function setActiveSwatch(variantId){

    swatches.forEach(btn=>{
      if(btn.dataset.variantId == variantId){
        btn.classList.add("active")
      }else{
        btn.classList.remove("active")
      }
    })

  }

  /* -----------------------
     APP SWATCH CLICK
  ----------------------- */

  swatches.forEach(btn => {

    btn.addEventListener("click", () => {

      const variantId = btn.dataset.variantId

      setActiveSwatch(variantId)

      const variantInput = document.querySelector(
        'form[action*="/cart/add"] input[name="id"]'
      )

      if (variantInput){
        variantInput.value = variantId
      }

      const url = new URL(window.location.href)
      url.searchParams.set("variant", variantId)
      window.history.replaceState({}, "", url)

      showVariantImage(variantId)

    })

  })


  /* -----------------------
     THEME VARIANT PICKER
  ----------------------- */

  document.addEventListener("change", (e)=>{

    if(e.target.name === "id"){

      const variantId = e.target.value

      setActiveSwatch(variantId)

      showVariantImage(variantId)

    }

  })


  /* -----------------------
     PAGE LOAD
  ----------------------- */

  const params = new URLSearchParams(window.location.search)

  const currentVariant = params.get("variant")

  if(currentVariant){
    setActiveSwatch(currentVariant)
    showVariantImage(currentVariant)
  }

})