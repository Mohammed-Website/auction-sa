// PWA Install Helper
// Captures the beforeinstallprompt event and exposes a simple install trigger.
; (function () {
    'use strict';

    let deferredInstallPrompt = null;

    // Listen for the PWA install prompt availability
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar on mobile
        e.preventDefault();
        deferredInstallPrompt = e;
    });

    // Trigger the PWA installation UI if available
    async function install() {
        if (!deferredInstallPrompt) {
            alert('التثبيت غير متاح حالياً. يرجى المحاولة لاحقاً.');
            return;
        }

        deferredInstallPrompt.prompt();
        try {
            const choice = await deferredInstallPrompt.userChoice;
            if (choice && choice.outcome === 'accepted') {
                console.log('PWA install accepted');
            } else {
                console.log('PWA install dismissed');
            }
        } catch (err) {
            console.warn('PWA install prompt error:', err);
        } finally {
            deferredInstallPrompt = null;
        }
    }

    window.PWAInstaller = {
        install
    };
})();

