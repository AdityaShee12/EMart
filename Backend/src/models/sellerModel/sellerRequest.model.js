import mongoose, { Schema } from "mongoose";

const sellerRequestSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "Buyer",
            required: true,
            unique: true,
            index: true
        },

        storeName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        storeDescription: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },

        storeLogo: {
            type: String,
            default: null,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        businessAddress: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        state: {
            type: String,
            required: true,
            trim: true
        },

        postalCode: {
            type: String,
            required: true,
            trim: true
        },

        country: {
            type: String,
            required: true,
            trim: true,
            default: "India"
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true
        },

        rejectionReason: {
            type: String,
            default: null,
            trim: true
        },

        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            default: null
        },

        reviewedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const SellerRequest = mongoose.model(
    "SellerRequest",
    sellerRequestSchema
);