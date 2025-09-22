// Push Notifications Manager
class PushNotificationManager {
    constructor() {
        this.swRegistration = null;
        this.isSubscribed = false;
        this.applicationServerKey = null;
    }

    // Initialize push notifications
    async initialize() {
        // Check if service workers and push notifications are supported
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return false;
        }

        try {
            // Register service worker
            this.swRegistration = await navigator.serviceWorker.register('/service-worker.js');

            // Get the application server key from the server
            await this.getApplicationServerKey();

            // Check if already subscribed
            await this.checkSubscription();

            // Initialize UI
            this.initializeUI();

            return true;
        } catch (error) {
            console.error('Failed to initialize push notifications:', error);
            return false;
        }
    }

    // Get application server key from backend
    async getApplicationServerKey() {
        try {
            const response = await fetch('/api/notifications/vapid-public-key');
            const data = await response.json();
            
            if (data.success && data.publicKey) {
                this.applicationServerKey = this.urlBase64ToUint8Array(data.publicKey);
            } else {
                // Use a default key for development (you should generate your own VAPID keys)
                this.applicationServerKey = this.urlBase64ToUint8Array(
                    'BNbxGYNMhEIi9zrneh7mqV4oUanjLUK3m-mYZBc62frMKrEoMk88r3Lk596T0ck9xlT-HU0q0TJmr6pWbUgYT48'
                );
            }
        } catch (error) {
            console.error('Failed to get application server key:', error);
        }
    }

    // Check if user is already subscribed
    async checkSubscription() {
        try {
            const subscription = await this.swRegistration.pushManager.getSubscription();
            this.isSubscribed = subscription !== null;

            if (this.isSubscribed) {
                await this.sendSubscriptionToServer(subscription);
            }
        } catch (error) {
            console.error('Failed to check subscription:', error);
        }
    }

    // Initialize UI elements
    initializeUI() {
        // Add notification permission button if needed
        if (Notification.permission === 'default') {
            this.showNotificationPrompt();
        }

        // Update UI based on subscription status
        this.updateNotificationUI();
    }

    // Show notification permission prompt
    showNotificationPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'notification-prompt glass-effect';
        prompt.innerHTML = `
            <div class="prompt-content">
                <div class="prompt-icon">
                    <i class="fas fa-bell"></i>
                </div>
                <div class="prompt-text">
                    <h4>Enable Duty Reminders</h4>
                    <p>Get notified 2 hours before your duties</p>
                </div>
                <div class="prompt-actions">
                    <button class="modern-btn secondary-btn" onclick="pushManager.dismissPrompt()">
                        Not Now
                    </button>
                    <button class="modern-btn primary-btn" onclick="pushManager.enableNotifications()">
                        Enable
                    </button>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(prompt);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (prompt.parentNode) {
                prompt.classList.add('fade-out');
                setTimeout(() => prompt.remove(), 300);
            }
        }, 10000);
    }

    // Enable notifications
    async enableNotifications() {
        try {
            // Request notification permission
            const permission = await Notification.requestPermission();
            
            if (permission !== 'granted') {
                showAlert('Notification permission denied', 'warning');
                return;
            }

            // Subscribe to push notifications
            await this.subscribeUser();
            
            // Remove prompt
            this.dismissPrompt();
            
            showAlert('Duty reminders enabled successfully!', 'success');
        } catch (error) {
            console.error('Failed to enable notifications:', error);
            showAlert('Failed to enable notifications', 'error');
        }
    }

    // Subscribe user to push notifications
    async subscribeUser() {
        try {
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.applicationServerKey
            });

            this.isSubscribed = true;

            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);

            // Update UI
            this.updateNotificationUI();

            return subscription;
        } catch (error) {
            console.error('Failed to subscribe user:', error);
            throw error;
        }
    }

    // Send subscription to server
    async sendSubscriptionToServer(subscription) {
        try {
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscription: subscription,
                    userAgent: navigator.userAgent
                })
            });

            const data = await response.json();
        } catch (error) {
            console.error('Failed to send subscription to server:', error);
        }
    }

    // Unsubscribe from push notifications
    async unsubscribeUser() {
        try {
            const subscription = await this.swRegistration.pushManager.getSubscription();
            
            if (subscription) {
                await subscription.unsubscribe();
                this.isSubscribed = false;

                // Notify server
                await fetch('/api/notifications/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        endpoint: subscription.endpoint
                    })
                });

                showAlert('Duty reminders disabled', 'info');
            }

            this.updateNotificationUI();
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
            showAlert('Failed to disable notifications', 'error');
        }
    }

    // Update notification UI
    updateNotificationUI() {
        const button = document.getElementById('notificationToggle');
        if (!button) return;

        if (this.isSubscribed) {
            button.innerHTML = '<i class="fas fa-bell-slash me-2"></i>Disable Reminders';
            button.onclick = () => this.unsubscribeUser();
            button.classList.remove('primary-btn');
            button.classList.add('secondary-btn');
        } else {
            button.innerHTML = '<i class="fas fa-bell me-2"></i>Enable Reminders';
            button.onclick = () => this.enableNotifications();
            button.classList.remove('secondary-btn');
            button.classList.add('primary-btn');
        }
    }

    // Dismiss notification prompt
    dismissPrompt() {
        const prompt = document.querySelector('.notification-prompt');
        if (prompt) {
            prompt.classList.add('fade-out');
            setTimeout(() => prompt.remove(), 300);
        }
    }

    // Test notification
    async testNotification() {
        if (!this.isSubscribed) {
            showAlert('Please enable notifications first', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/notifications/test-push', {
                method: 'POST'
            });
            
            const data = await response.json();
            if (data.success) {
                showAlert('Test notification sent!', 'success');
            }
        } catch (error) {
            console.error('Failed to send test notification:', error);
            showAlert('Failed to send test notification', 'error');
        }
    }

    // Convert VAPID key
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

// Initialize push notification manager
const pushManager = new PushNotificationManager();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    await pushManager.initialize();
});