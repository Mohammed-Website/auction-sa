/**
 * PWA Installer Module
 * 
 * This module handles Progressive Web App (PWA) installation functionality.
 * It captures the beforeinstallprompt event and provides a method to trigger
 * the installation prompt when the user clicks the install button.
 */

(function () {
    'use strict';

    let deferredPrompt = null;
    let isInstalled = false;

    /**
     * Check if the app is already installed
     */
    function checkIfInstalled() {
        // Check if running in standalone mode (installed PWA)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            isInstalled = true;
            return true;
        }

        // Check if running from home screen on iOS
        if (window.navigator.standalone === true) {
            isInstalled = true;
            return true;
        }

        return false;
    }

    /**
     * Initialize PWA installer
     * Captures the beforeinstallprompt event and checks installation status
     */
    function init() {
        // Check if already installed
        isInstalled = checkIfInstalled();

        // Register service worker if not already registered
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service worker registered:', registration);
                })
                .catch(err => {
                    console.warn('Service worker registration failed:', err);
                });
        }

        // Listen for the beforeinstallprompt event
        // This must be attached immediately, before the event fires
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event captured');
            // Prevent the default browser install prompt
            e.preventDefault();
            // Store the event for later use
            deferredPrompt = e;
            isInstalled = false;
            console.log('Install prompt is now available');
        }, { once: false, passive: false });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
            isInstalled = true;
            console.log('PWA installed successfully');
        });

        // Also listen on document for some browsers
        document.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event captured on document');
            e.preventDefault();
            if (!deferredPrompt) {
                deferredPrompt = e;
                isInstalled = false;
                console.log('Install prompt is now available (from document)');
            }
        }, { once: false, passive: false });

        // Debug: Log installation status
        console.log('PWA Installer initialized. Installed:', isInstalled);

        // Wait a bit and check again (some browsers fire the event after a delay)
        setTimeout(() => {
            if (!deferredPrompt && !isInstalled) {
                console.log('Still waiting for beforeinstallprompt event...');
            }
        }, 2000);
    }

    /**
     * Trigger the PWA installation prompt
     * @returns {Promise<boolean>} Promise that resolves to true if user accepted, false otherwise
     */
    async function install() {
        // Check if already installed
        if (isInstalled || checkIfInstalled()) {
            alert('التطبيق مثبت بالفعل على هذا الجهاز');
            return false;
        }

        // Check if installation is available
        if (!deferredPrompt) {
            // Log diagnostics for debugging
            const diagnostics = getDiagnostics();
            console.log('PWA Installation Diagnostics:', diagnostics);

            // Check if already installed
            if (diagnostics.isInstalled) {
                alert('التطبيق مثبت بالفعل على هذا الجهاز');
                return false;
            }

            // On iOS, provide instructions
            if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                alert('لتثبيت التطبيق على iOS:\n\n1. اضغط على زر المشاركة (Share) في المتصفح\n2. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen)\n3. اضغط "إضافة"');
                return false;
            }

            // Check if service worker is registered
            if (!diagnostics.hasServiceWorker) {
                alert('المتصفح لا يدعم تثبيت التطبيقات على هذا الجهاز.');
                return false;
            }

            // Check if manifest exists
            if (!diagnostics.hasManifest) {
                alert('خطأ في إعدادات التطبيق. يرجى الاتصال بالدعم الفني.');
                return false;
            }

            // Provide helpful message with instructions
            alert('التثبيت غير متاح حالياً.\n\nيرجى المحاولة:\n1. إعادة تحميل الصفحة\n2. الانتظار قليلاً ثم المحاولة مرة أخرى\n3. استخدام قائمة المتصفح (⋮) واختيار "تثبيت التطبيق" أو "Install App"');
            return false;
        }

        try {
            // Show the install prompt
            deferredPrompt.prompt();

            // Wait for user's response
            const { outcome } = await deferredPrompt.userChoice;

            // Clear the deferred prompt
            deferredPrompt = null;

            if (outcome === 'accepted') {
                isInstalled = true;
                console.log('User accepted the install prompt');
                return true;
            } else {
                console.log('User dismissed the install prompt');
                return false;
            }
        } catch (error) {
            console.error('Error during installation:', error);
            alert('حدث خطأ أثناء محاولة التثبيت. يرجى المحاولة مرة أخرى.');
            return false;
        }
    }

    /**
     * Check if installation is available
     * @returns {boolean} True if installation prompt is available
     */
    function isInstallable() {
        return deferredPrompt !== null && !isInstalled;
    }

    /**
     * Check if app is already installed
     * @returns {boolean} True if app is installed
     */
    function getIsInstalled() {
        return isInstalled || checkIfInstalled();
    }

    /**
     * Get diagnostic information about PWA installation status
     * @returns {Object} Diagnostic information
     */
    function getDiagnostics() {
        return {
            deferredPrompt: deferredPrompt !== null,
            isInstalled: getIsInstalled(),
            hasServiceWorker: 'serviceWorker' in navigator,
            hasManifest: document.querySelector('link[rel="manifest"]') !== null,
            isStandalone: window.matchMedia('(display-mode: standalone)').matches,
            isIOSStandalone: window.navigator.standalone === true
        };
    }

    // Initialize immediately - don't wait for DOM
    // The beforeinstallprompt event can fire very early, so we need to be ready
    init();

    // Export PWAInstaller object
    window.PWAInstaller = {
        install: install,
        isInstallable: isInstallable,
        isInstalled: getIsInstalled,
        getDiagnostics: getDiagnostics
    };
})();
