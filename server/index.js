const express = require('express')
const bodyParser = require('body-parser')
const { Server } = require("socket.io")

const io = new Server({
    cors: true,
});
const app = express()

app.use(bodyParser.json())

const emailIdToSocketMapping  = new Map();
const socketToEmailMapping  = new Map();


io.on("connection", (socket) =>{
    socket.on("join-room", (data) =>{
        const {roomId, emailId} = data;
        console.log('User', emailId, "Joined Room", roomId)
        emailIdToSocketMapping.set(emailId, socket.id);
        socketToEmailMapping.set(socket.id, emailId);
        socket.join(roomId);
        socket.emit('joined-room',{roomId})
        socket.broadcast.to(roomId).emit('user-joined', {emailId})
    })

    socket.on('call-user', data =>{
        const {emailId, offer} = data;
        const fromEmail = socketToEmailMapping.get(socket.id);
        const socketId = emailIdToSocketMapping.get(emailId);
        socket.to(socketId).emit('incoming-call',{from :fromEmail, offer})
    })

    socket.on('call-accepted', data =>{
        const {emailId, ans} = data;
        const socketId = emailIdToSocketMapping.get(emailId)
        socket.to(socketId).emit('call-accepted',{ans})
    })
    socket.on('ice-candidate',(data) =>{
        const { candidate } = data;
        const socketId = emailIdToSocketMapping.get(data.emailId);
        socket.to(socketId).emit('ice-candidate', { candidate });
    })
    
})


app.listen(8000, () => console.log('Server is running'))
io.listen(8001)