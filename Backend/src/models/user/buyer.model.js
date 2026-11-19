import mongoose, { Schema } from "mongoose";

const buyerSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["buyer", "seller", "admin"],
            default: "buyer",
            required: true
        },

        avatar: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export const Buyer = mongoose.model("Buyer", buyerSchema);