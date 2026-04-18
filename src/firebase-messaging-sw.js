// Import Firebase scripts - using latest version compatible with @angular/fire v16
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

let messaging = null;

// Ensure configuration is fetched as a promise
const configPromise = fetch('/firebase-config.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch firebase-config.json');
    }
    return response.json();
  })
  .then(config => {
    console.log('[firebase-messaging-sw.js] Firebase config loaded from JSON');
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    if (!messaging) {
      messaging = firebase.messaging();
      
      // Handle background messages
      messaging.onBackgroundMessage(function (payload) {
        console.log('[firebase-messaging-sw.js] Received background message via Firebase');
        showCustomNotification(payload);
      });
    }
    return config;
  })
  .catch(error => {
    console.error('[firebase-messaging-sw.js] Failed to load Firebase config from JSON:', error);
  });

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

// Intercept push to handle waking up from sleep when fetch() hasn't completed
self.addEventListener('push', function(event) {
  // If we are already initialized BEFORE this push event, mapping is active. Let Firebase handle it.
  const isFirebaseReady = firebase.apps.length > 0;

  if (isFirebaseReady) {
    console.log('[firebase-messaging-sw.js] Push intercepted: Firebase is active. Let Firebase or our background listener handle it.');
    return;
  }

  console.log('[firebase-messaging-sw.js] Push intercepted: SW just woke up and Firebase is not ready. Handling manually.');

  event.waitUntil(
    configPromise.then(() => {
      let payload = null;
      try {
        if (event.data) {
          payload = event.data.json();
        }
      } catch (err) {
        console.error('[firebase-messaging-sw.js] Failed to parse push data manually', err);
      }

      if (!payload) return;

      console.log('[firebase-messaging-sw.js] Manual processing of push payload:', payload);
      return showCustomNotification(payload);
    }).catch(error => {
      console.error('[firebase-messaging-sw.js] Error processing push event manually:', error);
    })
  );
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