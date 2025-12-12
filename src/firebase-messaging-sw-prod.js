import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js';
import { getMessaging, onBackgroundMessage, isSupported } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-sw.js';

const app = initializeApp({
  apiKey: "AIzaSyD-kDzvTziMDGsDh40GJS3XVuL8A9_riQo",
  authDomain: "wengonabarun.firebaseapp.com",
  projectId: "wengonabarun",
  storageBucket: "wengonabarun.appspot.com",
  messagingSenderId: "496110742871",
  appId: "1:496110742871:web:ac779b109599ae719ae212",
  measurementId: "G-DY3169JJ99"
});


isSupported().then(isSupported => {

  if (isSupported) {

    const messaging = getMessaging(app);

    onBackgroundMessage(messaging, ({ notification: { title, body, image } }) => {
      ////console.log(notification)
      self.registration.showNotification(title, { body, icon: image || '/assets/icons/icon-72x72.png' });
    });

  }

});