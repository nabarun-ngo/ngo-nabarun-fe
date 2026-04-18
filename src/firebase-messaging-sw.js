// Import Firebase scripts - using latest version compatible with @angular/fire v16
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Extract Firebase config from script URL query parameters
const params = new URL(location).searchParams;
const config = {
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId')
};

console.log('[firebase-messaging-sw.js] Initializing with params:', config.projectId);

let messaging = null;

if (config.apiKey && config.appId) {
  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }
  messaging = firebase.messaging();
  
  // Handle background messages
  messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message via Firebase');
    showCustomNotification(payload);
  });
} else {
  console.error('[firebase-messaging-sw.js] Missing required Firebase config parameters.');
}

function showCustomNotification(payload) {
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationBody = payload.notification?.body || payload.data?.body || 'You have a new notification';
  const notificationIcon = payload.notification?.icon || '/assets/icons/icon-192x192.png';
  const notificationImage = payload.notification?.image;

  const notificationOptions = {
    body: notificationBody,
    icon: notificationIcon,
    badge: '/assets/icons/icon-96x96.png',
    image: notificationImage,
    data: payload.data || {},
    tag: payload.data?.tag || 'default',
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
    actions: payload.data?.actions || [],
    timestamp: Date.now()
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
}


// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  // Handle action clicks
  if (event.action) {
    // Handle specific action
    const actionUrl = event.notification.data?.actions?.find(a => a.action === event.action)?.url;
    if (actionUrl) {
      event.waitUntil(clients.openWindow(actionUrl));
      return;
    }
  }

  // Default: open the app
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});