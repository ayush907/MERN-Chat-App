import { envMode } from "../app.js"

export const errorMiddleware = (err, req, res, next)=>{

    err.message ||= "internal server error"
    err.statusCode ||= 500

    // Duplicate key vaala error handle karne ke liye
    if(err.code === 11000){
        const error = Object.keys(err.keyPattern).join(",")
        err.message = `Duplicate field - ${error}`
    }

    if(err.name === "CastError"){
        const errorPath = err.path
        err.message = `Invalid format of ${errorPath}`
        err.statusCode = 400
    }

    const response = {
        success: false,
        message: err.message,
    }

    if(envMode === "DEVELOPEMENT"){
        response.error = err
    }

    return res.status(err.statusCode).json(response)
}

export const TryCatch =(PassedFunc)=> async(req, res, next)=>{

    try {
        await PassedFunc(req, res, next)
    } catch (error) {
        next(error)
    }
}