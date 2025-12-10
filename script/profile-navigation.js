﻿/**
 * Profile Components and Navigation
 * 
 * This file handles:
 * - Profile menu rendering and navigation
 * - Switching between profile views (Menu, Account Info, Settings)
 * - Creating profile menu items and sections
 * - Handling profile-related user interactions
 */

(function () {
    'use strict';

    /**
     * Profile Route Management
     * Defines the different views within the profile section
     */
    const ProfileRoutes = {
        MENU: 'menu',              // Main profile menu
        ACCOUNT_INFO: 'account-info',  // Account information tabs
        SETTINGS: 'settings',       // Settings page
        FAVORITES: 'favorites'    // Favorites page
    };

    // Track which profile route is currently active
    let currentProfileRoute = ProfileRoutes.MENU;

    // Flag to prevent recursive navigation calls
    let isNavigatingProfileRoute = false;

    /**
     * Create profile header component
     * Shows user name and profile image
     * @param {Object} userData - User data object
     * @returns {string} HTML string for the header
     */
    function createProfileHeader(userData) {
        const name = userData?.fullName || userData?.name || 'المستخدم';
        const imageUrl = userData?.imageUrl || userData?.image || userData?.avatar || null;

        const headerHTML = `
            <div class="profile-header-card">
                <h2 class="profile-name">${name}</h2>
                <div class="profile-image-wrapper">
                    <div class="profile-image" id="profile-menu-image">
                        ${imageUrl
                ? `<img src="${imageUrl}" alt="صورة الملف الشخصي" onerror="this.onerror=null; this.style.display='none'; const placeholder = this.nextElementSibling; if(placeholder) placeholder.style.display='block';">`
                : ''}
                        <i class="fas fa-user profile-image-placeholder" ${imageUrl ? 'style="display:none;"' : ''}></i>
                    </div>
                </div>
            </div>
        `;

        return headerHTML;
    }

    /**
     * Create profile page title header
     * @returns {string} HTML string for the title
     */
    function createProfilePageTitle() {
        return `<h1 class="profile-page-title">حسابي</h1>`;
    }

    /**
     * Create account tabs header
     * Header shown when viewing account information
     * @returns {string} HTML string for the header
     */
    function createAccountTabsHeader() {
        return `
            <div class="account-tabs-header" id="account-tabs-header" style="display: none;">
                <button class="back-to-profile-btn" id="back-to-profile-btn"
                    aria-label="العودة إلى القائمة">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="account-tabs-title">معلومات الحساب</h2>
            </div>
        `;
    }

    /**
     * Create card header for tab views
     * Header shown when viewing a specific account tab
     * @param {string} title - The title to display
     * @param {string} tabId - The ID of the tab
     * @returns {string} HTML string for the header
     */
    function createCardHeader(title, tabId) {
        return `
            <div class="account-tabs-header" id="card-header-${tabId}" style="display: none;">
                <button class="back-btn" data-back="tabs">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="account-tabs-title">${title}</h2>
            </div>
        `;
    }

    /**
     * Create a menu item component
     * @param {Object} item - Menu item data (icon, text, route, action)
     * @returns {string} HTML string for the menu item
     */
    function createMenuItem(item) {
        const { icon, text, route, action } = item;
        const hasAction = route || action;

        const itemHTML = `
            <div class="menu-item" ${hasAction ? `data-route="${route || ''}" data-action="${action || ''}"` : ''}>
                <div class="menu-item-content">
                    <i data-lucide="${icon}" class="menu-item-icon"></i>
                    <span class="menu-item-text">${text}</span>
                </div>
                ${hasAction ? '<i data-lucide="chevron-left" class="menu-item-arrow"></i>' : ''}
            </div>
        `;

        return itemHTML;
    }

    /**
     * Create a menu section component
     * Groups related menu items together
     * @param {Object} section - Section data (title, items)
     * @returns {string} HTML string for the menu section
     */
    function createMenuSection(section) {
        const { title, items } = section;

        const itemsHTML = items.map(item => createMenuItem(item)).join('');

        const sectionHTML = `
            <div class="menu-section">
                <h3 class="menu-section-title">${title}</h3>
                <div class="menu-items">
                    ${itemsHTML}
                </div>
            </div>
        `;

        return sectionHTML;
    }

    /**
     * Menu Configuration
     * Defines all menu items and their organization
     */
    const menuConfig = [
        {
            title: 'النظام',
            items: [
                { icon: 'user', text: 'معلومات الحساب', route: ProfileRoutes.ACCOUNT_INFO },
                { icon: 'heart', text: 'المفضلة', route: null, action: 'favorites' },
                { icon: 'settings', text: 'الإعدادات', route: null, action: 'settings' }
            ]
        },
        {
            title: 'الأصول',
            items: [
                { icon: 'plus', text: 'بدأ مزاد جديد', route: null, action: 'start-auction' },
                { icon: 'plus', text: 'إضافة عقار جديد', route: null, action: 'add-property' },
                { icon: 'key', text: 'إدارة ممتلكاتي', route: null, action: 'mannage-properties' }
            ]
        },
        {
            title: 'المحفظة',
            items: [
                { icon: 'wallet', text: 'المحافظ وحساب البنك', route: null, action: 'wallet' },
                { icon: 'activity', text: 'العمليات', route: null, action: 'transactions' }
            ]
        },
        {
            title: 'التقارير',
            items: [
                { icon: 'file-text', text: 'تقارير موجز', route: null, action: 'reports' },
                { icon: 'file-check', text: 'إقراراتي', route: null, action: 'statements' }
            ]
        },
        {
            title: 'المزيد',
            items: [
                { icon: 'download', text: 'تنزيل البرنامج', route: null, action: 'terms' },
                { icon: 'file-text', text: 'الشروط والأحكام', route: null, action: 'terms' },
                { icon: 'shield', text: 'سياسة الخصوصية', route: null, action: 'privacy' },
                { icon: 'help-circle', text: 'المساعدة', route: null, action: 'help' },
                { icon: 'log-out', text: 'تسجيل الخروج', route: null, action: 'logout' }
            ]
        }
    ];

    /**
     * Render the profile menu
     * Loads user data and displays the menu
     */
    async function renderProfileMenu() {
        const headerContainer = document.getElementById('profile-header-container');
        const sectionsContainer = document.getElementById('profile-menu-sections');

        if (!headerContainer || !sectionsContainer) {
            console.error('Profile menu containers not found');
            return;
        }

        // Load user data from JSON file
        let userData = null;
        try {
            const response = await fetch('json-data/user-data.json');
            if (response.ok) {
                userData = await response.json();
            }
        } catch (error) {
            console.warn('Could not load user data:', error);
        }

        // Render header with user data
        headerContainer.innerHTML = createProfileHeader(userData);

        // Render all menu sections
        const sectionsHTML = menuConfig.map(section => createMenuSection(section)).join('');
        sectionsContainer.innerHTML = sectionsHTML;

        // Initialize Lucide icons for the menu
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Update profile image in basic-data-view if it exists
        updateBasicDataProfileImage(userData);

        // Attach click event listeners to menu items
        attachMenuListeners();
    }

    /**
     * Update profile image in basic-data-view
     * @param {Object} userData - User data object
     */
    function updateBasicDataProfileImage(userData) {
        const basicDataImage = document.getElementById('basic-data-profile-image');
        if (!basicDataImage) return;

        const imageUrl = userData?.imageUrl || userData?.image || userData?.avatar || null;
        const placeholder = basicDataImage.querySelector('.profile-image-placeholder');

        if (imageUrl) {
            let img = basicDataImage.querySelector('img');
            if (!img) {
                img = document.createElement('img');
                img.alt = 'صورة الملف الشخصي';
                basicDataImage.appendChild(img);
            }
            img.src = imageUrl;
            img.onerror = function () {
                if (img.parentNode) {
                    img.parentNode.removeChild(img);
                }
                if (placeholder) {
                    placeholder.style.display = 'block';
                }
            };
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        } else {
            const img = basicDataImage.querySelector('img');
            if (img) {
                img.remove();
            }
            if (placeholder) {
                placeholder.style.display = 'block';
            }
        }
    }

    /**
     * Attach event listeners to menu items
     * Makes menu items clickable
     */
    function attachMenuListeners() {
        const menuItems = document.querySelectorAll('.menu-item[data-route], .menu-item[data-action]');

        menuItems.forEach(item => {
            item.addEventListener('click', function () {
                const route = this.getAttribute('data-route');
                const action = this.getAttribute('data-action');

                if (route) {
                    // If item has a route, navigate to that route
                    navigateToProfileRoute(route);
                } else if (action) {
                    // If item has an action, handle the action
                    handleMenuAction(action);
                }
            });
        });
    }

    /**
     * Handle menu actions
     * Processes clicks on menu items that have actions
     * @param {string} action - The action name
     */
    function handleMenuAction(action) {
        // Get profile section element once for reuse
        const profileSection = document.getElementById('profile-section');

        switch (action) {
            case 'favorites':
                // Navigate to favorites view
                if (profileSection && !profileSection.classList.contains('active')) {
                    // Switch to profile section first
                    if (typeof window.switchToSection === 'function') {
                        window.switchToSection('profile-section');
                        // Wait for section to be visible, then navigate to favorites
                        setTimeout(() => {
                            navigateToProfileRoute(ProfileRoutes.FAVORITES);
                        }, 300);
                    } else {
                        navigateToProfileRoute(ProfileRoutes.FAVORITES);
                    }
                } else {
                    navigateToProfileRoute(ProfileRoutes.FAVORITES);
                }
                break;
            case 'settings':
                // Navigate to settings view
                if (profileSection && !profileSection.classList.contains('active')) {
                    // Switch to profile section first
                    if (typeof window.switchToSection === 'function') {
                        window.switchToSection('profile-section');
                        // Wait for section to be visible, then navigate to settings
                        setTimeout(() => {
                            navigateToProfileRoute(ProfileRoutes.SETTINGS);
                        }, 300);
                    } else {
                        navigateToProfileRoute(ProfileRoutes.SETTINGS);
                    }
                } else {
                    navigateToProfileRoute(ProfileRoutes.SETTINGS);
                }
                break;
            case 'wallet':
                // TODO: Navigate to wallet
                break;
            case 'transactions':
                // TODO: Navigate to transactions
                break;
            case 'reports':
                // TODO: Navigate to reports
                break;
            case 'statements':
                // TODO: Navigate to statements
                break;
            case 'terms':
                // TODO: Show terms
                break;
            case 'privacy':
                // TODO: Show privacy
                break;
            case 'help':
                // TODO: Show help
                break;
            case 'logout':
                // Handle logout
                if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                    // TODO: Implement logout logic
                }
                break;
            default:
                console.warn('Unknown action:', action);
        }
    }

    /**
     * Navigate to a profile route
     * Main function for switching between profile views
     * @param {string} route - The route to navigate to (menu, account-info, or settings)
     */
    function navigateToProfileRoute(route) {
        // Prevent recursive calls
        if (isNavigatingProfileRoute) {
            return;
        }

        // If already on the same route, don't navigate again
        if (currentProfileRoute === route) {
            return;
        }

        isNavigatingProfileRoute = true;

        // Set flag to prevent unwanted section switches
        if (typeof window.setNavigatingWithinProfile === 'function') {
            window.setNavigatingWithinProfile(true);
        }

        const menuView = document.getElementById('profile-menu-view');
        const accountInfoView = document.getElementById('profile-account-info-view');

        if (!menuView || !accountInfoView) {
            console.error('Profile views not found');
            isNavigatingProfileRoute = false;
            return;
        }

        // Scroll to top when navigating
        window.scrollToTop();

        // Get profile section element once for reuse
        const profileSection = document.getElementById('profile-section');

        // Handle navigation to account-info route
        if (route === ProfileRoutes.ACCOUNT_INFO) {
            // Show account tabs header
            const accountTabsHeader = document.getElementById('account-tabs-header');
            if (accountTabsHeader) {
                accountTabsHeader.style.display = 'flex';
            }
            // Hide profile page title
            const profilePageTitle = document.querySelector('.profile-page-title');
            if (profilePageTitle) {
                profilePageTitle.style.display = 'none';
            }
            // Hide all card headers (but not the main account-tabs-header)
            document.querySelectorAll('.account-tabs-header').forEach(header => {
                if (header.id && header.id.startsWith('card-header-')) {
                    header.style.display = 'none';
                }
            });

            // Show account info view
            menuView.classList.remove('active');
            accountInfoView.classList.add('active');
            currentProfileRoute = route;

            // Update URL hash
            window.location.hash = '#/profile/account-info';

            // Hide all tab views and show tabs
            const accountTabs = document.querySelector('.account-tabs');
            const tabViews = document.querySelectorAll('.tab-view');

            // Hide all tab views
            tabViews.forEach(view => {
                view.classList.remove('active');
            });

            // Show account tabs
            if (accountTabs) {
                accountTabs.classList.remove('hidden');
                // Reset any active tab states
                const tabs = accountTabs.querySelectorAll('.account-tab');
                tabs.forEach(tab => tab.classList.remove('active'));
            }

            // Update sticky header positions
            if (typeof window.AccountInfoTabs !== 'undefined' && typeof window.AccountInfoTabs.updateStickyPositions === 'function') {
                window.AccountInfoTabs.updateStickyPositions();
            }

            // Initialize account tabs if not already initialized
            if (typeof window.AccountInfoTabs !== 'undefined' && typeof window.AccountInfoTabs.initAccountTabs === 'function') {
                setTimeout(() => {
                    window.AccountInfoTabs.initAccountTabs();
                }, 100);
            }

            // Push navigation state to history after navigation completes
            setTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
                isNavigatingProfileRoute = false;
            }, 300);
        }
        // Handle navigation to favorites route
        else if (route === ProfileRoutes.FAVORITES) {
            // Ensure profile section is active and visible
            if (profileSection) {
                profileSection.classList.add('active');
                profileSection.style.display = 'block';
                profileSection.style.visibility = 'visible';
                profileSection.style.opacity = '1';
                profileSection.style.pointerEvents = 'auto';
                profileSection.style.transform = 'translateX(0)';
            }

            // Hide profile page title
            const profilePageTitle = document.querySelector('.profile-page-title');
            if (profilePageTitle) {
                profilePageTitle.style.display = 'none';
            }
            // Hide account tabs header
            const accountTabsHeader = document.getElementById('account-tabs-header');
            if (accountTabsHeader) {
                accountTabsHeader.style.display = 'none';
            }
            // Hide all card headers
            document.querySelectorAll('.account-tabs-header').forEach(header => {
                if (header.id && header.id.startsWith('card-header-')) {
                    header.style.display = 'none';
                }
            });

            // Show favorites header
            const favoritesHeader = document.getElementById('favorites-header');
            if (favoritesHeader) {
                favoritesHeader.style.display = 'flex';
            }

            // Hide menu view, account info view, and settings view
            menuView.classList.remove('active');
            accountInfoView.classList.remove('active');
            const settingsView = document.getElementById('profile-settings-view');
            if (settingsView) {
                settingsView.classList.remove('active');
            }

            // Show favorites view
            const favoritesView = document.getElementById('profile-favorites-view');
            if (favoritesView) {
                favoritesView.classList.add('active');
                currentProfileRoute = route;

                // Update URL hash
                window.location.hash = '#/profile/favorites';

                // Initialize favorites page
                if (typeof window.FavoritesPage !== 'undefined' && typeof window.FavoritesPage.init === 'function') {
                    setTimeout(() => {
                        window.FavoritesPage.init();
                        // Update header position after initialization
                        if (typeof window.FavoritesPage.updateHeaderPosition === 'function') {
                            window.FavoritesPage.updateHeaderPosition();
                        }
                    }, 100);
                }

                // Initialize Lucide icons
                if (typeof lucide !== 'undefined') {
                    setTimeout(() => {
                        lucide.createIcons();
                    }, 100);
                }
            } else {
                console.error('[Navigation] Favorites view not found');
            }

            // Push navigation state to history after navigation completes
            setTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
                isNavigatingProfileRoute = false;
            }, 400);
        }
        // Handle navigation to settings route
        else if (route === ProfileRoutes.SETTINGS) {
            // Ensure profile section is active and visible
            if (profileSection) {
                profileSection.classList.add('active');
                profileSection.style.display = 'block';
                profileSection.style.visibility = 'visible';
                profileSection.style.opacity = '1';
                profileSection.style.pointerEvents = 'auto';
                profileSection.style.transform = 'translateX(0)';
            }

            // Hide profile page title
            const profilePageTitle = document.querySelector('.profile-page-title');
            if (profilePageTitle) {
                profilePageTitle.style.display = 'none';
            }
            // Hide account tabs header
            const accountTabsHeader = document.getElementById('account-tabs-header');
            if (accountTabsHeader) {
                accountTabsHeader.style.display = 'none';
            }
            // Hide all card headers
            document.querySelectorAll('.account-tabs-header').forEach(header => {
                if (header.id && header.id.startsWith('card-header-')) {
                    header.style.display = 'none';
                }
            });

            // Show settings header
            const settingsHeader = document.getElementById('settings-header');
            if (settingsHeader) {
                settingsHeader.style.display = 'flex';
            }

            // Hide menu view and account info view
            menuView.classList.remove('active');
            accountInfoView.classList.remove('active');

            // Show settings view
            const settingsView = document.getElementById('profile-settings-view');
            if (settingsView) {
                settingsView.classList.add('active');
                currentProfileRoute = route;

                // Update URL hash
                window.location.hash = '#/profile/settings';

                // Initialize settings page
                if (typeof window.SettingsPage !== 'undefined' && typeof window.SettingsPage.init === 'function') {
                    setTimeout(() => {
                        window.SettingsPage.init();
                    }, 100);
                }

                // Initialize Lucide icons
                if (typeof lucide !== 'undefined') {
                    setTimeout(() => {
                        lucide.createIcons();
                    }, 100);
                }
            } else {
                console.error('[Navigation] Settings view not found');
            }

            // Push navigation state to history after navigation completes
            setTimeout(() => {
                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
                isNavigatingProfileRoute = false;
            }, 400);
        }
        // Handle navigation to menu route
        else if (route === ProfileRoutes.MENU) {
            // Show profile page title
            const profilePageTitle = document.querySelector('.profile-page-title');
            if (profilePageTitle) {
                profilePageTitle.style.display = 'block';
            }
            // Hide account tabs header
            const accountTabsHeader = document.getElementById('account-tabs-header');
            if (accountTabsHeader) {
                accountTabsHeader.style.display = 'none';
            }
            // Hide all card headers, settings header, and favorites header
            document.querySelectorAll('.account-tabs-header').forEach(header => {
                if (header.id && header.id.startsWith('card-header-')) {
                    header.style.display = 'none';
                }
            });
            const settingsHeader = document.getElementById('settings-header');
            if (settingsHeader) {
                settingsHeader.style.display = 'none';
            }
            const favoritesHeader = document.getElementById('favorites-header');
            if (favoritesHeader) {
                favoritesHeader.style.display = 'none';
            }

            // Show menu view
            const settingsView = document.getElementById('profile-settings-view');
            if (settingsView) {
                settingsView.classList.remove('active');
            }
            const favoritesView = document.getElementById('profile-favorites-view');
            if (favoritesView) {
                favoritesView.classList.remove('active');
            }
            accountInfoView.classList.remove('active');
            menuView.classList.add('active');
            currentProfileRoute = route;

            // Ensure profile section is active
            if (profileSection) {
                profileSection.classList.add('active');
                profileSection.style.display = 'block';
                profileSection.style.visibility = 'visible';
                profileSection.style.opacity = '1';
                profileSection.style.pointerEvents = 'auto';
                profileSection.style.transform = 'translateX(0)';
            }

            // Update sticky header positions
            if (typeof window.AccountInfoTabs !== 'undefined' && typeof window.AccountInfoTabs.updateStickyPositions === 'function') {
                window.AccountInfoTabs.updateStickyPositions();
            }

            // Reset account info tabs state
            const accountTabs = document.querySelector('.account-tabs');
            const tabViews = document.querySelectorAll('.tab-view');

            if (accountTabs) {
                accountTabs.classList.remove('hidden');
            }

            tabViews.forEach(view => {
                view.classList.remove('active');
            });

            // Update URL hash
            window.location.hash = '#/profile';

            // Push navigation state to history after navigation completes
            setTimeout(() => {
                // Double-check profile section is active before pushing state
                const profileSectionCheck = document.getElementById('profile-section');
                if (profileSectionCheck && !profileSectionCheck.classList.contains('active')) {
                    profileSectionCheck.classList.add('active');
                }

                if (typeof window.pushNavigationState === 'function') {
                    window.pushNavigationState(false);
                }
                isNavigatingProfileRoute = false;
                // Clear the flag after a bit more delay to ensure navigation is complete
                setTimeout(() => {
                    if (typeof window.setNavigatingWithinProfile === 'function') {
                        window.setNavigatingWithinProfile(false);
                    }
                }, 100);
            }, 300);
        } else {
            isNavigatingProfileRoute = false;
            if (typeof window.setNavigatingWithinProfile === 'function') {
                window.setNavigatingWithinProfile(false);
            }
        }
    }

    /**
     * Initialize close button handler
     */
    function initCloseButton() {
        const closeBtn = document.getElementById('profile-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                navigateToProfileRoute(ProfileRoutes.MENU);
            });
        }
    }

    /**
     * Initialize browser navigation handlers
     * Handles browser back button and URL hash changes
     */
    function initBrowserNavigation() {
        // Handle hash changes (when URL changes)
        window.addEventListener('hashchange', function () {
            // Only handle hashchange if we're not already navigating (to prevent recursion)
            if (isNavigatingProfileRoute) {
                return;
            }

            const hash = window.location.hash;
            if (hash === '#/profile' || hash === '#/profile/' || !hash.includes('/profile')) {
                navigateToProfileRoute(ProfileRoutes.MENU);
            } else if (hash === '#/profile/account-info') {
                navigateToProfileRoute(ProfileRoutes.ACCOUNT_INFO);
            } else if (hash === '#/profile/settings') {
                navigateToProfileRoute(ProfileRoutes.SETTINGS);
            } else if (hash === '#/profile/favorites') {
                navigateToProfileRoute(ProfileRoutes.FAVORITES);
            }
        });

        // Handle initial hash (when page loads with a hash)
        const hash = window.location.hash;
        if (hash === '#/profile/account-info') {
            // If directly accessing account info, show it
            setTimeout(() => {
                navigateToProfileRoute(ProfileRoutes.ACCOUNT_INFO);
            }, 100);
        }

        // Handle Android back button (popstate event)
        window.addEventListener('popstate', function (event) {
            const hash = window.location.hash;
            if (hash === '#/profile' || hash === '#/profile/' || !hash.includes('/profile')) {
                navigateToProfileRoute(ProfileRoutes.MENU);
            } else if (hash === '#/profile/account-info') {
                navigateToProfileRoute(ProfileRoutes.ACCOUNT_INFO);
            } else if (hash === '#/profile/settings') {
                navigateToProfileRoute(ProfileRoutes.SETTINGS);
            } else if (hash === '#/profile/favorites') {
                navigateToProfileRoute(ProfileRoutes.FAVORITES);
            }
        });

        // Handle back button press (for mobile apps/Cordova)
        if (typeof document.addEventListener !== 'undefined') {
            document.addEventListener('backbutton', function (event) {
                if (currentProfileRoute === ProfileRoutes.ACCOUNT_INFO ||
                    currentProfileRoute === ProfileRoutes.SETTINGS ||
                    currentProfileRoute === ProfileRoutes.FAVORITES) {
                    // Go back to menu
                    navigateToProfileRoute(ProfileRoutes.MENU);
                    if (event && event.preventDefault) {
                        event.preventDefault();
                    }
                }
            }, false);
        }
    }

    /**
     * Initialize the profile system
     * Sets up all profile-related functionality
     */
    function initProfileSystem() {
        // Only initialize if we're in profile section
        const profileSection = document.getElementById('profile-section');
        if (!profileSection) {
            return;
        }

        // Render menu on initialization
        renderProfileMenu();

        // Initialize close button
        initCloseButton();

        // Initialize browser navigation
        initBrowserNavigation();

        // Re-render menu when profile section becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = profileSection.classList.contains('active');
                    if (isActive) {
                        // Check if menu view is active and needs rendering
                        const menuView = document.getElementById('profile-menu-view');
                        if (menuView && menuView.classList.contains('active') && currentProfileRoute === ProfileRoutes.MENU) {
                            // Re-render menu to ensure icons are initialized
                            setTimeout(() => {
                                renderProfileMenu();
                            }, 100);
                        }
                    }
                }
            });
        });

        observer.observe(profileSection, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Also listen for profile button clicks to ensure menu is rendered
        const profileBtn = document.querySelector('.header-profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', function () {
                // Reset to menu view when opening profile
                if (currentProfileRoute !== ProfileRoutes.MENU) {
                    navigateToProfileRoute(ProfileRoutes.MENU);
                }
                // Render menu after a short delay to ensure section is visible
                setTimeout(() => {
                    renderProfileMenu();
                }, 200);
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initProfileSystem();
        });
    } else {
        initProfileSystem();
    }

    /**
     * Export ProfileNavigation object for use by other files
     * Allows other files to navigate to profile routes
     */
    window.ProfileNavigation = {
        navigateTo: navigateToProfileRoute,
        routes: ProfileRoutes
    };

    /**
     * Export header creation functions for use in other files
     */
    window.createProfilePageTitle = createProfilePageTitle;
    window.createAccountTabsHeader = createAccountTabsHeader;
    window.createCardHeader = createCardHeader;
})();