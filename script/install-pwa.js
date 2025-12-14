// PWA Install Helper
// Captures the beforeinstallprompt event and exposes a simple install trigger.
; (function () {
    'use strict';

    let deferredInstallPrompt = null;
    let isInstalled = false;

    // Check if app is already installed
    function checkIfInstalled() {
        // Check if running in standalone mode (already installed)
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://')) {
            isInstalled = true;
            return true;
        }
        return false;
    }

    // Check if service worker is registered
    async function checkServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                return registration !== undefined;
            } catch (error) {
                console.warn('Service Worker check failed:', error);
                return false;
            }
        }
        return false;
    }

    // Listen for the PWA install prompt availability
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar on mobile
        e.preventDefault();
        deferredInstallPrompt = e;
        console.log('PWA install prompt is now available');
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
        isInstalled = true;
        deferredInstallPrompt = null;
        console.log('PWA was installed');
    });

    // Trigger the PWA installation UI if available
    async function install() {
        // Check if already installed
        if (checkIfInstalled()) {
            alert('التطبيق مثبت بالفعل على جهازك.');
            return;
        }

        // Check if service worker is registered
        const swRegistered = await checkServiceWorker();
        if (!swRegistered) {
            alert('جاري تحضير التطبيق للتثبيت. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.');
            // Try to register service worker if not registered
            if ('serviceWorker' in navigator) {
                try {
                    await navigator.serviceWorker.register('/sw.js');
                    // Wait a bit for the beforeinstallprompt event (can take a few seconds)
                    let attempts = 0;
                    const maxAttempts = 5;
                    const checkInterval = setInterval(() => {
                        attempts++;
                        if (deferredInstallPrompt) {
                            clearInterval(checkInterval);
                            install();
                        } else if (attempts >= maxAttempts) {
                            clearInterval(checkInterval);
                            alert('يرجى تحديث الصفحة والمحاولة مرة أخرى. قد يستغرق التطبيق بعض الوقت للتحضير.');
                        }
                    }, 1000);
                } catch (error) {
                    console.error('Service Worker registration failed:', error);
                    alert('حدث خطأ في تحضير التطبيق. يرجى التأكد من الاتصال بالإنترنت والمحاولة مرة أخرى.');
                }
            }
            return;
        }

        // If prompt is not available yet, wait a moment (it might still be loading)
        if (!deferredInstallPrompt) {
            // Wait up to 2 seconds for the prompt to become available
            let waited = 0;
            while (!deferredInstallPrompt && waited < 2000) {
                await new Promise(resolve => setTimeout(resolve, 100));
                waited += 100;
            }
        }

        // Check if prompt is available
        if (!deferredInstallPrompt) {
            // Check if we're in a supported browser
            if (!('serviceWorker' in navigator)) {
                alert('المتصفح الحالي لا يدعم تثبيت التطبيقات. يرجى استخدام Chrome أو Edge أو Safari.');
                return;
            }

            // Check if HTTPS is required (for production)
            if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                alert('التثبيت يتطلب اتصال آمن (HTTPS). يرجى التأكد من استخدام رابط آمن.');
                return;
            }

            alert('التثبيت غير متاح حالياً. قد يكون التطبيق مثبتاً بالفعل، أو يرجى المحاولة بعد تحديث الصفحة. إذا استمرت المشكلة، تأكد من أنك تستخدم HTTPS.');
            return;
        }

        // Show the install prompt
        try {
            deferredInstallPrompt.prompt();

            // Wait for the user's response
            const { outcome } = await deferredInstallPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
        } catch (err) {
            console.warn('PWA install prompt error:', err);
            alert('حدث خطأ أثناء عرض نافذة التثبيت. يرجى المحاولة مرة أخرى.');
        } finally {
            // Clear the prompt as it can only be used once
            deferredInstallPrompt = null;
        }
    }

    // Initialize check on load
    checkIfInstalled();

    window.PWAInstaller = {
        install,
        isInstalled: () => isInstalled,
        isAvailable: () => deferredInstallPrompt !== null
    };
})();

