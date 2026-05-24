// connect the worker with the redis
import "dotenv/config"
import { Worker } from "bullmq";
import { urlCall } from "./polling.js";
const connection = {
    host: process.env.REDIS_HOST || "redis",
    port: Number(process.env.REDIS_PORT) || 6379,
  };

const worker = new Worker(
    'url_queue',
    async(job)=>{
      console.log("worker process job", JSON.stringify(job.data));
       await urlCall(job);
        return {ok : true}
    },{connection,concurrency : 10},
);

worker.on("ready", () => {
    console.log("[worker] connected to redis and waiting for jobs...");
  });
  worker.on("completed", (job) => {
    console.log("[worker] completed:", job.id);
  });
  worker.on("failed", (job, err) => {
    console.error("[worker] failed:", job?.id, err.message);
  });
  process.on("SIGINT", async () => {
    await worker.close();
    process.exit(0);
  });
  