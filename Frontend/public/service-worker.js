self.addEventListener("push", (event) => {

  const data = event.data.json();

  const options = {
    body: data.body,

    icon: "/logo.png",

    badge: "/logo.png",

    data: {
      url: data.url || "/delivery/dashboard"
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      options
    )
  );

});

self.addEventListener("notificationclick", (event) => {

  event.notification.close();

  const url = event.notification.data.url;

  event.waitUntil(
    clients.openWindow(url)
  );

});