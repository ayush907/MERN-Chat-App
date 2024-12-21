import express from "express"
import { acceptFriendRequest, getMyFriends, getMyNotifications, getMyprofile, login, logout, newUser, searchUser, sendFriendRequest } from "../controllers/user.js"
import {  singleAvatar } from "../middlewares/multer.js"
import { isAuthenticated } from "../middlewares/auth.js"
import { acceptRequestValidator, loginValidator, registerValidator, sendRequestValidator, validateHandler } from "../lib/validators.js"
const app = express.Router()


app.post("/new", singleAvatar, registerValidator(),validateHandler, newUser)   // register user
app.post("/login",loginValidator(), validateHandler, login)


// after here user must be logged in to access these routes (server side protected routes)

app.use(isAuthenticated)

app.get("/me",getMyprofile)

app.get("/logout", logout)

app.get("/search", searchUser)

app.put("/sendrequest", sendRequestValidator(), validateHandler, sendFriendRequest)

app.put("/acceptrequest", acceptRequestValidator(), validateHandler, acceptFriendRequest)  

app.get("/notifications", getMyNotifications)  

app.get("/friends", getMyFriends)  


export default app