import express from "express"
import { connectDB } from "./utils/features.js"
import dotenv from "dotenv"
import { errorMiddleware } from "./middlewares/error.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { v2 as cloudinary } from "cloudinary"

import { Server } from "socket.io"
import { createServer } from "http"
import { v4 as uuid } from "uuid"

import { createUser } from "./seeders/user.js"
import { createGroupChats, createMessagesInAChat, createSingleChats } from "./seeders/chat.js"
import { CHAT_JOINED, CHAT_LEAVED, NEW_MESSAGE, NEW_MESSAGE_ALERT, ONLINE_USERS, START_TYPING, STOP_TYPING } from "./constants/events.js"
import { getSockets } from "./lib/helper.js"
import { Message } from "./models/message.js"
import { corsOptions } from "./constants/config.js"
import { socketAuthenticator } from "./middlewares/auth.js"

import userRoute from "./routes/user.js"
import chatRoute from "./routes/chat.js"
import adminRoute from "./routes/admin.js"
import { Error } from "mongoose"



dotenv.config()

const mongoURI = process.env.MONGO_URI
const port = process.env.PORT || 3000
export const adminSecretKey = process.env.ADMIN_SECRET_KEY || "jhgjgjhgjhghgfh"
export const envMode = process.env.NODE_ENV.trim() || "PRODUCTION"

const userSocketIDs = new Map()
const onlineUsers = new Set()


connectDB(mongoURI)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// createUser(10)
// createSingleChats(10)
// createGroupChats(10)
// createMessagesInAChat("674469067646c25bb43e4cbb", 50)

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: corsOptions,
})

app.set("io", io)

// middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))


app.get("/", (req, res) => {
    res.send("hello world....")
})


// using routes here 
app.use("/api/v1/user", userRoute)
app.use("/api/v1/chat", chatRoute)
app.use("/api/v1/admin", adminRoute)


// middleware for socket
io.use((socket, next) => {
    cookieParser()(
        socket.request,
        socket.request.res,
        async (err) => await socketAuthenticator(err, socket, next)
    );
})


//----Socket.io ka setup----
io.on("connection", (socket) => {

    // const user = {
    //     _id: "asdfs",
    //     name: "Namgooo"
    // }
    const user = socket.user
    // console.log(user)

    userSocketIDs.set(user._id.toString(), socket.id)

    // console.log(userSocketIDs)
    console.log(onlineUsers)

    // console.log("a user connected", socket.id)

    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {

        const messageForRealTime = {
            content: message,
            _id: uuid(),
            sender: {
                _id: user._id,
                name: user.name
            },
            chat: chatId,
            createdAt: new Date().toISOString()
        }

        const messageForDB = {
            content: message,
            sender: user._id,
            chat: chatId,
        }

        // console.log("emitting", messageForRealTime);
        // console.log("emitting", members);

        const membersSocket = getSockets(members)
        io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime
        })
        io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId })

        try {
            await Message.create(messageForDB)
        } catch (error) {
            // console.log(error);
            throw new Error(error)
        }

        console.log("New Message", messageForRealTime)
    })


    socket.on(START_TYPING, ({ members, chatId }) => {
        console.log("start typing...", members, chatId)

        const membersSockets = getSockets(members)

        socket.to(membersSockets).emit(START_TYPING, { chatId })
    })


    socket.on(STOP_TYPING, ({ members, chatId }) => {
        console.log("stop typing...", members, chatId)

        const membersSockets = getSockets(members)

        socket.to(membersSockets).emit(STOP_TYPING, { chatId })
    })


    // online users check 
    socket.on(CHAT_JOINED, ({userId, members}) => {

        onlineUsers.add(userId.toString())

        const membersSocket = getSockets(members)

        io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers))
    })


    socket.on(CHAT_LEAVED, ({userId, members}) => {
        onlineUsers.delete(userId.toString())

        const membersSocket = getSockets(members)

        io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers))
    })


    // jab client side se socket(user) disconnect hoga toh ye chalega
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id)
        userSocketIDs.delete(user._id.toString())
        onlineUsers.delete(user._id.toString())
        socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers))
    })
})


// this is the middleware for errors 
app.use(errorMiddleware)


server.listen(port, () => {
    console.log(`Server is running on port ${port} in ${envMode} Mode`)
})


// exports
export { userSocketIDs }