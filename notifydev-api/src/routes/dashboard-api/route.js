import express from 'express'
import { authMiddleware } from '../../helper/middlewares/authMiddleware.js';
import { prisma } from '../../db/db.js';
const dashboardApi = express.Router();

dashboardApi.get('/user/profile',authMiddleware,async(req,res)=>{
   try {
     const id= req.id;
     // validate user id 
     if(!id) return res.status(403).json({msg:'User not found',success:false});
     // get the user profile..
     const userInfo = await prisma.user.findUnique({
        where :{
            id : id,
        }
     });
     if(!userInfo) return res.status(500).json({msg:'user in not found in db',success:false});
     const {email} = userInfo;
     if(!email) return res.status(500).json({msg:'email is not found',success:false});
     return res.status(200).json({userEmail : email,success:true});
   } catch (error) {
    console.log(error.message);
    return res.status(500).json({msg:'Something went wrong',error:error.message,success:false});
    
   }
})


export default dashboardApi;