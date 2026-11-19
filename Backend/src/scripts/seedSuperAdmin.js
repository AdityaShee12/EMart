import "dotenv/config";
import bcrypt from "bcryptjs";
import connectDB from "../db/index.js";
import { Admin } from "../models/user/admin.model.js";

const ALL_PERMISSIONS = [
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
];

const seedSuperAdmin = async () => {
    try {
        // MongoDB connect
        await connectDB();

        console.log("MongoDB connected.");

        const email = process.env.SUPERADMIN_EMAIL;
        const password = process.env.SUPERADMIN_PASSWORD;
        const name = process.env.SUPERADMIN_NAME || "Super Admin";

        // Environment variables check
        if (!email || !password) {
            throw new Error(
                "SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD is missing in .env"
            );
        }

        // Check existing admin
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            console.log(
                `Admin already exists with email: ${email}`
            );

            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create superadmin
        const superAdmin = await Admin.create({
            name,
            email,
            password: hashedPassword,

            role: "superadmin",

            status: "active",

            permissions: ALL_PERMISSIONS,

            isEmailVerified: true,

            twoFactorEnabled: false,

            twoFactorSecret: null,

            lastLoginAt: null,

            lastLoginIp: null,

            passwordChangedAt: null,

            failedLoginAttempts: 0,

            lockedUntil: null,

            createdBy: null
        });

        console.log("=================================");
        console.log("SUPERADMIN CREATED SUCCESSFULLY");
        console.log("=================================");

        console.log("ID:", superAdmin._id);
        console.log("Name:", superAdmin.name);
        console.log("Email:", superAdmin.email);
        console.log("Role:", superAdmin.role);
        console.log("Status:", superAdmin.status);

        console.log("=================================");

        process.exit(0);

    } catch (error) {
        console.error("Superadmin seed error:");
        console.error(error);

        process.exit(1);
    }
};

seedSuperAdmin();