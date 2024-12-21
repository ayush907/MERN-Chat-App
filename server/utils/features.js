import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import { v4 as uuid } from "uuid"
import { v2 as cloudinary } from "cloudinary"
import { getBase64, getSockets } from "../lib/helper.js"
import app from "../routes/user.js"


export const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: "none",
    httpOnly: true,
    secure: true
}

export const connectDB = (uri) => {
    mongoose.connect(uri, { dbName: "Chattu" })
        .then((conn) => {
            console.log(`Connected to MongoDB: ${conn.connection.host} and database ${conn.connections[0].name}`)
        }).catch((err) => {
            throw err
        })
}

export const sendToken = (res, user, code, message) => {

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)

    return res.status(code).cookie("chattu-token", token, cookieOptions).json({
        success: true,
        message,
        user
    })
}

export const emitEvent = (req, event, users, data) => {
    const io = req.app.get("io")
    const userSocket = getSockets(users)
    io.to(userSocket).emit(event, data)
    // console.log("emitting event...", event);
}

// function for uploadng files to cloudinary 
export const uploadFilesToCloudinary = async (files = []) => {
    const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                getBase64(file),
                {
                    resource_type: "auto",
                    public_id: uuid()
                },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(result);
                });
        });
    });

    try {
        const results = await Promise.all(uploadPromises)
        const formattedResults = results.map((result) => (
            {
                public_id: result.public_id,
                url: result.secure_url
            }
        ))
        return formattedResults;
    } catch (error) {
        throw new Error("error uploading files to cloudinary", error)
    }
}



export const deleteFilesFromCloudinary = async (public_ids) => {

}