/**
 * Main Application Entry Point
 * 
 * This file serves as the main loader for all JavaScript modules.
 * It dynamically loads all other scripts in the correct order.
 * 
 * All other JavaScript files are located in the 'script' folder.
 */

(function () {
    'use strict';

    /**
     * Scroll to the top of the page
     * This function is used when switching between sections
     */
    window.scrollToTop = function () {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    };

    /**
     * Control website scrolling functionality
     * @param {string} action - "disable" to disable scrolling, "enable" to enable scrolling
     */
    window.controlWebsiteScroll = function (action) {
        const body = document.body;
        const html = document.documentElement;

        if (action === 'disable') {
            // Store current scroll position
            const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            body.setAttribute('data-scroll-y', scrollY);

            // Disable scrolling by setting overflow hidden
            body.style.overflow = 'hidden';
            html.style.overflow = 'hidden';

            // Lock scroll position
            body.style.position = 'fixed';
            body.style.width = '100%';
            body.style.top = `-${scrollY}px`;
        } else if (action === 'enable') {
            // Get stored scroll position
            const scrollY = body.getAttribute('data-scroll-y') || '0';

            // Re-enable scrolling
            body.style.overflow = '';
            html.style.overflow = '';
            body.style.position = '';
            body.style.width = '';
            body.style.top = '';

            // Remove stored scroll position
            body.removeAttribute('data-scroll-y');

            // Restore scroll position
            window.scrollTo(0, parseInt(scrollY, 10));
        }
    };

    /**
     * Load a JavaScript file dynamically
     * @param {string} src - The path to the JavaScript file
     * @returns {Promise} Promise that resolves when script is loaded
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            // Scripts are loaded sequentially, so defer is not needed

            script.onload = () => {
                resolve();
            };

            script.onerror = () => {
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Load all application modules in the correct order
     * Scripts are loaded sequentially to ensure dependencies are met
     */
    async function loadAllModules() {
        // Define all scripts in the correct loading order
        const scripts = [
            'script/navigation-history.js',      // Browser history management
            'script/section-navigation.js',      // Section switching
            'script/property-data.js',         // Property detail page
            'script/banner-slider.js',           // Banner slider
            'script/profile-navigation.js',     // Profile navigation
            'script/user-acc-data.js',           // Account info tabs
            'script/user-actions-section.js',      // My actions section
            'script/user-fav.js',

            'script/user-settings.js'            // User settings
        ];

        // Load scripts sequentially (one after another)
        for (const script of scripts) {
            try {
                await loadScript(script);
            } catch (error) {
                console.error(`Error loading ${script}:`, error);
            }
        }
    }















    // Start loading modules when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllModules);
    } else {
        // DOM is already ready, load modules immediately
        loadAllModules();
    }





    // Register service worker
    let serviceWorkerRegistered = false;
    if ('serviceWorker' in navigator) {
        // Get the current path to determine the scope
        const currentPath = window.location.pathname;
        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        const swPath = basePath + 'sw.js';
        const swScope = basePath;

        navigator.serviceWorker.register(swPath, { scope: swScope })
            .then((registration) => {
                console.log('Service Worker registered successfully:', registration);
                console.log('Service Worker scope:', swScope);
                serviceWorkerRegistered = true;
                // Notify installer that service worker is ready
                if (window.PWAInstaller) {
                    window.dispatchEvent(new CustomEvent('sw-registered'));
                }
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
                // Fallback: try registering without explicit scope
                navigator.serviceWorker.register('sw.js')
                    .then((registration) => {
                        console.log('Service Worker registered with fallback:', registration);
                        serviceWorkerRegistered = true;
                        if (window.PWAInstaller) {
                            window.dispatchEvent(new CustomEvent('sw-registered'));
                        }
                    })
                    .catch((fallbackError) => {
                        console.error('Service Worker fallback registration also failed:', fallbackError);
                    });
            });
    }


    /**
     * PWA Installer Module
     * Handles Progressive Web App installation
     */
    window.PWAInstaller = (function () {
        let deferredPrompt = null;
        let isInstalled = false;
        let installAttempted = false;
        const INSTALL_FLAG_KEY = 'pwa-installed-flag';

        // Check if app is already installed
        function checkIfInstalled() {
            // First check: running in standalone mode (installed PWA)
            if (window.matchMedia('(display-mode: standalone)').matches) {
                isInstalled = true;
                // Update localStorage flag
                try {
                    localStorage.setItem(INSTALL_FLAG_KEY, 'true');
                } catch (e) {
                    console.warn('Could not save install flag to localStorage:', e);
                }
                return true;
            }

            // Second check: running from home screen on iOS
            if (window.navigator.standalone === true) {
                isInstalled = true;
                try {
                    localStorage.setItem(INSTALL_FLAG_KEY, 'true');
                } catch (e) {
                    console.warn('Could not save install flag to localStorage:', e);
                }
                return true;
            }

            // Third check: localStorage flag (for when app is installed but opened in browser)
            try {
                const installFlag = localStorage.getItem(INSTALL_FLAG_KEY);
                if (installFlag === 'true') {
                    isInstalled = true;
                    return true;
                }
            } catch (e) {
                console.warn('Could not read install flag from localStorage:', e);
            }

            return false;
        }

        // Initialize installer
        function init() {
            // Check if already installed
            if (checkIfInstalled()) {
                console.log('PWA: App is already installed');
                return;
            }

            // Capture the beforeinstallprompt event
            window.addEventListener('beforeinstallprompt', (e) => {
                console.log('PWA: beforeinstallprompt event fired');
                e.preventDefault();
                deferredPrompt = e;
                // Dispatch custom event to notify that install is available
                window.dispatchEvent(new CustomEvent('pwa-install-available'));
            });

            // Listen for app installed event
            window.addEventListener('appinstalled', () => {
                console.log('PWA: App was installed');
                isInstalled = true;
                deferredPrompt = null;
                // Save installation flag to localStorage
                try {
                    localStorage.setItem(INSTALL_FLAG_KEY, 'true');
                } catch (e) {
                    console.warn('Could not save install flag to localStorage:', e);
                }
                window.dispatchEvent(new CustomEvent('pwa-installed'));
            });

            // Check installation status on initialization
            isInstalled = checkIfInstalled();
            if (isInstalled) {
                console.log('PWA: App is already installed (detected on init)');
            }

            // Also listen for service worker registration
            window.addEventListener('sw-registered', () => {
                console.log('PWA: Service worker registered, waiting for install prompt...');
            });

            // Check PWA installability criteria
            function checkInstallability() {
                const checks = {
                    secure: window.location.protocol === 'https:' ||
                        window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1',
                    manifest: document.querySelector('link[rel="manifest"]') !== null,
                    serviceWorker: 'serviceWorker' in navigator
                };

                console.log('PWA Installability checks:', checks);
                return checks;
            }

            // Run checks after a short delay
            setTimeout(() => {
                checkInstallability();
            }, 1000);
        }

        // Install the PWA
        async function install() {
            // Check if already installed
            if (isInstalled || checkIfInstalled()) {
                alert('التطبيق مثبت بالفعل على هذا الجهاز');
                return false;
            }

            // For iOS devices, show instructions (they don't support beforeinstallprompt)
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isIOS) {
                alert('لتثبيت التطبيق على iOS:\n\n1. اضغط على زر المشاركة (Share) في أسفل المتصفح\n2. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen)\n3. اضغط "إضافة" (Add)');
                return false;
            }

            // If prompt not available, wait a moment and check again
            // (sometimes the event fires after user interaction)
            if (!deferredPrompt) {
                console.log('PWA: Prompt not available, waiting 300ms...');
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Check if install prompt is available
            if (!deferredPrompt) {
                console.log('PWA: Install prompt not available yet');

                // Check if we're on a secure context (HTTPS or localhost)
                const isSecure = window.location.protocol === 'https:' ||
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';

                if (!isSecure) {
                    alert('التثبيت يتطلب اتصال آمن (HTTPS).\nيرجى فتح الموقع عبر رابط آمن.');
                    return false;
                }

                // Check if service worker is registered
                let swRegistered = serviceWorkerRegistered;
                if (!swRegistered && 'serviceWorker' in navigator) {
                    try {
                        const registration = await navigator.serviceWorker.getRegistration();
                        swRegistered = !!registration;
                    } catch (error) {
                        console.error('Service worker check failed:', error);
                    }
                }

                // Detect browser type for better instructions
                const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
                const isEdge = /Edg/.test(navigator.userAgent);
                const isFirefox = /Firefox/.test(navigator.userAgent);
                const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

                let message = 'خيار التثبيت التلقائي غير متاح حالياً.\n\n';
                message += 'يمكنك تثبيت التطبيق يدوياً:\n\n';

                if (isChrome || isEdge) {
                    message += 'في Chrome/Edge:\n';
                    message += '1. ابحث عن أيقونة 📥 أو ⊕ في شريط العنوان (على اليمين)\n';
                    message += '2. أو اضغط على قائمة المتصفح (⋮) → "تثبيت التطبيق"\n';
                    message += '3. أو انتظر قليلاً - قد يظهر خيار التثبيت بعد تفاعل أكثر مع الموقع';
                } else if (isFirefox) {
                    message += 'في Firefox:\n';
                    message += '1. اضغط على قائمة المتصفح (☰)\n';
                    message += '2. ابحث عن "تثبيت" أو "Install"\n';
                    message += '3. أو ابحث عن أيقونة التثبيت في شريط العنوان';
                } else if (isSafari) {
                    message += 'في Safari:\n';
                    message += '1. اضغط على زر المشاركة (Share)\n';
                    message += '2. اختر "إضافة إلى الشاشة الرئيسية"';
                } else {
                    message += 'استخدم قائمة المتصفح للبحث عن خيار "تثبيت التطبيق" أو "Install App"';
                }

                if (!swRegistered) {
                    message += '\n\nملاحظة: جاري إعداد التطبيق للتثبيت... قد تحتاج للمحاولة مرة أخرى بعد بضع ثوانٍ.';
                }

                alert(message);
                return false;
            }

            try {
                installAttempted = true;
                console.log('PWA: Showing install prompt');

                // Show the install prompt
                deferredPrompt.prompt();

                // Wait for user's response
                const { outcome } = await deferredPrompt.userChoice;

                console.log('PWA: User choice:', outcome);

                // Clear the deferred prompt
                deferredPrompt = null;
                installAttempted = false;

                if (outcome === 'accepted') {
                    console.log('PWA installation accepted');
                    // Set installation flag immediately
                    isInstalled = true;
                    try {
                        localStorage.setItem(INSTALL_FLAG_KEY, 'true');
                    } catch (e) {
                        console.warn('Could not save install flag to localStorage:', e);
                    }
                    return true;
                } else {
                    console.log('PWA installation dismissed');
                    return false;
                }
            } catch (error) {
                console.error('Error during PWA installation:', error);
                installAttempted = false;

                // If prompt() fails, the prompt might have been used already
                if (error.message && error.message.includes('prompt')) {
                    alert('تم استخدام خيار التثبيت مسبقاً.\nيرجى استخدام قائمة المتصفح لتثبيت التطبيق.');
                } else {
                    alert('حدث خطأ أثناء التثبيت.\nيرجى المحاولة مرة أخرى أو استخدام قائمة المتصفح.');
                }
                return false;
            }
        }

        // Check if installation is available
        function isInstallable() {
            // Re-check installation status to ensure it's up to date
            const currentlyInstalled = checkIfInstalled();
            return deferredPrompt !== null && !currentlyInstalled;
        }

        // Public method to check if installed (always fresh check)
        function isInstalledCheck() {
            // Always do a fresh check, don't rely on cached value
            return checkIfInstalled();
        }

        // Initialize on load
        init();

        // Return public API
        return {
            install: install,
            isInstallable: isInstallable,
            isInstalled: isInstalledCheck, // Always do fresh check
            hasPrompt: () => deferredPrompt !== null
        };
    })();



})();