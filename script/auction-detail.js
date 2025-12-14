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
     * Format number with Arabic-Indic digits
     */
    function formatNumber(num) {
        if (num === undefined || num === null) return '٠';
        const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return num.toString().replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
    }

    /**
     * Render countdown timer HTML
     */
    function renderCountdown(countdown, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = `
            <div class="countdown-timer">
                <div class="countdown-unit">
                    <div class="countdown-box" data-unit="days">${formatNumber(countdown.days)}</div>
                    <div class="countdown-label-small">يوم</div>
                </div>
                <span class="countdown-separator">:</span>
                <div class="countdown-unit">
                    <div class="countdown-box" data-unit="hours">${formatNumber(countdown.hours)}</div>
                    <div class="countdown-label-small">ساعة</div>
                </div>
                <span class="countdown-separator">:</span>
                <div class="countdown-unit">
                    <div class="countdown-box" data-unit="minutes">${formatNumber(countdown.minutes)}</div>
                    <div class="countdown-label-small">دقيقة</div>
                </div>
                <span class="countdown-separator">:</span>
                <div class="countdown-unit">
                    <div class="countdown-box" data-unit="seconds">${formatNumber(countdown.seconds)}</div>
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
                    box.textContent = formatNumber(newValue);
                    box.classList.remove('flip');
                }, 300);
            } else {
                box.textContent = formatNumber(newValue);
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
            <div class="asset-card">
                <div class="asset-card-header">
                    <i data-lucide="more-vertical" class="asset-menu-icon"></i>
                    <div class="asset-title-wrapper">
                        <h3 class="asset-title">${titleLine1}${titleLine2 ? '<br>' + titleLine2 : ''}</h3>
                        <p class="asset-subtitle">${asset.location ? `في ${asset.location}` : ''}</p>
                    </div>
                    <div class="asset-thumbnail">
                        <img src="${asset.image || asset.propertyImages?.[0] || ''}" alt="${asset.title || 'عقار'}" onerror="this.style.display='none'">
                    </div>
                </div>
                
                <div class="asset-tags">
                    ${tags.map(tag => `<span class="asset-tag ${tag.class}">${tag.text}</span>`).join('')}
                </div>
                
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
                
                <div class="asset-pricing-box">
                    <div class="pricing-row">
                        <span class="pricing-label">قيمة التزايد</span>
                        <span class="pricing-value">${formatNumber(asset.bidAmount || '0')} ر.س</span>
                    </div>
                    <div class="pricing-row">
                        <span class="pricing-label">السعر الافتتاحي</span>
                        <span class="pricing-value">${formatNumber(asset.startingPrice || '0')} ر.س</span>
                    </div>
                </div>
                
                <div class="asset-countdown">
                    <div class="countdown-label">يبدأ في</div>
                    <div id="${containerId}"></div>
                </div>
                
                <button class="btn-participate">المشاركة في المزاد</button>
                
                <div class="asset-footer">
                    <div class="footer-item">
                        <i data-lucide="eye" class="footer-icon"></i>
                        <span>${formatNumber(asset.viewCount || 0)}</span>
                    </div>
                    <div class="footer-item">
                        <i data-lucide="bookmark" class="footer-icon"></i>
                        <span>${formatNumber(0)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render the property detail page
     */
    function renderPropertyDetail(auction) {
        if (!auction) {
            console.error('No auction data provided');
            return;
        }

        currentAuctionData = auction;

        const container = document.querySelector('#property-detail-section .property-detail-container');
        if (!container) {
            console.error('Property detail container not found');
            return;
        }

        // Parse bid start date
        const startDate = formatDate(auction.bidStartDate);
        const assets = auction.assets || [];
        const assetCount = assets.length;

        const html = `
            <!-- Category Section -->
            <div class="property-detail-category-section">
                <div class="category-header">
                    <h3 class="category-title">مزاد التجارية</h3>
                    <div class="category-icon-placeholder"></div>
                </div>
                <div class="category-tabs">
                    <button class="category-tab active">عقارات</button>
                    <button class="category-tab">افناذ - إلكتروني</button>
                    <button class="category-tab">قادم</button>
                </div>
            </div>

            <!-- Auction Main Card -->
            <div class="auction-main-card">
                <div class="auction-main-logo">
                    <span class="logo-placeholder">إنفاذ</span>
                </div>
                <h2 class="auction-main-title">${auction.title || 'مزاد'}</h2>
                <p class="auction-main-subtitle">المعمارية - ${auction.location || 'الدرعية'}</p>
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
            <div class="property-detail-buttons">
                <button class="btn-primary">بروشور المزاد</button>
                <button class="btn-secondary">الشروط والأحكام</button>
            </div>

            <!-- Assets Section -->
            ${assets.map((asset, index) => renderAssetCard(asset, index)).join('')}
        `;

        container.innerHTML = html;

        // Initialize countdown timers
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

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
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
    window.openPropertyDetail = async function (auctionId) {
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

            // Render the detail page
            renderPropertyDetail(auction);

            // Show header
            const header = document.getElementById('property-detail-header');
            if (header) {
                header.style.display = 'flex';
            }

            // Navigate to property detail section
            if (typeof window.switchToSection === 'function') {
                window.switchToSection('property-detail-section');
            } else {
                console.error('switchToSection function not available');
            }

            // Scroll to top
            if (typeof window.scrollToTop === 'function') {
                window.scrollToTop();
            }

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
                const header = document.getElementById('property-detail-header');
                if (header) {
                    header.style.display = 'none';
                }

                // Navigate back to previous section (home-section by default)
                if (typeof window.switchToSection === 'function') {
                    window.switchToSection('home-section');
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
