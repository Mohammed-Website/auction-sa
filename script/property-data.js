/**
 * Property Data Loading and Rendering
 * 
 * This file handles:
 * - Loading property data from JSON files
 * - Rendering property cards (for sale, rent, and auctions)
 * - Formatting prices and numbers
 * - Preloading images for better performance
 */

(function () {
    'use strict';

    /**
     * Configuration for each section
     * Tells the code which JSON file to load and which grid to render to
     */
    const dataConfig = {
        'home-section': {
            // Home section loads all data and organizes into 3 grids
            grids: {
                auctions: { 
                    gridId: 'home-auctions-grid', 
                    renderFunction: 'renderAuctionCard', 
                    url: 'json-data/auction-property.json' 
                },
                sell: { 
                    gridId: 'home-sell-grid', 
                    renderFunction: 'renderPropertyCard', 
                    url: 'json-data/sell-property.json' 
                },
                rent: { 
                    gridId: 'home-rent-grid', 
                    renderFunction: 'renderRentalCard', 
                    url: 'json-data/rent-property.json' 
                }
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

    /**
     * Format number with thousand separators
     * Example: 1000000 becomes "1,000,000"
     */
    function formatNumber(num) {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Format price for display
     * Adds "ريال" (Riyal) to the number
     */
    function formatPrice(price) {
        return formatNumber(price) + ' ريال';
    }

    /**
     * Format rental price
     * Adds "ريال / شهرياً" (Riyal / Monthly) to the number
     */
    function formatRentalPrice(price) {
        return formatNumber(price) + ' ريال / شهرياً';
    }

    /**
     * Render property features (bedrooms, bathrooms, area)
     * Creates HTML for the features section of a property card
     */
    function renderFeatures(property) {
        const features = [];

        // Add totalBed if available (preferred over bedrooms if both exist)
        if (property.totalBed !== undefined) {
            features.push(`<i data-lucide="bed" class="feature-icon"></i> ${property.totalBed}`);
        }
        // Fallback to bedrooms if totalBed doesn't exist
        else if (property.bedrooms) {
            features.push(`<i data-lucide="bed" class="feature-icon"></i> ${property.bedrooms}`);
        }
        
        // Add totalBathroom if available (preferred over bathrooms if both exist)
        if (property.totalBathroom !== undefined) {
            features.push(`<i data-lucide="bath" class="feature-icon"></i> ${property.totalBathroom}`);
        }
        // Fallback to bathrooms if totalBathroom doesn't exist
        else if (property.bathrooms) {
            features.push(`<i data-lucide="bath" class="feature-icon"></i> ${property.bathrooms}`);
        }
        
        // Add area if available
        if (property.area) {
            // Handle area format - could be "450 م²" or just "450"
            const areaValue = property.area.toString().replace(/[^\d]/g, '');
            const areaText = areaValue ? `${formatNumber(areaValue)} م²` : property.area;
            features.push(`<i data-lucide="maximize" class="feature-icon"></i> ${areaText}`);
        }

        // If no features, return empty string
        if (features.length === 0) return '';

        // Return HTML for features
        return `
            <div class="property-features">
                ${features.map(feature => `<span>${feature}</span>`).join('')}
            </div>
        `;
    }

    /**
     * Render property badge if exists
     * Badges are special labels like "New" or "Featured"
     */
    function renderBadge(badge) {
        if (!badge) return '';
        return `<div class="property-badge">${badge}</div>`;
    }

    /**
     * Get image URL with proper formatting
     * Handles different image URL formats and optimizes Unsplash URLs
     */
    function getImageUrl(property) {
        const imageUrl = property.image || property.imageUrl || null;
        if (!imageUrl) return null;

        // If it's an Unsplash URL without proper dimensions, add them
        if (imageUrl.includes('unsplash.com') && !imageUrl.includes('?w=') && !imageUrl.includes('?auto=')) {
            return `${imageUrl}?w=800&auto=format&fit=crop`;
        }

        return imageUrl;
    }

    /**
     * Preload a single image
     * Returns a Promise that resolves when the image is loaded
     */
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

    /**
     * Preload all images from properties
     * This makes images load faster when displayed
     */
    async function preloadAllImages(properties) {
        const imageUrls = properties
            .map(property => getImageUrl(property))
            .filter(url => url !== null);

        const preloadPromises = imageUrls.map(url => preloadImage(url));
        await Promise.all(preloadPromises);
    }

    /**
     * Render property card (for home and sell sections)
     * Creates the HTML for a property card that's for sale
     */
    function renderPropertyCard(property) {
        if (!property) return '';

        const imageUrl = getImageUrl(property);
        const imageStyle = imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : '';
        const companyLogo = property.compLogo ? `<img src="${property.compLogo}" alt="${property.compName || 'شركة'}" class="company-logo">` : '';
        const specialWordBadge = property.specialWord ? 
            `<div class="special-word-badge">${property.specialWord}</div>` : '';

        return `
            <div class="property-card">
                <div class="card-header">
                    <div class="company-details">
                        ${companyLogo}
                        <span class="company-name">${property.compName || ''}</span>
                    </div>
                    ${specialWordBadge}
                </div>
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

    /**
     * Render rental card (for rent section)
     * Creates the HTML for a rental property card
     */
    function renderRentalCard(property) {
        if (!property) return '';

        const imageUrl = getImageUrl(property);
        const imageStyle = imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : '';
        const companyLogo = property.compLogo ? `<img src="${property.compLogo}" alt="${property.compName || 'شركة'}" class="company-logo">` : '';
        const specialWordBadge = property.specialWord ? 
            `<div class="special-word-badge">${property.specialWord}</div>` : '';

        // Handle price - check if it already includes "/ شهرياً" or "/ سنوياً"
        let priceText = property.price || '';
        if (priceText && !priceText.includes('/')) {
            priceText = formatRentalPrice(priceText);
        }

        return `
            <div class="property-card rental-card">
                <div class="card-header">
                    <div class="company-details">
                        ${companyLogo}
                        <span class="company-name">${property.compName || ''}</span>
                    </div>
                    ${specialWordBadge}
                </div>
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

    /**
     * Render auction card (for auction section)
     * Creates the HTML for an auction property card
     */
    function renderAuctionCard(auction) {
        if (!auction) return '';

        const imageUrl = getImageUrl(auction);
        const imageStyle = imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : '';
        const companyLogo = auction.compLogo ? `<img src="${auction.compLogo}" alt="${auction.compName || 'شركة'}" class="company-logo">` : '';
        const specialWordBadge = auction.specialWord ? 
            `<div class="special-word-badge">${auction.specialWord}</div>` : '';

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
                <div class="card-header">
                    <div class="company-details">
                        ${companyLogo}
                        <span class="company-name">${auction.compName || ''}</span>
                    </div>
                    ${specialWordBadge}
                </div>
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
                        <div class="bid-section-left">
                            <div class="starting-bid-label">المزايدة الابتدائية</div>
                            <div class="starting-bid-amount">${startingBid || 'غير محدد'}</div>
                        </div>
                        <div class="bid-section-right">
                            <i data-lucide="map-pin" class="location-icon"></i>
                            <span>${auction.location || 'غير محدد'}</span>
                        </div>
                    </div>
                    <div class="auction-cta-container">
                        <div class="view-count">
                            <i data-lucide="eye" class="view-icon"></i>
                            <span class="view-number">${auction.viewCount ? formatNumber(auction.viewCount) : '0'}</span>
                        </div>
                        <button class="auction-cta-btn">
                            شارك الآن
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render properties to grid with image preloading
     * Takes an array of properties and renders them as cards in a grid
     */
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

            // Choose the right render function based on the type
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
    }

    /**
     * Fetch JSON data from a URL
     * Returns the parsed JSON data or null if there's an error
     */
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

    /**
     * Load and render data for a specific section
     * This is the main function that loads data and displays it
     */
    async function loadSectionData(sectionId) {
        const config = dataConfig[sectionId];

        if (!config) {
            console.warn(`No configuration found for section: ${sectionId}`);
            return;
        }

        // Check if section exists in DOM before proceeding
        const sectionElement = document.getElementById(sectionId);
        if (!sectionElement) {
            // Section doesn't exist in DOM, skip silently
            return;
        }

        // Ensure section is visible before loading
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

            // Re-enable horizontal scrolling after all grids are loaded
            setTimeout(() => {
                const scrollContainers = document.querySelectorAll('.horizontal-scroll-container');
                scrollContainers.forEach(container => {
                    // Remove any inline styles that might block scrolling
                    container.style.removeProperty('overflow');
                    container.style.removeProperty('overflow-x');
                    container.style.removeProperty('overflow-y');
                    container.style.removeProperty('pointer-events');
                    // Explicitly set scroll properties
                    container.style.overflowX = 'auto';
                    container.style.overflowY = 'hidden';
                    container.style.pointerEvents = 'auto';
                    // Force browser to recalculate scroll properties
                    const scrollLeft = container.scrollLeft;
                    container.scrollLeft = scrollLeft;
                });

                // Ensure subsections have pointer-events enabled
                const subsections = document.querySelectorAll('.home-subsection');
                subsections.forEach(subsection => {
                    subsection.style.pointerEvents = 'auto';
                });
            }, 100);

            return;
        }

        // Handle other sections (single grid)
        const gridElement = document.getElementById(config.gridId);
        if (!gridElement) {
            // Grid element doesn't exist, skip silently (section may not be in DOM)
            return;
        }

        // Show loading state
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

    /**
     * Load all sections data
     * Loads data for all sections at once when page first loads
     */
    async function loadAllData() {
        const sectionIds = Object.keys(dataConfig);

        // Load data for all sections in parallel
        await Promise.all(sectionIds.map(sectionId => loadSectionData(sectionId)));
    }

    /**
     * Initialize data loading when DOM is ready
     */
    function initDataLoading() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadAllData);
        } else {
            loadAllData();
        }
    }

    // Start data loading
    initDataLoading();

    /**
     * Export function to reload specific section
     * This can be called from other files to reload data
     */
    window.reloadSectionData = loadSectionData;

    /**
     * Export dataConfig for debugging/access
     * Other files can access this to see the configuration
     */
    window.dataConfig = dataConfig;
})();

