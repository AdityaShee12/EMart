import webpush from "../config/webPush.js";

import PushSubscription from
  "../models/pushSubscription.model.js";

export const sendPushNotification = async (
  userId,
  notificationData
) => {

  const subscriptions = await PushSubscription.find({
    userId
  });

  const payload = JSON.stringify({
    title: notificationData.title,
    body: notificationData.body,
    url: notificationData.url
  });

  const results = await Promise.allSettled(

    subscriptions.map(async (item) => {

      try {

        await webpush.sendNotification(
          item.subscription,
          payload
        );

      } catch (error) {

        // Expired or invalid subscription
        if (
          error.statusCode === 404 ||
          error.statusCode === 410
        ) {

          await PushSubscription.deleteOne({
            _id: item._id
          });

        } else {

          throw error;

        }

      }

    })

  );

  return results;

};