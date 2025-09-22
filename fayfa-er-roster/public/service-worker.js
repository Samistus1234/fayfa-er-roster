// Service Worker for Push Notifications
self.addEventListener('install', event => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated');
    event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', event => {
    console.log('Push notification received');
    
    let data = {
        title: 'Fayfa ER Roster',
        body: 'You have an upcoming duty',
        icon: '/images/icon-192.png',
        badge: '/images/badge-72.png'
    };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            console.error('Error parsing push data:', e);
        }
    }
    
    const options = {
        body: data.body,
        icon: data.icon || '/images/icon-192.png',
        badge: data.badge || '/images/badge-72.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'duty-reminder',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'View Details',
                icon: '/images/check-icon.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/images/close-icon.png'
            }
        ],
        data: data
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
        // Open the app or focus existing window
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then(windowClients => {
                    // Check if there's already a window/tab open
                    for (let client of windowClients) {
                        if (client.url.includes('/') && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // If not, open a new window
                    if (clients.openWindow) {
                        return clients.openWindow('/');
                    }
                })
        );
    }
});

// Background sync for offline notifications
self.addEventListener('sync', event => {
    if (event.tag === 'check-duties') {
        event.waitUntil(checkUpcomingDuties());
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'check-duties') {
        event.waitUntil(checkUpcomingDuties());
    }
});

// Check for upcoming duties
async function checkUpcomingDuties() {
    try {
        const response = await fetch('/api/notifications/upcoming-duties');
        const data = await response.json();
        
        if (data.success && data.duties && data.duties.length > 0) {
            // Show notifications for upcoming duties
            for (const duty of data.duties) {
                await self.registration.showNotification(
                    'Upcoming Duty Reminder',
                    {
                        body: duty.message,
                        icon: '/images/icon-192.png',
                        badge: '/images/badge-72.png',
                        tag: `duty-${duty.id}`,
                        data: duty
                    }
                );
            }
        }
    } catch (error) {
        console.error('Error checking upcoming duties:', error);
    }
}