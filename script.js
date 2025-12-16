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
     * @param {string} action - "disable" to disable scrolling down (but allow scrolling up), "enable" to enable scrolling
     */
    // Store event handlers so they can be removed later
    let scrollHandlers = {
        scroll: null,
        wheel: null,
        touchstart: null,
        touchmove: null
    };

    /**
     * Check if an element or any of its parents has the scrollable-container class
     * @param {Element} element - The element to check
     * @returns {boolean} - True if element or parent has scrollable-container class
     */
    function isWithinScrollableContainer(element) {
        if (!element) return false;

        let current = element;
        while (current && current !== document.body && current !== document.documentElement) {
            if (current.classList && current.classList.contains('scrollable-container')) {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }

    window.controlWebsiteScroll = function (action) {
        const body = document.body;
        const html = document.documentElement;

        if (action === 'disable') {
            // Store current scroll position
            const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            body.setAttribute('data-scroll-y', scrollY);

            // Store the max scroll position (can't scroll below this)
            const maxScrollY = scrollY;
            body.setAttribute('data-max-scroll-y', maxScrollY);
            body.setAttribute('data-scroll-disabled', 'true');

            // Store original styles to restore later
            const originalBodyStyle = {
                position: body.style.position || '',
                top: body.style.top || '',
                left: body.style.left || '',
                width: body.style.width || '',
                marginRight: body.style.marginRight || ''
            };
            body.setAttribute('data-original-body-style', JSON.stringify(originalBodyStyle));

            // Lock scroll position using CSS position: fixed - prevents visual glitches
            // This prevents any scroll from happening visually, eliminating glitches
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            body.style.position = 'fixed';
            body.style.top = `-${scrollY}px`;
            body.style.left = '0';
            body.style.width = '100%';
            if (scrollbarWidth > 0) {
                body.style.marginRight = `${scrollbarWidth}px`;
            }

            // Minimal scroll handler - just to ensure position stays locked
            // Using passive: true since we're not preventing default here
            scrollHandlers.scroll = function () {
                if (body.getAttribute('data-scroll-disabled') !== 'true') {
                    return;
                }
                // Position is locked via CSS, so this is just a safety check
                // No need to do anything since CSS prevents the visual scroll
            };

            // Create wheel handler to prevent mouse wheel scrolling down
            // Use a more efficient approach that checks scrollable containers first
            scrollHandlers.wheel = function (e) {
                if (body.getAttribute('data-scroll-disabled') !== 'true') {
                    return; // Scroll is enabled, don't interfere
                }

                // Check if the wheel event is within a scrollable container first (most common case)
                if (isWithinScrollableContainer(e.target)) {
                    return; // Allow scrolling within scrollable containers
                }

                // Only check scroll position if scrolling down
                if (e.deltaY <= 0) {
                    return; // Allow scrolling up
                }

                const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
                const storedMaxScrollY = parseFloat(body.getAttribute('data-max-scroll-y') || '0');

                // If scrolling down and already at or past max position, prevent it
                if (currentScrollY >= storedMaxScrollY) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            };

            // Store touch start position for mobile
            let touchStartY = 0;
            scrollHandlers.touchstart = function (e) {
                touchStartY = e.touches[0].clientY;
            };

            // Create touch move handler to prevent touch scrolling down
            scrollHandlers.touchmove = function (e) {
                if (body.getAttribute('data-scroll-disabled') !== 'true') {
                    return; // Scroll is enabled, don't interfere
                }

                // Check if the touch event is within a scrollable container first (most common case)
                if (isWithinScrollableContainer(e.target)) {
                    return; // Allow scrolling within scrollable containers
                }

                const touchCurrentY = e.touches[0].clientY;
                const touchDeltaY = touchStartY - touchCurrentY; // Positive when scrolling down

                // Only check scroll position if scrolling down
                if (touchDeltaY >= 0) {
                    return; // Allow scrolling up
                }

                const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
                const storedMaxScrollY = parseFloat(body.getAttribute('data-max-scroll-y') || '0');

                // If scrolling down and already at or past max position, prevent it
                if (currentScrollY >= storedMaxScrollY) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            };

            // Add event listeners with passive: false only where needed
            window.addEventListener('scroll', scrollHandlers.scroll, { passive: true });
            window.addEventListener('wheel', scrollHandlers.wheel, { passive: false });
            window.addEventListener('touchstart', scrollHandlers.touchstart, { passive: true });
            window.addEventListener('touchmove', scrollHandlers.touchmove, { passive: false });

        } else if (action === 'enable') {
            // Remove the disabled flag
            body.removeAttribute('data-scroll-disabled');

            // Remove all event listeners
            if (scrollHandlers.scroll) {
                window.removeEventListener('scroll', scrollHandlers.scroll);
                scrollHandlers.scroll = null;
            }
            if (scrollHandlers.wheel) {
                window.removeEventListener('wheel', scrollHandlers.wheel);
                scrollHandlers.wheel = null;
            }
            if (scrollHandlers.touchstart) {
                window.removeEventListener('touchstart', scrollHandlers.touchstart);
                scrollHandlers.touchstart = null;
            }
            if (scrollHandlers.touchmove) {
                window.removeEventListener('touchmove', scrollHandlers.touchmove);
                scrollHandlers.touchmove = null;
            }

            // Get stored scroll position
            const scrollY = body.getAttribute('data-scroll-y') || '0';

            // Restore original body styles
            const originalStyleStr = body.getAttribute('data-original-body-style');
            if (originalStyleStr) {
                try {
                    const originalStyle = JSON.parse(originalStyleStr);
                    body.style.position = originalStyle.position || '';
                    body.style.top = originalStyle.top || '';
                    body.style.left = originalStyle.left || '';
                    body.style.width = originalStyle.width || '';
                    body.style.marginRight = originalStyle.marginRight || '';
                } catch (e) {
                    // Fallback: just remove the styles
                    body.style.position = '';
                    body.style.top = '';
                    body.style.left = '';
                    body.style.width = '';
                    body.style.marginRight = '';
                }
            } else {
                // Fallback: just remove the styles
                body.style.position = '';
                body.style.top = '';
                body.style.left = '';
                body.style.width = '';
                body.style.marginRight = '';
            }

            // Remove stored attributes
            body.removeAttribute('data-scroll-y');
            body.removeAttribute('data-max-scroll-y');
            body.removeAttribute('data-original-body-style');

            // Restore scroll position after styles are restored
            // Use requestAnimationFrame to ensure styles are applied first
            requestAnimationFrame(() => {
                window.scrollTo({ top: parseInt(scrollY, 10), left: 0, behavior: 'auto' });
            });
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
            'script/install-pwa.js',             // PWA installation
            'script/auction-detail.js',          // Auction property detail page
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
                serviceWorkerRegistered = true;
                // Notify installer that service worker is ready
                if (window.setServiceWorkerRegistered) {
                    window.setServiceWorkerRegistered(true);
                }
                if (window.PWAInstaller) {
                    window.dispatchEvent(new CustomEvent('sw-registered'));
                }
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
                // Fallback: try registering without explicit scope
                navigator.serviceWorker.register('sw.js')
                    .then((registration) => {
                        serviceWorkerRegistered = true;
                        if (window.setServiceWorkerRegistered) {
                            window.setServiceWorkerRegistered(true);
                        }
                        if (window.PWAInstaller) {
                            window.dispatchEvent(new CustomEvent('sw-registered'));
                        }
                    })
                    .catch((fallbackError) => {
                        console.error('Service Worker fallback registration also failed:', fallbackError);
                    });
            });
    }

})();