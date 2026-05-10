import jwt from 'jsonwebtoken'
export const authMiddleware =(req,res,next)=>{
  try {
    const token = req['headers']['authorization'].split(' ')[1];
    console.log('token',token);
    if(!token) return res.status(401).json({mag:'unauthenicate user',success:false});
    // check the token.
    const verifyToken =  jwt.verify(token,`${process.env.JWT_SECRET}`);
    req.id = verifyToken.id;
    next();
  } catch (error) { 
    console.log(error.message);
    return res.status(500).json({msg:'Error in verify token',success:false});
    
  }
}