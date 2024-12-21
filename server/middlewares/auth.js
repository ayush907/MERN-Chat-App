import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./error.js";
import { adminSecretKey } from "../app.js"
import { User } from "../models/user.js";


// middleware for checking the user is authenticated or not ( if the user is authenticated then only he can access the protected routes)
export const isAuthenticated = TryCatch(async (req, res, next) => {

    const token = req.cookies['chattu-token']

    if (!token) {
        return next(new ErrorHandler("please login to access this route", 401))
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decodedData._id
    // console.log(req.user)  
    next()
})


// middleware for admin (if he is authenticated admin then only he can access Admin Routes)
export const adminOnly = TryCatch(async (req, res, next) => {

    const token = req.cookies["chattu-admin-token"]

    if (!token) {
        return next(new ErrorHandler("Only Admin Can Access This Route", 401))
    }

    const secretKey = jwt.verify(token, process.env.JWT_SECRET)

    const isMatched = secretKey === adminSecretKey

    if (!isMatched) {
        return next(new ErrorHandler("Only Admin Can Access This Route", 401))
    }

    next()
})


export const socketAuthenticator = async (err, socket, next) => {

    try {
        if (err) {
            return next(err)
        }
        const authToken = socket.request.cookies["chattu-token"]

        if (!authToken) {
            return next(new ErrorHandler("Please login to access this route", 401))
        }

        const decodedData = jwt.verify(authToken, process.env.JWT_SECRET)

        const user = await User.findById(decodedData._id)

        if(!user){
            return next(new ErrorHandler("Please login to access this route", 401))
        }

        socket.user = user

        return next()
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Please login to access this route", 401))
    }

}