import { compare } from "bcrypt"
import { User } from "../models/user.js"
import { cookieOptions, emitEvent, sendToken, uploadFilesToCloudinary } from "../utils/features.js"
import { TryCatch } from "../middlewares/error.js"
import { ErrorHandler } from "../utils/utility.js"
import { Chat } from "../models/chat.js"
import { Request } from "../models/request.js"
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js"
import { getOtherMember } from "../lib/helper.js"


// function for registering a new user
export const newUser = TryCatch(async (req, res, next) => {

    const { name, username, password, bio } = req.body
    console.log(req.body)

    const file = req.file
    console.log(file)

    if (!file) {
        return next(new ErrorHandler("Please Upload Avatar...."))
    }

    const result = await uploadFilesToCloudinary([file])

    const avatar = {
        public_id: result[0].public_id,
        url: result[0].url,
    }

    const user = await User.create({
        name: name,
        username: username,
        password: password,
        avatar: avatar,
        bio: bio
    })

    sendToken(res, user, 201, "User created")
})

// function for user Login and send the token
export const login = TryCatch(
    async (req, res, next) => {

        const { username, password } = req.body
        const user = await User.findOne({ username }).select("+password")

        if (!user) {
            return next(new ErrorHandler("invalid Username or password", 404))
        }

        const isMatch = await compare(password, user.password)

        if (!isMatch) {
            return next(new ErrorHandler("invalid username or password", 404))
        }

        sendToken(res, user, 200, `welcome back ${user.name}`)
    }
)

// function for getting the profile of the logged in user
export const getMyprofile = TryCatch(async (req, res, next) => {

    const user = await User.findById(req.user)

    if (!user) {
        return next(new ErrorHandler("User not found", 404))
    }

    res.status(200).json({
        success: true,
        message: "getting profile successfully.....",
        user,
    })
})

// function for user Logout
export const logout = TryCatch(async (req, res, next) => {

    res.status(200).cookie("chattu-token", "", { ...cookieOptions, maxAge: 0 }).json({
        success: true,
        message: "Logout Successfully.....",
    })
})

// function for searching the user
export const searchUser = TryCatch(async (req, res, next) => {

    const { name } = req.query

    // finding all my chats 
    const myChats = await Chat.find({ groupChat: false, members: req.user })

    // extracting All users from my chat means friends or people I have chatted with.
    const allUsersFromMyChats = myChats.map((chat) => (chat.members)).flat();

    // finding all users except me and my friends
    const allUsersExceptMeAndFriends = await User.find({
        _id: { $nin: allUsersFromMyChats },
        name: { $regex: name, $options: 'i' },
    })

    // Modifying the response
    const users = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => (
        {
            _id,
            name,
            avatar: avatar.url,
        }
    ))

    res.status(200).json({
        success: true,
        message: name,
        users
    })
})

// function for handling Send friend Request
export const sendFriendRequest = TryCatch(async (req, res, next) => {

    const { userId } = req.body

    const request = await Request.findOne({
        $or: [
            { sender: req.user, receiver: userId },
            { sender: userId, receiver: req.user },
        ],
    });

    if (request) {
        return next(new ErrorHandler("request already sent", 400))
    }

    await Request.create({
        sender: req.user,
        receiver: userId
    })

    emitEvent(req, NEW_REQUEST, [userId])

    res.status(200).json({
        success: true,
        message: "Friend Request Sent...",
    })
})


export const acceptFriendRequest = TryCatch(async (req, res, next) => {

    const { requestId, accept } = req.body

    const request = await Request.findById(requestId)
        .populate("sender", "name")
        .populate("receiver", "name")

    console.log(request)

    if (!request) {
        return next(new ErrorHandler("Request not found", 404))
    }

    if (request.receiver._id.toString() !== req.user.toString()) {
        return next(new ErrorHandler("You are not authorized to accept this request", 401))
    }

    if (!accept) {
        await request.deleteOne()

        return res.status(200).json({
            success: true,
            message: "Request cancelled",
        })
    }
    const members = [request.sender._id, request.receiver._id]

    await Promise.all([
        Chat.create({ members, name: `${request.sender.name} - ${request.receiver.name}` }),
        request.deleteOne()
    ])

    emitEvent(req, REFETCH_CHATS, members)

    return res.status(200).json({
        success: true,
        message: "Friend Request accepted",
        senderId: request.sender._id
    })

})


export const getMyNotifications = TryCatch(async (req, res, next) => {

    const requests = await Request.find({ receiver: req.user }).populate(
        "sender",
        "name avatar"
    );

    const allRequests = requests.map(({ _id, sender }) => ({
        _id,
        sender: {
            _id: sender._id,
            name: sender.name,
            avatar: sender.avatar.url
        },
    }));


    return res.status(200).json({
        success: true,
        allRequests
    });

});


// function for getting the friends of the logged user
export const getMyFriends = TryCatch(async (req, res) => {
    const chatId = req.query.chatId;

    const chats = await Chat.find({
        members: req.user,
        groupChat: false,
    }).populate("members", "name avatar");

    const friends = chats.map(({ members }) => {
        const otherUser = getOtherMember(members, req.user);

        return {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar.url,
        };
    });

    if (chatId) {
        const chat = await Chat.findById(chatId);

        const availableFriends = friends.filter(
            (friend) => !chat.members.includes(friend._id)
        );

        return res.status(200).json({
            success: true,
            friends: availableFriends,
        });
    } else {
        return res.status(200).json({
            success: true,
            friends,
        });
    }
})
