import { body, validationResult, check, param, query } from "express-validator"
import { ErrorHandler } from "../utils/utility.js"


export const validateHandler = (req, res, next) => {

    const errors = validationResult(req)

    const errorMessages = errors.array().map((error) => (error.msg)).join(", ")

    console.log(errorMessages)

    if (errors.isEmpty()) {
        return next()
    } else {
        return next(new ErrorHandler(errorMessages, 400))
    }
}

export const registerValidator = () => [
    body("name", "Please Enter Name").notEmpty(),
    body("username", "Please Enter Username").notEmpty(),
    body("bio", "Please Enter Bio").notEmpty(),
    body("password", "Please Enter Password").notEmpty(),
    // check("avatar", "please Upload Avatar").notEmpty()
]

export const loginValidator = () => [
    body("username", "Please Enter Username").notEmpty(),
    body("password", "Please Enter Password").notEmpty(),
]

export const newGroupValidator = () => [
    body("name", "Please Enter Name").notEmpty(),
    body("members")
        .notEmpty().withMessage("Please Enter Members")
        .isArray({ min: 2, max: 100 }).withMessage("members must be between 2 to 100")
]

export const addMemberValidator = () => [
    body("chatId", "Please Enter Chat Id").notEmpty(),
    body("members")
        .notEmpty().withMessage("Please Enter Members")
        .isArray({ min: 1, max: 97 }).withMessage("members must be between 1 to 97")
]

export const removeMemberValidator = () => [
    body("chatId", "Please Enter Chat Id").notEmpty(),
    body("userId", "Please Enter User Id").notEmpty()
]


export const sendAttachmentsValidator = () => [
    body("chatId", "Please Enter Chat Id").notEmpty(),
    // check("files")
    //     .notEmpty().withMessage("Please Upload Attachments")
    //     .isArray({ min: 2, max: 5 }).withMessage("members must be between 1 to 5")
]

export const chatIdValidator = () => [      // (ye vaala leavegroup, getmesssges,getchatdetails) ke kaam aa jaayega
    param("id", "Please Enter Chat Id").notEmpty(),
]

export const renameValidator = () => [
    param("id", "Please Enter Chat Id").notEmpty(),
    body("name", "Please Enter new Name").notEmpty()
]

export const sendRequestValidator = () => [
    body("userId", "Please Enter User Id").notEmpty()
]

export const acceptRequestValidator = () => [
    body("requestId", "Please Enter Request Id").notEmpty(),
    body("accept")
        .notEmpty().withMessage("Please Add Accept")
        .isBoolean().withMessage("Accept must be a Boolean")
]

export const adminLoginValidator = () => [
    body("secretKey", "Please Enter Secret Key").notEmpty(),
]





