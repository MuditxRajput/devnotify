import { Queue } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT) || 6379,
};

const url_queue = new Queue('url_queue', { connection });

const jobName = (id) =>`url:${id}`;
const jobId = (id) => `monitor-${id}`;
const jobPresent = async ({ id }) => {
  try {
    const repeatableJobs = await url_queue.getRepeatableJobs();
    const job = repeatableJobs.find(
      (j) => j.name === jobName(id) || j.id === jobId(id)
    );

    if (!job) return { present: false };

    return { present: true, key: job.key };
  } catch (error) {
    return { present: false, error: error.message };
  }
};

const removeJobIfPresent = async (id) => {
  const { present, key } = await jobPresent({ id });
  if (present && key) {
    await url_queue.removeRepeatableByKey(key);
  }
};
export const addUrl = async(urls,user_id)=>{
  try {
    await Promise.all(
      urls.map(async(row)=>{
        await removeJobIfPresent(row.id);
        await url_queue.add(jobName(row.id),{
          id : row.id,
          url:row.url,
          checkInterval : row.checkInterval,
          userId : user_id
        },
        {
          jobId : jobId(row.id),
          repeat :{
            every : row.checkInterval*1000,
            immediately : false,
          }
        }
      )
      })
    )
    return { msg: 'Job added successfully', success: true };
  } catch (error) {
    return { msg: error.message, success: false };
  }
}
