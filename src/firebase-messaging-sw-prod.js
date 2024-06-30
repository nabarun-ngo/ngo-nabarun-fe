import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js';
import { getMessaging, onBackgroundMessage, isSupported } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-sw.js';

const app = initializeApp({
    // apiKey: "AIzaSyBLw5Ry_9dUOFPbuwoiAzwII99CVMpz978",
    // authDomain: "nabarun-test.firebaseapp.com",
    // databaseURL: "https://nabarun-test-default-rtdb.firebaseio.com",
    // projectId: "nabarun-test",
    // storageBucket: "nabarun-test.appspot.com",
    // messagingSenderId: "595475200212",
    // appId: "1:595475200212:web:5fb71eac858442e0046341",
    // measurementId: "G-PT9V4XMXWY"
});

isSupported().then(isSupported => {

  if (isSupported) {

    const messaging = getMessaging(app);

    onBackgroundMessage(messaging, ({ notification: { title, body, image } }) => {
      //console.log(notification)
      self.registration.showNotification(title, { body, icon: image || '/assets/icons/icon-72x72.png' });
    });

  }

});