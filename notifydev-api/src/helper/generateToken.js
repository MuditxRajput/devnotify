import jwt from 'jsonwebtoken';
export const generateJWT =async({id , email})=>{
    try {
      const payload ={
        id : id,
        email : email
      }
      const token = jwt.sign(payload,`${process.env.JWT_SECRET}`,{expiresIn : '1d'});
      if(!token) return {msg:'Error in generating token',success:false}
      return {token : token , success : true};
    } catch (error) {
        console.log('Error in generateJWT function ',error.message);
        return {error: error.message,success:false}
    }
}


export const generateRefreshToken =async({id,email})=>{
 try {
   const payload ={
    id,
    email
   }
   const refeshToken = jwt.sign(payload,`${process.env.REFRESH_JWT_SECRET}`,{expiresIn : '30d'});
   
 } catch (error) {
  
 }
}