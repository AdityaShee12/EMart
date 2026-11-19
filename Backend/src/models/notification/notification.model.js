import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        subscription: {
            endpoint: {
                type: String,
                required: true
            },

            keys: {
                p256dh: {
                    type: String,
                    required: true
                },
                auth: {
                    type: String,
                    required: true
                }
            }
        },

        deviceType: {
            type: String,
            default: "web"
        }
    },
    { timestamps: true }
);

notificationSchema.index(
    { "subscription.endpoint": 1 },
    { unique: true }
);

const Notification = mongoose.model(
    "Notification",
    notificationSchema
);

export default Notification;