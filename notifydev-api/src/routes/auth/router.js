import express from 'express'
import { prisma } from '../../db/db.js';
import bcrypt from 'bcrypt'
import { generateJWT, generateRefreshToken } from '../../helper/generateToken.js';
const authRouter = express.Router();

// signup router 
authRouter.post('/signup',async(req,res)=>{
  try {
    // get the data 
    const body = req.body ?? {};
    const { email, password } = body;
    // basic request validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required', success: false });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ msg: 'Invalid input types', success: false });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ msg: 'Invalid email format', success: false });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters', success: false });
    }
     
     // already present check 
    const existedUser = await prisma.user.findUnique({
        where:{
            email: normalizedEmail,
        }
     });
     if(existedUser) return res.status(409).json({ msg: 'User already present', success: false });
     // save user in the db..

     // hash the password 
     const hashedPassword = await bcrypt.hash(password,10);
     const saveUserInDb = await prisma.user.create({
        data:{
            email: normalizedEmail,
            password  : hashedPassword,
        }
     });
     if(!saveUserInDb) return res.status(500).json({ msg: 'Something went wrong', success: false });
     return res.status(201).json({msg:'User created',success:true});
  } catch (error) {
    console.error(error);
    return res.status(500).json({msg:error.message,success:false});
    
  }
});
authRouter.post('/login',async(req,res)=>{
  console.log('inside the login');
  
  try {
    const{email,password} = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required', success: false });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ msg: 'Invalid input types', success: false });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ msg: 'Invalid email format', success: false });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters', success: false });
    }
     // check existed user...
     const existedUser = await prisma.user.findUnique({where: {email:normalizedEmail}});
     if(!existedUser) return res.status(401).json({msg:'User not found',success:false});
    // check the password 
    const isPassword =await bcrypt.compare(password,existedUser.password);
    console.log(isPassword);
    
    if(!isPassword) return res.status(401).json({msg:'Password is wrong',success:false});

    // generate jwt...
    const accessToken = await generateJWT({id : existedUser.id,email : email});
    console.log(accessToken);
    
    if(!accessToken.success) return res.status(500).json({msg:'Error in jwt fn',success:false});
    const refreshtoken = await generateRefreshToken({id : existedUser.id,email : email});
    if(!refreshtoken.success) return res.status(500).json({msg:refreshtoken.error,success:false});
    // return res.status(201).json({msg:'User login successfully',refreshtoken, success:true});
    res.cookie('refreshToken',refreshtoken.refreshToken,{httpOnly:true,sameSite : 'strict',secure : process.env.NODE_ENV==='production'})
    .status(200)
    .json({msg:'User login successfully',accessToken : accessToken.token,success:true});
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({msg:error.message,success:false});
  }
})

export default authRouter;