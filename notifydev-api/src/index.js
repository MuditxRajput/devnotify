import 'dotenv/config'
import express from 'express'
import { checkDBConnection, connectDB } from "./db/connection.js";
import authRouter from './routes/auth/router.js';
import cors from 'cors'
import http from 'http'
const app = express();
import {Server} from 'socket.io'
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
checkDBConnection().then(() => server.listen((8000), console.log('Sever is runing'))).catch((err) => console.log(err))