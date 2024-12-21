import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { ErrorHandler } from "../utils/utility.js";
import jwt from "jsonwebtoken"
import {cookieOptions} from "../utils/features.js"
import { adminSecretKey } from "../app.js";

// function for admin Login
export const adminLogin = TryCatch(async(req, res, next )=>{

    const {secretKey} = req.body

    const isMatched = secretKey === adminSecretKey

    if(!isMatched){
        return next(new ErrorHandler("Invalid Admin Key", 401))
    }

    const token = jwt.sign(secretKey,process.env.JWT_SECRET)

    return res.status(200)
    .cookie("chattu-admin-token", token, {...cookieOptions, maxAge: 1000*60*15,})
    .json({success: true, message: "Authenticated Successfully Welcome Boss........"})

})


// function for admin logout 
export const adminLogout = TryCatch(async(req, res, next )=>{

    return res.status(200)
    .cookie("chattu-admin-token", "", {...cookieOptions, maxAge: 0})
    .json({success: true, message: "Admin Logout Successfully......"})

})
 

// function for getting the admin data
export const getAdminData = TryCatch(async(req, res, next )=>{
    
    return res.status(200).json({
        admin: true
    })

})


// function for getting all the users (admin sabhi users ko dekh sakta hai)
export const allUsers = TryCatch(async (req, res, next) => {

    const users = await User.find({})

    const transFormedUsers = await Promise.all(
        users.map(async ({ name, username, avatar, _id }) => {

            const [groups, friends] = await Promise.all([
                Chat.countDocuments({ groupChat: true, members: _id }),
                Chat.countDocuments({ groupChat: false, members: _id })
            ])

            return {
                name,
                username,
                avatar: avatar.url,
                _id,
                groups,
                friends
            }
        })
    )

    return res.status(200).json({
        success: true,
        users: transFormedUsers
    })
})


// function to get the total number of chats
export const allChats = TryCatch(async (req, res, next) => {

    const chats = await Chat.find({})
        .populate("members", "name avatar")
        .populate("creator", "name avatar");
    

    const transformedChats = await Promise.all(chats.map(async({members, _id, groupChat, name, creator})=>{

        const totalMessages = await Message.countDocuments({chat: _id})

        return {
            _id,
            groupChat,
            name,
            avatar: members.slice(0,3).map((member)=> (member.avatar.url)),
            members: members.map(({_id, name, avatar})=>{
                return {
                    _id, 
                    name,
                    avatar: avatar.url
                }
            }),
            creator: {
                name: creator?.name || "None",
                avatar: creator?.avatar.url || "",
            },
            totalMembers: members.length,
            totalMessages
        }

    }))


    return res.status(200).json({
        success: true,
        transformedChats
    })

})


// function for getting the total number of messages (Admin Dekh sakta hai sabhi messages ko)
export const allMessages = TryCatch(async(req, res, next) =>{

    const messages = await Message.find({})
    .populate("sender", "name avatar")
    .populate("chat", "groupChat")


    const transformMessages = messages.map(({content, attachments, _id, sender, createdAt, chat})=>{
        return {
            _id,
            attachments,
            content,
            createdAt,
            chat: chat._id,
            sender: {
                _id: sender._id,
                name: sender.name,
                avatar: sender.avatar.url
            },
        }
    })

    return res.status(200).json({
        success: true,
        messages: transformMessages
    })
})

// function for getting all the Stats for the dashBoard
export const getDashBoardStats = TryCatch(async(req, res, next) =>{

    const [groupsCount, usersCount, messagesCount, totalChatsCount] = await Promise.all([
        Chat.countDocuments({groupChat: true}),
        User.countDocuments(),
        Message.countDocuments(),
        Chat.countDocuments(),
    ])

    const today = new Date()

    const last7days = new Date()
    last7days.setDate(last7days.getDate() - 7)

    const last7daysMessages = await Message.find({
        createdAt:{
            $gte: last7days,
            $lte: today
        }
    }).select("createdAt")

    const messages = new Array(7).fill(0)

    const dayInMiliseconds = 1000 * 60 * 60 * 24

    last7daysMessages.forEach((message)=>{

        const indexApprox = (today.getTime()-message.createdAt.getTime())/dayInMiliseconds

        const index = Math.floor(indexApprox)

        messages[6 - index]++

    })
    
    const stats = {
        groupsCount,
        usersCount,
        messagesCount, 
        totalChatsCount,
        messagesChart: messages,
    }

    return res.status(200).json({
        success: true,
        stats
    })
})