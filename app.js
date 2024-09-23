const express = require('express');
const cors = require('cors');
const connectDB = require('./database');
const authRoutes = require('./routes/userRouter');
const socketIo = require('socket.io');
const http = require('http');
require('dotenv').config();
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors('*')); // Use cors middleware
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api', authRoutes);

const admin = require('firebase-admin');
const serviceAccount = require('./vr-websiteservice-Key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://vr-auth-default-rtdb.firebaseio.com",
});

// SOCKET------------------------------------------------------------
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*', // Allow all origins
        methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
});

console.log('SOCKET server is running');
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} joined room ${roomId}`);
    });

    socket.on('call', (data) => {
        console.log(`Call from ${data.from} to ${data.to}`);
        io.to(data.to).emit('incomingCall', { from: data.from });
    });

    socket.on('signal', (data) => {
        io.to(data.room).emit('signal', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Use server.listen
