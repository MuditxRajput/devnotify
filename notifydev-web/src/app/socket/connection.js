import { io } from "socket.io-client";

export const socketConnection =()=>{
    const socket = io('http://localhost:8000');
    socket.on('connect',()=>{
        console.log("socket connection is setup...")
    })
    socket.on('connect_error', (err) => {
        console.error("socket connect error:", err.message);
    })
    socket.on('message',(data)=>{
        console.log(data);
        
    })
    return socket;
}


