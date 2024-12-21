import express from "express"
import { isAuthenticated } from "../middlewares/auth.js"
import { addMembers, deleteChat, getChatDetails, getMessages, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMembers, renameGroup, sendAttachMents } from "../controllers/chat.js"
import { attachmentsMulter } from "../middlewares/multer.js"
import { addMemberValidator, chatIdValidator, newGroupValidator, removeMemberValidator, renameValidator, sendAttachmentsValidator, validateHandler } from "../lib/validators.js"

const app = express.Router()



// after here user must be logged in to access these routes (server side protected routes)

app.use(isAuthenticated) //middleware for auth

app.post("/new", newGroupValidator(), validateHandler, newGroupChat)

app.get("/my", getMyChats)

app.get("/my/groups", getMyGroups)

app.put("/addmembers", addMemberValidator(), validateHandler, addMembers)

app.put("/removemember", removeMemberValidator(), validateHandler, removeMembers)

app.delete("/leave/:id",chatIdValidator(), validateHandler, leaveGroup)

// send Attachments 
app.post("/message", attachmentsMulter, sendAttachmentsValidator(), validateHandler, sendAttachMents)

// get messages
app.get("/message/:id", chatIdValidator(), validateHandler, getMessages)

// get chat details , rename, delete
app.route("/:id")
.get(chatIdValidator(), validateHandler, getChatDetails)
.put(renameValidator(), validateHandler, renameGroup)
.delete(chatIdValidator(), validateHandler, deleteChat)

export default app