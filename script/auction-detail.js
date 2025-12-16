/**
 * Auction Property Detail Page
 * 
 * This file handles:
 * - Opening property detail page when auction card is clicked
 * - Rendering auction property details from JSON data
 * - Displaying assets with countdown timers
 * - Navigation back to previous section
 */

(function () {
    'use strict';

    let currentAuctionData = null;

    /**
     * Format date string for display
     */
    function formatDate(dateString) {
        if (!dateString) return 'غير محدد';
        // Handle different date formats
        return dateString.replace('—', '-').trim();
    }

    /**
     * Calculate countdown from start date
     */
    function calculateCountdown(startDate) {
        if (!startDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

        try {
            // Parse date string (format: "2025/12/20 — 08:00 مساءً" or "2025-12-20 6:00 مساءً")
            let dateStr = startDate.replace('—', '-').replace('/', '-');
            const timeMatch = dateStr.match(/(\d{1,2}):(\d{2})\s*(صباحً|مساءً)/);

            if (!timeMatch) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

            const dateMatch = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
            if (!dateMatch) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

            const year = parseInt(dateMatch[1]);
            const month = parseInt(dateMatch[2]) - 1; // JS months are 0-indexed
            const day = parseInt(dateMatch[3]);
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            const period = timeMatch[3];

            // Convert to 24-hour format
            if (period === 'مساءً' && hours !== 12) {
                hours += 12;
            } else if (period === 'صباحً' && hours === 12) {
                hours = 0;
            }

            const targetDate = new Date(year, month, day, hours, minutes);
            const now = new Date();
            const diff = targetDate - now;

            if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hoursRem = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutesRem = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secondsRem = Math.floor((diff % (1000 * 60)) / 1000);

            return { days, hours: hoursRem, minutes: minutesRem, seconds: secondsRem };
        } catch (error) {
            console.error('Error calculating countdown:', error);
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
    }


    /**
     * Render countdown timer HTML
     */
    function renderCountdown(countdown, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = `
            <div class="auction-property-main-page-detail-countdown-timer">
                <div class="countdown-unit">
                    <div class="countdown-box" data-unit="days">${countdown.days}</div>
                    <div class="countdown-label-small">يوم</div>
                </div>
                <span class="countdown-separator">:</span>
                <div class="countdown-unit">
                    <div class="countdown-box" data-unit="hours">${countdown.hours}</div>
                    <div class="countdown-label-small">ساعة</div>
                </div>
                <span class="countdown-separator">:</span>
                <div class="countdown-unit">
                    <div class="countdown-box" data-unit="minutes">${countdown.minutes}</div>
                    <div class="countdown-label-small">دقيقة</div>
                </div>
                <span class="countdown-separator">:</span>
                <div class="countdown-unit">
                    <div class="countdown-box" data-unit="seconds">${countdown.seconds}</div>
                    <div class="countdown-label-small">ثانية</div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Update countdown timer with flip animation
     */
    function updateCountdown(asset, containerId) {
        const countdown = calculateCountdown(asset.bidStartDate);
        const container = document.getElementById(containerId);
        if (!container) return;

        const boxes = container.querySelectorAll('.countdown-box');
        const prevValues = {};
        boxes.forEach(box => {
            const unit = box.getAttribute('data-unit');
            prevValues[unit] = parseInt(box.textContent.replace(/[٠-٩]/g, (char) => {
                const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
                return arabicDigits.indexOf(char).toString();
            })) || 0;
        });

        // Update values
        const newValues = {
            days: countdown.days,
            hours: countdown.hours,
            minutes: countdown.minutes,
            seconds: countdown.seconds
        };

        boxes.forEach(box => {
            const unit = box.getAttribute('data-unit');
            const newValue = newValues[unit];
            const oldValue = prevValues[unit];

            if (newValue !== oldValue) {
                box.classList.add('flip');
                setTimeout(() => {
                    box.textContent = newValue;
                    box.classList.remove('flip');
                }, 300);
            } else {
                box.textContent = newValue;
            }
        });
    }

    /**
     * Render asset card HTML
     */
    function renderAssetCard(asset, index) {
        const countdown = calculateCountdown(asset.bidStartDate);
        const containerId = `asset-countdown-${asset.id || index}`;

        // Determine tags based on asset data
        const tags = [];
        if (asset.location) tags.push({ text: 'محلي', class: 'tag-green' });
        if (asset.bidStartDate) {
            try {
                // Try to parse the date to check if it's in the future
                const dateStr = asset.bidStartDate.replace('—', '-').replace('/', '-');
                const timeMatch = dateStr.match(/(\d{1,2}):(\d{2})\s*(صباحً|مساءً)/);
                const dateMatch = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);

                if (dateMatch && timeMatch) {
                    const year = parseInt(dateMatch[1]);
                    const month = parseInt(dateMatch[2]) - 1;
                    const day = parseInt(dateMatch[3]);
                    let hours = parseInt(timeMatch[1]);
                    const period = timeMatch[3];

                    if (period === 'مساءً' && hours !== 12) hours += 12;
                    else if (period === 'صباحً' && hours === 12) hours = 0;

                    const startDate = new Date(year, month, day, hours);
                    const now = new Date();
                    if (startDate > now) {
                        tags.push({ text: 'قادم', class: 'tag-green' });
                    }
                }
            } catch (e) {
                // If parsing fails, assume it's upcoming
                tags.push({ text: 'قادم', class: 'tag-green' });
            }
        }
        tags.push({ text: 'الكتروني - انفاذ', class: 'tag-blue' });

        // Format title - split into two lines if it contains property number
        // Expected format: "أرض زراعية في العمارية/ رقم الصك 815703003212"
        let titleLine1 = asset.title || 'عقار';
        let titleLine2 = '';

        // Check if title contains property number pattern
        if (titleLine1.includes('رقم') || titleLine1.includes('الصك')) {
            // Try to split at "/" or extract property number
            const parts = titleLine1.split(/\s*\/\s*رقم\s*/);
            if (parts.length > 1) {
                titleLine1 = parts[0].trim();
                titleLine2 = `الصك ${parts[1].trim()}`;
            } else {
                // Try to extract property number from anywhere in the title
                const propertyNumberMatch = titleLine1.match(/رقم\s*الصك\s*(\d+)/);
                if (propertyNumberMatch) {
                    titleLine2 = `الصك ${propertyNumberMatch[1]}`;
                    titleLine1 = titleLine1.replace(/\s*\/?\s*رقم\s*الصك\s*\d+.*$/, '').trim();
                }
            }
        }

        // If no property number found, use title as-is on one line
        if (!titleLine2) {
            titleLine2 = '';
        }

        return `
            <div class="auction-property-main-page-detail-asset-card">
                <div class="auction-property-main-page-detail-asset-card-header">
                    <i data-lucide="more-vertical" class="asset-menu-icon"></i>
                    <div class="asset-title-wrapper">
                        <h3 class="asset-title">${titleLine1}${titleLine2 ? '<br>' + titleLine2 : ''}</h3>
                        <p class="asset-subtitle">${asset.location ? `في ${asset.location}` : ''}</p>
                    </div>
                    <div class="asset-thumbnail">
                        <img src="${asset.image || asset.propertyImages?.[0] || ''}" alt="${asset.title || 'عقار'}" onerror="this.style.display='none'">
                    </div>
                </div>
                

                <button class="auction-property-main-page-detail-category-tab">عقارات</button>
                <button class="auction-property-main-page-detail-category-tab" style="background: #eaf3ff; color: #2c5aa0;">إلكتروني - انفاذ</button>
                <button class="auction-property-main-page-detail-category-tab">جاري الآن</button>
                

                <div class="asset-metadata">
                    <div class="metadata-item">
                        <i data-lucide="map-pin" class="metadata-icon"></i>
                        <span>${asset.location || 'غير محدد'}</span>
                    </div>
                    <span class="metadata-divider">•</span>
                    <div class="metadata-item">
                        <span>10,041.25 م²</span>
                    </div>
                    <span class="metadata-divider">•</span>
                    <div class="metadata-item">
                        <span>زراعي / أرض</span>
                    </div>
                </div>
                
                <div class="auction-property-main-page-detail-asset-pricing-box">
                    <div class="auction-property-main-page-detail-pricing-row">
                        <span class="auction-property-main-page-detail-pricing-label">قيمة التزايد</span>
                        <span class="pricing-value">
                            ${asset.bidAmount || '0'}
                            <span class="currency-symbol">⃁</span>
                        </span>

                    </div>
                    <div class="auction-property-main-page-detail-pricing-row">
                        <span class="auction-property-main-page-detail-pricing-label">السعر الافتتاحي</span>
                        <span class="pricing-value">
                            ${asset.startingPrice || '0'}
                            <span class="currency-symbol">⃁</span>
                        </span>
                    </div>
                </div>
                
                <div class="asset-countdown">
                    <div class="countdown-label">يبدأ في</div>
                    <div id="${containerId}"></div>
                </div>
                
                <div class="property-cta-container-home-page">
                    <div class="property-view-count-home-page">
                        <i data-lucide="eye" class="property-view-icon-home-page"></i>
                        <span class="property-view-number-home-page">${asset.viewCount ? asset.viewCount : '0'}</span>
                    </div>
                    <div class="auction-property-count-home-page">
                        <span class="property-view-number-home-page">عدد المزايدين</span>
                        <span class="property-view-number-home-page">${asset.numberOfAssets ? asset.numberOfAssets : '1'}</span>
                    </div>
                    <button class="property-cta-btn-home-page">
                        المشاركة في المزاد
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render the property detail page
     */
    function renderPropertyDetail(auction, badgeStatus) {
        if (!auction) {
            console.error('No auction data provided');
            return;
        }

        currentAuctionData = auction;

        const container = document.querySelector('.auction-property-main-page-detail-container');
        if (!container) {
            console.error('Property detail container not found');
            return;
        }

        // Parse bid start date
        const startDate = formatDate(auction.bidStartDate);
        const assets = auction.assets || [];
        const assetCount = assets.length;

        // Determine status label and class for category tab based on badge status
        let categoryStatusLabel = 'قادم قريباً';
        let categoryStatusClass = 'status-upcoming';
        const statusClassName = badgeStatus && badgeStatus.className ? badgeStatus.className : '';

        if (statusClassName.includes('live')) {
            categoryStatusLabel = 'جاري الآن';
            categoryStatusClass = 'property-detail-status-live';
        } else if (statusClassName.includes('upcoming')) {
            categoryStatusLabel = 'قادم قريباً';
            categoryStatusClass = 'property-detail-status-upcoming';
        }

        // Get company logo for category icon
        const categoryIcon = auction.compLogo ? `<img src="${auction.compLogo}" alt="${auction.compName || 'شركة'}" class="category-icon-image">` : '';

        const html = `
            <!-- Category Section -->
            <div class="auction-property-main-page-detail-category-header">
                <div class="auction-property-main-page-detail-category-header-right">
                    <div class="category-icon-placeholder">${categoryIcon}</div>
                    <h3 class="category-title">${auction.compName}</h3>
                </div>
                <i data-lucide="chevron-left" class="info-icon" style="cursor: pointer;" onclick="window.switchToSection('company-details-section')"></i>
            </div>


            <button class="auction-property-main-page-detail-category-tab">عقارات</button>
            <button class="auction-property-main-page-detail-category-tab" style="background: #eaf3ff; color: #2c5aa0;">إلكتروني - انفاذ</button>
            <button class="auction-property-main-page-detail-category-tab ${categoryStatusClass}">${categoryStatusLabel}</button>


            <!-- Auction Main Card -->
            <div class="auction-property-main-page-detail-top-image">
            <img src="${auction.image}" alt="${auction.title || 'مزادنا للعقارات السعودية'}">
            </div>

            <div>
                <h3 class="property-detail-auction-title">${auction.title}</h3>
            </div>

            <!-- Info Section -->
            <div class="property-detail-info-card">
                <div class="info-item">
                    <i data-lucide="calendar" class="info-icon"></i>
                    <span class="info-label">تاريخ البدء: ${startDate}</span>
                </div>
                <div class="info-item">
                    <i data-lucide="package" class="info-icon"></i>
                    <span class="info-label">عدد المنتجات: ${assetCount}</span>
                </div>
                <div class="info-item">
                    <i data-lucide="map-pin" class="info-icon"></i>
                    <span class="info-label">المدينة: ${auction.location || 'غير محدد'}</span>
                </div>
            </div>
            

            <!-- Buttons -->
            <div class="auction-property-main-page-detail-buttons">
                <button class="auction-property-main-page-detail-btn-primary">بروشور المزاد</button>
                <button class="auction-property-main-page-detail-btn-secondary">الشروط والأحكام</button>
            </div>

            <!-- Assets Section -->
            ${assets.map((asset, index) => renderAssetCard(asset, index)).join('')}
        `;

        // Batch DOM write operation
        container.innerHTML = html;

        // Defer heavy operations until after initial render for better performance
        // Use requestIdleCallback if available, otherwise use setTimeout
        const deferHeavyOperations = (callback) => {
            if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(callback, { timeout: 500 });
            } else {
                setTimeout(callback, 0);
            }
        };

        // Initialize countdown timers (deferred for better initial animation performance)
        deferHeavyOperations(() => {
            assets.forEach((asset, index) => {
                const containerId = `asset-countdown-${asset.id || index}`;
                const countdown = calculateCountdown(asset.bidStartDate);
                renderCountdown(countdown, containerId);

                // Update countdown every second
                const intervalId = setInterval(() => {
                    updateCountdown(asset, containerId);
                }, 1000);

                // Store interval ID for cleanup
                asset._countdownInterval = intervalId;
            });
        });

        // Initialize Lucide icons (deferred for better initial animation performance)
        if (typeof lucide !== 'undefined') {
            deferHeavyOperations(() => {
                lucide.createIcons();
            });
        }
    }

    /**
     * Clean up countdown intervals
     */
    function cleanupCountdowns() {
        if (currentAuctionData && currentAuctionData.assets) {
            currentAuctionData.assets.forEach(asset => {
                if (asset._countdownInterval) {
                    clearInterval(asset._countdownInterval);
                    delete asset._countdownInterval;
                }
            });
        }
    }

    /**
     * Open property detail page
     */
    window.openPropertyDetail = async function (auctionId, badgeStatus) {
        try {
            // Fetch auction data from JSON
            const response = await fetch('json-data/auction-property.json');
            if (!response.ok) {
                throw new Error('Failed to fetch auction data');
            }

            const auctions = await response.json();
            const auction = auctions.find(a => a.id === parseInt(auctionId));

            if (!auction) {
                console.error('Auction not found:', auctionId);
                alert('المزاد غير موجود');
                return;
            }

            // Render the detail page (optimized: render before navigation for smoother transition)
            renderPropertyDetail(auction, badgeStatus);

            // Show header
            const header = document.getElementById('auction-property-main-page-detail-header');
            if (header) {
                header.style.display = 'flex';
            }

            // Navigate to property detail section
            if (typeof window.switchToSection === 'function') {
                window.switchToSection('property-detail-section');
            } else {
                console.error('switchToSection function not available');
            }

            // Scrolling is enabled in section-navigation.js when property-detail-section opens

        } catch (error) {
            console.error('Error opening property detail:', error);
            alert('حدث خطأ أثناء تحميل تفاصيل المزاد');
        }
    };

    /**
     * Initialize back button
     */
    function initBackButton() {
        const backBtn = document.getElementById('property-detail-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function () {
                // Clean up countdown intervals
                cleanupCountdowns();

                // Hide header
                const header = document.getElementById('auction-property-main-page-detail-header');
                if (header) {
                    header.style.display = 'none';
                }

                // Enable website scrolling when going back
                if (typeof window.controlWebsiteScroll === 'function') {
                    window.controlWebsiteScroll('enable');
                }

                // Navigate back to previous section (use stored previous section, or home-section by default)
                if (typeof window.switchToSection === 'function') {
                    // Get the section we came from (could be auction-section, home-section, etc.)
                    const previousSection = (typeof window.getPreviousSectionBeforePropertyDetail === 'function')
                        ? window.getPreviousSectionBeforePropertyDetail()
                        : 'home-section';
                    window.switchToSection(previousSection);
                }
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBackButton);
    } else {
        initBackButton();
    }

})();
