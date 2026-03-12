function autoArrange(variants, images){

 const result = {}

 variants.forEach(v=>{
   result[v.id] = []
 })

 images.forEach(img => {

   variants.forEach(v => {

     const option = v.option1?.toLowerCase()

     if(img.src.toLowerCase().includes(option)){
        result[v.id].push(img.id)
     }

   })

 })

 return result
}

module.exports = autoArrange

function imageMatcher(variants,images){

  const result = {}

  variants.forEach(v => {

    result[v.id] = null

  })

  variants.forEach(variant => {

    const option = variant.option1?.toLowerCase()

    images.forEach(image => {

      if(image.src.toLowerCase().includes(option)){

        result[variant.id] = image.id

      }

    })

  })

  return result

}

module.exports = imageMatcher