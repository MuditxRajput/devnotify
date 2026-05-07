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
     const existedUser = await prisma.user.findUnique({email:normalizedEmail});
     if(!existedUser) return res.status(401).json({msg:'User not found',success:false});
    // check the password 
    const isPassword = bcrypt.compare(existedUser.password,password);
    if(!isPassword) return res.status(500).json({msg:'Password is wrong',success:false});

    // generate jwt...
    const jwt = await generateJWT({id : existedUser.id,email : email});
    if(!jwt.success) return res.status().json({msg:'Error in jwt fn',success:false});
    const refreshtoken = await generateRefreshToken();
  } catch (error) {
    
  }
})

export default authRouter;