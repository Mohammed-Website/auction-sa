// My Actions Section - Tab Switching Logic
(function () {
    'use strict';

    // Create and append filter buttons to finished content
    function createFilterButtons() {
        const finishedContent = document.getElementById('finished-content');
        if (!finishedContent || document.querySelector('.finished-filters')) return;

        // Create filter buttons container
        const filterContainer = document.createElement('div');
        filterContainer.className = 'finished-filters';
        filterContainer.style.display = 'flex';
        filterContainer.style.justifyContent = 'flex-start';
        filterContainer.style.gap = '8px';
        filterContainer.style.marginBottom = '16px';
        filterContainer.style.width = '100%';

        // Create buttons
        const buttons = [
            { id: 'won-auctions', text: 'الرابحة' },
            { id: 'lost-auctions', text: 'الخاسرة' }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'my-actions-tab';
            button.id = btn.id;
            button.textContent = btn.text;
            button.style.margin = '0';
            button.style.padding = '8px 16px';
            filterContainer.appendChild(button);
        });

        // Insert filter buttons at the beginning of finished content
        if (finishedContent.firstChild) {
            finishedContent.insertBefore(filterContainer, finishedContent.firstChild);
        } else {
            finishedContent.appendChild(filterContainer);
        }

        // Add click handlers for filter buttons
        const filterButtons = filterContainer.querySelectorAll('.my-actions-tab');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Check if the clicked button is already active
                const isActive = this.classList.contains('active');
                
                // Remove active class from all filter buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                
                // Toggle active state only if it wasn't active before
                if (!isActive) {
                    this.classList.add('active');
                    console.log(`Filtering by: ${this.textContent}`);
                } else {
                    console.log('Clearing filter');
                }
            });
        });
    }

    // Initialize tab switching
    function initMyActionsTabs() {
        const tabs = document.querySelectorAll('.my-actions-tab:not(.finished-filters .my-actions-tab)');
        const tabContents = document.querySelectorAll('.my-actions-tab-content');

        // Add click event listeners to tabs
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const targetTab = this.getAttribute('data-tab');

                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));

                // Add active class to clicked tab
                this.classList.add('active');

                // Hide all tab contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });

                // Show the corresponding content
                const targetContent = document.getElementById(`${targetTab}-content`);
                if (targetContent) {
                    targetContent.classList.add('active');
                    
                    // If it's the finished tab, ensure filter buttons are created
                    if (targetTab === 'finished') {
                        // Use setTimeout to ensure the content is visible before creating buttons
                        setTimeout(createFilterButtons, 10);
                    }
                }
            });
        });
    }

    // Initialize when DOM is ready
    function init() {
        const myActionsSection = document.getElementById('my-actions-section');
        if (!myActionsSection) {
            return;
        }

        // Initialize tabs
        initMyActionsTabs();

        // Use MutationObserver to re-initialize when section becomes active
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = myActionsSection.classList.contains('active');
                    if (isActive) {
                        // Re-initialize tabs when section becomes active
                        setTimeout(() => {
                            initMyActionsTabs();
                        }, 100);
                    }
                }
            });
        });

        observer.observe(myActionsSection, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Also initialize if already active
        if (myActionsSection.classList.contains('active')) {
            initMyActionsTabs();
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for external use
    window.MyActionsTabs = {
        init: initMyActionsTabs
    };
})();
