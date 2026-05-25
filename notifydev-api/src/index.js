import 'dotenv/config'
import express from 'express'
import { checkDBConnection, connectDB } from "./db/connection.js";
import authRouter from './routes/auth/router.js';
import cors from 'cors'
import http from 'http'
const app = express();
import {Server} from 'socket.io'
import submit_url_route from './routes/submit_url/route.js';
import flakyRouter from './routes/test/flaky.js';
import dashboardApi from './routes/dashboard-api/route.js';
app.use(express.json());
app.use(cors());
app.get('/check', (req, res) => {
    res.json({ msg: 'Running' })
});
const server = http.createServer(app);
const io = new Server(server,{
    cors :{
        origin : 'http://localhost:3000'
    }
});
io.on('connection',(socket)=>{
    console.log('user connected');
    socket.emit('message','welcome');
})
io.engine.on('connection_error', (err) => {
    console.log('socket connection error:', err.message);
});
app.use('/v1/api/auth',authRouter);
app.use('/v1/api/user_url',submit_url_route);
app.use('/v1/api/dashboard',dashboardApi)
if (process.env.NODE_ENV !== 'production') {
  app.use('/v1/api/test', flakyRouter);
}
checkDBConnection().then(() => server.listen((8000), console.log('Sever is runing'))).catch((err) => console.log(err))