function normalize(str){

 return str
  ?.toLowerCase()
  .replace(/[^a-z0-9]/g,"");

}

function matchImages(variants, images){

 const result = {};

 variants.forEach(variant => {

  const option = normalize(variant.option1);

  const image = images.find(img => 
   normalize(img.src).includes(option)
  );

  result[variant.id] = image ? image.id : null;

 });

 return result;
}

module.exports = matchImages;