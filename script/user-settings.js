// Settings Page Management
// This file contains all JavaScript code related to the "الإعدادات" (Settings) page and functionality
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;
    let settingsRendered = false;

    // Functions to disable/enable body scrolling
    let scrollHandler = null;
    let touchHandler = null;
    let initialScrollY = 0;

    function disableBodyScroll() {
        const body = document.body;
        initialScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

        // Store scroll position for restoration
        body.setAttribute('data-scroll-y', initialScrollY);

        // Create scroll handler that prevents downward scrolling but allows upward
        scrollHandler = function () {
            const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

            // If trying to scroll down past initial position, prevent it
            if (currentScrollY > initialScrollY) {
                window.scrollTo(0, initialScrollY);
            }
        };

        // Add scroll event listener
        window.addEventListener('scroll', scrollHandler, { passive: true });

        // Prevent touchmove events that would cause downward scrolling on body
        // But allow scrolling within settings-content and profile-section's section-content
        touchHandler = function (e) {
            // Check if the touch is within settings-content - if so, allow it
            const settingsContent = document.querySelector('.settings-content');
            if (settingsContent && settingsContent.contains(e.target)) {
                return; // Allow scrolling within settings-content
            }

            // Check if the touch is within profile-section's section-content - if so, allow it
            const profileSection = document.getElementById('profile-section');
            if (profileSection && profileSection.classList.contains('active')) {
                const sectionContent = profileSection.querySelector('.section-content');
                if (sectionContent && sectionContent.contains(e.target)) {
                    return; // Allow scrolling within profile-section's section-content
                }
            }

            // For body scrolling, check if it would cause downward scroll
            const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            if (currentScrollY > initialScrollY) {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('touchmove', touchHandler, { passive: false });
    }

    function enableBodyScroll() {
        const body = document.body;
        const scrollY = body.getAttribute('data-scroll-y') || '0';

        // Remove scroll event listener
        if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler);
            scrollHandler = null;
        }

        // Remove touch handler
        if (touchHandler) {
            document.removeEventListener('touchmove', touchHandler);
            touchHandler = null;
        }

        body.removeAttribute('data-scroll-y');

        // Restore scroll position
        window.scrollTo(0, parseInt(scrollY, 10));
    }

    // Build settings view markup
    function renderSettingsView() {
        const settingsView = document.getElementById('profile-settings-view');
        if (!settingsView || settingsRendered) return;

        settingsView.innerHTML = `
            <div class="settings-container">
                <div class="account-tabs-header" id="settings-header">
                    <button class="back-btn" id="settings-back-btn" aria-label="رجوع">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title">الإعدادات</h2>
                </div>

                <div class="settings-content scrollable-container">
                    <p class="settings-description">
                        تتيح لك صفحة الإعدادات تخصيص حسابك. يمكنك تعديل معلوماتك، تغيير طريقة ظهورك، وإدارة
                        تفضيلات الخصوصية.
                    </p>

                    <div class="settings-section">
                        <h3 class="settings-section-title">ظهورك في المزادات</h3>
                        <div class="settings-card">
                            <label class="radio-option">
                                <input type="radio" name="auction-display" value="last-four-id" checked>
                                <span class="radio-label">آخر 4 أرقام من الهوية</span>
                                <span class="radio-checkmark"></span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="auction-display" value="full-name">
                                <span class="radio-label">الاسم الكامل</span>
                                <span class="radio-checkmark"></span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="auction-display" value="bidder-number">
                                <span class="radio-label">رقم المزايد في المزاد</span>
                                <span class="radio-checkmark"></span>
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3 class="settings-section-title">الإشعارات</h3>
                        <div class="settings-card">
                            <div class="toggle-option">
                                <div class="toggle-label-wrapper">
                                    <i data-lucide="bell" class="toggle-icon"></i>
                                    <span class="toggle-label">اشعارات المزايدات</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            <div class="toggle-option">
                                <div class="toggle-label-wrapper">
                                    <i data-lucide="alert-circle" class="toggle-icon"></i>
                                    <span class="toggle-label">اشعارات التنبيهات</span>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Allow listeners to attach on fresh markup
        eventListenersAttached = false;
        settingsRendered = true;
    }

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

        // Build view markup once
        renderSettingsView();

        // Initialize settings
        initSettings();

        // Use MutationObserver to re-initialize when settings view becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = settingsView.classList.contains('active');
                    if (isActive) {
                        // Scroll settings-content to top
                        setTimeout(() => {
                            const settingsContent = document.querySelector('.settings-content');
                            if (settingsContent) {
                                settingsContent.scrollTop = 0;
                            }
                        }, 50);
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
            // Scroll settings-content to top
            const settingsContent = document.querySelector('.settings-content');
            if (settingsContent) {
                settingsContent.scrollTop = 0;
            }
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
        init: initSettings,
        disableBodyScroll: disableBodyScroll,
        enableBodyScroll: enableBodyScroll
    };
})();
