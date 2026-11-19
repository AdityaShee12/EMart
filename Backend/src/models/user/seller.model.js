import mongoose, { Schema } from "mongoose";

const sellerProfileSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "Buyer",
            required: true,
            unique: true
        },

        storeName: {
            type: String,
            required: true,
            trim: true
        },

        storeDescription: {
            type: String,
            trim: true
        },

        storeLogo: {
            type: String,
            default: null
        },

        verificationStatus: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

export const SellerProfile = mongoose.model("SellerProfile", sellerProfileSchema);