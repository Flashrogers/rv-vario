function normalize(str){
 return str
  ?.toLowerCase()
  .replace(/[^a-z0-9]/g,"")
}

function scoreMatch(option, imageName){

 const normalizedOption = normalize(option)
 const normalizedImage = normalize(imageName)

 if(!normalizedOption) return 0

 if(normalizedImage.includes(normalizedOption)){
  return normalizedOption.length
 }

 return 0
}

function imageMatcher(variants, images){

 const result = {}

 variants.forEach(variant => {

  const options = [
   variant.option1,
   variant.option2,
   variant.option3
  ].filter(Boolean)

  let bestScore = 0
  let bestImage = null

  images.forEach(img => {

   let score = 0

   options.forEach(option => {
    score += scoreMatch(option, img.src)
   })

   if(score > bestScore){
    bestScore = score
    bestImage = img
   }

  })

  result[variant.id] = bestImage ? bestImage.id : null

 })

 return result
}

module.exports = imageMatcher