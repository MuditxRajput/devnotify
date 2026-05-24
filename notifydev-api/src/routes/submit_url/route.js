import express from 'express'
import { authMiddleware } from '../../helper/middlewares/authMiddleware.js';
import { prisma } from '../../db/db.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { status: CheckStatus } = require('@prisma/client');
import { addUrl } from '../../bullmq/queue.js';
const submit_url_route = express.Router();

submit_url_route.post('/url',authMiddleware,async(req,res)=>{
  try {
    const id = req.id;
    if(!id) return res.status(401).json({msg : 'User not found',success:false});
    const {urls} =  req.body;
    
    const dbSavedUrl = await prisma.$transaction(async(tx)=>{
       const savedUrlPromoise = urls?.map(async(item)=>{
       return await tx.url_table.upsert({
          where: {
            UserId_url: { UserId: id, url: item.url },
          },
          create: {
            url: item.url,
            checkInterval: item.checkInterval,
            UserId: id,
          },
          update: {
            checkInterval: item.checkInterval,
          },
        })
      })
      const saved_url = await Promise.all(savedUrlPromoise);
      // saved in the status table 
      await Promise.all(saved_url?.map(async(item)=>{
        await tx.url_status.create({
          data: {
            status : CheckStatus.pending,
            responseTime : 0,
            url_tableId : item.id,
          }
        })
      }))
      return saved_url;
    });
    const { msg, success } = await addUrl(dbSavedUrl, id);
    if (!success) {
      return res.status(500).json({ msg, success: false });
    }

    return res.status(201).json({ msg: 'Url submit successfully', success: true });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({msg:error.message,success:false});
    
  }
})


export default submit_url_route;