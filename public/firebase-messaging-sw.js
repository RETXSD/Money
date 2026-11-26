importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');

const configValue = new URL(self.location.href).searchParams.get('firebaseConfig');
const firebaseConfig = configValue ? JSON.parse(configValue) : {};
if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = payload.data?.title || 'Pengingat MTRCK';
    const body = payload.data?.body || 'Buka MTRCK untuk melihat ringkasan uangmu.';
    self.registration.showNotification(title, {
      body,
      icon: '/icons/mtrck-192.svg',
      badge: '/icons/mtrck-192.svg',
      data: { url: payload.data?.url || '/' },
    });
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const requestedUrl = event.notification.data?.url || '/';
  const targetUrl = new URL(requestedUrl, self.location.origin);
  const safeUrl = targetUrl.origin === self.location.origin ? targetUrl.href : self.location.origin;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const appWindow = clients.find(
        (client) => new URL(client.url).origin === self.location.origin,
      );
      if (appWindow) return appWindow.navigate(safeUrl).then((client) => client?.focus());
      return self.clients.openWindow(safeUrl);
    }),
  );
});
