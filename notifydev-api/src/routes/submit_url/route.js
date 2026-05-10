import express from 'express'
import { authMiddleware } from '../../helper/middlewares/authMiddleware.js';
import { prisma } from '../../db/db.js';
import { url_status } from '@prisma/client';
const submit_url_route = express.Router();

submit_url_route.post('/url',authMiddleware,async(req,res)=>{
  try {
    const id = req.id;
    if(!id) return res.status(401).json({msg : 'User not found',success:false});
    const {urls} =  req.body;
  
    

    await prisma.$transaction(async(tx)=>{
       const savedUrlPromoise = urls?.map(async(item)=>{
       return await tx.submit_url.create({
          data : {
            url : item.url,
            checkInterval : item.checkInterval,
            UserId : id
          }
        })
      })
      const saved_url = await Promise.all(savedUrlPromoise);
      // saved in the status table 
      await Promise.all(saved_url?.map(async(item)=>{
        await tx.user_url_status.create({
          data: {
            url_status : url_status.pending,
            responseTime : 0,
            submit_urlId : item.id,
          }
        })
      }))
      // tx.user_url_status.create

    })
    return res.status(201).json({msg:'Url submit successfully',success:true});
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({msg:error.message,success:false});
    
  }
})


export default submit_url_route;