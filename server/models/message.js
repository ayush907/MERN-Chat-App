import mongoose, { Schema, Types, model } from "mongoose";

const schema = new Schema(
    {
        content: {
            type: String,
        },
        attachments: [
            {
                public_id: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
            }
        ],
        sender: {
            type: Types.ObjectId,
            ref: "User",
            require: true
        },
        chat: {
            type: Types.ObjectId,
            ref: "Chat",
            require: true
        },
    }, { timestamps: true })

export const Message = mongoose.models.Message || model("Message", schema)