// Property Detail Page Management
// This file handles the property detail page that shows when clicking on an auction card
(function () {
    'use strict';

    let currentAuctionData = null;
    let currentAssetIndex = 0;
    let countdownInterval = null;

    /**
     * Parse date string to Date object
     * Handles various date formats from JSON
     */
    function parseDate(dateString) {
        if (!dateString) return null;

        // Handle formats like "2025/12/20 — 08:00 مساءً" or "2025-12-20 6:00 مساءً"
        let cleaned = dateString.replace(/—/g, '-').trim();

        // Extract date and time parts
        const dateMatch = cleaned.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
        const timeMatch = cleaned.match(/(\d{1,2}):?(\d{2})?\s*(صباحً|مساءً|AM|PM)?/i);

        if (!dateMatch) return null;

        const year = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1; // JS months are 0-indexed
        const day = parseInt(dateMatch[3]);

        let hours = 0;
        let minutes = 0;

        if (timeMatch) {
            hours = parseInt(timeMatch[1]);
            minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;

            // Handle AM/PM
            const period = timeMatch[3];
            if (period && (period.includes('مساءً') || period.toUpperCase().includes('PM'))) {
                if (hours !== 12) hours += 12;
            } else if (period && (period.includes('صباحً') || period.toUpperCase().includes('AM'))) {
                if (hours === 12) hours = 0;
            }
        }

        return new Date(year, month, day, hours, minutes);
    }

    /**
     * Format date for display
     */
    function formatDate(date) {
        if (!date) return '';
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'مساءً' : 'صباحً';
        const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        return `${day}/${month}/${year} - ${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    /**
     * Calculate countdown from now to target date
     */
    function calculateCountdown(targetDate) {
        if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
    }

    /**
     * Update countdown display with flip animation
     */
    function updateCountdown(asset) {
        if (!asset || !asset.bidStartDate) return;

        const targetDate = parseDate(asset.bidStartDate);
        if (!targetDate) return;

        const countdown = calculateCountdown(targetDate);

        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');
        const secondsEl = document.getElementById('countdown-seconds');

        if (daysEl) {
            const oldValue = daysEl.textContent;
            const newValue = countdown.days.toString().padStart(2, '0');
            if (oldValue !== newValue) {
                daysEl.classList.add('flip');
                setTimeout(() => {
                    daysEl.textContent = newValue;
                    daysEl.classList.remove('flip');
                }, 300);
            } else {
                daysEl.textContent = newValue;
            }
        }

        if (hoursEl) {
            const oldValue = hoursEl.textContent;
            const newValue = countdown.hours.toString().padStart(2, '0');
            if (oldValue !== newValue) {
                hoursEl.classList.add('flip');
                setTimeout(() => {
                    hoursEl.textContent = newValue;
                    hoursEl.classList.remove('flip');
                }, 300);
            } else {
                hoursEl.textContent = newValue;
            }
        }

        if (minutesEl) {
            const oldValue = minutesEl.textContent;
            const newValue = countdown.minutes.toString().padStart(2, '0');
            if (oldValue !== newValue) {
                minutesEl.classList.add('flip');
                setTimeout(() => {
                    minutesEl.textContent = newValue;
                    minutesEl.classList.remove('flip');
                }, 300);
            } else {
                minutesEl.textContent = newValue;
            }
        }

        if (secondsEl) {
            const oldValue = secondsEl.textContent;
            const newValue = countdown.seconds.toString().padStart(2, '0');
            secondsEl.classList.add('flip');
            setTimeout(() => {
                secondsEl.textContent = newValue;
                secondsEl.classList.remove('flip');
            }, 300);
        }
    }

    /**
     * Render property detail page
     */
    function renderPropertyDetail(auctionId, assetId) {
        // Fetch auction data
        fetch('json-data/auction-property.json')
            .then(response => response.json())
            .then(auctions => {
                const auction = auctions.find(a => a.id === parseInt(auctionId));
                if (!auction) {
                    console.error('Auction not found');
                    return;
                }

                currentAuctionData = auction;

                // Find asset if assetId is provided
                let asset = null;
                if (assetId && auction.assets) {
                    asset = auction.assets.find(a => a.id === parseInt(assetId));
                }

                // Use first asset if no specific asset selected
                if (!asset && auction.assets && auction.assets.length > 0) {
                    asset = auction.assets[currentAssetIndex];
                }

                const detailView = document.getElementById('property-detail-view');
                if (!detailView) return;

                detailView.innerHTML = createPropertyDetailHTML(auction, asset);

                // Initialize Lucide icons
                if (typeof lucide !== 'undefined') {
                    setTimeout(() => {
                        lucide.createIcons();
                    }, 100);
                }

                // Start countdown timer
                if (asset) {
                    startCountdown(asset);
                }

                // Attach event listeners
                attachEventListeners(auction);
            })
            .catch(error => {
                console.error('Error loading auction data:', error);
            });
    }

    /**
     * Create HTML for property detail page
     */
    function createPropertyDetailHTML(auction, asset) {
        const startDate = parseDate(auction.bidStartDate);
        const formattedStartDate = formatDate(startDate);

        // Determine auction type (default to "مزاد التجارية")
        const auctionType = auction.title || 'مزاد التجارية';

        return `
            <div class="property-detail-container">
                <!-- Header -->
                <div class="account-tabs-header" id="property-detail-header">
                    <button class="back-btn" id="property-detail-back-btn" aria-label="رجوع">
                        <i data-lucide="arrow-right" class="back-icon"></i>
                    </button>
                    <h2 class="account-tabs-title">تفاصيل المزاد</h2>
                </div>

                <!-- Category Section -->
                <div class="property-detail-category-section">
                    <div class="category-header">
                        <h3 class="category-title">${auctionType}</h3>
                        <div class="category-icon-placeholder"></div>
                    </div>
                    <div class="category-tabs">
                        <button class="category-tab active" data-tab="properties">عقارات</button>
                        <button class="category-tab" data-tab="electronic">إلكتروني - إنفاذ</button>
                        <button class="category-tab" data-tab="upcoming">قادم</button>
                    </div>
                </div>

                <!-- Auction Main Card -->
                <div class="auction-main-card">
                    <div class="auction-main-logo">
                        <div class="logo-placeholder">إنفاذ</div>
                    </div>
                    <h1 class="auction-main-title">${auction.title || 'مزاد ريوف'}</h1>
                    <p class="auction-main-subtitle">المعمارية - الدرعية</p>
                </div>

                <!-- Info Section -->
                <div class="property-detail-info-card">
                    <div class="info-item">
                        <i data-lucide="calendar" class="info-icon"></i>
                        <span class="info-label">تاريخ البدء: ${formattedStartDate}</span>
                    </div>
                    <div class="info-item">
                        <i data-lucide="box" class="info-icon"></i>
                        <span class="info-label">عدد المنتجات: ${auction.assets ? auction.assets.length : 0}</span>
                    </div>
                    <div class="info-item">
                        <i data-lucide="map-pin" class="info-icon"></i>
                        <span class="info-label">المدينة: ${auction.location || 'غير محدد'}</span>
                    </div>
                </div>

                <!-- Buttons -->
                <div class="property-detail-buttons">
                    <button class="btn-primary btn-brochure">بروشور المزاد</button>
                    <button class="btn-secondary btn-terms">الشروط والأحكام</button>
                </div>

                <!-- Assets Section -->
                ${asset ? createAssetCardHTML(asset) : ''}
            </div>
        `;
    }

    /**
     * Create HTML for individual asset card
     */
    function createAssetCardHTML(asset) {
        // Parse dates for countdown
        const startDate = parseDate(asset.bidStartDate);
        const isUpcoming = startDate && startDate > new Date();

        // Extract property number from title or use default
        // Try to extract from title, or use asset ID, or default
        let propertyNumber = '815703003212';
        if (asset.title) {
            const propertyMatch = asset.title.match(/رقم\s*(\d+)/);
            if (propertyMatch) {
                propertyNumber = propertyMatch[1];
            } else if (asset.id) {
                propertyNumber = asset.id.toString().padStart(12, '0');
            }
        } else if (asset.id) {
            propertyNumber = asset.id.toString().padStart(12, '0');
        }

        // Extract area and type from title or use defaults
        const area = asset.area || '10,041.25 م²';
        const propertyType = asset.type || 'زراعي / أرض';
        const location = asset.location || 'الدرعية';

        return `
            <div class="asset-card">
                <div class="asset-card-header">
                    <i data-lucide="more-vertical" class="asset-menu-icon"></i>
                    <div class="asset-title-wrapper">
                        <h3 class="asset-title">أرض زراعية في العمارية/ رقم</h3>
                        <p class="asset-subtitle">الصك ${propertyNumber}</p>
                    </div>
                    <div class="asset-thumbnail">
                        <img src="${asset.image || ''}" alt="Property" onerror="this.style.display='none'">
                    </div>
                </div>

                <div class="asset-tags">
                    <span class="asset-tag tag-green">محلي</span>
                    <span class="asset-tag tag-green">قادم</span>
                    <span class="asset-tag tag-blue">الكتروني - انفاذ</span>
                </div>

                <div class="asset-metadata">
                    <span class="metadata-item">
                        <i data-lucide="map-pin" class="metadata-icon"></i>
                        ${location}
                    </span>
                    <span class="metadata-divider">•</span>
                    <span class="metadata-item">${area}</span>
                    <span class="metadata-divider">•</span>
                    <span class="metadata-item">${propertyType}</span>
                </div>

                <div class="asset-pricing-box">
                    <div class="pricing-row">
                        <span class="pricing-label">قيمة التزايد</span>
                        <span class="pricing-value">${asset.bidAmount || '٠'}</span>
                    </div>
                    <div class="pricing-row">
                        <span class="pricing-label">السعر الافتتاحي</span>
                        <span class="pricing-value">${asset.startingPrice || '٠'}</span>
                    </div>
                </div>

                ${isUpcoming ? `
                    <div class="asset-countdown">
                        <div class="countdown-label">يبدأ في</div>
                        <div class="countdown-timer">
                            <div class="countdown-unit">
                                <div class="countdown-box" id="countdown-days">00</div>
                                <span class="countdown-label-small">يوم</span>
                            </div>
                            <div class="countdown-separator">:</div>
                            <div class="countdown-unit">
                                <div class="countdown-box" id="countdown-hours">00</div>
                                <span class="countdown-label-small">ساعة</span>
                            </div>
                            <div class="countdown-separator">:</div>
                            <div class="countdown-unit">
                                <div class="countdown-box" id="countdown-minutes">00</div>
                                <span class="countdown-label-small">دقيقة</span>
                            </div>
                            <div class="countdown-separator">:</div>
                            <div class="countdown-unit">
                                <div class="countdown-box" id="countdown-seconds">00</div>
                                <span class="countdown-label-small">ثانية</span>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <button class="btn-participate">المشاركة في المزاد</button>

                <div class="asset-footer">
                    <div class="footer-item">
                        <i data-lucide="eye" class="footer-icon"></i>
                        <span>${currentAuctionData?.viewCount || 0}</span>
                    </div>
                    <div class="footer-item">
                        <i data-lucide="bookmark" class="footer-icon"></i>
                        <span>0</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Start countdown timer
     */
    function startCountdown(asset) {
        // Clear existing interval
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        // Update immediately
        updateCountdown(asset);

        // Update every second
        countdownInterval = setInterval(() => {
            updateCountdown(asset);
        }, 1000);
    }

    /**
     * Attach event listeners
     */
    function attachEventListeners(auction) {
        // Back button
        const backBtn = document.getElementById('property-detail-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Clear countdown
                if (countdownInterval) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                }

                // Enable scrolling
                if (typeof window.controlWebsiteScroll === 'function') {
                    window.controlWebsiteScroll('enable');
                }

                // Navigate back
                if (typeof window.switchToSection === 'function') {
                    window.switchToSection('home-section');
                }
            });
        }

        // Category tabs
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                categoryTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    /**
     * Open property detail page
     * Called when auction card is clicked
     */
    function openPropertyDetail(auctionId, assetId = null) {
        console.log('Opening property detail for auction:', auctionId, 'asset:', assetId);

        // Disable scrolling
        if (typeof window.controlWebsiteScroll === 'function') {
            window.controlWebsiteScroll('disable');
        }

        // Switch to property detail section first
        if (typeof window.switchToSection === 'function') {
            window.switchToSection('property-detail-section');

            // Wait for section to be ready before rendering
            setTimeout(() => {
                renderPropertyDetail(auctionId, assetId);
            }, 100);
        } else {
            console.error('switchToSection function not available');
            // Fallback: try to show section directly
            const section = document.getElementById('property-detail-section');
            if (section) {
                section.style.display = 'block';
                section.style.visibility = 'visible';
                section.style.opacity = '1';
                section.classList.add('active');
                setTimeout(() => {
                    renderPropertyDetail(auctionId, assetId);
                }, 100);
            }
        }
    }

    // Export function for use in other files
    window.openPropertyDetail = openPropertyDetail;

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            // Check if we should show property detail on page load (from URL hash)
            const hash = window.location.hash;
            const match = hash.match(/#\/property\/(\d+)(?:\/(\d+))?/);
            if (match) {
                openPropertyDetail(match[1], match[2]);
            }
        });
    } else {
        const hash = window.location.hash;
        const match = hash.match(/#\/property\/(\d+)(?:\/(\d+))?/);
        if (match) {
            openPropertyDetail(match[1], match[2]);
        }
    }
})();

