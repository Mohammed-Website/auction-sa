// Account Info Tabs Management
// This file contains all JavaScript code related to the "معلومات الحساب" (Account Info) pages and functionality
(function () {
    'use strict';

    // Tab state
    let currentTab = 'basic-data';
    let isInDetailView = false;

    // Track if event listeners are already attached to prevent duplicates
    let eventListenersAttached = false;

    // Initialize tabs
    function initAccountTabs() {
        // Prevent duplicate event listeners
        if (eventListenersAttached) {
            return;
        }

        const tabs = document.querySelectorAll('.account-tab');
        const tabViews = document.querySelectorAll('.tab-view');

        // Tab click handlers
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });

        // Back to tabs button handlers
        const backToTabsButtons = document.querySelectorAll('.back-btn[data-back="tabs"]');
        backToTabsButtons.forEach(btn => {
            // Check if listener already attached
            if (!btn.hasAttribute('data-listener-attached')) {
                btn.addEventListener('click', function () {
                    goBackToTabs();
                });
                btn.setAttribute('data-listener-attached', 'true');
            }
        });

        // Back to profile button handler
        const backToProfileBtn = document.getElementById('back-to-profile-btn');
        if (backToProfileBtn && !backToProfileBtn.hasAttribute('data-listener-attached')) {
            backToProfileBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Scroll to top for better UX
                if (typeof window.scrollToTop === 'function') {
                    window.scrollToTop();
                }

                // Navigate to profile menu (not home-section)
                console.log('[Navigation] Back button clicked - Navigating to profile menu');
                if (typeof window.ProfileNavigation !== 'undefined' && window.ProfileNavigation.navigateTo) {
                    window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MENU);
                } else {
                    // Fallback: navigate to profile section
                    if (typeof window.switchToSection === 'function') {
                        window.switchToSection('profile-section');
                    }
                }
            });
            backToProfileBtn.setAttribute('data-listener-attached', 'true');
        }

        eventListenersAttached = true;
        // Don't auto-open any tab - let user choose
    }

    // Switch to a specific tab
    function switchTab(tabId) {
        console.log(`[Navigation] Switching to account tab: ${tabId}`);
        // Scroll to top for better UX
        if (typeof window.scrollToTop === 'function') {
            window.scrollToTop();
        }

        // Hide account tabs header
        const accountTabsHeader = document.getElementById('account-tabs-header');
        if (accountTabsHeader) {
            accountTabsHeader.style.display = 'none';
        }

        // Show the appropriate card header for this tab
        const cardHeader = document.getElementById(`card-header-${tabId}`);
        if (cardHeader) {
            cardHeader.style.display = 'flex';
        }
        // Hide all other card headers
        document.querySelectorAll('.account-tabs-header').forEach(header => {
            if (header.id !== `card-header-${tabId}`) {
                header.style.display = 'none';
            }
        });

        const accountTabs = document.querySelector('.account-tabs');
        const tabViews = document.querySelectorAll('.tab-view');
        const wrapper = document.querySelector('.account-tabs-wrapper');

        // Hide account tabs with smooth transition (use only active class)
        if (accountTabs) {
            accountTabs.classList.add('hidden');
        }

        // Show the selected tab view (use only active class)
        tabViews.forEach(view => {
            if (view.id === `${tabId}-view`) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        // Update wrapper height to match active tab view
        if (wrapper) {
            const activeView = document.getElementById(`${tabId}-view`);
            if (activeView) {
                // Wait for view to be visible, then adjust wrapper height
                setTimeout(() => {
                    const viewHeight = activeView.scrollHeight;
                    wrapper.style.minHeight = viewHeight + 'px';
                }, 50);
            }
        }

        // Update tab buttons (for visual feedback)
        const tabs = document.querySelectorAll('.account-tab');
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        currentTab = tabId;
        isInDetailView = true;

        // Push navigation state to history
        setTimeout(() => {
            if (typeof window.pushNavigationState === 'function') {
                window.pushNavigationState(false);
            }
        }, 100);

        // Update sticky header positions
        setTimeout(() => {
            updateStickyHeaderPositions();
        }, 50);

        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }

    // Go back to tabs view (from detail view)
    function goBackToTabs() {
        console.log('[Navigation] Going back to account tabs view');
        // Scroll to top for better UX
        if (typeof window.scrollToTop === 'function') {
            window.scrollToTop();
        }

        // Show account tabs header
        const accountTabsHeader = document.getElementById('account-tabs-header');
        if (accountTabsHeader) {
            accountTabsHeader.style.display = 'flex';
        }
        // Hide only card headers (keep main account tabs header visible)
        document.querySelectorAll('.account-tabs-header').forEach(header => {
            if (header.id && header.id.startsWith('card-header-')) {
                header.style.display = 'none';
            }
        });

        const accountTabs = document.querySelector('.account-tabs');
        const tabViews = document.querySelectorAll('.tab-view');
        const wrapper = document.querySelector('.account-tabs-wrapper');

        // Hide all tab views (use only active class)
        tabViews.forEach(view => {
            view.classList.remove('active');
        });

        // Show account tabs (use only active class)
        if (accountTabs) {
            accountTabs.classList.remove('hidden');
        }

        // Reset wrapper height to default
        if (wrapper) {
            wrapper.style.minHeight = '';
        }

        isInDetailView = false;

        // Push navigation state to history
        setTimeout(() => {
            if (typeof window.pushNavigationState === 'function') {
                window.pushNavigationState(false);
            }
        }, 100);

        // Update sticky header positions
        updateStickyHeaderPositions();

        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }

    // Initialize profile section headers
    function initProfileSectionHeaders() {
        const profileSection = document.getElementById('profile-section');
        if (!profileSection) return;

        const headersContainer = document.getElementById('profile-section-headers');
        if (!headersContainer) return;

        // Check if headers already exist
        if (headersContainer.children.length > 0) {
            // Headers already exist, just update positions
            updateStickyHeaderPositions();
            return;
        }

        // Create all headers - use window functions if available, otherwise create inline
        const profilePageTitle = typeof window.createProfilePageTitle === 'function'
            ? window.createProfilePageTitle()
            : `<h1 class="profile-page-title">حسابي</h1>`;

        const accountTabsHeader = typeof window.createAccountTabsHeader === 'function'
            ? window.createAccountTabsHeader()
            : `<div class="account-tabs-header" id="account-tabs-header" style="display: none;">
                <button class="back-to-profile-btn" id="back-to-profile-btn" aria-label="العودة إلى القائمة">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="account-tabs-title">معلومات الحساب</h2>
            </div>`;

        const basicDataHeader = typeof window.createCardHeader === 'function'
            ? window.createCardHeader('البيانات الأساسية', 'basic-data')
            : `<div class="account-tabs-header" id="card-header-basic-data" style="display: none;">
                <button class="back-btn" data-back="tabs">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="account-tabs-title">البيانات الأساسية</h2>
            </div>`;

        const contactInfoHeader = typeof window.createCardHeader === 'function'
            ? window.createCardHeader('معلومات التواصل', 'contact-info')
            : `<div class="account-tabs-header" id="card-header-contact-info" style="display: none;">
                <button class="back-btn" data-back="tabs">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="account-tabs-title">معلومات التواصل</h2>
            </div>`;

        const addressesHeader = typeof window.createCardHeader === 'function'
            ? window.createCardHeader('عناويني', 'addresses')
            : `<div class="account-tabs-header" id="card-header-addresses" style="display: none;">
                <button class="back-btn" data-back="tabs">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="account-tabs-title">عناويني</h2>
            </div>`;

        headersContainer.innerHTML = profilePageTitle + accountTabsHeader + basicDataHeader + contactInfoHeader + addressesHeader;

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Show profile page title by default (when on menu view)
        const profilePageTitleEl = document.querySelector('.profile-page-title');
        if (profilePageTitleEl) {
            profilePageTitleEl.style.display = 'block';
        }

        // Update sticky header positions
        updateStickyHeaderPositions();
    }

    // Update sticky header positions based on top-header height
    function updateStickyHeaderPositions() {
        const topHeader = document.querySelector('.top-header');
        if (!topHeader) return;

        const topHeaderHeight = topHeader.offsetHeight;
        const stickyHeaders = document.querySelectorAll('.profile-page-title, .account-tabs-header');

        stickyHeaders.forEach(header => {
            if (header) {
                // Set top position to match top-header height so it sticks right below it
                header.style.top = `${topHeaderHeight}px`;
                // Ensure it's visible and properly positioned
                header.style.position = 'sticky';
                header.style.zIndex = '99';
                header.style.padding = 'var(--spacing-xs) var(--spacing-lg)';
            }
        });
    }

    // Initialize when account info view becomes active
    function initAccountInfoView() {
        const accountInfoView = document.getElementById('profile-account-info-view');
        if (!accountInfoView) {
            return;
        }

        // Update sticky header positions
        updateStickyHeaderPositions();

        // Use MutationObserver to detect when view becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = accountInfoView.classList.contains('active');
                    if (isActive) {
                        // Update sticky header positions and initialize tabs when view becomes active
                        setTimeout(() => {
                            updateStickyHeaderPositions();
                            initAccountTabs();
                        }, 100);
                    }
                }
            });
        });

        observer.observe(accountInfoView, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Also initialize if already active
        if (accountInfoView.classList.contains('active')) {
            setTimeout(() => {
                updateStickyHeaderPositions();
                initAccountTabs();
            }, 100);
        }
    }

    // Update sticky positions on window resize
    window.addEventListener('resize', () => {
        updateStickyHeaderPositions();
    });

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initProfileSectionHeaders();
            updateStickyHeaderPositions();
            initAccountInfoView();
        });
    } else {
        initProfileSectionHeaders();
        updateStickyHeaderPositions();
        initAccountInfoView();
    }

    // Export for external use
    window.AccountInfoTabs = {
        switchTab: switchTab,
        goBack: goBackToTabs,
        updateStickyPositions: updateStickyHeaderPositions,
        initProfileSectionHeaders: initProfileSectionHeaders,
        initAccountTabs: initAccountTabs,
        initAccountInfoView: initAccountInfoView
    };
})();