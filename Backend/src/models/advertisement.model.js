import mongoose, { Schema } from "mongoose";

const advertisementSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        subtitle: {
            type: String,
            trim: true,
            maxlength: 300
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000
        },

        images: {
            type: [String],
            required: true,
            validate: {
                validator: function (images) {
                    return images.length >= 1 && images.length <= 5;
                },
                message: "Advertisement must have between 1 and 5 images"
            }
        },

        mobileImage: {
            type: String,
            default: null,
            trim: true
        },

        buttonText: {
            type: String,
            trim: true,
            default: "Shop Now"
        },

        buttonLink: {
            type: String,
            trim: true,
            default: "/products"
        },

        offerText: {
            type: String,
            trim: true,
            default: null
        },

        position: {
            type: String,
            enum: [
                "homepage",
                "category",
                "products"
            ],
            default: "homepage",
            index: true
        },

        status: {
            type: String,
            enum: [
                "draft",
                "active",
                "inactive",
                "expired"
            ],
            default: "draft",
            index: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        priority: {
            type: Number,
            default: 0,
            min: 0
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Advertisement = mongoose.model(
    "Advertisement",
    advertisementSchema
);