// Convert VAPID public key
// Convert VAPID Base64 URL key
export const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
};

// Register Service Worker
export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker not supported");
  }

  await navigator.serviceWorker.register(
    "/service-worker.js"
  );

  const registration =
    await navigator.serviceWorker.ready;

  console.log(
    "Service Worker State:",
    registration.active?.state
  );

  return registration;
};

// Subscribe User
export const subscribeToPush = async (notificationAPI) => {
  try {
    // 1. Browser Support Check
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      throw new Error("Push notification not supported");
    }

    // 2. Check Notification Permission
    let permission = Notification.permission;

    console.log("Notification Permission:", permission);

    if (permission === "denied") {
      throw new Error(
        "Notifications are blocked. Enable them from browser settings."
      );
    }

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      throw new Error("Notification permission not granted");
    }

    // 3. Register Service Worker
    const registration = await registerServiceWorker();

    await navigator.serviceWorker.ready;

    console.log(
      "Service Worker Activated:",
      registration.active?.state
    );

    // 4. Get VAPID Public Key
    const response = await notificationAPI.getPublicKey();

    const publicKey = response.data?.publicKey;

    if (!publicKey) {
      throw new Error("VAPID public key not found");
    }

    // 5. Convert VAPID Public Key
    const applicationServerKey =
      urlBase64ToUint8Array(publicKey);

    console.log("VAPID Key Length:", applicationServerKey.length);
    console.log("First Byte:", applicationServerKey[0]);

    // 6. Validate VAPID Key Format
    if (
      applicationServerKey.length !== 65 ||
      applicationServerKey[0] !== 4
    ) {
      throw new Error("Invalid VAPID public key format");
    }

    // 7. Validate P-256 Public Key
    try {
      const importedKey = await crypto.subtle.importKey(
        "raw",
        applicationServerKey,
        {
          name: "ECDSA",
          namedCurve: "P-256"
        },
        false,
        ["verify"]
      );

      console.log(
        "VAPID Key Validation: SUCCESS",
        importedKey
      );

    } catch (error) {
      console.error("VAPID Key Validation: FAILED", error);
      throw new Error("Invalid VAPID public key curve");
    }

    const pushPermission =
      await registration.pushManager.permissionState({
        userVisibleOnly: true,
        applicationServerKey
      });

    console.log("Push Manager Permission:", pushPermission);

    console.log(
      "Is Incognito / Private Mode:",
      window.chrome?.runtime?.id ? "Check browser mode" : "Unknown"
    );

    // 8. Check Existing Subscription
    let subscription =
      await registration.pushManager.getSubscription();

    console.log("Existing Subscription:", subscription);

    // 9. Create Subscription If Not Exists
    if (!subscription) {
      try {
        console.log("Creating New Push Subscription...");

        console.log("Origin:", window.location.origin);

        console.log(
          "Service Worker Scope:",
          registration.scope
        );

        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
          });

        console.log(
          "Subscription Created Successfully:",
          subscription
        );

      } catch (error) {
        console.error("Subscribe Error Name:", error.name);
        console.error("Subscribe Error Message:", error.message);
        console.error("Subscribe Full Error:", error);

        throw error;
      }
    }

    // 10. Save Subscription To Backend
    await notificationAPI.saveSubscription(
      subscription.toJSON()
    );

    console.log("Subscription Saved Successfully!");

    return subscription;

  } catch (error) {
    console.error("Push Subscription Error:", error);
    throw error;
  }
};