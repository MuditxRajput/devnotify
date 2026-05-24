import { createClient } from 'redis';
export const redisClient = createClient({
    socket: {
        host :'redis',
        port : 6379
    }
});
redisClient.on('error',(err)=>{
    console.log('Redis error',err);
})

await redisClient.connect();