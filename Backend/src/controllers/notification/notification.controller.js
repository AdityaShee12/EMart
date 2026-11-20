import Notification from "../../models/notification/notification.model.js"
import webpush from "../../config/webPush.js";

// 1. Get VAPID Public Key
export const getPublicKey = (req, res) => {
  try {

    return res.status(200).json({
      success: true,
      publicKey: process.env.VAPID_PUBLIC_KEY
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 2. Save Push Subscription
export const saveSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user"
      });
    }

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription"
      });
    }

    const savedSubscription = await Notification.findOneAndUpdate(
      {
        "subscription.endpoint": subscription.endpoint
      },
      {
        $set: {
          userId,
          subscription,
          deviceType: "web"
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Push subscription saved successfully",
      data: savedSubscription
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 3. Send Notification
export const sendNotification = async (req, res) => {
  try {
    const { userId, title, body, url } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "userId, title and body are required"
      });
    }

    const subscriptions = await Notification.find({ userId });

    if (!subscriptions.length) {
      return res.status(404).json({
        success: false,
        message: "No push subscription found for this user"
      });
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (item) => {
        try {
          await webpush.sendNotification(
            item.subscription,
            JSON.stringify({
              title,
              body,
              url: url || "/"
            })
          );

          return true;

        } catch (error) {
          // Expired or invalid subscription
          if (error.statusCode === 404 || error.statusCode === 410) {
            await Notification.findByIdAndDelete(item._id);
          }

          throw error;
        }
      })
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled"
    ).length;

    return res.status(200).json({
      success: true,
      message: "Notification sending completed",
      sentCount: successful,
      totalSubscriptions: subscriptions.length
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};