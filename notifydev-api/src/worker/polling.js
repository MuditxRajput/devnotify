import { createRequire } from "node:module";
import { prisma } from "../db/db.js";
import { redisClient } from "../redis/connection.js";
import { sendFailureMail, sendUpAgainMail } from "../helper/email/index.js";

// ESM default import does not expose Prisma enums; use CJS require
const require = createRequire(import.meta.url);
const { status: CheckStatus, Prisma } = require("@prisma/client");
const REQUEST_TIMEOUT_MS = 10_000;

export const urlCall = async (job) => {
    const start = Date.now();
  try {
    let dataAfterResponse;
    const response = await fetch(job.data.url,
        {
            method : 'GET',
            signal : AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
    );
    const responseTime = Date.now()-start;
    const dbStatus = response.status===200 ? CheckStatus.success : CheckStatus.failed;
    await prisma.url_status.create({
        data : {
            status : dbStatus,
            responseTime,
            url_tableId : job.data.id
        }
    })
    
    if(dbStatus===CheckStatus.success)
    {
        dataAfterResponse = await prisma.url_table.update({
            where:{
               id : job.data.id,
            },
            data: {
                consecutiveSuccessCount : {increment :1},
                consecutiveFailCount : 0,
            }
        })
    }
    else if(dbStatus===CheckStatus.failed)
    {
        dataAfterResponse= await prisma.url_table.update({
            where:{
                id : job.data.id,
            },
            data: {
                consecutiveFailCount : {increment : 1},
                consecutiveSuccessCount : 0
            }
        })
    }
    console.log("dataAfterResponse",dataAfterResponse);
    // save the latest data in the redis...
    const REDIS_KEY = `monitor:${job.data.userId}:${job.data.id}`;
    const redisObj = {
        status : dbStatus,
        responseTime,
        url : job.data.url,
        checkedAt : Date.now(),
        urlTableId : job.data.id,
    };
    await redisClient.set(REDIS_KEY,JSON.stringify(redisObj));
    const userInfo = await prisma.user.findUnique({
        where : {
            id : dataAfterResponse.UserId
        }
    });
    
    if(dataAfterResponse && dataAfterResponse.consecutiveFailCount >=5 && !dataAfterResponse.downNotified)
    {
        // update devnotify as true.
        if(userInfo && userInfo.email)
        {
            await sendFailureMail(userInfo.email,dataAfterResponse.url);
        }
        await prisma.url_table.update({
            where: { id : job.data.id},
            data :{
                downNotified : true,
            },
        })
        // send the notification via email that api is down
      
    }
    else if(dataAfterResponse && dataAfterResponse.consecutiveSuccessCount>=5 && dataAfterResponse.downNotified===true)
    {
        await prisma.url_table.update({
            where: { id : job.data.id},
            data :{
                downNotified : false,
            }
        })

        // send email that api is up
        if(userInfo && userInfo.email)
          await sendUpAgainMail(userInfo.email,dataAfterResponse.url)
    }
    console.log("check status", response.status,"response time",responseTime);
  } catch (error) {
    const REDIS_KEY = `monitor:${job.data.userId}:${job.data.id}`;
    console.error("urlCall error", error.message);
    const isTimeout = error.name==="TimeoutError" || error.name ==="AbortError";
    await prisma.url_status.create({
        data: {
            status : isTimeout ? CheckStatus.timeout : CheckStatus.failed ,
            responseTime : Date.now()-start,
            url_tableId: job.data.id,
        }
    })
    const failedcount = await prisma.url_table.update({
        where :{
            id : job.data.id,
        },
        data:{
            consecutiveFailCount : {increment : 1},
            consecutiveSuccessCount : 0
        }
    })
    console.log("failedCount",failedcount);
    
    //  now start working on redis...
    const redisObj = {
        status : isTimeout ? CheckStatus.timeout : CheckStatus.failed ,
        responseTime : Date.now()-start,
        url : job.data.url,
        checkedAt : Date.now(),
        urlTableId : job.data.id,
    }
   await redisClient.set(REDIS_KEY,JSON.stringify(redisObj));
   const userInfo = await prisma.user.findUnique({
    where : {
        id : failedcount.UserId,
    }
   })
   if(failedcount && failedcount.consecutiveFailCount>=5 && !failedcount.downNotified)
   {
    if(userInfo && userInfo.email)
        await sendFailureMail(userInfo.email,failedcount.url);
    await prisma.url_table.update({
        where: { id : job.data.id},
        data :{
            downNotified : true,
        }
    });
   
   }
   
    // check if thi key is present in the redis or not.
    
  }
};
