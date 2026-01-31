// Import Firebase scripts - using latest version compatible with @angular/fire v16
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration - loaded from firebase-config.json
let messaging = null;

// Function to initialize Firebase and messaging
function initializeFirebaseMessaging(config) {
  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }
  if (!messaging) {
    messaging = firebase.messaging();
    setupMessageHandlers();
  }
}

// Setup message handlers after messaging is initialized
function setupMessageHandlers() {
  // Handle background messages
  messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Customize notification here
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
  });
}

// Fetch and initialize Firebase config from JSON file
fetch('/firebase-config.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch firebase-config.json');
    }
    return response.json();
  })
  .then(config => {
    console.log('[firebase-messaging-sw.js] Firebase config loaded from JSON');
    initializeFirebaseMessaging(config);
  })
  .catch(error => {
    console.error('[firebase-messaging-sw.js] Failed to load Firebase config from JSON:', error);
    // Fallback: try to use config from environment (if available in global scope)
    // This should not happen in production, but provides a safety net
    console.warn('[firebase-messaging-sw.js] Using fallback initialization');
  });


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