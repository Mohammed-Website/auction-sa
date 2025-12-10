// Basic Service Worker for PWA
// This enables Progressive Web App functionality

// Install event - fires when the service worker is first installed
self.addEventListener('install', (event) => {
    // Skip waiting means the new service worker will activate immediately
    // instead of waiting for all tabs to close
    self.skipWaiting();
});

// Activate event - fires when the service worker becomes active
self.addEventListener('activate', (event) => {
    // Claim all clients immediately (take control of all open tabs)
    event.waitUntil(clients.claim());
});

// Fetch event - intercepts network requests
// For now, we just pass through all requests to the network
self.addEventListener('fetch', (event) => {
    // You can add caching logic here later if needed
    // For now, just fetch from network
    event.respondWith(fetch(event.request));
});

