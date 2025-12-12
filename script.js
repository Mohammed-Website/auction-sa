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
            'script/property-data.js',           // Property data loading
            'script/auction-property-detail.js',         // Property detail page
            'script/banner-slider.js',           // Banner slider
            'script/install-pwa.js',             // PWA install helper
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

    /**
     * Register Service Worker for PWA functionality
     * This enables offline capabilities and PWA installation
     */
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .catch((error) => {
                        console.warn('Service Worker registration failed:', error);
                    });
            });
        }
    }

    // Register service worker
    registerServiceWorker();

    // Start loading modules when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAllModules);
    } else {
        // DOM is already ready, load modules immediately
        loadAllModules();
    }
})();