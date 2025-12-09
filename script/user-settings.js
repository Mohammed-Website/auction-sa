// Settings Page Management
// This file contains all JavaScript code related to the "الإعدادات" (Settings) page and functionality
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;

    // Initialize settings page
    function initSettings() {
        // Prevent duplicate event listeners
        if (eventListenersAttached) {
            return;
        }

        // Back button handler
        const settingsBackBtn = document.getElementById('settings-back-btn');
        if (settingsBackBtn && !settingsBackBtn.hasAttribute('data-listener-attached')) {
            settingsBackBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Scroll to top for better UX
                if (typeof window.scrollToTop === 'function') {
                    window.scrollToTop();
                }

                // Navigate back to profile menu
                if (typeof window.ProfileNavigation !== 'undefined' && window.ProfileNavigation.navigateTo) {
                    window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MENU);
                } else {
                    // Fallback: navigate to profile section
                    if (typeof window.switchToSection === 'function') {
                        window.switchToSection('profile-section');
                    }
                }
            });
            settingsBackBtn.setAttribute('data-listener-attached', 'true');
        }



        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        eventListenersAttached = true;
    }

    // Initialize when DOM is ready
    function init() {
        const settingsView = document.getElementById('profile-settings-view');
        if (!settingsView) {
            return;
        }

        // Initialize settings
        initSettings();

        // Use MutationObserver to re-initialize when settings view becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = settingsView.classList.contains('active');
                    if (isActive) {
                        // Re-initialize when settings view becomes active
                        setTimeout(() => {
                            initSettings();
                        }, 100);
                    }
                }
            });
        });

        observer.observe(settingsView, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Also initialize if already active
        if (settingsView.classList.contains('active')) {
            initSettings();
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for external use
    window.SettingsPage = {
        init: initSettings
    };
})();
