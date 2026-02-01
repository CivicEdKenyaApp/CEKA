// Firebase Cloud Messaging Service Worker
// This file handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration - these are safe to include as they're public
firebase.initializeApp({
    apiKey: "AIzaSyAFETzixGJ9_-UPAzJI96ZlF4sfFUzrI7k",
    authDomain: "ceka-app.firebaseapp.com",
    projectId: "ceka-app",
    storageBucket: "ceka-app.appspot.com",
    messagingSenderId: "710537315921",
    appId: "1:710537315921:android:47847d8ad67fcc4b9fda70"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'CEKA Alert';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/logomark.svg',
        badge: '/logomark.svg',
        tag: payload.data?.tag || 'ceka-notification',
        data: payload.data,
        actions: [
            { action: 'open', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' }
        ],
        vibrate: [200, 100, 200],
        requireInteraction: payload.data?.priority === 'high'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event);
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Open the app or focus existing window
    const urlToOpen = event.notification.data?.link || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there's already a window open
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    if (event.notification.data?.link) {
                        client.navigate(event.notification.data.link);
                    }
                    return;
                }
            }
            // Open new window if none found
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
