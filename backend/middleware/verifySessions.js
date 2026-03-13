function verifySession(req,res,next){

 const auth = req.headers.authorization;

 if(!auth){
  return res.status(401).json({error:"Missing token"});
 }

 next();
}

module.exports = verifySession;