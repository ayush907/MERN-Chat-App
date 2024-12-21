import express from "express"
import { adminLogin, adminLogout, allChats, allMessages, allUsers, getAdminData, getDashBoardStats } from "../controllers/admin.js"
import { adminLoginValidator, validateHandler } from "../lib/validators.js"
import { adminOnly } from "../middlewares/auth.js"

const app = express.Router()


app.post("/verify",adminLoginValidator(), validateHandler, adminLogin)

app.get("/logout", adminLogout)

// only admin can Access these Routes 

app.use(adminOnly)   // adminOnly middleware

app.get("/", getAdminData)

app.get("/users",allUsers)

app.get("/chats",allChats)

app.get("/messages", allMessages)

app.get("/stats", getDashBoardStats)

export default app