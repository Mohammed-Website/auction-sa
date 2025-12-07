// Utility Functions
(function () {
    'use strict';

    // Scroll to top function
    window.scrollToTop = function () {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    };
})();

// Tab Switching Logic with Horizontal Sliding Animation
(function () {
    'use strict';

    // Section order for direction detection (RTL)
    const sectionOrder = [
        'home-section',
        'sell-section',
        'rent-section',
        'auction-section',
        'profile-section'
    ];

    // Get all sections and navigation items
    const sections = document.querySelectorAll('.tab-section');
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    const topNavItems = document.querySelectorAll('.top-nav .top-nav-item');
    const quickAccessBoxes = document.querySelectorAll('.access-box');

    // Current active section
    let currentSection = 'home-section';

    // Get section index in order
    function getSectionIndex(sectionId) {
        return sectionOrder.indexOf(sectionId);
    }

    // Get direction of slide animation
    function getSlideDirection(fromIndex, toIndex) {
        // For RTL: moving to higher index means sliding from right (translateX 100%)
        // Moving to lower index means sliding from left (translateX -100%)
        return toIndex > fromIndex ? 'right' : 'left';
    }

    // Clear all property cards from view
    function clearPropertyCards() {
        const propertyGrids = [
            'home-properties-grid',
            'sell-properties-grid',
            'rent-properties-grid',
            'auction-properties-grid'
        ];

        propertyGrids.forEach(gridId => {
            const grid = document.getElementById(gridId);
            if (grid) {
                // Clear all property cards but keep the grid element
                const cards = grid.querySelectorAll('.property-card, .auction-card');
                cards.forEach(card => {
                    card.style.display = 'none';
                    card.remove();
                });
            }
        });
    }

    // Ensure only profile section content is visible
    function ensureProfileOnlyVisible() {
        // Hide all property sections
        const propertySections = ['home-section', 'sell-section', 'rent-section', 'auction-section'];

        propertySections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.remove('active');
                section.style.display = 'none';
                section.style.opacity = '0';
                section.style.visibility = 'hidden';
                section.style.pointerEvents = 'none';
                section.style.transform = 'translateX(100%)';
            }
        });

        // Hide banner section smoothly (use only active class)
        const bannerSection = document.querySelector('.banner-section');
        if (bannerSection) {
            bannerSection.classList.remove('active');
        }

        // Clear any visible property cards
        clearPropertyCards();
    }

    // Switch to a section with animation
    function switchToSection(sectionId) {
        /* Call a function to scroll to the top of the page */
        window.scrollToTop();


        // Prevent switching to the same section
        if (sectionId === currentSection) {
            // If clicking the same section, still update visibility of subsections
            if (sectionId === 'auction-section' || sectionId === 'sell-section' || sectionId === 'rent-section') {
                toggleHomeSubsections(sectionId);
            }
            return;
        }

        // Handle special cases: auction-section, sell-section, rent-section
        // These are now subsections within home-section
        if (sectionId === 'auction-section' || sectionId === 'sell-section' || sectionId === 'rent-section') {
            // Switch to home-section and show/hide appropriate subsections
            const homeSection = document.getElementById('home-section');
            const currentActiveSection = document.querySelector('.tab-section.active');

            if (!homeSection) {
                return;
            }

            // Hide profile if it's active
            const profileSection = document.getElementById('profile-section');
            if (profileSection && profileSection.classList.contains('active')) {
                profileSection.classList.remove('active');
                profileSection.style.display = 'none';
                profileSection.style.opacity = '0';
                profileSection.style.visibility = 'hidden';
                profileSection.style.pointerEvents = 'none';
            }

            // Show banner section smoothly when navigating to these sections (use only active class)
            const bannerSection = document.querySelector('.banner-section');
            if (bannerSection) {
                bannerSection.classList.add('active');
            }

            // Switch to home-section if not already active
            if (currentActiveSection && currentActiveSection.id !== 'home-section') {
                currentActiveSection.classList.remove('active');
                currentActiveSection.style.display = 'none';
                currentActiveSection.style.opacity = '0';
                currentActiveSection.style.visibility = 'hidden';
                currentActiveSection.style.pointerEvents = 'none';
            }

            // Show home-section
            homeSection.style.display = 'block';
            homeSection.style.visibility = 'visible';
            homeSection.style.opacity = '1';
            homeSection.style.pointerEvents = 'auto';
            homeSection.style.transform = 'translateX(0)';
            homeSection.classList.add('active');

            // Toggle visibility of subsections
            toggleHomeSubsections(sectionId);

            // Update current section
            currentSection = sectionId;

            // Update active states on all navigation items
            updateActiveNavItems(sectionId);

            // Load data if needed
            if (typeof window.reloadSectionData === 'function') {
                setTimeout(() => {
                    window.reloadSectionData('home-section');
                }, 100);
            }

            return;
        }

        const targetSection = document.getElementById(sectionId);
        const currentActiveSection = document.querySelector('.tab-section.active');

        if (!targetSection || !currentActiveSection) {
            return;
        }

        // Special handling for profile section
        if (sectionId === 'profile-section') {
            ensureProfileOnlyVisible();

            // Prepare profile section - position it off-screen from the left
            targetSection.style.display = 'block';
            targetSection.style.transform = 'translateX(-100%)';
            targetSection.style.opacity = '0';
            targetSection.style.visibility = 'visible';
            targetSection.style.pointerEvents = 'none';
            targetSection.classList.remove('active');

            // Force reflow to ensure styles are applied
            targetSection.offsetHeight;

            // Clean up current section first
            currentActiveSection.classList.remove('active');
            currentActiveSection.style.display = 'none';
            currentActiveSection.style.opacity = '0';
            currentActiveSection.style.visibility = 'hidden';
            currentActiveSection.style.pointerEvents = 'none';

            // Animate profile section in from the left
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    targetSection.style.transform = 'translateX(0)';
                    targetSection.style.opacity = '1';
                    targetSection.style.pointerEvents = 'auto';
                    targetSection.classList.add('active');
                });
            });

            // Update current section
            currentSection = sectionId;

            // Update active states on all navigation items
            updateActiveNavItems(sectionId);

            return;
        }

        // For non-profile sections, ensure profile is hidden
        const profileSection = document.getElementById('profile-section');
        if (profileSection && profileSection.classList.contains('active')) {
            profileSection.classList.remove('active');
            profileSection.style.display = 'none';
            profileSection.style.opacity = '0';
            profileSection.style.visibility = 'hidden';
            profileSection.style.pointerEvents = 'none';
        }

        // Show banner section smoothly when navigating to other sections (use only active class)
        const bannerSection = document.querySelector('.banner-section');
        if (bannerSection && (sectionId === 'home-section' || sectionId === 'sell-section' || sectionId === 'rent-section' || sectionId === 'auction-section')) {
            bannerSection.classList.add('active');
        }

        // Get direction for animation
        const fromIndex = getSectionIndex(currentSection);
        const toIndex = getSectionIndex(sectionId);
        const direction = getSlideDirection(fromIndex, toIndex);

        // Remove active class from current section (will trigger exit animation)
        currentActiveSection.classList.remove('active');

        // Add appropriate slide-out class based on direction
        if (direction === 'right') {
            currentActiveSection.classList.add('slide-out-left');
        } else {
            currentActiveSection.classList.add('slide-out-right');
        }

        // Ensure target section is visible before animation
        targetSection.style.display = 'block';

        // Prepare target section - position it off-screen in opposite direction
        if (direction === 'right') {
            targetSection.classList.remove('slide-in-left');
            targetSection.classList.add('slide-in-right');
        } else {
            targetSection.classList.remove('slide-in-right');
            targetSection.classList.add('slide-in-left');
        }

        // Force reflow to ensure classes are applied
        targetSection.offsetHeight;

        // Small delay to ensure exit animation starts
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Remove slide-in class and add active to trigger enter animation
                targetSection.classList.remove('slide-in-left', 'slide-in-right');
                targetSection.classList.add('active');

                // Clean up current section after animation completes
                setTimeout(() => {
                    currentActiveSection.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right', 'active');
                    currentActiveSection.style.display = 'none';
                }, 350); // Match CSS transition duration
            });
        });

        // Save previous section before updating
        const previousSection = currentSection;

        // Update current section
        currentSection = sectionId;

        // If switching to home-section, show all subsections
        if (sectionId === 'home-section') {
            toggleHomeSubsections('home-section');
        }

        // Update active states on all navigation items
        updateActiveNavItems(sectionId);

        // Load section data if it's a property section and hasn't been loaded
        if (sectionId !== 'profile-section' && typeof window.reloadSectionData === 'function') {
            // Wait for section to become visible (after animation completes)
            setTimeout(() => {
                // Verify section is actually visible
                const sectionElement = document.getElementById(sectionId);
                if (sectionElement) {
                    const sectionStyle = window.getComputedStyle(sectionElement);
                    const isVisible = sectionElement.classList.contains('active') &&
                        sectionStyle.visibility !== 'hidden' &&
                        sectionStyle.opacity !== '0' &&
                        sectionStyle.display !== 'none';

                    if (!isVisible) {
                        console.warn(`Section ${sectionId} is not visible yet, waiting...`);
                        // Force visibility
                        sectionElement.style.display = 'block';
                        sectionElement.style.visibility = 'visible';
                        sectionElement.style.opacity = '1';
                        sectionElement.style.pointerEvents = 'auto';
                    }
                }

                // Find the grid element by ID based on section
                let gridId = '';
                if (sectionId === 'home-section') gridId = 'home-properties-grid';
                else if (sectionId === 'sell-section') gridId = 'sell-properties-grid';
                else if (sectionId === 'rent-section') gridId = 'rent-properties-grid';
                else if (sectionId === 'auction-section') gridId = 'auction-properties-grid';

                const targetGrid = document.getElementById(gridId);
                if (targetGrid) {
                    // Always reload when switching to a different section
                    // This ensures cards are properly rendered and visible
                    const wasPreviousActive = (previousSection === sectionId);

                    if (!wasPreviousActive) {
                        // Switching to a new section - always reload
                        const config = window.dataConfig ? window.dataConfig[sectionId] : null;
                        const jsonFile = config ? config.url : 'unknown';
                        window.reloadSectionData(sectionId).then(() => {
                            // Re-initialize Lucide icons after cards are rendered
                            if (typeof lucide !== 'undefined') {
                                lucide.createIcons();
                            }

                            // Double-check section visibility after rendering
                            if (sectionElement) {
                                sectionElement.style.display = 'block';
                                sectionElement.style.visibility = 'visible';
                                sectionElement.style.opacity = '1';
                                sectionElement.style.pointerEvents = 'auto';
                                if (!sectionElement.classList.contains('active')) {
                                    sectionElement.classList.add('active');
                                }
                            }
                        }).catch(err => {
                            console.error(`Error loading data for ${sectionId}:`, err);
                        });
                    } else {
                        // Same section (shouldn't happen due to early return, but check anyway)
                        const hasCards = targetGrid.querySelector('.property-card, .auction-card-new');
                        const isEmpty = targetGrid.children.length === 0;

                        if (!hasCards || isEmpty) {
                            window.reloadSectionData(sectionId).then(() => {
                                if (typeof lucide !== 'undefined') {
                                    lucide.createIcons();
                                }
                            }).catch(err => {
                                console.error(`Error loading data for ${sectionId}:`, err);
                            });
                        }
                    }
                } else {
                    // Grid not found, try to load anyway
                    console.warn(`Grid not found for ${sectionId} (gridId: ${gridId}), attempting to load data...`);
                    window.reloadSectionData(sectionId).then(() => {
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                    }).catch(err => {
                        console.error(`Error loading data for ${sectionId}:`, err);
                    });
                }
            }, 450); // Wait for animation to complete (slightly longer to ensure visibility)
        }
    }

    // Update active class on navigation items
    function updateActiveNavItems(sectionId) {
        // Update bottom nav
        bottomNavItems.forEach(item => {
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update top nav
        topNavItems.forEach(item => {
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Handle navigation item click
    function handleNavClick(e) {
        e.preventDefault();
        const sectionId = this.getAttribute('data-section');
        if (sectionId) {
            switchToSection(sectionId);
        }
    }

    // Toggle visibility of home-section subsections with smooth animation
    function toggleHomeSubsections(activeSubsection) {
        const auctionsSubsection = document.getElementById('auctions-section');
        const sellSubsection = document.getElementById('sell-section');
        const rentSubsection = document.getElementById('rent-section');

        const allSubsections = [auctionsSubsection, sellSubsection, rentSubsection].filter(Boolean);

        // First, fade out all subsections
        allSubsections.forEach(subsection => {
            if (subsection) {
                subsection.style.opacity = '0';
                subsection.style.transform = 'translateX(20px)';
                subsection.style.visibility = 'hidden';
            }
        });

        // After fade out completes, update display and fade in selected ones
        setTimeout(() => {
            // Hide all subsections
            allSubsections.forEach(subsection => {
                if (subsection) {
                    subsection.style.display = 'none';
                }
            });

            // Show the selected subsection(s) and fade in
            if (activeSubsection === 'auction-section' && auctionsSubsection) {
                auctionsSubsection.style.display = 'block';
                requestAnimationFrame(() => {
                    auctionsSubsection.style.opacity = '1';
                    auctionsSubsection.style.transform = 'translateX(0)';
                    auctionsSubsection.style.visibility = 'visible';
                });
            } else if (activeSubsection === 'sell-section' && sellSubsection) {
                sellSubsection.style.display = 'block';
                requestAnimationFrame(() => {
                    sellSubsection.style.opacity = '1';
                    sellSubsection.style.transform = 'translateX(0)';
                    sellSubsection.style.visibility = 'visible';
                });
            } else if (activeSubsection === 'rent-section' && rentSubsection) {
                rentSubsection.style.display = 'block';
                requestAnimationFrame(() => {
                    rentSubsection.style.opacity = '1';
                    rentSubsection.style.transform = 'translateX(0)';
                    rentSubsection.style.visibility = 'visible';
                });
            } else if (activeSubsection === 'home-section') {
                // Show all subsections for home-section
                allSubsections.forEach((subsection, index) => {
                    if (subsection) {
                        subsection.style.display = 'block';
                        // Stagger the animations slightly for a nicer effect
                        setTimeout(() => {
                            requestAnimationFrame(() => {
                                subsection.style.opacity = '1';
                                subsection.style.transform = 'translateX(0)';
                                subsection.style.visibility = 'visible';
                            });
                        }, index * 50);
                    }
                });
            }
        }, 200); // Wait for fade out to complete
    }

    // Handle quick access box click
    function handleQuickAccessClick(e) {
        e.preventDefault();
        const sectionId = this.getAttribute('data-section');
        if (sectionId) {
            switchToSection(sectionId);
        }
    }

    // Attach event listeners
    function init() {
        // Bottom navigation items
        bottomNavItems.forEach(item => {
            item.addEventListener('click', handleNavClick);
        });

        // Top navigation items
        topNavItems.forEach(item => {
            item.addEventListener('click', handleNavClick);
        });

        // Quick access boxes
        quickAccessBoxes.forEach(box => {
            box.addEventListener('click', handleQuickAccessClick);
        });

        // Header profile button
        const headerProfileBtn = document.querySelector('.header-profile-btn');
        if (headerProfileBtn) {
            headerProfileBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                if (sectionId) {
                    switchToSection(sectionId);
                }
            });
        }

        // Add property buttons
        const addPropertyBtns = document.querySelectorAll('.add-property-btn');
        addPropertyBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
            });
        });

        // Prevent default anchor behavior on all navigation links
        document.querySelectorAll('a[href="#"]').forEach(link => {
            link.addEventListener('click', function (e) {
                // Only prevent if it's a nav item or access box
                if (this.classList.contains('nav-item') ||
                    this.classList.contains('top-nav-item') ||
                    this.classList.contains('access-box')) {
                    e.preventDefault();
                }
            });
        });

        // Initialize Lucide icons
        if (typeof window.initLucideIcons === 'function') {
            setTimeout(() => {
                window.initLucideIcons();
            }, 100);
        } else if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }

    // Ensure initial active section is visible
    function ensureInitialState() {
        const activeSection = document.querySelector('.tab-section.active');

        // Hide all sections first
        sections.forEach(section => {
            section.style.display = 'none';
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
            section.style.pointerEvents = 'none';
            section.style.transform = 'translateX(100%)';
        });

        // Show only the active section
        if (activeSection) {
            activeSection.style.display = 'block';
            activeSection.style.transform = 'translateX(0)';
            activeSection.style.opacity = '1';
            activeSection.style.visibility = 'visible';
            activeSection.style.pointerEvents = 'auto';

            // If home-section is active, show all subsections
            if (activeSection.id === 'home-section') {
                toggleHomeSubsections('home-section');
            }
        } else {
            // If no section is active, activate home-section
            const homeSection = document.getElementById('home-section');
            if (homeSection) {
                homeSection.classList.add('active');
                homeSection.style.display = 'block';
                homeSection.style.transform = 'translateX(0)';
                homeSection.style.opacity = '1';
                homeSection.style.visibility = 'visible';
                homeSection.style.pointerEvents = 'auto';
                toggleHomeSubsections('home-section');
            }
        }

        // If profile section is active initially, ensure property sections are hidden and cleared
        if (activeSection && activeSection.id === 'profile-section') {
            ensureProfileOnlyVisible();
            // Re-show profile section after clearing
            activeSection.style.display = 'block';
            activeSection.style.opacity = '1';
            activeSection.style.visibility = 'visible';
            activeSection.style.pointerEvents = 'auto';
            activeSection.style.transform = 'translateX(0)';
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            ensureInitialState();
            init();
        });
    } else {
        ensureInitialState();
        init();
    }
})();

// Property Data Loading and Rendering
(function () {
    'use strict';

    // Data mapping configuration
    const dataConfig = {
        'home-section': {
            // Home section loads all data and organizes into 3 grids
            grids: {
                auctions: { gridId: 'home-auctions-grid', renderFunction: 'renderAuctionCard', url: 'json-data/auction-property.json' },
                sell: { gridId: 'home-sell-grid', renderFunction: 'renderPropertyCard', url: 'json-data/sell-property.json' },
                rent: { gridId: 'home-rent-grid', renderFunction: 'renderRentalCard', url: 'json-data/rent-property.json' }
            }
        },
        'sell-section': {
            url: 'json-data/sell-property.json',
            gridId: 'sell-properties-grid',
            renderFunction: 'renderPropertyCard'
        },
        'rent-section': {
            url: 'json-data/rent-property.json',
            gridId: 'rent-properties-grid',
            renderFunction: 'renderRentalCard'
        },
        'auction-section': {
            url: 'json-data/auction-property.json',
            gridId: 'auction-properties-grid',
            renderFunction: 'renderAuctionCard'
        }
    };

    // Format number with thousand separators
    function formatNumber(num) {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Format price for display
    function formatPrice(price) {
        return formatNumber(price) + ' ريال';
    }

    // Format rental price
    function formatRentalPrice(price) {
        return formatNumber(price) + ' ريال / شهرياً';
    }

    // Render property features
    function renderFeatures(property) {
        const features = [];

        if (property.bedrooms) {
            features.push(`<i data-lucide="bed" class="feature-icon"></i> ${property.bedrooms} ${property.bedrooms === 1 ? 'غرفة' : 'غرف'}`);
        }
        if (property.bathrooms) {
            features.push(`<i data-lucide="bath" class="feature-icon"></i> ${property.bathrooms} ${property.bathrooms === 1 ? 'حمام' : 'حمامات'}`);
        }
        if (property.area) {
            // Handle area format - could be "450 م²" or just "450"
            const areaValue = property.area.toString().replace(/[^\d]/g, '');
            const areaText = areaValue ? `${formatNumber(areaValue)} م²` : property.area;
            features.push(`<i data-lucide="maximize" class="feature-icon"></i> ${areaText}`);
        }

        if (features.length === 0) return '';

        return `
            <div class="property-features">
                ${features.map(feature => `<span>${feature}</span>`).join('')}
            </div>
        `;
    }

    // Render property badge if exists
    function renderBadge(badge) {
        if (!badge) return '';
        return `<div class="property-badge">${badge}</div>`;
    }

    // Get image URL with proper formatting
    function getImageUrl(property) {
        const imageUrl = property.image || property.imageUrl || null;
        if (!imageUrl) return null;

        // If it's an Unsplash URL without proper dimensions, add them
        if (imageUrl.includes('unsplash.com') && !imageUrl.includes('?w=') && !imageUrl.includes('?auto=')) {
            return `${imageUrl}?w=800&auto=format&fit=crop`;
        }

        return imageUrl;
    }

    // Preload image and return a promise
    function preloadImage(url) {
        return new Promise((resolve, reject) => {
            if (!url) {
                resolve(null);
                return;
            }

            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => {
                console.warn(`Failed to load image: ${url}`);
                resolve(url); // Resolve anyway to not block rendering
            };
            img.src = url;
        });
    }

    // Preload all images from properties
    async function preloadAllImages(properties) {
        const imageUrls = properties
            .map(property => getImageUrl(property))
            .filter(url => url !== null);

        const preloadPromises = imageUrls.map(url => preloadImage(url));
        await Promise.all(preloadPromises);
    }

    // Render property card (for home and sell sections)
    function renderPropertyCard(property) {
        if (!property) return '';

        const imageUrl = getImageUrl(property);
        const imageStyle = imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : '';

        return `
            <div class="property-card">
                <div class="property-image" ${imageStyle}></div>
                ${renderBadge(property.badge)}
                <div class="property-info">
                    <h3>${property.title || 'عقار للبيع'}</h3>
                    <p class="property-location"><i data-lucide="map-pin" class="location-icon"></i> ${property.location || 'غير محدد'}</p>
                    ${renderFeatures(property)}
                    <p class="property-price">${property.price ? (property.price.includes('ريال') ? property.price : `${property.price} ريال`) : 'غير محدد'}</p>
                </div>
            </div>
        `;
    }

    // Render rental card (for rent section)
    function renderRentalCard(property) {
        if (!property) return '';

        const imageUrl = getImageUrl(property);
        const imageStyle = imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : '';

        // Handle price - check if it already includes "/ شهرياً" or "/ سنوياً"
        let priceText = property.price || '';
        if (priceText && !priceText.includes('/')) {
            priceText = formatRentalPrice(priceText);
        }

        return `
            <div class="property-card rental-card">
                <div class="property-image" ${imageStyle}></div>
                ${renderBadge(property.badge)}
                <div class="property-info">
                    <h3>${property.title || 'عقار للإيجار'}</h3>
                    <p class="property-location"><i data-lucide="map-pin" class="location-icon"></i> ${property.location || 'غير محدد'}</p>
                    ${renderFeatures(property)}
                    <p class="property-price rental-price">${priceText || 'غير محدد'}</p>
                </div>
            </div>
        `;
    }

    // Render auction card (for auction section)
    function renderAuctionCard(auction) {
        if (!auction) return '';

        const imageUrl = getImageUrl(auction);
        const imageStyle = imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : '';

        // Handle timer - use 'timer' from JSON or fallback to 'timeRemaining'
        const timeRemaining = auction.timer || auction.timeRemaining || 'غير محدد';

        // Get start date (if available in JSON)
        const startDate = auction.startDate || auction.date || '';

        // Format starting bid/current bid - check if it already includes "ريال"
        let startingBid = auction.currentBid || auction.startingBid || '';
        if (startingBid && !startingBid.includes('ريال')) {
            startingBid = formatPrice(startingBid);
        }

        return `
            <div class="auction-card-new">
                <div class="auction-banner" ${imageStyle}>
                    <div class="auction-badges">
                        <span class="status-badge live-badge">
                            <i data-lucide="circle" class="badge-dot"></i>
                            جاري الآن
                        </span>
                        <span class="status-badge electronic-badge">
                            <i data-lucide="globe" class="badge-icon"></i>
                            إلكتروني
                        </span>
                    </div>
                </div>
                <div class="auction-content">
                    <h3 class="auction-title">${auction.title || 'عقار في المزاد'}</h3>
                    <div class="auction-meta">
                        ${startDate ? `<div class="auction-date"><i data-lucide="calendar" class="meta-icon"></i> ${startDate}</div>` : ''}
                        <div class="auction-timer-new">
                            <i data-lucide="clock" class="meta-icon"></i>
                            <span class="timer-text">المتبقي: <strong>${timeRemaining}</strong></span>
                        </div>
                    </div>
                    <div class="auction-bid-section">
                        <div class="starting-bid-label">المزايدة الابتدائية</div>
                        <div class="starting-bid-amount">${startingBid || 'غير محدد'}</div>
                    </div>
                    <button class="auction-cta-btn">
                        شوف التفاصيل وشارك بالمزاد
                    </button>
                </div>
            </div>
        `;
    }

    // Render properties to grid with image preloading
    async function renderProperties(properties, gridElement, renderFunction) {
        if (!gridElement) {
            console.error('Grid element not found');
            return;
        }

        // Clear existing content
        gridElement.innerHTML = '';

        // Handle empty data
        if (!properties || !Array.isArray(properties) || properties.length === 0) {
            gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">لا توجد عقارات متاحة حالياً</p>';
            return;
        }

        // Preload all images before rendering
        try {
            await preloadAllImages(properties);
        } catch (error) {
            console.warn('Some images failed to preload, continuing with rendering:', error);
        }

        // Render each property
        properties.forEach(property => {
            let cardHTML = '';

            switch (renderFunction) {
                case 'renderPropertyCard':
                    cardHTML = renderPropertyCard(property);
                    break;
                case 'renderRentalCard':
                    cardHTML = renderRentalCard(property);
                    break;
                case 'renderAuctionCard':
                    cardHTML = renderAuctionCard(property);
                    break;
                default:
                    console.error('Unknown render function:', renderFunction);
                    return;
            }

            // Create temporary container to parse HTML
            const temp = document.createElement('div');
            temp.innerHTML = cardHTML.trim();
            const cardElement = temp.firstChild;

            if (cardElement) {
                gridElement.appendChild(cardElement);
            }
        });

        // Reinitialize Lucide icons after rendering
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }


        // Verify grid is visible
        const gridStyle = window.getComputedStyle(gridElement);
        const gridParent = gridElement.parentElement;
        const parentStyle = gridParent ? window.getComputedStyle(gridParent) : null;
    }

    // Fetch JSON data
    async function fetchPropertyData(url) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            return null;
        }
    }

    // Load and render data for a specific section
    async function loadSectionData(sectionId) {
        const config = dataConfig[sectionId];

        if (!config) {
            console.warn(`No configuration found for section: ${sectionId}`);
            return;
        }

        // Ensure section is visible before loading
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            // Force section to be visible
            sectionElement.style.display = 'block';
            sectionElement.style.visibility = 'visible';
            sectionElement.style.opacity = '1';
            sectionElement.style.pointerEvents = 'auto';
            sectionElement.style.transform = 'translateX(0)';
            if (!sectionElement.classList.contains('active')) {
                sectionElement.classList.add('active');
            }
        }

        // Handle home-section differently (has multiple grids)
        if (sectionId === 'home-section' && config.grids) {
            // Load all three grids for home section
            const loadPromises = Object.entries(config.grids).map(async ([key, gridConfig]) => {
                const gridElement = document.getElementById(gridConfig.gridId);
                if (!gridElement) {
                    console.error(`Grid element not found: ${gridConfig.gridId}`);
                    return;
                }

                // Show loading state
                gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">جاري التحميل...</p>';

                try {
                    const data = await fetchPropertyData(gridConfig.url);
                    if (data === null) {
                        gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc3545;">حدث خطأ في تحميل البيانات.</p>';
                        return;
                    }

                    const properties = Array.isArray(data) ? data : (data.properties || data.items || []);
                    if (!properties || properties.length === 0) {
                        gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">لا توجد عقارات متاحة حالياً</p>';
                        return;
                    }

                    await renderProperties(properties, gridElement, gridConfig.renderFunction);
                } catch (error) {
                    console.error(`Error loading ${key} for home section:`, error);
                    gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc3545;">حدث خطأ في تحميل البيانات.</p>';
                }
            });

            await Promise.all(loadPromises);
            return;
        }

        // Handle other sections (single grid)
        const gridElement = document.getElementById(config.gridId);
        if (!gridElement) {
            console.error(`Grid element not found: ${config.gridId}`);
            return;
        }

        // Show loading state (optional)
        gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">جاري التحميل...</p>';

        try {
            // Fetch data
            const data = await fetchPropertyData(config.url);

            if (data === null) {
                console.error(`Failed to fetch data for ${sectionId}`);
                gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc3545;">حدث خطأ في تحميل البيانات. يرجى المحاولة لاحقاً.</p>';
                return;
            }

            // Handle array data
            const properties = Array.isArray(data) ? data : (data.properties || data.items || []);

            if (!properties || properties.length === 0) {
                console.warn(`No properties found in data for ${sectionId}`);
                gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">لا توجد عقارات متاحة حالياً</p>';
                return;
            }

            // Render properties (with image preloading)
            await renderProperties(properties, gridElement, config.renderFunction);

            // Verify cards were rendered
            const renderedCards = gridElement.querySelectorAll('.property-card, .auction-card-new');

            if (renderedCards.length === 0) {
                console.error(`No cards were rendered for ${sectionId}! Check render function: ${config.renderFunction}`);
            } else {
                // Double-check section is still visible after rendering
                if (sectionElement) {
                    sectionElement.style.display = 'block';
                    sectionElement.style.visibility = 'visible';
                    sectionElement.style.opacity = '1';
                    sectionElement.style.pointerEvents = 'auto';
                    sectionElement.style.transform = 'translateX(0)';
                    if (!sectionElement.classList.contains('active')) {
                        sectionElement.classList.add('active');
                    }
                }
            }
        } catch (error) {
            console.error(`Error loading section data for ${sectionId}:`, error);
            gridElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #dc3545;">حدث خطأ في تحميل البيانات. يرجى المحاولة لاحقاً.</p>';
        }
    }

    // Load all sections data
    async function loadAllData() {
        const sectionIds = Object.keys(dataConfig);

        // Load data for all sections in parallel
        await Promise.all(sectionIds.map(sectionId => loadSectionData(sectionId)));
    }

    // Initialize data loading when DOM is ready
    function initDataLoading() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadAllData);
        } else {
            loadAllData();
        }
    }

    // Start data loading
    initDataLoading();

    // Export function to reload specific section (optional, for future use)
    window.reloadSectionData = loadSectionData;

    // Export dataConfig for debugging/access
    window.dataConfig = dataConfig;
})();

// Profile Section - Load and Bind User Data
(function () {
    'use strict';

    // Fetch user data from JSON
    async function fetchUserData() {
        try {
            const response = await fetch('json-data/user-data.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    // Update profile image
    function updateProfileImage(imageUrl) {
        const profileImage = document.getElementById('profile-image');
        const placeholder = profileImage ? profileImage.querySelector('.profile-image-placeholder') : null;

        if (!profileImage) return;

        if (imageUrl) {
            // Create img element if it doesn't exist
            let img = profileImage.querySelector('img');
            if (!img) {
                img = document.createElement('img');
                img.alt = 'صورة الملف الشخصي';
                profileImage.appendChild(img);
            }

            img.src = imageUrl;
            img.onerror = function () {
                // If image fails to load, show placeholder
                if (img.parentNode) {
                    img.parentNode.removeChild(img);
                }
                if (placeholder) {
                    placeholder.style.display = 'block';
                }
            };

            // Hide placeholder when image loads successfully
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        } else {
            // Remove image if no URL provided
            const img = profileImage.querySelector('img');
            if (img) {
                img.remove();
            }
            if (placeholder) {
                placeholder.style.display = 'block';
            }
        }
    }

    // Bind user data to profile form
    function bindUserData(userData) {
        if (!userData) {
            console.warn('No user data provided');
            return;
        }

        // Update profile image
        const imageUrl = userData.imageUrl || userData.image || userData.profileImage || null;
        updateProfileImage(imageUrl);

        // Update full name
        const fullNameInput = document.getElementById('profile-fullname');
        if (fullNameInput) {
            const fullName = userData.fullName || userData.name || userData.fullname || '';
            fullNameInput.value = fullName;
        }

        // Update phone number
        const phoneInput = document.getElementById('profile-phone');
        if (phoneInput) {
            const phone = userData.phone || userData.phoneNumber || userData.mobile || '';
            phoneInput.value = phone;
        }

        // Update email
        const emailInput = document.getElementById('profile-email');
        if (emailInput) {
            const email = userData.email || userData.emailAddress || '';
            emailInput.value = email;
        }

        // Update national ID (store real value, display masked)
        const nationalIdInput = document.getElementById('profile-national-id');
        if (nationalIdInput) {
            const nationalId = userData.nationalId || userData.nationalID || userData.idNumber || '';
            // Store the real value in data attribute
            if (nationalId) {
                nationalIdInput.setAttribute('data-real-value', nationalId);
                // Mask the value with dots
                nationalIdInput.value = '•'.repeat(nationalId.length);
            } else {
                nationalIdInput.removeAttribute('data-real-value');
                nationalIdInput.value = '';
            }
            // Set type to text for proper dot masking (not password type)
            nationalIdInput.type = 'text';
        }
    }

    // Load and bind user data
    async function loadUserData() {
        const userData = await fetchUserData();

        if (userData) {
            bindUserData(userData);
        } else {
            console.warn('Failed to load user data. Profile fields will remain empty.');
        }
    }

    // Initialize profile toggle and load user data
    function initProfileToggle() {
        const toggleBtn = document.getElementById('toggle-national-id');
        const nationalIdInput = document.getElementById('profile-national-id');
        const eyeIcon = document.getElementById('eye-icon');
        const inputWrapper = toggleBtn ? toggleBtn.closest('.input-wrapper') : null;

        if (!toggleBtn || !nationalIdInput || !eyeIcon) {
            return;
        }

        // Add class to wrapper for styling
        if (inputWrapper) {
            inputWrapper.classList.add('with-toggle');
        }

        // Get real value from data attribute or current value
        function getRealValue() {
            const realValue = nationalIdInput.getAttribute('data-real-value');
            if (realValue) {
                return realValue;
            }
            // If no data attribute, use current value (fallback)
            return nationalIdInput.value.replace(/•/g, '') || '';
        }

        // Mask value with dots
        function maskValue(value) {
            if (!value) return '';
            return '•'.repeat(value.length);
        }

        // Check if value is currently masked
        function isMasked(value) {
            return /^•+$/.test(value);
        }

        // Initialize: ensure value is masked if it has a real value
        function initializeMasking() {
            const realValue = getRealValue();
            const currentValue = nationalIdInput.value;

            // If there's a real value stored
            if (realValue) {
                // If current value is not masked or different, mask it
                if (!isMasked(currentValue) || currentValue !== maskValue(realValue)) {
                    nationalIdInput.value = maskValue(realValue);
                }
                // Ensure real value is stored
                nationalIdInput.setAttribute('data-real-value', realValue);
            } else if (currentValue && !isMasked(currentValue)) {
                // If there's a value but no stored real value, store and mask it
                const digitsOnly = currentValue.replace(/\D/g, '');
                if (digitsOnly) {
                    nationalIdInput.setAttribute('data-real-value', digitsOnly);
                    nationalIdInput.value = maskValue(digitsOnly);
                }
            }

            // Ensure input type is text (not password) for proper masking
            nationalIdInput.type = 'text';
        }

        // Toggle visibility function with animation
        function toggleVisibility() {
            const realValue = getRealValue();
            const currentValue = nationalIdInput.value;
            const currentlyMasked = isMasked(currentValue);

            // Add animation class for icon transition
            eyeIcon.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
            eyeIcon.style.transform = 'scale(0.8)';
            eyeIcon.style.opacity = '0.5';

            // Use requestAnimationFrame for smooth transition
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (currentlyMasked) {
                        // Show real value
                        if (realValue) {
                            nationalIdInput.value = realValue;
                        }
                        // Switch to eye-off icon (hidden state)
                        eyeIcon.setAttribute('data-lucide', 'eye-off');
                        toggleBtn.classList.add('active');
                        toggleBtn.setAttribute('aria-label', 'إخفاء الهوية الوطنية');
                    } else {
                        // Hide with dots
                        if (realValue) {
                            nationalIdInput.value = maskValue(realValue);
                            nationalIdInput.setAttribute('data-real-value', realValue);
                        }
                        // Switch to eye icon (visible state)
                        eyeIcon.setAttribute('data-lucide', 'eye');
                        toggleBtn.classList.remove('active');
                        toggleBtn.setAttribute('aria-label', 'إظهار الهوية الوطنية');
                    }

                    // Re-initialize Lucide icon after attribute change
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }

                    // Animate icon back
                    eyeIcon.style.transform = 'scale(1)';
                    eyeIcon.style.opacity = '1';
                }, 100);
            });
        }

        // Prevent showing real value when typing (if user edits)
        nationalIdInput.addEventListener('input', function () {
            const currentValue = this.value;
            const realValue = getRealValue();

            // If user is typing and value contains actual digits (not just dots)
            if (currentValue && !isMasked(currentValue) && /\d/.test(currentValue)) {
                // Store as real value and mask it
                const digitsOnly = currentValue.replace(/\D/g, '');
                if (digitsOnly) {
                    this.setAttribute('data-real-value', digitsOnly);
                    // Only mask if toggle is in hidden state
                    if (!toggleBtn.classList.contains('active')) {
                        this.value = maskValue(digitsOnly);
                    }
                }
            }
        });

        // Prevent paste from breaking masking
        nationalIdInput.addEventListener('paste', function (e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const digitsOnly = pastedText.replace(/\D/g, '').substring(0, 10); // Max 10 digits

            if (digitsOnly) {
                this.setAttribute('data-real-value', digitsOnly);

                // Show or mask based on current state
                if (toggleBtn.classList.contains('active')) {
                    this.value = digitsOnly;
                } else {
                    this.value = maskValue(digitsOnly);
                }
            }
        });

        // Initialize masking state
        initializeMasking();

        // Attach click event
        toggleBtn.addEventListener('click', toggleVisibility);

        // Set initial aria-label
        toggleBtn.setAttribute('aria-label', 'إظهار الهوية الوطنية');
    }

    // Initialize when DOM is ready
    function init() {
        initProfileToggle();
        loadUserData();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export function to reload user data (optional, for future use)
    window.reloadUserData = loadUserData;
})();

// Banner Slider Functionality
(function () {
    'use strict';

    let currentSlide = 0;
    const totalSlides = 3;
    let slideInterval = null;

    function initBannerSlider() {
        const slides = document.querySelectorAll('.banner-slide');
        const indicators = document.querySelectorAll('.indicator');

        if (slides.length === 0 || indicators.length === 0) {
            return;
        }

        // Function to show a specific slide
        function showSlide(index) {
            // Remove active class from all slides and indicators
            slides.forEach(slide => slide.classList.remove('active'));
            indicators.forEach(indicator => indicator.classList.remove('active'));

            // Add active class to current slide and indicator
            if (slides[index]) {
                slides[index].classList.add('active');
            }
            if (indicators[index]) {
                indicators[index].classList.add('active');
            }

            currentSlide = index;
        }

        // Function to go to next slide
        function nextSlide() {
            const next = (currentSlide + 1) % totalSlides;
            showSlide(next);
        }

        // Function to go to previous slide
        function prevSlide() {
            const prev = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(prev);
        }

        // Add click handlers to indicators
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showSlide(index);
                resetAutoSlide();
            });
        });

        // Auto-slide functionality
        function startAutoSlide() {
            slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
        }

        function resetAutoSlide() {
            if (slideInterval) {
                clearInterval(slideInterval);
            }
            startAutoSlide();
        }

        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        const slider = document.querySelector('.banner-slider');
        if (slider) {
            slider.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });

            slider.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });

            function handleSwipe() {
                const swipeThreshold = 50;
                const diff = touchStartX - touchEndX;

                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) {
                        // Swipe left (RTL: go to next)
                        nextSlide();
                    } else {
                        // Swipe right (RTL: go to previous)
                        prevSlide();
                    }
                    resetAutoSlide();
                }
            }
        }

        // Start auto-slide
        startAutoSlide();

        // Pause on hover
        if (slider) {
            slider.addEventListener('mouseenter', () => {
                if (slideInterval) {
                    clearInterval(slideInterval);
                }
            });

            slider.addEventListener('mouseleave', () => {
                startAutoSlide();
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBannerSlider);
    } else {
        initBannerSlider();
    }
})();

// Profile Components and Navigation
(function () {
    'use strict';

    // Profile Route Management
    const ProfileRoutes = {
        MENU: 'menu',
        ACCOUNT_INFO: 'account-info'
    };

    let currentProfileRoute = ProfileRoutes.MENU;

    // Profile Header Component
    function createProfileHeader(userData) {
        const name = userData?.fullName || userData?.name || 'المستخدم';
        const imageUrl = userData?.imageUrl || userData?.image || userData?.avatar || null;

        const headerHTML = `
            <div class="profile-header-card profile-menu-header">
                <div class="profile-image-wrapper">
                    <div class="profile-image" id="profile-menu-image">
                        ${imageUrl
                ? `<img src="${imageUrl}" alt="صورة الملف الشخصي" onerror="this.onerror=null; this.style.display='none'; const placeholder = this.nextElementSibling; if(placeholder) placeholder.style.display='block';">`
                : ''}
                        <i class="fas fa-user profile-image-placeholder" ${imageUrl ? 'style="display:none;"' : ''}></i>
                    </div>
                </div>
                <h2 class="profile-name">${name}</h2>
            </div>
        `;

        return headerHTML;
    }

    // Create profile page title header
    function createProfilePageTitle() {
        return `<h1 class="profile-page-title">حسابي</h1>`;
    }

    // Create account tabs header
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

    // Create card header for tab views
    function createCardHeader(title, tabId) {
        return `
            <div class="card-header" id="card-header-${tabId}" style="display: none;">
                <button class="back-to-tabs-btn" data-back="tabs">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="card-title">${title}</h2>
            </div>
        `;
    }

    // Menu Item Component
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

    // Menu Section Component
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

    // Menu Configuration
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
                { icon: 'file-text', text: 'الشروط والأحكام', route: null, action: 'terms' },
                { icon: 'shield', text: 'سياسة الخصوصية', route: null, action: 'privacy' },
                { icon: 'help-circle', text: 'المساعدة', route: null, action: 'help' },
                { icon: 'log-out', text: 'تسجيل الخروج', route: null, action: 'logout' }
            ]
        }
    ];

    // Render Profile Menu
    async function renderProfileMenu() {
        const headerContainer = document.getElementById('profile-header-container');
        const sectionsContainer = document.getElementById('profile-menu-sections');

        if (!headerContainer || !sectionsContainer) {
            console.error('Profile menu containers not found');
            return;
        }

        // Load user data
        let userData = null;
        try {
            const response = await fetch('json-data/user-data.json');
            if (response.ok) {
                userData = await response.json();
            }
        } catch (error) {
            console.warn('Could not load user data:', error);
        }

        // Render header
        headerContainer.innerHTML = createProfileHeader(userData);

        // Render menu sections
        const sectionsHTML = menuConfig.map(section => createMenuSection(section)).join('');
        sectionsContainer.innerHTML = sectionsHTML;

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Update profile image in basic-data-view if it exists
        updateBasicDataProfileImage(userData);

        // Attach event listeners to menu items
        attachMenuListeners();
    }

    // Update profile image in basic-data-view
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

    // Attach event listeners to menu items
    function attachMenuListeners() {
        const menuItems = document.querySelectorAll('.menu-item[data-route], .menu-item[data-action]');

        menuItems.forEach(item => {
            item.addEventListener('click', function () {
                const route = this.getAttribute('data-route');
                const action = this.getAttribute('data-action');

                if (route) {
                    navigateToProfileRoute(route);
                } else if (action) {
                    handleMenuAction(action);
                }
            });
        });
    }

    // Handle menu actions
    function handleMenuAction(action) {
        // Placeholder for future actions
        switch (action) {
            case 'favorites':
                // TODO: Navigate to favorites
                break;
            case 'settings':
                // TODO: Navigate to settings
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
                // TODO: Handle logout
                if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                }
                break;
            default:
                console.warn('Unknown action:', action);
        }
    }

    // Navigate to profile route
    function navigateToProfileRoute(route) {
        const menuView = document.getElementById('profile-menu-view');
        const accountInfoView = document.getElementById('profile-account-info-view');

        if (!menuView || !accountInfoView) {
            console.error('Profile views not found');
            return;
        }

        window.scrollToTop();

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
            // Hide all card headers
            document.querySelectorAll('.card-header').forEach(header => {
                header.style.display = 'none';
            });

            // Show account info view
            menuView.classList.remove('active');
            accountInfoView.classList.add('active');
            currentProfileRoute = route;

            // Update URL hash
            window.location.hash = '#/profile/account-info';

            // Hide all tab views and show tabs (use only active class)
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
            if (typeof updateStickyHeaderPositions === 'function') {
                updateStickyHeaderPositions();
            }
        } else if (route === ProfileRoutes.MENU) {
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
            // Hide all card headers
            document.querySelectorAll('.card-header').forEach(header => {
                header.style.display = 'none';
            });

            // Show menu view
            accountInfoView.classList.remove('active');
            menuView.classList.add('active');
            currentProfileRoute = route;

            // Update sticky header positions
            updateStickyHeaderPositions();

            // Reset account info tabs state (use only active class)
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
        }
    }

    // Handle close button
    function initCloseButton() {
        const closeBtn = document.getElementById('profile-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                navigateToProfileRoute(ProfileRoutes.MENU);
            });
        }
    }

    // Handle browser back button and Android back button
    function initBrowserNavigation() {
        // Handle hash changes
        window.addEventListener('hashchange', function () {
            const hash = window.location.hash;
            if (hash === '#/profile' || hash === '#/profile/') {
                navigateToProfileRoute(ProfileRoutes.MENU);
            } else if (hash === '#/profile/account-info') {
                navigateToProfileRoute(ProfileRoutes.ACCOUNT_INFO);
            }
        });

        // Handle initial hash
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
            }
        });

        // Handle back button press (for mobile apps/Cordova)
        if (typeof document.addEventListener !== 'undefined') {
            document.addEventListener('backbutton', function (event) {
                if (currentProfileRoute === ProfileRoutes.ACCOUNT_INFO) {
                    // Go back to menu
                    navigateToProfileRoute(ProfileRoutes.MENU);
                    if (event && event.preventDefault) {
                        event.preventDefault();
                    }
                }
            }, false);
        }
    }

    // Initialize profile system
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
            if (typeof initProfileSectionHeaders === 'function') {
                initProfileSectionHeaders();
            }
        });
    } else {
        initProfileSystem();
        if (typeof initProfileSectionHeaders === 'function') {
            initProfileSectionHeaders();
        }
    }

    // Export for external use
    window.ProfileNavigation = {
        navigateTo: navigateToProfileRoute,
        routes: ProfileRoutes
    };

    // Export header creation functions for use in other scopes
    window.createProfilePageTitle = createProfilePageTitle;
    window.createAccountTabsHeader = createAccountTabsHeader;
    window.createCardHeader = createCardHeader;
})();

// Account Info Tabs Management
(function () {
    'use strict';

    // Tab state
    let currentTab = 'basic-data';
    let isInDetailView = false;

    // Initialize tabs
    function initAccountTabs() {
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
        const backToTabsButtons = document.querySelectorAll('.back-to-tabs-btn[data-back="tabs"]');
        backToTabsButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                goBackToTabs();
            });
        });

        // Back to profile button handler
        const backToProfileBtn = document.getElementById('back-to-profile-btn');
        if (backToProfileBtn) {
            backToProfileBtn.addEventListener('click', function () {
                // Scroll to top for better UX
                if (typeof window.scrollToTop === 'function') {
                    window.scrollToTop();
                }
                if (typeof window.ProfileNavigation !== 'undefined' && window.ProfileNavigation.navigateTo) {
                    window.ProfileNavigation.navigateTo(window.ProfileNavigation.routes.MENU);
                }
            });
        }

        // Don't auto-open any tab - let user choose
    }

    // Switch to a specific tab
    function switchTab(tabId) {
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
        document.querySelectorAll('.card-header').forEach(header => {
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

        // Update sticky header positions
        updateStickyHeaderPositions();

        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
    }

    // Go back to tabs view (from detail view)
    function goBackToTabs() {
        // Scroll to top for better UX
        if (typeof window.scrollToTop === 'function') {
            window.scrollToTop();
        }

        // Show account tabs header
        const accountTabsHeader = document.getElementById('account-tabs-header');
        if (accountTabsHeader) {
            accountTabsHeader.style.display = 'flex';
        }
        // Hide all card headers
        document.querySelectorAll('.card-header').forEach(header => {
            header.style.display = 'none';
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
            : `<div class="card-header" id="card-header-basic-data" style="display: none;">
                <button class="back-to-tabs-btn" data-back="tabs">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="card-title">البيانات الأساسية</h2>
            </div>`;

        const contactInfoHeader = typeof window.createCardHeader === 'function'
            ? window.createCardHeader('معلومات التواصل', 'contact-info')
            : `<div class="card-header" id="card-header-contact-info" style="display: none;">
                <button class="back-to-tabs-btn" data-back="tabs">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="card-title">معلومات التواصل</h2>
            </div>`;

        const addressesHeader = typeof window.createCardHeader === 'function'
            ? window.createCardHeader('عناويني', 'addresses')
            : `<div class="card-header" id="card-header-addresses" style="display: none;">
                <button class="back-to-tabs-btn" data-back="tabs">
                    <i data-lucide="arrow-right" class="back-icon"></i>
                </button>
                <h2 class="card-title">عناويني</h2>
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
        const stickyHeaders = document.querySelectorAll('.profile-page-title, .account-tabs-header, .card-header');

        stickyHeaders.forEach(header => {
            if (header) {
                // Set top position to match top-header height so it sticks right below it
                header.style.top = `${topHeaderHeight}px`;
                // Ensure it's visible and properly positioned
                header.style.position = 'sticky';
                header.style.zIndex = '99';
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
        updateStickyPositions: updateStickyHeaderPositions
    };
})();

