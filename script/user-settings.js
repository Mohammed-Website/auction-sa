// Settings Page Management
// This file contains all JavaScript code related to the "الإعدادات" (Settings) page and functionality
(function () {
    'use strict';

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;
    let settingsRendered = false;

    // Functions to disable/enable body scrolling
    function disableBodyScroll() {
        const body = document.body;
        const scrollY = window.scrollY;
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';
        body.style.overflow = 'hidden';
        // Store scroll position for restoration
        body.setAttribute('data-scroll-y', scrollY);
    }

    function enableBodyScroll() {
        const body = document.body;
        const scrollY = body.getAttribute('data-scroll-y') || '0';
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.overflow = '';
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

                <div class="settings-content">
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




                            <label class="radio-option">
                                <input type="radio" name="auction-display" value="bidder-number">
                                <span class="radio-label">رقم المزايد في المزاد</span>
                                <span class="radio-checkmark"></span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="auction-display" value="bidder-number">
                                <span class="radio-label">رقم المزايد في المزاد</span>
                                <span class="radio-checkmark"></span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="auction-display" value="bidder-number">
                                <span class="radio-label">رقم المزايد في المزاد</span>
                                <span class="radio-checkmark"></span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="auction-display" value="bidder-number">
                                <span class="radio-label">رقم المزايد في المزاد</span>
                                <span class="radio-checkmark"></span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="auction-display" value="bidder-number">
                                <span class="radio-label">رقم المزايد في المزاد</span>
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

                // Re-enable body scrolling when leaving settings
                enableBodyScroll();

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
                        // Disable body scrolling when settings becomes active
                        disableBodyScroll();
                        // Re-initialize when settings view becomes active
                        setTimeout(() => {
                            initSettings();
                        }, 100);
                    } else {
                        // Re-enable body scrolling when settings becomes inactive
                        enableBodyScroll();
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
            disableBodyScroll();
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
