const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const cors=require('cors');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const ChatMessage = require('./models/chatMessageModel'); // make sure model is created
const dotenv=require('dotenv');
dotenv.config();
app.use(cors({
  origin: 'https://quillnest-nine.vercel.app',
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
  path: '/socket.io'
});




const port=process.env.PORT
require('./db')

//const allowedOrigins = [process.env.FRONTEND_URL]; // Add more origins as needed





//only urls provided above can send request to my backend
// app.use(
//     cors({
//         origin: function (origin, callback) {
//             if (!origin || allowedOrigins.includes(origin)) {
//                 callback(null, true);
//             }
//             else {
//                 callback(new Error('Not allowed by CORS'));
//             }
//         },
//         credentials: true
//     })
// ) 




app.use(bodyParser.json());


app.use(cookieParser({
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 7, //7 days here
    signed: true
}));


io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // When a user joins a classroom
  socket.on('join_classroom', (classroomId) => {
    socket.join(classroomId);
    console.log(`User ${socket.id} joined classroom ${classroomId}`);
  });

  // When a user sends a message
  socket.on('send_message', async ({ classroomId, senderId, content }) => {
    try {
      const message = new ChatMessage({ classroomId, sender: senderId, content });
      const savedMessage=await message.save();
      const populatedMessage = await ChatMessage.findById(savedMessage._id).populate('sender', 'name role');
      io.to(classroomId).emit('receive_message', populatedMessage);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


const authRoutes=require('./routes/authRoutes');
const classroomRoutes=require('./routes/classroomRoutes');
const userRoutes=require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const chatbotRoute = require('./routes/chatbot');


app.use('/auth',authRoutes);
app.use('/class',classroomRoutes);
app.use('/user',userRoutes);
app.use('/chat', chatRoutes);
app.use(chatbotRoute);

server.listen(port, ()=>{
    console.log(`Example app listening on port ${process.env.PORT}`)
})