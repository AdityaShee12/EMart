import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        password: {
            type: String,
            required: true,
            select: false
        },

        avatar: {
            type: String,
            default: null
        },

        role: {
            type: String,
            enum: ["admin", "superadmin"],
            default: "admin",
            required: true,
            index: true
        },

        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active",
            index: true
        },

        permissions: [
            {
                type: String,
                enum: [
                    "dashboard.view",

                    "users.view",
                    "users.create",
                    "users.update",
                    "users.delete",

                    "sellers.view",
                    "sellers.approve",
                    "sellers.reject",
                    "sellers.suspend",

                    "products.view",
                    "products.create",
                    "products.update",
                    "products.delete",
                    "products.approve",
                    "products.reject",

                    "orders.view",
                    "orders.update",
                    "orders.cancel",

                    "payments.view",
                    "payments.refund",

                    "shipments.view",
                    "shipments.update",

                    "inventory.view",
                    "inventory.update",

                    "reviews.view",
                    "reviews.delete",

                    "categories.view",
                    "categories.create",
                    "categories.update",
                    "categories.delete",

                    "coupons.view",
                    "coupons.create",
                    "coupons.update",
                    "coupons.delete",

                    "admins.view",
                    "admins.create",
                    "admins.update",
                    "admins.delete",

                    "settings.view",
                    "settings.update",

                    "auditLogs.view"
                ]
            }
        ],

        isEmailVerified: {
            type: Boolean,
            default: false
        },

        twoFactorEnabled: {
            type: Boolean,
            default: false
        },

        twoFactorSecret: {
            type: String,
            select: false,
            default: null
        },

        lastLoginAt: {
            type: Date,
            default: null
        },

        lastLoginIp: {
            type: String,
            default: null
        },

        passwordChangedAt: {
            type: Date,
            default: null
        },

        failedLoginAttempts: {
            type: Number,
            default: 0
        },

        lockedUntil: {
            type: Date,
            default: null
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const Admin = mongoose.model("Admin", adminSchema);